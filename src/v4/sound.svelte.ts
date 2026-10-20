/**
 * The site's one deck: the island's synthesiser (`lib/audio/engine.ts`)
 * playing a skin's groove, with its stems switchable one by one. Nothing is
 * a recording, and nothing plays until the visitor presses play.
 */

import { getEngine, hasEngine } from "../lib/audio/engine";
import { GENRE_BY_ID, type Genre } from "../lib/genres";
import { camelotOf, semisOf } from "../shop/practice";
import { ALL_ON, type Clock, type Stem } from "./wave/model";

export const deck = $state<{ playing: boolean; genre: string; on: Record<Stem, boolean> }>({ playing: false, genre: "house", on: { ...ALL_ON } });

/** The middle of a genre's tempo range, in beats a minute. */
export function tempoOf(genre: string): number {
  const g = GENRE_BY_ID[genre] ?? GENRE_BY_ID.house;
  return Math.round((g.bpm[0] + g.bpm[1]) / 2);
}

const NOTES = ["A", "B♭", "B", "C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭"];

/** A loop's key as a DJ reads it: its name and its Camelot number. */
export function keyOf(g: Genre): { name: string; camelot: string } {
  const s = semisOf(g.root);
  if (g.scale === "major") return { name: `${NOTES[s]} major`, camelot: `${camelotOf((s + 9) % 12)}B` };
  // Dorian shares its notes with the natural minor a fifth above its root.
  if (g.scale === "dorian") return { name: `${NOTES[s]} dorian`, camelot: `${camelotOf((s + 7) % 12)}A` };
  return { name: `${NOTES[s]} minor`, camelot: `${camelotOf(s)}A` };
}

export function play(genre = deck.genre) {
  const e = getEngine();
  void e.wake();
  e.decks[1].stop();
  e.sync = true;
  const d = e.decks[0];
  d.setGenre(genre);
  e.setTempo(tempoOf(genre));
  d.pitch = 0;
  d.shift = 0;
  for (const s of Object.keys(deck.on) as Stem[]) d.parts[s] = deck.on[s];
  e.setCrossfader(0);
  if (!d.playing) d.start();
  deck.genre = genre;
  deck.playing = true;
}

export function stop() {
  if (hasEngine()) for (const d of getEngine().decks) d.stop();
  deck.playing = false;
}

export function toggle() {
  if (deck.playing) stop();
  else play();
}

/** Change the groove; a playing deck changes with it, in time. */
export function setGenre(genre: string) {
  deck.genre = genre;
  if (deck.playing) play(genre);
}

export function setStem(stem: Stem, on: boolean) {
  deck.on[stem] = on;
  if (hasEngine()) getEngine().decks[0].parts[stem] = on;
}

/** Where the deck is now, for drawing: the audio clock while it plays, the page's own while it rests. */
export function where(): { clock: Clock; now: number; genre: Genre; idle: boolean } {
  const genre = GENRE_BY_ID[deck.genre] ?? GENRE_BY_ID.house;
  if (deck.playing && hasEngine()) {
    const e = getEngine();
    const d = e.decks[0];
    return { clock: { time: d.nextTime, step: d.step, stepDur: d.stepDur }, now: e.ctx.currentTime, genre, idle: false };
  }
  return { clock: { time: 0, step: 0, stepDur: 60 / tempoOf(genre.id) / 4 }, now: performance.now() / 1000, genre, idle: true };
}
