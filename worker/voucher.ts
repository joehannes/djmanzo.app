/**
 * Signed vouchers (DIRECTIVE §135): a gift of an edition, or a discount on
 * it, in one line the crew makes in Backstage and gives away.
 *
 * The line is the application's (`crates/dj-app/src/voucher.rs`), so djmanzo
 * can tell a real voucher from a made-up one with no network at all:
 *
 *   djmanzo-voucher-1.<payload JSON, base64url>.<Ed25519 signature over the payload's bytes, base64url>
 *
 * signed with the key every licence is signed with (`worker/licence.ts`).
 * `percent` 100 is a gift — the edition outright, which djmanzo wears offline
 * when the voucher is for anybody — and less is a discount at the box
 * office. `for` holds it to accounts (`github:583231`, as a licence names
 * them) and e-mail addresses; `until` is the last moment it may be taken.
 *
 * The functions above the line are pure, so the tests, the box office and
 * `/redeem` ask the same questions the same way. Below it, what KV keeps of
 * each voucher: who took it, and whether the crew withdrew it.
 */

import { EDITIONS, MODULES, type Edition, type Module } from "../shared/catalog";
import type { AppEnv } from "./env";
import { b64url, fail, unb64url } from "./http";
import { keys } from "./licence";
import { makeCode } from "./promo";
import { get, put } from "./store";

export const PREFIX = "djmanzo-voucher-1.";
/** The most addresses and accounts one voucher may be held to, and the longest note, as djmanzo reads them. */
export const MOST_FOR = 64;
export const MOST_NOTE = 280;

/** What a voucher line says (`dj_app::voucher::Payload`), in the order it is signed. */
export interface VoucherPayload {
  v: 1;
  id: string;
  edition: Edition;
  /** Custom's modules, comma-separated; only for Custom, and required there. */
  modules?: string;
  /** 1–100; 100 is a gift. */
  percent: number;
  /** Seconds. */
  issued: number;
  /** The last moment it may be taken, in seconds; none for no end. */
  until?: number;
  /** Whom it is for: accounts (`provider:id`) and e-mail addresses; none for anybody. */
  for?: string[];
  note?: string;
}

/** A line read: its payload, or the sentence saying why not. */
export type Read = { payload: VoucherPayload; refused?: undefined } | { payload?: undefined; refused: string };

const isEdition = (s: unknown): s is Edition => (EDITIONS as readonly unknown[]).includes(s);
const isModule = (s: string): s is Module => (MODULES as readonly string[]).includes(s);
const whole = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;

/** Why a payload is not a voucher, or null when it is one. */
export function invalid(p: Partial<VoucherPayload> | null): string | null {
  if (!p || typeof p !== "object") return "That voucher says nothing.";
  if (p.v !== 1) return "That voucher is of a format this site does not know.";
  if (typeof p.id !== "string" || p.id.length < 1 || p.id.length > 64) return "A voucher's name is 1 to 64 characters.";
  if (!isEdition(p.edition)) return `A voucher is for one edition: ${EDITIONS.join(", ")}.`;
  if (p.edition === "custom") {
    const mods = typeof p.modules === "string" ? p.modules.split(",") : [];
    if (!mods.length || !mods.every(isModule)) return "A Custom voucher names its modules.";
  } else if (p.modules !== undefined) {
    return "Only a Custom voucher names modules.";
  }
  if (!Number.isInteger(p.percent) || p.percent! < 1 || p.percent! > 100) return "A voucher takes 1 to 100 % off.";
  if (!whole(p.issued)) return "A voucher says when it was made.";
  if (p.until !== undefined && !whole(p.until)) return "A voucher's last day is a time.";
  if (p.note !== undefined && (typeof p.note !== "string" || p.note.length > MOST_NOTE)) return `A voucher's note is at most ${MOST_NOTE} characters.`;
  if (p.for !== undefined) {
    if (!Array.isArray(p.for) || p.for.length > MOST_FOR) return `A voucher is for at most ${MOST_FOR} people.`;
    if (!p.for.every((w) => typeof w === "string" && w.trim())) return "A voucher's people are each an account or an e-mail address.";
  }
  return null;
}

/** The payload in djmanzo's field order, with what is empty left out: the bytes that are signed. */
function ordered(p: VoucherPayload): VoucherPayload {
  return {
    v: 1,
    id: p.id,
    edition: p.edition,
    ...(p.edition === "custom" ? { modules: p.modules } : {}),
    percent: p.percent,
    issued: p.issued,
    ...(p.until !== undefined ? { until: p.until } : {}),
    ...(p.for?.length ? { for: p.for } : {}),
    ...(p.note ? { note: p.note } : {}),
  };
}

/** Sign a payload into a voucher line. Refuses one djmanzo would refuse. */
export async function signVoucher(payload: VoucherPayload, privateKey: CryptoKey): Promise<string> {
  const why = invalid(payload);
  if (why) fail(400, why);
  const bytes = new TextEncoder().encode(JSON.stringify(ordered(payload)));
  const signature = await crypto.subtle.sign({ name: "Ed25519" }, privateKey, bytes);
  return `${PREFIX}${b64url(bytes)}.${b64url(signature)}`;
}

/** Whether a string looks like a voucher line at all (a pasted one may carry line breaks). */
export function isVoucherLine(s: string | null | undefined): boolean {
  return String(s ?? "").replace(/\s+/g, "").startsWith(PREFIX);
}

/**
 * Read a line: the signature first, against any of `publicKey`, and only
 * then what it says. Whitespace and line breaks inside a pasted line are
 * ignored, as djmanzo ignores them.
 */
export async function readVoucher(line: string, publicKey: CryptoKey | CryptoKey[]): Promise<Read> {
  const flat = String(line ?? "").replace(/\s+/g, "");
  if (!flat.startsWith(PREFIX)) return { refused: "That is not a djmanzo voucher." };
  const parts = flat.slice(PREFIX.length).split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { refused: "That voucher is damaged." };
  let bytes: Uint8Array, signature: Uint8Array;
  try {
    bytes = unb64url(parts[0]);
    signature = unb64url(parts[1]);
  } catch {
    return { refused: "That voucher is damaged." };
  }
  let signed = false;
  for (const key of Array.isArray(publicKey) ? publicKey : [publicKey]) {
    if (await crypto.subtle.verify({ name: "Ed25519" }, key, signature, bytes).catch(() => false)) {
      signed = true;
      break;
    }
  }
  if (!signed) return { refused: "That voucher was not made by djmanzo." };
  let payload: VoucherPayload;
  try {
    payload = JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes));
  } catch {
    return { refused: "That voucher is damaged." };
  }
  const why = invalid(payload);
  return why ? { refused: why } : { payload };
}

/** What a voucher gives: the edition outright, or money off it. */
export function gives(p: VoucherPayload): "gift" | "discount" {
  return p.percent >= 100 ? "gift" : "discount";
}

/**
 * Whether a voucher is for this person: anybody when it names nobody;
 * otherwise one of their accounts (an entry without `@`) or their e-mail
 * address, each compared without regard to case.
 */
export function allows(p: VoucherPayload, who: { account?: string | readonly string[] | null; email?: string | null }): boolean {
  const named = (p.for ?? []).map((w) => w.trim().toLowerCase()).filter(Boolean);
  if (!named.length) return true;
  const accounts = (typeof who.account === "string" ? [who.account] : (who.account ?? [])).map((a) => a.toLowerCase());
  const email = (who.email ?? "").trim().toLowerCase();
  return named.some((w) => (w.includes("@") ? !!email && w === email : accounts.includes(w)));
}

/** Whether the last moment it could be taken has passed. `now` in seconds. */
export function expired(p: VoucherPayload, now = Math.floor(Date.now() / 1000)): boolean {
  return p.until !== undefined && now > p.until;
}

/** A voucher's name: `MANZO-7K3QXW`, in the promo codes' alphabet, which survives being read aloud. */
export function voucherId(prefix = "MANZO"): string {
  return makeCode(prefix, 1, 6);
}

// --- What KV keeps -----------------------------------------------------------------

/** One take: who, as which account, when, and the order it made. */
export interface Take {
  uid: string;
  account: string | null;
  at: number;
  order: string;
}

/** `voucher:<id>`. A voucher signed elsewhere with a trusted key gets one the first time it is shown here (`made` null). */
export interface VoucherRecord {
  payload: VoucherPayload;
  line: string;
  made: number | null;
  by?: string;
  taken: Take[];
  revoked: boolean;
}

export function meta(r: VoucherRecord) {
  const p = r.payload;
  return { e: p.edition, p: p.percent, m: r.made, i: p.issued, u: p.until ?? null, f: p.for?.length ?? 0, t: r.taken.length, r: r.revoked };
}

export async function record(env: AppEnv, id: string): Promise<VoucherRecord | null> {
  return get<VoucherRecord>(env.KV, `voucher:${id}`);
}

export async function save(env: AppEnv, r: VoucherRecord): Promise<void> {
  await put(env.KV, `voucher:${r.payload.id}`, r, undefined, meta(r));
}

/**
 * The keys a voucher is believed under: the shop's own signing key, and any
 * in `DJMANZO_GIFT_KEYS` (comma-separated, raw 32 bytes in base64), for a
 * gift made outside this site with a key the owner trusts.
 */
export async function trustedKeys(env: AppEnv): Promise<CryptoKey[]> {
  const own = (await keys(env)).publicKey;
  const extra = String(env.DJMANZO_GIFT_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  // A key that is not one is passed over rather than closing the shop's door.
  const more = await Promise.all(
    extra.map(async (k) => {
      try {
        return await crypto.subtle.importKey("raw", unb64url(k.replace(/=+$/, "")), { name: "Ed25519" }, false, ["verify"]);
      } catch {
        return null;
      }
    }),
  );
  return [own, ...more.filter((k): k is CryptoKey => !!k)];
}

/**
 * Whether a voucher read from a line may be taken now: not withdrawn, not
 * past its last day. Returns its record (made on first sight for a voucher
 * signed elsewhere), or the sentence saying why not.
 */
export async function standing(env: AppEnv, payload: VoucherPayload, line: string, now = Math.floor(Date.now() / 1000)): Promise<{ record: VoucherRecord; refused?: string }> {
  let r = await record(env, payload.id);
  if (!r) {
    r = { payload, line: line.replace(/\s+/g, ""), made: null, taken: [], revoked: false };
    await save(env, r);
  }
  if (r.revoked) return { record: r, refused: "That voucher has been withdrawn." };
  if (expired(payload, now)) return { record: r, refused: `That voucher could be taken until ${new Date(payload.until! * 1000).toISOString().slice(0, 10)}; that day has passed.` };
  return { record: r };
}

/** Record one take. Idempotent per person. */
export async function take(env: AppEnv, id: string, t: Take): Promise<void> {
  const r = await record(env, id);
  if (!r || r.taken.some((x) => x.uid === t.uid)) return;
  r.taken.push(t);
  await save(env, r);
}

/** What Backstage sends to make vouchers. */
export interface VoucherSpec {
  edition?: string;
  modules?: string | string[];
  percent?: number;
  until?: number | null;
  for?: string[] | string;
  note?: string;
  count?: number;
  prefix?: string;
}

/** Make and sign `count` vouchers, each with its own record. */
export async function make(env: AppEnv, spec: VoucherSpec, by: string, now = Math.floor(Date.now() / 1000)): Promise<VoucherRecord[]> {
  const count = Math.round(Number(spec.count ?? 1));
  if (!(count >= 1 && count <= 50)) fail(400, "Make 1 to 50 vouchers at a time.");
  if (spec.edition === "hobbyist") fail(400, "The Hobbyist edition is free for everybody; it needs no voucher.");
  const modules = spec.edition === "custom" ? MODULES.filter((m) => (Array.isArray(spec.modules) ? spec.modules : String(spec.modules ?? "").split(",")).map((x) => x.trim()).includes(m)).join(",") : undefined;
  const people = (typeof spec.for === "string" ? spec.for.split(/[\n,;]+/) : (spec.for ?? [])).map((w) => String(w).trim()).filter(Boolean);
  const prefix = spec.prefix || (Number(spec.percent) >= 100 ? "MANZO-GIFT" : "MANZO");
  const { privateKey } = await keys(env);
  const out: VoucherRecord[] = [];
  for (let i = 0; i < count; i++) {
    let id = voucherId(prefix);
    // A collision in 31^6 is unlikely, not impossible.
    for (let tries = 0; tries < 5 && (await env.KV.get(`voucher:${id}`)); tries++) id = voucherId(prefix);
    const payload: VoucherPayload = {
      v: 1,
      id,
      edition: spec.edition as Edition,
      ...(modules !== undefined ? { modules } : {}),
      percent: Number(spec.percent),
      issued: now,
      ...(spec.until ? { until: Math.floor(Number(spec.until)) } : {}),
      ...(people.length ? { for: people } : {}),
      ...(spec.note?.trim() ? { note: spec.note.trim() } : {}),
    };
    const r: VoucherRecord = { payload, line: await signVoucher(payload, privateKey), made: Date.now(), by, taken: [], revoked: false };
    await save(env, r);
    out.push(r);
  }
  return out;
}
