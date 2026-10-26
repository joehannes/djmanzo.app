import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { BANKS, REGION_BANK, SOUNDS } from "../src/v4/booth/sounds";
import { trimmed } from "../src/v4/booth/booth.svelte";
import { BOOTH } from "../src/v4/i18n/booth";
import { installAll, translated } from "./packs";

beforeAll(installAll);
import { GENRE_BY_ID } from "../src/lib/genres";
import { SKINS } from "../src/v4/skins";

describe("the booth's sampler", () => {
  it("has every sound its banks name, and every sound has a name in every language", () => {
    const named = new Set([...Object.values(BANKS).flat(), ...Object.values(REGION_BANK).flat()]);
    for (const id of named) expect(SOUNDS[id], id).toBeTypeOf("function");
    for (const lang of ["en" as const, ...translated("booth")]) for (const id of Object.keys(SOUNDS)) expect(BOOTH[lang].sounds[id], `${lang} ${id}`).toBeTruthy();
    // Every bank fills the eight pads, and every region has its own.
    for (const bank of [...Object.values(BANKS), ...Object.values(REGION_BANK)]) expect(bank).toHaveLength(8);
    expect(Object.keys(REGION_BANK).sort()).toEqual(SKINS.map((s) => s.id).sort());
  });

  it("trims the visitor's recording to what was said, as loud as it can be without clipping", () => {
    const rate = 1000;
    const data = new Float32Array(3000);
    for (let i = 1000; i < 2000; i++) data[i] = 0.25 * Math.sin(i / 3);
    const fake = {
      createBuffer: (_ch: number, length: number, sampleRate: number) => {
        const d = new Float32Array(length);
        return { length, sampleRate, duration: length / sampleRate, getChannelData: () => d } as unknown as AudioBuffer;
      },
    } as unknown as BaseAudioContext;
    const b = { length: 3000, sampleRate: rate, duration: 3, numberOfChannels: 1, getChannelData: () => data } as unknown as AudioBuffer;
    const out = trimmed(fake, b);
    // The second of sound, with 10 ms before and 50 ms after.
    expect(out.length).toBeGreaterThan(1000);
    expect(out.length).toBeLessThan(1100);
    const peak = Math.max(...Array.from(out.getChannelData(0), Math.abs));
    expect(peak).toBeCloseTo(0.9, 2);
  });
});

describe("the grooves of each look", () => {
  it("are five of the region's own, three heard all over the world and one or two specials, each a genre with a recorded loop on the way", () => {
    const jobs = new Set((JSON.parse(readFileSync(new URL("../tools/loops/jobs.json", import.meta.url), "utf8")) as { genre: string }[]).map((j) => j.genre));
    for (const s of SKINS) {
      expect(s.local, s.id).toHaveLength(5);
      expect(s.common, s.id).toHaveLength(3);
      expect(s.special.length, s.id).toBeGreaterThanOrEqual(1);
      expect(s.special.length, s.id).toBeLessThanOrEqual(2);
      for (const g of [...s.local, ...s.common, ...s.special]) {
        expect(GENRE_BY_ID[g], `${s.id}: ${g}`).toBeTruthy();
        expect(jobs.has(g), `${s.id}: ${g} is generated`).toBe(true);
      }
    }
    // The common ones are common: each is heard in more than one look.
    const commons = SKINS.flatMap((s) => s.common);
    for (const g of new Set(commons)) expect(SKINS.filter((s) => [...s.local, ...s.common].includes(g)).length, g).toBeGreaterThan(1);
  });
});
