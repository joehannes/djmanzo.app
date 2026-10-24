import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PackError, checkArchive } from "../worker/djpack";
import { BUILTIN, actionProblem, placesOf, runProblem, setProblem, takesOver } from "../worker/keyset";
import RULES from "../shared/keyrules.json";

// Written by `tools/packsmith fixtures` with djmanzo's own code (app/): a
// keys pack for every way of being refused, and djmanzo's verdict on each.
const dir = new URL("./fixtures/keys/", import.meta.url);
const verdicts = JSON.parse(readFileSync(new URL("verdicts.json", dir), "utf8")) as Record<string, string>;
const bytes = (url: URL) => new Uint8Array(readFileSync(url));

/** Where the website is stricter than djmanzo, and says so in its own words. */
const STRICTER: Record<string, string> = {
  "keys-takes-over.djpack": 'Space d p is djmanzo\'s own (Play / pause): a set in Outboard adds keys, it does not take one over',
};

async function siteVerdict(file: URL): Promise<string> {
  try {
    await checkArchive(bytes(file));
    return "ok";
  } catch (e) {
    if (e instanceof PackError) return e.message;
    throw e;
  }
}

describe("a keys pack is checked as djmanzo checks one", () => {
  it("has djmanzo's verdict on every fixture, word for word", async () => {
    const files = readdirSync(dir).filter((f) => f.endsWith(".djpack"));
    expect(files.sort()).toEqual(Object.keys(verdicts).sort());
    for (const name of files) expect(await siteVerdict(new URL(name, dir)), name).toBe(STRICTER[name] ?? verdicts[name]);
  });

  it("is stricter than djmanzo only where it says so", () => {
    for (const name of Object.keys(STRICTER)) expect(verdicts[name], name).toBe("ok");
  });

  it("wears every set djmanzo ships, as djmanzo does", () => {
    expect(Object.keys(BUILTIN).length).toBeGreaterThanOrEqual(9);
    for (const [id, set] of Object.entries(BUILTIN)) expect(setProblem(set), id).toBeNull();
  });

  it("holds an action to the vocabulary: its verb, and the shape of its argument", () => {
    expect(actionProblem("deck 1 play")).toBeNull();
    expect(actionProblem("deck 1 loop 8")).toBeNull();
    expect(actionProblem("deck 1 voice 0.25")).toBeNull();
    expect(actionProblem("mic talkover_on")).toBeNull();
    expect(actionProblem("deck 1 play now")).toBe("play takes nothing after it");
    expect(actionProblem("deck 1 loop")).toBe("loop needs a number after it");
    expect(actionProblem("deck 1 loop eight")).toBe("loop takes one number");
    expect(actionProblem("deck x play")).toBe('"x" is not a deck');
    expect(runProblem("action deck @ hotcue 1")).toBeNull();
    expect(runProblem("welcome")).toBeNull();
    expect(runProblem("welcome back")).toBe('"welcome" is not a kind of key');
    expect(runProblem("uiop anything")).toMatch(/^Outboard cannot check a uiop key yet/);
  });

  it("refuses a key that would hide or sit under one of djmanzo's", () => {
    const set = (keys: string[]) => ({ name: "x", about: "", purpose: "other", edition: "", keys: [{ keys, label: "x", run: "ui palette" }] });
    expect(takesOver(set(["d"]))).toBe("Space d already opens djmanzo's \"Deck (letters: the current one)\"; choose keys below it or elsewhere");
    expect(takesOver(set(["d", "p", "x"]))).toBe("Space d p x: Space d p is djmanzo's \"Play / pause\", so nothing can come after it");
    expect(takesOver(set(["d", "t"]))).toBeNull();
    expect(takesOver(set(["q", "o"]))).toBeNull();
  });

  it("says which keys open a group of the set's own and which add to one of djmanzo's", () => {
    const places = placesOf({
      name: "x",
      about: "",
      purpose: "other",
      edition: "",
      keys: [
        { keys: ["k", "g"], label: "Guide", run: "ui palette" },
        { keys: ["s", "g"], label: "Guide too", run: "ui palette" },
      ],
    });
    expect(places).toEqual([
      { chain: "k g", label: "Guide", inside: null },
      { chain: "s g", label: "Guide too", inside: "Stems" },
    ]);
  });

  it("was written from the djmanzo the site reads", () => {
    const pinned = readFileSync(new URL("../app/.git", import.meta.url), "utf8");
    expect(RULES.app).toMatch(/^[0-9a-f]{40}$/);
    expect(pinned.length).toBeGreaterThan(0);
  });
});

describe("the crew's packs", () => {
  const crew = new URL("../public/packs/crew/", import.meta.url);
  const index = JSON.parse(readFileSync(new URL("index.json", crew), "utf8")) as { packs: { file: string; name: string; version: string; sha256: string }[] };

  it("are every file the index names, and pass the upload check", async () => {
    const files = readdirSync(crew).filter((f) => f.endsWith(".djpack"));
    expect(index.packs.map((p) => p.file).sort()).toEqual(files.sort());
    for (const p of index.packs) {
      const checked = await checkArchive(bytes(new URL(p.file, crew)));
      expect(checked.manifest.kind, p.file).toBe("keys");
      expect(checked.manifest.name).toBe(p.name);
    }
  });

  it("add keys and take none of djmanzo's over", async () => {
    for (const p of index.packs) {
      const { manifest } = await checkArchive(bytes(new URL(p.file, crew)));
      expect(takesOver(manifest.keys!), p.file).toBeNull();
      expect(placesOf(manifest.keys!).length).toBe(manifest.keys!.keys.length);
    }
  });
});
