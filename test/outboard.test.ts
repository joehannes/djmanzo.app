import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bayesian, donationLink } from "../shared/outboard";
import { packId } from "../worker/market";
import { memoryD1 } from "./d1";
import { testEnv } from "./kv";
import { browser, crew, openSite, person } from "./people";

const fixture = (name: string) => new Uint8Array(readFileSync(new URL(`./fixtures/packs/${name}.djpack`, import.meta.url)));
const upload = (call: ReturnType<typeof browser>, name: string, changelog = "") =>
  call(`/api/outboard/upload?changelog=${encodeURIComponent(changelog)}`, { method: "POST", body: fixture(name), headers: { "content-type": "application/zip" } });

describe("who may add to Outboard", () => {
  it("is nobody until the site has an imprint, and nobody with uploads until R2 is there", async () => {
    const noImprint = testEnv({ DB: memoryD1() });
    const maker = await person(noImprint, "Maker");
    const shut = await upload(maker.call, "good-theme");
    expect(shut.status).toBe(403);
    expect(shut.data.error).toMatch(/imprint is filled in/);

    const noR2 = openSite({ MEDIA: undefined });
    const later = await person(noR2, "Maker");
    const r = await upload(later.call, "good-theme");
    expect(r.status).toBe(503);
    expect(r.data.error).toMatch(/R2 is enabled/);
    // Browsing works either way.
    expect((await browser(noR2)("/api/outboard/items")).status).toBe(200);
  });

  it("is not the demo sign-in: a person stands behind every upload", async () => {
    const env = openSite();
    const web = browser(env);
    const signIn = await web("/api/auth/demo", { method: "POST", json: { name: "Demo" } });
    const cookie = signIn.res.headers.get("set-cookie")!.split(";")[0];
    const r = await upload(browser(env, cookie), "good-theme");
    expect(r.status).toBe(403);
    expect(r.data.error).toMatch(/demo sign-in cannot/);
  });
});

describe("a pack, from upload to djmanzo's index", () => {
  it("is checked, waits for the crew, is listed, and installs from packs.json byte for byte", async () => {
    const env = openSite();
    const maker = await person(env, "Moss Maker");
    const up = await upload(maker.call, "good-theme", "The first.");
    expect(up.status).toBe(200);
    expect(up.data).toMatchObject({ status: "pending" });
    const id = up.data.id as string;

    // Not shown until the crew has looked.
    const anyone = browser(env);
    expect((await anyone("/api/outboard/items")).data).toEqual([]);
    expect((await anyone("/api/outboard/packs.json")).data.packs).toEqual([]);
    expect((await anyone(`/api/outboard/items/${id}`)).status).toBe(404);
    // Its maker sees it waiting.
    expect((await maker.call(`/api/outboard/items/${id}`)).data.status).toBe("pending");

    const queue = await crew(env)("/api/admin/outboard/queue");
    expect(queue.data).toHaveLength(1);
    expect(queue.data[0].preview.dark["--bg"]).toBeTruthy();
    expect((await crew(env)("/api/admin/outboard/review", { method: "POST", json: { id, version: "1.0", approve: true } })).data.status).toBe("listed");

    const listed = (await anyone("/api/outboard/items?kind=theme")).data;
    expect(listed.map((x: { name: string }) => x.name)).toEqual(["Moss"]);
    expect(listed[0].preview.base).toBe("pkg-organic");

    const index = (await anyone("/api/outboard/packs.json")).data;
    expect(index.format).toBe(1);
    expect(index.packs[0]).toMatchObject({ name: "Moss", version: "1.0", kind: "theme", key: up.data.fingerprint });
    const file = await maker.call(new URL(index.packs[0].url).pathname);
    expect(file.status).toBe(200);
    expect(new Uint8Array(await file.res.arrayBuffer())).toEqual(fixture("good-theme"));
    expect((await maker.call(`/api/outboard/items/${id}`)).data.downloaded).toBe(true);
  });

  it("refuses what djmanzo would refuse, in djmanzo's words", async () => {
    const env = openSite();
    const maker = await person(env, "Maker");
    const r = await upload(maker.call, "low-contrast");
    expect(r.status).toBe(400);
    expect(r.data.error).toBe("djmanzo would not install it: Moss's dark --text on --bg has a contrast of 1.1, and needs 4.5.");
  });

  it("keeps a name with its key and a version once", async () => {
    const env = openSite() as never as { DB: D1Database };
    const maker = await person(env as never, "Maker");
    const first = await upload(maker.call, "good-skin");
    expect(first.status).toBe(200);
    expect((await upload(maker.call, "good-skin")).data.error).toMatch(/Version 1.0 of "Dots" is already uploaded/);
    // As if the name had been listed under another key first.
    await env.DB.prepare("UPDATE items SET fingerprint = 'aaaa bbbb cccc dddd'").run();
    const clash = await upload(maker.call, "good-skin");
    expect(clash.status).toBe(409);
    expect(clash.data.error).toMatch(/under another key/);
  });

  it("names a pack as djmanzo names its folder", () => {
    expect(packId("Neon Nights!", "0a1b 2c3d 4e5f 6789")).toBe("neon-nights-0a1b2c3d");
    expect(packId("  ", "0a1b 2c3d 4e5f 6789")).toBe("pack-0a1b2c3d");
  });
});

describe("ratings, removal and makers' pages", () => {
  async function listedTheme() {
    const env = openSite();
    const maker = await person(env, "Maker");
    const { data } = await upload(maker.call, "good-theme");
    await crew(env)("/api/admin/outboard/review", { method: "POST", json: { id: data.id, version: "1.0", approve: true } });
    return { env, maker, id: data.id as string };
  }

  it("takes one rating an account, never the maker's own, and sorts by the leaning mean", async () => {
    const { env, maker, id } = await listedTheme();
    expect((await maker.call(`/api/outboard/items/${id}/rating`, { method: "POST", json: { stars: 5 } })).status).toBe(403);
    const fan = await person(env, "Fan");
    await fan.call(`/api/outboard/items/${id}/rating`, { method: "POST", json: { stars: 2 } });
    const again = await fan.call(`/api/outboard/items/${id}/rating`, { method: "POST", json: { stars: 5, review: "Lovely in daylight." } });
    expect(again.data.rating).toEqual({ mean: 5, score: bayesian(5, 1), count: 1 });
    expect(again.data.reviews[0]).toMatchObject({ stars: 5, review: "Lovely in daylight." });
    // Three fives do not outrank two hundred fours.
    expect(bayesian(15, 3)).toBeLessThan(bayesian(800, 200));
  });

  it("is removed only with a reason, which its maker is told", async () => {
    const { env, maker, id } = await listedTheme();
    expect((await crew(env)("/api/admin/outboard/remove", { method: "POST", json: { id, reason: "no" } })).status).toBe(400);
    await crew(env)("/api/admin/outboard/remove", { method: "POST", json: { id, reason: "It copies another maker's theme without their licence." } });
    expect((await browser(env)("/api/outboard/items")).data).toEqual([]);
    const told = (await maker.call("/api/me/notices")).data;
    expect(told[0]).toMatchObject({ kind: "item", target: id, reason: "It copies another maker's theme without their licence." });
    expect((await maker.call(`/api/me/notices/${told[0].id}/appeal`, { method: "POST", json: { text: "I made both: here is the original." } })).status).toBe(200);
    expect((await crew(env)("/api/admin/crew")).data.appeals).toHaveLength(1);
  });

  it("links only to official donation pages", async () => {
    const env = openSite();
    const maker = await person(env, "Maker");
    const ok = await maker.call("/api/outboard/profile", { method: "PUT", json: { about: "Themes for small rooms.", links: ["https://ko-fi.com/maker", "https://github.com/sponsors/maker"] } });
    expect(ok.data.links).toEqual([
      { url: "https://ko-fi.com/maker", platform: "Ko-fi" },
      { url: "https://github.com/sponsors/maker", platform: "GitHub Sponsors" },
    ]);
    for (const bad of ["https://evil.example/ko-fi.com/maker", "http://ko-fi.com/maker", "javascript:alert(1)", "https://ko-fi.com.evil.example/x", "https://user:pw@ko-fi.com/maker", "https://github.com/maker"])
      expect((await maker.call("/api/outboard/profile", { method: "PUT", json: { links: [bad] } })).status, bad).toBe(400);
    expect(donationLink("https://www.patreon.com/maker?ref=x#y")).toEqual({ url: "https://www.patreon.com/maker", platform: "Patreon" });
  });
});
