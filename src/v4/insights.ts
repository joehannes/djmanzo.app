/**
 * What this visit looks at and looks for, sent to the site's own Insights
 * (`worker/insights.ts`), which the crew reads in Backstage. No cookie, and
 * nothing is kept in the browser for it; a browser that asks not to be
 * followed (Global Privacy Control, Do Not Track) sends nothing at all.
 *
 * - `view(path)` when a page is shown; the time on the one before goes with it.
 * - `track("click" | "ask", what)` for a press or a question.
 * - `searched(where, words, found)` as a search box changes: the words are
 *   sent once the visitor stops typing, with how many things they found.
 * - The home page's sections are noted once each as they come into view.
 *
 * What is sent goes in batches, and at the latest when the page is hidden.
 */

type Kind = "view" | "leave" | "section" | "search" | "ask" | "click";
interface Hit {
  k: Kind;
  p: string;
  d?: string;
  n?: number;
  s: number;
}

const nav = typeof navigator === "undefined" ? null : (navigator as Navigator & { globalPrivacyControl?: boolean });
const off = !nav || nav.globalPrivacyControl === true || nav.doNotTrack === "1";

let seq = 0;
let queue: Hit[] = [];
let page: string | null = null;
let since = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
/** Where the visit came from: sent with the first batch only. */
let ref: string | null = typeof document !== "undefined" && document.referrer ? document.referrer : null;
let context: () => { lang: string; look: string } = () => ({ lang: "", look: "" });

/** What the page says about the visit as a whole: its language and look. */
export function describe(f: () => { lang: string; look: string }) {
  context = f;
}

function push(h: Omit<Hit, "s">) {
  if (off) return;
  queue.push({ ...h, s: seq++ });
  if (queue.length >= 30) flush();
  else timer ??= setTimeout(flush, 8000);
}

export function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  while (queue.length) {
    const body = JSON.stringify({ events: queue.splice(0, 40), ...context(), ref });
    ref = null;
    const sent = nav?.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }));
    if (!sent) void fetch("/api/hit", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
  }
}

function leave() {
  if (page === null) return;
  push({ k: "leave", p: page, n: Math.round(performance.now() - since) });
  page = null;
}

let seen = new Set<string>();
let watcher: IntersectionObserver | null = null;
function watchSections() {
  watcher?.disconnect();
  seen = new Set();
  if (off || typeof IntersectionObserver === "undefined") return;
  const at = page;
  watcher = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).id;
        if (!e.isIntersecting || !id || seen.has(id) || page !== at) continue;
        seen.add(id);
        push({ k: "section", p: at ?? location.pathname, d: id });
      }
    },
    { threshold: 0.3 },
  );
  // The page's sections arrive a moment after its address does.
  const scan = () => document.querySelectorAll("main section[id]").forEach((s) => watcher?.observe(s));
  setTimeout(scan, 600);
  setTimeout(scan, 2500);
}

/** A page is shown. The same page again (a section of it, a language) is not a new view. */
export function view(path: string) {
  if (path === page) return;
  leave();
  page = path;
  since = performance.now();
  push({ k: "view", p: path });
  watchSections();
}

export function track(k: "click" | "ask", what: string) {
  const d = what.trim();
  if (d) push({ k, p: page ?? location.pathname, d: d.slice(0, 100) });
}

const typing = new Map<string, { timer: ReturnType<typeof setTimeout>; sent: string }>();
/** A search box changed: once it rests for a second and a half, what it holds and how much it found. */
export function searched(where: string, words: string, found: number) {
  const now = typing.get(where) ?? { timer: setTimeout(() => {}, 0), sent: "" };
  clearTimeout(now.timer);
  now.timer = setTimeout(() => {
    const w = words.trim();
    if (w.length < 2 || w.toLowerCase() === now.sent) return;
    now.sent = w.toLowerCase();
    push({ k: "search", p: page ?? location.pathname, d: w.slice(0, 100), n: found });
  }, 1500);
  typing.set(where, now);
}

if (typeof addEventListener !== "undefined" && !off) {
  addEventListener("pagehide", () => {
    leave();
    flush();
  });
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  // Back from the browser's own cache: shown again.
  addEventListener("pageshow", (e) => {
    if ((e as PageTransitionEvent).persisted) view(location.pathname);
  });
}
