/**
 * The crew's own packs, listed in Outboard by themselves: a marketplace with
 * something in it on the day it opens (the owner, 21 October: "it should be
 * usable at once ... default packs to the marketplace").
 *
 * They ship with the site as static files, `public/packs/crew/`, made and
 * signed by `tools/packsmith make` with djmanzo's own code (`app/`), and
 * listed by `index.json` there. The first time Outboard is read after an
 * index it has not seen, each pack is fetched from the site's own assets,
 * checked exactly as an upload is (`djpack.ts`), kept in R2, and listed under
 * the crew's account, with no review: the crew made it. A version already
 * there is left alone, so this can run again safely; a pack whose name a
 * maker took first, under another key, is left out and logged.
 */

import { SEED_THREADS } from "../shared/talkback-seed";
import { hot } from "../shared/talkback";
import { PackError, checkArchive, sha256 } from "./djpack";
import type { AppEnv } from "./env";
import { blobKey, packId, previewOf } from "./market";

/** The account the crew's packs are listed under: not a person's, never signed in to. */
export const CREW = "crew:djmanzo";
export const CREW_NAME = "djmanzo crew";
const CREW_ABOUT =
  "The people who make djmanzo. These packs ship with the site, made and checked by djmanzo's own code, free under CC0: wear them, change them, pass them on.";

/** What `tools/packsmith make` writes beside the packs. */
export interface CrewIndex {
  packs: { file: string; name: string; version: string; sha256: string }[];
}

const SEEDED = "outboard:seeded";
const DIR = "/packs/crew/";

/** List the crew's packs, if this index has not been listed yet. Never throws: a page still opens. */
export async function seedOnce(env: AppEnv, origin: string): Promise<void> {
  if (!env.DB || !env.MEDIA || !env.ASSETS) return;
  try {
    const res = await env.ASSETS.fetch(new Request(`${origin}${DIR}index.json`));
    if (!res.ok) return;
    const text = await res.text();
    const digest = await sha256(new TextEncoder().encode(text));
    if ((await env.KV.get(SEEDED)) === digest) return;
    const index = JSON.parse(text) as CrewIndex;
    const listed = await seed(env, origin, index);
    await env.KV.put(SEEDED, digest);
    console.log(JSON.stringify({ at: "seed", listed }));
  } catch (e) {
    console.error(JSON.stringify({ at: "seed", error: String((e as Error)?.stack ?? e) }));
  }
}

/** Each pack of `index`, listed if it is not already: what was listed now. */
export async function seed(env: AppEnv, origin: string, index: CrewIndex): Promise<string[]> {
  const store = env.DB!;
  const now = Date.now();
  await store
    .prepare("INSERT INTO profiles (uid, name, about, links, updated) VALUES (?, ?, ?, '[]', ?) ON CONFLICT (uid) DO UPDATE SET name = excluded.name, about = excluded.about")
    .bind(CREW, CREW_NAME, CREW_ABOUT, now)
    .run();
  const listed: string[] = [];
  for (const entry of index.packs) {
    const res = await env.ASSETS!.fetch(new Request(`${origin}${DIR}${encodeURIComponent(entry.file)}`));
    if (!res.ok) {
      console.error(JSON.stringify({ at: "seed", missing: entry.file }));
      continue;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    if ((await sha256(bytes)) !== entry.sha256) {
      console.error(JSON.stringify({ at: "seed", changed: entry.file }));
      continue;
    }
    let pack;
    try {
      pack = await checkArchive(bytes);
    } catch (e) {
      if (!(e instanceof PackError)) throw e;
      console.error(JSON.stringify({ at: "seed", refused: entry.file, why: e.message }));
      continue;
    }
    const m = pack.manifest;
    const version = m.version.trim();
    const held = await store.prepare("SELECT id, fingerprint, owner FROM items WHERE lower(name) = lower(?)").bind(m.name.trim()).first<{ id: string; fingerprint: string; owner: string }>();
    if (held && (held.fingerprint !== pack.fingerprint || held.owner !== CREW)) {
      console.error(JSON.stringify({ at: "seed", taken: m.name }));
      continue;
    }
    const id = held?.id ?? packId(m.name, pack.fingerprint);
    if (await store.prepare("SELECT 1 FROM versions WHERE item = ? AND version = ?").bind(id, version).first()) continue;
    await env.MEDIA!.put(blobKey(id, version), bytes, { httpMetadata: { contentType: "application/zip" } });
    const statements = [
      store
        .prepare("INSERT INTO versions (item, version, sha256, size, manifest, preview, changelog, status, created) VALUES (?, ?, ?, ?, ?, ?, ?, 'listed', ?)")
        .bind(id, version, entry.sha256, bytes.length, JSON.stringify(m), JSON.stringify(previewOf(pack)), "From the djmanzo crew, with the site.", now),
    ];
    if (held) statements.push(store.prepare("UPDATE items SET latest = ?, status = 'listed', updated = ? WHERE id = ?").bind(version, now, id));
    else
      statements.unshift(
        store
          .prepare("INSERT INTO items (id, kind, name, fingerprint, owner, author, licence, description, status, latest, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'listed', ?, ?, ?)")
          .bind(id, m.kind, m.name.trim(), pack.fingerprint, CREW, m.author.trim(), m.licence.trim(), m.description.trim(), version, now, now),
      );
    await store.batch(statements);
    listed.push(`${id} ${version}`);
  }
  return listed;
}

const THREADS_SEEDED = "talkback:seeded";

/**
 * Talkback's first threads (`shared/talkback-seed.ts`), written as the crew's
 * posts with their answers, when they have changed since they were last
 * written. A thread already there keeps its votes, its replies and its place;
 * only its words follow the file. Never throws: a page still opens.
 */
export async function seedThreadsOnce(env: AppEnv): Promise<void> {
  if (!env.DB) return;
  try {
    const digest = await sha256(new TextEncoder().encode(JSON.stringify(SEED_THREADS)));
    if ((await env.KV.get(THREADS_SEEDED)) === digest) return;
    await seedThreads(env);
    await env.KV.put(THREADS_SEEDED, digest);
  } catch (e) {
    console.error(JSON.stringify({ at: "seed threads", error: String((e as Error)?.stack ?? e) }));
  }
}

/** Every seed thread, written or brought up to date. */
export async function seedThreads(env: AppEnv, now = Date.now()): Promise<number> {
  const store = env.DB!;
  // Older first, so "new" lists them in the file's order; a minute apart.
  const statements = SEED_THREADS.flatMap((t, i) => {
    const id = `crew-${t.slug}`;
    const answer = `${id}-a`;
    const at = now - (SEED_THREADS.length - i) * 60_000;
    return [
      store
        .prepare(
          `INSERT INTO posts (id, community, uid, author, title, body, flair, score, comments, hot, status, pinned, answer, created)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?, 'live', ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET community = excluded.community, title = excluded.title, body = excluded.body, flair = excluded.flair, pinned = excluded.pinned`,
        )
        .bind(id, t.community, CREW, CREW_NAME, t.title, t.body, t.flair, hot(0, at), t.pinned ? 1 : 0, answer, at),
      store
        .prepare(
          `INSERT INTO comments (id, post, parent, depth, uid, author, body, score, status, created)
           VALUES (?, ?, NULL, 0, ?, ?, ?, 0, 'live', ?)
           ON CONFLICT (id) DO UPDATE SET body = excluded.body`,
        )
        .bind(answer, id, CREW, CREW_NAME, t.answer, at + 1000),
    ];
  });
  await store.batch(statements);
  return SEED_THREADS.length;
}
