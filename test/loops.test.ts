import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOOPS, fileOf } from "../src/v4/loops";

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
});
