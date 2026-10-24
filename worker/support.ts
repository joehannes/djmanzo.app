/**
 * Who supports djmanzo, and where (the owner, 21 October: "add the
 * integration of patreon & co properly for each user").
 *
 * A person is a supporter when a platform says so, never because they said
 * it themselves:
 * - **Patreon**: connecting Patreon names the campaigns they are an active
 *   patron of (`auth.ts`); djmanzo's is `PATREON_CAMPAIGN_ID`.
 * - **GitHub Sponsors**: signing in or connecting with GitHub names whom they
 *   sponsor (`auth.ts`, GitHub's GraphQL); djmanzo's account there is
 *   `GITHUB_SPONSORS_LOGIN`.
 * - **Ko-fi** and **Buy Me a Coffee**: each sends djmanzo's site a webhook
 *   when someone pays, with their email; a payment is kept against that
 *   address (`supporter:<platform>:<email>`) for a year, a membership for as
 *   long as it runs and a few days' grace, and a person whose account has
 *   that address, verified by the provider they signed in with, is a
 *   supporter. Nothing else from the payment is kept.
 *
 * Each person's own pages on these platforms are theirs to show: on their
 * profile, their packs and beside their name in the forum (`outboard.ts`
 * `DONATION_PLATFORMS`), and djmanzo handles no money for anyone.
 */

import type { AppEnv } from "./env";
import { equalBytes, fail } from "./http";
import type { User } from "./store";

export type Platform = "patreon" | "github" | "kofi" | "buymeacoffee";
export const PLATFORM_NAME: Record<Platform, string> = { patreon: "Patreon", github: "GitHub Sponsors", kofi: "Ko-fi", buymeacoffee: "Buy Me a Coffee" };

const DAY = 86_400;
/** How long a one-off payment counts: a year. */
export const ONE_OFF = 365 * DAY;
/** How long a membership's payment counts: a month and a few days' grace for the next. */
export const MEMBERSHIP = 40 * DAY;

const key = (platform: "kofi" | "buymeacoffee", email: string) => `supporter:${platform}:${email.trim().toLowerCase()}`;

/** The platforms on which `user` supports djmanzo, as the platforms said; empty when none. */
export async function supportsDjmanzo(env: AppEnv, user: User): Promise<Platform[]> {
  const out: Platform[] = [];
  if (env.PATREON_CAMPAIGN_ID && user.patronOf?.includes(env.PATREON_CAMPAIGN_ID)) out.push("patreon");
  if (env.GITHUB_SPONSORS_LOGIN && user.sponsorOf?.includes(env.GITHUB_SPONSORS_LOGIN.toLowerCase())) out.push("github");
  // The account's address is one a provider verified (`auth.ts` keeps no other).
  if (user.email && !user.demo) {
    for (const platform of ["kofi", "buymeacoffee"] as const) if (await env.KV.get(key(platform, user.email))) out.push(platform);
  }
  return out;
}

/** Keep a payment against an address, for as long as it counts. */
async function keep(env: AppEnv, platform: "kofi" | "buymeacoffee", email: string, kind: string, ttl: number) {
  await env.KV.put(key(platform, email), JSON.stringify({ kind, at: Date.now() }), { expirationTtl: ttl });
}

const ok = () => new Response(null, { status: 200 });

/**
 * Ko-fi's webhook: a form with `data`, a JSON object carrying the
 * verification token Ko-fi shows the page's owner (`KOFI_VERIFICATION_TOKEN`).
 * https://help.ko-fi.com/hc/en-us/articles/360004162298
 */
export async function kofi(env: AppEnv, req: Request): Promise<Response> {
  if (!env.KOFI_VERIFICATION_TOKEN) fail(503, "Ko-fi is not set up on this site.");
  const form = await req.formData().catch(() => null);
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(String(form?.get("data") ?? ""));
  } catch {
    return fail(400, "No data.");
  }
  const enc = new TextEncoder();
  if (!equalBytes(enc.encode(String(data.verification_token ?? "")), enc.encode(env.KOFI_VERIFICATION_TOKEN!))) fail(401, "Wrong token.");
  const email = typeof data.email === "string" ? data.email : "";
  if (!email.includes("@")) return ok();
  const membership = data.type === "Subscription" || data.is_subscription_payment === true;
  await keep(env, "kofi", email, String(data.type ?? "Donation"), membership ? MEMBERSHIP : ONE_OFF);
  return ok();
}

/**
 * Buy Me a Coffee's webhook: JSON, signed with the webhook's secret
 * (`BUYMEACOFFEE_WEBHOOK_SECRET`) as an HMAC-SHA256 of the body in
 * `x-signature-sha256`. A membership that ends stops counting at once.
 */
export async function buymeacoffee(env: AppEnv, req: Request): Promise<Response> {
  if (!env.BUYMEACOFFEE_WEBHOOK_SECRET) fail(503, "Buy Me a Coffee is not set up on this site.");
  const body = await req.text();
  const mac = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", new TextEncoder().encode(env.BUYMEACOFFEE_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    new TextEncoder().encode(body),
  );
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const enc = new TextEncoder();
  if (!equalBytes(enc.encode((req.headers.get("x-signature-sha256") ?? "").toLowerCase()), enc.encode(hex))) fail(401, "Bad signature.");
  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return fail(400, "Not JSON.");
  }
  const email = String(event.data?.supporter_email ?? "");
  if (!email.includes("@")) return ok();
  const type = String(event.type ?? "");
  if (type === "membership.cancelled") await env.KV.delete(key("buymeacoffee", email));
  else if (type.startsWith("membership.")) await keep(env, "buymeacoffee", email, type, MEMBERSHIP);
  else if (type === "donation.created" || type.startsWith("extra")) await keep(env, "buymeacoffee", email, type, ONE_OFF);
  return ok();
}
