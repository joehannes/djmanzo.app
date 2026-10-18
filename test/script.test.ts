import { describe, expect, it } from "vitest";
import { FACT_BY_ID } from "../shared/facts";
import { STAGES } from "../src/stages/script";

describe("the stage script", () => {
  it("says nothing about djmanzo the facts do not", () => {
    for (const s of STAGES) for (const id of s.facts) expect(FACT_BY_ID[id], `${s.id} → ${id}`).toBeTruthy();
  });

  it("is one path from silence to afterglow, visiting every stage once", () => {
    const seen: string[] = [];
    let at: (typeof STAGES)[number] | undefined = STAGES[0];
    while (at) {
      expect(seen).not.toContain(at.id);
      seen.push(at.id);
      at = STAGES.find((s) => s.id === at!.next);
    }
    expect(seen).toEqual(STAGES.map((s) => s.id));
  });

  it("names a planned feature only where its fact says so", () => {
    // The Apprentice course was planned and is built now (main, 18 October): the fact moved, and the Cue stage with it.
    expect(FACT_BY_ID.curriculum.status).toBe("shipped");
    expect(FACT_BY_ID.gig.status).toBe("planned");
  });
});
