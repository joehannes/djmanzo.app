import { describe, expect, it } from "vitest";
import { LOOPS, fileOf } from "../src/v4/loops";

describe("the deck's recorded loops", () => {
  it("every genre has its three stems in AAC and in Opus, and a browser without AAC is given the Opus", () => {
    expect(Object.keys(LOOPS).length).toBe(15);
    for (const [genre, info] of Object.entries(LOOPS)) {
      for (const stem of ["drums", "bass", "rest"] as const) {
        expect(info.files[stem], genre).toBe(`${stem}.m4a`);
        expect(info.opus?.[stem], genre).toBe(`${stem}.webm`);
        expect(fileOf(info, stem, true)).toBe(`${stem}.m4a`);
        expect(fileOf(info, stem, false)).toBe(`${stem}.webm`);
      }
      // A whole number of bars at the loop's own tempo: the seam is a downbeat.
      expect(info.seconds, genre).toBeCloseTo((info.bars * 4 * 60) / info.bpm, 1);
    }
  });
});
