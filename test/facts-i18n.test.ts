import { describe, expect, it } from "vitest";
import { AREAS, FACTS } from "../shared/facts";
import type { FactWords } from "../src/v4/i18n/facts.svelte";
import es from "../src/v4/i18n/facts/es";
import pt from "../src/v4/i18n/facts/pt";
import de from "../src/v4/i18n/facts/de";
import fr from "../src/v4/i18n/facts/fr";
import it_ from "../src/v4/i18n/facts/it";
import ja from "../src/v4/i18n/facts/ja";
import th from "../src/v4/i18n/facts/th";
import vi from "../src/v4/i18n/facts/vi";
import id from "../src/v4/i18n/facts/id";
import ko from "../src/v4/i18n/facts/ko";
import hi from "../src/v4/i18n/facts/hi";
import ar from "../src/v4/i18n/facts/ar";
import he from "../src/v4/i18n/facts/he";
import zh from "../src/v4/i18n/facts/zh";

const ALL: Record<string, FactWords> = { es, pt, de, fr, it: it_, ja, zh, he, ar, hi, ko, id, vi, th };

describe("every feature, in every language the site speaks", () => {
  for (const [lang, w] of Object.entries(ALL)) {
    it(`${lang}: every feature and area is there, with each part English has, and nothing English lacks`, () => {
      expect(Object.keys(w.areas).sort(), `${lang} areas`).toEqual(AREAS.map((a) => a.id).sort());
      for (const a of AREAS) expect(Object.keys(w.areas[a.id]).sort(), `${lang} area ${a.id}`).toEqual(["about", "name"]);
      for (const a of AREAS) expect(w.areas[a.id].name.trim() && w.areas[a.id].about.trim(), `${lang} area ${a.id}`).toBeTruthy();
      expect(Object.keys(w.facts).sort(), `${lang} facts`).toEqual(FACTS.map((f) => f.id).sort());
      for (const f of FACTS) {
        const t = w.facts[f.id];
        expect(t.name.trim(), `${lang} ${f.id} name`).toBeTruthy();
        expect(t.about.trim(), `${lang} ${f.id} about`).toBeTruthy();
        expect(!!t.caveat, `${lang} ${f.id} caveat`).toBe(!!f.caveat);
        expect(!!t.waits, `${lang} ${f.id} waits`).toBe(!!f.soon?.waits);
        expect(!!t.scene, `${lang} ${f.id} scene`).toBe(!!f.scene);
        // Not English left in place.
        if (lang !== "en") expect(t.about, `${lang} ${f.id} about`).not.toBe(f.about);
      }
      expect(w.status.trim()).toBeTruthy();
      expect(Object.keys(w.soon).sort()).toEqual(["almost", "planned", "progress"]);
    });
  }
});
