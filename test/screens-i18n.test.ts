import { describe, expect, it } from "vitest";
import shots from "../shared/shots.json";
import { SPOTS } from "../src/v4/hotspots";
import { SCREENS, altOf, spotOf } from "../src/v4/i18n/screens";
import { LANGS } from "../src/v4/i18n/strings";
import type { Shot } from "../src/signal/shots";

const ALL = shots as Shot[];
const screens = [...new Set(ALL.map((s) => s.screen))].sort();
const titles = [...new Set(Object.values(SPOTS).flatMap((list) => list.map((s) => s.title)))].sort();
/** The numbers in a phrase, whatever separates their digits. */
const numbers = (s: string) => s.match(/\d+/g) ?? [];

describe("the screenshots' words", () => {
  it("English descriptions are what the translated ones are built from", () => {
    for (const s of ALL) {
      expect(s.alt).toBe(`${s.shows} — djmanzo in the ${s.theme} theme${s.skin ? `, worn with the ${s.skin} skin` : ""}`);
    }
  });

  for (const lang of LANGS.filter((l) => l !== "en")) {
    const w = SCREENS[lang];
    it(`${lang}: every screen and every spot, none left over, numbers kept`, () => {
      expect(Object.keys(w.shows).sort()).toEqual(screens);
      expect(Object.keys(w.spots).sort()).toEqual(titles);
      for (const list of Object.values(SPOTS)) {
        for (const s of list) {
          const t = spotOf(s, lang);
          expect(t.title.trim() && t.text.trim(), `${lang} ${s.title}`).toBeTruthy();
          expect(t.text, `${lang} ${s.title} still English`).not.toBe(s.text);
          for (const n of numbers(s.text)) expect(numbers(t.text), `${lang} ${s.title}: ${n}`).toContain(n);
        }
      }
    });
    it(`${lang}: a picture's description names its theme and skin`, () => {
      for (const s of ALL) {
        const alt = altOf(s, lang);
        expect(alt).toContain(s.theme);
        if (s.skin) expect(alt).toContain(s.skin);
        expect(alt).toContain(w.shows[s.screen]);
      }
    });
  }
});
