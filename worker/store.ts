/**
 * Everything the site keeps, in one KV namespace, by key prefix.
 *
 * | prefix | holds |
 * |---|---|
 * | `user:<uid>` | a person, with the sign-in identities linked to them |
 * | `ident:<provider>:<sub>` | which person a provider's account belongs to |
 * | `email:<address>` | which person a verified address belongs to |
 * | `session:<sid>` | a browser's sign-in (30 days) |
 * | `grant:<code>` | djmanzo's sign-in, waiting for it to fetch its licence (2 minutes) |
 * | `renew:<sha256>` | the account a renewal token belongs to (`worker/applicence.ts`) |
 * | `order:<oid>` | a purchase, paid or not |
 * | `licence:<lid>` / `licences:<uid>` | a licence, and a person's list of them |
 * | `trial:<uid>` | that a person has had their seven days (never expires) |
 * | `promo:<CODE>` / `promouse:<CODE>:<who>` | a promo code or voucher, and who used it |
 * | `voucher:<ID>` | a signed voucher (`worker/voucher.ts`): its line, who took it, whether it was withdrawn |
 * | `cache:release` / `cache:updater:<tag>` / `cache:releases` | GitHub's latest release, its updater manifest and the three newest releases, for ten minutes (`worker/update.ts`) |
 * | `wish:<id>` / `vote:<id>:<who>` | the wishlist, and its votes |
 * | `comment:<kind>:<inverted time>:<id>` | testimonials, comments and samples, newest first |
 * | `post:<slug>:<lang>` / `index:posts` | blog posts, and the list of them |
 * | `profile:<uid>` | what a person told the island about their music |
 * | `config:*` | the owner's settings: videos, the dev signing key |
 *
 * KV is eventually consistent and last-write-wins. Nothing here needs more:
 * a promo code's use count may run one over its limit across two continents
 * in the same second, and that is accepted rather than paid for with a
 * Durable Object.
 */

import type { Edition, Module, Plan, Currency } from "../shared/catalog";
import type { Band } from "../shared/regions";

export async function get<T>(kv: KVNamespace, key: string): Promise<T | null> {
  return (await kv.get<T>(key, "json")) ?? null;
}

export async function put(kv: KVNamespace, key: string, value: unknown, ttl?: number, metadata?: unknown): Promise<void> {
  await kv.put(key, JSON.stringify(value), {
    ...(ttl ? { expirationTtl: Math.max(60, ttl) } : {}),
    ...(metadata ? { metadata } : {}),
  });
}

/** Every key under a prefix, with metadata, following KV's cursor. Capped so a listing never runs away. */
export async function list<M>(kv: KVNamespace, prefix: string, cap = 1000): Promise<{ name: string; metadata: M | null }[]> {
  const out: { name: string; metadata: M | null }[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list<M>({ prefix, cursor, limit: 1000 });
    for (const k of page.keys) out.push({ name: k.name, metadata: (k.metadata as M) ?? null });
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && out.length < cap);
  return out.slice(0, cap);
}

export interface Identity {
  provider: string;
  sub: string;
}

export interface User {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  identities: Identity[];
  createdAt: number;
  /** Made by the demo sign-in; never holds a real licence. */
  demo?: boolean;
  /** Made by the admin token; has no provider identity. */
  owner?: boolean;
  /** A student or teacher, marked by the crew after seeing proof (an academic address needs no marking). */
  student?: boolean;
  /** Their own Patreon page, as Patreon said when they connected it: shown as verified. */
  patreon?: string;
  /** The Patreon campaigns they were an active patron of when they last connected it. */
  patronOf?: string[];
  /** The GitHub accounts they sponsored when they last signed in with GitHub, lower-cased. */
  sponsorOf?: string[];
  /** Their own GitHub Sponsors page, when GitHub said they have one: shown as verified. */
  githubSponsors?: string;
}

export interface Session {
  uid: string;
  createdAt: number;
}

export interface Order {
  id: string;
  uid: string;
  edition: Edition;
  /** Custom's modules, as chosen. */
  modules?: Module[];
  plan: Plan;
  currency: Currency;
  /** The list price, the price after the regional or student discount, the promo's discount and what was charged, all in cents. */
  base: number;
  regional: number;
  discount: number;
  total: number;
  /** An upgrade: the licence it replaces and what it was worth. */
  upgrade?: { from: string; credit: number } | null;
  student?: boolean;
  band: Band;
  claimedBand: Band;
  proof: { instrument?: string | null; billing?: string | null; reason: string };
  promo?: string | null;
  /** The signed voucher that paid for it, or took money off it (`worker/voucher.ts`). */
  voucher?: string | null;
  provider: "stripe" | "paypal" | "transfer" | "demo" | "free" | "voucher" | "trial" | "grant";
  providerRef?: string | null;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  /** A PayPal or prepaid plan does not renew; a Stripe subscription does. */
  renews: boolean;
  licence?: string | null;
  createdAt: number;
  paidAt?: number;
  email?: string | null;
  name?: string | null;
  /**
   * Bought as a gift: paying for it mints a signed gift voucher for the
   * edition (`worker/voucher.ts`) instead of a licence for the buyer, held to
   * `for` when the buyer named the person, with the buyer's note.
   */
  gift?: { for: string[]; note: string | null; voucher?: string | null } | null;
  /** Granted by the crew in Backstage: who, and why. */
  granted?: { by: string; why: string | null } | null;
}

export interface Licence {
  id: string;
  uid: string;
  edition: Edition;
  /** Custom's modules. Every other edition's are `dj_core::edition`'s, and are not stored. */
  modules?: Module[];
  plan: Plan;
  /** The major version a perpetual licence covers. */
  major: number;
  status: "active" | "cancelled" | "expired" | "revoked" | "upgraded";
  /** Milliseconds; null for a perpetual licence. */
  expires: number | null;
  order: string;
  demo?: boolean;
  createdAt: number;
  /** Stripe's subscription id, so a renewal can find its licence. */
  subscription?: string | null;
}

export interface Promo {
  code: string;
  /** percent: `value` is 1–100. fixed: `value` is cents off. voucher: grants `grants` with no payment. */
  kind: "percent" | "fixed" | "voucher";
  value: number;
  grants?: { edition: Edition; plan: Plan; months?: number } | null;
  editions?: Edition[] | null;
  plans?: Plan[] | null;
  maxUses?: number | null;
  uses: number;
  /** How many times one person may use it; one by default. */
  perPerson?: number | null;
  starts?: number | null;
  expires?: number | null;
  /** An individual code: the only e-mail address (or user id) that may use it. */
  boundTo?: string | null;
  campaign?: string | null;
  note?: string | null;
  active: boolean;
  createdAt: number;
  createdBy: string;
}

export type WishStatus = "idea" | "considering" | "planned" | "building" | "shipped" | "not-planned";

export interface Wish {
  id: string;
  title: string;
  body: string;
  author: string;
  uid?: string | null;
  votes: number;
  status: WishStatus;
  note?: string | null;
  tag?: string | null;
  createdAt: number;
  /** Seeded from the roadmap rather than written by a visitor. */
  seeded?: boolean;
}

export interface WishMeta {
  t: string;
  s: WishStatus;
  v: number;
  c: number;
  a: string;
  g?: string | null;
  n?: string | null;
}

export type CommentKind = "testimonial" | "comment" | "sample";

export interface Comment {
  id: string;
  kind: CommentKind;
  /** Which place on the island it was left at, for comments. */
  station?: string | null;
  body: string;
  author: string;
  uid?: string | null;
  rating?: number | null;
  /** For a sample: a YouTube, SoundCloud or Mixcloud link. */
  link?: string | null;
  role?: string | null;
  genre?: string | null;
  approved: boolean;
  createdAt: number;
}

export interface Post {
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  genre?: string | null;
  edition?: Edition | null;
  cover?: string | null;
  published: boolean;
  createdAt: number;
  updatedAt: number;
  author: string;
  /** "ai:claude", "ai:workers-ai" or "human" — shown on the post. */
  source: string;
}

export interface PostSummary {
  slug: string;
  lang: string;
  title: string;
  excerpt: string;
  tags: string[];
  genre?: string | null;
  cover?: string | null;
  published: boolean;
  updatedAt: number;
  source: string;
}

export interface Video {
  /** A YouTube video id. */
  id: string;
  title: string;
  edition?: Edition | null;
  genre?: string | null;
  /** The Signal Path stage it shows the application for; that stage's reveal offers it beside the screenshot. */
  stage?: string | null;
}

/**
 * KV metadata may be at most 1024 bytes. Shorten `fields`, in order, until it
 * fits — counted in UTF-8 bytes, because "canción" is longer than it looks.
 */
export function fit<T extends object>(meta: T, ...fields: (keyof T)[]): T {
  const size = (o: unknown) => new TextEncoder().encode(JSON.stringify(o)).length;
  const out = { ...meta } as Record<string, unknown>;
  for (const f of fields as string[]) {
    while (size(out) > 1000 && typeof out[f] === "string" && (out[f] as string).length > 0) {
      const s = out[f] as string;
      out[f] = s.slice(0, Math.max(0, Math.floor(s.length * 0.8) - 1)) + (s.length > 4 ? "…" : "");
      if ((out[f] as string).length <= 1) out[f] = "";
    }
  }
  return out as T;
}

export function licenceMeta(l: Licence) {
  return { u: l.uid, e: l.edition, p: l.plan, s: l.status, d: !!l.demo };
}

export async function saveLicence(kv: KVNamespace, l: Licence): Promise<void> {
  await put(kv, `licence:${l.id}`, l, undefined, licenceMeta(l));
}
