import { describe, expect, it } from "vitest";
import { beatOffset, camelotOf, camelotSemis, matched, relation, semisOf, shiftTo } from "../src/shop/practice";

describe("the practice room's Camelot wheel", () => {
  it("names the minor keys as DJs do", () => {
    // 8A A minor, 9A E minor, 7A D minor, 1A A-flat minor, 12A C-sharp minor.
    expect(camelotSemis(8)).toBe(0);
    expect(camelotSemis(9)).toBe(7);
    expect(camelotSemis(7)).toBe(5);
    expect(camelotSemis(1)).toBe(11);
    expect(camelotSemis(12)).toBe(4);
  });

  it("reads a number back from its key, all the way round", () => {
    for (let n = 1; n <= 12; n++) expect(camelotOf(camelotSemis(n))).toBe(n);
  });

  it("finds a loop's key from its root", () => {
    expect(semisOf(220)).toBe(0); // bachata, A
    expect(semisOf(147)).toBe(5); // dembow, D
    expect(semisOf(55)).toBe(0); // techno, A two octaves down
    expect(semisOf(165)).toBe(7); // reggaeton, E
  });

  it("shifts a loop onto any number by the shortest way", () => {
    for (let n = 1; n <= 12; n++) {
      const s = shiftTo(147, n);
      expect(s).toBeGreaterThanOrEqual(-6);
      expect(s).toBeLessThanOrEqual(5);
      expect(camelotOf((semisOf(147) + s + 12) % 12)).toBe(n);
    }
    expect(shiftTo(147, 7)).toBe(0);
  });

  it("calls neighbours a blend, across 12 and 1 as well, and the rest a clash", () => {
    expect(relation(8, 8)).toBe("same");
    expect(relation(8, 9)).toBe("neighbour");
    expect(relation(8, 7)).toBe("neighbour");
    expect(relation(12, 1)).toBe("neighbour");
    expect(relation(8, 10)).toBe("clash");
    expect(relation(8, 2)).toBe("clash");
  });
});

describe("the practice room's beat-matching", () => {
  const step = 60 / 135 / 4;

  it("reads two decks on the same beat as together", () => {
    expect(beatOffset({ nextTime: 10, step: 0, stepDur: step }, { nextTime: 10, step: 4, stepDur: step })).toBeCloseTo(0, 9);
  });

  it("counts from the next beat, not the next sixteenth", () => {
    // B's next sixteenth is the second of a beat: its beat comes three sixteenths later.
    const off = beatOffset({ nextTime: 10, step: 0, stepDur: step }, { nextTime: 10, step: 1, stepDur: step });
    expect(off).toBeCloseTo(-step, 9);
  });

  it("folds a late beat into half a beat either way", () => {
    const beat = step * 4;
    const late = beatOffset({ nextTime: 10, step: 0, stepDur: step }, { nextTime: 10 + 0.02, step: 0, stepDur: step });
    expect(late).toBeCloseTo(0.02, 9);
    const early = beatOffset({ nextTime: 10, step: 0, stepDur: step }, { nextTime: 10 + beat - 0.02, step: 0, stepDur: step });
    expect(early).toBeCloseTo(-0.02, 9);
  });

  it("calls it matched only when both the tempo and the beat agree", () => {
    expect(matched(0, 0.001, 0.005)).toBe(true);
    expect(matched(0, 0.01, 0.005)).toBe(false);
    expect(matched(0, 0.001, 0.03)).toBe(false);
    expect(matched(0, 0.001, -0.03)).toBe(false);
  });
});
