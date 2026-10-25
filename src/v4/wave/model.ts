/**
 * The waveforms the site draws, worked out from what the deck will play.
 *
 * The site's decks play patterns (`lib/genres.ts`), so every hit is known
 * before it sounds: the drawing is made from the music's own events, not
 * from a recording, and can show what is coming as well as what has gone —
 * the part ahead of the playhead, as djmanzo's own waveforms do. Each part
 * (kick, snare, hat, hand percussion, bass, chords) leaves an envelope; the
 * stems and the three bands are sums of those.
 */

import type { Pattern } from "../../lib/genres";

export const PARTS = ["kick", "snare", "hat", "perc", "bass", "keys"] as const;
export type Part = (typeof PARTS)[number];

/**
 * The stems the deck plays apart: drums, bass and the rest, as djmanzo
 * separates a record (its vocals are a fourth; the site's music has none).
 */
export const STEMS = ["drums", "bass", "rest"] as const;
export type Stem = (typeof STEMS)[number];

const STEM_OF: Record<Part, Stem> = { kick: "drums", snare: "drums", hat: "drums", perc: "rest", bass: "bass", keys: "rest" };

/** How loud each part's hit is, and how long it rings, in seconds. */
const WEIGHT: Record<Part, number> = { kick: 1, snare: 0.75, hat: 0.32, perc: 0.55, bass: 0.85, keys: 0.45 };
const DECAY: Record<Part, number> = { kick: 0.16, snare: 0.11, hat: 0.035, perc: 0.06, bass: 0.22, keys: 0.18 };
/** A hit rises over this long; a little before it the column is already moving. */
const ATTACK = 0.006;
/** Past this many decays a hit is silence. */
const TAIL = 5;

/** Where a deck is: its step `step` (a running count) sounds at `time`; each step lasts `stepDur`. */
export interface Clock {
  time: number;
  step: number;
  stepDur: number;
}

export interface Hit {
  part: Part;
  time: number;
  weight: number;
}

/** Every hit of `p` between `from` and `to` (seconds), with the ones just before `from` whose tails still ring. */
export function hits(p: Pattern, clock: Clock, from: number, to: number): Hit[] {
  const out: Hit[] = [];
  const lookback = Math.ceil((DECAY.bass * TAIL) / clock.stepDur);
  const first = clock.step + Math.floor((from - clock.time) / clock.stepDur) - lookback;
  const last = clock.step + Math.ceil((to - clock.time) / clock.stepDur);
  const long = p.chordVoice === "pad" ? 3 : 1;
  for (let s = first; s <= last; s++) {
    const i = ((s % p.steps) + p.steps) % p.steps;
    const swing = i % 2 === 1 ? p.swing * clock.stepDur : 0;
    const time = clock.time + (s - clock.step) * clock.stepDur + swing;
    if (p.kick.includes(i)) out.push({ part: "kick", time, weight: WEIGHT.kick });
    if (p.snare.includes(i)) out.push({ part: "snare", time, weight: WEIGHT.snare });
    if (p.hat.includes(i)) out.push({ part: "hat", time, weight: WEIGHT.hat * (i % 4 === 2 ? 1.4 : 1) });
    if (p.perc.includes(i)) out.push({ part: "perc", time, weight: WEIGHT.perc });
    if (p.bass.includes(i)) out.push({ part: "bass", time, weight: WEIGHT.bass });
    if (p.chordSteps.includes(i)) out.push({ part: "keys", time, weight: WEIGHT.keys * long });
  }
  return out;
}

/** A hit's level `dt` seconds after it sounds. */
export function envelope(dt: number, decay: number): number {
  if (dt < -ATTACK) return 0;
  if (dt < 0) return 1 + dt / ATTACK;
  return Math.exp(-dt / decay);
}

/**
 * The parts' levels over `columns` columns spanning `from`..`to`: six rows
 * (in `PARTS` order), each `columns` long. A part that is switched off stays
 * silent, as the deck does.
 */
export function render(p: Pattern, clock: Clock, from: number, to: number, columns: number, on: Record<Stem, boolean> = ALL_ON): Float32Array {
  const out = new Float32Array(PARTS.length * columns);
  const span = (to - from) / columns;
  for (const h of hits(p, clock, from, to)) {
    if (!on[STEM_OF[h.part]]) continue;
    const row = PARTS.indexOf(h.part) * columns;
    const decay = DECAY[h.part] * (h.part === "keys" && p.chordVoice === "pad" ? 4 : 1);
    const c0 = Math.max(0, Math.floor((h.time - ATTACK - from) / span));
    const c1 = Math.min(columns - 1, Math.ceil((h.time + decay * TAIL - from) / span));
    for (let c = c0; c <= c1; c++) {
      const t = from + (c + 0.5) * span;
      out[row + c] += h.weight * envelope(t - h.time, decay);
    }
  }
  return out;
}

export const ALL_ON: Record<Stem, boolean> = { drums: true, bass: true, rest: true };

/** A level that can only approach 1, so stacked hits stay a shape and never a slab. */
const soft = (x: number) => 1 - Math.exp(-1.6 * x);

/** The three stems (drums, bass, the rest), each `columns` long, from the parts. */
export function stems(parts: Float32Array, columns: number): Float32Array {
  const out = new Float32Array(STEMS.length * columns);
  const at = (part: Part, c: number) => parts[PARTS.indexOf(part) * columns + c];
  for (let c = 0; c < columns; c++) {
    out[c] = soft(at("kick", c) + at("snare", c) + at("hat", c));
    out[columns + c] = soft(at("bass", c));
    out[2 * columns + c] = soft(at("perc", c) + at("keys", c));
  }
  return out;
}

/** The three bands (low, mid, high) the way DJ software colours a waveform, from the parts. */
export function bands(parts: Float32Array, columns: number): Float32Array {
  const out = new Float32Array(3 * columns);
  const at = (part: Part, c: number) => parts[PARTS.indexOf(part) * columns + c];
  for (let c = 0; c < columns; c++) {
    out[c] = soft(at("kick", c) + 0.8 * at("bass", c));
    out[columns + c] = soft(at("snare", c) + 0.7 * at("keys", c) + 0.4 * at("perc", c));
    out[2 * columns + c] = soft(at("hat", c) * 1.6 + 0.5 * at("perc", c));
  }
  return out;
}
