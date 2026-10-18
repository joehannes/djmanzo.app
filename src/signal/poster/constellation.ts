/**
 * The constellation of taste: the share poster at Afterglow.
 *
 * The visitor's night, drawn as a constellation — every stage they walked
 * through a star where it lies on the map, joined in the order the signal
 * runs; the stages they skipped faint; their music's lineage, what they
 * do, and (if they shared it) the town and the night's sky written under
 * it. It is made in the browser from what this browser already holds;
 * nothing is sent anywhere to make it.
 */

import type { StageId, StyleTokens } from "../../style/genome/types";
import { STAGES } from "../../stages/script";
import { MAP_SPOTS } from "../world/textures";

export interface PosterInput {
  style: StyleTokens;
  /** Names along the lineage, root left out: "EDM → Electro swing". */
  lineage: string[];
  visited: StageId[];
  role: string | null;
  city: string | null;
  sky: string | null;
  date: Date;
}

export interface Star {
  id: StageId;
  name: string;
  x: number;
  y: number;
  lit: boolean;
  /** 0 … 1: a lit star's size, by its place in the night. */
  size: number;
}

export const POSTER_W = 1080;
export const POSTER_H = 1350;

/**
 * Where each star goes on the poster: the map's spots, turned so the path
 * climbs from bottom left to top right, inside a margin.
 */
export function stars(visited: readonly StageId[]): Star[] {
  const box = { x: 120, y: 200, w: POSTER_W - 240, h: 640 };
  return STAGES.map((s, i) => {
    const [fx, fy] = MAP_SPOTS[s.id];
    // Along the path, left to right; the map's height becomes a wave over a rising line.
    const rise = 1 - i / (STAGES.length - 1);
    return {
      id: s.id,
      name: s.name,
      x: box.x + fx * box.w,
      y: box.y + (rise * 0.7 + (fy - 0.5) * 0.6) * box.h,
      lit: visited.includes(s.id),
      size: 0.6 + 0.4 * Math.sin((i / (STAGES.length - 1)) * Math.PI),
    };
  });
}

/** The lines: between consecutive lit stars, in the signal's order. */
export function lines(all: Star[]): [Star, Star][] {
  const lit = all.filter((s) => s.lit);
  return lit.slice(1).map((s, i) => [lit[i], s]);
}

const ROLE_WORDS: Record<string, string> = { dj: "a DJ", karaoke: "a karaoke host", learning: "learning to DJ", listening: "in love with the music" };

export function caption(p: PosterInput): string[] {
  const first = p.lineage.length ? p.lineage.join(" → ") : p.style.name;
  const who = p.role ? ROLE_WORDS[p.role] : null;
  const when = p.date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const where = [p.city, p.sky ? `${p.sky} sky` : null].filter(Boolean).join(", ");
  return [first, [who && `Walked by ${who}`, where].filter(Boolean).join(" · "), when].filter(Boolean);
}

/** Paint the poster onto a 1080×1350 canvas. */
export function drawPoster(canvas: HTMLCanvasElement, p: PosterInput): void {
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const g = canvas.getContext("2d");
  if (!g) return;
  const pal = p.style.palette;

  // The night, with a glow where the sun will come up.
  g.fillStyle = pal.night;
  g.fillRect(0, 0, POSTER_W, POSTER_H);
  const dawn = g.createRadialGradient(POSTER_W * 0.85, 120, 10, POSTER_W * 0.85, 120, 900);
  dawn.addColorStop(0, hexA(pal.glow, 0.35));
  dawn.addColorStop(0.5, hexA(pal.accents[0], 0.1));
  dawn.addColorStop(1, hexA(pal.night, 0));
  g.fillStyle = dawn;
  g.fillRect(0, 0, POSTER_W, POSTER_H);

  // Dust: the rest of the sky, the same for the same night and style.
  let seed = hash(p.style.id + p.visited.join());
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 420; i++) {
    g.fillStyle = hexA(pal.ink, 0.08 + rnd() * 0.35);
    const r = rnd() * 1.6 + 0.3;
    g.beginPath();
    g.arc(rnd() * POSTER_W, rnd() * POSTER_H * 0.8, r, 0, Math.PI * 2);
    g.fill();
  }

  const all = stars(p.visited);
  // The signal between the stars.
  g.lineCap = "round";
  for (const [a, b] of lines(all)) {
    const grad = g.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, hexA(pal.glow, 0.85));
    grad.addColorStop(1, hexA(pal.accents[0], 0.85));
    g.strokeStyle = grad;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    g.stroke();
  }
  for (const s of all) {
    const r = s.lit ? 10 + 14 * s.size : 4;
    const halo = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 4);
    halo.addColorStop(0, hexA(s.lit ? pal.glow : pal.ink, s.lit ? 0.55 : 0.15));
    halo.addColorStop(1, hexA(pal.night, 0));
    g.fillStyle = halo;
    g.beginPath();
    g.arc(s.x, s.y, r * 4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = s.lit ? pal.ink : hexA(pal.ink, 0.35);
    g.beginPath();
    g.arc(s.x, s.y, s.lit ? r * 0.35 : 2.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = hexA(pal.ink, s.lit ? 0.9 : 0.35);
    g.font = `${s.lit ? 26 : 20}px "${p.style.type.text}", system-ui, sans-serif`;
    g.textAlign = "center";
    g.fillText(s.name, s.x, s.y + (s.lit ? 52 : 30));
  }

  // The words.
  const lines_ = caption(p);
  g.textAlign = "left";
  g.fillStyle = pal.ink;
  g.font = `64px "${p.style.type.display}", system-ui, sans-serif`;
  wrap(g, lines_[0], 90, 1000, POSTER_W - 180, 74);
  g.globalAlpha = 0.85;
  g.font = `30px "${p.style.type.text}", system-ui, sans-serif`;
  lines_.slice(1).forEach((l, i) => g.fillText(l, 90, 1170 + i * 44));
  g.globalAlpha = 1;
  g.fillStyle = pal.glow;
  g.font = `40px "${p.style.type.display}", system-ui, sans-serif`;
  g.textAlign = "right";
  g.fillText("djmanzo", POSTER_W - 90, POSTER_H - 70);
  g.textAlign = "left";
  g.globalAlpha = 0.6;
  g.fillStyle = pal.ink;
  g.font = `22px "${p.style.type.text}", system-ui, sans-serif`;
  g.fillText(`${p.visited.length} of ${STAGES.length} stages of the Signal Path`, 90, POSTER_H - 70);
  g.globalAlpha = 1;

  // Grain, so it reads as a print.
  const img = g.getImageData(0, 0, POSTER_W, POSTER_H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  const out: string[] = [];
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (g.measureText(next).width > width && line) {
      out.push(line);
      line = w;
    } else line = next;
  }
  out.push(line);
  // Grows upward, so a long lineage never runs into the lines below it.
  out.forEach((l, i) => g.fillText(l, x, y - (out.length - 1 - i) * lh));
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
