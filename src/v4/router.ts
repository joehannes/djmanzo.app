/**
 * The site's pages, by address. They are real paths — `/pricing`,
 * `/outboard/<id>`, `/talkback/c/<community>` — so they can be linked,
 * shared and found; the Worker renders the marketplace's, the forum's, the
 * blog's and the legal pages' words for whoever reads them without running
 * anything. Older addresses still land: the preview's hash routes
 * (`/v4/#/pricing`) and the Signal Path's stages (`/#/amp`, now at
 * `/signal/`).
 */

export const PAGES = ["home", "pricing", "market", "community", "read"] as const;
export type PageId = (typeof PAGES)[number];

export interface Route {
  page: PageId;
  /** What follows the page: an item's id, `c/<community>`, a post's id. */
  rest: string[];
}

const PATH_OF: Record<Exclude<PageId, "home" | "read">, string> = { pricing: "pricing", market: "outboard", community: "talkback" };
const PAGE_OF: Record<string, PageId> = { pricing: "pricing", outboard: "market", talkback: "community" };
/** Pages the Worker writes: shown as they came, inside the site. */
const READ = ["blog", "imprint", "terms", "rules", "privacy"];

const parts = (path: string) => path.split(/[?#]/)[0].split("/").filter(Boolean).map(decodeURIComponent);

/** The page a path names; anything unknown is home. */
export function parse(path: string): Route {
  const [first, ...rest] = parts(path);
  if (!first) return { page: "home", rest: [] };
  if (READ.includes(first)) return { page: "read", rest: [first, ...rest] };
  const page = PAGE_OF[first];
  return page ? { page, rest: page === "pricing" ? [] : rest } : { page: "home", rest: [] };
}

/** A page's address. */
export function href(page: PageId, rest: string[] = []): string {
  if (page === "home" || page === "read") return page === "read" ? `/${rest.map(encodeURIComponent).join("/")}` : "/";
  return `/${[PATH_OF[page], ...rest].map(encodeURIComponent).join("/")}`;
}

/** Whether a path is one of this page's own, to follow without loading the page again. */
export function isOwn(path: string): boolean {
  const [first] = parts(path);
  return !first || first in PAGE_OF;
}

const LEGACY: Record<string, string> = { pricing: "pricing", market: "outboard", community: "talkback", outboard: "outboard", talkback: "talkback" };

/**
 * An older address in the hash — the preview's (`#/pricing`, `#/market/x`)
 * or the Signal Path's sends (`#/outboard`) — as this site's path, or null.
 */
export function fromHash(hash: string): string | null {
  const [first, ...rest] = parts(hash.replace(/^#/, ""));
  const to = LEGACY[first ?? ""];
  return to ? `/${[to, ...rest].map(encodeURIComponent).join("/")}` : null;
}

/** The Signal Path's stages, whose old links (`/#/amp`) now belong at `/signal/`. */
export const SIGNAL_STAGES = ["silence", "groove", "needle", "cue", "confluence", "voice", "amp", "cone", "floor", "afterglow"];

export function signalStage(hash: string): string | null {
  const [first] = parts(hash.replace(/^#/, ""));
  return first && SIGNAL_STAGES.includes(first) ? `/signal/${hash}` : null;
}

/** Follow one of this page's own addresses without loading the page again. */
export function navigate(path: string) {
  history.pushState(null, "", path);
  dispatchEvent(new PopStateEvent("popstate"));
}

/** The guide's stages (the Signal Path's), as sections and pages here. */
export const STAGE_TO: Record<string, { page: PageId; section?: string }> = {
  silence: { page: "home" },
  groove: { page: "home", section: "tour" },
  needle: { page: "home", section: "stems" },
  cue: { page: "home", section: "learn" },
  confluence: { page: "home", section: "tour" },
  voice: { page: "home", section: "karaoke" },
  amp: { page: "pricing" },
  cone: { page: "home", section: "visuals" },
  floor: { page: "home", section: "hardware" },
  afterglow: { page: "home", section: "download" },
};

/** The stage the guide is told the visitor is at, from where they are here. */
export function stageOf(route: Route, section: string | null): string {
  if (route.page === "pricing") return "amp";
  if (route.page !== "home") return "afterglow";
  const hit = Object.entries(STAGE_TO).find(([, to]) => to.page === "home" && to.section === section);
  return hit ? hit[0] : "silence";
}
