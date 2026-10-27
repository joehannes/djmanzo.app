/**
 * For the tests: the packed languages installed as the page installs them,
 * and which of a pack's dictionaries are still being written. A dictionary
 * on the pending list is read in English and its tests skip that language;
 * `packs.test.ts` holds every pack to exactly what is not pending, so the
 * list can only shrink as the translations arrive.
 */

import { hasPack, loadPack, type Pack } from "../src/v4/i18n/packs";
import { BUILT_IN, PACKED, type Lang, type PackLang } from "../src/v4/i18n/strings";

export type Part = Exclude<keyof Pack, "strings">;

/** What comes after the home page: the shop, the account, the pages, the features, the forum. */
const AFTER_HOME: Part[] = ["status", "pricing", "account", "pages", "bits", "featuresPage", "compare", "nights", "people", "talkback", "outboard"];

/** The parts after the home page each pack has, as they arrive. */
const WRITTEN: Partial<Record<PackLang, Part[]>> = {
  zh: AFTER_HOME,
  he: AFTER_HOME,
  ar: AFTER_HOME,
  hi: AFTER_HOME,
};

/** The parts of each pack not written yet. */
export const PENDING: Record<PackLang, Part[]> = Object.fromEntries(PACKED.map((l) => [l, AFTER_HOME.filter((p) => !WRITTEN[l]?.includes(p))])) as Record<PackLang, Part[]>;

export async function installAll(): Promise<void> {
  for (const l of PACKED) if (hasPack(l)) await loadPack(l);
}

/** Whether `lang` has its own words for `part`: always for a language in the page, for a pack once written. */
export function has(lang: Lang, part: Part | "strings"): boolean {
  if ((BUILT_IN as readonly string[]).includes(lang)) return true;
  const l = lang as PackLang;
  return hasPack(l) && (part === "strings" || !PENDING[l].includes(part));
}

/** The languages other than English with their own words for `part`. */
export const translated = (part: Part | "strings"): Lang[] => [...BUILT_IN, ...PACKED].filter((l) => l !== "en" && has(l, part));
