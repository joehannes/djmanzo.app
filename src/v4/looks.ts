/**
 * What each skin is dressed in beyond its colours: a pattern woven faintly
 * through the page, a band between sections, a large symbol, the gradient
 * its light falls in, and a display face — each drawn from the visual
 * culture around the music of that part of the world, and said so in
 * `about`, which the look picker shows. They are drawn here as small SVGs
 * in the skin's own two accents (`A` and `B` below), so nothing is a
 * picture of anyone's work and nothing has to be downloaded.
 *
 * Taste over theme park: every ornament stays at a low opacity, behind the
 * words, and still for a visitor who asked for less motion.
 */

import type { SkinId } from "./skins";

export interface Look {
  /** What the ornaments refer to, in a sentence. */
  about: string;
  /** The display face (Google Fonts family name) and its CSS stack. */
  font: { family: string; weights: string; stack: string };
  /** A repeating tile, `size` × `size`. */
  pattern: { svg: string; size: number; opacity: number };
  /** A band 1200 × 48, repeated sideways, between sections. */
  divider: string;
  /** A symbol on a 200 × 200 canvas, for the hero and the section corners. */
  motif: string;
  /** The light the skin's sections fall in: two radial glows over the background. */
  glow: (a: string, b: string) => string;
}

const A = "%A%";
const B = "%B%";

export const LOOKS: Record<SkinId, Look> = {
  club: {
    about: "Warehouse and rave flyers: the LED grid, laser fans and the speaker stack's cone.",
    font: { family: "Space Grotesk", weights: "500;600;700", stack: '"Space Grotesk", "Inter", system-ui, sans-serif' },
    pattern: { size: 40, opacity: 0.07, svg: `<path d="M0 .5H40M.5 0V40" stroke="${A}" stroke-width="1"/><path d="M18 20h4M20 18v4" stroke="${B}" stroke-width="1.4"/>` },
    divider: `<g stroke="${A}" stroke-width="1" opacity=".7">${Array.from({ length: 25 }, (_, i) => `<path d="M600 48L${i * 50} 0"/>`).join("")}</g><path d="M0 47.5H1200" stroke="${B}" stroke-width="1"/>`,
    motif: `<g fill="none" stroke="${A}">${[90, 72, 54, 36].map((r, i) => `<circle cx="100" cy="100" r="${r}" stroke-width="${1 + i}" opacity="${0.35 + i * 0.15}"/>`).join("")}<circle cx="100" cy="100" r="14" fill="${B}" stroke="none"/></g>`,
    glow: (a, b) => `radial-gradient(60% 50% at 85% 0%, ${a}22, transparent 70%), radial-gradient(50% 50% at 0% 100%, ${b}1f, transparent 70%)`,
  },
  tropical: {
    about: "The Caribbean and Latin America: gingerbread fretwork on wooden houses, papel picado over the street, the sun of the Taíno petroglyphs.",
    font: { family: "Bricolage Grotesque", weights: "500;600;700;800", stack: '"Bricolage Grotesque", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 56,
      opacity: 0.09,
      svg: `<path d="M0 14a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0a7 7 0 0 0 14 0" fill="none" stroke="${A}" stroke-width="1.4"/><path d="M28 34l5 6-5 6-5-6z" fill="${B}"/><circle cx="7" cy="40" r="1.6" fill="${A}"/><circle cx="49" cy="40" r="1.6" fill="${A}"/>`,
    },
    divider: `<path d="M0 6Q600 22 1200 6" fill="none" stroke="${A}" stroke-width="1.2"/>${Array.from({ length: 24 }, (_, i) => {
      const x = i * 50 + 6;
      const y = 6 + 16 * Math.sin(((x + 19) / 1200) * Math.PI) ** 1;
      return `<path d="M${x} ${y}h38l-4 30h-30z" fill="${i % 2 ? B : A}" opacity=".85"/><circle cx="${x + 19}" cy="${y + 12}" r="4" fill="#000" opacity=".35"/><path d="M${x + 10} ${y + 22}h18" stroke="#000" stroke-opacity=".35" stroke-width="3"/>`;
    }).join("")}`,
    motif: `<g fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round"><circle cx="100" cy="100" r="40"/><path d="M100 78a22 22 0 1 1-20 30a12 12 0 1 1 22-10"/>${Array.from({ length: 12 }, (_, i) => {
      const t = (i / 12) * Math.PI * 2;
      return `<path d="M${100 + Math.cos(t) * 54} ${100 + Math.sin(t) * 54}L${100 + Math.cos(t) * (i % 2 ? 72 : 84)} ${100 + Math.sin(t) * (i % 2 ? 72 : 84)}" stroke="${i % 2 ? B : A}"/>`;
    }).join("")}</g>`,
    glow: (a, b) => `radial-gradient(70% 60% at 90% 0%, ${a}2e, transparent 70%), radial-gradient(60% 50% at 0% 90%, ${b}24, transparent 70%)`,
  },
  urban: {
    about: "Block-party flyers and record sleeves: halftone dots, the equaliser's bars, a record on the turntable.",
    font: { family: "Anton", weights: "400", stack: '"Anton", "Impact", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 24,
      opacity: 0.08,
      svg: `<circle cx="6" cy="6" r="2.6" fill="${A}"/><circle cx="18" cy="18" r="1.4" fill="${B}"/><circle cx="18" cy="6" r=".8" fill="${A}"/><circle cx="6" cy="18" r=".8" fill="${A}"/>`,
    },
    divider: Array.from({ length: 60 }, (_, i) => {
      const h = 6 + Math.abs(Math.sin(i * 1.7) * 30 + Math.sin(i * 0.45) * 10);
      return `<rect x="${i * 20 + 3}" y="${48 - h}" width="12" height="${h}" fill="${i % 7 === 0 ? B : A}" opacity=".8"/>`;
    }).join(""),
    motif: `<circle cx="96" cy="104" r="80" fill="none" stroke="${A}" stroke-width="3"/>${[66, 56, 46].map((r) => `<circle cx="96" cy="104" r="${r}" fill="none" stroke="${A}" stroke-width="1" opacity=".55"/>`).join("")}<circle cx="96" cy="104" r="22" fill="${B}"/><circle cx="96" cy="104" r="3" fill="#000"/><path d="M176 18l10 14-62 76" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round"/>`,
    glow: (a, b) => `radial-gradient(55% 45% at 100% 0%, ${a}26, transparent 70%), radial-gradient(45% 45% at 0% 100%, ${b}1f, transparent 70%)`,
  },
  afro: {
    about: "West African cloth and signs: bògòlanfini mud-cloth marks, the blocks of kente, and Nkyinkyim, the Adinkra zigzag of a journey that bends and goes on.",
    font: { family: "Syne", weights: "600;700;800", stack: '"Syne", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 48,
      opacity: 0.09,
      svg: `<path d="M4 6l6 6M10 6l-6 6M28 9h16" stroke="${A}" stroke-width="1.6"/><path d="M0 30l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6" fill="none" stroke="${B}" stroke-width="1.4"/><circle cx="12" cy="42" r="1.8" fill="${A}"/><circle cx="24" cy="42" r="1.8" fill="${A}"/><circle cx="36" cy="42" r="1.8" fill="${A}"/>`,
    },
    divider: Array.from({ length: 30 }, (_, i) => {
      const x = i * 40;
      const k = i % 3;
      return `<rect x="${x}" y="8" width="40" height="32" fill="${k === 0 ? A : k === 1 ? B : "#000"}" opacity="${k === 2 ? 0.25 : 0.85}"/><path d="M${x + 6} 24h28M${x + 20} 12v24" stroke="#000" stroke-opacity=".3" stroke-width="3"/>`;
    }).join(""),
    motif: `<path d="M40 30h40v28H52v28h40v28H64v28h40v28" fill="none" stroke="${A}" stroke-width="9" stroke-linejoin="miter"/><path d="M120 30h40v28h-28v28h40" fill="none" stroke="${B}" stroke-width="9" opacity=".8"/>`,
    glow: (a, b) => `radial-gradient(65% 55% at 90% 0%, ${a}29, transparent 70%), radial-gradient(55% 50% at 0% 100%, ${b}22, transparent 70%)`,
  },
  neon: {
    about: "East and Southeast Asia's nights: seigaiha waves on cloth and tile, neon tubes over the karaoke rooms, the lantern's round light.",
    font: { family: "Unbounded", weights: "500;600;700", stack: '"Unbounded", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 40,
      opacity: 0.08,
      svg: `${[18, 13, 8].map((r) => `<path d="M${20 - r} 40a${r} ${r} 0 0 1 ${r * 2} 0M${-r} 20a${r} ${r} 0 0 1 ${r * 2} 0M${40 - r} 20a${r} ${r} 0 0 1 ${r * 2} 0" fill="none" stroke="${r === 18 ? A : B}" stroke-width="1.2"/>`).join("")}`,
    },
    divider: `<path d="M0 24C150 4 250 44 400 24S650 4 800 24 1050 44 1200 24" fill="none" stroke="${A}" stroke-width="3"/><path d="M0 30C150 10 250 50 400 30S650 10 800 30 1050 50 1200 30" fill="none" stroke="${B}" stroke-width="1.5" opacity=".7"/>`,
    motif: `<g fill="none" stroke-width="3">${[80, 62, 44, 26].map((r, i) => `<path d="M${100 - r} 160a${r} ${r} 0 0 1 ${r * 2} 0" stroke="${i % 2 ? B : A}"/>`).join("")}</g><circle cx="100" cy="64" r="26" fill="${A}" opacity=".85"/>`,
    glow: (a, b) => `radial-gradient(60% 50% at 85% 0%, ${a}2b, transparent 70%), radial-gradient(55% 50% at 5% 100%, ${b}26, transparent 70%)`,
  },
  studio: {
    about: "The studio itself: the slats of an acoustic diffuser, the ticks of a VU meter, its needle.",
    font: { family: "Space Grotesk", weights: "500;600;700", stack: '"Space Grotesk", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 36,
      opacity: 0.06,
      svg: `<path d="M3 0v36M9 0v36M17 0v36M29 0v36" stroke="${A}" stroke-width="2"/><path d="M0 18h36" stroke="${B}" stroke-width=".6"/>`,
    },
    divider: Array.from({ length: 120 }, (_, i) => `<path d="M${i * 10 + 5} 48v-${i % 10 === 0 ? 30 : i % 5 === 0 ? 20 : 10}" stroke="${i > 96 ? B : A}" stroke-width="2"/>`).join(""),
    motif: `<path d="M24 140a90 90 0 0 1 152 0" fill="none" stroke="${A}" stroke-width="4"/>${Array.from({ length: 11 }, (_, i) => {
      const t = Math.PI * (1.15 + (i / 10) * 0.7);
      return `<path d="M${100 + Math.cos(t) * 92} ${190 + Math.sin(t) * 92}L${100 + Math.cos(t) * 108} ${190 + Math.sin(t) * 108}" stroke="${i > 7 ? B : A}" stroke-width="3"/>`;
    }).join("")}<path d="M100 190L150 92" stroke="${B}" stroke-width="5" stroke-linecap="round"/>`,
    glow: (a, b) => `radial-gradient(60% 50% at 85% 0%, ${a}1f, transparent 70%), radial-gradient(50% 45% at 0% 100%, ${b}17, transparent 70%)`,
  },
  oasis: {
    about: "The Middle East and North Africa: the eight-pointed star of zellige and girih tiling, the arches of the courtyard, lamplight.",
    font: { family: "Reem Kufi", weights: "500;600;700", stack: '"Reem Kufi", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 60,
      opacity: 0.09,
      svg: `<g fill="none" stroke="${A}" stroke-width="1.2"><rect x="16" y="16" width="28" height="28"/><rect x="16" y="16" width="28" height="28" transform="rotate(45 30 30)"/></g><path d="M0 0L16 16M60 0L44 16M0 60L16 44M60 60L44 44" stroke="${B}" stroke-width="1"/><circle cx="30" cy="30" r="3" fill="${B}"/>`,
    },
    divider: Array.from({ length: 20 }, (_, i) => `<path d="M${i * 60} 48V26Q${i * 60} 6 ${i * 60 + 30} 2Q${i * 60 + 60} 6 ${i * 60 + 60} 26V48" fill="none" stroke="${i % 2 ? B : A}" stroke-width="1.6"/>`).join(""),
    motif: `<g fill="none" stroke="${A}" stroke-width="3"><rect x="45" y="45" width="110" height="110"/><rect x="45" y="45" width="110" height="110" transform="rotate(45 100 100)"/></g><g fill="none" stroke="${B}" stroke-width="2"><rect x="70" y="70" width="60" height="60"/><rect x="70" y="70" width="60" height="60" transform="rotate(45 100 100)"/></g><circle cx="100" cy="100" r="9" fill="${A}"/>`,
    glow: (a, b) => `radial-gradient(60% 50% at 85% 0%, ${a}26, transparent 70%), radial-gradient(55% 50% at 0% 100%, ${b}22, transparent 70%)`,
  },
  monsoon: {
    about: "South Asia's celebrations: rangoli drawn at the door, the toran of marigolds over it, the mandala's rings.",
    font: { family: "Rozha One", weights: "400", stack: '"Rozha One", Georgia, serif' },
    pattern: {
      size: 52,
      opacity: 0.09,
      svg: `<g transform="translate(26 26)">${Array.from({ length: 8 }, (_, i) => `<ellipse rx="3" ry="8" cy="-9" transform="rotate(${i * 45})" fill="none" stroke="${A}" stroke-width="1.2"/>`).join("")}<circle r="2.5" fill="${B}"/></g><circle cx="0" cy="0" r="2" fill="${B}"/><circle cx="52" cy="0" r="2" fill="${B}"/><circle cx="0" cy="52" r="2" fill="${B}"/><circle cx="52" cy="52" r="2" fill="${B}"/>`,
    },
    divider: `<path d="M0 6H1200" stroke="${A}" stroke-width="1.5"/>${Array.from({ length: 40 }, (_, i) => `<circle cx="${i * 30 + 15}" cy="12" r="7" fill="${i % 2 ? B : A}"/>${i % 2 ? "" : `<path d="M${i * 30 + 15} 20q-6 12 0 22q6-10 0-22z" fill="${A}" opacity=".7"/>`}`).join("")}`,
    motif: `<g transform="translate(100 100)" fill="none">${Array.from({ length: 12 }, (_, i) => `<ellipse rx="12" ry="40" cy="-46" transform="rotate(${i * 30})" stroke="${A}" stroke-width="2"/>`).join("")}${Array.from({ length: 8 }, (_, i) => `<ellipse rx="7" ry="20" cy="-22" transform="rotate(${i * 45 + 22.5})" stroke="${B}" stroke-width="2"/>`).join("")}<circle r="8" fill="${B}"/></g>`,
    glow: (a, b) => `radial-gradient(65% 55% at 90% 0%, ${a}2b, transparent 70%), radial-gradient(55% 50% at 0% 100%, ${b}26, transparent 70%)`,
  },
  pacific: {
    about: "Oceania: the triangles of tapa and siapo bark cloth, the curl of the breaking wave, the unfolding fern frond.",
    font: { family: "Sora", weights: "500;600;700", stack: '"Sora", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 48,
      opacity: 0.09,
      svg: `<path d="M0 12l6-10 6 10 6-10 6 10 6-10 6 10 6-10 6 10" fill="none" stroke="${A}" stroke-width="1.3"/><path d="M0 24h48" stroke="${B}" stroke-width="1"/><path d="M8 34h8v8h-8zM32 34h8v8h-8z" fill="none" stroke="${A}" stroke-width="1.2"/><circle cx="24" cy="38" r="2" fill="${B}"/>`,
    },
    divider: `${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 100} 46c20-30 60-40 80-18c-14-6-30 0-30 14c0 10 12 12 18 6" fill="none" stroke="${i % 2 ? B : A}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}<path d="M0 47h1200" stroke="${A}" stroke-width="1"/>`,
    motif: `<path d="M100 180V120c0-50 50-70 70-40c16 24-6 52-30 40c-16-8-12-30 4-30" fill="none" stroke="${A}" stroke-width="6" stroke-linecap="round"/><path d="M100 150c-30-10-50-40-30-60c14-14 34 0 26 14" fill="none" stroke="${B}" stroke-width="4" stroke-linecap="round"/>`,
    glow: (a, b) => `radial-gradient(60% 50% at 88% 0%, ${a}29, transparent 70%), radial-gradient(55% 50% at 0% 100%, ${b}22, transparent 70%)`,
  },
};

/** An ornament as a data URI, in the skin's two accents. */
export function svgUri(body: string, viewBox: string, a: string, b: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body.replaceAll(A, a).replaceAll(B, b)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** The custom properties a look sets on the page, beside the skin's colours. */
export function lookVars(look: Look, a: string, b: string): Record<string, string> {
  const p = look.pattern;
  return {
    "--display": look.font.stack,
    "--pattern": svgUri(p.svg, `0 0 ${p.size} ${p.size}`, a, b),
    "--pattern-size": `${p.size}px`,
    "--pattern-opacity": String(p.opacity),
    "--divider": svgUri(look.divider, "0 0 1200 48", a, b),
    "--motif": svgUri(look.motif, "0 0 200 200", a, b),
    "--glow": look.glow(a, b),
  };
}

/** The Google Fonts stylesheet for a look's display face. */
export function fontHref(look: Look): string {
  return `https://fonts.googleapis.com/css2?family=${look.font.family.replaceAll(" ", "+")}:wght@${look.font.weights}&display=swap`;
}
