import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

// What djmanzo and this site agree on lives in djmanzo's contracts/ (here
// app/contracts/, djmanzo checked out as a submodule), written there by
// djmanzo's own tests. The site keeps copies it builds from, so it builds
// without app/; these tests fail when a copy falls behind. To catch up: move
// app/ forward, then copy each file named in the failure over its copy.
const app = (p: string) => new URL(`../app/contracts/${p}`, import.meta.url);
const here = (p: string) => new URL(`../${p}`, import.meta.url);
const bytes = (u: URL) => readFileSync(u);

describe("the site's copies are djmanzo's contracts", () => {
  it("sells the editions dj_core::edition defines", () => {
    expect(bytes(here("shared/editions.json")).equals(bytes(app("editions.json")))).toBe(true);
  });

  it("checks packs by djmanzo's rules", () => {
    expect(bytes(here("shared/packrules.json")).equals(bytes(app("packrules.json")))).toBe(true);
  });

  it("holds its pack checker to djmanzo's packs and verdicts", () => {
    const theirs = readdirSync(app("packs/")).sort();
    expect(readdirSync(here("test/fixtures/packs/")).sort()).toEqual(theirs);
    for (const name of theirs) {
      expect(bytes(here(`test/fixtures/packs/${name}`)).equals(bytes(app(`packs/${name}`))), name).toBe(true);
    }
  });
});
