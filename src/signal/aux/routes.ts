/**
 * The sends beside the main line (WEBSITE-ART.md): pages over the painting
 * that are not stages — Outboard, the marketplace; Talkback, the discussion
 * space; and the pages a site that hosts others' words must have.
 */
export const AUX = ["outboard", "talkback", "imprint", "terms", "rules", "privacy"] as const;
export type AuxId = (typeof AUX)[number];

export interface AuxRoute {
  id: AuxId;
  /** What follows: an item's id, `c/<community>`, a post's id. */
  rest: string[];
}

/** The page an address names (`/talkback/c/mixing`, or the older `#/talkback/c/mixing`), if it names one of these. */
export function auxRoute(address: string): AuxRoute | null {
  const parts = address.replace(/^#?\/?/, "").split(/[?#]/)[0].split("/").filter(Boolean).map(decodeURIComponent);
  const id = parts[0] as AuxId;
  return (AUX as readonly string[]).includes(id) ? { id, rest: parts.slice(1) } : null;
}

/**
 * A page's own address: a path, so that it can be linked, shared and found
 * (the Worker renders each one for whoever reads it without running it).
 */
export function auxPath(route: AuxRoute): string {
  return "/" + [route.id, ...route.rest].map(encodeURIComponent).join("/");
}


export const TITLE: Record<AuxId, string> = {
  outboard: "Outboard",
  talkback: "Talkback",
  imprint: "Imprint",
  terms: "Terms of use",
  rules: "Community rules",
  privacy: "Privacy",
};

export const SUBTITLE: Record<AuxId, string> = {
  outboard: "The marketplace: themes, skins and visuals made by DJs, for djmanzo. Everything in it is free.",
  talkback: "The discussion space: the craft, the music, the gear, the life around the gigs, and djmanzo.",
  imprint: "Who runs this site.",
  terms: "What you agree to when you post or upload here.",
  rules: "The good parts only.",
  privacy: "What this site keeps about you, and why.",
};

/** When something happened, in words. */
export function ago(ms: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d} d ago` : new Date(ms).toLocaleDateString();
}

/** What the Worker says about taking part (`people.standing`). */
export interface Standing {
  closed: string | null;
  signedIn: boolean;
  vouched: boolean;
  uploads: boolean;
  uid: string | null;
}
