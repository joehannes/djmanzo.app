import { beforeAll, describe, expect, it } from "vitest";
import { packOf, type Pack } from "../src/v4/i18n/packs";
import { HOME } from "../src/v4/i18n/home";
import { PRICING } from "../src/v4/i18n/pricing";
import { CANNED, answerOf, questionOf } from "../src/v4/i18n/assistant";
import { regionOf } from "../src/v4/i18n/looks";
import { LANG_INFO, PACKED, STRINGS, type PackLang } from "../src/v4/i18n/strings";
import { SEO, seoOf } from "../src/v4/i18n/seo";
import { i18n, t, SPEAKS } from "../src/v4/i18n.svelte";
import { PENDING, installAll, type Part } from "./packs";

/** Every leaf of a value, by its path. */
function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  return Object.entries(v as Record<string, unknown>).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k));
}
const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

const PARTS: Part[] = ["looks", "welcome", "home", "sections", "booth", "screens", "assistant", "status", "pricing", "account", "pages", "bits", "featuresPage", "compare", "nights", "people", "talkback", "outboard"];
const written = PACKED.filter((l) => SPEAKS.includes(l));

beforeAll(installAll);

describe("the languages that come as packs", () => {
  it("has a pack for at least one of them, and offers only those that have one", () => {
    expect(written.length).toBeGreaterThan(0);
    for (const l of PACKED) expect(SPEAKS.includes(l), l).toBe(written.includes(l));
  });

  for (const lang of written) {
    describe(lang, () => {
      let pack: Pack;
      beforeAll(async () => {
        pack = (await packOf(lang as PackLang))!;
      });

      it("has every part but the ones still being written, and none of those", () => {
        for (const part of PARTS) expect(part in pack, `${lang} ${part}`).toBe(!PENDING[lang].includes(part));
      });

      it("says everything the home page says, blanks kept, none empty, not left in English", () => {
        const en = new Map(leaves(HOME.en));
        const here = new Map(leaves(pack.home));
        expect([...here.keys()].sort()).toEqual([...en.keys()].sort());
        for (const [path, english] of en) {
          const s = here.get(path)!;
          expect(s.trim(), `${lang} ${path}`).toBeTruthy();
          expect(holes(s), `${lang} ${path}`).toEqual(holes(english));
          if (english.length > 40) expect(s, `${lang} ${path}`).not.toBe(english);
        }
      });

      it("answers every ready question in its own words", () => {
        expect(Object.keys(pack.assistant ?? {}).sort()).toEqual(CANNED.map((c) => c.id).sort());
        for (const c of CANNED) {
          expect(questionOf(c, lang), `${lang} ${c.id}`).not.toBe(c.q.en);
          expect(answerOf(c, lang), `${lang} ${c.id}`).not.toBe(c.a.en);
          expect(answerOf(c, lang).length, `${lang} ${c.id}`).toBeGreaterThan(40);
        }
      });

      it("is installed where the page reads it, and English stands in for what it does not have yet", () => {
        expect(HOME[lang]).toBe(pack.home);
        for (const part of PENDING[lang]) if (part === "pricing") expect(PRICING[lang]).toBe(PRICING.en);
        expect(regionOf("neon", lang)).toBe(pack.looks!.neon.region);
        i18n.lang = lang;
        expect(t("nav.pricing")).toBe(pack.strings["nav.pricing"]);
        i18n.lang = "en";
      });

      if (LANG_INFO[lang].rtl) {
        it("starts every phrase that opens with a Latin word with a right-to-left mark, so it still reads right to left", () => {
          const opensLatin = (x: string) => /^\p{Script=Latin}/u.test(x.replace(/<[^>]*>|\{\w+\}|[^\p{L}]/gu, ""));
          const marked = leaves(pack).filter(([, x]) => opensLatin(x) && /[\p{Script=Hebrew}\p{Script=Arabic}]/u.test(x));
          expect(marked.length).toBeGreaterThan(5);
          for (const [path, x] of marked) expect(x.startsWith("\u200f"), `${lang} ${path}`).toBe(true);
          // And nothing else is touched.
          expect(STRINGS[lang]!["nav.pricing"]!.startsWith("\u200f")).toBe(false);
        });
      }

      it("has the words the server renders its pages with", () => {
        expect(SEO[lang], lang).toBeDefined();
        const en = new Map(leaves(SEO.en));
        const here = new Map(leaves(seoOf(lang)));
        expect([...here.keys()].sort()).toEqual([...en.keys()].sort());
        for (const [path, english] of en) if (english.length > 40) expect(here.get(path), `${lang} ${path}`).not.toBe(english);
      });
    });
  }
});
