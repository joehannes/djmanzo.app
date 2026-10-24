import { afterEach, describe, expect, it, vi } from "vitest";
import { handle } from "../worker/index";
import { testEnv } from "./kv";
import { browser as client, crew, openSite, person } from "./people";

const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;
afterEach(() => vi.unstubAllGlobals());

/** A browser that keeps the site's cookies, as the sign-in's round trip needs. */
function browser(env: never) {
  const jar = new Map<string, string>();
  return async (path: string) => {
    const headers = new Headers();
    if (jar.size) headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    const res = await handle(new Request(`https://djmanzo.test${path}`, { headers }), env, exec);
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
    const text = await res.text();
    return { status: res.status, location: res.headers.get("location"), data: text.startsWith("{") ? JSON.parse(text) : null };
  };
}

const offered = async (env: never) => ((await client(env)("/api/me")).data.providers as { id: string }[]).map((p) => p.id);
const set = (env: never, values: Record<string, string>) => crew(env)("/api/admin/signin", { method: "PUT", json: { values } });

describe("sign-in keys, set in Backstage", () => {
  it("switch a provider on without a deploy, and off again back to the Worker secret", async () => {
    const env = openSite({ GITHUB_CLIENT_ID: "gh-from-secret", GITHUB_CLIENT_SECRET: "gh-secret-from-worker" });
    expect(await offered(env)).toEqual(["github"]);
    expect((await set(env, { GOOGLE_CLIENT_ID: "1234-abc.apps.googleusercontent.com", GOOGLE_CLIENT_SECRET: "GOCSPX-secret-9876" })).status).toBe(200);
    expect(await offered(env)).toEqual(["google", "github"]);
    await set(env, { GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "" });
    expect(await offered(env)).toEqual(["github"]);
  });

  it("show the crew each provider's address to register and its steps, a secret only by its end, and keep none of it readable in KV", async () => {
    const env = openSite();
    await set(env, { X_CLIENT_ID: "eFgHiJkLmNoPqRsTuVwX", X_CLIENT_SECRET: "x-secret-AbCd1234" });
    const v = (await crew(env)("/api/admin/signin")).data;
    const x = v.providers.find((p: { id: string }) => p.id === "x");
    expect(x).toMatchObject({ name: "X", offered: true, register: "https://djmanzo.test/callback/x", console: "https://developer.x.com/en/portal/dashboard" });
    expect(x.keys.map((k: { shown: string }) => k.shown)).toEqual(["eFgHiJkLmNoPqRsTuVwX", "…1234"]);
    expect(JSON.stringify(v)).not.toContain("x-secret-AbCd1234");
    expect(await (env as unknown as { KV: KVNamespace }).KV.get("config:signin")).not.toContain("x-secret");
    const ig = v.providers.find((p: { id: string }) => p.id === "instagram");
    expect(ig.who).toBe("Instagram professional accounts (creator or business)");
    // Every provider offered has its steps.
    for (const p of v.providers) expect(p.steps, p.id).toBeTruthy();
    expect(v.providers.map((p: { id: string }) => p.id)).toEqual(expect.arrayContaining(["google", "apple", "facebook", "instagram", "microsoft", "x", "tiktok", "linkedin", "twitch", "discord", "github", "line", "patreon"]));
  });

  it("refuse what is not a key, a setting that does not exist, and anyone but the crew", async () => {
    const env = openSite();
    expect((await set(env, { APPLE_TEAM_ID: "not a team" })).status).toBe(400);
    expect((await set(env, { APPLE_PRIVATE_KEY: "hunter2" })).status).toBe(400);
    expect((await set(env, { STRIPE_SECRET_KEY: "sk_test_x" })).status).toBe(400);
    const lena = await person(env, "Lena");
    expect((await lena.call("/api/admin/signin", { method: "PUT", json: { values: { GOOGLE_CLIENT_ID: "abcd-efgh" } } })).status).toBe(403);
    expect((await lena.call("/api/admin/signin")).status).toBe(403);
  });
});

describe("the newer providers' own ways", () => {
  it("X: the client's keys go as a Basic header, never in the body, with PKCE", async () => {
    const env = testEnv({ X_CLIENT_ID: "x-client", X_CLIENT_SECRET: "x-secret", ADMIN_TOKEN: "crew" });
    let tokenCall: { auth: string | null; body: URLSearchParams } | null = null;
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      if (String(url) === "https://api.x.com/2/oauth2/token") {
        tokenCall = { auth: new Headers(init?.headers).get("authorization"), body: new URLSearchParams(String(init?.body)) };
        return Response.json({ access_token: "x-token" });
      }
      if (String(url).startsWith("https://api.x.com/2/users/me")) return Response.json({ data: { id: "99", name: "Ana", username: "ana_dj", profile_image_url: "https://pbs.twimg.com/a.jpg" } });
      throw new Error(`unexpected fetch ${url}`);
    });
    const web = browser(env);
    const off = new URL((await web("/auth/start/x?return=/account")).location!);
    expect(off.origin + off.pathname).toBe("https://x.com/i/oauth2/authorize");
    expect(off.searchParams.get("client_id")).toBe("x-client");
    expect(off.searchParams.get("code_challenge_method")).toBe("S256");
    const back = await web(`/callback/x?code=c1&state=${off.searchParams.get("state")}`);
    expect(back.location).toBe("https://djmanzo.test/account?signedin=x");
    expect(tokenCall!.auth).toBe(`Basic ${btoa("x-client:x-secret")}`);
    expect(tokenCall!.body.get("client_secret")).toBeNull();
    expect(tokenCall!.body.get("code_verifier")).toBeTruthy();
    expect((await web("/api/me")).data.user).toMatchObject({ name: "Ana", providers: ["x"] });
  });

  it("TikTok: its client id is a client_key, in the address and in the token request", async () => {
    const env = testEnv({ TIKTOK_CLIENT_ID: "tt-key", TIKTOK_CLIENT_SECRET: "tt-secret", ADMIN_TOKEN: "crew" });
    let body: URLSearchParams | null = null;
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      if (String(url) === "https://open.tiktokapis.com/v2/oauth/token/") {
        body = new URLSearchParams(String(init?.body));
        return Response.json({ access_token: "tt-token", open_id: "oid-1" });
      }
      if (String(url).startsWith("https://open.tiktokapis.com/v2/user/info/")) return Response.json({ data: { user: { open_id: "oid-1", display_name: "Kiki", avatar_url: null } }, error: { code: "ok" } });
      throw new Error(`unexpected fetch ${url}`);
    });
    const web = browser(env);
    const off = new URL((await web("/auth/start/tiktok?return=/")).location!);
    expect(off.searchParams.get("client_key")).toBe("tt-key");
    expect(off.searchParams.get("client_id")).toBeNull();
    await web(`/callback/tiktok?code=c2&state=${off.searchParams.get("state")}`);
    expect(body!.get("client_key")).toBe("tt-key");
    expect(body!.get("client_secret")).toBe("tt-secret");
    expect((await web("/api/me")).data.user).toMatchObject({ name: "Kiki", providers: ["tiktok"] });
  });

  it("Twitch: asks for the person with its client id alongside the token", async () => {
    const env = testEnv({ TWITCH_CLIENT_ID: "tw-id", TWITCH_CLIENT_SECRET: "tw-secret", ADMIN_TOKEN: "crew" });
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      if (String(url) === "https://id.twitch.tv/oauth2/token") return Response.json({ access_token: "tw-token" });
      if (String(url) === "https://api.twitch.tv/helix/users") {
        expect(new Headers(init?.headers).get("client-id")).toBe("tw-id");
        return Response.json({ data: [{ id: "5", login: "djbeat", display_name: "DJ Beat", email: "beat@example.com", profile_image_url: null }] });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    const web = browser(env);
    const off = new URL((await web("/auth/start/twitch?return=/")).location!);
    await web(`/callback/twitch?code=c3&state=${off.searchParams.get("state")}`);
    expect((await web("/api/me")).data.user).toMatchObject({ name: "DJ Beat", providers: ["twitch"] });
  });
});
