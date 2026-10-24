import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PackError, checkArchive, fingerprint, svgDrawsOnly } from "../worker/djpack";

// Written by dj_app::packs's own tests, with djmanzo's verdict on each.
const dir = new URL("./fixtures/packs/", import.meta.url);
const verdicts = JSON.parse(readFileSync(new URL("verdicts.json", dir), "utf8")) as Record<string, string>;
const pack = (name: string) => new Uint8Array(readFileSync(new URL(name, dir)));

/** The website's own rule, stricter than djmanzo's: a tile no skin names is still handed out. */
const STRICTER: Record<string, string> = {
  "unreferenced-scripted-tile.djpack": "skins/sneaky.svg does more than draw: a tile may hold no script, link, image, stylesheet or anything fetched",
};

async function siteVerdict(name: string): Promise<string> {
  try {
    await checkArchive(pack(name));
    return "ok";
  } catch (e) {
    if (e instanceof PackError) return e.message;
    throw e;
  }
}

describe("the website checks an upload as djmanzo checks an install", () => {
  it("has djmanzo's verdict on every pack, word for word", async () => {
    const files = readdirSync(dir).filter((f) => f.endsWith(".djpack"));
    expect(files.sort()).toEqual(Object.keys(verdicts).sort());
    for (const name of files) expect(await siteVerdict(name), name).toBe(STRICTER[name] ?? verdicts[name]);
  });

  it("refuses, where djmanzo would not read it, a tile it would still hand out", () => {
    expect(verdicts["unreferenced-scripted-tile.djpack"]).toBe("ok");
  });

  it("names a pack's key as djmanzo's index does", async () => {
    const checked = await checkArchive(pack("good-theme.djpack"));
    expect(checked.manifest.kind).toBe("theme");
    expect(checked.fingerprint).toMatch(/^[0-9a-f]{4} [0-9a-f]{4} [0-9a-f]{4} [0-9a-f]{4}$/);
    expect(await fingerprint(checked.key)).toBe(checked.fingerprint);
  });

  it("takes a tile that only draws, and nothing that reaches outside itself", () => {
    expect(svgDrawsOnly("<svg xmlns='http://www.w3.org/2000/svg'><circle r='4'/></svg>")).toBe(true);
    for (const bad of [
      "<svg><script>x</script></svg>",
      "<svg onload='x'/>",
      "<svg>\n<rect\nonclick = 'x'/></svg>",
      "<svg><a xlink:HREF='x'/></svg>",
      "<svg><rect fill='url(#a)'/></svg>",
      "<svg><foreignObject/></svg>",
      "<!DOCTYPE svg><svg/>",
      "<circle/>",
    ])
      expect(svgDrawsOnly(bad), bad).toBe(false);
  });

  it("refuses what is not a zip", async () => {
    await expect(checkArchive(new TextEncoder().encode("hello"))).rejects.toThrow("it is not a pack: not a zip");
  });
});
