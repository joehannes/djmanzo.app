/**
 * Insights: what visitors look at and look for, so the owner can give them
 * more of it — read in Backstage, never sold or shared.
 *
 * Kept without knowing who anyone is. There is no cookie and the browser
 * stores nothing for it; a visit is the first sixteen hex digits of a
 * SHA-256 of the day's secret salt, the connection's address and the
 * browser's name. The salt is random, kept in KV for two days and then
 * gone, so a visit cannot be traced back to an address nor followed from
 * one day to the next. The address itself is never stored. A browser that
 * sends Global Privacy Control or Do Not Track is not counted at all, nor
 * is anything that says it is a robot. What a visitor types into a search
 * or the assistant is kept as typed, with anything shaped like an address
 * or a phone number taken out. Rows are kept 90 days (`KEEP_DAYS`).
 *
 * The report (`report`) is read in SQL where it can be; only the order of
 * pages within visits is walked here. `suggest` turns it into starting
 * points: rules of thumb read from the numbers, not conclusions. `advise`
 * asks the site's AI for its reading of the same numbers.
 */

import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { AppEnv } from "./env";
import { clientIp, fail } from "./http";
import { OverBudget, anthropic, modelFor, provider, workersJson } from "./model";
import { list } from "./store";

export const KINDS = ["view", "leave", "section", "search", "ask", "click"] as const;
export type Kind = (typeof KINDS)[number];
export const KEEP_DAYS = 90;
/** The most one page sends at once, and the most a visit is counted for in a day (in one Worker). */
const BATCH = 40;
const DAILY = 1500;

const Hit = z.object({
  k: z.enum(KINDS),
  p: z.string().max(400),
  d: z.string().max(400).nullish(),
  n: z.number().finite().nullish(),
  s: z.number().int().min(0).max(1_000_000),
});
const Batch = z.object({
  events: z.array(Hit).max(BATCH),
  lang: z.string().max(8).nullish(),
  look: z.string().max(32).nullish(),
  ref: z.string().max(400).nullish(),
});

const ROBOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|curl|wget|python|node-fetch|go-http|java\//i;

export const dayOf = (t: number) => new Date(t).toISOString().slice(0, 10);

/** An order someone paid money for: not a rehearsal, a trial, a crew's grant or a free one. */
export const paidFor = (o: { s?: string; v?: string; t?: number } | null | undefined) => o?.s === "paid" && (o.t ?? 0) > 0 && !["demo", "trial", "grant", "free"].includes(o.v ?? "");

/** The page's address alone: no query, no fragment, never longer than 120. */
export function cleanPath(p: string): string {
  const path = p.split(/[?#]/)[0].trim();
  return (path.startsWith("/") ? path : `/${path}`).slice(0, 120);
}

/** What was typed, without an address or a phone number in it. */
export function cleanWords(d: string | null | undefined): string | null {
  if (!d) return null;
  const s = d
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[address]")
    .replace(/\+?\d[\d\s()./-]{6,}\d/g, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return s || null;
}

export function deviceOf(ua: string): "phone" | "tablet" | "computer" {
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  return /Mobi|iPhone|Android/i.test(ua) ? "phone" : "computer";
}

let salted: { day: string; salt: string } | null = null;
async function saltFor(env: AppEnv, day: string): Promise<string> {
  if (salted?.day === day) return salted.salt;
  const key = `insights:salt:${day}`;
  let salt = await env.KV.get(key);
  if (!salt) {
    salt = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
    await env.KV.put(key, salt, { expirationTtl: 2 * 86400 });
  }
  salted = { day, salt };
  return salt;
}

async function visitOf(env: AppEnv, req: Request, day: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${await saltFor(env, day)}|${clientIp(req)}|${req.headers.get("user-agent") ?? ""}`);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const counted = new Map<string, number>();

/** One page's batch of what happened on it. Says nothing back: 204 whether kept or not. */
export async function record(env: AppEnv, req: Request, raw: unknown, now = Date.now()): Promise<void> {
  if (!env.DB) return;
  if (req.headers.get("sec-gpc") === "1" || req.headers.get("dnt") === "1") return;
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || ROBOT.test(ua)) return;
  const parsed = Batch.safeParse(raw);
  if (!parsed.success || !parsed.data.events.length) return;
  const b = parsed.data;
  const day = dayOf(now);
  const visit = await visitOf(env, req, day);
  const key = `${day}:${visit}`;
  const already = counted.get(key) ?? 0;
  if (already >= DAILY) return;
  if (counted.size > 50_000) counted.clear();
  counted.set(key, already + b.events.length);

  const own = new URL(req.url).hostname;
  let referrer: string | null = null;
  try {
    const host = b.ref ? new URL(b.ref).hostname.replace(/^www\./, "") : null;
    referrer = host && host !== own ? host.slice(0, 80) : null;
  } catch {
    referrer = null;
  }
  const country = (req as Request & { cf?: { country?: string } }).cf?.country ?? null;
  const device = deviceOf(ua);
  const insert = env.DB.prepare(
    "INSERT INTO hits (day, at, visit, seq, kind, path, detail, n, lang, look, country, device, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  await env.DB.batch(
    b.events.map((e) =>
      insert.bind(day, now, visit, e.s, e.k, cleanPath(e.p), cleanWords(e.d), e.n == null ? null : Math.round(e.n), b.lang?.slice(0, 8) ?? null, b.look?.slice(0, 32) ?? null, country === "XX" ? null : country, device, e.k === "view" ? referrer : null),
    ),
  );
  // Now and then, what is older than KEEP_DAYS goes.
  if (Math.random() < 0.02) await forget(env, now);
}

export async function forget(env: AppEnv, now = Date.now()): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare("DELETE FROM hits WHERE day < ?").bind(dayOf(now - KEEP_DAYS * 86400_000)).run();
}

// --- The report ------------------------------------------------------------------------

export interface Count {
  value: string;
  visits: number;
}
export interface Report {
  days: number;
  since: string;
  visits: number;
  views: number;
  daily: { day: string; visits: number; views: number }[];
  pages: { path: string; views: number; visits: number; seconds: number | null; entries: number; exits: number }[];
  bounce: number | null;
  pagesPerVisit: number | null;
  paths: { path: string; visits: number }[];
  searches: { where: string; words: string; times: number; visits: number; found: number | null }[];
  asks: { words: string; times: number }[];
  clicks: { what: string; times: number; visits: number }[];
  sections: { path: string; section: string; visits: number; share: number }[];
  by: { lang: Count[]; look: Count[]; country: Count[]; device: Count[]; referrer: Count[] };
  funnel: { step: string; visits: number }[];
  paid: number;
}

const one = <T>(r: { results?: T[] }) => r.results ?? [];

export async function report(env: AppEnv, days: number, now = Date.now()): Promise<Report> {
  const span = Math.max(1, Math.min(KEEP_DAYS, Math.round(days)));
  const since = dayOf(now - (span - 1) * 86400_000);
  const db = env.DB;
  if (!db) fail(503, "Insights are kept in the D1 database, which this site has not got.");
  const q = <T>(sql: string, ...args: unknown[]) => db.prepare(sql).bind(since, ...args).all<T>().then(one);
  const [totals, daily, pages, views, searches, asks, clicks, sections] = await Promise.all([
    q<{ visits: number; views: number }>("SELECT COUNT(DISTINCT visit) AS visits, COALESCE(SUM(kind = 'view'), 0) AS views FROM hits WHERE day >= ?"),
    q<{ day: string; visits: number; views: number }>("SELECT day, COUNT(DISTINCT visit) AS visits, SUM(kind = 'view') AS views FROM hits WHERE day >= ? GROUP BY day ORDER BY day"),
    q<{ path: string; views: number; visits: number; ms: number | null }>(
      "SELECT path, SUM(kind = 'view') AS views, COUNT(DISTINCT CASE WHEN kind = 'view' THEN visit END) AS visits, AVG(CASE WHEN kind = 'leave' AND n BETWEEN 500 AND 1800000 THEN n END) AS ms FROM hits WHERE day >= ? AND kind IN ('view', 'leave') GROUP BY path HAVING views > 0 ORDER BY views DESC LIMIT 40",
    ),
    q<{ visit: string; path: string }>("SELECT visit, path FROM hits WHERE day >= ? AND kind = 'view' ORDER BY visit, at, seq LIMIT 40000"),
    q<{ path: string; words: string; times: number; visits: number; found: number | null }>(
      "SELECT path, lower(detail) AS words, COUNT(*) AS times, COUNT(DISTINCT visit) AS visits, MIN(n) AS found FROM hits WHERE day >= ? AND kind = 'search' AND detail IS NOT NULL GROUP BY path, lower(detail) ORDER BY times DESC LIMIT 40",
    ),
    q<{ words: string; times: number }>("SELECT MIN(detail) AS words, COUNT(*) AS times FROM hits WHERE day >= ? AND kind = 'ask' AND detail IS NOT NULL GROUP BY lower(detail) ORDER BY times DESC LIMIT 40"),
    q<{ what: string; times: number; visits: number }>("SELECT detail AS what, COUNT(*) AS times, COUNT(DISTINCT visit) AS visits FROM hits WHERE day >= ? AND kind = 'click' AND detail IS NOT NULL GROUP BY detail ORDER BY times DESC LIMIT 40"),
    q<{ path: string; section: string; visits: number }>("SELECT path, detail AS section, COUNT(DISTINCT visit) AS visits FROM hits WHERE day >= ? AND kind = 'section' AND detail IS NOT NULL GROUP BY path, detail ORDER BY path, visits DESC"),
  ]);
  const by = async (col: "lang" | "look" | "country" | "device" | "referrer") =>
    q<Count>(`SELECT ${col} AS value, COUNT(DISTINCT visit) AS visits FROM hits WHERE day >= ? AND ${col} IS NOT NULL GROUP BY ${col} ORDER BY visits DESC LIMIT 15`);
  const [lang, look, country, device, referrer] = await Promise.all([by("lang"), by("look"), by("country"), by("device"), by("referrer")]);

  // Each visit's pages in order: where it came in, where it left, how far it went.
  const walks = new Map<string, string[]>();
  for (const v of views) {
    const walk = walks.get(v.visit) ?? [];
    if (walk[walk.length - 1] !== v.path) walk.push(v.path);
    walks.set(v.visit, walk);
  }
  const entries = new Map<string, number>();
  const exits = new Map<string, number>();
  const pathCount = new Map<string, number>();
  let single = 0;
  let steps = 0;
  for (const walk of walks.values()) {
    entries.set(walk[0], (entries.get(walk[0]) ?? 0) + 1);
    exits.set(walk[walk.length - 1], (exits.get(walk[walk.length - 1]) ?? 0) + 1);
    if (walk.length === 1) single++;
    steps += walk.length;
    const shown = walk.slice(0, 4).join(" → ") + (walk.length > 4 ? " → …" : "");
    pathCount.set(shown, (pathCount.get(shown) ?? 0) + 1);
  }
  const walked = walks.size;
  const visitsOf = (path: string) => pages.find((p) => p.path === path)?.visits ?? 0;
  const homeVisits = visitsOf("/");

  const visitedLike = (prefix: string) => [...walks.values()].filter((w) => w.some((p) => p === prefix || p.startsWith(`${prefix}/`))).length;
  const clickedLike = (start: string) => clicks.filter((c) => c.what.startsWith(start)).reduce((n, c) => n + c.visits, 0);
  const sinceMs = Date.parse(`${since}T00:00:00Z`);
  const orders = await list<{ s?: string; v?: string; t?: number; at?: number }>(env.KV, "order:", 10000);
  const paid = orders.filter((o) => paidFor(o.metadata) && (o.metadata?.at ?? 0) >= sinceMs).length;

  return {
    days: span,
    since,
    visits: totals[0]?.visits ?? 0,
    views: totals[0]?.views ?? 0,
    // Every day of the period, a day without visits too.
    daily: Array.from({ length: span }, (_, i) => {
      const day = dayOf(Date.parse(`${since}T00:00:00Z`) + i * 86400_000);
      return daily.find((d) => d.day === day) ?? { day, visits: 0, views: 0 };
    }),
    pages: pages.map((p) => ({ path: p.path, views: p.views, visits: p.visits, seconds: p.ms == null ? null : Math.round(p.ms / 100) / 10, entries: entries.get(p.path) ?? 0, exits: exits.get(p.path) ?? 0 })),
    bounce: walked ? single / walked : null,
    pagesPerVisit: walked ? steps / walked : null,
    paths: [...pathCount.entries()]
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 15),
    searches: searches.map((s) => ({ where: s.path, words: s.words, times: s.times, visits: s.visits, found: s.found })),
    asks,
    clicks,
    sections: sections.map((s) => {
      const base = s.path === "/" ? homeVisits : visitsOf(s.path);
      return { ...s, share: base ? Math.min(1, s.visits / base) : 0 };
    }),
    by: { lang, look, country, device, referrer },
    funnel: [
      { step: "came", visits: walked },
      { step: "looked at the features", visits: visitedLike("/features") },
      { step: "looked at the prices", visits: visitedLike("/pricing") },
      { step: "pressed download", visits: clickedLike("download") },
      { step: "started a checkout", visits: clickedLike("checkout") },
      { step: "started signing in", visits: clickedLike("signin") },
    ],
    paid,
  };
}

// --- Starting points ---------------------------------------------------------------------

export interface Idea {
  area: "first look" | "finding" | "asking" | "reading" | "buying" | "devices" | "languages" | "arriving" | "too early";
  saw: string;
  idea: string;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Rules of thumb read from the report: where to look first, not what is true. */
export function suggest(r: Report): Idea[] {
  const out: Idea[] = [];
  if (r.visits < 20) {
    out.push({ area: "too early", saw: `${r.visits} visit${r.visits === 1 ? "" : "s"} in ${r.days} days.`, idea: "Too few to read anything into yet. The lists below already show what each visitor looked at and typed; the rules of thumb start at twenty visits." });
    if (!r.visits) return out;
  }
  const many = r.visits >= 20;
  if (many && r.bounce != null && r.bounce >= 0.55) {
    const entry = [...r.pages].sort((a, b) => b.entries - a.entries)[0];
    out.push({
      area: "first look",
      saw: `${pct(r.bounce)} of visits see one page and go${entry ? `, most of them from ${entry.path}` : ""}.`,
      idea: "Put what people come for within reach on that first screen: the download for their system, the price, a short video of djmanzo playing, and one obvious next step. The searches and questions below say what that is.",
    });
  }
  const leaky = r.pages.filter((p) => p.path !== "/" && p.visits >= 8 && p.exits / p.visits >= 0.5).sort((a, b) => b.exits / b.visits - a.exits / a.visits)[0];
  if (leaky) out.push({ area: "reading", saw: `${pct(leaky.exits / leaky.visits)} of those who open ${leaky.path} leave the site from there.`, idea: "End that page with the next step for someone who read that far — try it, see the prices, hear it, ask — instead of the end of the page." });
  const missed = r.searches.filter((s) => s.found === 0).slice(0, 6);
  if (missed.length)
    out.push({ area: "finding", saw: `Searched for and not found: ${missed.map((s) => `“${s.words}”`).join(", ")}.`, idea: "Add these words where they belong — a feature's name or description, a hardware entry, a question answered — or, when djmanzo does not do it yet, say so and link the wish list." });
  const wanted = r.searches.filter((s) => (s.found ?? 1) > 0).slice(0, 5);
  if (wanted.length) out.push({ area: "finding", saw: `Most looked for: ${wanted.map((s) => `“${s.words}” (${s.times})`).join(", ")}.`, idea: "Give these a place of their own where people arrive — a card on the home page, a link in the bar — so nobody has to search for them." });
  if (r.asks.length) out.push({ area: "asking", saw: `The assistant is asked most: ${r.asks.slice(0, 5).map((a) => `“${a.words}”`).join(", ")}.`, idea: "Answer these on the page itself, near where they are asked, and offer them as ready questions in the assistant." });
  const homeSections = r.sections.filter((s) => s.path === "/");
  const unseen = homeSections.filter((s) => s.share < 0.35).sort((a, b) => a.share - b.share).slice(0, 3);
  if (many && homeSections.length && unseen.length)
    out.push({ area: "reading", saw: `Few reach ${unseen.map((s) => `“${s.section}” (${pct(s.share)})`).join(", ")} on the home page.`, idea: "If these matter, move them up or point to them from the row under the welcome; if they do not, they can be shorter." });
  const step = (name: string) => r.funnel.find((f) => f.step === name)?.visits ?? 0;
  const prices = step("looked at the prices");
  const checkouts = step("started a checkout");
  if (prices >= 10 && checkouts / prices < 0.05)
    out.push({ area: "buying", saw: `${prices} visits looked at the prices; ${checkouts} started a checkout.`, idea: "Make the choice easier there: what the free Hobbyist already does, the seven-day trial beside every price, one table of what each edition adds, and an answer to the questions asked on that page." });
  const downloads = step("pressed download");
  if (many && downloads / Math.max(1, r.visits) < 0.05) out.push({ area: "buying", saw: `${downloads} of ${r.visits} visits pressed download.`, idea: "Make the download unmissable and say it is free: one button for the visitor's own system on every page, with what they get for nothing." });
  const phones = r.by.device.find((d) => d.value === "phone")?.visits ?? 0;
  if (many && phones / r.visits >= 0.4)
    out.push({ area: "devices", saw: `${pct(phones / r.visits)} of visits are on a phone, where djmanzo cannot be installed.`, idea: "Give phone visitors something for a phone: send the link to their computer, show what the singers' phones and the remote do, and keep the page light." });
  const other = r.by.lang.filter((l) => l.value !== "en").sort((a, b) => b.visits - a.visits)[0];
  if (many && other && other.visits / r.visits >= 0.25)
    out.push({ area: "languages", saw: `${pct(other.visits / r.visits)} of visits read in ${other.value}.`, idea: "What is still only in English (the legal pages, blog posts, the forum's older threads) is worth having in that language next." });
  const features = r.pages.find((p) => p.path === "/features");
  if (features && features.views >= 10 && features.seconds != null && features.seconds < 20)
    out.push({ area: "reading", saw: `The features page is read for ${features.seconds} s on average.`, idea: "Lead it with the six things people search for most and a search box, and let the full list follow." });
  const from = r.by.referrer[0];
  if (from && from.visits >= 5) out.push({ area: "arriving", saw: `Most visitors who came from another site came from ${from.value} (${from.visits}).`, idea: "Look at what brought them there and greet them with it: a page that continues that conversation converts better than the front door." });
  return out;
}

// --- The AI's reading -----------------------------------------------------------------

const Advice = z.object({
  ideas: z
    .array(z.object({ saw: z.string().describe("What in the numbers this is about."), change: z.string().describe("The concrete change to the site."), why: z.string().describe("Why it should help visitors find what they came for.") }))
    .max(10),
});
export type Advice = z.infer<typeof Advice>;

const ADVISOR = `You advise the owner of djmanzo's website, a beta DJ and karaoke application for Windows, macOS and Linux with free and paid editions. You are given anonymous, aggregated numbers about what visitors looked at, searched for, asked and clicked over a period. Suggest up to eight concrete improvements that would help visitors find what they came for, make the information easier to reach, and make the visit more inspiring and playful without getting in the way. Ground every suggestion in a number you were given; say plainly when the numbers are too few to conclude anything. Do not invent numbers, visitors or features. Write in plain English, briefly.`;

/** The site's AI reads the report and says what it would change. */
export async function advise(env: AppEnv, r: Report): Promise<Advice> {
  const summary = JSON.stringify({ ...r, daily: r.daily.slice(-30), paths: r.paths.slice(0, 10), searches: r.searches.slice(0, 25), asks: r.asks.slice(0, 25), clicks: r.clicks.slice(0, 25) });
  const ask = `The numbers, for the last ${r.days} days:\n${summary}`;
  const which = provider(env);
  if (which === "off") fail(503, "No AI is set up for the site: set AI_PROVIDER, or leave it to Workers AI.");
  if (which === "claude") {
    const client = anthropic(env);
    const response = await client.beta.messages.parse({
      model: await modelFor(env, client, "BLOG_MODEL"),
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(Advice) },
      system: ADVISOR,
      messages: [{ role: "user", content: ask }],
    });
    if (!response.parsed_output) fail(502, "The advice did not come back in shape.");
    return response.parsed_output;
  }
  try {
    const out = await workersJson(env, Advice, [{ role: "system", content: ADVISOR }, { role: "user", content: ask }], 2000);
    if (!out) fail(502, "The advice did not come back in shape.");
    return out;
  } catch (e) {
    if (e instanceof OverBudget) fail(429, "Today's free AI is used up; try again tomorrow.");
    throw e;
  }
}
