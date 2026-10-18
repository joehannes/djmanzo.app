/**
 * Keeping Outboard and Talkback to the good parts (§134; the EU's Digital
 * Services Act for a small host): a *Report* on everything (Art. 16), a
 * statement of reasons to whoever's work is held or removed (Art. 17), and
 * their reply as an appeal; the crew decides, in Backstage.
 *
 * New accounts' posts may be screened by Claude first, with the community
 * rules, within a daily budget. Screening only holds or lets through — a
 * person removes. Without a key, credits or budget, or on any failure, a new
 * account's post simply waits for the crew.
 */

import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { RULES } from "../shared/talkback";
import type { AppEnv } from "./env";
import { HttpError, brake, fail, randomId, text } from "./http";
import { anthropic, modelFor } from "./model";
import type { User } from "./store";

export type Target = "item" | "post" | "comment" | "profile";
const TARGETS: Target[] = ["item", "post", "comment", "profile"];
/** Reports from this many accounts hold a post or comment until the crew has looked. */
export const HOLD_AFTER = 3;

function db(env: AppEnv): D1Database {
  if (!env.DB) fail(503, "Outboard and Talkback are not set up on this site yet.");
  return env.DB!;
}

/** A statement of reasons, to the person whose work it is. */
export async function notify(env: AppEnv, uid: string, kind: Target, target: string, action: string, reason: string) {
  await db(env)
    .prepare("INSERT INTO notices (id, uid, kind, target, action, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(randomId(12), uid, kind, target, action, reason, Date.now())
    .run();
}

/** What a person has been told about their own work. */
export async function notices(env: AppEnv, uid: string) {
  const { results } = await db(env).prepare("SELECT id, kind, target, action, reason, appeal, appealed, created FROM notices WHERE uid = ? ORDER BY created DESC LIMIT 50").bind(uid).all();
  return results;
}

/** Their reply to a statement of reasons: read by the crew, answered by a decision. */
export async function appeal(env: AppEnv, user: User, id: string, words: string) {
  const said = text(words, 1200);
  if (said.length < 10) fail(400, "Say what you would like the crew to know.");
  const r = await db(env).prepare("UPDATE notices SET appeal = ?, appealed = ? WHERE id = ? AND uid = ? AND appeal IS NULL").bind(said, Date.now(), id, user.id).run();
  if (!r.meta.changes) fail(404, "No such notice, or it has been answered already.");
  return { ok: true };
}

/** Where a reported thing lives, and whose it is. */
async function owner(env: AppEnv, kind: Target, target: string): Promise<string | null> {
  const table = { item: "items", post: "posts", comment: "comments", profile: "profiles" }[kind];
  const column = kind === "item" ? "owner" : "uid";
  const key = kind === "profile" ? "uid" : "id";
  return (await db(env).prepare(`SELECT ${column} AS who FROM ${table} WHERE ${key} = ?`).bind(target).first<string>("who")) ?? null;
}

/** A report: once an account a thing; enough of them hold a post or comment for the crew. */
export async function report(env: AppEnv, user: User, kind: string, target: string, reason: string) {
  if (!TARGETS.includes(kind as Target)) fail(400, "Report what?");
  const why = text(reason, 600);
  if (why.length < 4) fail(400, "Say what is wrong with it.");
  const whose = await owner(env, kind as Target, target);
  if (!whose) fail(404, "No such thing.");
  if (whose === user.id) fail(400, "That one is yours.");
  await brake(env.KV, `report:${user.id}`, 20, 3600);
  const store = db(env);
  await store
    .prepare("INSERT OR IGNORE INTO reports (id, kind, target, uid, reason, created) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(randomId(12), kind, target, user.id, why, Date.now())
    .run();
  if (kind === "post" || kind === "comment") {
    const n = await store.prepare("SELECT COUNT(*) AS n FROM reports WHERE kind = ? AND target = ? AND state = 'open'").bind(kind, target).first<number>("n");
    if ((n ?? 0) >= HOLD_AFTER) {
      const table = kind === "post" ? "posts" : "comments";
      const r = await store.prepare(`UPDATE ${table} SET status = 'held' WHERE id = ? AND status = 'live'`).bind(target).run();
      if (r.meta.changes) await notify(env, whose!, kind, target, `Your ${kind} is held until the crew has read it`, "Several people reported it. The crew reads it and decides; nothing is removed without a reason.");
    }
  }
  return { ok: true };
}

/** What the crew has to look at: reported things, and held posts and comments. */
export async function crewQueue(env: AppEnv) {
  const store = db(env);
  const reports = await store
    .prepare("SELECT kind, target, COUNT(*) AS reports, GROUP_CONCAT(reason, ' · ') AS reasons, MIN(created) AS since FROM reports WHERE state = 'open' GROUP BY kind, target ORDER BY since")
    .all<{ kind: Target; target: string }>();
  const held = await store
    .prepare(
      "SELECT 'post' AS kind, id AS target, author, title, body, created FROM posts WHERE status = 'held' UNION ALL SELECT 'comment', id, author, NULL, body, created FROM comments WHERE status = 'held' ORDER BY created",
    )
    .all();
  const appeals = await store.prepare("SELECT id, uid, kind, target, action, reason, appeal, appealed FROM notices WHERE appeal IS NOT NULL AND appealed > created ORDER BY appealed DESC LIMIT 50").all();
  return { reports: reports.results, held: held.results, appeals: appeals.results };
}

/** The crew's decision on a post or comment: keep it (live again), or remove it with the reason its author is told. */
export async function decide(env: AppEnv, kind: string, target: string, keep: boolean, reason: string) {
  if (kind !== "post" && kind !== "comment") fail(400, "Decide on a post or a comment; items are reviewed in Outboard.");
  const store = db(env);
  const table = kind === "post" ? "posts" : "comments";
  const row = await store.prepare(`SELECT uid FROM ${table} WHERE id = ?`).bind(target).first<{ uid: string }>();
  if (!row) fail(404, "No such thing.");
  if (keep) {
    await store.batch([
      store.prepare(`UPDATE ${table} SET status = 'live', reason = NULL WHERE id = ?`).bind(target),
      store.prepare("UPDATE reports SET state = 'done' WHERE kind = ? AND target = ?").bind(kind, target),
    ]);
    return { status: "live" };
  }
  const why = text(reason, 1000);
  if (why.length < 10) fail(400, "Say why, in a sentence the author can act on: they are told it.");
  await store.batch([
    store.prepare(`UPDATE ${table} SET status = 'removed', reason = ? WHERE id = ?`).bind(why, target),
    store.prepare("UPDATE reports SET state = 'done' WHERE kind = ? AND target = ?").bind(kind, target),
  ]);
  if (kind === "post") await store.prepare("UPDATE posts SET hot = 0 WHERE id = ?").bind(target).run();
  await notify(env, row!.uid, kind, target, `Your ${kind} was removed`, why);
  return { status: "removed" };
}

// --- Screening ---------------------------------------------------------------------------

const VerdictSchema = z.object({
  verdict: z.enum(["allow", "hold"]),
  rule: z.string(),
  reason: z.string(),
});
export type Verdict = z.infer<typeof VerdictSchema>;
export type Screen = (env: AppEnv, title: string, body: string) => Promise<Verdict | null>;

const SYSTEM = `You screen new posts for Talkback, the discussion space of djmanzo (a DJ and karaoke application), before a human moderator does.

The community rules:
${RULES.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Answer "allow" when a post keeps to the rules, "hold" when a moderator should read it first. You never remove anything: holding only asks a person to look. Hold spam, advertising unrelated to DJing, harassment, hate, sexual content, links to pirated music or software, promotion of excess, and personal data about someone else. Disagreement, criticism of djmanzo and beginner questions are allowed. "rule" is the number of the rule it breaks, or "" when allowed; "reason" is one plain sentence a moderator reads.`;

async function claudeScreen(env: AppEnv, title: string, body: string): Promise<Verdict | null> {
  const client = anthropic(env);
  const r = await client.messages.parse({
    model: await modelFor(env, client, "MOD_MODEL"),
    max_tokens: 300,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `<post>\n<title>${title}</title>\n<body>${body}</body>\n</post>` }] as Anthropic.MessageParam[],
    output_config: { format: zodOutputFormat(VerdictSchema) },
  });
  if (r.stop_reason === "refusal") return { verdict: "hold", rule: "", reason: "The screen would not read it." };
  return r.parsed_output ?? null;
}

/** Claude's first read of a new account's post, within the day's budget; null when there is none to be had. */
export async function screen(env: AppEnv, title: string, body: string, read: Screen = claudeScreen): Promise<Verdict | null> {
  if (!env.ANTHROPIC_API_KEY) return null;
  try {
    await brake(env.KV, "screen:day", Number(env.MOD_DAILY) || 200, 86400);
  } catch (e) {
    if (e instanceof HttpError && e.status === 429) return null;
    throw e;
  }
  try {
    return await read(env, title, body);
  } catch (e) {
    console.error(JSON.stringify({ at: "screen", error: String((e as Error)?.message ?? e) }));
    return null;
  }
}

/** Turnstile, when the owner has set it up: a new account proves it is a person. Skipped, and said so, until then. */
export async function human(env: AppEnv, token: unknown, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true;
  if (typeof token !== "string" || !token) return false;
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET);
  form.set("response", token);
  form.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    return ((await r.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}
