/**
 * Talkback, the discussion space (§139): posts in communities, comments
 * under them, one vote an account, sorted hot, new or top, searchable.
 *
 * A new account grows into it (`shared/talkback.ts` TRUST): few posts and no
 * links at first, its posts read by Claude's screen and, where it hesitates
 * or is not to be had, by the crew. Anything can be reported; the crew keeps
 * or removes it and always says why (`moderation.ts`). A proposal the crew
 * likes is carried to the wishlist, with a link back.
 */

import { COMMUNITY_BY_ID, COMMUNITIES, DEEPEST, FLAIRS, TRUST, hot, trustLevel } from "../shared/talkback";
import { hasLink } from "../shared/markdown";
import { addWish } from "./community";
import type { AppEnv } from "./env";
import { brake, clientIp, fail, randomId, text } from "./http";
import { human, notices, screen, type Screen } from "./moderation";
import type { User } from "./store";

function db(env: AppEnv): D1Database {
  if (!env.DB) fail(503, "Talkback is not set up on this site yet.");
  return env.DB!;
}

export interface PostRow {
  id: string;
  community: string;
  uid: string;
  author: string;
  title: string;
  body: string;
  flair: string | null;
  item: string | null;
  score: number;
  comments: number;
  hot: number;
  status: "live" | "held" | "removed";
  reason: string | null;
  wish: string | null;
  created: number;
}

/** An account's karma: what its live posts and comments have scored. */
export async function karma(env: AppEnv, uid: string): Promise<number> {
  const row = await db(env)
    .prepare("SELECT (SELECT COALESCE(SUM(score), 0) FROM posts WHERE uid = ?1 AND status = 'live') + (SELECT COALESCE(SUM(score), 0) FROM comments WHERE uid = ?1 AND status = 'live') AS k")
    .bind(uid)
    .first<number>("k");
  return row ?? 0;
}

/** Where an account stands: its trust level, karma, and what it has been told. */
export async function standing(env: AppEnv, user: User) {
  const k = await karma(env, user.id);
  const read = (await db(env).prepare("SELECT COUNT(*) AS n FROM posts WHERE uid = ? AND status = 'live'").bind(user.id).first<number>("n")) ?? 0;
  const level = trustLevel(Date.now() - user.createdAt, read, k);
  return { level, trust: TRUST[level], karma: k, notices: await notices(env, user.id) };
}

/** The communities, with how many live posts each holds. */
export async function communities(env: AppEnv) {
  const { results } = await db(env).prepare("SELECT community, COUNT(*) AS posts FROM posts WHERE status = 'live' GROUP BY community").all<{ community: string; posts: number }>();
  const counts = Object.fromEntries(results.map((r) => [r.community, r.posts]));
  return COMMUNITIES.map((c) => ({ ...c, posts: counts[c.id] ?? 0 }));
}

/** Words to search for, as FTS5 reads them safely: each a quoted term. */
function ftsQuery(q: string): string | null {
  const words = q.match(/[\p{L}\p{N}]{2,}/gu)?.slice(0, 8) ?? [];
  return words.length ? words.map((w) => `"${w}"`).join(" ") : null;
}

// Ties, as between two posts in one millisecond, go to the later one written.
const SORTS = { hot: "posts.hot DESC, posts.rowid DESC", new: "posts.created DESC, posts.rowid DESC", top: "posts.score DESC, posts.created DESC, posts.rowid DESC" } as const;

/** Live posts, in one community or all, sorted, or found by words; with the visitor's own held ones. */
export async function posts(env: AppEnv, opts: { community?: string | null; sort?: string | null; q?: string | null; uid?: string | null; item?: string | null }) {
  const where = ["(posts.status = 'live' OR (posts.status = 'held' AND posts.uid = ?))"];
  const args: unknown[] = [opts.uid ?? ""];
  if (opts.community && COMMUNITY_BY_ID[opts.community]) {
    where.push("posts.community = ?");
    args.push(opts.community);
  }
  if (opts.item) {
    where.push("posts.item = ?");
    args.push(opts.item);
  }
  let from = "posts";
  const match = opts.q ? ftsQuery(opts.q) : null;
  if (match) {
    from = "posts JOIN posts_fts ON posts_fts.rowid = posts.rowid";
    where.push("posts_fts MATCH ?");
    args.push(match);
  }
  const order = SORTS[(opts.sort ?? "hot") as keyof typeof SORTS] ?? SORTS.hot;
  const { results } = await db(env)
    .prepare(`SELECT posts.id, posts.community, posts.uid, posts.author, posts.title, substr(posts.body, 1, 400) AS body, posts.flair, posts.item, posts.score, posts.comments, posts.status, posts.wish, posts.created FROM ${from} WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT 100`)
    .bind(...args)
    .all<PostRow>();
  return results;
}

interface CommentRow {
  id: string;
  post: string;
  parent: string | null;
  depth: number;
  uid: string;
  author: string;
  body: string;
  score: number;
  status: string;
  created: number;
}

/** A post and its comments, threaded; removed words are not shown, only that they were removed. */
export async function thread(env: AppEnv, id: string, uid: string | null) {
  const store = db(env);
  const post = await store.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<PostRow>();
  if (!post || (post.status === "held" && post.uid !== uid)) fail(404, "No such post.");
  const { results } = await store
    .prepare("SELECT id, post, parent, depth, uid, author, body, score, status, created FROM comments WHERE post = ? AND (status != 'held' OR uid = ?) ORDER BY created")
    .bind(id, uid ?? "")
    .all<CommentRow>();
  const votes = uid
    ? Object.fromEntries(
        (
          await store
            .prepare("SELECT target, value FROM votes WHERE uid = ? AND (target = ? OR target IN (SELECT 'comment:' || id FROM comments WHERE post = ?))")
            .bind(uid, `post:${id}`, id)
            .all<{ target: string; value: number }>()
        ).results.map((v) => [v.target, v.value]),
      )
    : {};
  const hide = <T extends { status: string; body: string }>(x: T) => (x.status === "removed" ? { ...x, body: "", removed: true } : x);
  return { post: post!.status === "removed" ? { ...hide(post!), title: "Removed", reason: post!.reason } : post, comments: results.map(hide), votes };
}

/** Today's count of what an account has written. */
async function today(env: AppEnv, table: "posts" | "comments", uid: string): Promise<number> {
  return (await db(env).prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE uid = ? AND created > ?`).bind(uid, Date.now() - 86_400_000).first<number>("n")) ?? 0;
}

/** A new post: held to its author's trust level, screened when they are new. */
export async function post(
  env: AppEnv,
  req: Request,
  user: User,
  input: { community?: string; title?: string; body?: string; flair?: string | null; item?: string | null; turnstile?: string },
  read?: Screen,
) {
  const store = db(env);
  const community = COMMUNITY_BY_ID[String(input.community ?? "")];
  if (!community) fail(400, "Choose a community.");
  const title = text(input.title, 140);
  if (title.length < 4) fail(400, "Give it a title of a few words.");
  const body = String(input.body ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 10_000);
  const flair = input.flair && FLAIRS.some((f) => f.id === input.flair) ? input.flair : null;
  const { level, trust } = await standing(env, user);
  if (!trust.links && (hasLink(body) || hasLink(title))) fail(403, "New accounts post without links for their first days. Describe it, and add the link once you are a member.");
  if ((await today(env, "posts", user.id)) >= trust.posts) fail(429, `${trust.name} accounts post ${trust.posts} times a day; this was the last for today.`);
  await brake(env.KV, `post:${user.id}`, 6, 600);
  if (level === 0 && !(await human(env, input.turnstile, clientIp(req)))) fail(403, "Prove you are a person first.", { turnstile: true });
  let item: string | null = null;
  if (input.item) {
    item = (await store.prepare("SELECT id FROM items WHERE id = ? AND status = 'listed'").bind(String(input.item)).first<string>("id")) ?? null;
    if (!item) fail(404, "No such item.");
  }
  // A new account's post is read first: by Claude's screen when there is one, else by the crew.
  let status: "live" | "held" = "live";
  let note: string | null = null;
  if (level === 0) {
    const verdict = await screen(env, title, body, read);
    if (!verdict || verdict.verdict === "hold") {
      status = "held";
      note = verdict ? verdict.reason : "A new account's first posts wait for the crew.";
    }
  }
  const now = Date.now();
  const id = randomId(9);
  await store
    .prepare("INSERT INTO posts (id, community, uid, author, title, body, flair, item, score, hot, status, reason, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)")
    .bind(id, community.id, user.id, user.name, title, body, flair, item, hot(0, now), status, status === "held" ? note : null, now)
    .run();
  return { id, status, note };
}

/** A comment, under a post or another comment, no deeper than `DEEPEST`. */
export async function comment(env: AppEnv, user: User, postId: string, input: { body?: string; parent?: string | null }) {
  const store = db(env);
  const p = await store.prepare("SELECT id, status FROM posts WHERE id = ?").bind(postId).first<{ status: string }>();
  if (!p || p.status !== "live") fail(404, "No such post, or it is closed.");
  const body = String(input.body ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 4000);
  if (body.length < 2) fail(400, "Write something first.");
  const { trust } = await standing(env, user);
  if (!trust.links && hasLink(body)) fail(403, "New accounts comment without links for their first days.");
  if ((await today(env, "comments", user.id)) >= trust.comments) fail(429, `${trust.name} accounts comment ${trust.comments} times a day; this was the last for today.`);
  await brake(env.KV, `comment:${user.id}`, 20, 600);
  let depth = 0;
  let parent: string | null = null;
  if (input.parent) {
    const up = await store.prepare("SELECT id, depth FROM comments WHERE id = ? AND post = ?").bind(String(input.parent), postId).first<{ id: string; depth: number }>();
    if (!up) fail(404, "No such comment to answer.");
    parent = up!.id;
    depth = Math.min(up!.depth + 1, DEEPEST);
  }
  const id = randomId(9);
  const now = Date.now();
  await store.batch([
    store.prepare("INSERT INTO comments (id, post, parent, depth, uid, author, body, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, postId, parent, depth, user.id, user.name, body, now),
    store.prepare("UPDATE posts SET comments = comments + 1 WHERE id = ?").bind(postId),
  ]);
  return { id, depth, parent };
}

/** A vote: up, down, or 0 to take it back. One an account; counted from the votes themselves. */
export async function vote(env: AppEnv, user: User, kind: string, id: string, value: number) {
  if (kind !== "post" && kind !== "comment") fail(400, "Vote on a post or a comment.");
  if (![1, -1, 0].includes(value)) fail(400, "A vote is up, down, or taken back.");
  const store = db(env);
  const table = kind === "post" ? "posts" : "comments";
  const row = await store.prepare(`SELECT uid, status, created FROM ${table} WHERE id = ?`).bind(id).first<{ uid: string; status: string; created: number }>();
  if (!row || row.status !== "live") fail(404, "No such thing.");
  if (row!.uid === user.id) fail(400, "Your own words carry no vote of yours.");
  await brake(env.KV, `vote:${user.id}`, 120, 3600);
  const target = `${kind}:${id}`;
  if (value === 0) await store.prepare("DELETE FROM votes WHERE target = ? AND uid = ?").bind(target, user.id).run();
  else
    await store
      .prepare("INSERT INTO votes (target, uid, value) VALUES (?, ?, ?) ON CONFLICT (target, uid) DO UPDATE SET value = excluded.value")
      .bind(target, user.id, value)
      .run();
  const score = (await store.prepare("SELECT COALESCE(SUM(value), 0) AS s FROM votes WHERE target = ?").bind(target).first<number>("s")) ?? 0;
  if (kind === "post") await store.prepare("UPDATE posts SET score = ?, hot = ? WHERE id = ?").bind(score, hot(score, row!.created), id).run();
  else await store.prepare("UPDATE comments SET score = ? WHERE id = ?").bind(score, id).run();
  return { score, value };
}

/** The crew carries a proposal to the wishlist, with a link back to where it was proposed. */
export async function promote(env: AppEnv, req: Request, origin: string, id: string) {
  const store = db(env);
  const p = await store.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<PostRow>();
  if (!p || p.status !== "live") fail(404, "No such post.");
  if (p!.wish) fail(409, "It is on the wishlist already.");
  const w = await addWish(env, req, null, { title: p!.title.slice(0, 100), body: `${p!.body.slice(0, 1000)}\n\nProposed by ${p!.author} in Talkback: ${origin}/talkback/${p!.id}`.slice(0, 1200), author: p!.author, tag: "talkback" });
  await store.prepare("UPDATE posts SET wish = ? WHERE id = ?").bind(w.id, id).run();
  return { wish: w.id };
}
