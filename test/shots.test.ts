import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STAGES } from "../src/stages/script";
import { HOME_THEME, SHOTS, shotFor } from "../src/signal/shots";

// djmanzo's own folder (the app/ submodule) and the site's own, held to the same rules.
const FOLDERS = [new URL("../app/docs/screenshots/", import.meta.url), new URL("../screenshots/", import.meta.url)];
const pub = (src: string) => new URL(`../public${src}`, import.meta.url);

describe("pictures of the application come only from its docs/screenshots and the site's screenshots/", () => {
  it("has every picture in the folder, encoded, and nothing else", () => {
    const folder = FOLDERS.flatMap((root) =>
      ["screens", "themes", "skins"].flatMap((k) => (existsSync(new URL(`${k}/`, root)) ? readdirSync(new URL(`${k}/`, root)) : []).filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, ""))),
    );
    expect(SHOTS.map((s) => s.src.replace(/^\/shots\/app\/|\.webp$/g, "")).sort()).toEqual(folder.sort());
    for (const s of SHOTS) expect(existsSync(pub(s.src)), s.src).toBe(true);
  });

  it("names each picture's screen, theme and skin from its file name", () => {
    const s = SHOTS.find((x) => x.src.endsWith("/dig--caribbean--palms.webp"))!;
    expect(s).toMatchObject({ screen: "dig", theme: "Caribbean", skin: "Palm shadows" });
    expect(s.alt).toMatch(/^Dig: the library .* Caribbean theme, worn with the Palm shadows skin$/);
  });

  it("has a picture for every screen a stage asks for", () => {
    for (const stage of STAGES) for (const screen of stage.screens) expect(SHOTS.some((s) => s.screen === screen), `${stage.id}: ${screen}`).toBe(true);
  });
});

describe("the picture a visitor sees", () => {
  const pick = (screen: string, theme: string, skin: string | null = null) => shotFor([screen], theme, skin)!;

  it("is in their look when it is pictured: theme and skin, then the theme alone", () => {
    expect(pick("dig", "Caribbean", "Palm shadows").src).toMatch(/dig--caribbean--palms/);
    expect(pick("dig", "Caribbean").src).toMatch(/dig--caribbean\.webp/);
    expect(pick("dig", "Caribbean", "Halftone").src).toMatch(/dig--caribbean\.webp/);
  });

  it("is djmanzo's own look, without a skin, when theirs is not pictured", () => {
    const s = pick("mix", "Bachata Rosa", "Palm shadows");
    expect([s.theme, s.skin]).toEqual([HOME_THEME, null]);
  });

  it("finds their look on any of the stage's screens before the first screen in djmanzo's own", () => {
    expect(shotFor(["mix", "autopilot"], "Velvet")?.src).toMatch(/autopilot--velvet\.webp/);
    expect(shotFor(["mix", "autopilot"], "Velvet", "Glowing plankton")?.src).toMatch(/autopilot--velvet--glowing-plankton/);
  });

  it("follows the stage's order of screens, skipping what is not pictured", () => {
    expect(shotFor(["nothing", "karaoke"], HOME_THEME)?.screen).toBe("karaoke");
    expect(shotFor([], HOME_THEME)).toBeNull();
  });
});
