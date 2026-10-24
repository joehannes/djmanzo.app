/**
 * The licence djmanzo signs in for (§131, ADR-0011), served by this site.
 *
 * The protocol and the licence line are the application's
 * (`crates/dj-app/src/licence.rs`), with `services/licence` as their
 * reference; this Worker speaks them exactly, so a djmanzo built with
 * `DJMANZO_LICENCE_SERVICE` naming this site signs in here — the owner's
 * choice of one Worker for the shop and the licences (18 October):
 *
 *   GET  /login/:provider     djmanzo opens this in the system browser
 *   GET  /callback/:provider  the provider sends the DJ back (`worker/auth.ts`)
 *   POST /licence             djmanzo trades its one-time grant for a licence
 *   POST /renew               ... or its renewal token, in the background
 *   POST /signout             forgets a renewal token
 *
 * The line is `djmanzo-licence-1.<payload JSON, base64url>.<Ed25519
 * signature over the payload's bytes, base64url>`. What it says comes from
 * the person's licences in this shop — the person their sign-in in the
 * browser buys as — read the way `services/licence` reads its record: a
 * purchase outranks a trial, purchases add up to the edition they make, a
 * refunded one counts for nothing, a demo purchase (made while the shop takes
 * no money) unlocks nothing. A monthly or yearly plan carries `paid_until`;
 * past it and a fortnight's grace djmanzo treats the licence as lapsed at its
 * next start. Buying once carries no date and is never taken away offline.
 *
 * The tests sign `services/licence`'s own test vectors byte for byte with its
 * development key, so the three halves cannot drift apart unnoticed.
 */

import { EDITIONS, MODULES, modulesOf as editionModules, type Edition, type Module } from "../shared/catalog";
import type { AppEnv } from "./env";
import { HttpError, b64url, body, fail, json, randomId, sha256 } from "./http";
import { keys } from "./licence";
import { startTrial, userLicences } from "./checkout";
import { get, put, type Licence, type User } from "./store";

export const PREFIX = "djmanzo-licence-1.";
export const DAY = 24 * 60 * 60;
/** How long a licence goes before djmanzo should fetch a fresh one. */
export const RENEW_AFTER = 30 * DAY;
/** How long a monthly or yearly plan keeps working past its paid date: a payment may be a few days late. */
export const GRACE = 14 * DAY;

/** A purchase or a trial, as `services/licence` keeps them; times in seconds. */
export interface Purchase {
  edition: string;
  /** Custom's modules, comma-separated. */
  modules?: string;
  refunded?: number;
  /** Paid until, for a monthly or yearly plan. */
  until?: number;
}

export interface AccountRecord {
  purchases: Purchase[];
  trial?: { edition: string; ends: number; modules?: string };
}

/** What a licence line says (`dj_app::licence::Payload`), in the order it is signed. */
export interface Payload {
  v: 1;
  account: string;
  issued: number;
  renew_by: number;
  edition: string;
  modules?: string;
  trial?: true;
  ends?: number;
  paid_until?: number;
}

const isEdition = (slug: string): slug is Edition => (EDITIONS as readonly string[]).includes(slug);
const isModule = (slug: string): slug is Module => (MODULES as readonly string[]).includes(slug);

/** The modules an edition (or a Custom purchase) carries. */
export function modulesOf(edition: string, custom?: string): Module[] {
  if (edition === "custom") return (custom ?? "").split(",").filter(isModule);
  return isEdition(edition) ? editionModules(edition) : [];
}

/** The edition a set of modules is: the edition with exactly these, else Custom with them, in djmanzo's order. */
export function editionOf(modules: readonly string[]): { edition: string; modules?: string } {
  const want = [...new Set(modules)].filter(isModule).sort();
  for (const slug of EDITIONS) {
    if (slug === "custom") continue;
    const has = [...editionModules(slug)].sort();
    if (has.length === want.length && has.every((m, i) => m === want[i])) return { edition: slug };
  }
  return { edition: "custom", modules: MODULES.filter((m) => want.includes(m)).join(",") };
}

/** What a record entitles its account to at `now`, as a payload, or null: `services/licence`'s `entitlement`. */
export function entitlement(account: string, record: AccountRecord | null, now: number): Payload | null {
  const live = (record?.purchases ?? []).filter((p) => !p.refunded && isEdition(p.edition) && (p.until === undefined || now < p.until + GRACE));
  const base = { v: 1 as const, account, issued: now, renew_by: now + RENEW_AFTER };
  if (live.length) {
    const payload: Payload = { ...base, ...editionOf(live.flatMap((p) => modulesOf(p.edition, p.modules))) };
    // Only when every live purchase is a plan: what was bought once is never taken away offline.
    if (live.every((p) => p.until !== undefined)) {
      const paid = Math.max(...live.map((p) => p.until!));
      payload.renew_by = Math.min(payload.renew_by, paid);
      payload.paid_until = paid;
    }
    return payload;
  }
  const trial = record?.trial;
  if (trial && isEdition(trial.edition) && now < trial.ends) {
    const named = trial.edition === "custom" ? editionOf(modulesOf("custom", trial.modules)) : { edition: trial.edition };
    return { ...base, ...named, trial: true, ends: trial.ends, renew_by: Math.min(base.renew_by, trial.ends) };
  }
  return null;
}

/** Sign a payload into a licence line. */
export async function signLine(payload: Payload, key: CryptoKey): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign({ name: "Ed25519" }, key, bytes);
  return `${PREFIX}${b64url(bytes)}.${b64url(signature)}`;
}

/** A person's licences in this shop, as `services/licence` keeps a record. An upgraded licence counts through the one that replaced it. */
export function recordOf(licences: Licence[]): AccountRecord {
  const s = (ms: number | null) => Math.floor((ms ?? 0) / 1000);
  const purchases: Purchase[] = licences
    .filter((l) => l.plan !== "trial" && !l.demo && (l.status === "active" || l.status === "cancelled"))
    .map((l) => ({
      edition: l.edition,
      ...(l.edition === "custom" ? { modules: (l.modules ?? []).join(",") } : {}),
      ...(l.plan === "perpetual" ? {} : { until: s(l.expires) }),
    }));
  const t = licences.find((l) => l.plan === "trial" && l.status !== "revoked");
  return { purchases, ...(t ? { trial: { edition: t.edition, ends: s(t.expires) } } : {}) };
}

const seconds = () => Math.floor(Date.now() / 1000);

// --- Signing in from djmanzo ------------------------------------------------------

/** What `/login` keeps for djmanzo while the DJ is away at the provider. */
export interface AppLogin {
  challenge: string;
  port: number;
}

/** `GET /login/:provider?state&code_challenge&port`, checked; then on to the provider as a sign-in in the browser goes. */
export function appLogin(url: URL): { state: string; app: AppLogin } {
  const state = url.searchParams.get("state") ?? "";
  const challenge = url.searchParams.get("code_challenge") ?? "";
  const port = Number(url.searchParams.get("port"));
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(state) || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) fail(400, "That sign-in link is damaged.");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) fail(400, "That sign-in link is damaged.");
  return { state, app: { challenge, port } };
}

/** Back to djmanzo's listener on this machine, carrying a two-minute, one-time grant. */
export async function grant(env: AppEnv, uid: string, account: string, login: AppLogin, state: string): Promise<Response> {
  const code = randomId(32);
  await put(env.KV, `grant:${code}`, { uid, account, challenge: login.challenge }, 120);
  const back = new URL(`http://127.0.0.1:${login.port}/`);
  back.searchParams.set("code", code);
  back.searchParams.set("state", state);
  return Response.redirect(back.toString(), 302);
}

interface Answer {
  licence?: string;
  refused?: string;
}

/** The licence for one person and the account they signed in as, at `now` — starting their trial first when asked. */
export async function licenceFor(env: AppEnv, uid: string, account: string, now: number, trial?: { edition?: string } | null): Promise<Answer> {
  if (trial?.edition) {
    const user = await get<User>(env.KV, `user:${uid}`);
    if (!user) return { refused: "this account is gone" };
    try {
      await startTrial(env, user, String(trial.edition));
    } catch (e) {
      if (e instanceof HttpError) return { refused: e.message };
      throw e;
    }
  }
  const record = recordOf(await userLicences(env, uid));
  const payload = entitlement(account, record, now);
  if (!payload) return { refused: record.trial ? "the trial has ended" : "this account has no licence yet" };
  return { licence: await signLine(payload, (await keys(env)).privateKey) };
}

async function b64urlSha256(text: string): Promise<string> {
  return b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

/** `POST /licence {code, verifier, trial?}`: the grant and the PKCE verifier, traded for a licence and a renewal token. */
export async function licence(env: AppEnv, req: Request, now = seconds()) {
  const b = await body<{ code?: string; verifier?: string; trial?: { edition?: string } }>(req);
  const g = await get<{ uid: string; account: string; challenge: string }>(env.KV, `grant:${String(b.code ?? "")}`);
  if (!g) return json({ refused: "that sign-in has expired" }, 400);
  await env.KV.delete(`grant:${b.code}`);
  if ((await b64urlSha256(String(b.verifier ?? ""))) !== g.challenge) return json({ refused: "that sign-in was not this djmanzo's" }, 400);
  const renew = randomId(32);
  await put(env.KV, `renew:${await sha256(renew)}`, { uid: g.uid, account: g.account });
  return { ...(await licenceFor(env, g.uid, g.account, now, b.trial)), renew, account: g.account };
}

/** `POST /renew {renew, trial?}`: a fresh licence, in the background. */
export async function renew(env: AppEnv, req: Request, now = seconds()) {
  const b = await body<{ renew?: string; trial?: { edition?: string } }>(req);
  const r = await get<{ uid: string; account: string }>(env.KV, `renew:${await sha256(String(b.renew ?? ""))}`);
  if (!r) return json({ refused: "sign in again" }, 401);
  return { ...(await licenceFor(env, r.uid, r.account, now, b.trial)), account: r.account };
}

/** `POST /signout {renew}`: forget a renewal token. */
export async function signout(env: AppEnv, req: Request) {
  const b = await body<{ renew?: string }>(req);
  if (b.renew) await env.KV.delete(`renew:${await sha256(String(b.renew))}`);
  return { ok: true };
}

/**
 * A signed-in person's licence line, to paste into djmanzo (Settings →
 * Licence) on a machine that cannot sign in itself. Only for an account a
 * provider vouches for: the line names that account.
 */
export async function lineFor(env: AppEnv, user: User, now = seconds()): Promise<Answer & { account?: string }> {
  const id = user.identities.find((i) => i.provider !== "demo" && i.provider !== "owner");
  if (!id) return { refused: "Sign in with Google, Apple, GitHub, Microsoft or Discord to get a licence for djmanzo." };
  const account = `${id.provider}:${id.sub}`;
  return { ...(await licenceFor(env, user.id, account, now)), account };
}
