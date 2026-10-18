/**
 * The conversation with the guide, shared by Silence and the dock that
 * follows the visitor along the path. It lives in this tab only
 * (sessionStorage) and goes with "Forget me".
 *
 * The opening is the page's own and costs nothing; the guide (`/api/guide`)
 * is asked only once the visitor answers. If it is off, capped or fails, the
 * page falls back to the scripted questions and says why.
 */

import type { Action, Fallback, GuideAnswer, GuideContext, Turn } from "../../../shared/guide";
import { api, post } from "../../lib/api";

const KEY = "djmanzo.guide";

/** Done by the page at once: they only re-dress the path or note what the visitor said. */
export const AT_ONCE: Action["kind"][] = ["set_style", "set_role", "show"];

export const WHY: Record<Fallback, string | null> = {
  off: null,
  limit: "The guide has talked a lot today, so these questions take over — they do the same job.",
  error: "The guide lost its voice for a moment, so these questions take over — they do the same job.",
  long: "That was a long talk; these questions take it from here.",
};

interface Kept {
  turns: Turn[];
  options: string[];
  offers: Action[];
}

function load(): Kept {
  try {
    const k = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as Kept | null;
    if (k && Array.isArray(k.turns)) return { turns: k.turns, options: k.options ?? [], offers: k.offers ?? [] };
  } catch {
    /* start again */
  }
  return { turns: [], options: [], offers: [] };
}

class Talk {
  private k = $state<Kept>(load());
  mode = $state<"unknown" | "claude" | "script">("unknown");
  why = $state<Fallback | null>(null);
  thinking = $state(false);
  /** The last screen the guide asked to show. */
  showing = $state<string | null>(null);

  get turns() {
    return this.k.turns;
  }
  /** Quick answers the guide offered for the next turn. */
  get options() {
    return this.k.options;
  }
  /** What the guide offered to do, waiting for the visitor to press it. */
  get offers() {
    return this.k.offers;
  }

  async init(): Promise<void> {
    if (this.mode !== "unknown") return;
    try {
      this.mode = (await api<{ on: boolean }>("/api/guide")).on ? "claude" : "script";
    } catch {
      this.mode = "script";
    }
  }

  /**
   * The visitor says something. Returns the actions the page should carry out
   * at once; the rest wait in `offers` as buttons.
   */
  async say(text: string, context: GuideContext): Promise<Action[]> {
    const said = text.trim();
    if (!said || this.thinking || this.mode !== "claude") return [];
    this.k = { turns: [...this.k.turns, { from: "visitor", text: said }], options: [], offers: this.k.offers };
    this.thinking = true;
    try {
      const r = await post<GuideAnswer>("/api/guide", { turns: this.k.turns, context });
      if ("fallback" in r) {
        this.fallBack(r.fallback);
        return [];
      }
      const now = r.actions.filter((a) => AT_ONCE.includes(a.kind));
      const later = r.actions.filter((a) => !AT_ONCE.includes(a.kind));
      // A new offer of a kind replaces the old one; the rest stay until used.
      const offers = [...this.k.offers.filter((o) => !later.some((l) => l.kind === o.kind)), ...later];
      this.k = { turns: [...this.k.turns, { from: "guide", text: r.say }], options: r.options, offers };
      const show = now.find((a) => a.kind === "show");
      if (show) this.showing = show.value;
      return now;
    } catch {
      this.fallBack("error");
      return [];
    } finally {
      this.thinking = false;
      this.save();
    }
  }

  /** An offer the visitor used or waved away. */
  drop(a: Action): void {
    this.k = { ...this.k, offers: this.k.offers.filter((o) => o !== a) };
    this.save();
  }

  forget(): void {
    this.k = { turns: [], options: [], offers: [] };
    this.showing = null;
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* nothing was kept */
    }
  }

  private fallBack(why: Fallback) {
    this.mode = "script";
    this.why = why;
  }

  private save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(this.k));
    } catch {
      /* not kept: the talk ends with the tab anyway */
    }
  }
}

export const talk = new Talk();

/** "21:40", the way the guide is told the time. */
export function hhmm(d: Date): string {
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}
