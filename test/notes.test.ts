import { existsSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NOTES_URL, NOTE_LANGS, shape } from "../worker/notes";
import { browser } from "./people";
import { testEnv } from "./kv";

afterEach(() => vi.unstubAllGlobals());

const release = (over: Record<string, unknown> = {}) => ({
  version: "0.50.0",
  date: "2026-10-24",
  title: Object.fromEntries(NOTE_LANGS.map((l) => [l, `Title in ${l}`])),
  notes: Object.fromEntries(NOTE_LANGS.map((l) => [l, [`First in ${l}`, `Second in ${l}`]])),
  ...over,
});

/** GitHub, played here: djmanzo's notes file, or a refusal; and how often it was asked. */
function github(file: unknown, status = 200) {
  const asked: string[] = [];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    asked.push(String(url));
    if (String(url) !== NOTES_URL) throw new Error(`unexpected fetch ${url}`);
    const h = new Headers(init?.headers);
    expect(h.get("accept")).toBe("application/vnd.github.raw+json");
    expect(h.get("authorization")).toBe("Bearer read-token");
    return status === 200 ? Response.json(file) : Response.json({ message: "Not Found" }, { status });
  });
  return asked;
}

describe("djmanzo's release notes, as the site keeps them", () => {
  it("keeps every version with English notes, built when it is a minor or major version", () => {
    const got = shape({ releases: [release({ version: "0.50.1" }), release()] });
    expect(got.map((r) => [r.version, r.built])).toEqual([
      ["0.50.1", false],
      ["0.50.0", true],
    ]);
    expect(got[0].notes.ja).toEqual(["First in ja", "Second in ja"]);
  });

  it("leaves out what is not a version with a date and English, and a language the site does not speak", () => {
    const got = shape({
      releases: [
        release({ version: "0.50" }),
        release({ version: "v0.50.0" }),
        release({ date: "24 October" }),
        release({ notes: { de: ["Nur Deutsch"] } }),
        release({ title: { ...release().title, ko: "한국어" }, notes: { ...release().notes, ko: ["한국어"] } }),
        null,
      ],
    });
    expect(got).toHaveLength(1);
    expect(Object.keys(got[0].notes)).toEqual([...NOTE_LANGS]);
    expect(shape(null)).toEqual([]);
    expect(shape({ releases: "everything" })).toEqual([]);
  });

  it("clips a line too long to be a note", () => {
    const long = "x".repeat(5000);
    expect(shape({ releases: [release({ notes: { en: [long, "", "  "] } })] })[0].notes.en).toEqual(["x".repeat(1000)]);
  });

  it("serves them from GitHub with the site's token, and keeps them ten minutes", async () => {
    const asked = github({ releases: [release()] });
    const web = browser(testEnv({ GITHUB_RELEASES_TOKEN: "read-token" }));
    const first = await web("/api/release-notes");
    expect(first.status).toBe(200);
    expect(first.data[0]).toMatchObject({ version: "0.50.0", built: true });
    expect((await web("/api/release-notes")).data).toEqual(first.data);
    expect(asked).toHaveLength(1);
  });

  it("says why when GitHub refuses, and asks again next time", async () => {
    const asked = github(null, 404);
    const web = browser(testEnv({ GITHUB_RELEASES_TOKEN: "read-token" }));
    const r = await web("/api/release-notes");
    expect(r.status).toBe(502);
    expect(JSON.stringify(r.data)).toContain("404");
    await web("/api/release-notes");
    expect(asked).toHaveLength(2);
  });
});

describe("djmanzo's own notes file", () => {
  const file = new URL("../app/contracts/release-notes.json", import.meta.url);
  // app/ is djmanzo, checked out as a submodule; without it there is nothing to read.
  it.skipIf(!existsSync(file))("is read whole, every version in all seven languages", () => {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { releases: unknown[] };
    const got = shape(raw);
    expect(got).toHaveLength(raw.releases.length);
    for (const r of got) for (const l of NOTE_LANGS) expect(r.notes[l]?.length, `${r.version} ${l}`).toBe(r.notes.en!.length);
  });
});
