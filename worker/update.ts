/**
 * Where djmanzo asks whether there is something newer (DIRECTIVE §135: "the
 * base url to find available updates shall be found on the marketing
 * website"):
 *
 *   GET /api/update/:target/:arch/:current
 *
 * in the Tauri updater's dynamic format. The answer comes from the project's
 * latest GitHub release (drafts and pre-releases never count), kept in KV
 * for ten minutes so a thousand djmanzos starting at once ask GitHub once.
 *
 * - Nothing newer: 204, no body.
 * - Newer, the same major version, and the release carries the updater's
 *   manifest (`latest.json`) with this platform in it: 200 with `url` and
 *   `signature`, which djmanzo verifies against the key it was built with
 *   and installs.
 * - Newer but no manifest, or none for this platform: 200 without them —
 *   djmanzo offers the release page as a download.
 * - A new major version: the same download only, never installed by
 *   itself; it is a new licence (`docs/EDITIONS.md`, buying once covers a
 *   major version).
 *
 * The same release is what the site hands out (`GET /api/download`, and
 * `GET /download/:file` for one of its files). djmanzo's repository is
 * private, so its release files cannot be fetched by a visitor's browser:
 * with `GITHUB_RELEASES_TOKEN` set (read-only, that repository only) the
 * Worker asks GitHub for a short-lived address for the file and sends the
 * visitor there, so the token never leaves it and the file never passes
 * through it. The updater's own addresses are rewritten to the same route.
 * Without the token the public addresses are used, which work only while
 * the repository is public.
 */

import type { AppEnv } from "./env";
import { fail, json } from "./http";
import { get, put } from "./store";

export const RELEASES = "https://api.github.com/repos/joehannes/djmanzo/releases/latest";
/** Ten minutes, in seconds. */
export const CACHE = 600;
export const MOST_NOTES = 4000;

const UA = { "user-agent": "djmanzo-website", accept: "application/vnd.github+json" };

/** GitHub's headers, with the read token when the owner has set one. */
export function headers(env: AppEnv, accept = UA.accept): Record<string, string> {
  const h: Record<string, string> = { "user-agent": UA["user-agent"], accept };
  if (env.GITHUB_RELEASES_TOKEN) h.authorization = `Bearer ${env.GITHUB_RELEASES_TOKEN}`;
  return h;
}

/**
 * What GitHub said when it refused, for the owner to act on: its status and
 * its own message, and whether the site sent its token. Never the token.
 */
export async function whyNot(env: AppEnv, r: Response): Promise<string> {
  const said = ((await r.json().catch(() => null)) as { message?: string } | null)?.message;
  const how = env.GITHUB_RELEASES_TOKEN ? "with the site's GITHUB_RELEASES_TOKEN" : "without a token (GITHUB_RELEASES_TOKEN is not set on the Worker)";
  const limit = r.headers.get("x-ratelimit-remaining");
  return `GitHub answered ${r.status}${said ? ` ("${said.slice(0, 160)}")` : ""}, asked ${how}${limit === "0" ? "; its rate limit is used up" : ""}.`;
}

/** A version as `semver` has it: three numbers and the pre-release's identifiers. */
export interface Version {
  major: number;
  minor: number;
  patch: number;
  pre: string[];
}

/** `1.4.2`, `v1.4.2`, `1.5.0-beta.2+build.7`; null for anything else. */
export function parse(s: string): Version | null {
  const m = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(s ?? "").trim());
  return m ? { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ? m[4].split(".") : [] } : null;
}

/** Negative when `a` is older than `b`, positive when newer, 0 when the same (build metadata ignored, as semver says). */
export function compare(a: Version, b: Version): number {
  for (const k of ["major", "minor", "patch"] as const) if (a[k] !== b[k]) return a[k] - b[k];
  // A release outranks its own pre-releases.
  if (!a.pre.length || !b.pre.length) return (a.pre.length ? -1 : 0) + (b.pre.length ? 1 : 0);
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i];
    const y = b.pre[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (x === y) continue;
    const nx = /^\d+$/.test(x);
    const ny = /^\d+$/.test(y);
    if (nx && ny) return Number(x) - Number(y);
    if (nx !== ny) return nx ? -1 : 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

/** What is kept of a release: only what the answer needs. */
export interface Release {
  tag: string;
  body: string;
  page: string;
  published: string | null;
  draft: boolean;
  prerelease: boolean;
  manifest: string | null;
  /** Every file on the release, with GitHub's id for asking for it privately. */
  assets: Asset[];
}

export interface Asset {
  id: number;
  name: string;
  size: number;
  /** The public address, which works only while the repository is public. */
  url: string;
}

/** The Tauri updater's manifest, as a release publishes it. */
interface Manifest {
  version?: string;
  notes?: string;
  pub_date?: string;
  platforms?: Record<string, { signature?: string; url?: string }>;
}

/** The latest release, from KV or from GitHub; null when there is none. */
export async function latest(env: AppEnv): Promise<Release | null> {
  const kept = await get<{ release: Release | null }>(env.KV, "cache:release");
  if (kept && (!kept.release || kept.release.assets)) return kept.release;
  const r = await fetch(RELEASES, { headers: headers(env) });
  if (r.status === 404) {
    await put(env.KV, "cache:release", { release: null }, CACHE);
    return null;
  }
  if (!r.ok) fail(502, await whyNot(env, r));
  const g = (await r.json()) as {
    tag_name?: string;
    body?: string | null;
    html_url?: string;
    published_at?: string | null;
    draft?: boolean;
    prerelease?: boolean;
    assets?: { id?: number; name?: string; size?: number; browser_download_url?: string }[];
  };
  const assets = (g.assets ?? [])
    .filter((a) => a.name && a.browser_download_url)
    .map((a) => ({ id: Number(a.id) || 0, name: String(a.name), size: Number(a.size) || 0, url: String(a.browser_download_url) }));
  const release: Release = {
    tag: String(g.tag_name ?? ""),
    body: String(g.body ?? "").trim().slice(0, MOST_NOTES),
    page: String(g.html_url ?? ""),
    published: g.published_at ?? null,
    draft: !!g.draft,
    prerelease: !!g.prerelease,
    manifest: assets.find((a) => a.name === "latest.json")?.url ?? null,
    assets,
  };
  await put(env.KV, "cache:release", { release }, CACHE);
  return release;
}

/** A release's updater manifest, from KV or from GitHub; null when it cannot be had. */
async function manifestOf(env: AppEnv, release: Release): Promise<Manifest | null> {
  if (!release.manifest) return null;
  const key = `cache:updater:${release.tag}`;
  const kept = await get<{ manifest: Manifest | null }>(env.KV, key);
  if (kept) return kept.manifest;
  const asset = release.assets.find((a) => a.name === "latest.json");
  const r = await (env.GITHUB_RELEASES_TOKEN && asset?.id
    ? fetch(`${ASSETS}/${asset.id}`, { headers: headers(env, "application/octet-stream") })
    : fetch(release.manifest, { headers: { "user-agent": UA["user-agent"] } })
  ).catch(() => null);
  const manifest = r?.ok ? ((await r.json().catch(() => null)) as Manifest | null) : null;
  await put(env.KV, key, { manifest }, CACHE);
  return manifest;
}

/** `GET /api/update/:target/:arch/:current`. */
export async function check(env: AppEnv, target: string, arch: string, current: string, origin = ""): Promise<Response> {
  if (!/^[a-z0-9_]{1,24}$/.test(target) || !/^[a-z0-9_]{1,24}$/.test(arch)) fail(400, "Name the platform as djmanzo does: darwin, linux or windows, and x86_64 or aarch64.");
  const have = parse(current);
  if (!have) fail(400, "That is not a version djmanzo has.");
  const release = await latest(env);
  const offered = release && !release.draft && !release.prerelease ? parse(release.tag) : null;
  if (!release || !offered || compare(offered, have) <= 0) return new Response(null, { status: 204 });
  const version = release.tag.replace(/^v/, "");
  const download = { version, notes: release.body, pub_date: release.published, page: release.page };
  // A new major version is a new licence: shown, never installed by itself.
  if (offered.major !== have.major) return json(download);
  const entry = (await manifestOf(env, release))?.platforms?.[`${target}-${arch}`];
  if (!entry?.url || !entry.signature) return json(download);
  return json({ ...download, url: origin && env.GITHUB_RELEASES_TOKEN ? throughSite(origin, entry.url) : entry.url, signature: entry.signature });
}

export const ASSETS = "https://api.github.com/repos/joehannes/djmanzo/releases/assets";

/** A release file's address on this site: `<origin>/download/<its name>`. */
export function throughSite(origin: string, url: string): string {
  return `${origin}/download/${encodeURIComponent(decodeURIComponent(url.split("/").pop() ?? ""))}`;
}

/**
 * What a visitor would want each file for, with a stable key for that kind
 * of file (`linux-deb`, `mac-arm`…), the same from release to release; null
 * for the updater's own files.
 */
export function platformOf(name: string): { os: "mac" | "linux" | "windows"; key: string; label: string } | null {
  const n = name.toLowerCase();
  if (n.endsWith(".sig") || n.endsWith(".tar.gz") || n.endsWith(".zip") || n.endsWith(".json")) return null;
  if (n.endsWith(".dmg")) {
    if (/aarch64|arm64/.test(n)) return { os: "mac", key: "mac-arm", label: "macOS, Apple silicon" };
    if (/legacy|10\.13|karaoke/.test(n)) return { os: "mac", key: "mac-karaoke", label: "macOS 10.13+, Intel (karaoke build)" };
    return { os: "mac", key: "mac-intel", label: "macOS, Intel" };
  }
  if (n.endsWith(".appimage")) return { os: "linux", key: "linux-appimage", label: "Linux, AppImage" };
  if (n.endsWith(".deb")) return { os: "linux", key: "linux-deb", label: "Linux, .deb (Debian, Ubuntu)" };
  if (n.endsWith(".rpm")) return { os: "linux", key: "linux-rpm", label: "Linux, .rpm (Fedora, openSUSE)" };
  if (n.endsWith(".msi")) return { os: "windows", key: "windows-msi", label: "Windows, .msi" };
  if (n.endsWith(".exe")) return { os: "windows", key: "windows-exe", label: "Windows, installer" };
  return null;
}

/** `GET /api/download`: the newest release's installers, each with this site's address for it. */
export async function downloads(env: AppEnv, origin: string): Promise<Response> {
  const release = await latest(env);
  if (!release || release.draft || release.prerelease) return json({ version: null, files: [], page: null });
  const files = release.assets.flatMap((a) => {
    const p = platformOf(a.name);
    // The address names the kind of file, not this release's file: pressed later, it is still the newest.
    return p ? [{ name: a.name, size: a.size, os: p.os, key: p.key, label: p.label, href: `${origin}/download/latest/${p.key}` }] : [];
  });
  return json({ version: release.tag.replace(/^v/, ""), published: release.published, page: release.page, private: !!env.GITHUB_RELEASES_TOKEN, files });
}

/** `GET /download/latest/:key`: the newest release's file of that kind (`platformOf`'s key). */
export async function newest(env: AppEnv, key: string): Promise<Response> {
  const release = await latest(env);
  const asset = release && !release.draft && !release.prerelease ? release.assets.find((a) => platformOf(a.name)?.key === key) : undefined;
  if (!asset) fail(404, "The newest release has no file of that kind. The download screen lists what it has.");
  return file(env, asset.name);
}

/**
 * `GET /download/:file`: one file of the newest release. With the token,
 * GitHub's short-lived address for it; without, its public one.
 */
export async function file(env: AppEnv, name: string): Promise<Response> {
  const release = await latest(env);
  const asset = release?.assets.find((a) => a.name === name);
  if (!release || !asset) fail(404, "That file is not on the newest release. The download page lists what is.");
  if (!env.GITHUB_RELEASES_TOKEN || !asset.id) return Response.redirect(asset.url, 302);
  const r = await fetch(`${ASSETS}/${asset.id}`, { headers: headers(env, "application/octet-stream"), redirect: "manual" });
  const to = r.headers.get("location");
  if (r.status >= 300 && r.status < 400 && to) return Response.redirect(to, 302);
  fail(502, await whyNot(env, r));
}

/** `GET /api/releases`: the three newest releases for "What's new", read with the token and kept ten minutes. */
export async function recent(env: AppEnv): Promise<Response> {
  const kept = await get<{ list: unknown[] }>(env.KV, "cache:releases");
  if (kept) return json(kept.list);
  const r = await fetch(`${RELEASES.replace(/\/latest$/, "")}?per_page=6`, { headers: headers(env) }).catch(() => null);
  const all = r?.ok ? ((await r.json().catch(() => [])) as { name?: string; tag_name?: string; published_at?: string; html_url?: string; body?: string | null; prerelease?: boolean; draft?: boolean }[]) : [];
  const list = all
    .filter((g) => !g.draft && g.tag_name && g.published_at)
    .slice(0, 3)
    .map((g) => ({
      name: String(g.name || g.tag_name),
      tag_name: String(g.tag_name),
      published_at: String(g.published_at),
      // A private repository's page opens for nobody; the site's download screen does.
      html_url: env.GITHUB_RELEASES_TOKEN ? "/#download" : String(g.html_url ?? "/#download"),
      body: String(g.body ?? "").slice(0, MOST_NOTES),
      prerelease: !!g.prerelease,
    }));
  // Only a real answer is kept: a refusal is asked again next time.
  if (r?.ok) await put(env.KV, "cache:releases", { list }, CACHE);
  return json(list);
}
