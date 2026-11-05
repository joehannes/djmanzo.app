/**
 * Regional booth skins: each skin gives the booth and player a distinct
 * physical character — not just colours, but shape, texture, proportions
 * and ornament. Like old Winamp skins, every one feels like a different
 * piece of hardware, even though the functionality is identical.
 *
 * The booth reads these tokens via CSS custom properties set on its root;
 * the component applies them as inline styles so each skin's personality
 * comes through without duplicating markup.
 */

import type { SkinId } from "../skins";

export interface BoothSkin {
  /** Border radius of the main chassis (px or %). */
  radius: string;
  /** Border width of panels and controls. */
  borderWidth: string;
  /** Border style: solid, double, ridge, inset, etc. */
  borderStyle: string;
  /** Background texture overlay (CSS gradient or pattern). */
  texture: string;
  /** Shape modifier for the platter: "circle" | "square" | "rounded-square". */
  platterShape: "circle" | "square" | "rounded-square";
  /** Platter size relative to default (0.8–1.2). */
  platterScale: number;
  /** Knob shape: "round" | "square" | "hex". */
  knobShape: "round" | "square" | "hex";
  /** Fader track style: "line" | "channel" | "ridge". */
  faderTrack: "line" | "channel" | "ridge";
  /** Display font style for LCD readouts. */
  lcdFont: string;
  /** LCD background colour. */
  lcdBg: string;
  /** LCD text colour. */
  lcdInk: string;
  /** Button style: "flat" | "raised" | "pill" | "rubber". */
  buttonStyle: "flat" | "raised" | "pill" | "rubber";
  /** Extra ornament class applied to the booth root. */
  ornament: string;
  /** Shadow style for depth. */
  shadow: string;
  /** Accent glow intensity (0–1). */
  glowIntensity: number;
  // --- Player-specific Winamp-style structural tokens ---
  /** Player chassis shape: "rect" | "rounded" | "pill" | "notched". */
  playerShape: "rect" | "rounded" | "pill" | "notched";
  /** Player border treatment: "thin" | "thick" | "double" | "inset" | "bevel". */
  playerBorder: "thin" | "thick" | "double" | "inset" | "bevel";
  /** Player texture overlay (CSS gradient/pattern, distinct from main booth texture). */
  playerTexture: string;
  /** Video window shape: "rect" | "rounded" | "circle" | "arch". */
  videoShape: "rect" | "rounded" | "circle" | "arch";
  /** Transport button shape: "rect" | "round" | "diamond" | "pill". */
  transportShape: "rect" | "round" | "diamond" | "pill";
  /** Title bar style: "flat" | "raised" | "recessed" | "gradient". */
  titleBarStyle: "flat" | "raised" | "recessed" | "gradient";
  /** Player shadow character. */
  playerShadow: string;
}

const SKINS: Record<SkinId, BoothSkin> = {
  club: {
    radius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    texture: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)",
    platterShape: "circle",
    platterScale: 1.0,
    knobShape: "round",
    faderTrack: "channel",
    lcdFont: "var(--mono)",
    lcdBg: "#0a0e14",
    lcdInk: "#38e1c6",
    buttonStyle: "rubber",
    ornament: "ornament-grid",
    shadow: "0 8px 32px -8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
    glowIntensity: 0.6,
    playerShape: "rect",
    playerBorder: "thin",
    playerTexture: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(56,225,198,0.03) 2px, rgba(56,225,198,0.03) 3px)",
    videoShape: "rect",
    transportShape: "rect",
    titleBarStyle: "flat",
    playerShadow: "0 2px 12px -2px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  tropical: {
    radius: "16px",
    borderWidth: "2px",
    borderStyle: "double",
    texture: "radial-gradient(circle at 20% 80%, rgba(255,107,61,0.08), transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,200,87,0.06), transparent 40%)",
    platterShape: "rounded-square",
    platterScale: 0.95,
    knobShape: "round",
    faderTrack: "ridge",
    lcdFont: "'Shrikhand', var(--display)",
    lcdBg: "#1d0a03",
    lcdInk: "#ffc857",
    buttonStyle: "pill",
    ornament: "ornament-scallop",
    shadow: "0 12px 40px -10px rgba(180,80,20,0.4), inset 0 2px 0 rgba(255,255,255,0.08)",
    glowIntensity: 0.5,
    playerShape: "rounded",
    playerBorder: "double",
    playerTexture: "radial-gradient(ellipse at 10% 90%, rgba(255,200,87,0.06), transparent 50%)",
    videoShape: "rounded",
    transportShape: "pill",
    titleBarStyle: "gradient",
    playerShadow: "0 6px 24px -6px rgba(180,80,20,0.35), inset 0 2px 0 rgba(255,255,255,0.06)",
  },
  urban: {
    radius: "4px",
    borderWidth: "2px",
    borderStyle: "solid",
    texture: "repeating-radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)",
    platterShape: "square",
    platterScale: 0.9,
    knobShape: "square",
    faderTrack: "line",
    lcdFont: "'Rubik Glitch', var(--mono)",
    lcdBg: "#0a0a0c",
    lcdInk: "#ff3b47",
    buttonStyle: "flat",
    ornament: "ornament-halftone",
    shadow: "0 4px 20px -4px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)",
    glowIntensity: 0.7,
    playerShape: "rect",
    playerBorder: "thick",
    playerTexture: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,59,71,0.04) 3px, rgba(255,59,71,0.04) 4px)",
    videoShape: "rect",
    transportShape: "diamond",
    titleBarStyle: "raised",
    playerShadow: "0 2px 16px -2px rgba(255,59,71,0.2), inset 0 0 0 1px rgba(255,255,255,0.06)",
  },
  afro: {
    radius: "12px",
    borderWidth: "2px",
    borderStyle: "ridge",
    texture: "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(242,177,52,0.04) 6px, rgba(242,177,52,0.04) 8px), repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(47,191,113,0.03) 6px, rgba(47,191,113,0.03) 8px)",
    platterShape: "circle",
    platterScale: 1.05,
    knobShape: "round",
    faderTrack: "channel",
    lcdFont: "'Righteous', var(--display)",
    lcdBg: "#1a1102",
    lcdInk: "#f2b134",
    buttonStyle: "raised",
    ornament: "ornament-kente",
    shadow: "0 10px 36px -8px rgba(120,80,20,0.5), inset 0 2px 0 rgba(255,255,255,0.06)",
    glowIntensity: 0.5,
    playerShape: "rounded",
    playerBorder: "bevel",
    playerTexture: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(242,177,52,0.05) 4px, rgba(242,177,52,0.05) 6px), repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(47,191,113,0.04) 4px, rgba(47,191,113,0.04) 6px)",
    videoShape: "rounded",
    transportShape: "round",
    titleBarStyle: "raised",
    playerShadow: "0 6px 28px -6px rgba(120,80,20,0.4), inset 0 2px 0 rgba(255,255,255,0.08)",
  },
  neon: {
    radius: "20px",
    borderWidth: "1px",
    borderStyle: "solid",
    texture: "linear-gradient(135deg, rgba(255,79,216,0.05), transparent 50%, rgba(79,210,255,0.05))",
    platterShape: "rounded-square",
    platterScale: 1.0,
    knobShape: "round",
    faderTrack: "ridge",
    lcdFont: "'Major Mono Display', var(--mono)",
    lcdBg: "#1c0218",
    lcdInk: "#ff4fd8",
    buttonStyle: "pill",
    ornament: "ornament-seigaiha",
    shadow: "0 0 40px -10px rgba(255,79,216,0.3), 0 0 80px -20px rgba(79,210,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
    glowIntensity: 0.9,
    playerShape: "pill",
    playerBorder: "inset",
    playerTexture: "linear-gradient(135deg, rgba(255,79,216,0.08), transparent 40%, rgba(79,210,255,0.06))",
    videoShape: "arch",
    transportShape: "pill",
    titleBarStyle: "gradient",
    playerShadow: "0 0 30px -8px rgba(255,79,216,0.25), 0 0 60px -16px rgba(79,210,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  oasis: {
    radius: "8px",
    borderWidth: "1px",
    borderStyle: "double",
    texture: "conic-gradient(from 0deg at 50% 50%, rgba(46,196,182,0.04) 0deg, transparent 30deg, rgba(233,185,73,0.04) 60deg, transparent 90deg, rgba(46,196,182,0.04) 120deg, transparent 150deg, rgba(233,185,73,0.04) 180deg, transparent 210deg, rgba(46,196,182,0.04) 240deg, transparent 270deg, rgba(233,185,73,0.04) 300deg, transparent 330deg)",
    platterShape: "circle",
    platterScale: 1.0,
    knobShape: "hex",
    faderTrack: "channel",
    lcdFont: "'Bevan', var(--display)",
    lcdBg: "#04201d",
    lcdInk: "#2ec4b6",
    buttonStyle: "raised",
    ornament: "ornament-zellige",
    shadow: "0 8px 28px -6px rgba(20,60,50,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
    glowIntensity: 0.4,
    playerShape: "notched",
    playerBorder: "double",
    playerTexture: "conic-gradient(from 45deg at 50% 50%, rgba(46,196,182,0.06) 0deg, transparent 25%, rgba(233,185,73,0.05) 50%, transparent 75%)",
    videoShape: "arch",
    transportShape: "diamond",
    titleBarStyle: "recessed",
    playerShadow: "0 4px 20px -4px rgba(20,60,50,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  monsoon: {
    radius: "14px",
    borderWidth: "2px",
    borderStyle: "ridge",
    texture: "radial-gradient(circle at 50% 0%, rgba(255,159,28,0.06), transparent 50%), radial-gradient(circle at 50% 100%, rgba(224,33,138,0.05), transparent 50%)",
    platterShape: "circle",
    platterScale: 1.0,
    knobShape: "round",
    faderTrack: "ridge",
    lcdFont: "'Chango', var(--display)",
    lcdBg: "#211100",
    lcdInk: "#ff9f1c",
    buttonStyle: "raised",
    ornament: "ornament-rangoli",
    shadow: "0 12px 40px -10px rgba(180,60,20,0.4), inset 0 2px 0 rgba(255,255,255,0.07)",
    glowIntensity: 0.5,
    playerShape: "rounded",
    playerBorder: "bevel",
    playerTexture: "radial-gradient(circle at 50% 0%, rgba(255,159,28,0.08), transparent 40%), radial-gradient(circle at 50% 100%, rgba(224,33,138,0.06), transparent 40%)",
    videoShape: "rounded",
    transportShape: "round",
    titleBarStyle: "gradient",
    playerShadow: "0 8px 32px -8px rgba(180,60,20,0.35), inset 0 2px 0 rgba(255,255,255,0.06)",
  },
  pacific: {
    radius: "18px",
    borderWidth: "1px",
    borderStyle: "solid",
    texture: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(45,212,191,0.03) 8px, rgba(45,212,191,0.03) 10px)",
    platterShape: "rounded-square",
    platterScale: 0.95,
    knobShape: "round",
    faderTrack: "line",
    lcdFont: "'Ultra', var(--display)",
    lcdBg: "#03201c",
    lcdInk: "#2dd4bf",
    buttonStyle: "pill",
    ornament: "ornament-tapa",
    shadow: "0 10px 32px -8px rgba(20,80,70,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    glowIntensity: 0.5,
    playerShape: "pill",
    playerBorder: "thin",
    playerTexture: "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(45,212,191,0.04) 6px, rgba(45,212,191,0.04) 8px)",
    videoShape: "rounded",
    transportShape: "pill",
    titleBarStyle: "flat",
    playerShadow: "0 6px 24px -6px rgba(20,80,70,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  studio: {
    radius: "10px",
    borderWidth: "1px",
    borderStyle: "solid",
    texture: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
    platterShape: "circle",
    platterScale: 1.0,
    knobShape: "round",
    faderTrack: "channel",
    lcdFont: "var(--mono)",
    lcdBg: "#1c1203",
    lcdInk: "#ffb547",
    buttonStyle: "raised",
    ornament: "ornament-none",
    shadow: "0 8px 24px -6px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
    glowIntensity: 0.4,
    playerShape: "rect",
    playerBorder: "thin",
    playerTexture: "linear-gradient(180deg, rgba(255,181,71,0.04), transparent)",
    videoShape: "rect",
    transportShape: "rect",
    titleBarStyle: "flat",
    playerShadow: "0 4px 16px -4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
};

export function boothSkin(id: SkinId): BoothSkin {
  return SKINS[id] ?? SKINS.studio;
}