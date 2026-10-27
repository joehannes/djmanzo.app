/**
 * The journey: what a DJ tells the site about themselves, and the path the
 * site draws from it. Pure, so the page, its address and the tests agree.
 *
 * The answers are kept in the visitor's browser and in the page's address
 * (`/journey?y=out&e=club,wedding…`), so a journey can be shared; nothing is
 * sent anywhere.
 */

import type { Edition } from "../../shared/catalog";

export const YOU = ["new", "bedroom", "out", "working", "pro", "host", "venue"] as const;
export const EVENTS = ["club", "bar", "wedding", "private", "corporate", "festival", "radio", "karaoke", "culture", "school"] as const;
export const GEAR = ["laptop", "controller", "cdjs", "turntables", "mixer", "mic", "lights", "none"] as const;
export const SOFTWARE = ["rekordbox", "serato", "traktor", "virtualdj", "djay", "other", "none"] as const;
export const PLANS = ["first", "more", "pro", "karaoke", "stream", "teach", "learn", "edits"] as const;
export const INTEREST = ["free", "try", "buy", "unsure"] as const;

export type You = (typeof YOU)[number];
export type EventKind = (typeof EVENTS)[number];
export type Gear = (typeof GEAR)[number];
export type Software = (typeof SOFTWARE)[number];
export type Plan = (typeof PLANS)[number];
export type Interest = (typeof INTEREST)[number];

/** The questions, in the order they are asked. */
export const QUESTIONS = ["you", "events", "styles", "gear", "software", "plans", "edition"] as const;
export type Question = (typeof QUESTIONS)[number];
/** The questions with one answer; the rest take several. */
export const SINGLE: Question[] = ["you", "software", "edition"];

export interface Answers {
  you: You | null;
  events: EventKind[];
  styles: string[];
  gear: Gear[];
  software: Software | null;
  plans: Plan[];
  edition: Interest | null;
}

export const EMPTY: Answers = { you: null, events: [], styles: [], gear: [], software: null, plans: [], edition: null };

/** The steps a journey can show, each a place on the site. */
export const CARDS = ["library", "compare", "controller", "decks", "stems", "keys", "assistant", "autopilot", "karaoke", "requests", "teacher", "show", "nights", "community", "looks"] as const;
export type Card = (typeof CARDS)[number];

/** Where each step leads: a page, and a part of it. */
export const WHERE: Record<Card | "try", { page: "home" | "features" | "nights" | "community" | "market" | "compare" | "pricing"; part?: string }> = {
  library: { page: "features", part: "library" },
  compare: { page: "compare" },
  controller: { page: "home", part: "hardware" },
  decks: { page: "features", part: "hands" },
  stems: { page: "home", part: "stems" },
  keys: { page: "home", part: "keys" },
  assistant: { page: "home", part: "assistant" },
  autopilot: { page: "features", part: "assist" },
  karaoke: { page: "home", part: "karaoke" },
  requests: { page: "features", part: "karaoke" },
  teacher: { page: "home", part: "learn" },
  show: { page: "home", part: "visuals" },
  nights: { page: "nights" },
  community: { page: "community" },
  looks: { page: "market" },
  try: { page: "pricing" },
};

const any = <T>(have: readonly T[], ...want: T[]) => want.some((w) => have.includes(w));

/** Whether the answers say karaoke is part of the nights. */
const sings = (a: Answers) => a.you === "host" || a.events.includes("karaoke") || a.plans.includes("karaoke");
/** Whether the answers say the DJ plays records for a room, karaoke aside. */
const plays = (a: Answers) =>
  (a.you !== null && a.you !== "host" && a.you !== "venue") || any(a.events, "club", "bar", "wedding", "private", "corporate", "festival", "radio", "culture");

/** The edition that fits. */
export function editionFor(a: Answers): Edition {
  if (a.you === "venue" && !sings(a)) return "autopilot";
  if (sings(a)) return plays(a) && a.you !== "host" ? "full" : "karaoke";
  const working = a.you === "working" || a.you === "pro";
  if (!working && (a.you === "new" || any(a.plans, "learn", "teach"))) return "apprentice";
  if (working || any(a.plans, "pro", "edits", "stream") || any(a.gear, "cdjs", "turntables") || any(a.events, "club", "festival", "radio")) return "pro";
  return "hobbyist";
}

/** How much each step matters to these answers. */
function weigh(a: Answers): Record<Card, number> {
  const w = Object.fromEntries(CARDS.map((c) => [c, 0])) as Record<Card, number>;
  const add = (c: Card, n: number) => (w[c] += n);
  if (a.software && a.software !== "none") {
    add("library", 5);
    add("compare", 2);
  }
  if (a.gear.includes("controller")) add("controller", 5);
  if (any(a.gear, "laptop", "none")) add("controller", 1);
  if (any(a.gear, "cdjs", "turntables", "mixer")) add("decks", 5);
  if (a.plans.includes("edits")) add("stems", 5);
  if (any(a.events, "club", "festival", "radio")) add("stems", 2);
  if (a.you === "working" || a.you === "pro") {
    add("stems", 2);
    add("assistant", 2);
  }
  if (a.you === "out" || a.you === "working" || a.you === "pro") add("keys", 2);
  if (a.styles.length >= 2) add("keys", 1);
  if (any(a.events, "wedding", "private", "corporate")) add("assistant", 3);
  if (a.you === "venue") add("autopilot", 6);
  if (a.events.includes("bar")) add("autopilot", 2);
  if (a.you === "host") add("karaoke", 6);
  if (a.events.includes("karaoke")) add("karaoke", 5);
  if (a.plans.includes("karaoke")) add("karaoke", 5);
  if (any(a.events, "wedding", "private", "bar", "karaoke", "corporate", "culture")) add("requests", 3);
  if (a.you === "new" || a.you === "bedroom") add("teacher", 5);
  if (any(a.plans, "learn", "teach", "first")) add("teacher", 4);
  if (a.gear.includes("lights")) add("show", 4);
  if (any(a.events, "club", "festival")) add("show", 2);
  if (a.plans.includes("stream") || a.events.includes("radio")) add("show", 4);
  if (any(a.events, "wedding", "culture", "private", "corporate")) add("nights", 3);
  if (any(a.plans, "more", "first")) add("nights", 2);
  add("community", 1);
  if (any(a.plans, "first", "more", "pro")) add("community", 1);
  add("looks", 0.5);
  return w;
}

/** The steps for these answers, most telling first: up to six, and trying it always last. */
export function stepsFor(a: Answers, most = 6): (Card | "try")[] {
  const w = weigh(a);
  const ranked = [...CARDS].filter((c) => w[c] > 0).sort((x, y) => w[y] - w[x] || CARDS.indexOf(x) - CARDS.indexOf(y));
  return [...ranked.slice(0, most), "try"];
}

/** Whether anything has been answered yet. */
export const answered = (a: Answers) => QUESTIONS.some((q) => (Array.isArray(a[q]) ? (a[q] as unknown[]).length > 0 : a[q] !== null));

// --- In the address ---------------------------------------------------------------------------

const KEY: Record<Question, string> = { you: "y", events: "e", styles: "s", gear: "g", software: "w", plans: "p", edition: "x" };
const ALLOWED: Record<Exclude<Question, "styles">, readonly string[]> = { you: YOU, events: EVENTS, gear: GEAR, software: SOFTWARE, plans: PLANS, edition: INTEREST };

/** The answers as a query string (`y=out&e=club,wedding`), empty ones left out. */
export function toQuery(a: Answers): string {
  const q = new URLSearchParams();
  for (const k of QUESTIONS) {
    const v = a[k];
    const s = Array.isArray(v) ? v.join(",") : (v ?? "");
    if (s) q.set(KEY[k], s);
  }
  // Commas read better in an address than %2C, and mean the same to it.
  return q.toString().replace(/%2C/g, ",");
}

/** Answers from a query string; anything unknown is dropped, and a style must be one the site knows (`known`). */
export function fromQuery(search: string, known: (style: string) => boolean): Answers {
  const q = new URLSearchParams(search);
  const list = (k: Question) => (q.get(KEY[k]) ?? "").split(",").filter(Boolean);
  const pick = <T extends string>(k: Exclude<Question, "styles">) => list(k).filter((v) => ALLOWED[k].includes(v)) as T[];
  const one = <T extends string>(k: Exclude<Question, "styles">) => (pick<T>(k)[0] ?? null) as T | null;
  return {
    you: one<You>("you"),
    events: [...new Set(pick<EventKind>("events"))],
    styles: [...new Set(list("styles").filter(known))].slice(0, 8),
    gear: [...new Set(pick<Gear>("gear"))],
    software: one<Software>("software"),
    plans: [...new Set(pick<Plan>("plans"))],
    edition: one<Interest>("edition"),
  };
}
