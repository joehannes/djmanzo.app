import { beforeAll, describe, expect, it } from "vitest";
import { CARDS, EMPTY, EVENTS, GEAR, INTEREST, PLANS, QUESTIONS, SOFTWARE, WHERE, YOU, editionFor, fromQuery, stepsFor, toQuery, type Answers } from "../src/v4/journey";
import { JOURNEY } from "../src/v4/i18n/journey";
import { installAll, translated } from "./packs";

beforeAll(installAll);

const with_ = (a: Partial<Answers>): Answers => ({ ...structuredClone(EMPTY), ...a });

/** Every leaf of a value, by its path. */
function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  return Object.entries(v as Record<string, unknown>).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k));
}
const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe("the journey's edition", () => {
  it("fits how the DJ plays", () => {
    expect(editionFor(EMPTY)).toBe("hobbyist");
    expect(editionFor(with_({ you: "bedroom" }))).toBe("hobbyist");
    expect(editionFor(with_({ you: "new" }))).toBe("apprentice");
    expect(editionFor(with_({ you: "bedroom", plans: ["learn"] }))).toBe("apprentice");
    expect(editionFor(with_({ you: "working" }))).toBe("pro");
    expect(editionFor(with_({ you: "out", events: ["club"] }))).toBe("pro");
    expect(editionFor(with_({ you: "bedroom", gear: ["turntables"] }))).toBe("pro");
    expect(editionFor(with_({ you: "bedroom", plans: ["edits"] }))).toBe("pro");
    // A working DJ who teaches is still a working DJ.
    expect(editionFor(with_({ you: "pro", plans: ["teach"] }))).toBe("pro");
    expect(editionFor(with_({ you: "host" }))).toBe("karaoke");
    expect(editionFor(with_({ you: "host", events: ["club"] }))).toBe("karaoke");
    expect(editionFor(with_({ you: "working", events: ["wedding", "karaoke"] }))).toBe("full");
    expect(editionFor(with_({ events: ["wedding"], plans: ["karaoke"] }))).toBe("full");
    expect(editionFor(with_({ you: "venue" }))).toBe("autopilot");
    expect(editionFor(with_({ you: "venue", events: ["karaoke"] }))).toBe("karaoke");
  });
});

describe("the journey's steps", () => {
  it("put first what the answers ask for, at most six, with trying it last", () => {
    const crates = stepsFor(with_({ software: "rekordbox" }));
    expect(crates[0]).toBe("library");
    expect(crates).toContain("compare");
    expect(stepsFor(with_({ you: "host" }))[0]).toBe("karaoke");
    expect(stepsFor(with_({ you: "venue" }))[0]).toBe("autopilot");
    expect(stepsFor(with_({ you: "new" }))[0]).toBe("teacher");
    expect(stepsFor(with_({ gear: ["controller"] }))[0]).toBe("controller");
    expect(stepsFor(with_({ gear: ["cdjs"] }))[0]).toBe("decks");
    const busy = with_({ you: "working", events: ["club", "wedding", "karaoke"], gear: ["controller", "lights"], software: "serato", plans: ["edits", "stream"] });
    const s = stepsFor(busy);
    expect(s.length).toBe(7);
    expect(new Set(s).size).toBe(s.length);
    expect(s.at(-1)).toBe("try");
    // Nothing said, something still to do.
    expect(stepsFor(EMPTY)).toEqual(["community", "looks", "try"]);
  });

  it("each lead to a place on the site", () => {
    for (const c of [...CARDS, "try" as const]) expect(WHERE[c], c).toBeTruthy();
  });
});

describe("the journey in its address", () => {
  it("comes back as it went, commas and all", () => {
    const a = with_({ you: "out", events: ["club", "wedding"], styles: ["house", "bachata"], gear: ["controller"], software: "serato", plans: ["more"], edition: "try" });
    const q = toQuery(a);
    expect(q).toBe("y=out&e=club,wedding&s=house,bachata&g=controller&w=serato&p=more&x=try");
    expect(fromQuery(q, () => true)).toEqual(a);
  });

  it("drops what it does not know, and keeps eight styles at most", () => {
    const back = fromQuery("y=wizard&e=club,moon,club&s=house,nope,a,b,c,d,e,f,g,h&w=cassette&x=free", (g) => g !== "nope");
    expect(back.you).toBeNull();
    expect(back.events).toEqual(["club"]);
    expect(back.styles).toEqual(["house", "a", "b", "c", "d", "e", "f", "g"]);
    expect(back.software).toBeNull();
    expect(back.edition).toBe("free");
  });
});

describe("the journey's words", () => {
  it("name every answer, step and section in English", () => {
    const w = JOURNEY.en;
    for (const q of QUESTIONS) expect(w.questions[q].q).toBeTruthy();
    for (const [list, words] of [
      [YOU, w.options.you],
      [EVENTS, w.options.events],
      [GEAR, w.options.gear],
      [SOFTWARE, w.options.software],
      [PLANS, w.options.plans],
      [INTEREST, w.options.edition],
    ] as const)
      expect(Object.keys(words).sort()).toEqual([...list].sort());
    expect(Object.keys(w.cards).sort()).toEqual([...CARDS, "try"].sort());
  });

  it("are said in every language the site speaks, blanks kept, none empty, none left in English", () => {
    const en = new Map(leaves(JOURNEY.en));
    const langs = translated("journey");
    expect(langs.length).toBe(16);
    for (const lang of langs) {
      const here = new Map(leaves(JOURNEY[lang]));
      expect([...here.keys()].sort(), lang).toEqual([...en.keys()].sort());
      for (const [path, english] of en) {
        const s = here.get(path)!;
        expect(s.trim(), `${lang} ${path}`).toBeTruthy();
        expect(holes(s), `${lang} ${path}`).toEqual(holes(english));
        if (english.length > 30) expect(s, `${lang} ${path}`).not.toBe(english);
      }
    }
  });
});
