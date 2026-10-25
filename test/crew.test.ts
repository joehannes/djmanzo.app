import { describe, expect, it } from "vitest";
import { findOrCreate } from "../worker/auth";
import { put } from "../worker/store";
import { browser, openSite, person } from "./people";

describe("the way into Backstage", () => {
  it("is the owner's own GitHub account, by its id: no token or password first", async () => {
    const env = openSite({ ADMIN_TOKEN: "" });
    const owner = await person(env, "Johannes");
    const other = await person(env, "Lena");
    (env as unknown as { ADMIN_GITHUB_IDS: string }).ADMIN_GITHUB_IDS = owner.user.identities[0].sub;
    expect((await owner.call("/api/me")).data.admin).toBe(true);
    expect((await owner.call("/api/admin/password")).status).toBe(200);
    expect((await other.call("/api/me")).data.admin).toBe(false);
    expect((await other.call("/api/admin/password")).status).toBe(403);
  });

  it("is not another provider's account that happens to carry the same number", async () => {
    const env = openSite({ ADMIN_TOKEN: "", ADMIN_GITHUB_IDS: "4242" });
    const kv = (env as unknown as { KV: KVNamespace }).KV;
    const u = await findOrCreate(env, "google", { sub: "4242", email: "someone@example.test", verified: true, name: "Someone", avatar: null });
    await put(kv, "session:sid-google", { uid: u.id, createdAt: Date.now() });
    const call = browser(env, "djm_sid=sid-google");
    expect((await call("/api/me")).data.admin).toBe(false);
    expect((await call("/api/admin/password")).status).toBe(403);
  });
});

describe("the owner's own address", () => {
  it("opens Backstage by its SHA-256, when a provider vouched for it", async () => {
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("owner@example.test")))].map((b) => b.toString(16).padStart(2, "0")).join("");
    const env = openSite({ ADMIN_TOKEN: "", ADMIN_EMAIL_HASHES: hash });
    const kv = (env as unknown as { KV: KVNamespace }).KV;
    const vouched = await findOrCreate(env, "google", { sub: "g-1", email: "Owner@Example.test", verified: true, name: "Owner", avatar: null });
    await put(kv, "session:sid-g1", { uid: vouched.id, createdAt: Date.now() });
    expect((await browser(env, "djm_sid=sid-g1")("/api/me")).data.admin).toBe(true);
    // The same address, unconfirmed by its provider, is not the owner.
    const claimed = await findOrCreate(env, "microsoft", { sub: "m-1", email: "owner@example.test", verified: false, name: "Someone", avatar: null });
    await put(kv, "session:sid-m1", { uid: claimed.id, createdAt: Date.now() });
    expect((await browser(env, "djm_sid=sid-m1")("/api/me")).data.admin).toBe(false);
  });

  it("/admin leads to /backstage, which is a page of this site that no search engine lists", async () => {
    const env = openSite({ ASSETS: { fetch: async () => new Response('<html lang="en"><head><!--seo--><!--/seo--></head><body><div id="app"></div></body></html>') } });
    const admin = await browser(env)("/admin");
    expect(admin.status).toBe(302);
    expect(admin.res.headers.get("location")).toBe("https://djmanzo.test/backstage");
    const page = await browser(env)("/backstage");
    expect(page.status).toBe(200);
    expect(page.res.headers.get("x-robots-tag")).toBe("noindex");
    expect(await page.res.text()).toContain("<h1>Backstage</h1>");
  });
});
