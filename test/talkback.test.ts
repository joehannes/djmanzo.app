import { describe, expect, it } from "vitest";
import { hot, trustLevel } from "../shared/talkback";
import { post } from "../worker/talkback";
import type { Screen } from "../worker/moderation";
import { browser, crew, openSite, person } from "./people";

const write = (call: ReturnType<typeof browser>, json: Record<string, unknown>) => call("/api/talkback/posts", { method: "POST", json: { community: "mixing", ...json } });

/** A member: past their first days, with a post the crew has let through. */
async function member(env: never, name: string) {
  const p = await person(env, name, 30);
  const first = await write(p.call, { title: `${name} says hello`, body: "Glad to be here." });
  await crew(env)("/api/admin/crew/decide", { method: "POST", json: { kind: "post", target: first.data.id, keep: true } });
  return p;
}

describe("a new account grows into Talkback", () => {
  it("posts without links at first, and its posts wait for the crew when nothing has read them", async () => {
    const env = openSite();
    const fresh = await person(env, "Fresh", 0);
    const link = await write(fresh.call, { title: "My mix", body: "Listen at https://example.test/mix" });
    expect(link.status).toBe(403);
    expect(link.data.error).toMatch(/without links/);
    // No key, so no screen: the crew reads it first.
    const held = await write(fresh.call, { title: "Hello from Linz", body: "First gig next week." });
    expect(held.data).toMatchObject({ status: "held" });
    // Its author sees it; nobody else does.
    expect((await fresh.call("/api/talkback/posts")).data.map((p: { id: string }) => p.id)).toEqual([held.data.id]);
    expect((await browser(env)("/api/talkback/posts")).data).toEqual([]);
    expect((await browser(env)(`/api/talkback/posts/${held.data.id}`)).status).toBe(404);
  });

  it("is let through at once when the screen allows it, and held with its reason when it hesitates", async () => {
    const env = openSite({ AI_PROVIDER: "claude", ANTHROPIC_API_KEY: "k" }) as never;
    const fresh = await person(env, "Fresh", 0);
    const allow: Screen = async () => ({ verdict: "allow", rule: "", reason: "On topic." });
    const hold: Screen = async () => ({ verdict: "hold", rule: "5", reason: "It reads as an advertisement." });
    const req = new Request("https://djmanzo.test/");
    expect(await post(env, req, fresh.user, { community: "mixing", title: "Echo out or cut?", body: "Which do you use?" }, allow)).toMatchObject({ status: "live" });
    expect(await post(env, req, fresh.user, { community: "mixing", title: "Buy my plugin", body: "Cheap!" }, hold)).toMatchObject({ status: "held", note: "It reads as an advertisement." });
  });

  it("writes a few posts a day at first", async () => {
    const env = openSite();
    const fresh = await person(env, "Fresh", 0);
    for (let i = 0; i < 3; i++) expect((await write(fresh.call, { title: `Question ${i}`, body: "?" })).status).toBe(200);
    const fourth = await write(fresh.call, { title: "Question 3", body: "?" });
    expect(fourth.status).toBe(429);
    expect(fourth.data.error).toMatch(/New accounts post 3 times a day/);
  });

  it("is a member after three days and a read post, a regular with karma", () => {
    expect(trustLevel(86_400_000, 5, 100)).toBe(0);
    expect(trustLevel(4 * 86_400_000, 0, 100)).toBe(0);
    expect(trustLevel(4 * 86_400_000, 1, 0)).toBe(1);
    expect(trustLevel(4 * 86_400_000, 1, 20)).toBe(2);
  });
});

describe("posts, comments and votes", () => {
  it("counts one vote an account, takes it back, and refuses one's own", async () => {
    const env = openSite();
    const ana = await member(env, "Ana");
    const ben = await member(env, "Ben");
    const p = await write(ana.call, { title: "Phrasing on the mambo", body: "Count eight bars, then bring it in." });
    const vote = (who: typeof ana, value: number) => who.call("/api/talkback/vote", { method: "POST", json: { kind: "post", id: p.data.id, value } });
    expect((await vote(ana, 1)).status).toBe(400);
    expect((await vote(ben, 1)).data.score).toBe(1);
    expect((await vote(ben, 1)).data.score).toBe(1);
    expect((await vote(ben, -1)).data.score).toBe(-1);
    expect((await vote(ben, 0)).data.score).toBe(0);
  });

  it("sorts hot by votes and time, new by time, and finds posts by their words", async () => {
    const env = openSite();
    const ana = await member(env, "Ana");
    const voters = await Promise.all(["B", "C", "D"].map((n) => member(env, `Voter ${n}`)));
    const older = await write(ana.call, { title: "Harmonic mixing basics", body: "The Camelot wheel, explained." });
    const newer = await write(ana.call, { title: "Echo out", body: "A delay on the outgoing record." });
    for (const v of voters) await v.call("/api/talkback/vote", { method: "POST", json: { kind: "post", id: older.data.id, value: 1 } });
    const ids = async (q: string) => (await browser(env)(`/api/talkback/posts?c=mixing&${q}`)).data.map((p: { id: string }) => p.id);
    expect((await ids("sort=hot"))[0]).toBe(older.data.id);
    expect((await ids("sort=new"))[0]).toBe(newer.data.id);
    expect(await ids("q=camelot")).toEqual([older.data.id]);
    expect(hot(10, 0)).toBeGreaterThan(hot(1, 0));
    expect(hot(1, 45_000_000)).toBeGreaterThan(hot(1, 0));
  });

  it("threads comments no deeper than six", async () => {
    const env = openSite();
    const ana = await member(env, "Ana");
    const p = await write(ana.call, { title: "Long thread", body: "Reply to the reply." });
    let parent: string | null = null;
    let depth = 0;
    for (let i = 0; i < 8; i++) {
      const c = await ana.call(`/api/talkback/posts/${p.data.id}/comments`, { method: "POST", json: { body: `Reply ${i}`, parent } });
      ({ depth } = c.data);
      parent = c.data.id;
    }
    expect(depth).toBe(6);
    const thread = (await browser(env)(`/api/talkback/posts/${p.data.id}`)).data;
    expect(thread.comments).toHaveLength(8);
    expect(thread.post.comments).toBe(8);
  });
});

describe("reports, the crew, and the wishlist", () => {
  it("holds a post three people report, and removes it only with a reason its author is told", async () => {
    const env = openSite();
    const ana = await member(env, "Ana");
    const p = await write(ana.call, { title: "Questionable", body: "Something." });
    for (const n of ["X", "Y", "Z"]) {
      const r = await member(env, `Reporter ${n}`);
      await r.call("/api/report", { method: "POST", json: { kind: "post", target: p.data.id, reason: "It is an advertisement." } });
    }
    expect((await browser(env)("/api/talkback/posts")).data.find((x: { id: string }) => x.id === p.data.id)).toBeUndefined();
    const queue = (await crew(env)("/api/admin/crew")).data;
    expect(queue.reports[0]).toMatchObject({ kind: "post", target: p.data.id, reports: 3 });
    expect((await crew(env)("/api/admin/crew/decide", { method: "POST", json: { kind: "post", target: p.data.id, keep: false, reason: "x" } })).status).toBe(400);
    await crew(env)("/api/admin/crew/decide", { method: "POST", json: { kind: "post", target: p.data.id, keep: false, reason: "Advertising unrelated to DJing (rule 5)." } });
    const told = (await ana.call("/api/me/notices")).data;
    expect(told.map((t: { reason: string }) => t.reason)).toContain("Advertising unrelated to DJing (rule 5).");
    const shown = (await ana.call(`/api/talkback/posts/${p.data.id}`)).data.post;
    expect(shown).toMatchObject({ title: "Removed", body: "", removed: true });
  });

  it("carries a proposal to the wishlist, with a link back", async () => {
    const env = openSite();
    const ana = await member(env, "Ana");
    const p = await write(ana.call, { community: "proposals", title: "Rekordbox playlist sync", body: "Keep playlists in step both ways.", flair: "proposal" });
    const r = await crew(env)("/api/admin/talkback/promote", { method: "POST", json: { id: p.data.id } });
    const wish = (await browser(env)(`/api/wishes/${r.data.wish}`)).data;
    expect(wish.title).toBe("Rekordbox playlist sync");
    expect(wish.body).toContain(`https://djmanzo.test/talkback/${p.data.id}`);
    expect((await crew(env)("/api/admin/talkback/promote", { method: "POST", json: { id: p.data.id } })).status).toBe(409);
  });
});
