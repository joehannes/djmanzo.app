/**
 * The shape of a language's file under `facts/`: the features
 * (`shared/facts.ts`) in that language. Kept apart from `facts.svelte.ts`
 * so the Worker, which renders the features for search engines, can read
 * the same files.
 */

import type { Area, SOON_WORDS } from "../../../shared/facts";

export interface FactText {
  name: string;
  about: string;
  caveat?: string;
  waits?: string;
  scene?: string;
}

export interface FactWords {
  status: string;
  soon: Record<keyof typeof SOON_WORDS, string>;
  areas: Record<Area, { name: string; about: string }>;
  facts: Record<string, FactText>;
}
