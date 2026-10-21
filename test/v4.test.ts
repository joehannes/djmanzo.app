import { describe, expect, it } from "vitest";
import { GENRE_BY_ID } from "../src/lib/genres";
import { SKINS, SKIN_BY_ID, countryFromLanguage, grooveFor, skinForCountry, skinForStyle } from "../src/v4/skins";
import { PARTS, bands, hits, render, stems, type Clock } from "../src/v4/wave/model";

describe("the site's skins follow where the visitor is", () => {
  it("dresses each part of the world in its own look", () => {
    expect(skinForCountry("DE")).toBe("club");
    expect(skinForCountry("gb")).toBe("club");
    expect(skinForCountry("DO")).toBe("tropical");
    expect(skinForCountry("MX")).toBe("tropical");
    expect(skinForCountry("US")).toBe("urban");
    expect(skinForCountry("NG")).toBe("afro");
    expect(skinForCountry("JP")).toBe("neon");
    expect(skinForCountry("IN")).toBe("monsoon");
    expect(skinForCountry("MA")).toBe("oasis");
    expect(skinForCountry("EG")).toBe("oasis");
    expect(skinForCountry("AU")).toBe("pacific");
    expect(skinForCountry("NZ")).toBe("pacific");
    expect(skinForCountry("AQ")).toBe("studio");
    expect(skinForCountry(null)).toBe("studio");
    expect(skinForCountry("")).toBe("studio");
  });

  it("plays a country its own music first, within its skin", () => {
    expect(grooveFor(SKIN_BY_ID.tropical, "DO")).toBe("merengue");
    expect(grooveFor(SKIN_BY_ID.tropical, "PR")).toBe("reggaeton");
    expect(grooveFor(SKIN_BY_ID.club, "GB")).toBe("dnb");
    expect(grooveFor(SKIN_BY_ID.club, "DE")).toBe("techno");
    // A Dominican visitor who picked the club look hears the club's music.
    expect(grooveFor(SKIN_BY_ID.club, "DO")).toBe("techno");
  });

  it("only offers grooves the engine can play", () => {
    for (const s of SKINS) for (const g of s.genres) expect(GENRE_BY_ID[g], `${s.id}: ${g}`).toBeTruthy();
  });

  it("reads a country from a browser language when the edge says nothing", () => {
    expect(countryFromLanguage("es-DO")).toBe("DO");
    expect(countryFromLanguage("de_AT")).toBe("AT");
    expect(countryFromLanguage("en")).toBeNull();
    expect(countryFromLanguage(undefined)).toBeNull();
  });

  it("maps what the guide hears about the visitor's music to a skin", () => {
    expect(skinForStyle("bachata")).toBe("tropical");
    expect(skinForStyle("techno")).toBe("club");
    expect(skinForStyle("afrobeats")).toBe("afro");
    expect(skinForStyle("nothing")).toBeNull();
  });

  it("keeps text readable on every skin (WCAG AA for body text and the accent's own label)", () => {
    const lum = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    for (const s of SKINS) {
      const t = s.tokens;
      expect(contrast(t.text, t.bg), `${s.id} text`).toBeGreaterThanOrEqual(7);
      expect(contrast(t.dim, t.surface), `${s.id} dim`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.onAccent, t.accent), `${s.id} on accent`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.accent, t.bg), `${s.id} accent`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("the waveforms are drawn from what the deck plays", () => {
  const house = GENRE_BY_ID.house.pattern;
  const clock: Clock = { time: 10, step: 0, stepDur: 0.125 };

  it("finds the four-on-the-floor kicks where they fall, ahead of the playhead too", () => {
    const kicks = hits(house, clock, 10, 12).filter((h) => h.part === "kick" && h.time >= 10);
    // House kicks on every beat: four sixteenths apart, 0.5 s at this tempo, starting at the anchor.
    expect(kicks.map((k) => k.time)).toEqual([10, 10.5, 11, 11.5, 12]);
  });

  it("peaks the low band on a kick and lets it ring away", () => {
    const columns = 400;
    const parts = render(house, clock, 10, 12, columns);
    const low = bands(parts, columns).subarray(0, columns);
    const at = (t: number) => low[Math.floor(((t - 10) / 2) * columns)];
    expect(at(10.51)).toBeGreaterThan(0.6);
    expect(at(10.51)).toBeGreaterThan(at(10.75));
    expect(at(10.45)).toBeLessThan(at(10.51));
  });

  it("silences a stem that is switched off, and only that one", () => {
    const columns = 200;
    const off = stems(render(house, clock, 10, 12, columns, { drums: false, perc: true, bass: true, keys: true }), columns);
    const on = stems(render(house, clock, 10, 12, columns), columns);
    expect(Math.max(...off.subarray(0, columns))).toBe(0);
    expect(Math.max(...on.subarray(0, columns))).toBeGreaterThan(0.5);
    expect(off.subarray(2 * columns, 3 * columns)).toEqual(on.subarray(2 * columns, 3 * columns));
  });

  it("keeps every level a shape, never above one", () => {
    const columns = 300;
    const parts = render(GENRE_BY_ID.merengue.pattern, { time: 0, step: 7, stepDur: 0.09 }, 0, 3, columns);
    expect(parts.length).toBe(PARTS.length * columns);
    for (const v of [...bands(parts, columns), ...stems(parts, columns)]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

import { fromHash, href, isOwn, parse, signalStage, stageOf, SIGNAL_STAGES, STAGE_TO } from "../src/v4/router";
import { STAGES } from "../src/stages/script";

describe("the site's addresses", () => {
  it("reads its pages from real paths, and anything else is home", () => {
    expect(parse("/")).toEqual({ page: "home", rest: [] });
    expect(parse("/pricing?edition=pro")).toEqual({ page: "pricing", rest: [] });
    expect(parse("/outboard/abc%20d")).toEqual({ page: "market", rest: ["abc d"] });
    expect(parse("/talkback/c/mixing")).toEqual({ page: "community", rest: ["c", "mixing"] });
    expect(parse("/imprint")).toEqual({ page: "read", rest: ["imprint"] });
    expect(parse("/blog/a-post")).toEqual({ page: "read", rest: ["blog", "a-post"] });
    expect(parse("/nowhere")).toEqual({ page: "home", rest: [] });
    expect(href("market", ["a b"])).toBe("/outboard/a%20b");
    expect(href("community", ["c", "mixing"])).toBe("/talkback/c/mixing");
    expect(href("pricing")).toBe("/pricing");
    expect(href("home")).toBe("/");
  });

  it("follows its own pages in place, and lets everything else load as a page", () => {
    for (const p of ["/", "/pricing", "/outboard", "/outboard/x", "/talkback/c/mixing"]) expect(isOwn(p), p).toBe(true);
    for (const p of ["/blog", "/imprint", "/api/outboard/items/1/v/1.djpack", "/island/", "/signal/", "/v4/art/club-hero.webp"]) expect(isOwn(p), p).toBe(false);
  });

  it("turns older hash addresses into paths, and sends the Signal Path's stages home to /signal/", () => {
    expect(fromHash("#/pricing")).toBe("/pricing");
    expect(fromHash("#/market/xyz")).toBe("/outboard/xyz");
    expect(fromHash("#/community/c/mixing")).toBe("/talkback/c/mixing");
    expect(fromHash("#/talkback/c/mixing")).toBe("/talkback/c/mixing");
    expect(fromHash("#/")).toBeNull();
    expect(fromHash("#main")).toBeNull();
    expect(signalStage("#/amp")).toBe("/signal/#/amp");
    expect(signalStage("#/pricing")).toBeNull();
    expect(SIGNAL_STAGES).toEqual(STAGES.map((s) => s.id));
  });

  it("knows every stage the guide can name", () => {
    for (const s of STAGES) expect(STAGE_TO[s.id], s.id).toBeTruthy();
    expect(stageOf({ page: "pricing", rest: [] }, null)).toBe("amp");
    expect(stageOf({ page: "home", rest: [] }, "stems")).toBe("needle");
  });
});

import { DEVICES, search } from "../src/v4/hardware";
import { FACT_BY_ID } from "../shared/facts";

describe("the hardware list never promises more than the facts", () => {
  it("names only controllers the facts name, mapped or planned as they say", () => {
    for (const d of DEVICES) {
      const fact = d.status === "mapped" ? FACT_BY_ID.mapped : FACT_BY_ID.hardware;
      expect(fact.about, `${d.maker} ${d.model}`).toContain(d.model);
    }
    expect(FACT_BY_ID.hardware.status).toBe("planned");
  });

  it("finds a controller by maker and model, in any order", () => {
    expect(search("pioneer 400").map((d) => d.model)).toEqual(["DDJ-400"]);
    expect(search("launchpad").length).toBe(1);
    expect(search("").length).toBe(DEVICES.length);
    expect(search("nothing like it")).toEqual([]);
  });
});

import { pick } from "../src/v4/shots";

describe("screenshots in the visitor's look", () => {
  it("shows a screen in the skin's own djmanzo theme when it was pictured in one", () => {
    expect(pick("perform", SKIN_BY_ID.tropical.themes)?.theme).toBe("Caribbean");
    expect(pick("dig", SKIN_BY_ID.tropical.themes)?.theme).toBe("Caribbean");
    expect(pick("prepare", SKIN_BY_ID.club.themes)?.theme).toBe("Industrial Techno");
    expect(pick("karaoke", SKIN_BY_ID.neon.themes)?.theme).toBe("Karaoke Neon");
  });

  it("falls back to djmanzo's own look, and to nothing for a screen never pictured", () => {
    expect(pick("settings", SKIN_BY_ID.club.themes)?.theme).toBe("Organic Base");
    expect(pick("no-such-screen", SKIN_BY_ID.club.themes)).toBeNull();
  });
});
