/**
 * The booth on the home page's deck: the knobs, the pads and the sampler,
 * played through the site's one engine (`lib/audio/engine.ts`) and the
 * deck's loop (`sound.svelte.ts`).
 *
 * The sampler's sounds are made in the browser (`sounds.ts`); a press plays
 * one on the next sixteenth, *Repeat* keeps it going on the beat's grid, and
 * *In the loop* puts it on every bar's one. The visitor's own voice can be
 * one of them: recorded through the microphone they allow, kept in the
 * page's memory only, never sent anywhere, gone when the page is.
 */

import { getEngine, hasEngine } from "../../lib/audio/engine";
import { beatClock, deck, roll, setRate, stop as stopDeck, tempoOf } from "../sound.svelte";
import { RECORDED, SAMPLER_BASE, SOUNDS, VOICE, type BankId } from "./sounds";
import { aacPlays } from "../loops";

export type Knob = "low" | "mid" | "high" | "filter" | "pitch";
export type Mode = "tap" | "repeat" | "loop";
/** The beat effects, one at a time, as on a mixer's Beat FX section. */
export type FxKind = "echo" | "space" | "flanger" | "crush" | "gate";
export const FX_KINDS: FxKind[] = ["echo", "space", "flanger", "crush", "gate"];

/** A hot cue point: a position in seconds that can be jumped to instantly. */
export interface HotCue {
  id: number;
  time: number;
  label: string;
}

/** A loop region: in/out points in seconds, active or not. */
export interface LoopRegion {
  inPoint: number | null;
  outPoint: number | null;
  active: boolean;
}

export const booth = $state({
  open: false,
  bank: "region" as BankId | "voice",
  mode: "tap" as Mode,
  /** How often Repeat fires, in beats: ¼ is a sixteenth, ½ an eighth, 1 a beat. */
  every: 0.5,
  knobs: { low: 0, mid: 0, high: 0, filter: 0, pitch: 0 } as Record<Knob, number>,
  /** The beat effect chosen, how deep, and whether it is on. */
  fx: { kind: "echo" as FxKind, depth: 0.6, on: false },
  /** The jog's rim pushed or held back: added to the pitch fader while it is turned. */
  bend: 0,
  /** The pads going round, by sound. */
  going: {} as Record<string, Mode>,
  /** The last pad that sounded, and when, so it can light up. */
  hit: { id: "", at: 0 },
  voice: { state: "none" as "none" | "asking" | "recording" | "ready" | "denied" | "unsupported", seconds: 0, pitch: 0 },
  /** Hot cue points (up to 8), set by pressing a hot cue pad at the current position. */
  hotCues: [] as HotCue[],
  /** Active loop region for the current track. */
  loop: { inPoint: null, outPoint: null, active: false } as LoopRegion,
  /** Waveform zoom level (1 = full track, higher = more detail). */
  waveZoom: 1,
  /** Whether the YouTube crate is driving playback instead of the deck loop. */
  youtubeActive: false,
});

// --- Hot Cues & Loops ------------------------------------------------------------------------

/** Set a hot cue at the given time (seconds). Max 8 cues. */
export function setHotCue(time: number, label?: string) {
	if (booth.hotCues.length >= 8) return;
	const id = booth.hotCues.length > 0 ? Math.max(...booth.hotCues.map((c) => c.id)) + 1 : 1;
	booth.hotCues = [...booth.hotCues, { id, time, label: label ?? `CUE ${id}` }];
}

/** Jump to a hot cue by its id. Returns the time in seconds, or null if not found. */
export function jumpToHotCue(id: number): number | null {
	const cue = booth.hotCues.find((c) => c.id === id);
	return cue?.time ?? null;
}

/** Remove a hot cue by its id. */
export function clearHotCue(id: number) {
	booth.hotCues = booth.hotCues.filter((c) => c.id !== id);
}

/** Set the loop in-point at the given time. */
export function setLoopIn(time: number) {
	booth.loop.inPoint = time;
	// Auto-activate if out-point already exists and is after in-point.
	if (booth.loop.outPoint !== null && booth.loop.outPoint > time) {
		booth.loop.active = true;
	}
}

/** Set the loop out-point at the given time. Activates the loop if in-point exists. */
export function setLoopOut(time: number) {
	booth.loop.outPoint = time;
	if (booth.loop.inPoint !== null && time > booth.loop.inPoint) {
		booth.loop.active = true;
	}
}

/** Toggle the active loop on/off. */
export function toggleLoop() {
	if (booth.loop.inPoint !== null && booth.loop.outPoint !== null) {
		booth.loop.active = !booth.loop.active;
	}
}

/** Clear the loop region entirely. */
export function clearLoop() {
	booth.loop = { inPoint: null, outPoint: null, active: false };
}

/** Set waveform zoom level (1–16). */
export function setWaveZoom(level: number) {
	booth.waveZoom = Math.max(1, Math.min(16, level));
}

/** Mark YouTube as the active playback source (disables deck loop). */
export function setYoutubeActive(active: boolean) {
	booth.youtubeActive = active;
	if (active && hasEngine()) stopDeck();
}

// --- Knobs -----------------------------------------------------------------------------------

/** −1…+1 for each knob; the EQ cuts to a kill and lifts to +6 dB; Pitch is ±8 %. */
export function turn(knob: Knob, v: number) {
  const value = Math.max(-1, Math.min(1, v));
  booth.knobs[knob] = value;
  if (knob === "pitch") return setRate(1 + value * 0.08 + booth.bend);
  if (!hasEngine()) return;
  const e = getEngine();
  if (knob === "low" || knob === "mid" || knob === "high") e.decks[0].eq(knob, value < 0 ? value * 26 : value * 6);
  else if (knob === "filter") e.setFilter(value);
}

/** The jog's rim: turned forward it hurries the record, held back it drags it, by up to 6 %. */
export function bend(amount: number) {
  booth.bend = Math.max(-0.06, Math.min(0.06, amount));
  setRate(1 + booth.knobs.pitch * 0.08 + booth.bend);
}

/** The beat effect: which, how deep, on or off; only the chosen one is heard. */
export function effect(change: Partial<typeof booth.fx>) {
  Object.assign(booth.fx, change);
  booth.fx.depth = Math.max(0, Math.min(1, booth.fx.depth));
  if (!hasEngine()) return;
  const e = getEngine();
  for (const k of FX_KINDS) e.setFx(k === "space" ? "reverb" : k, booth.fx.on && booth.fx.kind === k ? booth.fx.depth : 0);
}

/** Every knob back to the middle, and the effect off. */
export function centre() {
  for (const k of Object.keys(booth.knobs) as Knob[]) turn(k, 0);
  effect({ on: false });
}

// --- Build & drop ------------------------------------------------------------------------------

/** Counts the builds, so one already rising when the booth is put away does not land. */
let builds = 0;

/** The filter opens upwards over two bars with a riser, then the drop lands on the one. */
export function buildAndDrop() {
  const e = getEngine();
  const mine = ++builds;
  void e.wake();
  const clock = beatClock();
  const bar = clock?.bar ?? (60 / tempoOf(deck.genre)) * 4;
  const now = e.ctx.currentTime;
  const one = clock ? clock.one + Math.ceil((now - clock.one) / clock.bar + 0.001) * clock.bar : now;
  const drop = one + bar * 2;
  play("riser", drop - Math.min(2, bar * 2));
  const start = performance.now();
  const span = (drop - now) * 1000;
  const sweep = () => {
    if (mine !== builds) return;
    const k = Math.min(1, (performance.now() - start) / span);
    e.setFilter(booth.knobs.filter + (0.85 - booth.knobs.filter) * k * k);
    if (k < 1) requestAnimationFrame(sweep);
    else {
      e.setFilter(booth.knobs.filter);
      play("boom", e.ctx.currentTime);
      play("crash", e.ctx.currentTime);
    }
  };
  requestAnimationFrame(sweep);
}

// --- The sampler -------------------------------------------------------------------------------

let out: GainNode | null = null;
function output(): GainNode {
  if (!out) {
    const e = getEngine();
    out = e.ctx.createGain();
    out.gain.value = 0.7;
    // Through the deck's effects, so the echo and the filter colour the pads too.
    out.connect(e.bus);
  }
  return out;
}

let voiceBuffer: AudioBuffer | null = null;

// The recorded sounds: fetched when their bank is shown, decoded once there is an engine to decode in.
const fetched = new Map<string, Promise<ArrayBuffer | null>>();
const decoded = new Map<string, AudioBuffer>();
const decoding = new Set<string>();

function fetchOf(id: string): Promise<ArrayBuffer | null> {
  let p = fetched.get(id);
  if (!p) {
    p = fetch(`${SAMPLER_BASE}/${id}.${aacPlays() ? "m4a" : "webm"}`)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
    fetched.set(id, p);
  }
  return p;
}

function decode(id: string) {
  if (decoded.has(id) || decoding.has(id) || !hasEngine()) return;
  decoding.add(id);
  const ctx = getEngine().ctx;
  void fetchOf(id)
    .then((b) => (b ? ctx.decodeAudioData(b.slice(0)) : null))
    .then((buf) => buf && decoded.set(id, buf))
    .catch(() => undefined)
    .finally(() => decoding.delete(id));
}

/** Gets the recorded sounds among `ids` ready, so a pad pressed soon plays the recording. */
export function preload(ids: readonly string[]) {
  for (const id of ids)
    if (RECORDED.has(id)) {
      void fetchOf(id);
      decode(id);
    }
}

/** Whether `id` will play its recording now (rather than the sound made here). */
export const recordedReady = (id: string): boolean => decoded.has(id);

/** Sound `id` at audio time `t`. */
export function play(id: string, t = hasEngine() ? getEngine().ctx.currentTime : 0) {
  const e = getEngine();
  if (id === VOICE) {
    if (!voiceBuffer) return;
    const src = e.ctx.createBufferSource();
    src.buffer = voiceBuffer;
    src.playbackRate.value = Math.pow(2, booth.voice.pitch / 12);
    src.connect(output());
    src.start(Math.max(t, e.ctx.currentTime));
  } else if (decoded.has(id)) {
    const src = e.ctx.createBufferSource();
    src.buffer = decoded.get(id)!;
    src.connect(output());
    src.start(Math.max(t, e.ctx.currentTime));
  } else {
    // Not decoded yet: the sound made here this once, where there is one, and the recording next time.
    if (RECORDED.has(id)) decode(id);
    SOUNDS[id]?.(e.ctx, output(), Math.max(t, e.ctx.currentTime));
  }
  // The pad lights when it sounds, not when it is scheduled.
  const delay = Math.max(0, (t - e.ctx.currentTime) * 1000);
  setTimeout(() => (booth.hit = { id, at: performance.now() }), delay);
}

/** The grid the sampler keeps: the deck's beat when it plays, else one of its own at the groove's tempo. */
let ownClock: { one: number; beat: number } | null = null;
function grid(): { one: number; beat: number } {
  const c = beatClock();
  if (c) return { one: c.one, beat: c.beat };
  const e = getEngine();
  if (!ownClock) ownClock = { one: e.ctx.currentTime + 0.05, beat: 60 / tempoOf(deck.genre) };
  return ownClock;
}
const nextOn = (one: number, step: number, after: number) => one + Math.ceil((after - one) / step - 1e-6) * step;

/** A pad pressed: play it on the next sixteenth (Tap), or start or stop it going round. */
export function press(id: string) {
  const e = getEngine();
  void e.wake();
  if (booth.mode === "tap") {
    const g = grid();
    const now = e.ctx.currentTime + 0.01;
    play(id, deck.playing ? nextOn(g.one, g.beat / 4, now) : now);
    return;
  }
  if (booth.going[id]) {
    delete booth.going[id];
    queued.delete(id);
  } else {
    booth.going[id] = booth.mode;
    tick();
  }
}

/** Everything going round stops. */
export function hush() {
  booth.going = {};
  queued.clear();
}

/**
 * The booth put away, or the page out of sight: nothing goes on playing. The
 * deck stops, the pads stop going round, a sound already scheduled is cut,
 * a build does not land, the knobs go back to the middle, and the echo's and
 * the reverb's tails are not heard.
 */
export function fold() {
  hush();
  builds++;
  if (recorder?.state === "recording") recorder.stop();
  // What the sampler has scheduled goes nowhere; the next pad makes a new way out.
  out?.disconnect();
  out = null;
  roll(false);
  stopDeck();
  booth.bend = 0;
  if (!hasEngine()) return;
  centre();
  getEngine().silence();
}

const queued = new Map<string, number>();
let timer: number | null = null;
/** The look-ahead: what goes round is scheduled a little ahead of the audio clock. */
function tick() {
  if (!hasEngine()) return;
  const e = getEngine();
  const ids = Object.keys(booth.going);
  if (!ids.length) {
    ownClock = null;
    if (timer !== null) clearInterval(timer);
    timer = null;
    return;
  }
  if (timer === null) timer = window.setInterval(tick, 25);
  const g = grid();
  const now = e.ctx.currentTime;
  const ahead = now + 0.12;
  for (const id of ids) {
    const step = booth.going[id] === "loop" ? g.beat * 4 : g.beat * booth.every;
    let at = queued.get(id);
    if (at === undefined || at < now - step) at = nextOn(g.one, step, now + 0.01);
    while (at < ahead) {
      play(id, at);
      at += step;
    }
    queued.set(id, at);
  }
}

// --- The visitor's voice -----------------------------------------------------------------------

const MOST = 4;
let recorder: MediaRecorder | null = null;
let stopAt: number | null = null;

/** Record up to four seconds from the microphone; press again to stop sooner. */
export async function record() {
  if (recorder) {
    recorder.stop();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    booth.voice.state = "unsupported";
    return;
  }
  const e = getEngine();
  void e.wake();
  booth.voice.state = "asking";
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch {
    booth.voice.state = "denied";
    return;
  }
  const chunks: Blob[] = [];
  const rec = new MediaRecorder(stream);
  recorder = rec;
  rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
  rec.onstop = async () => {
    for (const t of stream.getTracks()) t.stop();
    if (stopAt) clearTimeout(stopAt);
    recorder = null;
    try {
      const raw = await e.ctx.decodeAudioData(await new Blob(chunks, { type: rec.mimeType }).arrayBuffer());
      voiceBuffer = trimmed(e.ctx, raw);
      booth.voice.seconds = Math.round(voiceBuffer.duration * 10) / 10;
      booth.voice.state = "ready";
      booth.bank = "voice";
    } catch {
      booth.voice.state = "none";
    }
  };
  rec.start();
  booth.voice.state = "recording";
  stopAt = window.setTimeout(() => rec.state === "recording" && rec.stop(), MOST * 1000);
}

/** The recording without the silence before and after it, as loud as it can be without clipping. */
export function trimmed(ctx: BaseAudioContext, b: AudioBuffer): AudioBuffer {
  const ch = b.getChannelData(0);
  let peak = 0;
  for (const v of ch) peak = Math.max(peak, Math.abs(v));
  const floor = Math.max(0.02, peak * 0.08);
  let first = ch.findIndex((v) => Math.abs(v) > floor);
  let last = ch.length - 1;
  while (last > first && Math.abs(ch[last]) <= floor) last--;
  if (first < 0) first = 0;
  first = Math.max(0, first - Math.round(b.sampleRate * 0.01));
  last = Math.min(ch.length - 1, last + Math.round(b.sampleRate * 0.05));
  const out = ctx.createBuffer(1, Math.max(1, last - first + 1), b.sampleRate);
  const gain = peak > 0 ? 0.9 / peak : 1;
  const o = out.getChannelData(0);
  for (let i = 0; i < o.length; i++) o[i] = ch[first + i] * gain;
  return out;
}

export const hasVoice = () => voiceBuffer !== null;
