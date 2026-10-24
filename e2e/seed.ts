/**
 * People and a clean slate for the browser tests, written straight into the
 * local test site's storage with wrangler (`--env test`, never the real
 * site): accounts a provider vouches for, each with a session cookie, as
 * signing in with GitHub would leave them.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const wrangler = (...args: string[]) => execFileSync("npx", ["wrangler", ...args, "--local", "--env", "test"], { stdio: "pipe", cwd: process.cwd() });

/** Outboard and Talkback emptied, so a run starts as the first did. */
export function emptyBoards() {
  wrangler("d1", "execute", "djmanzo", "--command", "DELETE FROM versions; DELETE FROM items; DELETE FROM ratings; DELETE FROM downloads; DELETE FROM profiles; DELETE FROM posts; DELETE FROM comments; DELETE FROM votes; DELETE FROM reports; DELETE FROM notices;");
}

/** People signed in with GitHub, each `days` old, written in one go: their ids and session cookies. */
export function people(...who: [name: string, days?: number][]): { uid: string; sid: string }[] {
  const run = Date.now().toString(36);
  const rows: { key: string; value: string }[] = [];
  const out = who.map(([name, days = 30]) => {
    const tag = `${name.toLowerCase().replace(/\W+/g, "-")}-${run}`;
    const uid = `e2e-${tag}`;
    const sid = `sid-${tag}`;
    const user = { id: uid, email: null, name, avatar: null, identities: [{ provider: "github", sub: tag }], createdAt: Date.now() - days * 86_400_000 };
    rows.push({ key: `user:${uid}`, value: JSON.stringify(user) }, { key: `session:${sid}`, value: JSON.stringify({ uid, createdAt: Date.now() }) });
    return { uid, sid };
  });
  const file = join(mkdtempSync(join(tmpdir(), "seed-")), "bulk.json");
  writeFileSync(file, JSON.stringify(rows));
  wrangler("kv", "bulk", "put", file, "--binding", "KV");
  return out;
}

export const cookie = (sid: string) => ({ name: "djm_sid", value: sid, domain: "127.0.0.1", path: "/" });
