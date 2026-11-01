import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOOPS, fileOf, makerOf } from "../src/v4/loops";
import { HOME } from "../src/v4/i18n/home";
import { installAll, translated } from "./packs";

describe("the deck's recorded loops", () => {
  it("every genre has its three stems in AAC and in Opus, and a browser without AAC is given the Opus", () => {
    // The fifteen the deck began with are all there; the regions' own join as their loops are made.
    for (const g of ["techno", "house", "dnb", "lounge", "merengue", "bachata", "reggaeton", "salsa", "cumbia", "dembow", "hiphop", "disco", "pop", "afrobeats", "dancehall"]) expect(LOOPS, g).toHaveProperty(g);
    for (const [genre, info] of Object.entries(LOOPS)) {
      for (const stem of ["drums", "bass", "rest"] as const) {
        expect(info.files[stem], genre).toBe(`${stem}.m4a`);
        expect(info.opus?.[stem], genre).toBe(`${stem}.webm`);
        expect(fileOf(info, stem, true)).toBe(`${stem}.m4a`);
        expect(fileOf(info, stem, false)).toBe(`${stem}.webm`);
        // And the files the index names are there to be served.
        for (const f of [info.files[stem], info.opus[stem]]) expect(existsSync(new URL(`../public/v4/loops/${genre}/${f}`, import.meta.url)), `${genre}/${f}`).toBe(true);
      }
      // A whole number of bars at the loop's own tempo: the seam is a downbeat.
      expect(info.seconds, genre).toBeCloseTo((info.bars * 4 * 60) / info.bpm, 1);
    }
  });

  it("credits each loop to what made it, in every language: Suno where the loop says so, ACE-Step for those made before", async () => {
    await installAll();
    for (const [genre, info] of Object.entries(LOOPS)) expect(makerOf(genre), genre).toBe(info.maker ?? "ACE-Step 1.5 XL");
    if (!Object.values(LOOPS).some((i) => i.maker)) expect(makerOf("house")).toBe("ACE-Step 1.5 XL");
    LOOPS.zzz = { ...LOOPS.house, maker: "Suno" };
    try {
      expect(makerOf("zzz")).toBe("Suno");
    } finally {
      delete LOOPS.zzz;
    }
    for (const lang of ["en" as const, ...translated("home")]) {
      const credit = HOME[lang].stems.credit;
      expect(credit, lang).toContain("{maker}");
      expect(credit.replace("{maker}", "Suno"), lang).toContain("Suno");
      expect(credit, lang).not.toContain("ACE-Step");
    }
  });
});
