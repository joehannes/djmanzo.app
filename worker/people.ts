/**
 * Who may add to Outboard and Talkback, and when.
 *
 * Reading is open to everyone. Writing — uploading, posting, commenting,
 * voting, rating, reporting — needs an account a sign-in provider vouches
 * for (not the demo sign-in, so a person stands behind every word), and a
 * site that says who runs it: until the imprint is filled in, nothing can be
 * written at all (the owner's choice, 18 October).
 */

import type { AppEnv } from "./env";
import { fail } from "./http";
import { whoami } from "./auth";
import type { User } from "./store";

export interface Imprint {
  name: string;
  address: string;
  email: string;
}

/** The imprint, once all of it is set. */
export function imprint(env: AppEnv): Imprint | null {
  const [name, address, email] = [env.IMPRINT_NAME?.trim(), env.IMPRINT_ADDRESS?.trim(), env.IMPRINT_EMAIL?.trim()];
  return name && address && email ? { name, address, email } : null;
}

/** Why nobody can write yet, or null when they can. */
export function closed(env: AppEnv): string | null {
  if (!env.DB) return "Outboard and Talkback are not set up on this site yet.";
  if (!imprint(env)) return "Posting and uploading open once the site's imprint is filled in.";
  return null;
}

/** Whether an account is one a provider vouches for. */
export const vouched = (u: User) => !u.demo && u.identities.some((i) => i.provider !== "demo" && i.provider !== "owner");

/** The person writing: signed in with a provider, on a site open for writing. */
export async function contributor(req: Request, env: AppEnv): Promise<User> {
  const why = closed(env);
  if (why) fail(403, why, { closed: true });
  const user = await whoami(req, env);
  if (!user) fail(401, "Sign in to take part.");
  if (!vouched(user!)) fail(403, "Sign in with Google, Apple, GitHub, Microsoft or Discord to take part: the demo sign-in cannot.");
  return user!;
}

/** What the page needs to know before it offers a button. */
export async function standing(req: Request, env: AppEnv) {
  const user = await whoami(req, env);
  return { closed: closed(env), signedIn: !!user, vouched: !!user && vouched(user), uploads: !!env.MEDIA, uid: user?.id ?? null };
}
