/**
 * The pictures the painter paints over, until there are photographs.
 *
 * Each stage is a set of layers at depth — a background, a set piece, a
 * foreground — drawn here on canvases in the style's palette, so the brush
 * has shapes to follow: the rings of a groove, two streams meeting, the
 * cone of a speaker. They are placeholders in the honest sense: the Signal
 * Path is designed for photographs (the owner's, and licensed ones), and a
 * photograph replaces a layer without anything else changing.
 *
 * The map is one long canvas: the signal's line winding through ten
 * landmarks, with the sends branching off it.
 */

import type { StageId, StyleTokens } from "../../style/genome/types";

export interface Layer {
  canvas: HTMLCanvasElement;
  /** Distance from the back, in world units: larger is nearer. */
  depth: number;
  /**
   * What the stage's play does with it: `a` and `b` are the two sides the
   * visitor crossfades between, `glow` brightens as they turn something up.
   */
  role?: "a" | "b" | "glow";
}

const W = 1280;
const H = 800;

function canvas(w = W, h = H): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

/** A seeded random, so a stage paints the same way every time. */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Soft blotches of colour, like an underpainting. */
function underpaint(g: CanvasRenderingContext2D, colours: string[], count: number, seed: number, w = W, h = H): void {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = r() * w,
      y = r() * h,
      rad = 60 + r() * 260;
    const grad = g.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, hexA(colours[i % colours.length], 0.08 + r() * 0.14));
    grad.addColorStop(1, hexA(colours[i % colours.length], 0));
    g.fillStyle = grad;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

function backdrop(s: StyleTokens, seed: number, lift = 0): HTMLCanvasElement {
  const [c, g] = canvas();
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, s.palette.night);
  grad.addColorStop(1, hexA(s.palette.accents[1] ?? s.palette.accents[0], Math.max(0.05, 0.22 + lift)));
  g.fillStyle = s.palette.night;
  g.fillRect(0, 0, W, H);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  underpaint(g, s.palette.accents, 26, seed);
  return c;
}

function beam(g: CanvasRenderingContext2D, x: number, top: number, bottom: number, width: number, colour: string): void {
  const grad = g.createLinearGradient(x, top, x, bottom);
  grad.addColorStop(0, hexA(colour, 0.55));
  grad.addColorStop(1, hexA(colour, 0));
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(x - 18, top);
  g.lineTo(x + 18, top);
  g.lineTo(x + width, bottom);
  g.lineTo(x - width, bottom);
  g.closePath();
  g.fill();
}

function record(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, s: StyleTokens): void {
  g.fillStyle = "#08080a";
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
  for (let i = 0; i < 46; i++) {
    const k = 0.35 + (i / 46) * 0.63;
    g.strokeStyle = hexA(i % 7 === 0 ? s.palette.glow : "#ffffff", i % 7 === 0 ? 0.18 : 0.05);
    g.lineWidth = 1.4;
    g.beginPath();
    g.ellipse(x, y, rx * k, ry * k, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = s.palette.accents[0];
  g.beginPath();
  g.ellipse(x, y, rx * 0.3, ry * 0.3, 0, 0, Math.PI * 2);
  g.fill();
  // The sheen a lamp leaves on vinyl.
  const sheen = g.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
  sheen.addColorStop(0.45, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, hexA(s.palette.glow, 0.22));
  sheen.addColorStop(0.55, "rgba(255,255,255,0)");
  g.fillStyle = sheen;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function figure(g: CanvasRenderingContext2D, x: number, y: number, h: number, arms: number, colour: string): void {
  g.fillStyle = colour;
  g.beginPath();
  g.arc(x, y - h * 0.86, h * 0.09, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(x, y - h * 0.52, h * 0.12, h * 0.26, 0, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = h * 0.06;
  g.lineCap = "round";
  g.strokeStyle = colour;
  g.beginPath();
  g.moveTo(x - h * 0.08, y - h * 0.7);
  g.lineTo(x - h * 0.25, y - h * (0.7 + arms * 0.35));
  g.moveTo(x + h * 0.08, y - h * 0.7);
  g.lineTo(x + h * 0.25, y - h * (0.7 + arms * 0.3));
  g.moveTo(x - h * 0.05, y - h * 0.3);
  g.lineTo(x - h * 0.12, y);
  g.moveTo(x + h * 0.05, y - h * 0.3);
  g.lineTo(x + h * 0.14, y);
  g.stroke();
}

/**
 * A painter's hand over a layer: short strokes that take their colour from
 * the picture beneath them and lie along the style's flow, so even a
 * placeholder has brushwork before the shader paints it again.
 */
function brushwork(c: HTMLCanvasElement, s: StyleTokens, seed: number): void {
  const g = c.getContext("2d")!;
  const { width: w, height: h } = c;
  const px = g.getImageData(0, 0, w, h).data;
  const r = rng(seed);
  const flow = s.brush.flow;
  g.lineCap = "round";
  const strokes = Math.round((w * h) / 380);
  for (let i = 0; i < strokes; i++) {
    const x = r() * w;
    const y = r() * h;
    const at = ((y | 0) * w + (x | 0)) * 4;
    const a = px[at + 3] / 255;
    if (a < 0.15) continue;
    const angle =
      flow === "horizontal"
        ? (r() - 0.5) * 0.3
        : flow === "vertical"
          ? Math.PI / 2 + (r() - 0.5) * 0.3
          : flow === "swirl"
            ? Math.atan2(y - h / 2, x - w / 2) + Math.PI / 2
            : flow === "cross"
              ? (r() > 0.5 ? 0.78 : -0.78) + (r() - 0.5) * 0.2
              : Math.atan2(y - h / 2, x - w / 2);
    const len = 8 + r() * 20;
    const shade = 0.82 + r() * 0.36;
    g.strokeStyle = `rgba(${Math.min(255, px[at] * shade) | 0},${Math.min(255, px[at + 1] * shade) | 0},${Math.min(255, px[at + 2] * shade) | 0},${(0.35 + r() * 0.4) * a})`;
    g.lineWidth = 1.5 + r() * 3.5;
    g.beginPath();
    g.moveTo(x - Math.cos(angle) * len * 0.5, y - Math.sin(angle) * len * 0.5);
    g.lineTo(x + Math.cos(angle) * len * 0.5, y + Math.sin(angle) * len * 0.5);
    g.stroke();
  }
}

type Painter = (s: StyleTokens) => Layer[];

const STAGES: Record<StageId, Painter> = {
  silence: (s) => {
    const back = backdrop(s, 11, -0.2);
    const [mid, g] = canvas();
    beam(g, W * 0.5, 0, H, 260, s.palette.glow);
    record(g, W * 0.5, H * 0.78, 330, 90, s);
    const [front, f] = canvas();
    // The needle, held above the record.
    f.strokeStyle = s.palette.ink;
    f.lineWidth = 10;
    f.lineCap = "round";
    f.beginPath();
    f.moveTo(W * 0.86, H * 0.18);
    f.lineTo(W * 0.62, H * 0.56);
    f.stroke();
    f.fillStyle = s.palette.glow;
    f.fillRect(W * 0.6, H * 0.55, 34, 16);
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1.2 },
      { canvas: front, depth: 2.4 },
    ];
  },
  groove: (s) => {
    const back = backdrop(s, 21);
    const [mid, g] = canvas();
    record(g, W * 0.5, H * 0.62, 600, 300, s);
    const [front, f] = canvas();
    underpaint(f, [s.palette.glow], 6, 29);
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1.4 },
      { canvas: front, depth: 2.6 },
    ];
  },
  needle: (s) => {
    const back = backdrop(s, 31);
    const [mid, g] = canvas();
    // The walls of the groove, in macro: a landscape of ridges.
    for (let i = 0; i < 14; i++) {
      const y = H * 0.25 + i * 42;
      g.strokeStyle = hexA(i % 3 === 0 ? s.palette.glow : s.palette.ink, 0.25 + (i % 4) * 0.08);
      g.lineWidth = 18;
      g.beginPath();
      for (let x = -20; x <= W + 20; x += 20) g.lineTo(x, y + Math.sin(x / 47 + i) * 14 + Math.sin(x / 13 + i * 2) * 4);
      g.stroke();
    }
    const [front, f] = canvas();
    f.fillStyle = s.palette.ink;
    f.beginPath();
    f.moveTo(W * 0.55, 0);
    f.lineTo(W * 0.62, 0);
    f.lineTo(W * 0.5, H * 0.52);
    f.closePath();
    f.fill();
    f.fillStyle = s.palette.glow;
    f.beginPath();
    f.arc(W * 0.5, H * 0.52, 9, 0, Math.PI * 2);
    f.fill();
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1.2 },
      { canvas: front, depth: 2.6 },
    ];
  },
  cue: (s) => {
    const back = backdrop(s, 41, -0.25);
    const [mid, g] = canvas();
    const pool = g.createRadialGradient(W * 0.5, H * 0.7, 10, W * 0.5, H * 0.7, 380);
    pool.addColorStop(0, hexA(s.palette.glow, 0.6));
    pool.addColorStop(1, hexA(s.palette.glow, 0));
    g.fillStyle = pool;
    g.fillRect(0, 0, W, H);
    const [front, f] = canvas();
    // Headphones on a hook.
    f.strokeStyle = s.palette.ink;
    f.lineWidth = 22;
    f.beginPath();
    f.arc(W * 0.5, H * 0.46, 170, Math.PI * 1.05, Math.PI * 1.95);
    f.stroke();
    f.fillStyle = s.palette.accents[0];
    for (const dx of [-170, 170]) {
      f.beginPath();
      f.ellipse(W * 0.5 + dx, H * 0.5, 48, 82, 0, 0, Math.PI * 2);
      f.fill();
    }
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1 },
      { canvas: front, depth: 2.4 },
    ];
  },
  confluence: (s) => {
    const back = backdrop(s, 51);
    // Two streams meeting at the mixer, each its own layer so the visitor can lean one way or the other.
    const stream = (from: number, colour: string, to: number): HTMLCanvasElement => {
      const [c, g] = canvas();
      g.strokeStyle = hexA(colour, 0.85);
      g.lineWidth = 70;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(-40, from);
      g.bezierCurveTo(W * 0.3, from, W * 0.35, H * 0.55, W * 0.52, H * 0.55);
      g.lineTo(W + 40, to);
      g.stroke();
      return c;
    };
    const a = stream(H * 0.18, s.palette.accents[0], H * 0.56);
    const b = stream(H * 0.92, s.palette.accents[1] ?? s.palette.glow, H * 0.6);
    const [front, f] = canvas();
    // The mixer: a grid of faders and knobs where they meet.
    f.fillStyle = hexA("#000000", 0.75);
    f.fillRect(W * 0.42, H * 0.38, W * 0.2, H * 0.36);
    for (let i = 0; i < 4; i++) {
      f.fillStyle = s.palette.ink;
      f.fillRect(W * 0.45 + i * 58, H * 0.5, 8, 120);
      f.fillStyle = s.palette.glow;
      f.fillRect(W * 0.45 + i * 58 - 14, H * 0.5 + 30 + (i % 2) * 40, 36, 16);
      f.beginPath();
      f.arc(W * 0.45 + i * 58 + 4, H * 0.43, 14, 0, Math.PI * 2);
      f.fill();
    }
    return [
      { canvas: back, depth: 0 },
      { canvas: a, depth: 1.15, role: "a" },
      { canvas: b, depth: 1.25, role: "b" },
      { canvas: front, depth: 2.5 },
    ];
  },
  voice: (s) => {
    const back = backdrop(s, 61);
    const [mid, g] = canvas();
    beam(g, W * 0.5, 0, H * 0.95, 200, s.palette.glow);
    g.fillStyle = hexA(s.palette.glow, 0.35);
    g.beginPath();
    g.ellipse(W * 0.5, H * 0.92, 240, 50, 0, 0, Math.PI * 2);
    g.fill();
    const [front, f] = canvas();
    f.fillStyle = s.palette.ink;
    f.fillRect(W * 0.5 - 6, H * 0.42, 12, H * 0.5);
    f.beginPath();
    f.ellipse(W * 0.5, H * 0.34, 46, 74, 0, 0, Math.PI * 2);
    f.fill();
    f.strokeStyle = s.palette.night;
    f.lineWidth = 3;
    for (let y = -50; y <= 50; y += 14) {
      f.beginPath();
      f.moveTo(W * 0.5 - 40, H * 0.34 + y);
      f.lineTo(W * 0.5 + 40, H * 0.34 + y);
      f.stroke();
    }
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1.1 },
      { canvas: front, depth: 2.5 },
    ];
  },
  amp: (s) => {
    const back = backdrop(s, 71, -0.1);
    const [halo, h] = canvas();
    // The light the valves throw when the power is up.
    const room = h.createRadialGradient(W * 0.5, H * 0.5, 40, W * 0.5, H * 0.5, W * 0.6);
    room.addColorStop(0, hexA(s.palette.glow, 0.55));
    room.addColorStop(1, hexA(s.palette.glow, 0));
    h.fillStyle = room;
    h.fillRect(0, 0, W, H);
    const [mid, g] = canvas();
    // Valves, glowing.
    for (let i = 0; i < 6; i++) {
      const x = W * 0.2 + i * W * 0.12;
      const glow = g.createRadialGradient(x, H * 0.5, 4, x, H * 0.5, 110);
      glow.addColorStop(0, hexA(s.palette.glow, 0.9));
      glow.addColorStop(1, hexA(s.palette.glow, 0));
      g.fillStyle = glow;
      g.fillRect(x - 110, H * 0.5 - 110, 220, 220);
      g.strokeStyle = hexA(s.palette.ink, 0.6);
      g.lineWidth = 6;
      g.beginPath();
      g.roundRect(x - 34, H * 0.3, 68, 220, 34);
      g.stroke();
    }
    const [front, f] = canvas();
    f.strokeStyle = s.palette.ink;
    f.lineWidth = 14;
    f.beginPath();
    f.arc(W * 0.85, H * 0.82, 90, Math.PI * 0.8, Math.PI * 2.2);
    f.stroke();
    f.fillStyle = s.palette.accents[0];
    f.save();
    f.translate(W * 0.85, H * 0.82);
    f.rotate(-0.4);
    f.fillRect(-6, -80, 12, 80);
    f.restore();
    return [
      { canvas: back, depth: 0 },
      { canvas: halo, depth: 0.6, role: "glow" },
      { canvas: mid, depth: 1.2 },
      { canvas: front, depth: 2.5 },
    ];
  },
  cone: (s) => {
    const back = backdrop(s, 81);
    const [mid, g] = canvas();
    for (let i = 12; i > 0; i--) {
      g.fillStyle = i % 2 ? hexA(s.palette.night, 0.95) : hexA(s.palette.accents[0], 0.35);
      g.beginPath();
      g.arc(W * 0.5, H * 0.5, i * 30, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = s.palette.glow;
    g.beginPath();
    g.arc(W * 0.5, H * 0.5, 42, 0, Math.PI * 2);
    g.fill();
    const [front, f] = canvas();
    const r = rng(89);
    // Dust lifting off the cone.
    for (let i = 0; i < 160; i++) {
      f.fillStyle = hexA(s.palette.glow, 0.25 + r() * 0.5);
      f.beginPath();
      f.arc(W * (0.3 + r() * 0.4), H * (0.2 + r() * 0.6), 1 + r() * 4, 0, Math.PI * 2);
      f.fill();
    }
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1.2 },
      { canvas: front, depth: 2.7 },
    ];
  },
  floor: (s) => {
    const back = backdrop(s, 91, 0.15);
    const [mid, g] = canvas();
    beam(g, W * 0.3, 0, H, 220, s.palette.accents[0]);
    beam(g, W * 0.72, 0, H, 220, s.palette.accents[1] ?? s.palette.glow);
    const [front, f] = canvas();
    const r = rng(97);
    for (let i = 0; i < 26; i++) {
      figure(f, (i / 26) * W + r() * 30, H * (0.92 + r() * 0.08), 170 + r() * 90, r(), hexA("#050507", 0.92));
    }
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1 },
      { canvas: front, depth: 2.6 },
    ];
  },
  afterglow: (s) => {
    const [back, g] = canvas();
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, s.palette.night);
    sky.addColorStop(0.55, hexA(s.palette.accents[0], 0.8));
    sky.addColorStop(0.7, s.palette.glow);
    sky.addColorStop(1, s.palette.night);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    const [mid, m] = canvas();
    const sun = m.createRadialGradient(W * 0.5, H * 0.68, 10, W * 0.5, H * 0.68, 260);
    sun.addColorStop(0, hexA("#ffffff", 0.95));
    sun.addColorStop(0.2, hexA(s.palette.glow, 0.8));
    sun.addColorStop(1, hexA(s.palette.glow, 0));
    m.fillStyle = sun;
    m.fillRect(0, 0, W, H);
    const [front, f] = canvas();
    f.fillStyle = s.palette.night;
    f.beginPath();
    f.moveTo(0, H);
    for (let x = 0; x <= W; x += 40) f.lineTo(x, H * 0.74 + Math.sin(x / 90) * 18 + Math.sin(x / 31) * 6);
    f.lineTo(W, H);
    f.fill();
    return [
      { canvas: back, depth: 0 },
      { canvas: mid, depth: 1 },
      { canvas: front, depth: 2.4 },
    ];
  },
};

export function stageLayers(stage: StageId, style: StyleTokens): Layer[] {
  const layers = STAGES[stage](style);
  layers.forEach((l, i) => brushwork(l.canvas, style, stage.length * 31 + i));
  return layers;
}

/** Where each stage sits on the map, as fractions of its width and height. */
export const MAP_SPOTS: Record<StageId, [number, number]> = {
  silence: [0.05, 0.55],
  groove: [0.15, 0.36],
  needle: [0.25, 0.6],
  cue: [0.34, 0.37],
  confluence: [0.45, 0.56],
  voice: [0.55, 0.33],
  amp: [0.64, 0.6],
  cone: [0.74, 0.4],
  floor: [0.84, 0.62],
  afterglow: [0.95, 0.42],
};

export const MAP_W = 3072;
export const MAP_H = 1536;

/** The map: the signal's line through ten landmarks, painted. */
export function mapCanvas(style: StyleTokens, order: StageId[]): HTMLCanvasElement {
  const [c, g] = canvas(MAP_W, MAP_H);
  const s = style;
  g.fillStyle = s.palette.night;
  g.fillRect(0, 0, MAP_W, MAP_H);
  underpaint(g, [...s.palette.accents, s.palette.glow], 120, 7, MAP_W, MAP_H);
  const at = (id: StageId) => [MAP_SPOTS[id][0] * MAP_W, MAP_SPOTS[id][1] * MAP_H] as const;

  // Landmarks: the equipment, seen from far enough away to be land.
  const [gx, gy] = at("groove");
  record(g, gx, gy, 230, 150, s);
  const [cx, cy] = at("cone");
  for (let i = 9; i > 0; i--) {
    g.fillStyle = i % 2 ? hexA(s.palette.night, 0.9) : hexA(s.palette.accents[0], 0.3);
    g.beginPath();
    g.ellipse(cx, cy, i * 22, i * 15, 0, 0, Math.PI * 2);
    g.fill();
  }
  const [mx, my] = at("confluence");
  g.strokeStyle = hexA(s.palette.ink, 0.25);
  g.lineWidth = 3;
  for (let i = -5; i <= 5; i++) {
    g.beginPath();
    g.moveTo(mx + i * 26, my - 150);
    g.lineTo(mx + i * 26, my + 150);
    g.moveTo(mx - 150, my + i * 26);
    g.lineTo(mx + 150, my + i * 26);
    g.stroke();
  }
  const [ax, ay] = at("amp");
  for (let i = 0; i < 5; i++) {
    const glow = g.createRadialGradient(ax - 100 + i * 50, ay, 2, ax - 100 + i * 50, ay, 50);
    glow.addColorStop(0, hexA(s.palette.glow, 0.8));
    glow.addColorStop(1, hexA(s.palette.glow, 0));
    g.fillStyle = glow;
    g.fillRect(ax - 160 + i * 50, ay - 60, 120, 120);
  }
  const [fx, fy] = at("floor");
  const r = rng(5);
  for (let i = 0; i < 70; i++) figure(g, fx - 180 + r() * 360, fy + 40 - r() * 120, 40 + r() * 20, r(), hexA(s.palette.ink, 0.35));
  const [sx, sy] = at("afterglow");
  const sun = g.createRadialGradient(sx, sy, 5, sx, sy, 260);
  sun.addColorStop(0, hexA(s.palette.glow, 0.9));
  sun.addColorStop(1, hexA(s.palette.glow, 0));
  g.fillStyle = sun;
  g.fillRect(sx - 260, sy - 260, 520, 520);
  const [bx, by] = at("silence");
  beam(g, bx, by - 300, by + 120, 90, s.palette.glow);

  // The signal: one line of light, drawn as djmanzo draws a deck — as water.
  const pts = order.map(at);
  for (const [width, alpha] of [
    [120, 0.1],
    [60, 0.22],
    [26, 0.6],
    [12, 1],
  ] as const) {
    g.strokeStyle = hexA(s.palette.glow, alpha);
    g.lineWidth = width;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      g.bezierCurveTo(x0 + (x1 - x0) * 0.5, y0, x0 + (x1 - x0) * 0.5, y1, x1, y1);
    }
    g.stroke();
  }
  // The land fades into the night at its edges, so the map has no border.
  for (const [x0, y0, x1, y1] of [
    [0, 0, 0, 260],
    [0, MAP_H, 0, MAP_H - 260],
    [0, 0, 220, 0],
    [MAP_W, 0, MAP_W - 220, 0],
  ]) {
    const edge = g.createLinearGradient(x0, y0, x1, y1);
    edge.addColorStop(0, s.palette.night);
    edge.addColorStop(1, hexA(s.palette.night, 0));
    g.fillStyle = edge;
    g.fillRect(0, 0, MAP_W, MAP_H);
  }

  brushwork(c, s, 3);

  // A pool of light where each stage is.
  for (const [x, y] of pts) {
    const pool = g.createRadialGradient(x, y, 4, x, y, 90);
    pool.addColorStop(0, hexA(s.palette.ink, 0.95));
    pool.addColorStop(0.25, hexA(s.palette.glow, 0.7));
    pool.addColorStop(1, hexA(s.palette.glow, 0));
    g.fillStyle = pool;
    g.fillRect(x - 90, y - 90, 180, 180);
  }
  return c;
}
