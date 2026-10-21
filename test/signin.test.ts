import { afterEach, describe, expect, it, vi } from "vitest";
import { handle } from "../worker/index";
import { withQuery } from "../worker/auth";
import { testEnv } from "./kv";

const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

/** A browser: every cookie the site sets is kept and sent back, as a real one does. */
function browser(env: never) {
  const jar = new Map<string, string>();
  return async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (jar.size) headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    const res = await handle(new Request(`https://djmanzo.test${path}`, { ...init, headers }), env, exec);
    for (const c of res.headers.getSetCookie()) {
      const [pair, ...attrs] = c.split(";");
      const i = pair.indexOf("=");
      const gone = attrs.some((a) => a.trim().toLowerCase() === "max-age=0");
      if (gone) jar.delete(pair.slice(0, i));
      else jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
    const text = await res.text();
    return { status: res.status, location: res.headers.get("location"), data: text ? JSON.parse(text) : null, jar };
  };
}

/** GitHub, played here: a token for any code but "bad", and Lena (or whoever `who` names) with a verified address. */
function github(who = { id: 583231, login: "lena", name: "Lena", email: "lena@example.com" }) {
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const u = String(url);
    if (u.startsWith("https://github.com/login/oauth/access_token")) {
      const code = new URLSearchParams(String(init?.body)).get("code");
      // GitHub's way of refusing: 200, with an error in the body.
      return code === "bad" ? Response.json({ error: "redirect_uri_mismatch" }) : Response.json({ access_token: `gh-${code}` });
    }
    if (u === "https://api.github.com/user") return Response.json({ id: who.id, login: who.login, name: who.name });
    if (u === "https://api.github.com/user/emails") return Response.json([{ email: who.email, primary: true, verified: true }]);
    if (u.startsWith("https://www.patreon.com/api/oauth2/token")) return Response.json({ access_token: "pt-token" });
    if (u.startsWith("https://www.patreon.com/api/oauth2/v2/identity")) {
      return Response.json({
        data: { id: "77", attributes: { full_name: "Lena P", email: "lena@example.com", is_email_verified: true, url: "https://www.patreon.com/lenamixes/", image_url: null } },
        included: [{ type: "member", attributes: { patron_status: "active_patron" }, relationships: { campaign: { data: { id: "camp-1" } } } }],
      });
    }
    throw new Error(`unexpected fetch ${u}`);
  });
}

const env = (extra: Record<string, unknown> = {}) =>
  testEnv({ GITHUB_CLIENT_ID: "gh-id", GITHUB_CLIENT_SECRET: "gh-secret", PATREON_CLIENT_ID: "pt-id", PATREON_CLIENT_SECRET: "pt-secret", ADMIN_TOKEN: "crew", ...extra });

afterEach(() => vi.unstubAllGlobals());

describe("signing in on the site", () => {
  it("comes back to the page it started from, signed in, and the page is told so", async () => {
    github();
    const web = browser(env());
    const off = await web(`/auth/start/github?return=${encodeURIComponent("/pricing#checkout")}`);
    const state = new URL(off.location!).searchParams.get("state")!;
    const back = await web(`/callback/github?code=ok&state=${state}`);
    expect(back.location).toBe("https://djmanzo.test/pricing?signedin=github#checkout");
    expect((await web("/api/me")).data.user).toMatchObject({ name: "Lena", providers: ["github"] });
    // The pending sign-in's cookie is spent.
    expect(back.jar.has("djm_oauth")).toBe(false);
  });

  it("finishes from the cookie when KV has not caught up with the start", async () => {
    github();
    const e = env();
    const web = browser(e);
    const off = await web("/auth/start/github?return=/account");
    const state = new URL(off.location!).searchParams.get("state")!;
    // The callback reaches a place where KV does not have the pending sign-in yet.
    await (e as unknown as { KV: KVNamespace }).KV.delete(`oauth:${state}`);
    const back = await web(`/callback/github?code=ok&state=${state}`);
    expect(back.location).toBe("https://djmanzo.test/account?signedin=github");
    expect((await web("/api/me")).data.user?.name).toBe("Lena");
  });

  it("a cookie for another sign-in is not taken for this one", async () => {
    github();
    const web = browser(env());
    await web("/auth/start/github?return=/account");
    const back = await web("/callback/github?code=ok&state=somebody-elses-state");
    expect(back.location).toBe("https://djmanzo.test/account?signin=failed&why=expired");
    expect((await web("/api/me")).data.user).toBeNull();
  });

  it("says why it failed, on the page it started from", async () => {
    github();
    const web = browser(env());
    const start = async () => new URL((await web(`/auth/start/github?return=${encodeURIComponent("/outboard")}`)).location!).searchParams.get("state")!;
    // Cancelled at GitHub: no code comes back.
    expect((await web(`/callback/github?error=access_denied&state=${await start()}`)).location).toBe("https://djmanzo.test/outboard?signin=failed&why=refused");
    // GitHub refuses the swap (a callback address it does not know).
    expect((await web(`/callback/github?code=bad&state=${await start()}`)).location).toBe("https://djmanzo.test/outboard?signin=failed&why=token");
    expect((await web("/api/me")).data.user).toBeNull();
  });

  it("serves the callback address used until 18 October, and asks for it when told to", async () => {
    github();
    const web = browser(env({ OAUTH_CALLBACK_PATH: "/auth/callback" }));
    const off = new URL((await web("/auth/start/github")).location!);
    expect(off.searchParams.get("redirect_uri")).toBe("https://djmanzo.test/auth/callback/github");
    const back = await web(`/auth/callback/github?code=ok&state=${off.searchParams.get("state")}`);
    expect(back.location).toBe("https://djmanzo.test/?signedin=github");
    expect((await web("/api/me")).data.user?.name).toBe("Lena");
  });

  it("tells the crew what to register at each provider", async () => {
    const web = browser(env());
    expect((await web("/api/auth/check")).status).toBe(403);
    const r = await web("/api/auth/check", { headers: { authorization: "Bearer crew" } });
    const gh = r.data.providers.find((p: { id: string }) => p.id === "github");
    expect(gh).toMatchObject({ offered: true, missing: [], register: "https://djmanzo.test/callback/github", alsoServed: "https://djmanzo.test/auth/callback/github" });
    expect(r.data.providers.find((p: { id: string }) => p.id === "google")).toMatchObject({ offered: false, missing: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] });
  });

  it("connecting Patreon to a signed-in account shows their page as verified, and marks djmanzo's patrons", async () => {
    github();
    const web = browser(env({ PATREON_CAMPAIGN_ID: "camp-1" }));
    let state = new URL((await web("/auth/start/github?return=/account")).location!).searchParams.get("state")!;
    await web(`/callback/github?code=ok&state=${state}`);
    const off = new URL((await web("/auth/start/patreon?return=/account&link=1")).location!);
    expect(off.origin).toBe("https://www.patreon.com");
    state = off.searchParams.get("state")!;
    const back = await web(`/callback/patreon?code=ok&state=${state}`);
    expect(back.location).toBe("https://djmanzo.test/account?linked=patreon");
    const me = (await web("/api/me")).data.user;
    expect(me).toMatchObject({ name: "Lena", providers: ["github", "patreon"], patreon: "https://www.patreon.com/lenamixes", supporter: true });
  });

  it("an account somebody else already has is never merged into yours", async () => {
    const e = env();
    github({ id: 1, login: "a", name: "Ana", email: "ana@example.com" });
    const ana = browser(e);
    let state = new URL((await ana("/auth/start/github")).location!).searchParams.get("state")!;
    await ana(`/callback/github?code=ok&state=${state}`);

    // Bo signs in with Patreon, then tries to connect Ana's GitHub.
    const bo = browser(e);
    state = new URL((await bo("/auth/start/patreon")).location!).searchParams.get("state")!;
    await bo(`/callback/patreon?code=ok&state=${state}`);
    state = new URL((await bo("/auth/start/github?link=1&return=/account")).location!).searchParams.get("state")!;
    expect((await bo(`/callback/github?code=ok&state=${state}`)).location).toBe("https://djmanzo.test/account?signin=failed&why=taken");
    expect((await bo("/api/me")).data.user.providers).toEqual(["patreon"]);
  });

  it("adds to an address's query before its hash", () => {
    expect(withQuery("/", { a: "1" })).toBe("/?a=1");
    expect(withQuery("/pricing?edition=pro#checkout", { signedin: "github" })).toBe("/pricing?edition=pro&signedin=github#checkout");
  });
});

describe("the feature requests' seed", () => {
  it("brings a board seeded before up to date, keeping its votes, and adds what is new", async () => {
    const { seedWishes, saveWish, wishes, SEED } = await import("../worker/community");
    const e = testEnv() as never as Parameters<typeof seedWishes>[0];
    // The board as the first seed left it: Art-Net planned, with votes on it.
    await saveWish(e, { id: "art", title: "Art-Net / DMX lighting", body: "", status: "planned", tag: "visual", note: "not in the app yet", seeded: true, votes: 12, author: "djmanzo", createdAt: 1 });
    await e.KV.put("config:seeded-wishes", "1");
    await seedWishes(e);
    const all = await wishes(e);
    const art = all.find((w) => w.title === "Art-Net / DMX lighting")!;
    expect(art).toMatchObject({ id: "art", status: "shipped", votes: 12 });
    expect(all.filter((w) => w.title === "Art-Net / DMX lighting")).toHaveLength(1);
    expect(all).toHaveLength(SEED.length);
    // Once is enough.
    expect(await seedWishes(e)).toBe(0);
  });
});
