/**
 * Which language a visitor most probably reads, from where they are.
 *
 * Each country lists the languages the site speaks that are read there,
 * the most probable first. Where the country's own language is one the site
 * does not speak, the closest that it does stands in when a reader of the
 * one reads the other: Indonesian for Malay, Thai for Lao, Hindi for
 * Nepali, Turkish for Azerbaijani, French for Haitian Creole; English for
 * a browser in Tamil, Telugu, Kannada or Malayalam. A country not
 * listed is English: that is also the default when nothing is known.
 *
 * The browser breaks a tie: a Swiss browser in French gets French, a
 * Kenyan one in English gets English, but a browser's language that is not
 * read in the region does not override it. A choice the visitor makes in
 * the picker overrides all of this, and is kept.
 */

import type { Lang } from "./strings";

const ES = "AR BO CL CO CR CU DO EC GQ GT HN MX NI PA PE PR PY SV UY VE ES AD";
const FR = "FR MC BE BJ BF CF CG CI GA GN ML NE SN TG GF GP MQ BL MF PM RE YT NC PF WF HT MG";
const AR = "SA AE QA KW BH OM YE IQ SY JO PS LY EG SD EH";
const PT = "BR PT AO MZ GW CV ST";

/** Countries with more than one language, or a closest one, written out. */
const OWN: Record<string, Lang[]> = {
  DE: ["de"],
  AT: ["de"],
  LI: ["de"],
  LU: ["fr", "de"],
  CH: ["de", "fr", "it"],
  IT: ["it"],
  SM: ["it"],
  VA: ["it"],
  TR: ["tr"],
  AZ: ["tr"],
  US: ["en", "es"],
  CA: ["en", "fr"],
  BZ: ["en", "es"],
  MA: ["ar", "fr"],
  DZ: ["ar", "fr"],
  TN: ["ar", "fr"],
  MR: ["ar", "fr"],
  LB: ["ar", "fr"],
  TD: ["fr", "ar"],
  DJ: ["fr", "ar"],
  KM: ["fr", "ar"],
  CM: ["fr", "en"],
  CD: ["fr", "sw"],
  BI: ["fr", "sw"],
  RW: ["en", "fr", "sw"],
  KE: ["sw", "en"],
  TZ: ["sw"],
  UG: ["en", "sw"],
  SC: ["en", "fr"],
  MU: ["en", "fr"],
  IL: ["he", "ar"],
  JP: ["ja"],
  CN: ["zh"],
  TW: ["zh"],
  HK: ["zh", "en"],
  MO: ["zh", "pt"],
  SG: ["en", "zh", "id"],
  KR: ["ko"],
  KP: ["ko"],
  VN: ["vi"],
  TH: ["th"],
  LA: ["th"],
  ID: ["id"],
  MY: ["id", "en", "zh"],
  BN: ["id", "en"],
  TL: ["id", "pt"],
  IN: ["hi", "en"],
  NP: ["hi", "en"],
};

/** Every listed country's languages, the most probable first. */
export const SPOKEN: Record<string, Lang[]> = {
  ...Object.fromEntries(ES.split(" ").map((c) => [c, ["es"]])),
  ...Object.fromEntries(FR.split(" ").map((c) => [c, ["fr"]])),
  ...Object.fromEntries(AR.split(" ").map((c) => [c, ["ar"]])),
  ...Object.fromEntries(PT.split(" ").map((c) => [c, ["pt"]])),
  ...OWN,
};

/** A browser's language the site does not speak, read as the closest it does. */
const CLOSEST: Record<string, Lang> = {
  ms: "id",
  in: "id",
  iw: "he",
  lo: "th",
  ne: "hi",
  mr: "hi",
  az: "tr",
  ht: "fr",
  lb: "de",
  gsw: "de",
  ca: "es",
  gl: "es",
  eu: "es",
  yue: "zh",
  // In India's south, English is read before Hindi.
  ta: "en",
  te: "en",
  kn: "en",
  ml: "en",
};

/** A browser language tag as one the site speaks, or null. */
export function spoken(tag: string, speaks: (l: string) => l is Lang): Lang | null {
  const base = tag.toLowerCase().split(/[-_]/)[0];
  if (speaks(base)) return base;
  const near = CLOSEST[base];
  return near && speaks(near) ? near : null;
}

/**
 * The language for a visitor from `country` whose browser asks for
 * `browser`, of those `speaks` says the site has: the browser's own when the
 * region reads it too, else the region's most probable, else English.
 * Without a country, the browser's first that the site speaks.
 */
export function languageFor(country: string | null | undefined, browser: readonly string[], speaks: (l: string) => l is Lang): Lang {
  const mine = browser.map((b) => spoken(b, speaks)).filter((l): l is Lang => !!l);
  if (!country) return mine[0] ?? "en";
  const here = (SPOKEN[country.toUpperCase()] ?? ["en"]).filter(speaks);
  return mine.find((l) => here.includes(l)) ?? here[0] ?? "en";
}

/** The picker's order: the region's languages and English first, then the rest as listed. */
export function pickerOrder(country: string | null | undefined, all: readonly Lang[]): { first: Lang[]; rest: Lang[] } {
  const here = (country ? SPOKEN[country.toUpperCase()] : undefined) ?? [];
  const first = [...new Set([...here.filter((l) => all.includes(l)), "en" as Lang])];
  return { first, rest: all.filter((l) => !first.includes(l)) };
}
