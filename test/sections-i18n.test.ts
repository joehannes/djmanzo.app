import { beforeAll, describe, expect, it } from "vitest";
import { SECTIONS } from "../src/v4/i18n/sections";
import { ACCOUNT } from "../src/v4/i18n/account";
import { FEATURES_PAGE } from "../src/v4/i18n/featurespage";
import { PAGES } from "../src/v4/i18n/pages";
import { PRICING } from "../src/v4/i18n/pricing";
import { BITS } from "../src/v4/i18n/bits";
import { TALKBACK } from "../src/v4/i18n/talkback";
import { OUTBOARD } from "../src/v4/i18n/outboard";
import { COMPARE } from "../src/v4/i18n/compare";
import { NIGHTS } from "../src/v4/i18n/nights";
import { PEOPLE } from "../src/v4/i18n/people";
import { STATUS } from "../src/v4/i18n/status";
import { BOOTH } from "../src/v4/i18n/booth";
import { MAIL_WORDS } from "../worker/mailwords";
import { installAll, translated, type Part } from "./packs";

beforeAll(installAll);

/** Every leaf of a value, by its path. */
function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  return Object.entries(v as Record<string, unknown>).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k));
}
const tags = (s: string) => (s.match(/<\/?[a-z]+/g) ?? []).sort();
const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

const DICTIONARIES = { sections: SECTIONS, account: ACCOUNT, featuresPage: FEATURES_PAGE, pages: PAGES, pricing: PRICING, bits: BITS, talkback: TALKBACK, outboard: OUTBOARD, compare: COMPARE, nights: NIGHTS, people: PEOPLE, status: STATUS, booth: BOOTH, mail: MAIL_WORDS };

describe.each(Object.entries(DICTIONARIES))("%s, in every language", (name, dict) => {
  const en = new Map(leaves(dict.en));
  // The e-mails are the Worker's own; the rest come with a language's pack.
  const langs = name === "mail" ? Object.keys(MAIL_WORDS).filter((l) => l !== "en") : translated(name as Part);
  for (const lang of langs) {
    it(`${lang}: every phrase English has, with its markup and its blanks, and none empty`, () => {
      const here = new Map(leaves((dict as Record<string, unknown>)[lang]));
      expect([...here.keys()].sort()).toEqual([...en.keys()].sort());
      for (const [path, english] of en) {
        const t = here.get(path)!;
        expect(t.trim(), `${lang} ${path}`).toBeTruthy();
        expect(tags(t), `${lang} ${path} markup`).toEqual(tags(english));
        expect(holes(t), `${lang} ${path} blanks`).toEqual(holes(english));
      }
      // Not English left in place: the long phrases differ.
      const same = [...en].filter(([path, english]) => english.length > 40 && here.get(path) === english).map(([p]) => p);
      expect(same, `${lang} phrases still in English`).toEqual([]);
    });
  }
});
