/**
 * The shop's one record player: whichever room plays something takes it
 * over, so two rooms never play over each other. The engine itself
 * (`lib/audio/engine.ts`) synthesises every groove; nothing here is a
 * recording.
 */

import { getEngine, hasEngine, PARTS, type Engine, type Part } from "../lib/audio/engine";
import { GENRE_BY_ID } from "../lib/genres";

export type Source = "band" | "crates" | "world" | "camelot" | "beatmatch";

export const sound = $state<{ source: Source | null; genre: string | null }>({ source: null, genre: null });

/** The engine, made on first use (inside a click or a key press, as browsers require). */
export function engine(): Engine {
  const e = getEngine();
  void e.wake();
  return e;
}

/** The middle of a genre's tempo range, in beats a minute. */
export function tempoOf(genre: string): number {
  const g = GENRE_BY_ID[genre] ?? GENRE_BY_ID.house;
  return Math.round((g.bpm[0] + g.bpm[1]) / 2);
}

/** Put `genre` on the first deck, at its own tempo. */
export function setGroove(e: Engine, genre: string) {
  e.decks[0].setGenre(genre);
  e.setTempo(tempoOf(genre));
}

/** Play a whole groove on the first deck, for `source`. */
export function playGroove(genre: string, source: Source) {
  const e = take(source);
  const d = e.decks[0];
  setGroove(e, genre);
  for (const p of PARTS) d.parts[p] = true;
  e.setCrossfader(0);
  if (!d.playing) d.start();
  sound.genre = genre;
}

/** Take the record player over for `source`: whatever else was playing stops. */
export function take(source: Source): Engine {
  const e = engine();
  if (sound.source !== source) {
    for (const d of e.decks) {
      d.stop();
      d.pitch = 0;
      d.shift = 0;
      for (const p of PARTS) d.parts[p] = true;
    }
    e.sync = true;
    e.setCrossfader(0);
  }
  sound.source = source;
  return e;
}

/** Stop everything, if `source` is what plays (or always, without one). */
export function stopAll(source?: Source) {
  if (source && sound.source !== source) return;
  if (hasEngine()) for (const d of getEngine().decks) d.stop();
  sound.source = null;
  sound.genre = null;
}

export type { Part };
