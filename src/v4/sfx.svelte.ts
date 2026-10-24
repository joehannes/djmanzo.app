/**
 * The site's small sounds: what a booth sounds like, made in the browser —
 * a needle set down, a scratch, a cue button's click, a rewind, a riser, a
 * microphone tapped, a room cheering. Each is a few lines of Web Audio, so
 * there is no recording to license and nothing to download.
 *
 * Off until the visitor switches them on (the 🔊 in the site bar); the choice
 * is kept in this browser. Quiet, short, and never on a timer: only ever in
 * answer to something the visitor did or scrolled to.
 */

const KEY = "djmanzo:sounds";

export const sounds = $state<{ on: boolean }>({ on: false });

let ctx: AudioContext | null = null;

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

/** Called once the page has loaded: the visitor's earlier choice. */
export function restore() {
  sounds.on = read();
}

export function setSounds(on: boolean) {
  sounds.on = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // A private window keeps the choice for this visit only.
  }
  if (on) needle();
}

function audio(): AudioContext | null {
  if (!sounds.on || typeof AudioContext === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** A buffer of white noise, `seconds` long. */
function noise(a: AudioContext, seconds: number): AudioBuffer {
  const b = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * seconds)), a.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/** A gain that rises to `peak` in `attack` seconds and falls away over `decay`. */
function envelope(a: AudioContext, at: number, peak: number, attack: number, decay: number): GainNode {
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  g.connect(a.destination);
  return g;
}

/** The needle set down: a soft thump and a little crackle. */
export function needle() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const thump = a.createOscillator();
  thump.frequency.setValueAtTime(90, t);
  thump.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  thump.connect(envelope(a, t, 0.25, 0.005, 0.15));
  thump.start(t);
  thump.stop(t + 0.2);
  const crackle = a.createBufferSource();
  crackle.buffer = noise(a, 0.35);
  const hp = a.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3000;
  crackle.connect(hp).connect(envelope(a, t, 0.05, 0.01, 0.3));
  crackle.start(t);
}

/** A baby scratch: forward and back, the record's noise swept up and down. */
export function scratch() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noise(a, 0.3);
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(400, t);
  bp.frequency.exponentialRampToValueAtTime(2200, t + 0.09);
  bp.frequency.exponentialRampToValueAtTime(500, t + 0.24);
  src.connect(bp).connect(envelope(a, t, 0.22, 0.01, 0.25));
  src.start(t);
}

/** A cue button's click: short, bright, quiet. */
export function tick() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  o.type = "triangle";
  o.frequency.value = 1900;
  o.connect(envelope(a, t, 0.06, 0.002, 0.05));
  o.start(t);
  o.stop(t + 0.08);
}

/** The rewind: a record pulled back, falling in pitch. */
export function rewind() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(900, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.45);
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1800;
  o.connect(lp).connect(envelope(a, t, 0.08, 0.02, 0.45));
  o.start(t);
  o.stop(t + 0.5);
}

/** A riser: noise climbing towards a drop that does not come. */
export function riser(seconds = 0.8) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noise(a, seconds);
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(6000, t + seconds);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.07, t + seconds * 0.9);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t);
}

/** A microphone tapped twice: "is this on?" */
export function micTap() {
  const a = audio();
  if (!a) return;
  for (const dt of [0, 0.18]) {
    const t = a.currentTime + dt;
    const o = a.createOscillator();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.08);
    o.connect(envelope(a, t, 0.2, 0.003, 0.1));
    o.start(t);
    o.stop(t + 0.12);
  }
}

/** A small room cheering, far off. */
export function cheer() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noise(a, 1.2);
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1200;
  bp.Q.value = 0.7;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t);
}
