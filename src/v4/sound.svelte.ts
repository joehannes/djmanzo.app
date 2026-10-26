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

/**
 * The loop as it sounds now. Its place is kept as an anchor — where in the
 * loop it was at an audio time, and how fast it runs — so the pitch fader,
 * a brake or a rewind can move it and the clock still says where the beat is.
 */
let playing: {
  genre: string;
  loop: Loaded;
  sources: AudioBufferSourceNode[];
  gains: Record<Stem, GainNode>;
  meters: Record<Stem, AnalyserNode>;
  rate: number;
  anchorTime: number;
  anchorPos: number;
} | null = null;
/** The loop's waveform, for drawing, once fetched; the genre it belongs to. */
let shape: { genre: string; peaks: Peaks } | null = null;
/** Counts the visitor's asks, so a loop that arrives after another was asked for is not played. */
let asked = 0;

/** How loud each stem is set (the booth's faders), apart from being on or off. */
export const levels = $state<Record<Stem, number>>({ drums: 1, bass: 1, rest: 1 });
/** The pitch fader: how fast the loop runs, 0.92–1.08 (a turntable's ±8 %). */
export const speed = $state({ rate: 1 });

const stemGain = (s: Stem) => (deck.on[s] ? levels[s] : 0);

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

/** Where in the loop (seconds from its start) it is at audio time `t`. */
export function loopPosition(t = hasEngine() ? getEngine().ctx.currentTime : 0): number | null {
  if (!playing) return null;
  const len = playing.loop.info.seconds;
  const p = playing.anchorPos + (t - playing.anchorTime) * playing.rate;
  return ((p % len) + len) % len;
}

/** The beat, for anything that keeps time with the deck: the audio time of a downbeat, and the length of a beat now. */
export function beatClock(): { one: number; beat: number; bar: number } | null {
  if (!hasEngine()) return null;
  const e = getEngine();
  if (playing) {
    const beat = 60 / playing.loop.info.bpm / playing.rate;
    return { one: playing.anchorTime - playing.anchorPos / playing.rate, beat, bar: beat * 4 };
  }
  if (deck.playing && deck.source === "sketch") {
    const d = e.decks[0];
    const beat = 60 / e.tempo;
    return { one: d.nextTime - (d.step % 16) * d.stepDur, beat, bar: beat * 4 };
  }
  return null;
}

/** Start the loop's three sources at `pos` seconds into it, at audio time `when`, through fresh gains. */
function startSources(loop: Loaded, pos: number, when: number, rate: number, buffers: Record<Stem, AudioBuffer> = loop.buffers, from = loop.start) {
  const e = getEngine();
  const ctx = e.ctx;
  const gains = {} as Record<Stem, GainNode>;
  const meters = {} as Record<Stem, AnalyserNode>;
  const sources = STEMS.map((s) => {
    const g = ctx.createGain();
    g.gain.value = stemGain(s);
    g.connect(e.decks[0].input);
    const m = ctx.createAnalyser();
    m.fftSize = 256;
    g.connect(m);
    gains[s] = g;
    meters[s] = m;
    const src = ctx.createBufferSource();
    src.buffer = buffers[s];
    src.loop = true;
    src.loopStart = from;
    src.loopEnd = from + loop.info.seconds;
    src.playbackRate.value = rate;
    src.connect(g);
    src.start(when, from + pos);
    return src;
  });
  return { sources, gains, meters };
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
  const when = e.ctx.currentTime + 0.04;
  playing = { genre, loop, ...startSources(loop, 0, when, speed.rate), rate: speed.rate, anchorTime: when, anchorPos: 0 };
  deck.loading = false;
  deck.source = "loop";
}

/** Bring the loop back in at `pos` (the top by default), at audio time `when`, at the pitch fader's speed. */
function restart(pos = 0, when = getEngine().ctx.currentTime + 0.02) {
  if (!playing) return;
  const keep = playing;
  release(0.01);
  playing = { ...keep, ...startSources(keep.loop, pos, when, speed.rate), rate: speed.rate, anchorTime: when, anchorPos: pos };
}

// --- The booth's moves on the loop -----------------------------------------------------------

/** The pitch fader: the loop runs faster or slower, and the beat with it. */
export function setRate(rate: number) {
  speed.rate = Math.max(0.92, Math.min(1.08, rate));
  if (!hasEngine()) return;
  const e = getEngine();
  const now = e.ctx.currentTime;
  if (playing) {
    playing.anchorPos = loopPosition(now) ?? 0;
    playing.anchorTime = now;
    playing.rate = speed.rate;
    for (const s of playing.sources) s.playbackRate.setTargetAtTime(speed.rate, now, 0.03);
  } else if (deck.source === "sketch") e.setTempo(tempoOf(deck.genre) * speed.rate);
}

/** One stem's fader. */
export function setLevel(stem: Stem, v: number) {
  levels[stem] = Math.max(0, Math.min(1, v));
  if (playing) playing.gains[stem].gain.setTargetAtTime(stemGain(stem), getEngine().ctx.currentTime, 0.015);
}

/** How loud each stem is sounding now, 0–1, for the meters. */
export function stemLevels(): Record<Stem, number> {
  const out = { drums: 0, bass: 0, rest: 0 } as Record<Stem, number>;
  if (!playing) return out;
  const buf = new Uint8Array(256);
  for (const s of STEMS) {
    playing.meters[s].getByteTimeDomainData(buf);
    let peak = 0;
    for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
    out[s] = Math.min(1, peak / 100);
  }
  return out;
}

/** What the deck is doing beyond playing: for the platter, which slows, stops and spins back with it. */
export const moves = $state<{ now: "brake" | "rewind" | "roll" | null }>({ now: null });

/** The turntable's stop button: the loop slows to a halt, then comes back in on the one. */
export function brake() {
  if (!playing || moves.now) return;
  const e = getEngine();
  const now = e.ctx.currentTime;
  moves.now = "brake";
  for (const s of playing.sources) {
    s.playbackRate.setValueAtTime(playing.rate, now);
    s.playbackRate.exponentialRampToValueAtTime(0.02, now + 0.9);
  }
  setTimeout(() => {
    moves.now = null;
    if (playing) restart(0);
  }, 1300);
}

/** The selector's rewind: the record pulled back, faster and faster, then from the top. */
export function rewind() {
  if (!playing || moves.now) return;
  const e = getEngine();
  const ctx = e.ctx;
  const keep = playing;
  const pos = loopPosition(ctx.currentTime) ?? 0;
  const len = keep.loop.info.seconds;
  moves.now = "rewind";
  // The same loop backwards: from the mirror of where it is, so it runs back over what was just heard.
  const backwards = Object.fromEntries(STEMS.map((s) => [s, reversed(ctx, keep.loop.buffers[s])])) as Record<Stem, AudioBuffer>;
  const from = keep.loop.buffers.drums.duration - keep.loop.start - len;
  release(0.01);
  const now = ctx.currentTime + 0.01;
  const back = startSources(keep.loop, (len - pos) % len, now, 1, backwards, from);
  for (const s of back.sources) {
    s.playbackRate.setValueAtTime(1, now);
    s.playbackRate.exponentialRampToValueAtTime(3.5, now + 0.75);
  }
  setTimeout(() => {
    for (const s of back.sources) s.stop();
    for (const g of Object.values(back.gains)) g.disconnect();
    moves.now = null;
    if (deck.playing && deck.genre === keep.genre) {
      playing = keep;
      restart(0);
    }
  }, 800);
}

const mirrors = new WeakMap<AudioBuffer, AudioBuffer>();
function reversed(ctx: BaseAudioContext, b: AudioBuffer): AudioBuffer {
  let r = mirrors.get(b);
  if (!r) {
    r = ctx.createBuffer(b.numberOfChannels, b.length, b.sampleRate);
    for (let c = 0; c < b.numberOfChannels; c++) r.getChannelData(c).set(b.getChannelData(c).slice().reverse());
    mirrors.set(b, r);
  }
  return r;
}

/**
 * The loop roll: while held, the last `beats` of a beat (¼, ⅛, 1/16 of a bar's
 * beat) repeat; let go and the loop is where it would have been.
 */
export function roll(on: boolean, beats = 0.5) {
  if (!playing) return;
  const ctx = getEngine().ctx;
  const now = ctx.currentTime;
  if (on) {
    if (moves.now) return;
    moves.now = "roll";
    const beat = 60 / playing.loop.info.bpm;
    const size = beat * beats;
    const pos = loopPosition(now) ?? 0;
    const at = Math.floor(pos / size) * size;
    for (const s of playing.sources) {
      s.loopStart = playing.loop.start + at;
      s.loopEnd = playing.loop.start + at + size;
    }
  } else if (moves.now === "roll") {
    moves.now = null;
    restart(loopPosition(now) ?? 0, now + 0.005);
  }
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
    g.linearRampToValueAtTime(on ? levels[stem] : 0, now + 0.012);
  }
  sketchParts();
}

/** What the waveform draws: the loop's own shape where there is one, else the pattern's. */
export type Drawing = { kind: "loop"; peaks: Peaks; seconds: number; t0: number } | { kind: "pattern" };

/** Where the deck is now, for drawing: the audio clock while it plays, the page's own while it rests. */
export function where(): { clock: Clock; now: number; genre: Genre; idle: boolean; drawing: Drawing } {
  const genre = GENRE_BY_ID[deck.genre] ?? GENRE_BY_ID.house;
  const loop = LOOPS[genre.id];
  const clock = beatClock();
  const own: Drawing = loop && shape?.genre === genre.id ? { kind: "loop", peaks: shape.peaks, seconds: loop.seconds * (playing ? 1 / playing.rate : 1), t0: playing && clock ? clock.one : 0 } : { kind: "pattern" };
  if (deck.playing && hasEngine()) {
    const e = getEngine();
    if (playing && clock) return { clock: { time: clock.one, step: 0, stepDur: clock.beat / 4 }, now: e.ctx.currentTime, genre, idle: false, drawing: own };
    const d = e.decks[0];
    // The synthesiser is playing (no loop, or its files not yet here): draw what it plays.
    return { clock: { time: d.nextTime, step: d.step, stepDur: d.stepDur }, now: e.ctx.currentTime, genre, idle: false, drawing: { kind: "pattern" } };
  }
  return { clock: { time: 0, step: 0, stepDur: 60 / tempoOf(genre.id) / 4 }, now: performance.now() / 1000, genre, idle: true, drawing: own };
}
