/**
 * The shop's signing key, and when a licence's term ends.
 *
 * The licence line djmanzo reads is signed in `worker/applicence.ts`, in
 * the application's own format; this file holds the Ed25519 key it is signed
 * with and the arithmetic of terms.
 */

import { TRIAL_DAYS, type Plan } from "../shared/catalog";
import type { AppEnv } from "./env";
import type { Licence } from "./store";

type Keys = { privateKey: CryptoKey; publicKey: CryptoKey; publicRaw: string };

/**
 * The development key pair's private half, PKCS#8 base64: public on purpose
 * (`services/licence/test/dev-key.json`, which a test holds this to). A
 * licence it signs is believed only by a debug build of djmanzo
 * (`dj_app::licence::DEV_KEY`), so `wrangler dev` and a debug djmanzo can
 * sign in to each other, and no release ever believes it.
 */
export const DEV_PKCS8 = "MC4CAQAwBQYDK2VwBCIEIPRHk1/8fhaH7aZj2Lowc3Gwf6zAJy9NYB5g0P2A5mio";

/** The signing key: the `LICENCE_PRIVATE_KEY` secret in production, the development key without it. */
export async function keys(env: AppEnv): Promise<Keys> {
  const pkcs8 = env.LICENCE_PRIVATE_KEY || DEV_PKCS8;
  const der = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));
  const privateKey = await crypto.subtle.importKey("pkcs8", der, { name: "Ed25519" }, true, ["sign"]);
  const jwk = (await crypto.subtle.exportKey("jwk", privateKey)) as JsonWebKey;
  const publicKey = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x: jwk.x }, { name: "Ed25519" }, true, ["verify"]);
  return { privateKey, publicKey, publicRaw: jwk.x! };
}

/** A licence is in force when it is active and not past its end. */
export function inForce(licence: Licence, now = Date.now()): boolean {
  return licence.status === "active" && (licence.expires === null || licence.expires > now);
}

/** When a term that starts now (or extends `from`) ends. */
export function termEnd(plan: Plan, from: number, months?: number): number | null {
  if (plan === "perpetual") return null;
  // A trial is seven days to the minute: no grace, it was never paid for.
  if (plan === "trial") return from + TRIAL_DAYS * 86400_000;
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + (months ?? (plan === "yearly" ? 12 : 1)));
  // Three days' grace, so a renewal that lands a day late does not lock a DJ out mid-set.
  return d.getTime() + 3 * 86400_000;
}
