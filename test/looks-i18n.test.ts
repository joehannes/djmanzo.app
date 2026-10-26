import { beforeAll, describe, expect, it } from "vitest";
import { LOOKS } from "../src/v4/looks";
import { SKINS } from "../src/v4/skins";
import { LOOK_WORDS, aboutOf, countryName, regionOf } from "../src/v4/i18n/looks";
import { installAll, translated } from "./packs";

beforeAll(installAll);

describe("the look picker's words", () => {
  for (const lang of translated("looks")) {
    it(`${lang}: every skin's region and ornaments, none in English, none left over`, () => {
      expect(Object.keys(LOOK_WORDS[lang as Exclude<typeof lang, "en">] ?? {}).sort()).toEqual(SKINS.map((s) => s.id).sort());
      for (const s of SKINS) {
        expect(regionOf(s.id, lang).trim()).toBeTruthy();
        expect(aboutOf(s.id, lang)).not.toBe(LOOKS[s.id].about);
      }
    });
  }
  it("English is the skins' own, and a country is named in the visitor's language", () => {
    expect(regionOf("tropical", "en")).toBe("Latin America & the Caribbean");
    expect(countryName("DO", "en")).toBe("Dominican Republic");
    expect(countryName("DO", "es")).toBe("República Dominicana");
    expect(countryName("DE", "de")).toBe("Deutschland");
  });
});
