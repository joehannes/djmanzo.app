/**
 * The languages that are not carried in the page: one file each under
 * `packs/`, fetched when the language is chosen. A pack is put into the
 * dictionaries it covers before the page switches to its language, so every
 * `DICT[i18n.lang]` finds an entry; what a pack does not have yet reads in
 * English.
 */

import { CANNED } from "./assistant";
import { ACCOUNT, type AccountWords } from "./account";
import { BITS, type BitsWords } from "./bits";
import { BOOTH, type BoothWords } from "./booth";
import { COMPARE, type CompareWords } from "./compare";
import { FEATURES_PAGE, type FeaturesPageWords } from "./featurespage";
import { HOME, type HomeWords } from "./home";
import { LOOK_WORDS } from "./looks";
import { NIGHTS, type NightsWords } from "./nights";
import { OUTBOARD, type OutboardWords } from "./outboard";
import { PAGES, type PagesWords } from "./pages";
import { PEOPLE, type PeopleWords } from "./people";
import { PRICING, type PricingWords } from "./pricing";
import { SCREENS, type ScreensWords } from "./screens";
import { SECTIONS, type SectionWords } from "./sections";
import { STATUS, type StatusWords } from "./status";
import { LANG_INFO, STRINGS, type Key, type PackLang } from "./strings";
import { TALKBACK, type TalkbackWords } from "./talkback";
import { WELCOME, type Welcome } from "./welcome";
import type { SkinId } from "../skins";

/** Everything a language can bring; a pack still being written has some of it. */
export interface Pack {
  strings: Partial<Record<Key, string>>;
  looks?: Record<SkinId, { region: string; about: string }>;
  welcome?: Record<SkinId, Welcome>;
  home?: HomeWords;
  sections?: SectionWords;
  booth?: BoothWords;
  screens?: ScreensWords;
  /** The assistant's ready answers, by question. */
  assistant?: Record<string, { q: string; a: string }>;
  status?: StatusWords;
  pricing?: PricingWords;
  account?: AccountWords;
  pages?: PagesWords;
  bits?: BitsWords;
  featuresPage?: FeaturesPageWords;
  compare?: CompareWords;
  nights?: NightsWords;
  people?: PeopleWords;
  talkback?: TalkbackWords;
  outboard?: OutboardWords;
}

/** The dictionaries that are a whole record per language, by the pack's name for them. */
const WHOLE = {
  home: HOME,
  sections: SECTIONS,
  booth: BOOTH,
  status: STATUS,
  pricing: PRICING,
  account: ACCOUNT,
  pages: PAGES,
  bits: BITS,
  featuresPage: FEATURES_PAGE,
  compare: COMPARE,
  nights: NIGHTS,
  people: PEOPLE,
  talkback: TALKBACK,
  outboard: OUTBOARD,
} as const;

const LOAD: Partial<Record<PackLang, () => Promise<{ default: Pack }>>> = {
  zh: () => import("./packs/zh"),
  he: () => import("./packs/he"),
  ar: () => import("./packs/ar"),
  hi: () => import("./packs/hi"),
  ko: () => import("./packs/ko"),
};

/** The packed languages that have a pack. */
export const hasPack = (lang: PackLang): boolean => !!LOAD[lang];

const installed = new Set<PackLang>();

/** Whether a phrase's first letter, past markup and blanks, is Latin. */
const latinFirst = (s: string): boolean => /^\p{Script=Latin}/u.test(s.replace(/<[^>]*>|\{\w+\}|[^\p{L}]/gu, ""));

/**
 * For a language read right to left: a phrase that starts with a Latin word
 * ("djmanzo …", "Pro DJ …") is given a right-to-left mark, so a paragraph
 * that takes its direction from its first letter still reads right to left.
 * Changed in place, so the pack and what the page reads stay one object.
 */
function markRtl(v: unknown): void {
  if (!v || typeof v !== "object") return;
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
    if (typeof x === "string") {
      if (latinFirst(x) && /[\p{Script=Hebrew}\p{Script=Arabic}]/u.test(x)) (v as Record<string, unknown>)[k] = `\u200f${x}`;
    } else markRtl(x);
  }
}

/** Put a pack's words where the page reads them; English stands in for what it lacks. */
export function install(lang: PackLang, p: Pack): void {
  if (LANG_INFO[lang].rtl) markRtl(p);
  STRINGS[lang] = p.strings;
  if (p.looks) LOOK_WORDS[lang] = p.looks;
  if (p.screens) SCREENS[lang] = p.screens;
  for (const id of Object.keys(WELCOME) as SkinId[]) WELCOME[id][lang] = p.welcome?.[id] ?? WELCOME[id].en;
  for (const [name, dict] of Object.entries(WHOLE) as [keyof typeof WHOLE, Record<string, unknown>][]) dict[lang] = p[name] ?? dict.en;
  for (const c of CANNED) {
    const own = p.assistant?.[c.id];
    if (own) {
      c.q[lang] = own.q;
      c.a[lang] = own.a;
    }
  }
  installed.add(lang);
}

/** Fetch a language's pack and install it, once. */
export async function loadPack(lang: PackLang): Promise<void> {
  if (installed.has(lang)) return;
  const load = LOAD[lang];
  if (!load) throw new Error(`No pack for ${lang}`);
  install(lang, (await load()).default);
}

/** For the tests: a language's pack as written, not yet installed. */
export async function packOf(lang: PackLang): Promise<Pack | undefined> {
  return (await LOAD[lang]?.())?.default;
}
