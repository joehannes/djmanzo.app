/**
 * The site's one deck. A genre with a recorded loop (`loops.ts`: made for
 * this site with an open music model and taken apart into drums, bass and
 * the rest) plays it, each part its own source through the deck's EQ and
 * fader; a genre without one plays the island's synthesiser
 * (`lib/audio/engine.ts`). Either way the stems switch one by one, and
 * nothing plays until the visitor presses play.
 */

import { getEngine, hasEngine } from "../lib/audio/engine";
import { GENRE_BY_ID, type Genre } from "../lib/genres";
import { camelotOf, semisOf } from "../shop/practice";
import { BASE, LOOPS, fileOf, hasLoop, peaks, type LoopInfo, type Peaks } from "./loops";
import { ALL_ON, STEMS, type Clock, type Stem } from "./wave/model";

/** `source`: what is sounding — the genre's recorded loop, or the synthesiser's sketch. */
export const deck = $state<{ playing: boolean; genre: string; on: Record<Stem, boolean>; loading: boolean; source: "loop" | "sketch" | null }>({
  playing: false,
  genre: "house",
  on: { ...ALL_ON },
  loading: false,
  source: null,
});

/** The deck's tempo for a genre: its loop's, or the middle of the genre's range. */
export function tempoOf(genre: string): number {
  if (hasLoop(genre)) return LOOPS[genre].bpm;
  const g = GENRE_BY_ID[genre] ?? GENRE_BY_ID.house;
  return Math.round((g.bpm[0] + g.bpm[1]) / 2);
}

const NOTES = ["A", "B♭", "B", "C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭"];

/** A loop's key as a DJ reads it: its name and its Camelot number. */
export function keyOf(g: Genre): { name: string; camelot: string } {
  const loop = LOOPS[g.id];
  if (loop) return { name: loop.key.replace(/#/g, "♯"), camelot: loop.camelot };
  const s = semisOf(g.root);
  if (g.scale === "major") return { name: `${NOTES[s]} major`, camelot: `${camelotOf((s + 9) % 12)}B` };
  // Dorian shares its notes with the natural minor a fifth above its root.
  if (g.scale === "dorian") return { name: `${NOTES[s]} dorian`, camelot: `${camelotOf((s + 7) % 12)}A` };
  return { name: `${NOTES[s]} minor`, camelot: `${camelotOf(s)}A` };
}

// --- A recorded loop ----------------------------------------------------------------------

interface Loaded {
  info: LoopInfo;
  buffers: Record<Stem, AudioBuffer>;
  /** Where the loop starts in the decoded buffers. */
  start: number;
}

const decoded = new Map<string, Promise<Loaded>>();

/** A genre's stems, fetched and decoded once. */
function load(ctx: BaseAudioContext, genre: string): Promise<Loaded> {
  let p = decoded.get(genre);
  if (!p) {
    const info = LOOPS[genre];
    const decode = (file: string) =>
      fetch(`${BASE}/${genre}/${file}`)
        .then((r) => {
          if (!r.ok) throw new Error(`${r.status}`);
          return r.arrayBuffer();
        })
        .then((b) => ctx.decodeAudioData(b));
    p = Promise.all(
      STEMS.map((s) => {
        const file = fileOf(info, s);
        // A browser that says it plays AAC and then cannot decode it is given the Opus file.
        return decode(file).catch((e) => (info.opus?.[s] && info.opus[s] !== file ? decode(info.opus[s]) : Promise.reject(e)));
      }),
    ).then((list) => {
      const buffers = Object.fromEntries(STEMS.map((s, i) => [s, list[i]])) as Record<Stem, AudioBuffer>;
      // A decoder that kept its priming hands back a little more than was written, all of it at the start.
      const extra = list[0].duration - info.frames / info.sampleRate;
      return { info, buffers, start: info.pre + Math.min(Math.max(extra, 0), info.pre * 0.8) };
    });
    p.catch(() => decoded.delete(genre));
    decoded.set(genre, p);
  }
  return p;
}

let playing: { genre: string; sources: AudioBufferSourceNode[]; gains: Record<Stem, GainNode>; t0: number } | null = null;
/** The loop's waveform, for drawing, once fetched; the genre it belongs to. */
let shape: { genre: string; peaks: Peaks } | null = null;
/** Counts the visitor's asks, so a loop that arrives after another was asked for is not played. */
let asked = 0;

function release(fade = 0.06) {
  if (!playing) return;
  const now = getEngine().ctx.currentTime;
  for (const g of Object.values(playing.gains)) {
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0, now + fade);
  }
  for (const s of playing.sources) s.stop(now + fade + 0.01);
  playing = null;
}

function drawn(genre: string) {
  void peaks(genre).then((p) => {
    if (p && deck.genre === genre) shape = { genre, peaks: p };
  });
}

async function playLoop(genre: string) {
  const e = getEngine();
  const ask = ++asked;
  deck.loading = true;
  drawn(genre);
  let loop: Loaded;
  try {
    loop = await load(e.ctx, genre);
  } catch {
    // The files could not be had: the synthesiser plays the genre instead.
    if (ask === asked) {
      deck.loading = false;
      playSketch(genre);
    }
    return;
  }
  if (ask !== asked || !deck.playing || deck.genre !== genre) return;
  release();
  const ctx = e.ctx;
  const input = e.decks[0].input;
  const when = ctx.currentTime + 0.04;
  const gains = {} as Record<Stem, GainNode>;
  const sources = STEMS.map((s) => {
    const g = ctx.createGain();
    g.gain.value = deck.on[s] ? 1 : 0;
    g.connect(input);
    gains[s] = g;
    const src = ctx.createBufferSource();
    src.buffer = loop.buffers[s];
    src.loop = true;
    src.loopStart = loop.start;
    src.loopEnd = loop.start + loop.info.seconds;
    src.connect(g);
    src.start(when, loop.start);
    return src;
  });
  playing = { genre, sources, gains, t0: when };
  deck.loading = false;
  deck.source = "loop";
}

// --- The synthesiser's sketch -------------------------------------------------------------

function playSketch(genre: string) {
  const e = getEngine();
  const d = e.decks[0];
  d.setGenre(genre);
  e.setTempo(tempoOf(genre));
  d.pitch = 0;
  d.shift = 0;
  sketchParts();
  if (!d.playing) d.start();
  deck.source = "sketch";
}

/** The synthesiser's four parts from the deck's three stems. */
function sketchParts() {
  if (!hasEngine()) return;
  const parts = getEngine().decks[0].parts;
  parts.drums = deck.on.drums;
  parts.bass = deck.on.bass;
  parts.perc = deck.on.rest;
  parts.keys = deck.on.rest;
}

// --- The deck ----------------------------------------------------------------------------

export function play(genre = deck.genre) {
  const e = getEngine();
  void e.wake();
  e.decks[1].stop();
  e.sync = true;
  e.setCrossfader(0);
  deck.genre = genre;
  deck.playing = true;
  if (hasLoop(genre)) {
    e.decks[0].stop();
    void playLoop(genre);
  } else {
    release();
    asked++;
    deck.loading = false;
    playSketch(genre);
  }
}

export function stop() {
  asked++;
  if (hasEngine()) {
    release();
    for (const d of getEngine().decks) d.stop();
  }
  deck.playing = false;
  deck.loading = false;
  deck.source = null;
}

export function toggle() {
  if (deck.playing) stop();
  else play();
}

/** Change the groove; a playing deck changes with it. */
export function setGenre(genre: string) {
  deck.genre = genre;
  if (hasLoop(genre)) drawn(genre);
  if (deck.playing) play(genre);
}

export function setStem(stem: Stem, on: boolean) {
  deck.on[stem] = on;
  if (playing) {
    const g = playing.gains[stem].gain;
    const now = getEngine().ctx.currentTime;
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(on ? 1 : 0, now + 0.012);
  }
  sketchParts();
}

/** What the waveform draws: the loop's own shape where there is one, else the pattern's. */
export type Drawing = { kind: "loop"; peaks: Peaks; seconds: number; t0: number } | { kind: "pattern" };

/** Where the deck is now, for drawing: the audio clock while it plays, the page's own while it rests. */
export function where(): { clock: Clock; now: number; genre: Genre; idle: boolean; drawing: Drawing } {
  const genre = GENRE_BY_ID[deck.genre] ?? GENRE_BY_ID.house;
  const loop = LOOPS[genre.id];
  const own: Drawing = loop && shape?.genre === genre.id ? { kind: "loop", peaks: shape.peaks, seconds: loop.seconds, t0: playing?.t0 ?? 0 } : { kind: "pattern" };
  if (deck.playing && hasEngine()) {
    const e = getEngine();
    if (playing) return { clock: { time: playing.t0, step: 0, stepDur: 60 / loop.bpm / 4 }, now: e.ctx.currentTime, genre, idle: false, drawing: own };
    const d = e.decks[0];
    // The synthesiser is playing (no loop, or its files not yet here): draw what it plays.
    return { clock: { time: d.nextTime, step: d.step, stepDur: d.stepDur }, now: e.ctx.currentTime, genre, idle: false, drawing: { kind: "pattern" } };
  }
  return { clock: { time: 0, step: 0, stepDur: 60 / tempoOf(genre.id) / 4 }, now: performance.now() / 1000, genre, idle: true, drawing: own };
}
