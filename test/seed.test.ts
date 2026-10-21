import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SEED_THREADS } from "../shared/talkback-seed";
import { CREW, seedThreads } from "../worker/seed";
import { browser, crew, openSite, person } from "./people";

const PUBLIC = new URL("../public/", import.meta.url);
/** The site's own static files, as `env.ASSETS` serves them. */
const assets = (served: (path: string) => Uint8Array | null = (path) => readFileSync(new URL(`.${path}`, PUBLIC))) => ({
  fetch: async (req: Request) => {
    try {
      const bytes = served(decodeURIComponent(new URL(req.url).pathname));
      return bytes ? new Response(bytes) : new Response("", { status: 404 });
    } catch {
      return new Response("", { status: 404 });
    }
  },
});
const index = JSON.parse(readFileSync(new URL("packs/crew/index.json", PUBLIC), "utf8")) as { packs: { file: string; name: string }[] };

describe("Outboard on the day it opens", () => {
  it("lists the crew's packs by itself, and djmanzo's index installs them byte for byte", async () => {
    const env = openSite({ ASSETS: assets() });
    const anyone = browser(env);
    const items = (await anyone("/api/outboard/items")).data as { id: string; kind: string; owner: string; name: string; preview: { keys: unknown[] } }[];
    expect(items.map((i) => i.name).sort()).toEqual(index.packs.map((p) => p.name).sort());
    for (const item of items) {
      expect(item).toMatchObject({ kind: "keys", owner: CREW });
      expect(item.preview.keys.length).toBeGreaterThan(0);
    }
    expect((await anyone("/api/outboard/items?kind=keys")).data).toHaveLength(index.packs.length);

    const packs = (await anyone("/api/outboard/packs.json")).data.packs as { name: string; url: string; key: string; kind: string }[];
    expect(packs).toHaveLength(index.packs.length);
    for (const p of packs) {
      const file = index.packs.find((x) => x.name === p.name)!.file;
      const res = await anyone(new URL(p.url).pathname);
      expect(res.status, p.url).toBe(200);
      expect(new Uint8Array(await res.res.arrayBuffer())).toEqual(new Uint8Array(readFileSync(new URL(`packs/crew/${file}`, PUBLIC))));
      expect(p.kind).toBe("keys");
    }
  });

  it("lists each once, however often it is read or the index changes", async () => {
    const env = openSite({ ASSETS: assets() });
    const anyone = browser(env);
    await anyone("/api/outboard/items");
    const kv = (env as unknown as { KV: KVNamespace }).KV;
    const done = await kv.get("outboard:seeded");
    expect(done).toBeTruthy();
    // As after a deploy with a new index: it runs again, finds every pack there, and finishes.
    await kv.delete("outboard:seeded");
    await anyone("/api/outboard");
    expect(await kv.get("outboard:seeded")).toBe(done);
    const versions = await (env as unknown as { DB: D1Database }).DB.prepare("SELECT COUNT(*) AS n FROM versions").first<number>("n");
    expect(versions).toBe(index.packs.length);
  });

  it("leaves out a pack whose name a maker took first, and a file that is not the one the index names", async () => {
    const taken = index.packs[0];
    const changed = index.packs[1];
    const env = openSite({
      ASSETS: assets((path) => {
        const bytes = new Uint8Array(readFileSync(new URL(`.${path}`, PUBLIC)));
        if (path.endsWith(changed.file)) bytes[bytes.length - 1] ^= 1;
        return bytes;
      }),
    });
    const db = (env as unknown as { DB: D1Database }).DB;
    await db
      .prepare("INSERT INTO items (id, kind, name, fingerprint, owner, author, licence, status, created, updated) VALUES ('theirs', 'theme', ?, 'aaaa bbbb cccc dddd', 'github:1', 'Them', 'CC0', 'pending', 0, 0)")
      .bind(taken.name)
      .run();
    const names = ((await browser(env)("/api/outboard/items")).data as { name: string }[]).map((i) => i.name);
    expect(names).not.toContain(taken.name);
    expect(names).not.toContain(changed.name);
    expect(names).toHaveLength(index.packs.length - 2);
  });

  it("is an empty shelf, not an error, where the site has no packs of its own", async () => {
    const env = openSite({ ASSETS: assets(() => null) });
    const r = await browser(env)("/api/outboard/items");
    expect(r.status).toBe(200);
    expect(r.data).toEqual([]);
  });
});

describe("Talkback on the day it opens", () => {
  it("has the crew's threads, each answered, the pinned ones first in their community", async () => {
    const env = openSite();
    const anyone = browser(env);
    const all = (await anyone("/api/talkback/posts?sort=new")).data as { id: string; answer: string | null; pinned: number; community: string }[];
    expect(all).toHaveLength(SEED_THREADS.length);
    for (const p of all) expect(p.answer).toBe(`${p.id}-a`);

    const karaoke = (await anyone("/api/talkback/posts?c=karaoke&sort=new")).data as { id: string; pinned: number }[];
    expect(karaoke[0]).toMatchObject({ id: "crew-first-karaoke-night", pinned: 1 });
    expect(karaoke.slice(1).every((p) => p.pinned === 0)).toBe(true);

    const thread = (await anyone("/api/talkback/posts/crew-guide-vocal")).data;
    expect(thread.post.answer).toBe("crew-guide-vocal-a");
    expect(thread.comments[0]).toMatchObject({ id: "crew-guide-vocal-a", author: "djmanzo crew" });
    expect((await anyone("/api/talkback")).data.communities.find((c: { id: string }) => c.id === "karaoke").posts).toBe(
      SEED_THREADS.filter((t) => t.community === "karaoke").length,
    );
  });

  it("is found by search, so the next person finds the answer before asking", async () => {
    const env = openSite();
    const found = (await browser(env)("/api/talkback/posts?q=original%20voice")).data as { id: string }[];
    expect(found.map((p) => p.id)).toContain("crew-guide-vocal");
  });

  it("keeps a thread's votes and replies when its words are brought up to date", async () => {
    const env = openSite();
    const anyone = browser(env);
    await anyone("/api/talkback");
    const member = await person(env, "Member", 90);
    await member.call("/api/talkback/vote", { method: "POST", json: { kind: "post", id: "crew-camelot", value: 1 } });
    await member.call("/api/talkback/posts/crew-camelot/comments", { method: "POST", json: { body: "Thanks, this helped." } });

    const thread = SEED_THREADS.find((t) => t.slug === "camelot")!;
    const before = thread.answer;
    thread.answer = `${before}\n\nOne more thing.`;
    try {
      await seedThreads((env as never) as Parameters<typeof seedThreads>[0]);
    } finally {
      thread.answer = before;
    }
    const after = (await anyone("/api/talkback/posts/crew-camelot")).data;
    expect(after.post.score).toBe(1);
    expect(after.comments).toHaveLength(2);
    expect(after.comments.find((c: { id: string }) => c.id === "crew-camelot-a").body).toMatch(/One more thing\.$/);
  });
});

/** Someone whose first post the crew has kept: a member, whose posts go up at once. */
async function member(env: never, name: string) {
  const p = await person(env, name, 30);
  const first = await p.call("/api/talkback/posts", { method: "POST", json: { community: "mixing", title: `${name} says hello`, body: "Glad to be here." } });
  await crew(env)("/api/admin/crew/decide", { method: "POST", json: { kind: "post", target: first.data.id, keep: true } });
  return p;
}

describe("the answer to a question", () => {
  it("is said by whoever asked, or the crew, and by nobody else", async () => {
    const env = openSite() as never;
    const asker = await member(env, "Asker");
    const other = await member(env, "Other");
    const asked = await asker.call("/api/talkback/posts", { method: "POST", json: { community: "help", title: "How do I loop a vocal?", body: "Asking.", flair: "question" } });
    const id = asked.data.id as string;
    const reply = async (who: typeof asker, body: string) => {
      await who.call(`/api/talkback/posts/${id}/comments`, { method: "POST", json: { body } });
      const t = (await who.call(`/api/talkback/posts/${id}`)).data;
      return t.comments.at(-1).id as string;
    };
    const first = await reply(other, "Press loop.");
    const second = await reply(other, "Space d l loops four beats.");

    expect((await other.call(`/api/talkback/posts/${id}/answer`, { method: "POST", json: { comment: second } })).status).toBe(403);
    expect((await asker.call(`/api/talkback/posts/${id}/answer`, { method: "POST", json: { comment: "nope" } })).status).toBe(404);
    expect((await asker.call(`/api/talkback/posts/${id}/answer`, { method: "POST", json: { comment: second } })).data).toEqual({ id, answer: second });
    expect((await browser(env)(`/api/talkback/posts/${id}`)).data.post.answer).toBe(second);
    expect((await crew(env)(`/api/talkback/posts/${id}/answer`, { method: "POST", json: { comment: first } })).data.answer).toBe(first);
    expect((await asker.call(`/api/talkback/posts/${id}/answer`, { method: "POST", json: { comment: null } })).data.answer).toBeNull();
  });
});
