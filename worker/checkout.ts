/**
 * The box office: a quote, a payment, a licence.
 *
 * Every path ends in `issue`, and every path prices through `quote`, so a
 * card, PayPal, a bank transfer, a voucher and the demo cannot disagree about
 * what djmanzo costs or what a buyer gets for it.
 *
 * The regional price is *claimed* when the quote is made (the buyer picks
 * where they are; the island guesses from the IP) and *proven* when the
 * payment is made (`shared/regions.ts`). When the proof does not back the
 * claim the buyer is told the price it does back and asked again — nobody is
 * charged a price they did not see.
 */

import {
  EDITIONS,
  EDITION_INFO,
  NAMED,
  PLANS,
  PLAN_INFO,
  betterThanCustom,
  isModule,
  modulesOf,
  money,
  within,
  type Currency,
  type Edition,
  type Module,
  type Plan,
} from "../shared/catalog";
import { academic, band, currencyFor, proven, regional, studentPrice, type Band, type Proof, EMBARGOED } from "../shared/regions";
import type { AppEnv } from "./env";
import { demoMode } from "./auth";
import { fail, randomId } from "./http";
import { inForce, termEnd } from "./licence";
import { consume, judge, lookup, usedBy, type Judgement } from "./promo";
import { stripe, verifyWebhook } from "./stripe";
import * as voucher from "./voucher";
import { paypal } from "./paypal";
import { get, put, saveLicence, type Licence, type Order, type User } from "./store";

type Bought = Exclude<Plan, "trial">;

export interface QuoteInput {
  edition: Edition;
  plan: Bought;
  /** Custom's modules. */
  modules?: Module[];
  promo?: string | null;
  /** A signed discount voucher's line (`worker/voucher.ts`). */
  voucher?: string | null;
  /** The country the buyer says they are in. */
  country?: string | null;
  /** Bought for someone else: a gift voucher instead of a licence (buy once only). */
  gift?: { for?: string | null; note?: string | null } | null;
}

export interface Quote {
  edition: Edition;
  modules: Module[];
  plan: Bought;
  currency: Currency;
  country: string | null;
  band: Band;
  /** The list price. */
  base: number;
  /** After the larger of the regional and the student discount — they never stack. */
  regional: number;
  /** Which discount that was. */
  by: "list" | "region" | "student";
  /** An upgrade from a licence already held: what it is worth here. */
  upgrade: { from: string; edition: Edition; credit: number } | null;
  /** The promo code's or the voucher's discount, whichever takes more: they never stack. */
  discount: number;
  total: number;
  promo: (Judgement & { code: string }) | null;
  /** A signed voucher's judgement; `ok` only when it is the discount applied. */
  voucher: (Judgement & { id: string; percent: number }) | null;
  renews: boolean;
  /** For Custom: an edition carrying the same for no more money. */
  better: Edition | null;
}

export function checkInput(input: Partial<QuoteInput>): QuoteInput {
  if (!EDITIONS.includes(input.edition as Edition)) fail(400, `Pick an edition: ${EDITIONS.join(", ")}.`);
  if (!PLANS.includes(input.plan as Bought)) fail(400, "Pick a plan: buy once, monthly or yearly.");
  if (input.edition === "hobbyist") fail(400, "The Hobbyist edition is free, for ever: download djmanzo and it is yours.");
  const country = input.country ? String(input.country).toUpperCase().slice(0, 2) : null;
  if (country && EMBARGOED.has(country)) fail(451, "We cannot take payment for this country.");
  const modules = input.edition === "custom" ? modulesOf("custom", (Array.isArray(input.modules) ? input.modules : []).filter(isModule)) : undefined;
  if (input.edition === "custom" && !modules!.length) fail(400, "Pick at least one module for Custom — the Hobbyist edition is the foundation alone.");
  // A voucher line typed into the promo box is a voucher.
  const line = input.voucher ? String(input.voucher) : voucher.isVoucherLine(input.promo) ? String(input.promo) : null;
  const promo = input.promo && !voucher.isVoucherLine(input.promo) ? String(input.promo) : null;
  const gift = input.gift ? giftOf(input.gift) : null;
  if (gift && input.plan !== "perpetual") fail(400, "A gift is an edition bought once: a subscription would go on charging you.");
  return { edition: input.edition as Edition, plan: input.plan as Bought, modules, promo, voucher: line ? line.slice(0, 4096) : null, country, gift };
}

/** A gift's recipient and note, as the buyer typed them: an e-mail address (or none, for whoever they hand it to) and a short message. */
export function giftOf(g: { for?: string | null; note?: string | null }): { for: string | null; note: string | null } {
  const to = String(g.for ?? "").trim().toLowerCase();
  if (to && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) fail(400, "A gift is held to an e-mail address, or to nobody: leave it empty to hand the voucher over yourself.");
  const note = String(g.note ?? "").trim().slice(0, voucher.MOST_NOTE - 40);
  return { for: to || null, note: note || null };
}

/** Whether a buyer pays the student and teacher price: marked by the crew, or a verified school address. */
export function isStudent(env: AppEnv, user: User | null): boolean {
  if (!user || user.demo) return false;
  const extra = String(env.STUDENT_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return !!user.student || academic(user.email, extra);
}

/** The discounted price of an edition for this buyer: the larger of the two discounts, never both. */
function discounted(edition: Edition, plan: Bought, b: Band, student: boolean, chosen: readonly string[] = []): { price: number; by: Quote["by"] } {
  const r = regional(edition, plan, b, chosen);
  const s = student ? studentPrice(edition, plan, chosen) : Infinity;
  if (s < r) return { price: s, by: "student" };
  return { price: r, by: b === 1 ? "list" : "region" };
}

/**
 * The best licence this buyer already owns outright that the new one carries
 * everything of: buying once, an upgrade costs the difference between the
 * two editions (EDITIONS.md). Priced as the buyer would pay for it today.
 */
async function upgradeFrom(env: AppEnv, user: User | null, input: QuoteInput, b: Band, student: boolean): Promise<Quote["upgrade"]> {
  // A gift is a whole edition for someone else: the buyer's own licence is no credit towards it.
  if (!user || input.plan !== "perpetual" || input.gift) return null;
  const target = modulesOf(input.edition, input.modules);
  let best: Quote["upgrade"] = null;
  for (const l of await userLicences(env, user.id)) {
    // A demo licence is worth something only towards another demo licence.
    if (l.plan !== "perpetual" || !inForce(l) || (l.demo && !user.demo)) continue;
    const held = modulesOf(l.edition, l.modules);
    if (!within(held, target) || held.length === target.length) continue;
    const credit = discounted(l.edition, "perpetual", b, student, l.modules).price;
    if (!best || credit > best.credit) best = { from: l.id, edition: l.edition, credit };
  }
  return best;
}

export async function quote(env: AppEnv, user: User | null, input: QuoteInput, atBand?: Band): Promise<Quote> {
  const b = atBand ?? band(input.country);
  const student = isStudent(env, user);
  const chosen = input.modules ?? [];
  const { price, by } = discounted(input.edition, input.plan, b, student, chosen);
  const upgrade = await upgradeFrom(env, user, input, b, student);
  const due = Math.max(0, price - (upgrade ? Math.min(upgrade.credit, price) : 0));
  let promo: Quote["promo"] = null;
  let discount = 0;
  if (input.promo) {
    const p = await lookup(env, input.promo);
    const used = await usedBy(env, input.promo, user);
    const j = judge(p, { edition: input.edition, plan: input.plan, amount: due }, { email: user?.email ?? null, uid: user?.id ?? null }, used);
    promo = { ...j, code: p?.code ?? input.promo.toUpperCase() };
    if (j.ok) discount = j.discount;
  }
  let v: Quote["voucher"] = null;
  if (input.voucher) {
    v = await judgeVoucher(env, user, input);
    // A voucher's percentage is off the list price, in place of the regional, student and promo discounts: the larger applies.
    const list = regional(input.edition, input.plan, 1, chosen);
    const after = list - Math.round((list * v.percent) / 100);
    const owed = Math.max(0, after - (upgrade ? Math.min(upgrade.credit, after) : 0));
    if (v.ok && due - owed > discount) {
      discount = due - owed;
      v = { ...v, discount };
      if (promo?.ok) promo = { ...promo, ok: false, discount: 0, reason: "The voucher takes more off; discounts do not stack." };
    } else if (v.ok) {
      v = { ...v, ok: false, reason: `${v.reason} Your price is already lower; discounts do not stack.` };
    }
  }
  return {
    edition: input.edition,
    modules: modulesOf(input.edition, chosen),
    plan: input.plan,
    currency: currencyFor(input.country),
    country: input.country ?? null,
    band: b,
    base: regional(input.edition, input.plan, 1, chosen),
    regional: price,
    by,
    upgrade,
    discount,
    total: due - discount,
    promo,
    voucher: v,
    renews: input.plan !== "perpetual",
    better: input.edition === "custom" ? betterThanCustom(chosen) : null,
  };
}

/** Whether a signed discount voucher may be used on this purchase by this person, and the percentage it takes off the list price. */
async function judgeVoucher(env: AppEnv, user: User | null, input: QuoteInput): Promise<Judgement & { id: string; percent: number }> {
  const line = input.voucher ?? "";
  const read = await voucher.readVoucher(line, await voucher.trustedKeys(env));
  const no = (reason: string, id = "") => ({ ok: false, discount: 0, reason, id, percent: 0 });
  if (!read.payload) return no(read.refused);
  const p = read.payload;
  if (voucher.gives(p) === "gift") return no("That voucher is a gift: take it at /redeem, with nothing to pay.", p.id);
  const { record, refused } = await voucher.standing(env, p, line);
  if (refused) return no(refused, p.id);
  if (p.edition !== input.edition) return no(`That voucher is for djmanzo ${EDITION_INFO[p.edition].name}.`, p.id);
  if (p.edition === "custom" && [...modulesOf("custom", (p.modules ?? "").split(",") as Module[])].sort().join() !== [...(input.modules ?? [])].sort().join()) {
    return no(`That voucher is for Custom with ${p.modules!.split(",").join(", ")}.`, p.id);
  }
  if (p.for?.length) {
    if (!user) return no("That voucher was made for somebody: sign in with the account or address it was sent to.", p.id);
    if (!voucher.allows(p, { account: accountsOf(user), email: user.email })) return no("That voucher was made for somebody else — sign in with the account or address it was sent to.", p.id);
  }
  if (user && record.taken.some((t) => t.uid === user.id)) return no("You have already used that voucher.", p.id);
  return { ok: true, discount: 0, reason: `${p.percent} % off the list price${input.plan === "perpetual" ? "" : ", on the first payment"}.`, id: p.id, percent: p.percent };
}

/** The accounts a person signs in to djmanzo as, the way a licence names them. */
export function accountsOf(user: User): string[] {
  return user.identities.filter((i) => i.provider !== "demo" && i.provider !== "owner").map((i) => `${i.provider}:${i.sub}`);
}

function describe(q: Quote): string {
  const custom = q.edition === "custom" ? ` (${q.modules.join(", ")})` : "";
  const up = q.upgrade ? `, upgrade from ${EDITION_INFO[q.upgrade.edition].name}` : "";
  return `djmanzo ${EDITION_INFO[q.edition].name}${custom} — ${PLAN_INFO[q.plan].name}${up}`;
}

async function newOrder(env: AppEnv, user: User, q: Quote, claimed: Band, proof: Order["proof"], provider: Order["provider"], renews: boolean, gift: QuoteInput["gift"] = null): Promise<Order> {
  const order: Order = {
    id: `o_${randomId(12)}`,
    uid: user.id,
    edition: q.edition,
    ...(q.edition === "custom" ? { modules: q.modules } : {}),
    plan: q.plan,
    currency: q.currency,
    base: q.base,
    regional: q.regional,
    discount: q.discount,
    total: q.total,
    upgrade: q.upgrade ? { from: q.upgrade.from, credit: q.upgrade.credit } : null,
    student: q.by === "student",
    band: q.band,
    claimedBand: claimed,
    proof,
    promo: q.promo?.ok ? q.promo.code : null,
    voucher: q.voucher?.ok ? q.voucher.id : null,
    provider,
    status: "pending",
    renews,
    createdAt: Date.now(),
    email: user.email,
    name: user.name,
    ...(gift ? { gift: { for: gift.for ? [gift.for] : [], note: gift.note ?? null, voucher: null } } : {}),
  };
  await put(env.KV, `order:${order.id}`, order, undefined, { u: user.id, s: order.status, t: order.total, c: order.currency, e: order.edition, p: order.plan, v: provider, at: order.createdAt });
  return order;
}

async function saveOrder(env: AppEnv, order: Order): Promise<void> {
  await put(env.KV, `order:${order.id}`, order, undefined, { u: order.uid, s: order.status, t: order.total, c: order.currency, e: order.edition, p: order.plan, v: order.provider, at: order.createdAt });
}

export async function userLicences(env: AppEnv, uid: string): Promise<Licence[]> {
  const ids = (await get<string[]>(env.KV, `licences:${uid}`)) ?? [];
  const all = await Promise.all(ids.map((id) => get<Licence>(env.KV, `licence:${id}`)));
  return all.filter((l): l is Licence => !!l);
}

/**
 * Turn a paid order into a licence. Idempotent: an order that already has
 * one returns it, so a webhook and a browser finishing the same payment
 * cannot make two.
 */
export async function issue(env: AppEnv, order: Order, user: User, opts: { expires?: number | null; subscription?: string | null; months?: number } = {}): Promise<{ licence: Licence; gift?: undefined } | { gift: Gift; licence?: undefined }> {
  if (order.gift) return { gift: await giveGift(env, order, user) };
  if (order.licence) {
    const existing = await get<Licence>(env.KV, `licence:${order.licence}`);
    if (existing) return { licence: existing };
  }
  const licence: Licence = {
    id: `l_${randomId(12)}`,
    uid: user.id,
    edition: order.edition,
    ...(order.edition === "custom" ? { modules: order.modules ?? [] } : {}),
    plan: order.plan,
    major: Number(env.MAJOR_VERSION || 1),
    status: "active",
    expires: opts.expires !== undefined ? opts.expires : termEnd(order.plan, Date.now(), opts.months),
    order: order.id,
    demo: order.provider === "demo" || !!user.demo,
    createdAt: Date.now(),
    subscription: opts.subscription ?? null,
  };
  await put(env.KV, `licence:${licence.id}`, licence, undefined, { u: user.id, e: licence.edition, p: licence.plan, s: licence.status, d: !!licence.demo });
  const ids = (await get<string[]>(env.KV, `licences:${user.id}`)) ?? [];
  await put(env.KV, `licences:${user.id}`, [...ids, licence.id]);
  if (licence.subscription) await env.KV.put(`stripe:sub:${licence.subscription}`, licence.id);
  order.status = "paid";
  order.paidAt = Date.now();
  order.licence = licence.id;
  await saveOrder(env, order);
  if (order.promo) await consume(env, order.promo, user);
  if (order.voucher) await voucher.take(env, order.voucher, { uid: user.id, account: accountsOf(user)[0] ?? null, at: Date.now(), order: order.id });
  // The licence an upgrade was priced against is now inside the new one.
  if (order.upgrade?.from) {
    const old = await get<Licence>(env.KV, `licence:${order.upgrade.from}`);
    if (old && old.uid === user.id) {
      old.status = "upgraded";
      await saveLicence(env.KV, old);
    }
  }
  return { licence };
}

/** A gift bought: the voucher line to hand over, and where it is taken. */
export interface Gift {
  id: string;
  line: string;
  edition: Edition;
  modules?: string;
  for: string[];
  note: string | null;
  /** Taken by whom, once it has been. */
  taken: boolean;
  /** Made by the demo checkout: shown, never takeable. */
  rehearsal: boolean;
}

const giftOut = (r: voucher.VoucherRecord): Gift => ({
  id: r.payload.id,
  line: r.line,
  edition: r.payload.edition,
  ...(r.payload.modules ? { modules: r.payload.modules } : {}),
  for: r.payload.for ?? [],
  note: r.payload.note ?? null,
  taken: r.taken.length > 0,
  rehearsal: r.by?.startsWith("rehearsal:") ?? false,
});

/**
 * A paid gift order: a signed gift voucher for the edition (100 %, the
 * edition outright), held to the person the buyer named, with their note,
 * and kept among the buyer's gifts. Idempotent, as `issue` is: an order
 * that already has its voucher returns it.
 */
async function giveGift(env: AppEnv, order: Order, user: User): Promise<Gift> {
  const had = order.gift?.voucher ? await voucher.record(env, order.gift.voucher) : null;
  if (had) return giftOut(had);
  // The demo checkout takes no money, so what it makes must be worth none: a
  // gift line that is real and signed, but past its last day before it is
  // made, which djmanzo and /redeem both refuse.
  const rehearsal = order.provider === "demo" || !!user.demo;
  const from = rehearsal ? "A rehearsal from the demo shop, not a real gift" : user.name ? `A gift from ${user.name}` : "A gift";
  const note = [from, order.gift?.note].filter(Boolean).join(": ").slice(0, voucher.MOST_NOTE);
  const now = Math.floor(Date.now() / 1000);
  const [made] = await voucher.make(
    env,
    { edition: order.edition, modules: order.modules, percent: 100, for: order.gift?.for ?? [], note, count: 1, prefix: "MANZO-GIFT", ...(rehearsal ? { until: now - 1 } : {}) },
    `${rehearsal ? "rehearsal" : "gift"}:${order.id}`,
    now,
  );
  order.status = "paid";
  order.paidAt = Date.now();
  order.gift = { for: order.gift?.for ?? [], note: order.gift?.note ?? null, voucher: made.payload.id };
  await saveOrder(env, order);
  const gifts = (await get<string[]>(env.KV, `gifts:${user.id}`)) ?? [];
  await put(env.KV, `gifts:${user.id}`, [...gifts, made.payload.id]);
  if (order.promo) await consume(env, order.promo, user);
  if (order.voucher) await voucher.take(env, order.voucher, { uid: user.id, account: accountsOf(user)[0] ?? null, at: Date.now(), order: order.id });
  return giftOut(made);
}

/** The gifts an account has bought, newest first, with whether each has been taken. */
export async function giftsOf(env: AppEnv, uid: string): Promise<Gift[]> {
  const ids = (await get<string[]>(env.KV, `gifts:${uid}`)) ?? [];
  const all = await Promise.all(ids.map((id) => voucher.record(env, id)));
  return all.filter((r): r is voucher.VoucherRecord => !!r && !r.revoked).map(giftOut).reverse();
}

/**
 * The crew's grant: a licence put straight into an account, with nothing
 * to pay and nothing to redeem — for a friend, a tester, a refund made good.
 * The account is named by its id, a verified e-mail address or a sign-in
 * (`github:583231`). An order records who granted it and why.
 */
export async function grant(env: AppEnv, who: string, spec: { edition?: string; modules?: string[] | string; plan?: string; months?: number; why?: string | null }, by: string): Promise<{ order: Order; licence: Licence }> {
  const user = await findAccount(env, who);
  if (!user) fail(404, "No account by that id, e-mail address or sign-in. They need to sign in on the site once first.");
  if (!EDITIONS.includes(spec.edition as Edition) || spec.edition === "hobbyist") fail(400, `Grant one of: ${EDITIONS.filter((e) => e !== "hobbyist").join(", ")}.`);
  const plan = (spec.plan ?? "perpetual") as Plan;
  if (!(["perpetual", "yearly", "monthly", "trial"] as string[]).includes(plan)) fail(400, "Grant it bought once, monthly, yearly or as a trial.");
  const asked = Array.isArray(spec.modules) ? spec.modules : String(spec.modules ?? "").split(",");
  const modules = spec.edition === "custom" ? modulesOf("custom", asked.map((m) => m.trim()).filter(isModule)) : undefined;
  if (spec.edition === "custom" && !modules!.length) fail(400, "A Custom grant names its modules.");
  const months = plan === "monthly" || plan === "yearly" ? Math.max(1, Math.min(120, Math.round(Number(spec.months ?? (plan === "yearly" ? 12 : 1))))) : undefined;
  const order: Order = {
    id: `o_${randomId(12)}`,
    uid: user.id,
    edition: spec.edition as Edition,
    ...(modules ? { modules } : {}),
    plan,
    currency: "USD",
    base: 0,
    regional: 0,
    discount: 0,
    total: 0,
    band: 1,
    claimedBand: 1,
    proof: { reason: "Granted by the crew." },
    provider: "grant",
    status: "pending",
    renews: false,
    createdAt: Date.now(),
    email: user.email,
    name: user.name,
    granted: { by, why: spec.why ? String(spec.why).slice(0, 280) : null },
  };
  await saveOrder(env, order);
  const out = await issue(env, order, user, months ? { months } : {});
  if (!out.licence) fail(500, "A grant makes a licence.");
  return { order, licence: out.licence };
}

/** An account by its id, a verified e-mail address, or a sign-in (`provider:sub`). */
export async function findAccount(env: AppEnv, who: string): Promise<User | null> {
  const w = String(who ?? "").trim();
  if (!w) return null;
  const direct = await get<User>(env.KV, `user:${w}`);
  if (direct) return direct;
  if (w.includes("@")) {
    const uid = await env.KV.get(`email:${w.toLowerCase()}`);
    return uid ? get<User>(env.KV, `user:${uid}`) : null;
  }
  const uid = await env.KV.get(`ident:${w}`);
  return uid ? get<User>(env.KV, `user:${uid}`) : null;
}

function needsConfirm(q: Quote, reason: string) {
  return fail(409, reason, {
    needsConfirm: true,
    band: q.band,
    total: q.total,
    display: money(q.total, q.currency),
  });
}

/**
 * Whether the price the buyer was shown stands after the proof: the band
 * they claimed was granted, or what the proof backs costs no more (a
 * student's half price does not depend on where they are).
 */
async function stands(env: AppEnv, user: User, input: QuoteInput, proof: { granted: boolean }, proved: Quote): Promise<boolean> {
  if (proof.granted) return true;
  const claimed = await quote(env, user, input);
  return proved.total <= claimed.total;
}

function realBuyer(user: User): void {
  if (user.demo) fail(403, "A demo account cannot buy a real licence — sign in with a real account.");
}

// --- Demo -------------------------------------------------------------------

/**
 * Demo mode's checkout: the same quote, the same proof and the same licence,
 * with the card's and address's countries typed in rather than read from a
 * payment. The licence is marked demo and djmanzo says so wherever it shows.
 */
export async function demoCheckout(env: AppEnv, user: User, input: QuoteInput & Proof & { acceptHigher?: boolean }) {
  if (!demoMode(env)) fail(404, "The demo checkout is off: this shop takes real payments.");
  const claimed = band(input.country);
  const proof = proven({ instrument: input.instrument, billing: input.billing }, claimed);
  if (proof.refused) fail(451, proof.reason);
  const q = await quote(env, user, input, proof.band);
  if (!(await stands(env, user, input, proof, q)) && !input.acceptHigher) needsConfirm(q, proof.reason);
  const order = await newOrder(env, user, q, claimed, { instrument: input.instrument, billing: input.billing, reason: proof.reason }, "demo", false, input.gift);
  const out = await issue(env, order, user);
  return { order, ...out, proof };
}

// --- The seven-day trial ----------------------------------------------------

/**
 * Seven days of any edition, Full included, once per account
 * (`docs/EDITIONS.md`, "The 7-day trial"). The mark is kept for good, so a
 * trial starts once whichever machine or browser it is started from.
 * Custom has no trial of its own: trying Full shows every module.
 */
export async function startTrial(env: AppEnv, user: User, edition: string) {
  if (!(NAMED as string[]).includes(edition)) fail(400, `A trial is of one edition: ${NAMED.join(", ")}.`);
  const had = await get<{ edition: Edition; at: number }>(env.KV, `trial:${user.id}`);
  if (had) fail(409, `This account has had its seven days (${EDITION_INFO[had.edition].name}, from ${new Date(had.at).toISOString().slice(0, 10)}). Any edition can be bought at any time.`);
  // As the licence service rules: a trial is for someone who has not bought djmanzo yet.
  if ((await userLicences(env, user.id)).some((l) => l.plan !== "trial" && !l.demo && l.status === "active")) fail(409, "This account has already bought djmanzo; an upgrade costs the difference.");
  await put(env.KV, `trial:${user.id}`, { edition, at: Date.now() });
  const order: Order = {
    id: `o_${randomId(12)}`,
    uid: user.id,
    edition: edition as Edition,
    plan: "trial",
    currency: "USD",
    base: 0,
    regional: 0,
    discount: 0,
    total: 0,
    band: 1,
    claimedBand: 1,
    proof: { reason: "A trial." },
    provider: "trial",
    status: "pending",
    renews: false,
    createdAt: Date.now(),
    email: user.email,
    name: user.name,
  };
  await saveOrder(env, order);
  return { order, ...(await issue(env, order, user)) };
}

// --- Nothing to pay ---------------------------------------------------------

export async function freeCheckout(env: AppEnv, user: User, input: QuoteInput) {
  const q = await quote(env, user, input);
  if (q.total !== 0) fail(402, "There is still something to pay.");
  const order = await newOrder(env, user, q, q.band, { reason: "Nothing to pay." }, "free", false, input.gift);
  return { order, ...(await issue(env, order, user)) };
}

/** A voucher, redeemed for what it grants. */
export async function redeem(env: AppEnv, user: User, code: string) {
  const p = await lookup(env, code);
  if (!p || p.kind !== "voucher" || !p.grants) fail(404, "That is not a voucher we know.");
  const q = await quote(env, user, { edition: p.grants.edition, plan: p.grants.plan as Bought, promo: p.code, country: null });
  if (!q.promo?.ok) fail(400, q.promo?.reason || "That voucher cannot be used.");
  const order = await newOrder(env, user, q, 1, { reason: "Voucher." }, "voucher", false);
  return { order, ...(await issue(env, order, user, { months: p.grants.months })) };
}

// --- Stripe -----------------------------------------------------------------

async function stripeCustomer(env: AppEnv, user: User): Promise<string> {
  const key = `stripe:customer:${user.id}`;
  const known = await env.KV.get(key);
  if (known) return known;
  const c = await stripe(env, "POST", "customers", { email: user.email ?? undefined, name: user.name, metadata: { uid: user.id } }, `cust-${user.id}`);
  await env.KV.put(key, c.id);
  return c.id;
}

async function stripeProduct(env: AppEnv, edition: Edition): Promise<string> {
  const key = `stripe:product:${edition}`;
  const known = await env.KV.get(key);
  if (known) return known;
  const p = await stripe(env, "POST", "products", { name: `djmanzo ${EDITION_INFO[edition].name}`, metadata: { edition } }, `product-${edition}`);
  await env.KV.put(key, p.id);
  return p.id;
}

export async function stripeConfirm(env: AppEnv, user: User, origin: string, input: QuoteInput & { paymentMethod: string; acceptHigher?: boolean }) {
  realBuyer(user);
  if (!/^pm_[A-Za-z0-9]+$/.test(input.paymentMethod || "")) fail(400, "The card form did not finish.");
  const pm = await stripe(env, "GET", `payment_methods/${input.paymentMethod}`);
  // The paying instrument's country: a card's (Apple Pay and Google Pay carry one), PayPal's payer, or Austria for EPS, whose banks are all Austrian.
  const instrument: string | null = pm.card?.country ?? pm.sepa_debit?.country ?? pm.link?.country ?? pm.paypal?.country ?? (pm.type === "eps" ? "AT" : null);
  const billing: string | null = pm.billing_details?.address?.country ?? null;
  const claimed = band(input.country);
  const proof = proven({ instrument, billing }, claimed);
  if (proof.refused) fail(451, proof.reason);
  const q = await quote(env, user, { ...input, country: input.country ?? billing }, proof.band);
  if (!(await stands(env, user, input, proof, q)) && !input.acceptHigher) needsConfirm(q, proof.reason);
  if (q.total === 0) return freeCheckout(env, user, input);

  const customer = await stripeCustomer(env, user);
  await stripe(env, "POST", `payment_methods/${input.paymentMethod}/attach`, { customer });
  const order = await newOrder(env, user, q, claimed, { instrument, billing, reason: proof.reason }, "stripe", q.plan !== "perpetual", input.gift);
  const currency = q.currency.toLowerCase();

  if (q.plan === "perpetual") {
    const pi = await stripe(
      env,
      "POST",
      "payment_intents",
      {
        amount: q.total,
        currency,
        customer,
        payment_method: input.paymentMethod,
        confirm: true,
        description: describe(q),
        // A method that leaves the page (PayPal, EPS) comes back to the shop, which finishes it (`Pricing.svelte`).
        return_url: `${origin}/pricing?order=${order.id}#checkout`,
        metadata: { order: order.id, uid: user.id },
      },
      `pi-${order.id}`,
    );
    order.providerRef = pi.id;
    await saveOrder(env, order);
    if (pi.status === "succeeded") return { order, ...(await issue(env, order, user)), proof };
    if (pi.status === "requires_action") return { order, clientSecret: pi.client_secret, requiresAction: true, proof };
    order.status = "failed";
    await saveOrder(env, order);
    fail(402, "The payment did not go through.");
  }

  let coupon: string | undefined;
  if (q.discount > 0) {
    const c = await stripe(env, "POST", "coupons", { amount_off: q.discount, currency, duration: "once", name: q.promo?.code }, `coupon-${order.id}`);
    coupon = c.id;
  }
  const sub = await stripe(
    env,
    "POST",
    "subscriptions",
    {
      customer,
      default_payment_method: input.paymentMethod,
      payment_behavior: "allow_incomplete",
      items: [{ price_data: { currency, product: await stripeProduct(env, q.edition), unit_amount: q.regional, recurring: { interval: q.plan === "yearly" ? "year" : "month" } } }],
      ...(coupon ? { discounts: [{ coupon }] } : {}),
      metadata: { order: order.id, uid: user.id },
      expand: ["latest_invoice.payment_intent"],
    },
    `sub-${order.id}`,
  );
  order.providerRef = sub.id;
  await saveOrder(env, order);
  if (sub.status === "active" || sub.status === "trialing") {
    return { order, ...(await issue(env, order, user, { expires: sub.current_period_end * 1000 + 3 * 86400_000, subscription: sub.id })), proof };
  }
  const pi = sub.latest_invoice?.payment_intent;
  if (pi?.status === "requires_action") return { order, clientSecret: pi.client_secret, requiresAction: true, proof };
  order.status = "failed";
  await saveOrder(env, order);
  fail(402, "The payment did not go through.");
}

/** After 3-D Secure: ask Stripe how it ended. */
export async function stripeFinalize(env: AppEnv, user: User, orderId: string) {
  const order = await get<Order>(env.KV, `order:${orderId}`);
  if (!order || order.uid !== user.id || order.provider !== "stripe" || !order.providerRef) fail(404, "No such order.");
  if (order.plan === "perpetual") {
    const pi = await stripe(env, "GET", `payment_intents/${order.providerRef}`);
    if (pi.status !== "succeeded") fail(402, "The payment has not gone through.");
    return { order, ...(await issue(env, order, user)) };
  }
  const sub = await stripe(env, "GET", `subscriptions/${order.providerRef}`);
  if (sub.status !== "active" && sub.status !== "trialing") fail(402, "The payment has not gone through.");
  return { order, ...(await issue(env, order, user, { expires: sub.current_period_end * 1000 + 3 * 86400_000, subscription: sub.id })) };
}

/** Stripe telling us something happened: a renewal, a cancellation, a refund, a payment the browser never reported. */
export async function stripeWebhook(env: AppEnv, req: Request): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) fail(503, "No webhook secret is set.");
  const payload = await req.text();
  if (!(await verifyWebhook(env.STRIPE_WEBHOOK_SECRET, req.headers.get("stripe-signature"), payload))) fail(400, "Bad signature.");
  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, any> } };
  const o = event.data.object;
  const licenceFor = async (sub: string | undefined) => {
    const lid = sub ? await env.KV.get(`stripe:sub:${sub}`) : null;
    return lid ? get<Licence>(env.KV, `licence:${lid}`) : null;
  };
  if (event.type === "invoice.paid") {
    const licence = await licenceFor(o.subscription);
    const end = o.lines?.data?.[0]?.period?.end;
    if (licence && end) {
      licence.expires = Math.max(licence.expires ?? 0, end * 1000 + 3 * 86400_000);
      licence.status = "active";
      await saveLicence(env.KV, licence);
    }
  } else if (event.type === "customer.subscription.deleted") {
    const licence = await licenceFor(o.id);
    if (licence) {
      // It runs to the end of what was paid for, then stops.
      licence.status = "cancelled";
      await saveLicence(env.KV, licence);
    }
  } else if (event.type === "payment_intent.succeeded" && o.metadata?.order) {
    const order = await get<Order>(env.KV, `order:${o.metadata.order}`);
    const user = order && (await get<User>(env.KV, `user:${order.uid}`));
    if (order && user && order.plan === "perpetual" && !order.licence && !order.gift?.voucher) await issue(env, order, user);
  } else if (event.type === "charge.refunded" && o.payment_intent) {
    // Find the order by the payment intent through its metadata.
    const pi = await stripe(env, "GET", `payment_intents/${o.payment_intent}`).catch(() => null);
    const order = pi?.metadata?.order ? await get<Order>(env.KV, `order:${pi.metadata.order}`) : null;
    if (order) {
      order.status = "refunded";
      await saveOrder(env, order);
      const licence = order.licence ? await get<Licence>(env.KV, `licence:${order.licence}`) : null;
      if (licence) {
        licence.status = "revoked";
        await saveLicence(env.KV, licence);
      }
    }
  }
  return new Response("ok");
}

// --- PayPal -----------------------------------------------------------------

/**
 * PayPal sells every plan as a prepaid term that does not renew: a month, a
 * year, or the version for ever. Renewing through PayPal needs plans made in
 * its dashboard ahead of time; a prepaid term needs nothing and is honest
 * about what it is.
 */
export async function paypalCreate(env: AppEnv, user: User, input: QuoteInput) {
  realBuyer(user);
  const q = await quote(env, user, input);
  if (q.total === 0) fail(400, "Nothing to pay — use the free checkout.");
  const order = await newOrder(env, user, q, q.band, { reason: "Waiting for PayPal." }, "paypal", false, input.gift);
  const pp = await paypal(
    env,
    "POST",
    "/v2/checkout/orders",
    {
      intent: "AUTHORIZE",
      purchase_units: [{ reference_id: order.id, description: describe(q), amount: { currency_code: q.currency, value: (q.total / 100).toFixed(2) } }],
    },
    `create-${order.id}`,
  );
  order.providerRef = pp.id;
  await saveOrder(env, order);
  return { order: order.id, paypalOrder: pp.id };
}

export async function paypalCapture(env: AppEnv, user: User, orderId: string, acceptHigher = false) {
  const order = await get<Order>(env.KV, `order:${orderId}`);
  if (!order || order.uid !== user.id || order.provider !== "paypal" || !order.providerRef) fail(404, "No such order.");
  if (order.licence || order.gift?.voucher) return { order, ...(await issue(env, order, user)) };
  const auth = await paypal(env, "POST", `/v2/checkout/orders/${order.providerRef}/authorize`, {}, `auth-${order.id}`);
  const authorization = auth.purchase_units?.[0]?.payments?.authorizations?.[0];
  // PayPal vouches for the account's country; the billing country is the card's or the address PayPal holds.
  const instrument: string | null = auth.payment_source?.card?.bin_details?.issuing_country_code ?? auth.payer?.address?.country_code ?? null;
  const billing: string | null =
    auth.payment_source?.card?.billing_address?.country_code ??
    auth.payment_source?.paypal?.address?.country_code ??
    auth.purchase_units?.[0]?.shipping?.address?.country_code ??
    auth.payer?.address?.country_code ??
    null;
  const proof = proven({ instrument, billing }, order.claimedBand);
  const proved = proof.refused
    ? null
    : await quote(env, user, { edition: order.edition, plan: order.plan as Bought, modules: order.modules, promo: order.promo, voucher: order.voucher ? ((await voucher.record(env, order.voucher))?.line ?? null) : null, country: instrument }, proof.band);
  const holds = proof.granted || (proved !== null && proved.total <= order.total);
  if (proof.refused || (!holds && !acceptHigher)) {
    if (authorization?.id) await paypal(env, "POST", `/v2/payments/authorizations/${authorization.id}/void`).catch(() => null);
    order.status = "cancelled";
    order.proof = { instrument, billing, reason: proof.reason };
    await saveOrder(env, order);
    if (proof.refused || !proved) fail(451, proof.reason);
    needsConfirm(proved, `${proof.reason} Nothing was taken — start again at ${money(proved.total, proved.currency)}.`);
  }
  const cap = await paypal(env, "POST", `/v2/payments/authorizations/${authorization.id}/capture`, {}, `cap-${order.id}`);
  if (cap.status !== "COMPLETED" && cap.status !== "PENDING") fail(402, "PayPal did not complete the payment.");
  order.proof = { instrument, billing, reason: proof.reason };
  return { order, ...(await issue(env, order, user)), proof };
}

// --- Bank transfer ----------------------------------------------------------

/**
 * For a buyer with no card PayPal will take — common across the Caribbean.
 * The order waits; the owner marks it paid in Backstage after reading the
 * transfer, whose sending bank's country is the proof.
 */
export async function transferCheckout(env: AppEnv, user: User, input: QuoteInput & { billing?: string }) {
  realBuyer(user);
  if (!env.BANK_TRANSFER_DETAILS) fail(404, "Bank transfer is not offered.");
  const q = await quote(env, user, input);
  const order = await newOrder(env, user, q, q.band, { billing: input.billing ?? null, reason: "Proven by the sending bank, checked by hand." }, "transfer", false, input.gift);
  return { order, instructions: env.BANK_TRANSFER_DETAILS, reference: order.id, display: money(q.total, q.currency) };
}

export async function markPaid(env: AppEnv, orderId: string, bankCountry: string | null) {
  const order = await get<Order>(env.KV, `order:${orderId}`);
  if (!order) fail(404, "No such order.");
  const user = await get<User>(env.KV, `user:${order.uid}`);
  if (!user) fail(404, "The buyer's account is gone.");
  const proof = proven({ instrument: bankCountry, billing: order.proof.billing ?? bankCountry }, order.claimedBand);
  order.proof = { ...order.proof, instrument: bankCountry, reason: proof.reason };
  return { ...(await issue(env, order, user)), proof };
}

export { inForce };
