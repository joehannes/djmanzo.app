import { describe, expect, it } from "vitest";
import { SECTIONS } from "../src/v4/i18n/sections";
import { LANGS } from "../src/v4/i18n/strings";

/** Every leaf of a value, by its path. */
function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  return Object.entries(v as Record<string, unknown>).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k));
}
const tags = (s: string) => (s.match(/<\/?[a-z]+/g) ?? []).sort();
const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe("the home page's sections, in every language", () => {
  const en = new Map(leaves(SECTIONS.en));
  for (const lang of LANGS.filter((l) => l !== "en")) {
    it(`${lang}: every phrase English has, with its markup and its blanks, and none empty`, () => {
      const here = new Map(leaves(SECTIONS[lang]));
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
