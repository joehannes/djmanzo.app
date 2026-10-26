/**
 * The features (`shared/facts.ts`) in the visitor's language. English is the
 * facts themselves; each other language is a file of its own under
 * `facts/`, fetched only when that language is chosen, so a visitor reading
 * English carries none of them. Until a language's file has arrived, and for
 * anything it lacks, the English shows.
 *
 * djmanzo's own interface is in English, so its labels — Settings →
 * Licence, As recorded · Guide · Out, a preset's name — stay as the
 * application shows them; everything around them is in the language.
 */

import type { Area, Fact } from "../../../shared/facts";
import { AREAS, SOON_WORDS, STATUS_LINE } from "../../../shared/facts";
import { i18n } from "../i18n.svelte";
import type { FactWords } from "./factwords";
import type { Lang } from "./strings";

export type { FactText, FactWords } from "./factwords";

/** A packed language's facts join here once translated; until then its features read in English. */
const LOAD: Partial<Record<Exclude<Lang, "en">, () => Promise<{ default: FactWords }>>> = {
  es: () => import("./facts/es"),
  pt: () => import("./facts/pt"),
  de: () => import("./facts/de"),
  fr: () => import("./facts/fr"),
  it: () => import("./facts/it"),
  ja: () => import("./facts/ja"),
};

/** The loaded languages' words, by language. */
const loaded = $state<Partial<Record<Lang, FactWords>>>({});
const asked = new Set<Lang>();

/** Fetch a language's words, once. */
export function loadFacts(lang: Lang): void {
  const load = lang === "en" ? undefined : LOAD[lang];
  if (!load || asked.has(lang)) return;
  asked.add(lang);
  void load().then((m) => (loaded[lang] = m.default));
}

/** For the tests: the words a language has, read directly. */
export async function factWords(lang: Exclude<Lang, "en">): Promise<FactWords | undefined> {
  return (await LOAD[lang]?.())?.default;
}

const words = (): FactWords | undefined => (i18n.lang === "en" ? undefined : loaded[i18n.lang]);

/** A feature in the visitor's language, English where it has no words. */
export function tf(f: Fact): Fact {
  const w = words()?.facts[f.id];
  if (!w) return f;
  return {
    ...f,
    name: w.name || f.name,
    about: w.about || f.about,
    ...(f.caveat ? { caveat: w.caveat || f.caveat } : {}),
    ...(f.soon ? { soon: { ...f.soon, waits: w.waits || f.soon.waits } } : {}),
    ...(f.scene ? { scene: w.scene || f.scene } : {}),
  };
}

/** An area of features in the visitor's language. */
export function ta<A extends { id: Area; name: string; about: string }>(a: A): A {
  const w = words()?.areas[a.id];
  return w ? { ...a, name: w.name, about: w.about } : a;
}

/** The one-line status of djmanzo, in the visitor's language. */
export const statusLine = (): string => words()?.status ?? STATUS_LINE;

/** How close a coming feature is: almost there, in progress, planned. */
export const soonWord = (how: keyof typeof SOON_WORDS): string => words()?.soon[how] ?? SOON_WORDS[how];

export { AREAS };
