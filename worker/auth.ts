/**
 * Sign-in with an account a person already has.
 *
 * Thirteen providers over OAuth 2 — Google, Apple, GitHub, Microsoft and
 * Discord, as ADR-0011 names them; Facebook, Instagram (its professional
 * accounts: Meta ended sign-in for personal ones in December 2024), X,
 * TikTok, LinkedIn, Twitch, LINE and Patreon — with PKCE wherever the
 * provider takes it. Spotify is not among them: since May 2025 its login
 * serves only a handful of allow-listed people unless the app belongs to a
 * registered business with 250,000 monthly users. A provider is offered only
 * when its keys are set — as Worker secrets, or in Backstage
 * (`worker/signin.ts`); with none set
 * the site offers a demo sign-in instead, labelled as one, so the site can be
 * walked end to end before the owner has registered a single app.
 *
 * Apple is the odd one: its client secret is a short JWT the Worker signs
 * with the owner's key (ES256), it answers by posting a form back rather than
 * redirecting, and the person's name arrives only on their first sign-in.
 *
 * Accounts are linked by *verified* e-mail address: signing in with Google
 * and later with GitHub under the same address is one person with one set of
 * licences. An address a provider does not vouch for links nothing.
 *
 * djmanzo signs in through the same door (`worker/applicence.ts`): its
 * `/login/:provider` starts the same sign-in with djmanzo's own state and
 * PKCE challenge kept beside it, and the one callback per provider,
 * `/callback/:provider`, hands djmanzo a grant on `127.0.0.1` instead of
 * starting a browser session.
 */

import type { AppEnv } from "./env";
import { grant, type AppLogin } from "./applicence";
import { clientIp, cookie, cookies, fail, randomId, same, b64url, unb64url, text } from "./http";
import { get, put, type Session, type User } from "./store";

export const SESSION_DAYS = 30;

interface Provider {
  id: string;
  name: string;
  authorize: string;
  token: string;
  scope: string;
  /** From the access token, by asking the provider (some want the client id alongside). */
  profile?: (token: string, clientId: string) => Promise<Profile>;
  /** From the token response itself (an OpenID id_token), and the callback's form. */
  fromToken?: (tok: Record<string, unknown>, form: URLSearchParams) => Profile | null;
  /** Answers by posting a form to the callback (`response_mode=form_post`). */
  formPost?: boolean;
  /** Does not take PKCE. */
  noPkce?: boolean;
  /** What the provider calls the client id in its requests (TikTok: `client_key`). */
  clientIdParam?: string;
  /** Wants the client's id and secret as a Basic header on the token request, not in its body (X). */
  basicAuth?: boolean;
  /** Who can sign in with it, where that is narrower than "anyone with an account". */
  who?: string;
}

export interface Profile {
  sub: string;
  email: string | null;
  verified: boolean;
  name: string;
  avatar: string | null;
  /** Patreon: the person's own page there, which their account then shows as verified. */
  page?: string | null;
  /** Patreon: the campaigns the person is an active patron of. */
  supports?: string[];
  /** GitHub: the accounts the person sponsors, lower-cased. */
  sponsors?: string[];
  /** GitHub: their own Sponsors page, when they have one. */
  sponsorsPage?: string | null;
}

/** Whom a GitHub account sponsors, and whether it can be sponsored itself (GitHub's GraphQL, with the sign-in's own token). */
async function sponsorships(t: string): Promise<{ sponsors: string[]; sponsorsPage: string | null }> {
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `Bearer ${t}`, "content-type": "application/json", "user-agent": "djmanzo-website" },
    body: JSON.stringify({
      query: "{ viewer { login hasSponsorsListing sponsorshipsAsSponsor(first: 100, activeOnly: true) { nodes { sponsorable { ... on User { login } ... on Organization { login } } } } } }",
    }),
  });
  const j = (await r.json().catch(() => ({}))) as {
    data?: { viewer?: { login?: string; hasSponsorsListing?: boolean; sponsorshipsAsSponsor?: { nodes?: { sponsorable?: { login?: string } }[] } } };
  };
  const v = j.data?.viewer;
  const sponsors = (v?.sponsorshipsAsSponsor?.nodes ?? []).map((n) => n.sponsorable?.login?.toLowerCase()).filter((l): l is string => !!l);
  return { sponsors, sponsorsPage: v?.hasSponsorsListing && v.login ? `https://github.com/sponsors/${v.login}` : null };
}

/** A Patreon page address as Patreon gives it, made plain, or null if it is not one. */
export function patreonPage(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)patreon\.com$/.test(u.hostname) ? `https://www.patreon.com${u.pathname.replace(/\/$/, "")}` : null;
  } catch {
    return null;
  }
}

const UA = { "user-agent": "djmanzo-website" };

async function getJson(url: string, token: string, extra: Record<string, string> = {}) {
  const r = await fetch(url, { headers: { authorization: `Bearer ${token}`, accept: "application/json", ...UA, ...extra } });
  if (!r.ok) fail(502, `The sign-in provider answered ${r.status}.`);
  return (await r.json()) as Record<string, unknown>;
}

const s = (v: unknown) => (typeof v === "string" && v ? v : null);

export const PROVIDERS: Provider[] = [
  {
    id: "google",
    name: "Google",
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    profile: async (t) => {
      const p = await getJson("https://openidconnect.googleapis.com/v1/userinfo", t);
      return { sub: String(p.sub), email: s(p.email), verified: p.email_verified === true, name: s(p.name) ?? "DJ", avatar: s(p.picture) };
    },
  },
  {
    id: "apple",
    name: "Apple",
    authorize: "https://appleid.apple.com/auth/authorize",
    token: "https://appleid.apple.com/auth/token",
    scope: "name email",
    formPost: true,
    noPkce: true,
    // The id_token came straight from Apple's token endpoint over TLS, which
    // OpenID Connect Core §3.1.3.7 accepts in place of checking its signature.
    fromToken: (tok, form) => {
      const claims = jwtClaims(s(tok.id_token));
      if (!claims?.sub) return null;
      let name: string | null = null;
      try {
        const u = JSON.parse(form.get("user") || "null") as { name?: { firstName?: string; lastName?: string } } | null;
        name = [u?.name?.firstName, u?.name?.lastName].filter(Boolean).join(" ") || null;
      } catch {
        name = null;
      }
      const verified = claims.email_verified === true || claims.email_verified === "true";
      return { sub: String(claims.sub), email: s(claims.email), verified, name: name ?? "DJ", avatar: null };
    },
  },
  {
    id: "github",
    name: "GitHub",
    authorize: "https://github.com/login/oauth/authorize",
    token: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    profile: async (t) => {
      const p = await getJson("https://api.github.com/user", t);
      const emails = (await getJson("https://api.github.com/user/emails", t).catch(() => [])) as unknown as {
        email: string;
        primary: boolean;
        verified: boolean;
      }[];
      const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) : undefined;
      // Whom they sponsor, and their own Sponsors page: never a reason for a sign-in to fail.
      const sponsoring = await sponsorships(t).catch(() => ({ sponsors: [] as string[], sponsorsPage: null }));
      return { sub: String(p.id), email: primary?.email ?? null, verified: !!primary, name: s(p.name) ?? s(p.login) ?? "DJ", avatar: s(p.avatar_url), ...sponsoring };
    },
  },
  {
    id: "discord",
    name: "Discord",
    authorize: "https://discord.com/oauth2/authorize",
    token: "https://discord.com/api/oauth2/token",
    scope: "identify email",
    profile: async (t) => {
      const p = await getJson("https://discord.com/api/users/@me", t);
      const avatar = p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : null;
      return { sub: String(p.id), email: s(p.email), verified: p.verified === true, name: s(p.global_name) ?? s(p.username) ?? "DJ", avatar };
    },
  },
  {
    id: "facebook",
    name: "Facebook",
    authorize: "https://www.facebook.com/v21.0/dialog/oauth",
    token: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "email public_profile",
    profile: async (t) => {
      const p = await getJson("https://graph.facebook.com/me?fields=id,name,email,picture", t);
      const pic = (p.picture as { data?: { url?: string } } | undefined)?.data?.url ?? null;
      // Facebook only returns an address it has confirmed.
      return { sub: String(p.id), email: s(p.email), verified: !!p.email, name: s(p.name) ?? "DJ", avatar: pic };
    },
  },
  {
    id: "patreon",
    name: "Patreon",
    authorize: "https://www.patreon.com/oauth2/authorize",
    token: "https://www.patreon.com/api/oauth2/token",
    // `identity.memberships` only to see whether the person supports djmanzo's own campaign, when one is named.
    scope: "identity identity[email] identity.memberships",
    noPkce: true,
    profile: async (t) => {
      const fields = "fields%5Buser%5D=full_name,email,is_email_verified,image_url,url,vanity&include=memberships.campaign&fields%5Bmember%5D=patron_status";
      const p = (await getJson(`https://www.patreon.com/api/oauth2/v2/identity?${fields}`, t)) as {
        data?: { id?: string; attributes?: Record<string, unknown> };
        included?: { type: string; attributes?: Record<string, unknown>; relationships?: { campaign?: { data?: { id?: string } } } }[];
      };
      const a = p.data?.attributes ?? {};
      const supports = (p.included ?? [])
        .filter((m) => m.type === "member" && m.attributes?.patron_status === "active_patron")
        .map((m) => String(m.relationships?.campaign?.data?.id ?? ""))
        .filter(Boolean);
      return {
        sub: String(p.data?.id),
        email: s(a.email),
        verified: a.is_email_verified === true,
        name: s(a.full_name) ?? s(a.vanity) ?? "DJ",
        avatar: s(a.image_url),
        page: patreonPage(s(a.url)),
        supports,
      };
    },
  },
  {
    id: "instagram",
    name: "Instagram",
    // Business Login for Instagram: Meta ended sign-in for personal Instagram
    // accounts in December 2024; a professional (creator or business) account signs in here.
    authorize: "https://www.instagram.com/oauth/authorize",
    token: "https://api.instagram.com/oauth/access_token",
    scope: "instagram_business_basic",
    noPkce: true,
    who: "Instagram professional accounts (creator or business)",
    profile: async (t) => {
      const p = await getJson(`https://graph.instagram.com/me?fields=user_id,username,name,profile_picture_url&access_token=${encodeURIComponent(t)}`, t);
      return { sub: String(p.user_id ?? p.id), email: null, verified: false, name: s(p.name) ?? s(p.username) ?? "DJ", avatar: s(p.profile_picture_url) };
    },
  },
  {
    id: "x",
    name: "X",
    authorize: "https://x.com/i/oauth2/authorize",
    token: "https://api.x.com/2/oauth2/token",
    scope: "users.read tweet.read",
    basicAuth: true,
    profile: async (t) => {
      const p = (await getJson("https://api.x.com/2/users/me?user.fields=profile_image_url", t)) as { data?: Record<string, unknown> };
      const d = p.data ?? {};
      return { sub: String(d.id), email: null, verified: false, name: s(d.name) ?? s(d.username) ?? "DJ", avatar: s(d.profile_image_url) };
    },
  },
  {
    id: "tiktok",
    name: "TikTok",
    authorize: "https://www.tiktok.com/v2/auth/authorize/",
    token: "https://open.tiktokapis.com/v2/oauth/token/",
    scope: "user.info.basic",
    clientIdParam: "client_key",
    // PKCE is TikTok's for desktop and mobile apps; the web flow is this one.
    noPkce: true,
    profile: async (t) => {
      const p = (await getJson("https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name", t)) as { data?: { user?: Record<string, unknown> } };
      const u = p.data?.user ?? {};
      if (!u.open_id) fail(502, "TikTok did not say who this is.");
      return { sub: String(u.open_id), email: null, verified: false, name: s(u.display_name) ?? "DJ", avatar: s(u.avatar_url) };
    },
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    authorize: "https://www.linkedin.com/oauth/v2/authorization",
    token: "https://www.linkedin.com/oauth/v2/accessToken",
    scope: "openid profile email",
    noPkce: true,
    profile: async (t) => {
      const p = await getJson("https://api.linkedin.com/v2/userinfo", t);
      return { sub: String(p.sub), email: s(p.email), verified: p.email_verified === true, name: s(p.name) ?? "DJ", avatar: s(p.picture) };
    },
  },
  {
    id: "twitch",
    name: "Twitch",
    authorize: "https://id.twitch.tv/oauth2/authorize",
    token: "https://id.twitch.tv/oauth2/token",
    scope: "user:read:email",
    noPkce: true,
    profile: async (t, clientId) => {
      const p = (await getJson("https://api.twitch.tv/helix/users", t, { "client-id": clientId })) as { data?: Record<string, unknown>[] };
      const u = p.data?.[0] ?? {};
      // Twitch does not say whether the address is confirmed: it links nothing.
      return { sub: String(u.id), email: s(u.email), verified: false, name: s(u.display_name) ?? s(u.login) ?? "DJ", avatar: s(u.profile_image_url) };
    },
  },
  {
    id: "line",
    name: "LINE",
    authorize: "https://access.line.me/oauth2/v2.1/authorize",
    token: "https://api.line.me/oauth2/v2.1/token",
    scope: "profile openid",
    profile: async (t) => {
      const p = await getJson("https://api.line.me/v2/profile", t);
      return { sub: String(p.userId), email: null, verified: false, name: s(p.displayName) ?? "DJ", avatar: s(p.pictureUrl) };
    },
  },
  {
    id: "microsoft",
    name: "Microsoft",
    authorize: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "openid email profile",
    profile: async (t) => {
      const p = await getJson("https://graph.microsoft.com/oidc/userinfo", t);
      // Microsoft personal and work accounts do not assert verification; an address links nothing.
      return { sub: String(p.sub), email: s(p.email), verified: false, name: s(p.name) ?? "DJ", avatar: null };
    },
  },
];

/** The claims of a JWT, unchecked: only for one received straight from its issuer. */
function jwtClaims(jwt: string | null): Record<string, unknown> | null {
  const part = jwt?.split(".")[1];
  if (!part) return null;
  try {
    return JSON.parse(new TextDecoder().decode(unb64url(part))) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Apple's client secret: an ES256 JWT, signed with the key the owner made in
 * Apple's developer account, good for five minutes.
 */
async function appleSecret(env: AppEnv): Promise<string> {
  const pem = String(env.APPLE_PRIVATE_KEY || "").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: object) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const head = enc({ alg: "ES256", kid: env.APPLE_KEY_ID });
  const body = enc({ iss: env.APPLE_TEAM_ID, iat: now, exp: now + 300, aud: "https://appleid.apple.com", sub: env.APPLE_CLIENT_ID });
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

function credentials(env: AppEnv, id: string): { clientId: string; secret: string } | null {
  if (id === "apple") {
    return env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY ? { clientId: env.APPLE_CLIENT_ID, secret: "" } : null;
  }
  const up = id.toUpperCase();
  const clientId = (env as unknown as Record<string, string | undefined>)[`${up}_CLIENT_ID`];
  const secret = (env as unknown as Record<string, string | undefined>)[`${up}_CLIENT_SECRET`];
  return clientId && secret ? { clientId, secret } : null;
}

export function enabledProviders(env: AppEnv): { id: string; name: string }[] {
  return PROVIDERS.filter((p) => credentials(env, p.id)).map((p) => ({ id: p.id, name: p.name }));
}

/** Demo mode: forced by `DEMO_MODE=on`, or "auto" with no payment provider configured. */
export function demoMode(env: AppEnv): boolean {
  const mode = String(env.DEMO_MODE || "auto");
  if (mode === "on") return true;
  if (mode === "off") return false;
  return !env.STRIPE_SECRET_KEY && !env.PAYPAL_CLIENT_ID;
}

/** Only a path on this site may be returned to, so a sign-in cannot be used as an open redirect. */
export function safeReturn(path: string | null): string {
  return path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path.slice(0, 600) : "/";
}

/**
 * The one address each provider sends a person back to, for the browser and
 * for djmanzo alike: `/callback/<provider>`. Until 18 October it was
 * `/auth/callback/<provider>`, and a provider app registered then still
 * names that; both are served, and `OAUTH_CALLBACK_PATH` (a variable) says
 * which one to ask for, so the owner need not register anything again.
 */
export function callbackPath(env: AppEnv): string {
  const p = String(env.OAUTH_CALLBACK_PATH || "/callback").replace(/\/+$/, "");
  return p === "/auth/callback" ? p : "/callback";
}
const back = (env: AppEnv, origin: string, provider: string) => `${origin}${callbackPath(env)}/${provider}`;

interface Pending {
  provider: string;
  verifier: string;
  back: string;
  /** djmanzo's own sign-in, waiting on a port of this machine. */
  app?: AppLogin;
  /** A person already signed in, adding this account to their own. */
  link?: string;
}

export { FAILURES, type Failure } from "../shared/signin";
import type { Failure } from "../shared/signin";

/** `path` with `params` added to its query, before any hash. */
export function withQuery(path: string, params: Record<string, string>): string {
  const [head, hash = ""] = path.split("#", 2);
  const [base, query = ""] = head.split("?", 2);
  const q = new URLSearchParams(query);
  for (const [k, v] of Object.entries(params)) q.set(k, v);
  return `${base}?${q}${hash ? `#${hash}` : ""}`;
}

/** The pending sign-in rides in a cookie as well as KV, so a callback that reaches another place before KV has caught up still finishes. */
const PENDING = "djm_oauth";
function pendingCookie(state: string, pending: Pending | null): string {
  const value = pending ? b64url(new TextEncoder().encode(JSON.stringify({ state, ...pending }))) : "";
  // SameSite=None: Apple answers by posting a form from its own site, which a Lax cookie would not ride along with.
  return `${PENDING}=${value}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${pending ? 600 : 0}`;
}
function pendingFrom(req: Request, state: string): Pending | null {
  const raw = cookies(req)[PENDING];
  if (!raw || !state) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(unb64url(raw))) as Pending & { state?: string };
    if (p.state !== state || typeof p.provider !== "string" || typeof p.verifier !== "string") return null;
    const { state: _, ...pending } = p;
    return { ...pending, back: safeReturn(pending.back) };
  } catch {
    return null;
  }
}

function failed(origin: string, to: string, why: Failure, detail?: string): Response {
  console.error(`sign-in failed: ${why}${detail ? ` (${detail})` : ""}`);
  const res = new Response(null, { status: 302, headers: { location: `${origin}${withQuery(to, { signin: "failed", why })}` } });
  res.headers.append("set-cookie", pendingCookie("", null));
  return res;
}

/**
 * Off to the provider. In the browser the state is the site's own; for
 * djmanzo (`app`) it is djmanzo's, as the loopback hands it back unchanged.
 */
export async function start(req: Request, env: AppEnv, providerId: string, app?: { state: string; app: AppLogin }): Promise<Response> {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  const creds = provider && credentials(env, provider.id);
  if (!provider || !creds) fail(404, "That sign-in is not offered here.");
  const url = new URL(req.url);
  const state = app?.state ?? randomId();
  const verifier = randomId(32);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  // Signed in already, in the browser: this sign-in adds the account to theirs.
  const linking = !app && url.searchParams.get("link") === "1" ? await whoami(req, env) : null;
  const pending: Pending = {
    provider: provider.id,
    verifier,
    back: safeReturn(url.searchParams.get("return")),
    ...(app ? { app: app.app } : {}),
    ...(linking && !linking.demo ? { link: linking.id } : {}),
  };
  await put(env.KV, `oauth:${state}`, pending, 600);
  const auth = new URL(provider.authorize);
  auth.searchParams.set(provider.clientIdParam ?? "client_id", creds.clientId);
  auth.searchParams.set("redirect_uri", back(env, url.origin, provider.id));
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", provider.scope);
  auth.searchParams.set("state", state);
  if (!provider.noPkce) {
    auth.searchParams.set("code_challenge", challenge);
    auth.searchParams.set("code_challenge_method", "S256");
  }
  if (provider.formPost) auth.searchParams.set("response_mode", "form_post");
  if (provider.id === "google") auth.searchParams.set("prompt", "select_account");
  const res = new Response(null, { status: 302, headers: { location: auth.toString() } });
  if (!app) res.headers.append("set-cookie", pendingCookie(state, pending));
  return res;
}

export async function callback(req: Request, env: AppEnv, providerId: string): Promise<Response> {
  const url = new URL(req.url);
  // Apple posts its answer as a form; everyone else redirects with a query.
  const form = req.method === "POST" ? new URLSearchParams(await req.text()) : url.searchParams;
  const state = form.get("state") || "";
  const code = form.get("code") || "";
  const saved = (await get<Pending>(env.KV, `oauth:${state}`)) ?? pendingFrom(req, state);
  if (!saved || saved.provider !== providerId) return failed(url.origin, "/account", "expired", `state ${saved ? "for another provider" : "unknown"}`);
  // The person said no at the provider, or the provider refused the request (a wrong callback address, an unverified app).
  if (!code) return failed(url.origin, saved.back, "refused", form.get("error") ?? "no code");
  await env.KV.delete(`oauth:${state}`);
  const provider = PROVIDERS.find((p) => p.id === providerId)!;
  const creds = credentials(env, providerId);
  if (!creds) return failed(url.origin, saved.back, "refused", "provider not configured");
  const exchange = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: back(env, url.origin, providerId),
    [provider.clientIdParam ?? "client_id"]: creds.clientId,
  });
  if (!provider.basicAuth) exchange.set("client_secret", providerId === "apple" ? await appleSecret(env) : creds.secret);
  if (!provider.noPkce) exchange.set("code_verifier", saved.verifier);
  const basic: Record<string, string> = provider.basicAuth ? { authorization: `Basic ${btoa(`${encodeURIComponent(creds.clientId)}:${encodeURIComponent(creds.secret)}`)}` } : {};
  const r = await fetch(provider.token, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json", ...UA, ...basic },
    body: exchange,
  });
  const tok = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  // GitHub answers 200 with an `error` field when the code or the redirect address is wrong.
  if (!r.ok || (!tok.access_token && !tok.id_token)) return failed(url.origin, saved.back, "token", `${r.status} ${String(tok.error ?? "")} ${String(tok.error_description ?? "")}`.trim());
  let profile: Profile | null;
  try {
    profile = provider.fromToken ? provider.fromToken(tok, form) : await provider.profile!(String(tok.access_token), creds.clientId);
  } catch (e) {
    return failed(url.origin, saved.back, "profile", (e as Error).message);
  }
  if (!profile) return failed(url.origin, saved.back, "profile");
  if (saved.link) {
    const linked = await link(env, saved.link, providerId, profile);
    if (!linked) return failed(url.origin, saved.back, "taken");
    const res = new Response(null, { status: 302, headers: { location: `${url.origin}${withQuery(saved.back, { linked: providerId })}` } });
    res.headers.append("set-cookie", pendingCookie("", null));
    return res;
  }
  const user = await findOrCreate(env, providerId, profile);
  // djmanzo asked: the grant goes back to it on this machine, and no browser session is made.
  if (saved.app) return grant(env, user.id, `${providerId}:${profile.sub}`, saved.app, state);
  const res = await signedIn(env, user, `${url.origin}${withQuery(saved.back, { signedin: providerId })}`);
  res.headers.append("set-cookie", pendingCookie("", null));
  return res;
}

/**
 * Add an account at a provider to a person already signed in. Refused when
 * that account already belongs to somebody else's djmanzo account: two
 * people's licences are never merged by a click.
 */
export async function link(env: AppEnv, uid: string, provider: string, p: Profile): Promise<User | null> {
  const user = await get<User>(env.KV, `user:${uid}`);
  if (!user) return null;
  const identKey = `ident:${provider}:${p.sub}`;
  const owner = await env.KV.get(identKey);
  if (owner && owner !== uid) return null;
  if (!user.identities.some((i) => i.provider === provider && i.sub === p.sub)) user.identities.push({ provider, sub: p.sub });
  remember(user, p);
  await put(env.KV, `user:${user.id}`, user);
  await env.KV.put(identKey, user.id);
  return user;
}

/** What a provider vouches for beyond who the person is: a verified Patreon page, the campaigns they support. */
function remember(user: User, p: Profile) {
  const email = p.email ? p.email.toLowerCase() : null;
  if (!user.email && email && p.verified) user.email = email;
  if (!user.avatar && p.avatar) user.avatar = p.avatar;
  if (p.page) user.patreon = p.page;
  if (p.supports) user.patronOf = p.supports;
  if (p.sponsors) user.sponsorOf = p.sponsors;
  if (p.sponsorsPage) user.githubSponsors = p.sponsorsPage;
}

export async function findOrCreate(env: AppEnv, provider: string, p: Profile, extra: Partial<User> = {}): Promise<User> {
  const identKey = `ident:${provider}:${p.sub}`;
  let uid = await env.KV.get(identKey);
  const email = p.email ? p.email.toLowerCase() : null;
  if (!uid && email && p.verified) uid = await env.KV.get(`email:${email}`);
  let user = uid ? await get<User>(env.KV, `user:${uid}`) : null;
  if (!user) {
    user = {
      id: randomId(12),
      email: p.verified ? email : null,
      name: text(p.name, 60) || "DJ",
      avatar: p.avatar,
      identities: [],
      createdAt: Date.now(),
      ...extra,
    };
  }
  if (!user.identities.some((i) => i.provider === provider && i.sub === p.sub)) {
    user.identities.push({ provider, sub: p.sub });
  }
  remember(user, p);
  await put(env.KV, `user:${user.id}`, user);
  await env.KV.put(identKey, user.id);
  if (user.email && p.verified) await env.KV.put(`email:${user.email}`, user.id);
  return user;
}

export async function signedIn(env: AppEnv, user: User, to: string): Promise<Response> {
  const sid = randomId(24);
  await put(env.KV, `session:${sid}`, { uid: user.id, createdAt: Date.now() } satisfies Session, SESSION_DAYS * 86400);
  return new Response(null, { status: 302, headers: { location: to, "set-cookie": cookie("djm_sid", sid, SESSION_DAYS * 86400) } });
}

export async function signOut(req: Request, env: AppEnv): Promise<Response> {
  const sid = cookies(req).djm_sid;
  if (sid) await env.KV.delete(`session:${sid}`);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json", "set-cookie": cookie("djm_sid", "", 0) },
  });
}

/** The person behind a request: a browser's session cookie. */
export async function whoami(req: Request, env: AppEnv): Promise<User | null> {
  const sid = cookies(req).djm_sid;
  if (!sid) return null;
  const session = await get<Session>(env.KV, `session:${sid}`);
  return session ? get<User>(env.KV, `user:${session.uid}`) : null;
}

export async function required(req: Request, env: AppEnv): Promise<User> {
  const user = await whoami(req, env);
  if (!user) fail(401, "Sign in first — it is how your licence finds its way into djmanzo.");
  return user;
}

/**
 * Whether a request may use Backstage. The ADMIN_TOKEN (as a bearer token),
 * or an account signed in with the crew's password or the token (`owner`),
 * always may. A crew account — the owner's GitHub account, the owner's
 * address, an address on ADMIN_EMAILS — may on its own only until a crew
 * password is set; from then on the password is its second key, given once
 * in that browser and good for `CREW_HOURS`.
 */
export async function isAdmin(req: Request, env: AppEnv, user: User | null): Promise<boolean> {
  const auth = req.headers.get("authorization") || "";
  if (env.ADMIN_TOKEN && auth.startsWith("Bearer ")) {
    if (await same(auth.slice(7), env.ADMIN_TOKEN)) return true;
  }
  if (!user) return false;
  if (user.owner) return true;
  if (!(await isCrew(env, user))) return false;
  if (!(await adminPasswordSet(env)).set) return true;
  const session = await sessionOf(req, env);
  return !!session?.crewUntil && session.crewUntil > Date.now();
}

/** How long a browser keeps Backstage open after its crew account gives the password. */
export const CREW_HOURS = 12;

async function sessionOf(req: Request, env: AppEnv): Promise<(Session & { sid: string }) | null> {
  const sid = cookies(req).djm_sid;
  if (!sid) return null;
  const s = await get<Session>(env.KV, `session:${sid}`);
  return s ? { ...s, sid } : null;
}

/**
 * Open Backstage for `CREW_HOURS` in this browser, when it is signed in with
 * a crew account that has just given the crew's password (or set it).
 * Whether it was one.
 */
export async function openForCrew(req: Request, env: AppEnv): Promise<boolean> {
  const session = await sessionOf(req, env);
  if (!session || !(await isCrew(env, await get<User>(env.KV, `user:${session.uid}`)))) return false;
  const { sid, ...kept } = session;
  await put(env.KV, `session:${sid}`, { ...kept, crewUntil: Date.now() + CREW_HOURS * 3_600_000 } satisfies Session, SESSION_DAYS * 86400);
  return true;
}

/** Whether an account is one of the crew's own: the owner's GitHub account or address, or an address on ADMIN_EMAILS. */
export async function isCrew(env: AppEnv, user: User | null): Promise<boolean> {
  if (!user) return false;
  // The owner's own GitHub account (by its numeric id, which a rename does
  // not change).
  const github = String(env.ADMIN_GITHUB_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (user.identities.some((i) => i.provider === "github" && github.includes(i.sub))) return true;
  // The owner's own address, by its SHA-256, so the address itself is not in
  // the public repository; only an address a provider vouched for is kept on an account.
  const hashes = String(env.ADMIN_EMAIL_HASHES || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (user.email && hashes.length) {
    const h = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.email.toLowerCase())))].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hashes.includes(h)) return true;
  }
  const admins = String(env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!user.email && admins.includes(user.email);
}

export async function adminRequired(req: Request, env: AppEnv): Promise<User | { id: "token"; name: "Owner" }> {
  const user = await whoami(req, env);
  if (!(await isAdmin(req, env, user))) fail(403, "Backstage is for the crew.");
  return user ?? { id: "token", name: "Owner" };
}

// --- The crew's password --------------------------------------------------------
//
// There is no default password. Until the owner sets one in Backstage, the
// way in is signing in with the owner's GitHub account (ADMIN_GITHUB_IDS) or
// an account with the owner's address (ADMIN_EMAIL_HASHES), the ADMIN_TOKEN
// secret, or an account in ADMIN_EMAILS. The owner's chosen password is set
// there, in Backstage, never in this public repository: a short password's
// hash published here could be guessed offline. Once it is set, a crew
// account is no longer a key on its own: it gives the password too, once in
// each browser, for `CREW_HOURS` (`isAdmin`). A set
// password is kept only as a PBKDF2 hash with its own salt (`admin:password`
// in KV); ADMIN_TOKEN always works too, as the key under the doormat that
// opens Backstage when the password is forgotten.

/** The most PBKDF2 rounds a Worker will run. */
export const PASSWORD_ROUNDS = 100_000;
export const PASSWORD_MIN = 10;

interface PasswordHash {
  salt: string;
  hash: string;
  rounds: number;
  at: number;
  by: string;
}

async function pbkdf2(password: string, salt: Uint8Array, rounds: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: rounds }, key, 256);
  return b64url(new Uint8Array(bits));
}

/** Set (or change) the crew's password. */
export async function setAdminPassword(env: AppEnv, password: string, by: string): Promise<{ ok: true; at: number }> {
  const pw = String(password ?? "");
  if (pw.length < PASSWORD_MIN) fail(400, `A password of at least ${PASSWORD_MIN} characters.`);
  if (pw.length > 256) fail(400, "That password is longer than anyone would type.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const record: PasswordHash = { salt: b64url(salt), hash: await pbkdf2(pw, salt, PASSWORD_ROUNDS), rounds: PASSWORD_ROUNDS, at: Date.now(), by };
  await env.KV.put("admin:password", JSON.stringify(record));
  return { ok: true, at: record.at };
}

/** Whether the crew's password is set, and when. */
export async function adminPasswordSet(env: AppEnv): Promise<{ set: boolean; at: number | null }> {
  const raw = await env.KV.get("admin:password");
  const r = raw ? (JSON.parse(raw) as PasswordHash) : null;
  return { set: !!r, at: r?.at ?? null };
}

async function passwordMatches(env: AppEnv, password: string): Promise<boolean> {
  const raw = await env.KV.get("admin:password");
  if (!raw || !password) return false;
  const r = JSON.parse(raw) as PasswordHash;
  return same(await pbkdf2(password, unb64url(r.salt), r.rounds), r.hash);
}

/** The owner's way in before any provider is set up: the admin token or the crew's password, exchanged for a session. */
export async function ownerSignIn(req: Request, env: AppEnv, token: string): Promise<Response> {
  // Ten wrong tries a quarter of an hour from one address: enough for a typo, not for guessing.
  const misses = `owner-miss:${clientIp(req)}:${Math.floor(Date.now() / 900_000)}`;
  const missed = Number((await env.KV.get(misses)) || "0");
  if (missed >= 10) fail(429, "Too many wrong tries from here. Wait a quarter of an hour.");
  const byToken = !!env.ADMIN_TOKEN && (await same(token, env.ADMIN_TOKEN));
  if (!byToken && !(await passwordMatches(env, token))) {
    await env.KV.put(misses, String(missed + 1), { expirationTtl: 1800 });
    fail(403, "That is not the crew's token or password.");
  }
  // A crew account signed in here gives the password as its second key, and stays who it is.
  if (await openForCrew(req, env)) return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
  const user = await findOrCreate(env, "owner", { sub: "owner", email: null, verified: false, name: "Owner", avatar: null }, { owner: true });
  const res = await signedIn(env, user, new URL(req.url).origin + "/#backstage");
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": res.headers.get("set-cookie")! } });
}

/** Demo mode's sign-in: a name, no password, and a flag on the account that keeps it out of real licences. */
export async function demoSignIn(req: Request, env: AppEnv, name: string): Promise<Response> {
  if (!demoMode(env) && enabledProviders(env).length) fail(404, "The demo sign-in is off; use one of the real ones.");
  const user = await findOrCreate(
    env,
    "demo",
    { sub: randomId(9), email: null, verified: false, name: text(name, 40) || "Guest DJ", avatar: null },
    { demo: true },
  );
  const res = await signedIn(env, user, new URL(req.url).origin + "/");
  return new Response(JSON.stringify({ ok: true, user: publicUser(user) }), {
    headers: { "content-type": "application/json", "set-cookie": res.headers.get("set-cookie")! },
  });
}

export function publicUser(u: User, env?: AppEnv) {
  const campaign = env?.PATREON_CAMPAIGN_ID;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    demo: !!u.demo,
    owner: !!u.owner,
    contact: u.contact ?? null,
    providers: u.identities.map((i) => i.provider),
    patreon: u.patreon ?? null,
    githubSponsors: u.githubSponsors ?? null,
    supporter: !!campaign && !!u.patronOf?.includes(campaign),
  };
}

/**
 * For the crew: each provider, whether it is offered, and the exact address
 * to register at that provider — the one thing a sign-in that "does nothing"
 * almost always comes down to.
 */
export function check(env: AppEnv, origin: string) {
  return PROVIDERS.map((p) => {
    const missing =
      p.id === "apple"
        ? (["APPLE_CLIENT_ID", "APPLE_TEAM_ID", "APPLE_KEY_ID", "APPLE_PRIVATE_KEY"] as const).filter((k) => !env[k])
        : [`${p.id.toUpperCase()}_CLIENT_ID`, `${p.id.toUpperCase()}_CLIENT_SECRET`].filter((k) => !(env as unknown as Record<string, unknown>)[k]);
    return { id: p.id, name: p.name, offered: missing.length === 0, missing, register: back(env, origin, p.id), alsoServed: `${origin}${callbackPath(env) === "/callback" ? "/auth/callback" : "/callback"}/${p.id}` };
  });
}
