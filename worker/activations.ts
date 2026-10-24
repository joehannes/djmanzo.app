/**
 * Activations: the computers a person's djmanzo is signed in on.
 *
 * The owner's rule (24 October): a licence belongs to the person — whichever
 * provider they sign in with, since accounts are linked by verified e-mail
 * (`worker/auth.ts`) — and is activated on up to `MAX_ACTIVATIONS`
 * computers at once (three unless the variable says otherwise). Signing in
 * again on a computer already activated uses its own activation again; a
 * new computer past the limit is refused, and the person removes one they
 * no longer use from their account page, then signs in there again.
 *
 * An activation is its renewal token's record. Removing it forgets the
 * token, so the next time that djmanzo goes online to renew it is told it
 * was removed (`revoked`) and forgets its licence, becoming the Hobbyist
 * edition at its next start — never in the middle of a set. Offline, a
 * licence keeps working as it always did.
 *
 * KV: `activations:<uid>` holds the person's list; `renew:<sha256>` the
 * token's record, naming its activation.
 */

import type { AppEnv } from "./env";
import { fail, randomId, sha256 } from "./http";
import { get, put } from "./store";

export const DEFAULT_MOST = 3;

/** One computer, as the person sees it on their account page. */
export interface Activation {
  id: string;
  /** What djmanzo calls this installation: random, kept beside its licence. Never a hardware fingerprint. */
  device: string;
  /** The computer's own name, as djmanzo read it there. */
  name: string;
  os: string;
  /** The account (provider:sub) the sign-in came through. */
  account: string;
  /** Seconds since 1970. */
  created: number;
  seen: number;
  /** SHA-256 of its renewal token. */
  renew: string;
}

/** What djmanzo says about the computer it runs on, checked. */
export interface Device {
  id: string;
  name: string;
  os: string;
}

/** How many computers one person may have activated at once. */
export function most(env: AppEnv): number {
  const n = Number(env.MAX_ACTIVATIONS);
  return Number.isInteger(n) && n >= 1 && n <= 50 ? n : DEFAULT_MOST;
}

/** The device djmanzo describes, or an anonymous one for a djmanzo too old to say. */
export function deviceOf(raw: unknown): Device {
  const d = (raw ?? {}) as Record<string, unknown>;
  const clean = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, n);
  const id = clean(d.id, 64);
  return {
    id: /^[A-Za-z0-9_-]{16,64}$/.test(id) ? id : `unnamed-${randomId(12)}`,
    name: clean(d.name, 60) || "A computer",
    os: clean(d.os, 20) || "unknown",
  };
}

export async function activationsOf(env: AppEnv, uid: string): Promise<Activation[]> {
  return (await get<Activation[]>(env.KV, `activations:${uid}`)) ?? [];
}

async function save(env: AppEnv, uid: string, list: Activation[]) {
  await put(env.KV, `activations:${uid}`, list);
}

export class AtLimit extends Error {}

/**
 * Activate `device` for `uid`, returning the renewal token to hand djmanzo.
 * The same device uses its own activation again (its old token stops
 * working); a new one past the limit throws `AtLimit`.
 */
export async function activate(env: AppEnv, uid: string, account: string, device: Device, now: number): Promise<string> {
  const list = await activationsOf(env, uid);
  const mine = list.find((a) => a.device === device.id);
  if (!mine && list.length >= most(env)) {
    throw new AtLimit(
      `djmanzo is already activated on ${list.length} computer${list.length === 1 ? "" : "s"} for this account, the most at once. Remove one you no longer use on your account page, then sign in here again.`,
    );
  }
  const token = randomId(32);
  const hash = await sha256(token);
  if (mine) {
    await env.KV.delete(`renew:${mine.renew}`);
    Object.assign(mine, { name: device.name, os: device.os, account, seen: now, renew: hash });
  } else {
    list.push({ id: randomId(12), device: device.id, name: device.name, os: device.os, account, created: now, seen: now, renew: hash });
  }
  const id = (mine ?? list[list.length - 1]).id;
  await put(env.KV, `renew:${hash}`, { uid, account, activation: id });
  await save(env, uid, list);
  return token;
}

/** A renewal token's activation, now seen; null when it was removed. */
export async function seen(env: AppEnv, uid: string, activation: string | undefined, now: number): Promise<Activation | null> {
  const list = await activationsOf(env, uid);
  const a = list.find((x) => x.id === activation);
  if (!a) return null;
  // Written at most once an hour: djmanzo renews quietly and often.
  if (now - a.seen > 3600) {
    a.seen = now;
    await save(env, uid, list);
  }
  return a;
}

/** Remove one of `uid`'s activations: its token stops working at once. */
export async function remove(env: AppEnv, uid: string, id: string): Promise<Activation[]> {
  const list = await activationsOf(env, uid);
  const gone = list.find((a) => a.id === id);
  if (!gone) fail(404, "That computer is not among your activations.");
  await env.KV.delete(`renew:${gone.renew}`);
  const left = list.filter((a) => a.id !== id);
  await save(env, uid, left);
  return left;
}

/** What the account page shows: no token hashes. */
export function view(list: Activation[], limit: number) {
  return { most: limit, activations: list.map(({ renew: _renew, ...a }) => a) };
}

/** Signing out on a computer: its activation goes with its token, freeing its place. */
export async function signOut(env: AppEnv, hash: string): Promise<void> {
  const r = await get<{ uid: string; activation?: string }>(env.KV, `renew:${hash}`);
  await env.KV.delete(`renew:${hash}`);
  if (!r?.activation) return;
  const list = await activationsOf(env, r.uid);
  const left = list.filter((a) => a.id !== r.activation);
  if (left.length !== list.length) await save(env, r.uid, left);
}
