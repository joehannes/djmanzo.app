/**
 * The deck's music: for each genre a loop made for this site with ACE-Step
 * 1.5, an open music model, and taken apart with Demucs into drums, bass and
 * the rest — as djmanzo takes a record apart — each part its own file, so a
 * visitor switches parts off and on as a DJ would. `tools/loops/` makes them
 * and says how; a genre without one plays the synthesiser's sketch.
 *
 * Each file is the loop with a quarter of a second of its own end before it
 * and of its own start after it, so it is periodic around the loop: the
 * player loops the middle, and a decoder's few milliseconds of priming never
 * reach the seam.
 */

import INDEX from "./loops/index.json";
import type { Stem } from "./wave/model";

export interface LoopInfo {
  /** The tempo the onsets agree with, near the one it was made at. */
  bpm: number;
  key: string;
  camelot: string;
  bars: number;
  /** The loop's length. */
  seconds: number;
  /** Where the loop starts in each file. */
  pre: number;
  /** The file's length, in frames at `sampleRate`. */
  frames: number;
  sampleRate: number;
  stems: Stem[];
  /** Each stem in AAC. */
  files: Record<Stem, string>;
  /** The same in Opus, for a browser that cannot decode AAC. */
  opus?: Record<Stem, string>;
}

/** The loop's waveform over one period, `rate` points a second, each 0..255. */
export interface Peaks {
  rate: number;
  stems: Record<Stem, Uint8Array>;
  /** Per stem: its low, mid and high bands. */
  bands: Record<Stem, [Uint8Array, Uint8Array, Uint8Array]>;
}

export const LOOPS = INDEX as unknown as Record<string, LoopInfo>;
export const BASE = "/v4/loops";

export const hasLoop = (genre: string): boolean => genre in LOOPS;

/**
 * Whether this browser decodes AAC. Chromium built without its proprietary
 * codecs, and Firefox on a Linux without them, cannot: they are given the
 * Opus files, which every browser lacking AAC plays.
 */
export function aacPlays(): boolean {
  try {
    return new Audio().canPlayType('audio/mp4; codecs="mp4a.40.2"') !== "";
  } catch {
    return true;
  }
}

/** The file a stem is fetched from in this browser: AAC where it plays, else Opus. */
export const fileOf = (info: LoopInfo, stem: Stem, aac = aacPlays()): string => (!aac && info.opus?.[stem]) || info.files[stem];

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const peaksOf = new Map<string, Promise<Peaks | null>>();

/** A genre's waveform, fetched once. */
export function peaks(genre: string): Promise<Peaks | null> {
  if (!hasLoop(genre)) return Promise.resolve(null);
  let p = peaksOf.get(genre);
  if (!p) {
    p = fetch(`${BASE}/${genre}/peaks.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { rate: number; stems: Record<Stem, string>; bands: Record<Stem, [string, string, string]> } | null) =>
        j
          ? {
              rate: j.rate,
              stems: Object.fromEntries(Object.entries(j.stems).map(([k, v]) => [k, bytes(v)])) as Peaks["stems"],
              bands: Object.fromEntries(Object.entries(j.bands).map(([k, v]) => [k, v.map(bytes)])) as Peaks["bands"],
            }
          : null,
      )
      .catch(() => null);
    peaksOf.set(genre, p);
  }
  return p;
}

/** A level that can only approach 1, so stacked parts stay a shape and never a slab. */
const soft = (x: number) => 1 - Math.exp(-1.6 * x);

/**
 * The loop's levels over `columns` columns spanning `from`..`to` (seconds on
 * the deck's clock, whose loop began at `t0`): the stems as lanes, or the
 * three bands summed over the stems that are on. A column holds the loudest
 * point under it.
 */
export function levels(p: Peaks, seconds: number, t0: number, from: number, to: number, columns: number, mode: "bands" | "lanes", on: Record<Stem, boolean>, stems: readonly Stem[]): Float32Array {
  const n = p.stems[stems[0]].length;
  const span = (to - from) / columns;
  const rows = mode === "bands" ? 3 : stems.length;
  const out = new Float32Array(rows * columns);
  for (let c = 0; c < columns; c++) {
    const a = from + c * span - t0;
    const i0 = Math.floor((((a % seconds) + seconds) % seconds) * p.rate);
    const k = Math.max(1, Math.round(span * p.rate));
    for (let j = 0; j < k; j++) {
      const i = (i0 + j) % n;
      if (mode === "lanes") {
        stems.forEach((s, r) => {
          const v = on[s] ? p.stems[s][i] / 255 : 0;
          if (v > out[r * columns + c]) out[r * columns + c] = v;
        });
      } else {
        for (let b = 0; b < 3; b++) {
          let v = 0;
          for (const s of stems) if (on[s]) v += p.bands[s][b][i] / 255;
          if (v > out[b * columns + c]) out[b * columns + c] = v;
        }
      }
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = soft(out[i] * 1.6);
  return out;
}
