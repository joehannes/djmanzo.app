/**
 * The practice room's arithmetic: the Camelot wheel, and how far apart two
 * decks' beats are. Kept apart from the page so it can be tested.
 *
 * The Camelot wheel numbers the minor keys 1A–12A round a circle of fifths:
 * 8A is A minor, and each step clockwise is a fifth up (seven semitones).
 * Neighbours on the wheel share all but one note, so they blend; keys far
 * apart clash.
 */

/** Semitones above A of the minor key at Camelot number `n` (1–12, A ring). */
export function camelotSemis(n: number): number {
  return (((n - 8) * 7) % 12 + 12) % 12;
}

/** The Camelot number (A ring) of the minor key `semis` above A. */
export function camelotOf(semis: number): number {
  // 7 is its own inverse modulo 12, so a step of seven semitones is one step round the wheel.
  return ((((7 * semis) % 12) + 12 + 7) % 12) + 1;
}

/** Semitones above A of a loop whose root is `hz`, folded into one octave. */
export function semisOf(hz: number): number {
  return ((Math.round(12 * Math.log2(hz / 220)) % 12) + 12) % 12;
}

/** The shift, in semitones from −6 to +5, that moves a loop rooted at `hz` to Camelot `n`. */
export function shiftTo(hz: number, n: number): number {
  const d = (((camelotSemis(n) - semisOf(hz)) % 12) + 12) % 12;
  return d >= 6 ? d - 12 : d;
}

export type Relation = "same" | "neighbour" | "clash";

/** How two keys on the A ring sit together. */
export function relation(a: number, b: number): Relation {
  const d = Math.abs(a - b) % 12;
  const steps = Math.min(d, 12 - d);
  return steps === 0 ? "same" : steps === 1 ? "neighbour" : "clash";
}

/** A deck as the beat-matcher sees it: when its next sixteenth sounds, which one it is, how long one lasts. */
export interface Clock {
  nextTime: number;
  step: number;
  stepDur: number;
}

/** When a deck's next beat (every fourth sixteenth) sounds. */
export function nextBeat(c: Clock): number {
  return c.nextTime + ((4 - (c.step % 4)) % 4) * c.stepDur;
}

/**
 * How far deck `b`'s beat sits from deck `a`'s, in seconds, folded into half
 * a beat either way: positive when `b` is late.
 */
export function beatOffset(a: Clock, b: Clock): number {
  const beat = a.stepDur * 4;
  const d = nextBeat(b) - nextBeat(a);
  return d - Math.round(d / beat) * beat;
}

/** The pitch fader's difference counts as matched inside this (0.25 %). */
export const PITCH_MATCH = 0.0025;
/** The beats count as together inside this, in seconds: the ear hears a flam beyond it. */
export const PHASE_MATCH = 0.015;

export function matched(pitchA: number, pitchB: number, offset: number): boolean {
  return Math.abs(pitchA - pitchB) < PITCH_MATCH && Math.abs(offset) < PHASE_MATCH;
}
