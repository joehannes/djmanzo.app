/**
 * The site's pages, by address. While the site is previewed at `/v4/` its
 * pages live in the hash (`/v4/#/pricing`); the marketplace and forum keep
 * their own path addresses everywhere else (`/outboard/<id>`,
 * `/talkback/c/<community>`), and links to those are taken in here instead
 * of leaving.
 */

export const PAGES = ["home", "pricing", "market", "community"] as const;
export type PageId = (typeof PAGES)[number];

export interface Route {
  page: PageId;
  /** What follows the page: an item's id, `c/<community>`, a post's id. */
  rest: string[];
}

/** The page a hash names: `#/pricing`, `#/market/abc`; anything else is home. */
export function parse(hash: string): Route {
  const parts = hash.replace(/^#?\/?/, "").split(/[?#]/)[0].split("/").filter(Boolean).map(decodeURIComponent);
  const page = parts[0] as PageId;
  return (PAGES as readonly string[]).includes(page) && page !== "home" ? { page, rest: parts.slice(1) } : { page: "home", rest: [] };
}

/** A page's address within the site. */
export function href(page: PageId, rest: string[] = []): string {
  return page === "home" ? "#/" : `#/${[page, ...rest].map(encodeURIComponent).join("/")}`;
}

const SITE_PATH: Record<string, PageId> = { outboard: "market", talkback: "community" };

/**
 * Where a site path (`/outboard/abc`, `/talkback/c/mixing`) leads within
 * these pages, or null when it is somewhere else (the API, a download, the
 * legal pages, which have their own).
 */
export function fromSitePath(path: string): string | null {
  const [p, ...rest] = path.split(/[?#]/)[0].split("/").filter(Boolean);
  const page = SITE_PATH[p ?? ""];
  return page ? href(page, rest.map(decodeURIComponent)) : null;
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
