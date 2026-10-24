/**
 * Outboard, the marketplace (§139, ADR-0012, MARKETPLACE.md step 5).
 *
 * Everything in it is free. A maker uploads a signed `.djpack`; it is checked
 * as djmanzo checks one before installing it (`djpack.ts`) and waits for the
 * crew, who list it or say why not. A pack's name stays with the key it was
 * first uploaded with: a new version must be signed by the same key, as an
 * installed pack's update must be in djmanzo. What is listed is published as
 * an index in djmanzo's own format (`dj_app::packindex`), so djmanzo can
 * install from it today. Ratings are one an account; reports go to the crew.
 *
 * Files live in R2 (`MEDIA`). Until the owner enables R2, uploads stay closed
 * and everything else works (the owner's choice, 18 October).
 */

import { LISTED_KINDS, MOST_LINKS, bayesian, donationLink, type ListedKind } from "../shared/outboard";
import { PackError, checkArchive, sha256, type Checked } from "./djpack";
import { placesOf } from "./keyset";
import type { AppEnv } from "./env";
import { brake, fail, text } from "./http";
import { notify } from "./moderation";
import type { User } from "./store";

/** The largest upload: the format's own limit, packed. */
export const MOST_UPLOAD = 20 * 1024 * 1024;

export interface ItemRow {
  id: string;
  kind: ListedKind;
  name: string;
  fingerprint: string;
  owner: string;
  author: string;
  licence: string;
  description: string;
  status: "pending" | "listed" | "removed";
  reason: string | null;
  latest: string | null;
  created: number;
  updated: number;
}

function db(env: AppEnv): D1Database {
  if (!env.DB) fail(503, "Outboard is not set up on this site yet.");
  return env.DB!;
}

/** A pack's id, as djmanzo names its folder (`packs::id`): its name made plain, then its key. */
export function packId(name: string, fingerprint: string): string {
  let slug = "";
  for (const c of [...name].flatMap((ch) => [...ch.toLowerCase()])) {
    if (/^[a-z0-9]$/.test(c)) slug += c;
    else if (slug !== "" && !slug.endsWith("-")) slug += "-";
  }
  slug = [...slug.replace(/-+$/, "")].slice(0, 40).join("");
  const print = fingerprint.replaceAll(" ", "").slice(0, 8);
  return `${slug || "pack"}-${print}`;
}

/** What a listing shows without opening the pack. */
export function previewOf(pack: Checked): Record<string, unknown> {
  const m = pack.manifest;
  if (m.kind === "theme" && m.theme) return { theme: m.theme.name, base: m.theme.base, dark: m.theme.dark, light: m.theme.light };
  if (m.kind === "skin") {
    const skin = m.skins[0];
    const tile = skin ? new TextDecoder().decode(pack.files.get(skin.tile)) : "";
    return { skins: m.skins.map((s) => s.name), tile, size: skin?.size, opacity: skin?.opacity };
  }
  if (m.kind === "keys" && m.keys) {
    const set = m.keys;
    return { set: set.name, about: set.about, purpose: set.purpose, edition: set.edition, keys: placesOf(set), support: m.support };
  }
  return { looks: m.looks.map((l) => l.name), presets: Object.keys(m.files).length };
}

export const blobKey = (id: string, version: string) => `packs/${id}/${encodeURIComponent(version)}.djpack`;

/** An upload: checked, then kept, waiting for the crew. */
export async function upload(env: AppEnv, user: User, bytes: Uint8Array, changelog: string) {
  const store = db(env);
  if (!env.MEDIA) fail(503, "Uploads open once R2 is enabled on this site.", { uploads: false });
  if (bytes.length === 0) fail(400, "Choose a .djpack to upload.");
  if (bytes.length > MOST_UPLOAD) fail(413, `A pack is at most ${MOST_UPLOAD / 1024 / 1024} MB.`);
  let pack: Checked;
  try {
    pack = await checkArchive(bytes);
  } catch (e) {
    if (e instanceof PackError) fail(400, `djmanzo would not install it: ${e.message}.`);
    throw e;
  }
  const m = pack.manifest;
  if (!LISTED_KINDS.some((k) => k.kind === m.kind)) fail(400, `Outboard does not list ${m.kind} packs yet.`);
  await brake(env.KV, `upload:${user.id}`, 5, 86400);

  const held = await store.prepare("SELECT * FROM items WHERE lower(name) = lower(?)").bind(m.name.trim()).first<ItemRow>();
  if (held && held.fingerprint !== pack.fingerprint) {
    fail(409, `"${held.name}" is already in Outboard under another key (${held.fingerprint}). A new version must be signed with the key the first was, or the pack needs a name of its own.`);
  }
  if (held && held.owner !== user.id) fail(409, `"${held.name}" belongs to another maker's account.`);
  if (held?.status === "removed") fail(403, `"${held.name}" was removed: ${held.reason}`);
  const id = held?.id ?? packId(m.name, pack.fingerprint);
  const version = m.version.trim();
  const exists = await store.prepare("SELECT 1 FROM versions WHERE item = ? AND version = ?").bind(id, version).first();
  if (exists) fail(409, `Version ${version} of "${m.name}" is already uploaded: give the new one its own version.`);

  const now = Date.now();
  const digest = await sha256(bytes);
  await env.MEDIA!.put(blobKey(id, version), bytes, { httpMetadata: { contentType: "application/zip" } });
  const statements = [
    store
      .prepare("INSERT INTO versions (item, version, sha256, size, manifest, preview, changelog, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, version, digest, bytes.length, JSON.stringify(m), JSON.stringify(previewOf(pack)), text(changelog, 1200), now),
  ];
  if (held) statements.push(store.prepare("UPDATE items SET updated = ? WHERE id = ?").bind(now, id));
  else
    statements.unshift(
      store
        .prepare("INSERT INTO items (id, kind, name, fingerprint, owner, author, licence, description, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, m.kind, m.name.trim(), pack.fingerprint, user.id, m.author.trim(), m.licence.trim(), m.description.trim(), now, now),
    );
  await store.batch(statements);
  return { id, version, status: "pending" as const, fingerprint: pack.fingerprint };
}

interface Listed extends ItemRow {
  preview: string;
  ratings: number;
  stars: number;
  downloads: number;
}

const LISTING = `
  SELECT items.*, v.preview AS preview,
    (SELECT COUNT(*) FROM ratings r WHERE r.item = items.id) AS ratings,
    (SELECT COALESCE(SUM(stars), 0) FROM ratings r WHERE r.item = items.id) AS stars,
    (SELECT COUNT(*) FROM downloads d WHERE d.item = items.id) AS downloads
  FROM items JOIN versions v ON v.item = items.id AND v.version = items.latest`;

function card(row: Listed) {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    author: row.author,
    owner: row.owner,
    licence: row.licence,
    description: row.description,
    version: row.latest,
    fingerprint: row.fingerprint,
    preview: JSON.parse(row.preview) as Record<string, unknown>,
    rating: { mean: row.ratings ? row.stars / row.ratings : null, score: bayesian(row.stars, row.ratings), count: row.ratings },
    downloads: row.downloads,
    updated: row.updated,
  };
}

/** What is listed, best first: by rating as `bayesian` reads it, then the newest. */
export async function listing(env: AppEnv, kind?: string | null, q?: string | null) {
  const store = db(env);
  const where = ["items.status = 'listed'"];
  const args: unknown[] = [];
  if (kind && LISTED_KINDS.some((k) => k.kind === kind)) {
    where.push("items.kind = ?");
    args.push(kind);
  }
  if (q?.trim()) {
    where.push("(items.name LIKE ? ESCAPE '\\' OR items.description LIKE ? ESCAPE '\\' OR items.author LIKE ? ESCAPE '\\')");
    const like = `%${q.trim().slice(0, 60).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    args.push(like, like, like);
  }
  const { results } = await store
    .prepare(`${LISTING} WHERE ${where.join(" AND ")} LIMIT 500`)
    .bind(...args)
    .all<Listed>();
  return results.map(card).sort((a, b) => b.rating.score - a.rating.score || b.updated - a.updated);
}

/** One item: its card, its versions, its ratings, and what this visitor did with it. */
export async function item(env: AppEnv, id: string, uid: string | null, admin = false) {
  const store = db(env);
  const row = await store.prepare(`${LISTING.replace("JOIN versions", "LEFT JOIN versions")} WHERE items.id = ?`).bind(id).first<Listed>();
  if (!row || (row.status !== "listed" && row.owner !== uid && !admin)) fail(404, "No such item.");
  const versions = await store
    .prepare("SELECT version, size, sha256, changelog, status, reason, created FROM versions WHERE item = ? ORDER BY created DESC")
    .bind(id)
    .all<{ version: string; status: string }>();
  const reviews = await store
    .prepare("SELECT ratings.uid, stars, review, ratings.created, EXISTS (SELECT 1 FROM downloads d WHERE d.item = ratings.item AND d.uid = ratings.uid) AS downloaded FROM ratings WHERE item = ? ORDER BY ratings.created DESC LIMIT 100")
    .bind(id)
    .all();
  const mine = uid ? await store.prepare("SELECT stars, review FROM ratings WHERE item = ? AND uid = ?").bind(id, uid).first() : null;
  const downloaded = uid ? !!(await store.prepare("SELECT 1 FROM downloads WHERE item = ? AND uid = ?").bind(id, uid).first()) : false;
  const maker = await store.prepare("SELECT name, about, links FROM profiles WHERE uid = ?").bind(row.owner).first<{ name: string; about: string; links: string }>();
  const visible = row.owner === uid || admin;
  return {
    ...card({ ...row, preview: row.preview ?? "{}" }),
    status: row.status,
    reason: visible ? row.reason : null,
    versions: versions.results.filter((v) => v.status === "listed" || visible),
    reviews: reviews.results,
    mine,
    downloaded,
    maker: maker ? { name: maker.name, about: maker.about, links: JSON.parse(maker.links) } : null,
  };
}

/** A listed version's file, counted as downloaded for a signed-in visitor. */
export async function download(env: AppEnv, id: string, version: string, uid: string | null): Promise<Response> {
  const store = db(env);
  const v = await store
    .prepare("SELECT versions.sha256 FROM versions JOIN items ON items.id = versions.item WHERE item = ? AND version = ? AND versions.status = 'listed' AND items.status = 'listed'")
    .bind(id, version)
    .first<{ sha256: string }>();
  if (!v) fail(404, "No such version.");
  if (!env.MEDIA) fail(503, "Downloads open once R2 is enabled on this site.");
  const file = await env.MEDIA!.get(blobKey(id, version));
  if (!file) fail(404, "That file is missing.");
  if (uid) await store.prepare("INSERT OR IGNORE INTO downloads (item, uid, at) VALUES (?, ?, ?)").bind(id, uid, Date.now()).run();
  return new Response(file!.body, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${id}-${version.replace(/[^A-Za-z0-9._-]/g, "_")}.djpack"`,
      "x-content-type-options": "nosniff",
      etag: `"${v!.sha256}"`,
    },
  });
}

/**
 * What is listed, as an index djmanzo reads (`dj_app::packindex`, format 1):
 * each pack's name, maker, licence, version, file and key fingerprint, and
 * its kind (a field format 1 readers pass over).
 */
export async function index(env: AppEnv, origin: string) {
  const store = db(env);
  const { results } = await store
    .prepare("SELECT id, kind, name, author, licence, description, latest, fingerprint FROM items WHERE status = 'listed' AND latest IS NOT NULL ORDER BY lower(name) LIMIT 500")
    .all<ItemRow>();
  return {
    format: 1,
    name: "Outboard",
    packs: results.map((r) => ({
      name: r.name,
      author: r.author,
      licence: r.licence,
      version: r.latest,
      description: r.description.slice(0, 600),
      url: `${origin}/api/outboard/items/${r.id}/v/${encodeURIComponent(r.latest!)}.djpack`,
      key: r.fingerprint,
      kind: r.kind,
    })),
  };
}

/** One rating an account, changed rather than added; never one's own work. */
export async function rate(env: AppEnv, user: User, id: string, stars: number, review: string) {
  const store = db(env);
  const row = await store.prepare("SELECT owner, status FROM items WHERE id = ?").bind(id).first<{ owner: string; status: string }>();
  if (!row || row.status !== "listed") fail(404, "No such item.");
  if (row!.owner === user.id) fail(403, "A maker does not rate their own work.");
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) fail(400, "A rating is one to five stars.");
  await brake(env.KV, `rate:${user.id}`, 30, 3600);
  await store
    .prepare("INSERT INTO ratings (item, uid, stars, review, created) VALUES (?, ?, ?, ?, ?) ON CONFLICT (item, uid) DO UPDATE SET stars = excluded.stars, review = excluded.review, created = excluded.created")
    .bind(id, user.id, stars, text(review, 1000), Date.now())
    .run();
  return item(env, id, user.id);
}

/** A maker's page: a line about them and their donation links, from the allow-list only. */
export async function setProfile(env: AppEnv, user: User, about: string, links: unknown) {
  const store = db(env);
  const asked = Array.isArray(links) ? links.slice(0, MOST_LINKS + 1) : [];
  if (asked.length > MOST_LINKS) fail(400, `At most ${MOST_LINKS} donation links.`);
  const clean = asked.map((l) => donationLink(String(l)) ?? fail(400, `${text(l, 80)} is not a page on an official donation platform (Ko-fi, Liberapay, GitHub Sponsors, Buy Me a Coffee, Open Collective, Patreon or PayPal.me).`));
  await store
    .prepare("INSERT INTO profiles (uid, name, about, links, updated) VALUES (?, ?, ?, ?, ?) ON CONFLICT (uid) DO UPDATE SET name = excluded.name, about = excluded.about, links = excluded.links, updated = excluded.updated")
    .bind(user.id, user.name, text(about, 400), JSON.stringify(clean), Date.now())
    .run();
  return maker(env, user.id);
}

/** A maker's page and what they have listed. */
export async function maker(env: AppEnv, uid: string) {
  const store = db(env);
  const p = await store.prepare("SELECT name, about, links FROM profiles WHERE uid = ?").bind(uid).first<{ name: string; about: string; links: string }>();
  const { results } = await store.prepare(`${LISTING} WHERE items.status = 'listed' AND items.owner = ?`).bind(uid).all<Listed>();
  return { uid, name: p?.name ?? results[0]?.author ?? null, about: p?.about ?? "", links: p ? JSON.parse(p.links) : [], items: results.map(card) };
}

/** What waits for the crew: versions not yet looked at, with what they say. */
export async function queue(env: AppEnv) {
  const store = db(env);
  const { results } = await store
    .prepare(
      "SELECT items.id, items.kind, items.name, items.owner, items.author, items.fingerprint, items.status AS item_status, versions.version, versions.size, versions.manifest, versions.preview, versions.changelog, versions.created FROM versions JOIN items ON items.id = versions.item WHERE versions.status = 'pending' ORDER BY versions.created",
    )
    .all<Record<string, unknown> & { manifest: string; preview: string }>();
  return results.map((r) => ({ ...r, manifest: JSON.parse(r.manifest), preview: JSON.parse(r.preview) }));
}

/** The crew's word on a version: listed, or refused with the reason, which its maker is told. */
export async function review(env: AppEnv, id: string, version: string, approve: boolean, reason: string) {
  const store = db(env);
  const row = await store
    .prepare("SELECT items.owner, items.name, versions.status FROM versions JOIN items ON items.id = versions.item WHERE item = ? AND version = ?")
    .bind(id, version)
    .first<{ owner: string; name: string; status: string }>();
  if (!row) fail(404, "No such version.");
  const now = Date.now();
  if (approve) {
    await store.batch([
      store.prepare("UPDATE versions SET status = 'listed', reason = NULL WHERE item = ? AND version = ?").bind(id, version),
      store.prepare("UPDATE items SET status = 'listed', latest = ?, reason = NULL, updated = ? WHERE id = ? AND status != 'removed'").bind(version, now, id),
    ]);
    return { id, version, status: "listed" };
  }
  const why = text(reason, 1000);
  if (why.length < 10) fail(400, "Say why, in a sentence the maker can act on: they are told it.");
  await store.prepare("UPDATE versions SET status = 'removed', reason = ? WHERE item = ? AND version = ?").bind(why, id, version).run();
  // An item with nothing listed is not shown; one with an earlier version keeps it.
  await store
    .prepare("UPDATE items SET updated = ? WHERE id = ? AND NOT EXISTS (SELECT 1 FROM versions WHERE item = ? AND status = 'listed')")
    .bind(now, id, id)
    .run();
  await notify(env, row!.owner, "item", id, `Version ${version} of ${row!.name} was not listed`, why);
  return { id, version, status: "removed" };
}

/** Take an item down, with the reason its maker is told (DSA Art. 17). */
export async function remove(env: AppEnv, id: string, reason: string) {
  const store = db(env);
  const row = await store.prepare("SELECT owner, name FROM items WHERE id = ?").bind(id).first<{ owner: string; name: string }>();
  if (!row) fail(404, "No such item.");
  const why = text(reason, 1000);
  if (why.length < 10) fail(400, "Say why, in a sentence the maker can act on: they are told it.");
  await store.prepare("UPDATE items SET status = 'removed', reason = ?, updated = ? WHERE id = ?").bind(why, Date.now(), id).run();
  await notify(env, row!.owner, "item", id, `${row!.name} was removed from Outboard`, why);
  return { id, status: "removed" };
}

