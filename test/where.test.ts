import { describe, expect, it } from "vitest";
import { LANGS, type Lang } from "../src/v4/i18n/strings";
import { SPOKEN, languageFor, pickerOrder, spoken } from "../src/v4/i18n/where";
import { SKINS, skinForCountry } from "../src/v4/skins";

/** The site speaking every language it lists. */
const all = (l: string): l is Lang => (LANGS as readonly string[]).includes(l);
/** The site speaking only the seven it carries. */
const seven = (l: string): l is Lang => ["en", "es", "pt", "de", "fr", "it", "ja"].includes(l);

describe("the language follows where the visitor is", () => {
  it("is the region's most probable language, whatever the browser asks for outside it", () => {
    expect(languageFor("DE", ["en-US"], all)).toBe("de");
    expect(languageFor("DO", ["en-US"], all)).toBe("es");
    expect(languageFor("CN", ["en"], all)).toBe("zh");
    expect(languageFor("IL", ["en-US"], all)).toBe("he");
    expect(languageFor("EG", [], all)).toBe("ar");
    expect(languageFor("TZ", ["en-GB"], all)).toBe("sw");
    expect(languageFor("BR", ["es"], all)).toBe("pt");
  });

  it("lets the browser choose between the languages a region reads", () => {
    expect(languageFor("CH", ["fr-CH"], all)).toBe("fr");
    expect(languageFor("CH", ["en"], all)).toBe("de");
    expect(languageFor("CA", ["fr-CA"], all)).toBe("fr");
    expect(languageFor("KE", ["en-KE"], all)).toBe("en");
    expect(languageFor("KE", ["de"], all)).toBe("sw");
    expect(languageFor("IN", ["en-IN"], all)).toBe("en");
    expect(languageFor("IN", ["ta-IN"], all)).toBe("hi");
    expect(languageFor("IL", ["ar"], all)).toBe("ar");
    expect(languageFor("US", ["es-US"], all)).toBe("es");
  });

  it("stands the closest language in where the site does not speak a country's own", () => {
    expect(languageFor("MY", ["ms-MY"], all)).toBe("id");
    expect(languageFor("LA", [], all)).toBe("th");
    expect(languageFor("NP", [], all)).toBe("hi");
    expect(languageFor("AZ", [], all)).toBe("tr");
    expect(languageFor("HT", [], all)).toBe("fr");
    expect(spoken("ca-ES", all)).toBe("es");
    expect(spoken("iw", all)).toBe("he");
  });

  it("is English where nothing closer is read, and where nothing is known", () => {
    expect(languageFor("GB", ["de-DE"], all)).toBe("en");
    expect(languageFor("NL", ["nl-NL"], all)).toBe("en");
    expect(languageFor("NG", ["fr"], all)).toBe("en");
    expect(languageFor(null, [], all)).toBe("en");
    expect(languageFor(null, ["nl"], all)).toBe("en");
    // Without a country, the browser's own.
    expect(languageFor(null, ["ko-KR", "en"], all)).toBe("ko");
  });

  it("skips a language the site does not have yet, to the region's next or English", () => {
    expect(languageFor("CN", [], seven)).toBe("en");
    expect(languageFor("MA", [], seven)).toBe("fr");
    expect(languageFor("KE", ["de"], seven)).toBe("en");
  });

  it("lists only languages the site has, for real countries", () => {
    for (const [country, langs] of Object.entries(SPOKEN)) {
      expect(country, country).toMatch(/^[A-Z]{2}$/);
      expect(langs.length, country).toBeGreaterThan(0);
      for (const l of langs) expect(LANGS, `${country}: ${l}`).toContain(l);
    }
    // Every look's own countries are covered, or English is meant.
    expect(SKINS.length).toBeGreaterThan(0);
    expect(skinForCountry("EG")).toBe("oasis");
  });

  it("puts the region's languages and English first in the picker", () => {
    const { first, rest } = pickerOrder("CH", LANGS);
    expect(first).toEqual(["de", "fr", "it", "en"]);
    expect([...first, ...rest].sort()).toEqual([...LANGS].sort());
    expect(pickerOrder("GB", LANGS).first).toEqual(["en"]);
    expect(pickerOrder(null, LANGS).first).toEqual(["en"]);
    // A language the site does not have yet is not offered.
    expect(pickerOrder("CN", ["en", "es"]).first).toEqual(["en"]);
  });
});
