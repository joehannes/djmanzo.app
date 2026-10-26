/**
 * How the shop takes money, set in Backstage rather than only as Worker
 * secrets, so the owner can connect, change or switch off a way to pay
 * without a deploy.
 *
 * The recommended setup for an Austrian sole trader paying out to Wise
 * (SETUP.md, "Payments"): one Stripe account, whose Payment Element takes
 * card, Apple Pay, Google Pay and — turned on in Stripe's dashboard —
 * PayPal and EPS, with payouts to the Wise EUR IBAN; PayPal on its own
 * (`worker/paypal.ts`) as an alternative; a bank transfer for the
 * Caribbean; the demo checkout for rehearsing.
 *
 * What is set here is kept in KV (`config:payments`) encrypted with
 * AES-GCM under a key derived (HKDF) from the Worker's own secret — the
 * licence signing key, or the crew token — so a KV dump alone gives away
 * no payment key. A value set here wins over the Worker secret of the same
 * name; an empty one falls back to it. Backstage only ever sees a secret's
 * last four characters.
 */

import type { AppEnv } from "./env";
import { b64url, fail, unb64url } from "./http";

/** What Backstage may set, and whether each is a secret (shown only as its last four characters). */
export const FIELDS = {
  STRIPE_PUBLISHABLE_KEY: { secret: false, check: /^pk_(live|test)_[A-Za-z0-9]{10,}$/ },
  STRIPE_SECRET_KEY: { secret: true, check: /^(sk|rk)_(live|test)_[A-Za-z0-9]{10,}$/ },
  STRIPE_WEBHOOK_SECRET: { secret: true, check: /^whsec_[A-Za-z0-9+/=]{10,}$/ },
  PAYPAL_CLIENT_ID: { secret: false, check: /^[A-Za-z0-9_-]{20,}$/ },
  PAYPAL_CLIENT_SECRET: { secret: true, check: /^[A-Za-z0-9_-]{20,}$/ },
  PAYPAL_ENV: { secret: false, check: /^(live|sandbox)$/ },
  BANK_TRANSFER_DETAILS: { secret: false, check: /^[\s\S]{10,2000}$/ },
  DEMO_MODE: { secret: false, check: /^(auto|on|off)$/ },
  RESEND_API_KEY: { secret: true, check: /^re_[A-Za-z0-9_]{10,}$/ },
  MAIL_FROM: { secret: false, check: /^[^<>\n]{0,80}<?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/ },
  RECEIPT_NOTE: { secret: false, check: /^[^\n]{3,300}$/ },
} as const;
export type Field = keyof typeof FIELDS;

/** Switches on the card form: which wallets the Payment Element offers. */
export interface Wallets {
  applePay: boolean;
  googlePay: boolean;
}

export interface Settings {
  values: Partial<Record<Field, string>>;
  wallets: Wallets;
  at: number;
  by: string;
}

const EMPTY: Settings = { values: {}, wallets: { applePay: true, googlePay: true }, at: 0, by: "" };
const KEY = "config:payments";

/** A settings key: HKDF over the Worker's own secret, so it is never in KV; `info` keeps each kind of setting's key its own. */
async function cipherKey(env: AppEnv, info: string): Promise<CryptoKey | null> {
  const root = env.LICENCE_PRIVATE_KEY || env.ADMIN_TOKEN;
  if (!root) return null;
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(root), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new TextEncoder().encode("djmanzo-settings"), info: new TextEncoder().encode(info) },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Settings kept sealed in KV: null when none are kept, `unreadable` when they were sealed under a secret since changed. */
export async function sealedRead<T>(env: AppEnv, kvKey: string, info: string): Promise<{ value: T | null; unreadable: boolean }> {
  const raw = await env.KV.get(kvKey);
  if (!raw) return { value: null, unreadable: false };
  const key = await cipherKey(env, info);
  if (!key) return { value: null, unreadable: true };
  try {
    const { iv, data } = JSON.parse(raw) as { iv: string; data: string };
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64url(iv) }, key, unb64url(data));
    return { value: JSON.parse(new TextDecoder().decode(plain)) as T, unreadable: false };
  } catch {
    // Kept under another secret (the licence key was changed): set the keys again.
    return { value: null, unreadable: true };
  }
}

export async function sealedWrite(env: AppEnv, kvKey: string, info: string, value: unknown): Promise<void> {
  const key = await cipherKey(env, info);
  if (!key) fail(503, "Set the LICENCE_PRIVATE_KEY (or ADMIN_TOKEN) Worker secret first: keys set here are kept encrypted under it.");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(value)));
  await env.KV.put(kvKey, JSON.stringify({ iv: b64url(iv), data: b64url(new Uint8Array(data)) }));
}

/** The settings as kept, or the empty ones (none kept yet, or kept under a secret since changed). */
export async function read(env: AppEnv): Promise<Settings & { unreadable?: boolean }> {
  const { value, unreadable } = await sealedRead<Settings>(env, KEY, "payments-v1");
  if (unreadable) return { ...EMPTY, unreadable: true };
  if (!value) return EMPTY;
  return { ...EMPTY, ...value, wallets: { ...EMPTY.wallets, ...value.wallets } };
}

async function write(env: AppEnv, s: Settings): Promise<void> {
  await sealedWrite(env, KEY, "payments-v1", s);
  cached = null;
}

/** The Worker's own environment, under the settings laid over it for this request. */
export const RAW = Symbol("the Worker's own environment");
export const rawOf = (env: AppEnv): AppEnv => ((env as unknown as Record<symbol, AppEnv>)[RAW] ?? env);

/** The change Backstage asks for: a field's new value, "" to clear it (back to the Worker secret), absent to keep it. */
export interface Change {
  values?: Partial<Record<Field, string>>;
  wallets?: Partial<Wallets>;
}

export async function update(env: AppEnv, change: Change, by: string): Promise<Settings> {
  const now = await read(env);
  const values = { ...now.values };
  for (const [k, v] of Object.entries(change.values ?? {})) {
    if (!(k in FIELDS)) fail(400, `There is no setting called ${k}.`);
    const field = k as Field;
    const value = String(v ?? "").trim();
    if (!value) {
      delete values[field];
      continue;
    }
    if (!FIELDS[field].check.test(value)) fail(400, `That does not look like a ${field.replace(/_/g, " ").toLowerCase()}.`);
    values[field] = value;
  }
  const wallets = { ...now.wallets, ...Object.fromEntries(Object.entries(change.wallets ?? {}).map(([k, v]) => [k, !!v])) } as Wallets;
  // A live key and a test key do not pay together.
  const pk = values.STRIPE_PUBLISHABLE_KEY ?? rawOf(env).STRIPE_PUBLISHABLE_KEY;
  const sk = values.STRIPE_SECRET_KEY ?? rawOf(env).STRIPE_SECRET_KEY;
  if (pk && sk && pk.includes("_live_") !== sk.includes("_live_")) fail(400, "One Stripe key is live and the other a test key: use a pair from the same mode.");
  const next: Settings = { values, wallets, at: Date.now(), by };
  await write(env, next);
  return next;
}

/** What Backstage is shown: each field's source and, for a secret, only its end. */
export async function view(given: AppEnv) {
  const env = rawOf(given);
  const s = await read(env);
  const fields = Object.fromEntries(
    (Object.keys(FIELDS) as Field[]).map((f) => {
      const here = s.values[f];
      const secret = env[f as keyof AppEnv] as string | undefined;
      const value = here ?? secret ?? "";
      const shown = !value ? "" : FIELDS[f].secret ? `…${value.slice(-4)}` : value;
      return [f, { set: !!value, from: here ? "backstage" : secret ? "worker secret" : null, shown }];
    }),
  );
  return { fields, wallets: s.wallets, at: s.at || null, by: s.by || null, unreadable: !!s.unreadable, mode: modeOf(await withPayments(given)) };
}

/** Which ways to pay are live, from the settings in force. */
export function modeOf(env: AppEnv) {
  const stripe = !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY);
  return {
    stripe: stripe ? (String(env.STRIPE_SECRET_KEY).includes("_live_") ? "live" : "test") : null,
    stripeWebhook: !!env.STRIPE_WEBHOOK_SECRET,
    paypal: env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET ? (env.PAYPAL_ENV === "live" ? "live" : "sandbox") : null,
    transfer: !!env.BANK_TRANSFER_DETAILS,
  };
}

let cached: { at: number; settings: Settings & { unreadable?: boolean }; kv: KVNamespace; root: string } | null = null;

/**
 * The environment with Backstage's payment settings laid over the Worker's
 * secrets, for one request. Read at most every thirty seconds per Worker, so
 * a change shows within half a minute everywhere.
 */
export async function withPayments(given: AppEnv): Promise<AppEnv> {
  const env = rawOf(given);
  if (!env.KV) return env;
  const root = env.LICENCE_PRIVATE_KEY || env.ADMIN_TOKEN || "";
  if (!cached || cached.kv !== env.KV || cached.root !== root || Date.now() - cached.at > 30_000) cached = { at: Date.now(), settings: await read(env), kv: env.KV, root };
  const v = cached.settings.values;
  if (!Object.keys(v).length) return env;
  return { ...env, ...v, [RAW]: env } as AppEnv;
}

/** The card form's wallets, as Backstage set them. */
export async function wallets(env: AppEnv): Promise<Wallets> {
  await withPayments(env);
  return cached?.settings.wallets ?? EMPTY.wallets;
}

// --- Which of Stripe's ways to pay are offered ---------------------------------------------

/**
 * The ways to pay this checkout finishes, beside the card (which carries
 * Apple Pay and Google Pay). One payment: the card, Link, and those that
 * leave the page and come back (EPS, PayPal, iDEAL, Bancontact), or clear
 * a few days later (SEPA Direct Debit, finished by the webhook). What
 * renews: the card and Link only. Klarna and the rest are not offered,
 * whatever Stripe's dashboard says, until the checkout is made to finish them.
 */
export const ONCE = ["card", "link", "eps", "paypal", "sepa_debit", "ideal", "bancontact"] as const;
export const RENEWING = ["card", "link"] as const;

export interface StripeMethods {
  /** What Stripe's dashboard has switched on for this account. */
  enabled: string[];
  once: string[];
  renewing: string[];
  applePay: boolean;
  googlePay: boolean;
}

/**
 * What the account has switched on (its default payment method configuration),
 * asked of Stripe at most every ten minutes (kept in KV, so every Worker shares
 * it), and what of it is offered here. Unreadable, it is the card alone: the
 * one way to pay every account has.
 */
export async function stripeMethods(env: AppEnv): Promise<StripeMethods> {
  const key = String(env.STRIPE_SECRET_KEY ?? "");
  const cardOnly: StripeMethods = { enabled: ["card"], once: ["card"], renewing: ["card"], applePay: false, googlePay: false };
  if (!key) return cardOnly;
  const kvKey = `stripe:methods:${key.slice(-8)}`;
  const kept = await env.KV.get(kvKey);
  if (kept) return JSON.parse(kept) as StripeMethods;
  const r = await fetch("https://api.stripe.com/v1/payment_method_configurations?limit=20", { headers: { authorization: `Bearer ${key}` } }).catch(() => null);
  const list = r?.ok ? (((await r.json()) as { data?: Record<string, any>[] }).data ?? []) : [];
  const config = list.find((c) => c.is_default && c.active) ?? list.find((c) => c.active && !c.parent) ?? null;
  if (!config) return cardOnly;
  const on = (m: string) => !!config[m]?.available && config[m]?.display_preference?.value === "on";
  const enabled = Object.keys(config).filter((k) => typeof config[k] === "object" && config[k] !== null && "available" in config[k] && on(k));
  const value: StripeMethods = {
    enabled,
    once: ["card", ...ONCE.filter((m) => m !== "card" && on(m))],
    renewing: ["card", ...RENEWING.filter((m) => m !== "card" && on(m))],
    applePay: on("apple_pay"),
    googlePay: on("google_pay"),
  };
  await env.KV.put(kvKey, JSON.stringify(value), { expirationTtl: 600 });
  return value;
}

// --- Checks the crew can run ---------------------------------------------------------

/** Ask Stripe and PayPal whether the keys work, and what Stripe says about payouts. */
export async function check(env: AppEnv, origin: string) {
  const out: Record<string, unknown> = {};
  if (env.STRIPE_SECRET_KEY) {
    const r = await fetch("https://api.stripe.com/v1/account", { headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }).catch(() => null);
    const a = r?.ok ? ((await r.json()) as Record<string, any>) : null;
    const host = new URL(origin).hostname;
    const d = r?.ok ? await fetch(`https://api.stripe.com/v1/payment_method_domains?domain_name=${encodeURIComponent(host)}`, { headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }).catch(() => null) : null;
    const domain = d?.ok ? ((await d.json()) as { data?: Record<string, any>[] }).data?.[0] : null;
    out.stripe = a
      ? {
          ok: true,
          country: a.country ?? null,
          currency: a.default_currency ?? null,
          charges: !!a.charges_enabled,
          payouts: !!a.payouts_enabled,
          payoutTo: a.external_accounts?.data?.[0] ? `${a.external_accounts.data[0].bank_name ?? "a bank"} …${a.external_accounts.data[0].last4 ?? ""}` : null,
          applePayDomain: domain ? { domain: domain.domain_name, applePay: domain.apple_pay?.status ?? null, googlePay: domain.google_pay?.status ?? null } : null,
          methods: await stripeMethods(env),
        }
      : { ok: false, said: r ? `Stripe answered ${r.status}.` : "Stripe could not be reached." };
  }
  if (env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET) {
    const base = env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    const r = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: { authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`, "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    }).catch(() => null);
    out.paypal = r?.ok ? { ok: true, mode: env.PAYPAL_ENV === "live" ? "live" : "sandbox" } : { ok: false, said: r ? `PayPal answered ${r.status}.` : "PayPal could not be reached." };
  }
  return out;
}

/** Register this site's domain with Stripe, so Apple Pay and Google Pay show in the card form here. */
export async function registerDomain(env: AppEnv, origin: string) {
  if (!env.STRIPE_SECRET_KEY) fail(400, "Connect Stripe first.");
  const host = new URL(origin).hostname;
  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) fail(400, "Apple Pay needs the site's real domain, not a local address.");
  const r = await fetch("https://api.stripe.com/v1/payment_method_domains", {
    method: "POST",
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" },
    body: `domain_name=${encodeURIComponent(host)}`,
  }).catch(() => null);
  const d = r ? ((await r.json().catch(() => ({}))) as Record<string, any>) : {};
  if (!r?.ok) fail(502, d.error?.message ? `Stripe said: ${d.error.message}` : "Stripe did not register the domain.");
  return { domain: d.domain_name ?? host, applePay: d.apple_pay?.status ?? null, googlePay: d.google_pay?.status ?? null };
}
