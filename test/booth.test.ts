import { beforeAll, describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { BANKS, OCCASIONS, RECORDED, REGION_BANK, SOUNDS, bankReady, playable } from "../src/v4/booth/sounds";
import { trimmed } from "../src/v4/booth/booth.svelte";
import { BOOTH } from "../src/v4/i18n/booth";
import { installAll, translated } from "./packs";

beforeAll(installAll);
import { GENRE_BY_ID } from "../src/lib/genres";
import { SKINS } from "../src/v4/skins";

describe("the booth's sampler", () => {
  it("has every sound its banks name, made here or among those recorded for it, and every pad has a name in every language", () => {
    // The sounds the effects songs record, one a 4 s slot (tools/suno/cut-fx.sh), by the booth's own ids.
    const fx = readFileSync(new URL("../tools/suno/cut-fx.sh", import.meta.url), "utf8");
    const recordable = new Set([...fx.matchAll(/^ {2}"fx0\d\.wav \d+ ([^"]+)"$/gm)].flatMap((m) => m[1].split(" ")));
    expect(recordable.size).toBe(89);
    const named = new Set([...Object.values(BANKS).flat(), ...Object.values(REGION_BANK).flat()]);
    for (const id of named) expect(id in SOUNDS || recordable.has(id), id).toBe(true);
    for (const lang of ["en" as const, ...translated("booth")]) for (const id of new Set([...Object.keys(SOUNDS), ...named])) expect(BOOTH[lang].sounds[id], `${lang} ${id}`).toBeTruthy();
    for (const lang of ["en" as const, ...translated("booth")]) for (const b of OCCASIONS) expect(BOOTH[lang].banks[b], `${lang} ${b}`).toBeTruthy();
    // Every bank fills the eight pads, and every region has its own.
    for (const bank of [...Object.values(BANKS), ...Object.values(REGION_BANK)]) expect(bank).toHaveLength(8);
    expect(Object.keys(REGION_BANK).sort()).toEqual(SKINS.map((s) => s.id).sort());
  });

  it("offers an occasion once every pad can play: the sounds made here at once, a recorded one once its files are in", () => {
    const none = new Set<string>();
    for (const b of ["everywhere", "wedding", "anniversary", "colmado", "usparty"] as const) expect(bankReady(b, "club", none), b).toBe(true);
    for (const s of SKINS) expect(bankReady("region", s.id, none), s.id).toBe(true);
    const fresh = ["birthday", "newyear", "carnival", "stadium", "karaoke", "halloween", "lunarnewyear"] as const;
    expect(OCCASIONS).toEqual(expect.arrayContaining([...fresh]));
    for (const b of fresh) expect(bankReady(b, "club", none), b).toBe(false);
    const all = new Set(Object.values(BANKS).flat());
    for (const b of fresh) expect(bankReady(b, "club", all), b).toBe(true);
    // One pad short keeps the occasion back; a sound made here needs no file.
    expect(bankReady("lunarnewyear", "club", new Set([...all].filter((id) => id !== "guzheng")))).toBe(false);
    expect(playable("airhorn", none)).toBe(true);
    expect(playable("guzheng", none)).toBe(false);
    expect(playable("guzheng", new Set(["guzheng"]))).toBe(true);
  });

  it("lists only the recorded sounds whose files the site serves, AAC and Opus both", () => {
    for (const id of RECORDED) for (const ext of ["m4a", "webm"]) expect(existsSync(new URL(`../public/v4/sampler/${id}.${ext}`, import.meta.url)), `${id}.${ext}`).toBe(true);
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
