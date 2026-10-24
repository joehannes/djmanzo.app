import { afterEach, describe, expect, it } from "vitest";
import { ENGLISH, LANGS, LANG_INFO, STRINGS, type Key } from "../src/v4/i18n/strings";
import { WELCOME } from "../src/v4/i18n/welcome";
import { fromBrowser, i18n, t, tOr } from "../src/v4/i18n.svelte";
import { SKINS } from "../src/v4/skins";

const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("the site speaks seven languages", () => {
  afterEach(() => {
    i18n.lang = "en";
  });

  it("takes the first of the browser's languages it speaks, whatever the region", () => {
    expect(fromBrowser(["pt-BR", "en"])).toBe("pt");
    expect(fromBrowser(["en-US"])).toBe("en");
    expect(fromBrowser(["ko-KR", "ja-JP", "en"])).toBe("ja");
    expect(fromBrowser(["DE-at"])).toBe("de");
    expect(fromBrowser(["es-419"])).toBe("es");
    expect(fromBrowser(["ko", "zh-CN"])).toBeNull();
    expect(fromBrowser([])).toBeNull();
  });

  it("has English for every phrase, and nothing in another language English lacks", () => {
    for (const lang of LANGS) {
      for (const k of Object.keys(STRINGS[lang])) expect(ENGLISH, `${lang}: ${k}`).toHaveProperty(k);
    }
  });

  it("fills the same blanks in every language", () => {
    for (const lang of LANGS) {
      for (const [k, s] of Object.entries(STRINGS[lang])) expect(vars(s!), `${lang}: ${k}`).toEqual(vars(ENGLISH[k as Key]));
    }
  });

  it("translates every phrase on the first screens, leaving English only where the words are the same", () => {
    // System names and file kinds read the same in every language ("macOS", ".deb", "Apple silicon").
    const same = (k: string) => k.startsWith("os.") || k.startsWith("short.") || (k.startsWith("kind.") && !/karaoke|appimage|exe/.test(k));
    for (const lang of LANGS.filter((l) => l !== "en")) {
      const missing = Object.keys(ENGLISH).filter((k) => !same(k) && !(k in STRINGS[lang]));
      expect(missing, lang).toEqual([]);
    }
  });

  it("says a phrase in the chosen language, English where it has none, blanks filled", () => {
    i18n.lang = "de";
    expect(t("nav.pricing")).toBe("Preise");
    expect(t("dl.for", { os: "Linux" })).toBe("Download für Linux");
    expect(t("os.mac")).toBe("macOS");
    i18n.lang = "ja";
    expect(t("dl.newest", { v: "0.49.0" })).toContain("0.49.0");
    expect(tOr("kind.linux-deb", "x")).toBe(".deb (Debian, Ubuntu)");
    expect(tOr("kind.something-new", "Something new")).toBe("Something new");
  });

  it("names each language in itself, with the tag the page carries", () => {
    expect(LANG_INFO.pt.tag).toBe("pt-BR");
    expect(LANG_INFO.ja.name).toBe("日本語");
    expect(Object.keys(LANG_INFO).sort()).toEqual([...LANGS].sort());
  });
});

describe("the welcome is written for each look, in each language", () => {
  it("has a heading and a paragraph for every look in every language", () => {
    for (const s of SKINS) {
      for (const lang of LANGS) {
        const w = WELCOME[s.id]?.[lang];
        expect(w, `${s.id}.${lang}`).toBeDefined();
        expect(w.l1.trim().length, `${s.id}.${lang} l1`).toBeGreaterThan(3);
        expect(w.l2.trim().length, `${s.id}.${lang} l2`).toBeGreaterThan(3);
        // Two short lines on the first screen, and a paragraph that is read, not skimmed past.
        expect(w.l1.length, `${s.id}.${lang} l1`).toBeLessThanOrEqual(40);
        expect(w.l2.length, `${s.id}.${lang} l2`).toBeLessThanOrEqual(40);
        expect(w.lead.length, `${s.id}.${lang} lead`).toBeLessThanOrEqual(600);
        expect(w.lead.length, `${s.id}.${lang} lead`).toBeGreaterThan(150);
      }
    }
  });

  it("speaks to each scene differently, not one text with the look's name swapped in", () => {
    for (const lang of LANGS) {
      const heads = SKINS.map((s) => WELCOME[s.id][lang].l1 + WELCOME[s.id][lang].l2);
      const leads = SKINS.map((s) => WELCOME[s.id][lang].lead);
      expect(new Set(heads).size, lang).toBe(SKINS.length);
      expect(new Set(leads).size, lang).toBe(SKINS.length);
    }
  });

  it("is in the visitor's language, not English left in place", () => {
    for (const s of SKINS) {
      for (const lang of LANGS.filter((l) => l !== "en")) {
        expect(WELCOME[s.id][lang].lead, `${s.id}.${lang}`).not.toBe(WELCOME[s.id].en.lead);
        expect(WELCOME[s.id][lang].l1 + WELCOME[s.id][lang].l2, `${s.id}.${lang}`).not.toBe(WELCOME[s.id].en.l1 + WELCOME[s.id].en.l2);
      }
    }
  });

  it("always says what a DJ expects first: their crates come along", () => {
    for (const s of SKINS) for (const lang of LANGS) expect(WELCOME[s.id][lang].lead, `${s.id}.${lang}`).toMatch(/rekordbox|Serato/);
  });
});
