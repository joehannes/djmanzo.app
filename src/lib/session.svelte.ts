/** Who is signed in, whether they are crew, and which sign-ins the site offers. */

import { api, post } from "./api";
import { profile } from "./profile.svelte";
import { FAILURES, PROVIDER_NAME, type Failure } from "../../shared/signin";

/** What the Worker said on the way back from a provider: signed in, an account connected, or why not. */
export interface Returned {
  kind: "signedin" | "linked" | "failed";
  provider: string | null;
  /** The sentence to show, for a failure (in English; `failure` names it, for a page in another language). */
  why: string | null;
  failure?: Failure | null;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  demo: boolean;
  owner: boolean;
  providers: string[];
  /** Their Patreon page, verified by connecting Patreon. */
  patreon?: string | null;
  /** Their GitHub Sponsors page, verified by signing in with GitHub. */
  githubSponsors?: string | null;
  /** Where they support djmanzo, as each platform said: patreon, github, kofi, buymeacoffee. */
  supports?: string[];
  /** They support djmanzo somewhere. */
  supporter?: boolean;
  /** Where the site writes to them, and when they confirmed it (null: kept while e-mail is not set up). */
  contact?: { email: string; confirmed: number | null } | null;
}

class Session {
  user = $state<SessionUser | null>(null);
  admin = $state(false);
  /** One of the crew's own accounts, whether or not it has given the crew's password in this browser yet. */
  crew = $state(false);
  /** Whether the site can send e-mail: a code to confirm an address, a receipt. */
  mail = $state(false);
  providers = $state<{ id: string; name: string }[]>([]);
  demo = $state(true);
  loaded = $state(false);
  /** Set once, from the address the Worker sent the browser back to. */
  returned = $state<Returned | null>(null);

  /**
   * Read `?signedin=…`, `?linked=…` or `?signin=failed&why=…` from the
   * address and take them out of it, so a reload or a shared link does not
   * say it again.
   */
  readReturn(loc: Location = location) {
    const q = new URLSearchParams(loc.search);
    const provider = q.get("signedin") ?? q.get("linked");
    const failed = q.get("signin") === "failed";
    if (!provider && !failed) return;
    const why = q.get("why") as Failure | null;
    this.returned = failed
      ? { kind: "failed", provider: null, why: (why && FAILURES[why]) || "The sign-in did not finish. Try again, or another way of signing in.", failure: why && why in FAILURES ? why : null }
      : { kind: q.has("linked") ? "linked" : "signedin", provider: PROVIDER_NAME[provider!] ?? provider, why: null };
    for (const k of ["signedin", "linked", "signin", "why"]) q.delete(k);
    const rest = q.toString();
    history.replaceState(history.state, "", `${loc.pathname}${rest ? `?${rest}` : ""}${loc.hash}`);
  }

  async refresh() {
    try {
      const me = await api<{ user: SessionUser | null; admin: boolean; crew?: boolean; mail?: boolean; providers: { id: string; name: string }[]; demo: boolean }>("/api/me");
      this.user = me.user;
      this.admin = me.admin;
      this.crew = !!me.crew;
      this.mail = !!me.mail;
      this.providers = me.providers;
      this.demo = me.demo;
      if (me.user) void this.syncProfile();
    } catch {
      /* the island works without the server; sign-in will say so when tried */
    } finally {
      this.loaded = true;
    }
  }

  /** Copy what the visitor told the island to their account, so djmanzo can read it. */
  async syncProfile() {
    const p = $state.snapshot(profile.p);
    try {
      await api("/api/me/profile", { method: "PUT", json: { name: p.name, role: p.role, venues: p.venues, genres: p.genres, gear: p.gear, experience: p.experience } });
    } catch {
      /* not worth interrupting anyone over */
    }
  }

  /** Off to a provider, coming back to `back`; `link` adds that account to the one signed in. */
  signInUrl(provider: string, back = location.pathname + location.search + location.hash, link = false): string {
    return `/auth/start/${provider}?return=${encodeURIComponent(back)}${link ? "&link=1" : ""}`;
  }

  async demoSignIn(name: string) {
    await post("/api/auth/demo", { name });
    // A sign-in that worked replaces whatever an earlier one said.
    this.returned = null;
    await this.refresh();
  }

  async signOut() {
    await post("/api/auth/signout");
    this.returned = null;
    this.user = null;
    this.admin = false;
    this.crew = false;
  }
}

export const session = new Session();
