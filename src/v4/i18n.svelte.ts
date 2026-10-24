/**
 * The language the site speaks to this visitor: an address that says
 * (`?lang=de`), else the one they chose before (kept in this browser), else
 * the first of their browser's languages the site speaks, else English.
 * `t(key)` is a phrase in it, English where it has none yet.
 */

import { ENGLISH, LANGS, LANG_INFO, STRINGS, type Key, type Lang } from "./i18n/strings";
import { loadFacts } from "./i18n/facts.svelte";

export { LANGS, LANG_INFO, type Lang };

const KEY = "djmanzo:lang";

export const i18n = $state<{ lang: Lang; chosen: boolean }>({ lang: "en", chosen: false });

const isLang = (s: string | null | undefined): s is Lang => !!s && (LANGS as readonly string[]).includes(s);

/** Which language a browser's list asks for first, of the ones the site speaks. */
export function fromBrowser(languages: readonly string[]): Lang | null {
  for (const l of languages) {
    const base = l.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return null;
}

/** Once, at start. */
export function startLanguage() {
  const asked = new URLSearchParams(location.search).get("lang");
  let kept: string | null = null;
  try {
    kept = localStorage.getItem(KEY);
  } catch {
    // A private window: the browser's language, this visit.
  }
  const lang = isLang(asked) ? asked : isLang(kept) ? kept : (fromBrowser(navigator.languages ?? [navigator.language]) ?? "en");
  apply(lang, isLang(asked) || isLang(kept));
}

/** The visitor's choice, kept in this browser. */
export function chooseLanguage(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // Kept for this visit only.
  }
  apply(lang, true);
}

function apply(lang: Lang, chosen: boolean) {
  i18n.lang = lang;
  i18n.chosen = chosen;
  document.documentElement.lang = LANG_INFO[lang].tag;
  loadFacts(lang);
}

/** The phrase for a key made from data (`kind.<file kind>`), or `fallback` where the site has none. */
export function tOr(key: string, fallback: string, vars: Record<string, string | number> = {}): string {
  return key in ENGLISH ? t(key as Key, vars) : fallback;
}

/** A phrase in the visitor's language, `{name}`s filled in from `vars`. */
export function t(key: Key, vars: Record<string, string | number> = {}): string {
  const s = STRINGS[i18n.lang][key] ?? ENGLISH[key];
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
