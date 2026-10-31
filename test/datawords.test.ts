// The words in the site's data, in every language: each note beside another
// application's price, and each hardware name that describes rather than names.
import { describe, expect, it } from "vitest";
import { MARKET } from "../shared/catalog";
import { DEVICES } from "../src/v4/hardware";
import { HARDWARE_NAMES, RIVAL_NOTES, dataWord } from "../src/v4/i18n/datawords";
import { LANGS } from "../src/v4/i18n/strings";

const OTHERS = LANGS.filter((l) => l !== "en");

describe("data words", () => {
  it("every note beside another application's price has words in every language", () => {
    for (const r of MARKET.filter((r) => r.note)) {
      const words = RIVAL_NOTES[r.note!];
      expect(words, `a note for ${r.product}: "${r.note}"`).toBeDefined();
      for (const l of OTHERS) expect(words[l]?.trim(), `${r.product} in ${l}`).toBeTruthy();
    }
  });

  it("every hardware name that is a description, not a maker's name, has words in every language", () => {
    // A maker or a model is a name; a lower-case word (or "Any", or an "and" between makers) describes.
    const describes = (s: string) => s === "Any" || / and |\b[a-z]{4,}\b/.test(s.replace(/\b(DJ|DDJs?)\b/g, ""));
    const names = [...new Set(DEVICES.flatMap((d) => [d.maker, d.model]))].filter(describes);
    expect(names.length).toBeGreaterThan(0);
    for (const n of names) {
      expect(HARDWARE_NAMES[n], `"${n}"`).toBeDefined();
      for (const l of OTHERS) expect(HARDWARE_NAMES[n][l]?.trim(), `"${n}" in ${l}`).toBeTruthy();
    }
  });

  it("each table's words differ from the English, and English reads the data as it is", () => {
    for (const table of [RIVAL_NOTES, HARDWARE_NAMES])
      for (const [en, words] of Object.entries(table)) {
        expect(dataWord(table, en, "en")).toBe(en);
        for (const l of OTHERS) expect(words[l], `"${en}" in ${l}`).not.toBe(en);
      }
    expect(dataWord(RIVAL_NOTES, "not in the table", "de")).toBe("not in the table");
  });
});

describe("the seeded wishes", () => {
  it("every wish the crew seeded the board with reads in every language, title, ask and note", async () => {
    const { SEED } = await import("../worker/community");
    const { WISH_SEED, WISH_TAGS, seededWish, wishTag } = await import("../src/v4/i18n/wishseed");
    expect(Object.keys(WISH_SEED).sort()).toEqual(SEED.map((w) => w.title).sort());
    for (const w of SEED)
      for (const l of OTHERS) {
        const words = seededWish(w.title, l);
        expect(words, `"${w.title}" in ${l}`).not.toBeNull();
        for (const part of ["title", "body", "note"] as const) expect(words![part]?.trim(), `"${w.title}" ${part} in ${l}`).toBeTruthy();
        if (w.tag) expect(WISH_TAGS[w.tag]?.[l], `the tag ${w.tag} in ${l}`).toBeTruthy();
      }
    // English reads the board as it is; a wish a visitor wrote stays theirs.
    expect(seededWish(SEED[0].title, "en")).toBeNull();
    expect(seededWish("A wish someone wrote", "de")).toBeNull();
    expect(wishTag("live", "en")).toBe("live");
  });
});
