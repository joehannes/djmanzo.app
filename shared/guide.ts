/** What the guide (`worker/guide.ts`) is sent and answers, for the Worker and the page alike. */

export const KINDS = ["set_style", "set_role", "go_to", "show", "recommend", "start_trial", "open_checkout", "ask"] as const;
export type Kind = (typeof KINDS)[number];
export const ROLES = ["dj", "karaoke", "learning", "listening"] as const;
export type Role = (typeof ROLES)[number];
/** What the guide may ask permission for. The microphone comes with the Voice stage's play. */
export const ASKS = ["where", "gps"] as const;
export type Ask = (typeof ASKS)[number];

export interface Action {
  kind: Kind;
  value: string;
}

export interface Reply {
  say: string;
  /** Quick answers, as the visitor would say them. */
  options: string[];
  actions: Action[];
}

export interface Turn {
  from: "visitor" | "guide";
  text: string;
}

export interface GuideContext {
  stage?: string;
  style?: string;
  role?: string;
  visited?: string[];
  /** The visitor's local time, "21:40". */
  time?: string;
  /** They said yes to "roughly where you are": the edge's reading may be used. */
  where?: boolean;
  /** The sky over them, if they shared a location. */
  sky?: string;
  /** The language the visitor reads the site in (the one they chose, else their browser's), e.g. "de" or "pt-BR". */
  lang?: string;
}

/** Why the page should fall back to the scripted questions. */
export type Fallback = "off" | "limit" | "error" | "long";

export type GuideAnswer = Reply | { fallback: Fallback };
