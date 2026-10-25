import { describe, expect, it } from "vitest";
import { handle } from "../worker/index";
import { quote } from "../worker/checkout";
import type { User } from "../worker/store";
import { testEnv } from "./kv";
import { afterEach, vi } from "vitest";

const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

function client(env: never) {
  let cookie = "";
  return async (path: string, init: RequestInit & { json?: unknown } = {}): Promise<{ status: number; data: any; location: string | null }> => {
    const headers = new Headers(init.headers);
    if (cookie) headers.set("cookie", cookie);
    if (init.json !== undefined) headers.set("content-type", "application/json");
    const req = new Request(`https://djmanzo.test${path}`, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body });
    const res = await handle(req, env, exec);
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    const text = await res.text();
    return { status: res.status, data: text ? JSON.parse(text) : null, location: res.headers.get("location") };
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("a visitor buys a licence and djmanzo picks it up", () => {
  it("demo sign-in, a regional quote, a proven purchase", async () => {
    const env = testEnv();
    const web = client(env);
    expect((await web("/api/me")).data).toMatchObject({ user: null, demo: true });

    const signin = await web("/api/auth/demo", { method: "POST", json: { name: "Yolanda" } });
    expect(signin.status).toBe(200);

    const q = await web("/api/quote", { method: "POST", json: { edition: "karaoke", plan: "yearly", country: "DO" } });
    expect(q.data.band).toBe(2);
    expect(q.data.by).toBe("region");
    expect(q.data.total).toBeLessThan(q.data.base);

    // The card says the US: the Dominican price is not backed, and the buyer is asked again.
    const refused = await web("/api/checkout/demo", { method: "POST", json: { edition: "karaoke", plan: "yearly", country: "DO", instrument: "US", billing: "DO" } });
    expect(refused.status).toBe(409);
    expect(refused.data.needsConfirm).toBe(true);
    expect(refused.data.total).toBe(q.data.base);

    const bought = await web("/api/checkout/demo", { method: "POST", json: { edition: "karaoke", plan: "yearly", country: "DO", instrument: "DO", billing: "DO" } });
    expect(bought.status).toBe(200);
    expect(bought.data.order.total).toBe(q.data.total);
    expect(bought.data.licence).toMatchObject({ edition: "karaoke", plan: "yearly", demo: true });
    // A demo purchase is not a licence for djmanzo.
    expect((await web("/api/me/licence-line")).data.refused).toMatch(/Google, Apple, GitHub/);
  });

  it("the Hobbyist edition is free, and not sold", async () => {
    const web = client(testEnv());
    await web("/api/auth/demo", { method: "POST", json: { name: "Ana" } });
    expect((await web("/api/quote", { method: "POST", json: { edition: "hobbyist", plan: "perpetual", country: "US" } })).data.error).toMatch(/free, for ever/);
  });

  it("a promo code and a voucher", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const admin = client(env);
    const crew = { authorization: "Bearer crew-secret" };
    const made = await admin("/api/admin/promos", { method: "POST", headers: crew, json: { kind: "percent", value: 50, code: "MERENGUE50", maxUses: 10 } });
    expect(made.data.codes[0].code).toBe("MERENGUE50");
    const v = await admin("/api/admin/promos", { method: "POST", headers: crew, json: { kind: "voucher", grants: { edition: "pro", plan: "monthly", months: 3 }, count: 2, prefix: "GIFT" } });
    expect(v.data.made).toBe(2);

    const web = client(env);
    await web("/api/auth/demo", { method: "POST", json: { name: "Rafa" } });
    const q = await web("/api/quote", { method: "POST", json: { edition: "pro", plan: "perpetual", promo: "merengue50", country: "US" } });
    expect(q.data.promo.ok).toBe(true);
    expect(q.data.total).toBe(q.data.regional - Math.round(q.data.regional / 2));

    const r = await web("/api/redeem", { method: "POST", json: { code: v.data.codes[0].code } });
    expect(r.status).toBe(200);
    expect(r.data.licence.edition).toBe("pro");
    const months = (r.data.licence.expires - Date.now()) / 86400_000;
    expect(months).toBeGreaterThan(88);
    expect(months).toBeLessThan(96);
    expect((await web("/api/redeem", { method: "POST", json: { code: v.data.codes[0].code } })).status).toBe(400);
  });

  it("a trial is seven days of any edition, once per account", async () => {
    const env = testEnv();
    const web = client(env);
    await web("/api/auth/demo", { method: "POST", json: { name: "Mabel" } });
    expect((await web("/api/trial", { method: "POST", json: { edition: "custom" } })).status).toBe(400);
    const t = await web("/api/trial", { method: "POST", json: { edition: "full" } });
    expect(t.status).toBe(200);
    expect(t.data.licence).toMatchObject({ edition: "full", plan: "trial" });
    const days = (t.data.licence.expires - Date.now()) / 86400_000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThanOrEqual(7);
    const again = await web("/api/trial", { method: "POST", json: { edition: "karaoke" } });
    expect(again.status).toBe(409);
    expect((await web("/api/trial")).data.had.edition).toBe("full");
  });

  it("an upgrade costs the difference, and only towards an edition that carries everything held", async () => {
    const env = testEnv();
    const web = client(env);
    await web("/api/auth/demo", { method: "POST", json: { name: "Rosa" } });
    const kar = await web("/api/checkout/demo", { method: "POST", json: { edition: "karaoke", plan: "perpetual", country: "US", instrument: "US", billing: "US" } });
    expect(kar.data.order.total).toBe(5500);
    // Karaoke is inside Full, not inside Pro DJ: an upgrade to Pro DJ pays in full.
    const pro = await web("/api/quote", { method: "POST", json: { edition: "pro", plan: "perpetual", country: "US" } });
    expect(pro.data.upgrade).toBeNull();
    expect(pro.data.total).toBe(11900);
    const full = await web("/api/quote", { method: "POST", json: { edition: "full", plan: "perpetual", country: "US" } });
    expect(full.data.upgrade.edition).toBe("karaoke");
    expect(full.data.total).toBe(14900 - 5500);
    // Subscriptions are not upgrades.
    expect((await web("/api/quote", { method: "POST", json: { edition: "full", plan: "monthly", country: "US" } })).data.upgrade).toBeNull();
    const bought = await web("/api/checkout/demo", { method: "POST", json: { edition: "full", plan: "perpetual", country: "US", instrument: "US", billing: "US" } });
    expect(bought.data.order.upgrade.credit).toBe(5500);
    // The licence it was priced against is folded into the new one.
    const lics = await web("/api/me/licences");
    expect(lics.data.find((l: { edition: string }) => l.edition === "karaoke").status).toBe("upgraded");
  });

  it("Custom is priced by its modules alone and points at an edition that costs no more", async () => {
    const env = testEnv();
    const web = client(env);
    expect((await web("/api/quote", { method: "POST", json: { edition: "custom", plan: "perpetual", country: "US", modules: [] } })).status).toBe(400);
    const q = await web("/api/quote", { method: "POST", json: { edition: "custom", plan: "perpetual", country: "US", modules: ["dvs", "stems", "nonsense"] } });
    expect(q.data.modules).toEqual(["stems", "dvs"]);
    expect(q.data.total).toBe(2500 + 1000);
    expect(q.data.better).toBeNull();
    const ap = await web("/api/quote", { method: "POST", json: { edition: "custom", plan: "perpetual", country: "US", modules: ["autopilot"] } });
    expect(ap.data.better).toBe("autopilot");
  });

  it("djmanzo signs in through the site, as the application's protocol has it, and gets what the shop sold", async () => {
    const env = testEnv({ GITHUB_CLIENT_ID: "gh-id", GITHUB_CLIENT_SECRET: "gh-secret", ADMIN_TOKEN: "crew-secret" });
    // GitHub, played here: a token for any code, and Lena with a verified address.
    vi.stubGlobal("fetch", async (url: string) => {
      const u = String(url);
      if (u.startsWith("https://github.com/login/oauth/access_token")) return Response.json({ access_token: "gh-token" });
      if (u === "https://api.github.com/user") return Response.json({ id: 583231, login: "lena", name: "Lena" });
      if (u === "https://api.github.com/user/emails") return Response.json([{ email: "lena@example.com", primary: true, verified: true }]);
      throw new Error(`unexpected fetch ${u}`);
    });
    const app = client(env);
    const verifier = "v".repeat(20) + "erifier-0123456789-abcdefghij";
    const challenge = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const state = "state-0123456789abcdef";
    async function signIn() {
      expect((await app(`/login/github?state=${state}&code_challenge=${challenge}&port=80`)).status).toBe(400);
      const login = await app(`/login/github?state=${state}&code_challenge=${challenge}&port=53682`);
      const to = new URL(login.location!);
      expect(to.origin + to.pathname).toBe("https://github.com/login/oauth/authorize");
      expect(to.searchParams.get("redirect_uri")).toBe("https://djmanzo.test/callback/github");
      expect(to.searchParams.get("state")).toBe(state);
      const back = new URL((await app(`/callback/github?code=gh-code&state=${state}`)).location!);
      expect(back.origin).toBe("http://127.0.0.1:53682");
      expect(back.searchParams.get("state")).toBe(state);
      return back.searchParams.get("code")!;
    }

    // Nothing bought yet: djmanzo is told so, and keeps its sign-in for later.
    const first = await app("/licence", { method: "POST", json: { code: await signIn(), verifier } });
    expect(first.data).toMatchObject({ refused: "this account has no licence yet", account: "github:583231" });
    // A grant is good once, and only with the verifier that made its challenge.
    const code = await signIn();
    expect((await app("/licence", { method: "POST", json: { code, verifier: "wrong" } })).status).toBe(400);
    expect((await app("/licence", { method: "POST", json: { code, verifier } })).status).toBe(400);

    // Lena buys three months of Pro DJ in the browser, signed in with the same GitHub account.
    const crew = client(env);
    const v = await crew("/api/admin/promos", { method: "POST", headers: { authorization: "Bearer crew-secret" }, json: { kind: "voucher", grants: { edition: "pro", plan: "monthly", months: 3 }, count: 1, prefix: "GIFT" } });
    const web = client(env);
    const to = new URL((await web("/auth/start/github")).location!);
    await web(`/callback/github?code=web-code&state=${to.searchParams.get("state")}`);
    expect((await web("/api/me")).data.user.name).toBe("Lena");
    expect((await web("/api/redeem", { method: "POST", json: { code: v.data.codes[0].code } })).status).toBe(200);

    // djmanzo renews in the background and gets Pro DJ, dated to the end of what was paid.
    const renewed = await app("/renew", { method: "POST", json: { renew: first.data.renew } });
    const [, body] = renewed.data.licence.split(".");
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))));
    expect(payload).toMatchObject({ v: 1, account: "github:583231", edition: "pro" });
    expect(payload.paid_until).toBeGreaterThan(Date.now() / 1000 + 85 * 86400);
    // Signed with the development key here, as no key is set: the key a debug djmanzo believes (dj_app::licence::DEV_KEY).
    const raw = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const devPublic = await crypto.subtle.importKey("raw", raw("twAB0cH0SC2jfnUNk8epDhSWQAXvQhymLQcLAkwr9r4="), { name: "Ed25519" }, false, ["verify"]);
    const [, b64, sig] = renewed.data.licence.split(".");
    expect(await crypto.subtle.verify({ name: "Ed25519" }, devPublic, raw(sig), raw(b64))).toBe(true);
    // The same line is there to paste, for a computer that cannot sign in.
    expect((await web("/api/me/licence-line")).data).toMatchObject({ account: "github:583231" });
    // Signing out forgets the renewal token.
    await app("/signout", { method: "POST", json: { renew: first.data.renew } });
    expect((await app("/renew", { method: "POST", json: { renew: first.data.renew } })).status).toBe(401);
  });

  it("a licence is activated on at most three computers; one removed on the account page is told so when it renews", async () => {
    const env = testEnv({ GITHUB_CLIENT_ID: "gh-id", GITHUB_CLIENT_SECRET: "gh-secret", GOOGLE_CLIENT_ID: "g-id", GOOGLE_CLIENT_SECRET: "g-secret" });
    // GitHub and Google, played here: the same person, the same verified address.
    vi.stubGlobal("fetch", async (url: string) => {
      const u = String(url);
      if (u.startsWith("https://github.com/login/oauth/access_token")) return Response.json({ access_token: "gh-token" });
      if (u === "https://api.github.com/user") return Response.json({ id: 583231, login: "lena", name: "Lena" });
      if (u === "https://api.github.com/user/emails") return Response.json([{ email: "lena@example.com", primary: true, verified: true }]);
      if (u.startsWith("https://oauth2.googleapis.com/token")) return Response.json({ access_token: "g-token" });
      if (u.startsWith("https://openidconnect.googleapis.com/v1/userinfo") || u.startsWith("https://www.googleapis.com/oauth2")) return Response.json({ sub: "g-77", email: "lena@example.com", email_verified: true, name: "Lena" });
      throw new Error(`unexpected fetch ${u}`);
    });
    const app = client(env);
    const verifier = "v".repeat(20) + "erifier-0123456789-abcdefghij";
    const challenge = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const state = "state-0123456789abcdef";
    async function signIn(provider: string, device: string, name: string) {
      await app(`/login/${provider}?state=${state}&code_challenge=${challenge}&port=53682`);
      const code = new URL((await app(`/callback/${provider}?code=c&state=${state}`)).location!).searchParams.get("code")!;
      return app("/licence", { method: "POST", json: { code, verifier, device: { id: device, name, os: "linux" } } });
    }
    const studio = await signIn("github", "studio-laptop-0001", "Studio laptop");
    const booth = await signIn("github", "booth-machine-0002", "Booth");
    // The same person through Google, with the same verified address: the same account, a third computer.
    const home = await signIn("google", "home-desktop-00003", "Home");
    for (const r of [studio, booth, home]) expect(r.data.renew, JSON.stringify(r.data)).toBeTruthy();
    // A fourth is refused, and says where to make room.
    const fourth = await signIn("github", "friends-laptop-004", "A friend's laptop");
    expect(fourth.status).toBe(409);
    expect(fourth.data.refused).toMatch(/account page/);
    // Signing in again on a computer already activated uses its own place, and its old token stops working.
    const again = await signIn("github", "studio-laptop-0001", "Studio laptop");
    expect(again.data.renew).toBeTruthy();
    expect((await app("/renew", { method: "POST", json: { renew: studio.data.renew } })).data.revoked).toBe(true);

    // On the website, signed in with GitHub: three computers, and one removed.
    const web = client(env);
    const to = new URL((await web("/auth/start/github")).location!);
    await web(`/callback/github?code=web&state=${to.searchParams.get("state")}`);
    const mine = await web("/api/me/activations");
    expect(mine.data.most).toBe(3);
    expect(mine.data.activations.map((a: { name: string }) => a.name).sort()).toEqual(["Booth", "Home", "Studio laptop"]);
    expect(JSON.stringify(mine.data)).not.toMatch(/renew/);
    const booths = mine.data.activations.find((a: { name: string }) => a.name === "Booth").id;
    expect((await web(`/api/me/activations/${booths}`, { method: "DELETE" })).data.activations).toHaveLength(2);
    // The booth's djmanzo, next time it is online, is told its activation was removed.
    const told = await app("/renew", { method: "POST", json: { renew: booth.data.renew } });
    expect(told.status).toBe(401);
    expect(told.data).toMatchObject({ revoked: true });
    // Its place is free: the friend's laptop can be activated now.
    expect((await signIn("github", "friends-laptop-004", "A friend's laptop")).data.renew).toBeTruthy();
    // Signing out frees a place too.
    await app("/signout", { method: "POST", json: { renew: again.data.renew } });
    expect((await web("/api/me/activations")).data.activations.map((a: { name: string }) => a.name).sort()).toEqual(["A friend's laptop", "Home"]);
  });

  it("a renewal token from before activations becomes an activation of its own, whatever the limit", async () => {
    const env = testEnv({ MAX_ACTIVATIONS: "1" });
    const app = client(env);
    const { sha256 } = await import("../worker/http");
    await (env as unknown as { KV: KVNamespace }).KV.put(`renew:${await sha256("old-token")}`, JSON.stringify({ uid: "u_old", account: "github:1" }));
    await (env as unknown as { KV: KVNamespace }).KV.put(`renew:${await sha256("old-token-2")}`, JSON.stringify({ uid: "u_old", account: "github:1" }));
    expect((await app("/renew", { method: "POST", json: { renew: "old-token" } })).status).not.toBe(401);
    expect((await app("/renew", { method: "POST", json: { renew: "old-token-2" } })).status).not.toBe(401);
    const { activationsOf } = await import("../worker/activations");
    expect(await activationsOf(env as never, "u_old")).toHaveLength(2);
  });

  it("the student price and the regional price never stack: the larger discount applies", async () => {
    const env = testEnv();
    const student: User = { id: "u_s", email: "ana@uasd.edu.do", name: "Ana", avatar: null, identities: [], createdAt: 0 };
    const plain: User = { ...student, id: "u_p", email: "ana@gmail.com" };
    const at = async (u: User, country: string) => (await quote(env as never, u, { edition: "full", plan: "perpetual", country })).total;
    expect(await at(plain, "US")).toBe(14900);
    expect(await at(student, "US")).toBe(7449);
    // The Dominican Republic pays 60 %, a student 50 %: the student price, not 30 %.
    expect(await at(plain, "DO")).toBe(8949);
    expect(await at(student, "DO")).toBe(7449);
    // Ethiopia pays 30 %, less than a student's half: the regional price.
    expect(await at(student, "ET")).toBe(await at(plain, "ET"));
    // Marked by the crew, a student needs no school address.
    expect(await at({ ...plain, student: true }, "US")).toBe(7449);
  });

  it("Backstage is closed to visitors and a cross-site post is refused", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const web = client(env);
    expect((await web("/api/admin/overview")).status).toBe(403);
    expect((await web("/api/admin/overview", { headers: { authorization: "Bearer wrong" } })).status).toBe(403);
    expect((await web("/api/wishes", { method: "POST", headers: { origin: "https://evil.example" }, json: { title: "x" } })).status).toBe(403);
  });

  it("wishes and votes", async () => {
    const env = testEnv();
    const web = client(env);
    const w = await web("/api/wishes", { method: "POST", json: { title: "Serato DVS control vinyl support", body: "please" } });
    expect(w.data.votes).toBe(1);
    const again = await web(`/api/wishes/${w.data.id}/vote`, { method: "POST" });
    // The author's own vote was counted at creation; voting again takes it back.
    expect(again.data).toMatchObject({ votes: 0, voted: false });
    const list = await web("/api/wishes");
    expect(list.data.find((x: { id: string }) => x.id === w.data.id).status).toBe("idea");
  });
});

describe("the site's addresses", () => {
  it("sends the professional site's preview address to the site itself, keeping what it asked", async () => {
    for (const path of ["/v4", "/v4/", "/v4/index.html"]) {
      const res = await handle(new Request(`https://djmanzo.test${path}?country=DO`), testEnv(), exec);
      expect(res.status, path).toBe(301);
      expect(res.headers.get("location"), path).toBe("https://djmanzo.test/?country=DO");
    }
  });

  it("sends the retired sites' addresses here, and still serves the preview's pictures where they were", async () => {
    // The static files stand in as one answer: what matters is that the Worker passes these to them.
    const env = { ...testEnv(), ASSETS: { fetch: async () => new Response("a static file") } } as unknown as ReturnType<typeof testEnv>;
    const art = await handle(new Request("https://djmanzo.test/v4/art/club-hero.webp"), env, exec);
    expect(art.status).toBe(200);
    expect(await art.text()).toBe("a static file");
    for (const [path, to] of [["/signal/", "/"], ["/island/", "/"], ["/island", "/"], ["/shop/", "/pricing"], ["/signal/index.html?sky=snow", "/?sky=snow"]]) {
      const res = await handle(new Request(`https://djmanzo.test${path}`), env, exec);
      expect(res.status, path).toBe(301);
      expect(res.headers.get("location"), path).toBe(`https://djmanzo.test${to}`);
    }
    // A path that only starts like one is not one of them.
    expect((await handle(new Request("https://djmanzo.test/shopping"), env, exec)).status).toBe(200);
  });
});
