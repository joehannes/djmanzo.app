/**
 * The sampler's sounds, made here in the browser rather than recorded: an
 * air horn, a güira, wedding bells, a domino slammed on a colmado's table,
 * a log drum, a dhol, a gong… Each is a few oscillators, filtered noise, a
 * plucked string (Karplus–Strong) or a bell's inharmonic partials, so the
 * site carries no one's recording, nothing to license and nothing to fetch.
 *
 * `BANKS` groups them as a DJ reaches for them: what works everywhere, the
 * occasion (a wedding, an anniversary in a club, a colmado party, a US
 * party) and the region of the look the visitor is in.
 */

import type { SkinId } from "../skins";

type Play = (ctx: BaseAudioContext, out: AudioNode, t: number) => void;

const noises = new WeakMap<BaseAudioContext, AudioBuffer>();
function noiseBuf(ctx: BaseAudioContext): AudioBuffer {
  let b = noises.get(ctx);
  if (!b) {
    b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noises.set(ctx, b);
  }
  return b;
}

/** An envelope: up in `a`, down over `d`, into `out`. */
function env(ctx: BaseAudioContext, out: AudioNode, t: number, a: number, peak: number, d: number): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + Math.max(a, 0.001));
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  g.connect(out);
  return g;
}

interface Tone {
  type?: OscillatorType;
  f: number;
  to?: number;
  glide?: number;
  a?: number;
  peak?: number;
  d?: number;
  detune?: number;
  vib?: [number, number];
}
function tone(ctx: BaseAudioContext, out: AudioNode, t: number, o: Tone): void {
  const { type = "sine", f, to, a = 0.002, peak = 0.4, d = 0.3, detune = 0 } = o;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + (o.glide ?? a + d));
  osc.detune.value = detune;
  if (o.vib) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = o.vib[0];
    const depth = ctx.createGain();
    depth.gain.value = o.vib[1];
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + a + d + 0.05);
  }
  osc.connect(env(ctx, out, t, a, peak, d));
  osc.start(t);
  osc.stop(t + a + d + 0.05);
}

interface Noise {
  type?: BiquadFilterType;
  f?: number;
  to?: number;
  q?: number;
  a?: number;
  peak?: number;
  d?: number;
}
function noise(ctx: BaseAudioContext, out: AudioNode, t: number, o: Noise = {}): void {
  const { type = "bandpass", f = 1000, to, q = 1, a = 0.002, peak = 0.4, d = 0.2 } = o;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf(ctx);
  // Round and round, so a long one does not run out of noise before its envelope ends.
  src.loop = true;
  const filt = ctx.createBiquadFilter();
  filt.type = type;
  filt.frequency.setValueAtTime(f, t);
  if (to) filt.frequency.exponentialRampToValueAtTime(to, t + a + d);
  filt.Q.value = q;
  src.connect(filt).connect(env(ctx, out, t, a, peak, d));
  src.start(t, Math.random() * 1.5);
  src.stop(t + a + d + 0.05);
}

const plucks = new Map<string, AudioBuffer>();
/** A plucked string: Karplus–Strong, made once per pitch. */
function pluck(ctx: BaseAudioContext, out: AudioNode, t: number, f: number, peak = 0.45, d = 1.4): void {
  const key = `${ctx.sampleRate}:${Math.round(f)}`;
  let b = plucks.get(key);
  if (!b) {
    const sr = ctx.sampleRate;
    b = ctx.createBuffer(1, Math.ceil(sr * d), sr);
    const y = b.getChannelData(0);
    const n = Math.max(2, Math.round(sr / f));
    for (let i = 0; i < n; i++) y[i] = Math.random() * 2 - 1;
    for (let i = n; i < y.length; i++) y[i] = 0.497 * (y[i - n] + y[i - n - 1 < 0 ? 0 : i - n - 1]);
    plucks.set(key, b);
  }
  const src = ctx.createBufferSource();
  src.buffer = b;
  const g = ctx.createGain();
  g.gain.value = peak;
  src.connect(g).connect(out);
  src.start(t);
}

/** A bell: inharmonic partials, the higher ones dying sooner. */
function bell(ctx: BaseAudioContext, out: AudioNode, t: number, f: number, ratios = [1, 2.0, 2.76, 4.07, 5.4], d = 2.4, peak = 0.22): void {
  ratios.forEach((r, i) => tone(ctx, out, t, { f: f * r, a: 0.002, peak: peak / (1 + i * 0.7), d: d / (1 + i * 0.5) }));
}

const R = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export const SOUNDS: Record<string, Play> = {
  // --- Everywhere -------------------------------------------------------------------------
  airhorn: (c, o, t) => {
    for (const [at, d] of [
      [0, 0.09],
      [0.13, 0.09],
      [0.26, 0.55],
    ]) {
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1300;
      bp.Q.value = 0.6;
      const drive = c.createWaveShaper();
      // An odd length, so silence lands on the curve's middle point and stays silence.
      const curve = new Float32Array(1025);
      for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(((i / (curve.length - 1)) * 2 - 1) * 4);
      drive.curve = curve;
      bp.connect(drive).connect(o);
      for (const det of [-14, 0, 9]) tone(c, bp, t + at, { type: "sawtooth", f: 418, to: 432, a: 0.01, peak: 0.35, d, detune: det });
    }
  },
  siren: (c, o, t) => tone(c, o, t, { type: "square", f: 900, a: 0.02, peak: 0.12, d: 1.6, vib: [3.2, 380] }),
  laser: (c, o, t) => {
    tone(c, o, t, { type: "square", f: 2400, to: 110, a: 0.002, peak: 0.18, d: 0.28 });
    tone(c, o, t + 0.12, { type: "square", f: 1800, to: 90, a: 0.002, peak: 0.08, d: 0.25 });
  },
  riser: (c, o, t) => {
    noise(c, o, t, { type: "highpass", f: 300, to: 9000, a: 1.7, peak: 0.28, d: 0.15 });
    tone(c, o, t, { type: "sawtooth", f: 180, to: 1400, glide: 1.8, a: 1.7, peak: 0.08, d: 0.15 });
  },
  boom: (c, o, t) => {
    tone(c, o, t, { f: 72, to: 34, glide: 1.2, a: 0.004, peak: 0.95, d: 1.3 });
    noise(c, o, t, { type: "lowpass", f: 3000, a: 0.001, peak: 0.25, d: 0.04 });
  },
  scratch: (c, o, t) => {
    noise(c, o, t, { type: "bandpass", f: 500, to: 2600, q: 3, a: 0.01, peak: 0.5, d: 0.12 });
    noise(c, o, t + 0.13, { type: "bandpass", f: 2600, to: 400, q: 3, a: 0.01, peak: 0.45, d: 0.16 });
  },
  clap: (c, o, t) => {
    for (const at of [0, 0.011, 0.023]) noise(c, o, t + at, { f: 1500, q: 1.4, a: 0.001, peak: 0.5, d: 0.025 });
    noise(c, o, t + 0.03, { f: 1400, q: 1, a: 0.002, peak: 0.35, d: 0.16 });
  },
  snap: (c, o, t) => {
    noise(c, o, t, { f: 2600, q: 5, a: 0.001, peak: 0.6, d: 0.045 });
    tone(c, o, t, { f: 1900, a: 0.001, peak: 0.2, d: 0.02 });
  },
  crash: (c, o, t) => {
    noise(c, o, t, { type: "highpass", f: 5200, a: 0.002, peak: 0.32, d: 1.7 });
    noise(c, o, t, { f: 8000, q: 0.8, a: 0.002, peak: 0.2, d: 0.9 });
  },
  cowbell: (c, o, t) => {
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800;
    bp.Q.value = 3;
    bp.connect(o);
    tone(c, bp, t, { type: "square", f: 540, a: 0.001, peak: 0.5, d: 0.28 });
    tone(c, bp, t, { type: "square", f: 800, a: 0.001, peak: 0.5, d: 0.28 });
  },
  hatroll: (c, o, t) => {
    let at = 0;
    for (let i = 0; i < 14; i++) {
      noise(c, o, t + at, { type: "highpass", f: 7500, a: 0.001, peak: 0.08 + i * 0.02, d: 0.03 });
      at += Math.max(0.025, 0.07 - i * 0.004);
    }
  },
  // --- Club --------------------------------------------------------------------------------
  rave: (c, o, t) => {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(3200, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 0.35);
    lp.connect(o);
    for (const r of [1, 1.189, 1.498]) tone(c, lp, t, { type: "sawtooth", f: 220 * r, a: 0.003, peak: 0.2, d: 0.38 });
  },
  hoover: (c, o, t) => {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1900;
    lp.connect(o);
    for (const det of [-35, 0, 35, 1200]) tone(c, lp, t, { type: "sawtooth", f: 82, to: 128, glide: 0.35, a: 0.04, peak: 0.13, d: 0.9, detune: det });
  },
  // --- Wedding -----------------------------------------------------------------------------
  bells: (c, o, t) => [1047, 1319, 1568, 2093, 1568, 2093].forEach((f, i) => bell(c, o, t + i * 0.16, f, [1, 2.0, 2.4, 3.0, 4.2], 1.8, 0.14)),
  clink: (c, o, t) => {
    for (const at of [0, 0.09]) for (const f of [2900, 4350, 6100]) tone(c, o, t + at, { f: f * R(0.98, 1.02), a: 0.001, peak: 0.12, d: 0.55 });
  },
  champagne: (c, o, t) => {
    tone(c, o, t, { f: 640, to: 180, a: 0.001, peak: 0.45, d: 0.07 });
    noise(c, o, t, { type: "lowpass", f: 2200, a: 0.001, peak: 0.4, d: 0.05 });
    for (let i = 0; i < 26; i++) noise(c, o, t + 0.1 + R(0, 1.3), { type: "highpass", f: R(5000, 9000), a: 0.001, peak: R(0.02, 0.07), d: 0.012 });
  },
  harp: (c, o, t) => [523, 587, 659, 784, 880, 1047, 1175, 1319].forEach((f, i) => pluck(c, o, t + i * 0.05, f, 0.32, 1.6)),
  applause: (c, o, t) => {
    for (let i = 0; i < 90; i++) {
      const at = R(0, 2.2);
      noise(c, o, t + at, { f: R(1200, 4200), q: 1.2, a: 0.001, peak: R(0.04, 0.16) * (1 - at / 2.6), d: 0.025 });
    }
  },
  fireworks: (c, o, t) => {
    tone(c, o, t, { f: 700, to: 2600, glide: 0.7, a: 0.05, peak: 0.08, d: 0.65 });
    noise(c, o, t + 0.75, { type: "lowpass", f: 600, a: 0.002, peak: 0.6, d: 1.1 });
    for (let i = 0; i < 30; i++) noise(c, o, t + 0.8 + R(0, 1.2), { type: "highpass", f: 4000, a: 0.001, peak: R(0.03, 0.1), d: 0.015 });
  },
  // --- Anniversary --------------------------------------------------------------------------
  confetti: (c, o, t) => {
    noise(c, o, t, { type: "lowpass", f: 1800, a: 0.001, peak: 0.6, d: 0.08 });
    tone(c, o, t, { f: 300, to: 70, a: 0.001, peak: 0.5, d: 0.15 });
    for (let i = 0; i < 12; i++) tone(c, o, t + 0.08 + R(0, 0.7), { f: R(2800, 6000), a: 0.001, peak: 0.05, d: 0.12 });
  },
  drumroll: (c, o, t) => {
    let at = 0;
    for (let i = 0; i < 24; i++) {
      noise(c, o, t + at, { f: 1800, q: 0.9, a: 0.001, peak: 0.08 + i * 0.012, d: 0.05 });
      at += Math.max(0.035, 0.09 - i * 0.003);
    }
    SOUNDS.crash(c, o, t + at);
  },
  // --- Colmado party (the Dominican corner shop's fiesta) ----------------------------------
  guira: (c, o, t) => {
    for (const [at, d] of [
      [0, 0.16],
      [0.18, 0.05],
      [0.26, 0.05],
    ])
      noise(c, o, t + at, { type: "highpass", f: 4200, a: 0.004, peak: 0.28, d });
  },
  cencerro: (c, o, t) => {
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 640;
    bp.Q.value = 2.5;
    bp.connect(o);
    tone(c, bp, t, { type: "square", f: 470, a: 0.001, peak: 0.6, d: 0.35 });
    tone(c, bp, t, { type: "square", f: 705, a: 0.001, peak: 0.5, d: 0.3 });
  },
  timbal: (c, o, t) => {
    for (let i = 0; i < 8; i++) {
      const at = i * 0.055;
      tone(c, o, t + at, { f: i % 2 ? 380 : 440, a: 0.001, peak: 0.12 + i * 0.03, d: 0.1 });
      noise(c, o, t + at, { f: 3000, q: 1, a: 0.001, peak: 0.06 + i * 0.015, d: 0.04 });
    }
    tone(c, o, t + 0.47, { f: 440, a: 0.001, peak: 0.45, d: 0.3 });
    noise(c, o, t + 0.47, { type: "highpass", f: 5000, a: 0.001, peak: 0.2, d: 0.6 });
  },
  bocina: (c, o, t) => {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    lp.connect(o);
    for (const [at, d] of [
      [0, 0.14],
      [0.22, 0.45],
    ])
      for (const f of [405, 508]) tone(c, lp, t + at, { type: "square", f, a: 0.008, peak: 0.16, d });
  },
  domino: (c, o, t) => {
    tone(c, o, t, { f: 120, to: 70, a: 0.001, peak: 0.6, d: 0.14 });
    noise(c, o, t, { f: 3400, q: 6, a: 0.001, peak: 0.7, d: 0.035 });
    tone(c, o, t, { f: 1250, a: 0.001, peak: 0.25, d: 0.02 });
    noise(c, o, t + 0.09, { f: 2800, q: 6, a: 0.001, peak: 0.3, d: 0.03 });
  },
  botella: (c, o, t) => {
    for (const at of [0, 0.11]) for (const f of [1650, 2930, 4120]) tone(c, o, t + at, { f: f * R(0.99, 1.01), a: 0.001, peak: 0.13, d: 0.42 });
  },
  clave: (c, o, t) => {
    tone(c, o, t, { f: 2500, a: 0.001, peak: 0.45, d: 0.06 });
    noise(c, o, t, { f: 2500, q: 8, a: 0.001, peak: 0.2, d: 0.03 });
  },
  conga: (c, o, t) => {
    tone(c, o, t, { f: 230, to: 195, a: 0.001, peak: 0.6, d: 0.28 });
    noise(c, o, t, { f: 1200, q: 1, a: 0.001, peak: 0.2, d: 0.04 });
  },
  // --- Africa -------------------------------------------------------------------------------
  logdrum: (c, o, t) => {
    tone(c, o, t, { f: 104, to: 92, a: 0.002, peak: 0.85, d: 0.55 });
    tone(c, o, t, { type: "triangle", f: 208, to: 184, a: 0.002, peak: 0.2, d: 0.2 });
    noise(c, o, t, { type: "lowpass", f: 1500, a: 0.001, peak: 0.2, d: 0.02 });
  },
  talkingdrum: (c, o, t) => {
    const osc = c.createOscillator();
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(270, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.4);
    osc.connect(env(c, o, t, 0.002, 0.6, 0.45));
    osc.start(t);
    osc.stop(t + 0.5);
    noise(c, o, t, { f: 900, q: 1, a: 0.001, peak: 0.2, d: 0.04 });
  },
  shaker: (c, o, t) => {
    noise(c, o, t, { type: "highpass", f: 6000, a: 0.01, peak: 0.25, d: 0.06 });
    noise(c, o, t + 0.12, { type: "highpass", f: 6500, a: 0.005, peak: 0.18, d: 0.05 });
  },
  whistle: (c, o, t) => tone(c, o, t, { f: 2850, a: 0.01, peak: 0.12, d: 0.5, vib: [26, 160] }),
  agogo: (c, o, t) => {
    bell(c, o, t, 880, [1, 2.4, 3.9], 0.5, 0.25);
    bell(c, o, t + 0.17, 660, [1, 2.4, 3.9], 0.6, 0.25);
  },
  // --- East and Southeast Asia --------------------------------------------------------------
  gong: (c, o, t) => bell(c, o, t, 98, [1, 1.47, 2.09, 2.56, 3.2, 4.1], 4.2, 0.45),
  taiko: (c, o, t) => {
    tone(c, o, t, { f: 92, to: 58, a: 0.002, peak: 0.95, d: 0.65 });
    noise(c, o, t, { type: "lowpass", f: 700, a: 0.001, peak: 0.45, d: 0.2 });
  },
  coin: (c, o, t) => {
    tone(c, o, t, { type: "square", f: 1046, a: 0.001, peak: 0.12, d: 0.07 });
    tone(c, o, t + 0.07, { type: "square", f: 1568, a: 0.001, peak: 0.12, d: 0.35 });
  },
  sparkle: (c, o, t) => [2093, 2349, 2637, 3136, 3520, 4186, 3520, 4699].forEach((f, i) => tone(c, o, t + i * 0.055, { f, a: 0.001, peak: 0.08, d: 0.25 })),
  // --- Middle East and North Africa -------------------------------------------------------
  doum: (c, o, t) => {
    tone(c, o, t, { f: 118, to: 82, a: 0.002, peak: 0.8, d: 0.38 });
    noise(c, o, t, { type: "lowpass", f: 500, a: 0.001, peak: 0.25, d: 0.06 });
  },
  tek: (c, o, t) => {
    noise(c, o, t, { f: 2600, q: 2, a: 0.001, peak: 0.5, d: 0.05 });
    tone(c, o, t, { f: 920, a: 0.001, peak: 0.2, d: 0.03 });
  },
  riq: (c, o, t) => {
    for (const at of [0, 0.03, 0.06]) noise(c, o, t + at, { type: "highpass", f: 7200, a: 0.001, peak: 0.16, d: 0.08 });
    for (const f of [5200, 6100, 7300]) tone(c, o, t, { f, a: 0.001, peak: 0.04, d: 0.25 });
  },
  oud: (c, o, t) => [147, 156, 185, 196].forEach((f, i) => pluck(c, o, t + i * 0.13, f, 0.5, 1.2)),
  mizmar: (c, o, t) => {
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1400;
    bp.Q.value = 1.3;
    bp.connect(o);
    [587, 622, 740, 784, 740].forEach((f, i) => tone(c, bp, t + i * 0.12, { type: "sawtooth", f, a: 0.01, peak: 0.25, d: i === 4 ? 0.4 : 0.11, vib: [6, 8] }));
  },
  // --- South Asia ---------------------------------------------------------------------------
  dhol: (c, o, t) => {
    tone(c, o, t, { f: 92, to: 60, a: 0.002, peak: 0.85, d: 0.42 });
    noise(c, o, t + 0.11, { f: 1900, q: 1.4, a: 0.001, peak: 0.45, d: 0.06 });
    noise(c, o, t + 0.2, { f: 1900, q: 1.4, a: 0.001, peak: 0.35, d: 0.05 });
  },
  tabla: (c, o, t) => {
    tone(c, o, t, { f: 88, to: 132, glide: 0.25, a: 0.002, peak: 0.6, d: 0.4 });
    bell(c, o, t + 0.13, 520, [1, 2, 3, 4.2], 0.35, 0.3);
  },
  templebell: (c, o, t) => bell(c, o, t, 880, [1, 2.4, 3.9, 5.6], 3, 0.22),
  conch: (c, o, t) => {
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 0.9;
    bp.connect(o);
    tone(c, bp, t, { type: "sawtooth", f: 233, to: 246, glide: 0.4, a: 0.18, peak: 0.4, d: 1.3, vib: [5, 3] });
  },
  ghungroo: (c, o, t) => {
    for (let i = 0; i < 16; i++) tone(c, o, t + R(0, 0.28), { f: R(4200, 7400), a: 0.001, peak: 0.05, d: 0.09 });
  },
  // --- The Pacific --------------------------------------------------------------------------
  pate: (c, o, t) => {
    tone(c, o, t, { f: 540, to: 495, a: 0.001, peak: 0.55, d: 0.18 });
    noise(c, o, t, { f: 2000, q: 2, a: 0.001, peak: 0.15, d: 0.02 });
  },
  toere: (c, o, t) => {
    for (let i = 0; i < 14; i++) tone(c, o, t + i * 0.06, { f: i % 2 ? 560 : 610, a: 0.001, peak: 0.3 + (i % 4 === 0 ? 0.2 : 0), d: 0.08 });
  },
  ukulele: (c, o, t) => [392, 262, 330, 440].forEach((f, i) => pluck(c, o, t + i * 0.022, f, 0.32, 1.3)),
  wave: (c, o, t) => {
    noise(c, o, t, { type: "lowpass", f: 300, to: 1500, a: 1.1, peak: 0.35, d: 1.6 });
  },
};

/** The voice the visitor recorded: the one sound not made here. */
export const VOICE = "voice";

export type BankId = "everywhere" | "region" | "wedding" | "anniversary" | "colmado" | "usparty";

export const BANKS: Record<Exclude<BankId, "region">, string[]> = {
  everywhere: ["airhorn", "siren", "riser", "boom", "laser", "scratch", "clap", "crash"],
  wedding: ["bells", "clink", "champagne", "harp", "applause", "fireworks", "drumroll", "confetti"],
  anniversary: ["airhorn", "confetti", "drumroll", "crash", "riser", "champagne", "applause", "laser"],
  colmado: ["guira", "cencerro", "timbal", "bocina", "domino", "botella", "clave", "airhorn"],
  usparty: ["boom", "airhorn", "siren", "cowbell", "scratch", "hatroll", "clap", "snap"],
};

/** Each region's own sounds, as the look the visitor is in. */
export const REGION_BANK: Record<SkinId, string[]> = {
  club: ["rave", "hoover", "laser", "siren", "crash", "riser", "clap", "airhorn"],
  tropical: ["guira", "timbal", "cencerro", "clave", "conga", "bocina", "airhorn", "boom"],
  urban: ["boom", "cowbell", "scratch", "siren", "hatroll", "snap", "clap", "airhorn"],
  afro: ["logdrum", "talkingdrum", "shaker", "whistle", "agogo", "airhorn", "boom", "clap"],
  neon: ["gong", "taiko", "coin", "sparkle", "laser", "riser", "clap", "crash"],
  oasis: ["doum", "tek", "riq", "oud", "mizmar", "clap", "riser", "boom"],
  monsoon: ["dhol", "tabla", "templebell", "conch", "ghungroo", "clap", "airhorn", "boom"],
  pacific: ["pate", "toere", "ukulele", "conch", "wave", "whistle", "clap", "boom"],
  studio: ["clap", "snap", "cowbell", "crash", "laser", "riser", "scratch", "boom"],
};

export const bankOf = (bank: BankId, skin: SkinId): string[] => (bank === "region" ? REGION_BANK[skin] : BANKS[bank]);
