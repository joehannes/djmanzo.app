import { afterEach, describe, expect, it, vi } from "vitest";
import { handle } from "../worker/index";
import { testEnv } from "./kv";

const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

/** A browser that keeps the site's cookies. */
function browser(env: never) {
  const jar = new Map<string, string>();
  return async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (jar.size) headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    const res = await handle(new Request(`https://djmanzo.test${path}`, { ...init, headers }), env, exec);
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
    const text = await res.text();
    return { status: res.status, location: res.headers.get("location"), data: text && text.startsWith("{") ? JSON.parse(text) : null };
  };
}

/** GitHub, played here: Lena, with a verified address, sponsoring whoever `sponsors` names. */
function github(sponsors: string[] = [], listing = false, email = "lena@example.com", id = 583231) {
  vi.stubGlobal("fetch", async (url: string) => {
    const u = String(url);
    if (u.startsWith("https://github.com/login/oauth/access_token")) return Response.json({ access_token: "gh-token" });
    if (u === "https://api.github.com/user") return Response.json({ id, login: "lena", name: "Lena" });
    if (u === "https://api.github.com/user/emails") return Response.json([{ email, primary: true, verified: true }]);
    if (u === "https://api.github.com/graphql") {
      return Response.json({ data: { viewer: { login: "lena", hasSponsorsListing: listing, sponsorshipsAsSponsor: { nodes: sponsors.map((login) => ({ sponsorable: { login } })) } } } });
    }
    throw new Error(`unexpected fetch ${u}`);
  });
}

const env = (extra: Record<string, unknown> = {}) => testEnv({ GITHUB_CLIENT_ID: "gh-id", GITHUB_CLIENT_SECRET: "gh-secret", ...extra });

async function signIn(web: ReturnType<typeof browser>) {
  const state = new URL((await web("/auth/start/github?return=/account")).location!).searchParams.get("state")!;
  await web(`/callback/github?code=ok&state=${state}`);
  return (await web("/api/me")).data.user;
}

const kofi = (data: Record<string, unknown>) => {
  const body = new URLSearchParams({ data: JSON.stringify(data) });
  return { method: "POST", body, headers: { "content-type": "application/x-www-form-urlencoded" } };
};

async function signed(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  return [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
}

afterEach(() => vi.unstubAllGlobals());

describe("supporting djmanzo, as each platform says", () => {
  it("GitHub Sponsors: a sponsor of djmanzo's account who signs in with GitHub is marked, and their own Sponsors page is verified", async () => {
    github(["someone", "djmanzo"], true);
    const me = await signIn(browser(env({ GITHUB_SPONSORS_LOGIN: "DJManzo" }) as never));
    expect(me).toMatchObject({ supports: ["github"], supporter: true, githubSponsors: "https://github.com/sponsors/lena" });

    github(["someone"]);
    const not = await signIn(browser(env({ GITHUB_SPONSORS_LOGIN: "djmanzo" }) as never));
    expect(not).toMatchObject({ supports: [], supporter: false, githubSponsors: null });
  });

  it("a sign-in still works when GitHub will not say whom anyone sponsors", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      const u = String(url);
      if (u.startsWith("https://github.com/login/oauth/access_token")) return Response.json({ access_token: "gh-token" });
      if (u === "https://api.github.com/user") return Response.json({ id: 1, login: "lena", name: "Lena" });
      if (u === "https://api.github.com/user/emails") return Response.json([]);
      return new Response("no", { status: 502 });
    });
    const me = await signIn(browser(env({ GITHUB_SPONSORS_LOGIN: "djmanzo" }) as never));
    expect(me).toMatchObject({ name: "Lena", supporter: false });
  });

  it("Ko-fi: a payment with the right token marks the account with that verified address, and only that one", async () => {
    const e = env({ KOFI_VERIFICATION_TOKEN: "kofi-token" }) as never;
    const web = browser(e);
    expect((await web("/api/webhooks/kofi", kofi({ verification_token: "wrong", email: "lena@example.com", type: "Donation" }))).status).toBe(401);
    expect((await web("/api/webhooks/kofi", kofi({ verification_token: "kofi-token", email: "Lena@Example.com", type: "Donation" }))).status).toBe(200);

    github([], false, "lena@example.com");
    expect(await signIn(browser(e))).toMatchObject({ supports: ["kofi"], supporter: true });
    github([], false, "someone.else@example.com", 2);
    expect(await signIn(browser(e))).toMatchObject({ supports: [], supporter: false });
  });

  it("Buy Me a Coffee: a signed donation marks the supporter, a forged one does not, and a membership that ends stops counting", async () => {
    const e = env({ BUYMEACOFFEE_WEBHOOK_SECRET: "bmac-secret" }) as never;
    const web = browser(e);
    const send = async (event: Record<string, unknown>, secret = "bmac-secret") => {
      const body = JSON.stringify(event);
      return web("/api/webhooks/buymeacoffee", { method: "POST", body, headers: { "content-type": "application/json", "x-signature-sha256": await signed(secret, body) } });
    };
    expect((await send({ type: "donation.created", data: { supporter_email: "lena@example.com" } }, "forged")).status).toBe(401);
    github([], false, "lena@example.com");
    expect(await signIn(browser(e))).toMatchObject({ supporter: false });

    expect((await send({ type: "membership.started", data: { supporter_email: "lena@example.com" } })).status).toBe(200);
    expect(await signIn(browser(e))).toMatchObject({ supports: ["buymeacoffee"], supporter: true });
    expect((await send({ type: "membership.cancelled", data: { supporter_email: "lena@example.com" } })).status).toBe(200);
    expect(await signIn(browser(e))).toMatchObject({ supports: [], supporter: false });
  });

  it("is closed where the owner has not set a platform up", async () => {
    const web = browser(env() as never);
    expect((await web("/api/webhooks/kofi", kofi({ verification_token: "", email: "a@b.c" }))).status).toBe(503);
    expect((await web("/api/webhooks/buymeacoffee", { method: "POST", body: "{}" })).status).toBe(503);
  });
});
