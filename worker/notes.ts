/**
 * djmanzo's release notes, in the seven languages this site speaks: the
 * application's `contracts/release-notes.json`, newest first, read from its
 * repository with the site's GitHub token and kept ten minutes.
 *
 * Every commit to djmanzo is a version with notes (a patch; a feature, a
 * minor one, which is built for every system), so the site says what changed
 * on the day it changed, not only when a release is built. djmanzo's own
 * test holds the notes to its version and to all seven languages; this keeps
 * to their shape whatever arrives.
 */

import type { AppEnv } from "./env";
import { fail, json } from "./http";
import { get, put } from "./store";
import { CACHE, headers, whyNot } from "./update";

export const NOTES_URL = "https://api.github.com/repos/joehannes/djmanzo/contents/contracts/release-notes.json?ref=main";
export const NOTE_LANGS = ["en", "es", "pt", "de", "fr", "it", "ja"] as const;
/** The most versions shown, and the most lines in one. */
export const MOST = { versions: 300, lines: 40, length: 1000 } as const;

export interface ReleaseNote {
  version: string;
  date: string;
  /** A minor or major version (`0.50.0`), built for every system; a patch is carried by the next build. */
  built: boolean;
  title: Partial<Record<(typeof NOTE_LANGS)[number], string>>;
  notes: Partial<Record<(typeof NOTE_LANGS)[number], string[]>>;
}

const text = (v: unknown, n: number = MOST.length) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** The file's releases, each kept to its shape; one that is not a version with English notes is left out. */
export function shape(raw: unknown): ReleaseNote[] {
  const releases = (raw as { releases?: unknown } | null)?.releases;
  if (!Array.isArray(releases)) return [];
  const out: ReleaseNote[] = [];
  for (const r of releases.slice(0, MOST.versions)) {
    const o = (r ?? {}) as Record<string, unknown>;
    const version = text(o.version, 32);
    const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
    const date = text(o.date, 10);
    if (!m || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const title: ReleaseNote["title"] = {};
    const notes: ReleaseNote["notes"] = {};
    const titles = (o.title ?? {}) as Record<string, unknown>;
    const lines = (o.notes ?? {}) as Record<string, unknown>;
    for (const lang of NOTE_LANGS) {
      const t = text(titles[lang]);
      if (t) title[lang] = t;
      const l = lines[lang];
      if (Array.isArray(l)) {
        const kept = l.map((x) => text(x)).filter(Boolean).slice(0, MOST.lines);
        if (kept.length) notes[lang] = kept;
      }
    }
    if (!title.en || !notes.en) continue;
    out.push({ version, date, built: m[3] === "0", title, notes });
  }
  return out;
}

/** Every version's notes, newest first: from the cache, or from GitHub (null when GitHub refuses, with why). */
export async function list(env: AppEnv): Promise<{ list: ReleaseNote[] } | { why: string }> {
  const kept = await get<{ list: ReleaseNote[] }>(env.KV, "cache:release-notes");
  if (kept) return kept;
  const r = await fetch(NOTES_URL, { headers: headers(env, "application/vnd.github.raw+json") }).catch(() => null);
  if (!r) return { why: "GitHub could not be reached." };
  if (!r.ok) return { why: await whyNot(env, r) };
  const got = { list: shape(await r.json().catch(() => null)) };
  // Only a real answer is kept: a refusal is asked again next time.
  await put(env.KV, "cache:release-notes", got, CACHE);
  return got;
}

/** `GET /api/release-notes`: every version's notes, newest first, in every language there is. */
export async function notes(env: AppEnv): Promise<Response> {
  const got = await list(env);
  if ("why" in got) fail(502, got.why);
  return json(got.list, 200, { "cache-control": "public, max-age=120" });
}
