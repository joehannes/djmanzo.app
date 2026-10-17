/**
 * What the Signal Path knows about a visitor: the style they chose, what
 * they do, and the stages they have walked through — kept in this browser
 * only. It starts from the island's profile, if the visitor told the island
 * their music before.
 */

import { NODES } from "../style/genome";
import type { StageId } from "../style/genome/types";

export type Role = "dj" | "karaoke" | "learning" | "listening";

interface Saved {
  style: string;
  role: Role | null;
  visited: StageId[];
}

const KEY = "djmanzo.signal";

function load(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null") as Saved | null;
    if (s && NODES[s.style]) return { style: s.style, role: s.role ?? null, visited: s.visited ?? [] };
    const island = JSON.parse(localStorage.getItem("islamanzo.profile") ?? "null") as { genres?: string[] } | null;
    const first = island?.genres?.find((g) => NODES[g]);
    return { style: first ?? "music", role: null, visited: [] };
  } catch {
    return { style: "music", role: null, visited: [] };
  }
}

class SignalState {
  private s = $state<Saved>(load());

  get style() {
    return this.s.style;
  }
  get role() {
    return this.s.role;
  }
  get visited() {
    return this.s.visited;
  }

  setStyle(id: string) {
    if (NODES[id]) this.s.style = id;
    this.save();
  }
  setRole(r: Role) {
    this.s.role = r;
    this.save();
  }
  visit(id: StageId) {
    if (!this.s.visited.includes(id)) this.s.visited = [...this.s.visited, id];
    this.save();
  }
  forget() {
    this.s = { style: "music", role: null, visited: [] };
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* private window: nothing was kept anyway */
    }
  }
  private save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.s));
    } catch {
      /* private window: the visit simply is not remembered */
    }
  }
}

export const signal = new SignalState();
