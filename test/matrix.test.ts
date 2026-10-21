import { describe, expect, it } from "vitest";
import { EDITION_INFO } from "../shared/catalog";
import { AREAS, FACTS, areaOf, carriedBy } from "../shared/facts";

const has = (edition: keyof typeof EDITION_INFO) => (id: string) => carriedBy(FACTS.find((f) => f.id === id)!, EDITION_INFO[edition].modules);

describe("what each edition carries, feature by feature", () => {
  it("the free Hobbyist edition carries the whole foundation, and nothing a module carries", () => {
    const hobbyist = has("hobbyist");
    const foundation = FACTS.filter((f) => f.module === "foundation");
    expect(foundation.length).toBeGreaterThan(20);
    for (const f of foundation) expect(hobbyist(f.id), f.id).toBe(true);
    for (const f of FACTS.filter((x) => x.module !== "foundation")) expect(hobbyist(f.id), f.id).toBe(false);
  });

  it("the Karaoke edition carries the whole karaoke night — not one row — and Pro DJ does not", () => {
    const karaoke = FACTS.filter((f) => areaOf(f) === "karaoke" && f.module === "karaoke" && !f.also);
    expect(karaoke.length).toBeGreaterThanOrEqual(14);
    for (const f of karaoke) {
      expect(has("karaoke")(f.id), f.id).toBe(true);
      expect(has("full")(f.id), f.id).toBe(true);
      expect(has("pro")(f.id), f.id).toBe(false);
    }
    // The visuals behind the words need karaoke or video: both editions have them.
    expect(has("pro")("k-visuals")).toBe(true);
    expect(has("karaoke")("k-visuals")).toBe(true);
  });

  it("every fact belongs to an area a page lists, and Full carries every fact that is not planned", () => {
    const ids = new Set(AREAS.map((a) => a.id));
    for (const f of FACTS) expect(ids.has(areaOf(f)), f.id).toBe(true);
    for (const f of FACTS.filter((x) => x.status !== "planned")) expect(has("full")(f.id), f.id).toBe(true);
  });

  it("no two facts share an id", () => {
    expect(new Set(FACTS.map((f) => f.id)).size).toBe(FACTS.length);
  });
});
