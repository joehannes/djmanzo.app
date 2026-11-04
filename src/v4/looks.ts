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
  /**
   * The display face (Google Fonts family name) and its CSS stack; the
   * weight its headings are set in, where the face has no 600, so the
   * browser never thickens it by itself; and its letter-spacing, where the
   * page's tight default would close up a face already narrow.
   */
  font: { family: string; weights: string; stack: string; weight?: number; track?: string };
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
    about: "Warehouse and rave flyers: the LED grid, laser fans and the speaker stack's cone — the geometry of a room built for sound.",
    font: { family: "Space Grotesk", weights: "500;600;700", stack: '"Space Grotesk", "Inter", system-ui, sans-serif' },
    // The grid is tighter, with crosshairs at each intersection — the floor plan of a warehouse where every beam carries weight.
    pattern: {
      size: 32,
      opacity: 0.14,
      svg: `<path d="M0 .5H32M.5 0V32" stroke="${A}" stroke-width=".8"/><path d="M16 14v4M14 16h4" stroke="${B}" stroke-width="1.6"/><rect x="14" y="14" width="4" height="4" fill="none" stroke="${A}" stroke-width=".5" opacity=".5"/>`,
    },
    // Laser fans radiate from two vanishing points — left and right — converging at the centre horizon, as they do in a real booth.
    divider: `<g stroke="${A}" stroke-width=".8" opacity=".6">${Array.from({ length: 18 }, (_, i) => {
      const x = i * 67 + 33;
      return `<path d="M0 48L${x} 0"/><path d="M1200 48L${x} 0"/>`;
    }).join("")}</g><path d="M0 47.5H1200" stroke="${B}" stroke-width="1.2"/><circle cx="600" cy="24" r="3" fill="${B}" opacity=".9"/>`,
    // Concentric rings with a pulsing core — the speaker cone seen from the front, its dust cap catching the light.
    motif: `<g fill="none" stroke="${A}">${[88, 70, 52, 34].map((r, i) => `<circle cx="100" cy="100" r="${r}" stroke-width="${1.2 + i * 0.6}" opacity="${0.3 + i * 0.12}" stroke-dasharray="${i % 2 ? '4 6' : 'none'}"/>`).join("")}<circle cx="100" cy="100" r="16" fill="${B}" stroke="none" opacity=".85"/><circle cx="100" cy="100" r="6" fill="${A}" stroke="none"/>`,
    glow: (a, b) => `radial-gradient(55% 45% at 85% 0%, ${a}26, transparent 65%), radial-gradient(45% 45% at 0% 100%, ${b}22, transparent 65%), linear-gradient(180deg, transparent 60%, ${a}08 100%)`,
  },
  tropical: {
    about: "The Caribbean and Latin America: papel picado cutwork strung across the street, the Taíno sun from the petroglyphs, gingerbread fretwork on wooden houses — ornament that celebrates, never overwhelms.",
    font: { family: "Bricolage Grotesque", weights: "500;600;700;800", stack: '"Bricolage Grotesque", "Inter", system-ui, sans-serif' },
    // Papel picado scallops with diamond cutouts — the folded tissue paper hung at weddings and colmados, each flag a small celebration.
    pattern: {
      size: 48,
      opacity: 0.15,
      svg: `<path d="M0 12a6 6 0 0 0 12 0a6 6 0 0 0 12 0a6 6 0 0 0 12 0a6 6 0 0 0 12 0" fill="none" stroke="${A}" stroke-width="1.2"/><path d="M24 28l4 5-4 5-4-5z" fill="${B}" opacity=".9"/><circle cx="6" cy="36" r="1.4" fill="${A}"/><circle cx="42" cy="36" r="1.4" fill="${A}"/><path d="M12 20h24" stroke="${A}" stroke-width=".5" opacity=".4"/>`,
    },
    // Scalloped flags hang from a curved wire — each one a different colour, as they do over a Dominican street at dusk.
    divider: `<path d="M0 8Q600 20 1200 8" fill="none" stroke="${A}" stroke-width="1"/>${Array.from({ length: 20 }, (_, i) => {
      const x = i * 60 + 10;
      const y = 8 + 12 * Math.sin(((x + 30) / 1200) * Math.PI);
      return `<path d="M${x} ${y}h40l-5 28h-30z" fill="${i % 3 === 0 ? B : i % 3 === 1 ? A : '#000'}" opacity="${i % 3 === 2 ? 0.2 : 0.8}"/><circle cx="${x + 20}" cy="${y + 10}" r="3.5" fill="#000" opacity=".3"/><path d="M${x + 12} ${y + 18}h16" stroke="#000" stroke-opacity=".25" stroke-width="2.5"/>`;
    }).join("")}`,
    // The Taíno sun: twelve rays alternating long and short, with the spiral of the coquí frog's shell at its heart — the island's oldest symbol of life and rhythm.
    motif: `<g fill="none" stroke="${A}" stroke-width="4" stroke-linecap="round"><circle cx="100" cy="100" r="36"/><path d="M100 76a24 24 0 1 1-22 32a13 13 0 1 1 24-11"/>${Array.from({ length: 12 }, (_, i) => {
      const t = (i / 12) * Math.PI * 2;
      const len = i % 2 ? 68 : 82;
      return `<path d="M${100 + Math.cos(t) * 50} ${100 + Math.sin(t) * 50}L${100 + Math.cos(t) * len} ${100 + Math.sin(t) * len}" stroke="${i % 2 ? B : A}" stroke-width="${i % 2 ? 3 : 4}"/>`;
    }).join("")}</g><circle cx="100" cy="100" r="5" fill="${B}"/>`,
    glow: (a, b) => `radial-gradient(65% 55% at 88% 0%, ${a}2c, transparent 68%), radial-gradient(55% 48% at 0% 92%, ${b}26, transparent 68%), linear-gradient(170deg, transparent 50%, ${a}06 100%)`,
  },
  urban: {
    about: "Block-party flyers and record sleeves: halftone print from the photocopier, the equaliser's bars dancing to the kick, vinyl grooves under the needle — the texture of a scene built from what was at hand.",
    font: { family: "Anton", weights: "400", stack: '"Anton", "Impact", "Inter", system-ui, sans-serif', weight: 400, track: "0.01em" },
    // Halftone dots in two sizes, offset like newsprint — the DIY aesthetic of photocopied flyers taped to poles.
    pattern: {
      size: 20,
      opacity: 0.13,
      svg: `<circle cx="5" cy="5" r="2.8" fill="${A}"/><circle cx="15" cy="15" r="1.6" fill="${B}"/><circle cx="15" cy="5" r=".9" fill="${A}" opacity=".6"/><circle cx="5" cy="15" r=".9" fill="${A}" opacity=".6"/>`,
    },
    // Equaliser bars with a bass-heavy profile — the low end dominates, as it does in a car system or a block party PA.
    divider: Array.from({ length: 48 }, (_, i) => {
      const h = 4 + Math.abs(Math.sin(i * 1.3) * 28 + Math.sin(i * 0.35) * 14 + (i < 12 ? 10 : 0));
      return `<rect x="${i * 25 + 2}" y="${48 - h}" width="16" rx="2" height="${h}" fill="${i % 8 === 0 ? B : A}" opacity=".75"/>`;
    }).join(""),
    // Vinyl record: concentric grooves with the label at centre and a tonearm entering from the upper right — the moment before the needle drops.
    motif: `<circle cx="96" cy="104" r="78" fill="none" stroke="${A}" stroke-width="2.5"/>${[64, 54, 44, 34].map((r, i) => `<circle cx="96" cy="104" r="${r}" fill="none" stroke="${A}" stroke-width=".8" opacity="${0.4 + i * 0.08}"/>`).join("")}<circle cx="96" cy="104" r="24" fill="${B}" opacity=".9"/><circle cx="96" cy="104" r="4" fill="#000"/><path d="M174 22l8 12-58 72" fill="none" stroke="${A}" stroke-width="4.5" stroke-linecap="round"/><circle cx="174" cy="22" r="5" fill="${A}"/>`,
    glow: (a, b) => `radial-gradient(50% 42% at 100% 0%, ${a}28, transparent 65%), radial-gradient(42% 42% at 0% 100%, ${b}22, transparent 65%), linear-gradient(180deg, transparent 70%, ${b}06 100%)`,
  },
  afro: {
    about: "West African cloth and signs: bògòlanfini mud-cloth crosses painted by hand, kente strips woven in alternating rhythm, and Nkyinkyim — the Adinkra zigzag that says initiative bends but never breaks.",
    font: { family: "Syne", weights: "600;700;800", stack: '"Syne", "Inter", system-ui, sans-serif' },
    // Mud-cloth crosses and dots in a staggered grid — each mark placed by hand on cotton, no two tiles identical.
    pattern: {
      size: 44,
      opacity: 0.15,
      svg: `<path d="M6 8l5 5M11 8l-5 5" stroke="${A}" stroke-width="1.8" stroke-linecap="round"/><path d="M28 10h12" stroke="${A}" stroke-width="1.8" stroke-linecap="round"/><path d="M0 30l5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5" fill="none" stroke="${B}" stroke-width="1.3" stroke-linecap="round"/><circle cx="11" cy="38" r="1.6" fill="${A}"/><circle cx="22" cy="38" r="1.6" fill="${A}"/><circle cx="33" cy="38" r="1.6" fill="${A}"/>`,
    },
    // Kente-inspired blocks in three colours, with cross-hatch texture — the strip-woven cloth where each band carries its own proverb.
    divider: Array.from({ length: 24 }, (_, i) => {
      const x = i * 50;
      const k = i % 3;
      return `<rect x="${x}" y="6" width="50" height="36" fill="${k === 0 ? A : k === 1 ? B : '#000'}" opacity="${k === 2 ? 0.22 : 0.82}"/><path d="M${x + 8} 24h34M${x + 25} 10v28" stroke="#000" stroke-opacity=".25" stroke-width="2.5"/><path d="M${x + 12} 14l26 20M${x + 12} 34l26-20" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/>`;
    }).join(""),
    // Nkyinkyim: the zigzag path that bends around obstacles — drawn as two interlocking stepped lines, one in each accent, meeting at centre.
    motif: `<path d="M36 28h36v24H48v24h36v24H60v24h36v24H72v24h36" fill="none" stroke="${A}" stroke-width="8" stroke-linejoin="miter" stroke-linecap="square"/><path d="M116 28h36v24h-24v24h36v24h-24v24h36" fill="none" stroke="${B}" stroke-width="8" stroke-linejoin="miter" opacity=".85"/><circle cx="100" cy="100" r="6" fill="${A}"/>`,
    glow: (a, b) => `radial-gradient(62% 52% at 88% 0%, ${a}2a, transparent 66%), radial-gradient(52% 48% at 0% 100%, ${b}24, transparent 66%), linear-gradient(175deg, transparent 55%, ${a}07 100%)`,
  },
  neon: {
    about: "East and Southeast Asia's nights: seigaiha waves layered on fabric and tile, neon signage reflected in wet pavement after rain, the paper lantern's warm glow above a karaoke doorway — light as welcome.",
    font: { family: "Unbounded", weights: "500;600;700", stack: '"Unbounded", "Inter", system-ui, sans-serif' },
    // Seigaiha: three concentric arcs per cell, overlapping like scales — the auspicious wave pattern on kimono and ceramics, here tighter and more rhythmic.
    pattern: {
      size: 36,
      opacity: 0.13,
      svg: `${[16, 11, 6].map((r) => `<path d="M${18 - r} 36a${r} ${r} 0 0 1 ${r * 2} 0M${-r} 18a${r} ${r} 0 0 1 ${r * 2} 0M${36 - r} 18a${r} ${r} 0 0 1 ${r * 2} 0" fill="none" stroke="${r === 16 ? A : B}" stroke-width="${r === 16 ? 1.2 : 0.9}"/>`).join("")}<circle cx="18" cy="18" r="1.2" fill="${B}" opacity=".5"/>`,
    },
    // Two sine waves offset in phase — the neon tube's hum made visible, one bright (the sign), one dimmer (its reflection).
    divider: `<path d="M0 22C120 6 220 38 360 22S580 6 720 22 940 38 1080 22 1200 22" fill="none" stroke="${A}" stroke-width="2.5" stroke-linecap="round"/><path d="M0 28C120 12 220 44 360 28S580 12 720 28 940 44 1080 28 1200 28" fill="none" stroke="${B}" stroke-width="1.2" opacity=".6" stroke-linecap="round"/><circle cx="600" cy="25" r="2.5" fill="${A}" opacity=".7"/>`,
    // Paper lantern: concentric arcs rising from a base (the lantern's ribs), topped by a full circle (the light itself) — warm, round, welcoming.
    motif: `<g fill="none" stroke-width="2.5">${[76, 58, 40, 22].map((r, i) => `<path d="M${100 - r} 158a${r} ${r} 0 0 1 ${r * 2} 0" stroke="${i % 2 ? B : A}" stroke-linecap="round"/>`).join("")}</g><circle cx="100" cy="62" r="28" fill="${A}" opacity=".8"/><circle cx="100" cy="62" r="12" fill="${B}" opacity=".6"/>`,
    glow: (a, b) => `radial-gradient(58% 48% at 85% 0%, ${a}2d, transparent 66%), radial-gradient(52% 48% at 5% 100%, ${b}28, transparent 66%), linear-gradient(180deg, transparent 65%, ${b}08 100%)`,
  },
  studio: {
    about: "The studio itself: the slats of an acoustic diffuser, the ticks of a VU meter, its needle.",
    font: { family: "Space Grotesk", weights: "500;600;700", stack: '"Space Grotesk", "Inter", system-ui, sans-serif' },
    pattern: {
      size: 36,
      opacity: 0.11,
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
    about: "The Middle East and North Africa: zellige tilework's eight-pointed star born from two overlapping squares, the horseshoe arch framing a courtyard, mashrabiya lattice filtering lamplight into geometric shadow — precision as hospitality.",
    font: { family: "Reem Kufi", weights: "500;600;700", stack: '"Reem Kufi", "Inter", system-ui, sans-serif' },
    // Zellige star: two squares rotated 45° with connecting diagonals — the fundamental unit of Islamic geometric tiling, drawn at human scale.
    pattern: {
      size: 52,
      opacity: 0.15,
      svg: `<g fill="none" stroke="${A}" stroke-width="1.1"><rect x="12" y="12" width="28" height="28"/><rect x="12" y="12" width="28" height="28" transform="rotate(45 26 26)"/></g><path d="M0 0L12 12M52 0L40 12M0 52L12 40M52 52L40 40" stroke="${B}" stroke-width=".9"/><circle cx="26" cy="26" r="2.5" fill="${B}" opacity=".8"/>`,
    },
    // Horseshoe arches in alternating accents — the rhythmic arcade of a riad courtyard, each arch a doorway between inside and out.
    divider: Array.from({ length: 16 }, (_, i) => {
      const x = i * 75;
      return `<path d="M${x} 48V28Q${x} 8 ${x + 37.5} 3Q${x + 75} 8 ${x + 75} 28V48" fill="none" stroke="${i % 2 ? B : A}" stroke-width="1.5"/><circle cx="${x + 37.5}" cy="14" r="2" fill="${i % 2 ? A : B}" opacity=".5"/>`;
    }).join(""),
    // Eight-pointed star: outer square and rotated inner square with a smaller echo inside — the zellige master's compass-and-straightedge construction, centred and still.
    motif: `<g fill="none" stroke="${A}" stroke-width="2.8"><rect x="42" y="42" width="116" height="116"/><rect x="42" y="42" width="116" height="116" transform="rotate(45 100 100)"/></g><g fill="none" stroke="${B}" stroke-width="1.8"><rect x="68" y="68" width="64" height="64"/><rect x="68" y="68" width="64" height="64" transform="rotate(45 100 100)"/></g><circle cx="100" cy="100" r="8" fill="${A}" opacity=".9"/>`,
    glow: (a, b) => `radial-gradient(58% 48% at 85% 0%, ${a}28, transparent 66%), radial-gradient(52% 48% at 0% 100%, ${b}24, transparent 66%), linear-gradient(175deg, transparent 58%, ${a}06 100%)`,
  },
  monsoon: {
    about: "South Asia's celebrations: rangoli drawn at the threshold each morning, the toran of marigolds strung above the door, the mandala's concentric rings — geometry as blessing, colour as welcome.",
    font: { family: "Rozha One", weights: "400", stack: '"Rozha One", Georgia, serif', weight: 400, track: "-0.01em" },
    // Rangoli petals radiating from a centre dot, with corner dots marking the tile's edges — the daily drawing at the doorstep, remade each morning.
    pattern: {
      size: 48,
      opacity: 0.15,
      svg: `<g transform="translate(24 24)">${Array.from({ length: 8 }, (_, i) => `<ellipse rx="2.5" ry="7" cy="-8" transform="rotate(${i * 45})" fill="none" stroke="${A}" stroke-width="1.1"/>`).join("")}<circle r="2.2" fill="${B}"/></g><circle cx="0" cy="0" r="1.8" fill="${B}" opacity=".7"/><circle cx="48" cy="0" r="1.8" fill="${B}" opacity=".7"/><circle cx="0" cy="48" r="1.8" fill="${B}" opacity=".7"/><circle cx="48" cy="48" r="1.8" fill="${B}" opacity=".7"/>`,
    },
    // Marigold toran: round blossoms on a horizontal thread, with leaf-shaped pendants between every other flower — the garland that marks a celebration.
    divider: `<path d="M0 8H1200" stroke="${A}" stroke-width="1.2"/>${Array.from({ length: 32 }, (_, i) => {
      const x = i * 37.5 + 18.75;
      return `<circle cx="${x}" cy="14" r="6.5" fill="${i % 2 ? B : A}" opacity=".85"/>${i % 2 ? "" : `<path d="M${x} 22q-5 10 0 18q5-8 0-18z" fill="${A}" opacity=".6"/>`}`;
    }).join("")}`,
    // Mandala: twelve outer petals and eight inner ones, with a filled centre — the sacred geometry drawn in rice flour, here as a still emblem.
    motif: `<g transform="translate(100 100)" fill="none">${Array.from({ length: 12 }, (_, i) => `<ellipse rx="10" ry="36" cy="-42" transform="rotate(${i * 30})" stroke="${A}" stroke-width="1.8"/>`).join("")}${Array.from({ length: 8 }, (_, i) => `<ellipse rx="6" ry="18" cy="-20" transform="rotate(${i * 45 + 22.5})" stroke="${B}" stroke-width="1.8"/>`).join("")}<circle r="7" fill="${B}" opacity=".9"/></g>`,
    glow: (a, b) => `radial-gradient(62% 52% at 88% 0%, ${a}2c, transparent 66%), radial-gradient(52% 48% at 0% 100%, ${b}28, transparent 66%), linear-gradient(175deg, transparent 58%, ${a}06 100%)`,
  },
  pacific: {
    about: "Oceania: tapa and siapo bark cloth stamped with ancestral triangles, the koru of the unfurling fern frond, the ocean's rhythm in every line — patterns that carry genealogy and place.",
    font: { family: "Sora", weights: "500;600;700", stack: '"Sora", "Inter", system-ui, sans-serif' },
    // Tapa cloth: zigzag ridges with diamond motifs between them — the beaten bark cloth of Tonga and Samoa, each triangle a mark of lineage.
    pattern: {
      size: 44,
      opacity: 0.15,
      svg: `<path d="M0 10l5.5-8 5.5 8 5.5-8 5.5 8 5.5-8 5.5 8 5.5-8 5.5 8" fill="none" stroke="${A}" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 22h44" stroke="${B}" stroke-width=".9"/><path d="M8 30h7v7h-7zM29 30h7v7h-7z" fill="none" stroke="${A}" stroke-width="1.1"/><circle cx="22" cy="33.5" r="1.8" fill="${B}" opacity=".8"/>`,
    },
    // Breaking wave curls in alternating accents — the Pacific swell seen from shore, each wave a rhythm the body knows before the mind names it.
    divider: `${Array.from({ length: 10 }, (_, i) => {
      const x = i * 120;
      return `<path d="M${x} 44c18-28 54-36 72-16c-12-5-26 0-26 12c0 9 10 10 16 5" fill="none" stroke="${i % 2 ? B : A}" stroke-width="2.2" stroke-linecap="round"/>`;
    }).join("")}<path d="M0 46h1200" stroke="${A}" stroke-width=".8" opacity=".5"/>`,
    // Koru: the silver fern frond unfurling — a spiral that carries new life, growth and peace, drawn as two interlocking curves in the skin's accents.
    motif: `<path d="M100 176V118c0-46 46-64 64-36c14 22-6 48-28 36c-14-7-10-28 4-28" fill="none" stroke="${A}" stroke-width="5.5" stroke-linecap="round"/><path d="M100 146c-28-9-46-36-28-54c12-12 30 0 24 12" fill="none" stroke="${B}" stroke-width="3.5" stroke-linecap="round"/><circle cx="100" cy="176" r="3" fill="${A}" opacity=".6"/>`,
    glow: (a, b) => `radial-gradient(58% 48% at 86% 0%, ${a}2a, transparent 66%), radial-gradient(52% 48% at 0% 100%, ${b}24, transparent 66%), linear-gradient(180deg, transparent 68%, ${b}07 100%)`,
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
    "--display-weight": String(look.font.weight ?? 600),
    "--display-bold": String(look.font.weight ?? 700),
    "--display-track": look.font.track ?? "-0.03em",
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
