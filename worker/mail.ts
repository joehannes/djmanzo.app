/**
 * E-mail to buyers: the code that confirms the address the site writes to,
 * word that a payment is on its way, and the receipt with the licence (or
 * the gift). Sent through Resend's HTTP API (resend.com) with a key and a
 * sender on a domain verified there, set in Backstage → Payments or as
 * Worker secrets (`RESEND_API_KEY`, `MAIL_FROM`). Without them nothing is
 * sent, and the checkout and its summary say so instead of promising it.
 *
 * **The address written to** (`User.contact`) is confirmed before anything
 * is paid for: the address a sign-in provider vouched for, by the buyer's
 * own press ("yes, write to me here"); any other, by a six-digit code sent
 * to it, good for 30 minutes and five tries, five codes an hour at most.
 * While no e-mail is set up, an address the provider did not vouch for is
 * kept unconfirmed: nothing could be sent to confirm it.
 *
 * A message that cannot be sent never stops a payment or a licence: it is
 * logged, and the order says it was not sent (`Order.mailed`).
 */

import type { Lang } from "../src/v4/i18n/strings";
import { LANGS } from "../src/v4/i18n/strings";
import { EDITION_INFO, money } from "../shared/catalog";
import type { AppEnv } from "./env";
import { fail } from "./http";
import { MAIL_WORDS } from "./mailwords";
import { get, put, type Order, type User } from "./store";

export function mailOn(env: AppEnv): boolean {
  return !!(env.RESEND_API_KEY && env.MAIL_FROM);
}

export interface Mail {
  subject: string;
  text: string;
}

/** Send one message. Whether it went. */
export async function send(env: AppEnv, to: string, mail: Mail): Promise<boolean> {
  if (!mailOn(env)) return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject: mail.subject, text: mail.text, html: html(mail.text), ...(env.IMPRINT_EMAIL ? { reply_to: env.IMPRINT_EMAIL } : {}) }),
  }).catch(() => null);
  if (r?.ok) return true;
  console.error(JSON.stringify({ at: "mail", status: r?.status ?? null, said: r ? (await r.text().catch(() => "")).slice(0, 300) : "unreachable" }));
  return false;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The same words as HTML: paragraphs, line breaks, links, and a licence key or a code set apart. */
export function html(text: string): string {
  const paragraphs = text.split(/\n{2,}/).map((p) => {
    const lone = !p.includes("\n") && !p.includes(" ") && p.length > 6;
    const body = esc(p)
      .replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}">${u}</a>`)
      .replace(/\n/g, "<br>");
    return lone ? `<p style="font-family:ui-monospace,Menlo,monospace;font-size:13px;word-break:break-all;background:#f4f4f5;padding:10px;border-radius:6px">${body}</p>` : `<p>${body}</p>`;
  });
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#18181b;max-width:560px">${paragraphs.join("")}</div>`;
}

/** The blanks filled. */
export function fill(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

export const langOf = (user: User | null): Lang => (LANGS as readonly string[]).includes(user?.lang ?? "") ? (user!.lang as Lang) : "en";
const site = (origin: string) => new URL(origin).host;
const download = (origin: string) => `${origin}/#download`;
const accountUrl = (origin: string) => `${origin}/account`;

// --- The address written to ------------------------------------------------------------

const ADDRESS = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const CODE_MINUTES = 30;

async function hash(s: string): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Where to write to this buyer. The provider's own address is confirmed by
 * asking for it; another is sent a code. Answers what is now kept and
 * whether a code went out.
 */
export async function ask(env: AppEnv, user: User, raw: string, lang: string | null, origin: string): Promise<{ contact: User["contact"] | null; sent: boolean; mail: boolean; pending?: string }> {
  const email = String(raw ?? "").trim().toLowerCase();
  if (!ADDRESS.test(email) || email.length > 200) fail(400, "That does not look like an e-mail address.");
  if (lang && (LANGS as readonly string[]).includes(lang)) user.lang = lang;
  if (user.email && email === user.email.toLowerCase()) {
    user.contact = { email, confirmed: Date.now() };
    await put(env.KV, `user:${user.id}`, user);
    return { contact: user.contact, sent: false, mail: mailOn(env) };
  }
  if (!mailOn(env)) {
    user.contact = { email, confirmed: null };
    await put(env.KV, `user:${user.id}`, user);
    return { contact: user.contact, sent: false, mail: false };
  }
  const hour = `contact-sends:${user.id}:${Math.floor(Date.now() / 3_600_000)}`;
  const sends = Number((await env.KV.get(hour)) ?? 0);
  if (sends >= 5) fail(429, "Five codes in an hour is the most: wait a little, or check the address.");
  await env.KV.put(hour, String(sends + 1), { expirationTtl: 3700 });
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  await put(env.KV, `contact-code:${user.id}`, { email, hash: await hash(`${user.id}:${code}`), tries: 0 }, CODE_MINUTES * 60);
  await put(env.KV, `user:${user.id}`, user);
  const w = MAIL_WORDS[langOf(user)].code;
  const went = await send(env, email, { subject: fill(w.subject, { code }), text: fill(w.body, { code, site: site(origin) }) });
  if (!went) fail(502, "The code could not be sent just now. Try again in a minute.");
  // The address kept stays as it was until the code comes back.
  return { contact: user.contact ?? null, sent: true, mail: true, pending: email };
}

/** The code typed back: the address it was sent to is confirmed. */
export async function confirm(env: AppEnv, user: User, raw: string): Promise<{ contact: NonNullable<User["contact"]> }> {
  const key = `contact-code:${user.id}`;
  const pending = await get<{ email: string; hash: string; tries: number }>(env.KV, key);
  if (!pending) fail(410, "That code has expired: ask for a new one.");
  const code = String(raw ?? "").replace(/\D/g, "");
  if ((await hash(`${user.id}:${code}`)) !== pending.hash) {
    if (pending.tries + 1 >= 5) {
      await env.KV.delete(key);
      fail(429, "Five wrong tries: ask for a new code.");
    }
    await put(env.KV, key, { ...pending, tries: pending.tries + 1 }, CODE_MINUTES * 60);
    fail(400, "That is not the code we sent.");
  }
  await env.KV.delete(key);
  user.contact = { email: pending.email, confirmed: Date.now() };
  await put(env.KV, `user:${user.id}`, user);
  return { contact: user.contact };
}

/** Before money changes hands: where the receipt and licence go is known, and confirmed when it can be. */
export function needContact(env: AppEnv, user: User): string {
  if (!user.contact) fail(428, "First say where we write to you: your receipt and licence go there.");
  if (mailOn(env) && !user.contact.confirmed) fail(428, "Confirm your address first: type the code we sent to it.");
  return user.contact.email;
}

// --- The messages ------------------------------------------------------------------------

function common(env: AppEnv, order: Order, user: User, origin: string) {
  const lang = langOf(user);
  const w = MAIL_WORDS[lang];
  const bought = order.plan === "perpetual" || order.plan === "monthly" || order.plan === "yearly" ? order.plan : "perpetual";
  return {
    w,
    lang,
    vars: {
      name: user.name,
      order: order.id,
      edition: EDITION_INFO[order.edition]?.name ?? order.edition,
      plan: w.plan[bought],
      amount: money(order.total, order.currency),
      download: download(origin),
      account: accountUrl(origin),
      site: site(origin),
    },
  };
}

/** A bank transfer to make: what, how much, where to, and what happens after. */
export function waiting(env: AppEnv, order: Order, user: User, origin: string, details: string): Mail {
  const { w, vars } = common(env, order, user, origin);
  return { subject: fill(w.waiting.subject, vars), text: fill(w.waiting.body, { ...vars, details }) };
}

/** A payment made that the bank is still clearing. */
export function processing(env: AppEnv, order: Order, user: User, origin: string): Mail {
  const { w, vars } = common(env, order, user, origin);
  return { subject: fill(w.processing.subject, vars), text: fill(w.processing.body, vars) };
}

/** The receipt, with the licence key, or with the gift to hand over. */
export function receipt(env: AppEnv, order: Order, user: User, origin: string, got: { line?: string | null; giftLine?: string | null }): Mail {
  const { w, lang, vars } = common(env, order, user, origin);
  const method = order.method ?? (order.provider === "transfer" ? w.method.transfer : order.provider === "paypal" ? "PayPal" : w.method.card);
  const seller = [env.IMPRINT_NAME, env.IMPRINT_ADDRESS].filter(Boolean).join(", ") || site(origin);
  const date = new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : lang, { dateStyle: "long" }).format(new Date(order.paidAt ?? Date.now()));
  const all = {
    ...vars,
    method,
    seller,
    date,
    note: env.RECEIPT_NOTE ? `${env.RECEIPT_NOTE}\n` : "",
    discount: order.discount > 0 ? fill(w.discount, { amount: money(order.discount, order.currency) }) : "",
    via: user.identities.map((i) => i.provider).filter((p) => p !== "owner" && p !== "demo").join(", ") || "—",
  };
  // Stripe's test mode: said on the receipt, so nobody mistakes it for a sale.
  const test = order.test ? "[test] " : "";
  if (order.gift) {
    const link = `${origin}/redeem?voucher=${encodeURIComponent(got.giftLine ?? "")}`;
    return { subject: test + fill(w.gift.subject, all), text: tidy(fill(w.gift.body, { ...all, link })) };
  }
  return { subject: test + fill(w.receipt.subject, all), text: tidy(fill(w.receipt.body, { ...all, line: got.line ?? accountUrl(origin) })) };
}

/** No empty line where a note or a discount was left out. */
const tidy = (s: string) => s.replace(/\n\n\n+/g, "\n\n");

/** Send one to the buyer's confirmed address (or the address their provider vouched for), and note it on the order. */
export async function toBuyer(env: AppEnv, order: Order, user: User, mail: Mail, what: "waiting" | "processing" | "receipt"): Promise<boolean> {
  const to = user.contact?.email ?? user.email;
  if (!to) return false;
  const went = await send(env, to, mail);
  order.mailed = { ...(order.mailed ?? {}), [what]: went ? Date.now() : 0 };
  return went;
}
