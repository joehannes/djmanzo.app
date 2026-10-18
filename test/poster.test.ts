import { describe, expect, it } from "vitest";
import { POSTER_H, POSTER_W, caption, lines, stars } from "../src/signal/poster/constellation";
import { resolveStyle } from "../src/style/genome";

describe("the constellation poster", () => {
  it("puts every stage on the poster, lit where the visitor went", () => {
    const all = stars(["silence", "confluence", "amp"]);
    expect(all).toHaveLength(10);
    expect(all.filter((s) => s.lit).map((s) => s.id)).toEqual(["silence", "confluence", "amp"]);
    for (const s of all) {
      expect(s.x).toBeGreaterThan(0);
      expect(s.x).toBeLessThan(POSTER_W);
      expect(s.y).toBeGreaterThan(0);
      // Above the words at the bottom.
      expect(s.y).toBeLessThan(POSTER_H - 400);
    }
  });

  it("joins the lit stars in the signal's order, not the order they were visited in", () => {
    const joined = lines(stars(["amp", "silence", "confluence"])).map(([a, b]) => `${a.id}-${b.id}`);
    expect(joined).toEqual(["silence-confluence", "confluence-amp"]);
    expect(lines(stars(["groove"]))).toEqual([]);
  });

  it("writes the lineage, what the visitor does, and the town only if it was shared", () => {
    const style = resolveStyle("electroswing");
    const date = new Date("2026-10-17T22:00:00Z");
    const shared = caption({ style, lineage: ["EDM", "Electro swing"], visited: [], role: "dj", city: "Linz", sky: "rain", date });
    expect(shared[0]).toBe("EDM → Electro swing");
    expect(shared[1]).toBe("Walked by a DJ · Linz, rain sky");
    const kept = caption({ style, lineage: ["EDM", "Electro swing"], visited: [], role: null, city: null, sky: null, date });
    expect(kept.join(" ")).not.toMatch(/Linz|Walked/);
  });
});
