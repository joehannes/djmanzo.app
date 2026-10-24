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
 */

import type { AppEnv } from "./env";
import { fail, json } from "./http";
import { get, put } from "./store";

export const RELEASES = "https://api.github.com/repos/joehannes/djmanzo/releases/latest";
/** Ten minutes, in seconds. */
export const CACHE = 600;
export const MOST_NOTES = 4000;

const UA = { "user-agent": "djmanzo-website", accept: "application/vnd.github+json" };

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
  if (kept) return kept.release;
  const r = await fetch(RELEASES, { headers: UA });
  if (r.status === 404) {
    await put(env.KV, "cache:release", { release: null }, CACHE);
    return null;
  }
  if (!r.ok) fail(502, `GitHub answered ${r.status}; try again later.`);
  const g = (await r.json()) as {
    tag_name?: string;
    body?: string | null;
    html_url?: string;
    published_at?: string | null;
    draft?: boolean;
    prerelease?: boolean;
    assets?: { name?: string; browser_download_url?: string }[];
  };
  const release: Release = {
    tag: String(g.tag_name ?? ""),
    body: String(g.body ?? "").trim().slice(0, MOST_NOTES),
    page: String(g.html_url ?? ""),
    published: g.published_at ?? null,
    draft: !!g.draft,
    prerelease: !!g.prerelease,
    manifest: (g.assets ?? []).find((a) => a.name === "latest.json")?.browser_download_url ?? null,
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
  const r = await fetch(release.manifest, { headers: { "user-agent": UA["user-agent"] } }).catch(() => null);
  const manifest = r?.ok ? ((await r.json().catch(() => null)) as Manifest | null) : null;
  await put(env.KV, key, { manifest }, CACHE);
  return manifest;
}

/** `GET /api/update/:target/:arch/:current`. */
export async function check(env: AppEnv, target: string, arch: string, current: string): Promise<Response> {
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
  return json({ ...download, url: entry.url, signature: entry.signature });
}
