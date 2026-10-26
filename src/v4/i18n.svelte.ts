/**
 * The language the site speaks to this visitor: an address that says
 * (`?lang=de`), else the one they chose before (kept in this browser), else
 * the one most probably read where they are (`i18n/where.ts`: the region's,
 * the browser breaking a tie between a region's languages), else English.
 * Until the country is known, the browser's guess at it stands in.
 * `t(key)` is a phrase in it, English where it has none yet.
 *
 * Seven languages are in the page; the others are packs (`i18n/packs.ts`),
 * fetched and put in place before the page switches to them.
 */

import { BUILT_IN, ENGLISH, LANGS, LANG_INFO, PACKED, STRINGS, isPacked, type Key, type Lang } from "./i18n/strings";
import { hasPack, loadPack } from "./i18n/packs";
import { languageFor, pickerOrder, spoken } from "./i18n/where";
import { loadFacts } from "./i18n/facts.svelte";
import { countryFromLanguage } from "./skins";

export { LANGS, LANG_INFO, type Lang };

const KEY = "djmanzo:lang";

export const i18n = $state<{ lang: Lang; chosen: boolean }>({ lang: "en", chosen: false });

/** The languages the site speaks now: those in the page, and each packed one that has its pack. */
export const SPEAKS: Lang[] = [...BUILT_IN, ...PACKED.filter(hasPack)];

const isLang = (s: string | null | undefined): s is Lang => !!s && (SPEAKS as string[]).includes(s);

/** Which language a browser's list asks for first, of the ones the site speaks (a close one standing in). */
export function fromBrowser(languages: readonly string[]): Lang | null {
  for (const l of languages) {
    const own = spoken(l, isLang);
    if (own) return own;
  }
  return null;
}

const browser = (): readonly string[] => navigator.languages ?? [navigator.language];

/** The picker's languages: where the visitor is and English first, then the rest. */
export const pickerLanguages = (country: string | null): { first: Lang[]; rest: Lang[] } => pickerOrder(country, SPEAKS);

/** Whether the language was settled by the address or a kept choice, so where the visitor is does not change it. */
let fixed = false;
/** Whether the country is known, so the browser's guess no longer stands in for it. */
let settled = false;

/** Once, at start: the address's or the kept choice, else a guess from the browser until the country is known. */
export function startLanguage() {
  const asked = new URLSearchParams(location.search).get("lang");
  let kept: string | null = null;
  try {
    kept = localStorage.getItem(KEY);
  } catch {
    // A private window: where the visitor is decides, this visit.
  }
  if (isLang(asked) || isLang(kept)) {
    fixed = true;
    void apply(isLang(asked) ? asked : (kept as Lang), true);
  } else if (!settled) void apply(languageFor(countryFromLanguage(navigator.language), browser(), isLang), false);
}

/** Once the visitor's country is known (`region.svelte.ts`): the language most probably read there, unless one was chosen. */
export function followRegion(country: string | null) {
  settled = true;
  if (fixed || i18n.chosen) return;
  void apply(languageFor(country, browser(), isLang), false);
}

/** The visitor's choice, kept in this browser. */
export function chooseLanguage(lang: Lang) {
  fixed = true;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // Kept for this visit only.
  }
  void apply(lang, true);
}

let asking = 0;
async function apply(lang: Lang, chosen: boolean) {
  const mine = ++asking;
  if (isPacked(lang)) {
    try {
      await loadPack(lang);
    } catch {
      // Not fetched (offline, or a pack gone): the page stays in the language it has.
      return;
    }
    if (mine !== asking) return;
  }
  i18n.lang = lang;
  i18n.chosen = chosen;
  document.documentElement.lang = LANG_INFO[lang].tag;
  document.documentElement.dir = LANG_INFO[lang].rtl ? "rtl" : "ltr";
  loadFacts(lang);
}

/** The phrase for a key made from data (`kind.<file kind>`), or `fallback` where the site has none. */
export function tOr(key: string, fallback: string, vars: Record<string, string | number> = {}): string {
  return key in ENGLISH ? t(key as Key, vars) : fallback;
}

/** A phrase in the visitor's language, `{name}`s filled in from `vars`. */
export function t(key: Key, vars: Record<string, string | number> = {}): string {
  const s = STRINGS[i18n.lang]?.[key] ?? ENGLISH[key];
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
