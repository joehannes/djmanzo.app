/**
 * The site's skins: one look per part of the world, chosen from where the
 * visitor's connection comes from and changeable at any time. A skin is a
 * palette, its photographs, the grooves its decks play first, the colours its
 * waveforms are drawn in, and which of djmanzo's own themes its screenshots
 * are shown in. European techno does not look like a merengue on a Santo
 * Domingo rooftop, and the site should not pretend it does.
 *
 * Only the country is read (the edge's reading, as every price on the site
 * already is); nothing about the person.
 */

export type SkinId = "club" | "tropical" | "urban" | "afro" | "neon" | "studio";

export interface Skin {
  id: SkinId;
  /** The skin's name in the picker. */
  name: string;
  /** Where it is the first look. */
  region: string;
  /** One line under the hero, in this skin's voice. */
  line: string;
  /** Grooves the engine plays for this skin (`lib/genres.ts` ids), the first by default. */
  genres: string[];
  /** The style family (`style/genome`) the guide is told the visitor is in. */
  family: string;
  tokens: {
    bg: string;
    surface: string;
    raised: string;
    line: string;
    text: string;
    dim: string;
    accent: string;
    accent2: string;
    onAccent: string;
  };
  /** Waveform colours: low, mid and high bands; and the stems' drums, percussion, bass and keys. */
  bands: [string, string, string];
  stems: [string, string, string, string];
  /** djmanzo themes to show screenshots in, best first (names as the app's picker shows them). */
  themes: string[];
}

export const SKINS: Skin[] = [
  {
    id: "club",
    name: "Club",
    region: "Europe",
    line: "Warehouse techno, Ibiza sunsets, drum & bass at four in the morning.",
    genres: ["techno", "house", "dnb", "lounge"],
    family: "edm",
    tokens: { bg: "#06080c", surface: "#0e131a", raised: "#151c26", line: "#222c39", text: "#e8eef6", dim: "#8593a6", accent: "#38e1c6", accent2: "#7b61ff", onAccent: "#031512" },
    bands: ["#2563ff", "#38e1c6", "#e6fbff"],
    stems: ["#38e1c6", "#7b61ff", "#2563ff", "#e6fbff"],
    themes: ["Industrial Techno", "Cyber Trance", "Club", "Signal"],
  },
  {
    id: "tropical",
    name: "Tropical",
    region: "Latin America & the Caribbean",
    line: "Merengue at the wedding, bachata at the colmado, reggaeton till sunrise.",
    genres: ["merengue", "bachata", "reggaeton", "salsa", "cumbia", "dembow"],
    family: "latin",
    tokens: { bg: "#0c0708", surface: "#170e10", raised: "#21141a", line: "#3a2229", text: "#fbefe8", dim: "#b39189", accent: "#ff6b3d", accent2: "#ffc857", onAccent: "#1d0a03" },
    bands: ["#ff3d6e", "#ff6b3d", "#ffe3a3"],
    stems: ["#ff6b3d", "#ffc857", "#ff3d6e", "#ffe3a3"],
    themes: ["Caribbean", "Bachata Rosa", "Malecón Night", "Carnaval", "Latin"],
  },
  {
    id: "urban",
    name: "Urban",
    region: "North America",
    line: "Block parties, battle mixers, and the record everybody knows the words to.",
    genres: ["hiphop", "house", "disco", "pop"],
    family: "urban",
    tokens: { bg: "#08080a", surface: "#121216", raised: "#1a1a20", line: "#2a2a33", text: "#f2f0ec", dim: "#9a978f", accent: "#ff3b47", accent2: "#f5c542", onAccent: "#1a0204" },
    bands: ["#ff3b47", "#f5c542", "#fff6dd"],
    stems: ["#ff3b47", "#f5c542", "#c2410c", "#fff6dd"],
    themes: ["Scratch", "Booth", "Spotlight", "Velvet"],
  },
  {
    id: "afro",
    name: "Afro",
    region: "Africa",
    line: "Amapiano log drums on the rooftop, afrobeats until the city wakes.",
    genres: ["afrobeats", "house", "dancehall"],
    family: "urban",
    tokens: { bg: "#070908", surface: "#0f1411", raised: "#161d18", line: "#26322a", text: "#f3efe4", dim: "#98a08f", accent: "#f2b134", accent2: "#2fbf71", onAccent: "#1a1102" },
    bands: ["#2fbf71", "#f2b134", "#fff1cc"],
    stems: ["#f2b134", "#2fbf71", "#d9622b", "#fff1cc"],
    themes: ["Sunset", "Festival", "Organic Base"],
  },
  {
    id: "neon",
    name: "Neon",
    region: "East and Southeast Asia",
    line: "Small clubs, big sound systems, and karaoke rooms that never close.",
    genres: ["pop", "house", "techno"],
    family: "party",
    tokens: { bg: "#07060d", surface: "#100e1a", raised: "#181528", line: "#2a2540", text: "#f1eefc", dim: "#9890b5", accent: "#ff4fd8", accent2: "#4fd2ff", onAccent: "#1c0218" },
    bands: ["#4fd2ff", "#ff4fd8", "#f7e8ff"],
    stems: ["#ff4fd8", "#4fd2ff", "#7c3aed", "#f7e8ff"],
    themes: ["Karaoke Neon", "Cyber Trance", "Aurora", "Spectrum"],
  },
  {
    id: "studio",
    name: "Studio",
    region: "Everywhere else",
    line: "A desk, two decks, and whatever the room needs tonight.",
    genres: ["house", "lounge", "disco", "techno"],
    family: "music",
    // Not blue: nearly every DJ-software brand already is.
    tokens: { bg: "#0b0c0e", surface: "#14161a", raised: "#1e2228", line: "#2a2f37", text: "#eceef1", dim: "#9aa1ab", accent: "#ffb547", accent2: "#c6f432", onAccent: "#1c1203" },
    bands: ["#ff8a3d", "#ffb547", "#fff4dc"],
    stems: ["#ffb547", "#c6f432", "#ff8a3d", "#fff4dc"],
    themes: ["Organic Base", "Studio", "Stem Lab"],
  },
];

export const SKIN_BY_ID = Object.fromEntries(SKINS.map((s) => [s.id, s])) as Record<SkinId, Skin>;

const EUROPE = "AD AL AT AU BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO NZ PL PT RO RS RU SE SI SK SM UA VA XK";
const LATIN =
  "AG AI AR AW BB BL BO BQ BR BS BZ CL CO CR CU CW DM DO EC GD GF GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PR PY SR SV SX TC TT UY VC VE VG VI";
const NORTH = "US CA BM GL PM";
const AFRICA =
  "AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW";
const ASIA = "BN CN HK ID JP KH KR LA MM MN MO MY PH SG TH TW VN";

const REGION: Record<string, SkinId> = {};
for (const [list, skin] of [
  [EUROPE, "club"],
  [LATIN, "tropical"],
  [NORTH, "urban"],
  [AFRICA, "afro"],
  [ASIA, "neon"],
] as [string, SkinId][]) {
  for (const c of list.split(" ")) REGION[c] = skin;
}

/** The skin for a country (ISO 3166-1 alpha-2), or Studio when it is unknown or elsewhere. */
export function skinForCountry(country: string | null | undefined): SkinId {
  return REGION[(country ?? "").toUpperCase()] ?? "studio";
}

/** A country from a browser language such as `es-DO`, for when the edge says nothing (a local server). */
export function countryFromLanguage(lang: string | null | undefined): string | null {
  const m = /^[a-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(lang ?? "");
  return m ? m[1].toUpperCase() : null;
}

/** Where a groove comes from matters: the first groove a country hears, within its skin. */
const LOCAL: Record<string, string> = {
  DO: "merengue",
  PR: "reggaeton",
  CU: "salsa",
  CO: "cumbia",
  MX: "cumbia",
  PA: "dembow",
  JM: "dancehall",
  HT: "kompa",
  GB: "dnb",
  IE: "dnb",
  ES: "house",
  PT: "house",
  IT: "house",
  FR: "house",
  GR: "house",
  CY: "house",
  MT: "house",
  NG: "afrobeats",
  ZA: "afrobeats",
  GH: "afrobeats",
};

/** The groove a visitor from `country` hears first in `skin`. */
export function grooveFor(skin: Skin, country: string | null | undefined): string {
  const local = LOCAL[(country ?? "").toUpperCase()];
  return local && (skin.genres.includes(local) || skinForCountry(country) === skin.id) ? local : skin.genres[0];
}

/**
 * The skin a style family belongs to, for when the guide hears what the
 * visitor plays (its `set_style` action names a genome node).
 */
const FAMILY_SKIN: Record<string, SkinId> = {
  edm: "club",
  electroswing: "club",
  house: "club",
  techno: "club",
  dnb: "club",
  trance: "club",
  mainstage: "club",
  hardstyle: "club",
  synthwave: "neon",
  lounge: "studio",
  latin: "tropical",
  bachata: "tropical",
  merengue: "tropical",
  dembow: "tropical",
  reggaeton: "tropical",
  salsa: "tropical",
  cumbia: "tropical",
  kompa: "tropical",
  dancehall: "tropical",
  soca: "tropical",
  urban: "urban",
  hiphop: "urban",
  rnb: "urban",
  afrobeats: "afro",
  party: "neon",
  pop: "neon",
  karaoke: "neon",
  classics: "urban",
  disco: "urban",
  rock: "urban",
  eighties: "neon",
  jazzage: "studio",
  schlager: "club",
  wedding: "studio",
};

export function skinForStyle(node: string): SkinId | null {
  return FAMILY_SKIN[node] ?? null;
}

/** The CSS custom properties a skin sets on the page. */
export function cssVars(s: Skin): Record<string, string> {
  const t = s.tokens;
  return {
    "--bg": t.bg,
    "--surface": t.surface,
    "--raised": t.raised,
    "--line": t.line,
    "--text": t.text,
    "--dim": t.dim,
    "--accent": t.accent,
    "--accent-2": t.accent2,
    "--on-accent": t.onAccent,
  };
}
