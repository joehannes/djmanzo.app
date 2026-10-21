/**
 * The visitor's own country, inside their region's look (the owner, 21
 * October: "style the website per region/continent/origin of the navigator
 * ... more deeply and detailed and delightfully").
 *
 * A skin is a region's (`src/v4/skins.ts`); this is the layer under it: a
 * welcome in the country's own words, the music its floors move to, and its
 * national colours, worn as a thin rule under the bar and a faint light over
 * the page, never more. Countries not listed see their region's look alone.
 * The country is the one the region already reads (the edge's, or an
 * address's `?country=`); nothing else about the visitor is.
 */

export interface Flavour {
  /** A welcome, in the country's language (or two, where two are spoken). */
  hello: string;
  /** What its floors move to, as a DJ there would say it. */
  scene: string;
  /** Its national colours, two or three. */
  colours: string[];
}

export const FLAVOURS: Record<string, Flavour> = {
  // The Caribbean and Latin America
  DO: { hello: "¡Bienvenido!", scene: "merengue, bachata and dembow", colours: ["#002D62", "#CE1126", "#FFFFFF"] },
  PR: { hello: "¡Bienvenido!", scene: "reggaeton, salsa and plena", colours: ["#ED0000", "#0050F0", "#FFFFFF"] },
  CU: { hello: "¡Bienvenido!", scene: "salsa, son and timba", colours: ["#002A8F", "#CF142B", "#FFFFFF"] },
  HT: { hello: "Byenvini!", scene: "kompa, rara and rasin", colours: ["#00209F", "#D21034"] },
  JM: { hello: "Wah gwaan!", scene: "dancehall, reggae and soca", colours: ["#009B3A", "#FED100", "#000000"] },
  TT: { hello: "Welcome!", scene: "soca, calypso and chutney", colours: ["#CE1126", "#000000", "#FFFFFF"] },
  CO: { hello: "¡Bienvenido!", scene: "cumbia, vallenato, salsa and reggaeton", colours: ["#FCD116", "#003893", "#CE1126"] },
  MX: { hello: "¡Bienvenido!", scene: "cumbia, banda and reggaeton", colours: ["#006847", "#FFFFFF", "#CE1126"] },
  PA: { hello: "¡Bienvenido!", scene: "reggae en español, dembow and salsa", colours: ["#DA121A", "#072357", "#FFFFFF"] },
  VE: { hello: "¡Bienvenido!", scene: "salsa, merengue and gaita", colours: ["#FFCC00", "#00247D", "#CF142B"] },
  PE: { hello: "¡Bienvenido!", scene: "cumbia, chicha and salsa", colours: ["#D91023", "#FFFFFF"] },
  AR: { hello: "¡Bienvenido!", scene: "cumbia, cuarteto and electrónica", colours: ["#74ACDF", "#FFFFFF", "#F6B40E"] },
  CL: { hello: "¡Bienvenido!", scene: "cumbia, reggaeton and minimal", colours: ["#D52B1E", "#0039A6", "#FFFFFF"] },
  BR: { hello: "Bem-vindo!", scene: "funk, sertanejo, forró and samba", colours: ["#009C3B", "#FFDF00", "#002776"] },
  // North America
  US: { hello: "Welcome!", scene: "hip-hop, R&B, house and EDM", colours: ["#3C3B6E", "#B22234", "#FFFFFF"] },
  CA: { hello: "Welcome · Bienvenue", scene: "hip-hop, house and EDM", colours: ["#D80621", "#FFFFFF"] },
  // Europe
  GB: { hello: "Welcome!", scene: "drum & bass, garage, grime and house", colours: ["#012169", "#C8102E", "#FFFFFF"] },
  IE: { hello: "Fáilte!", scene: "house, techno and trad", colours: ["#169B62", "#FFFFFF", "#FF883E"] },
  DE: { hello: "Willkommen!", scene: "techno, house and Schlager", colours: ["#000000", "#DD0000", "#FFCE00"] },
  AT: { hello: "Servus!", scene: "techno, house and Schlager", colours: ["#ED2939", "#FFFFFF"] },
  CH: { hello: "Grüezi · Bienvenue", scene: "techno and house", colours: ["#D52B1E", "#FFFFFF"] },
  NL: { hello: "Welkom!", scene: "house, techno, trance and hardstyle", colours: ["#AE1C28", "#FFFFFF", "#21468B"] },
  BE: { hello: "Welkom · Bienvenue", scene: "techno, house and new beat", colours: ["#000000", "#FAE042", "#ED2939"] },
  FR: { hello: "Bienvenue !", scene: "house, French touch and techno", colours: ["#0055A4", "#FFFFFF", "#EF4135"] },
  ES: { hello: "¡Bienvenido!", scene: "house, techno and reggaeton", colours: ["#AA151B", "#F1BF00"] },
  PT: { hello: "Bem-vindo!", scene: "house, kizomba and kuduro", colours: ["#006600", "#FF0000"] },
  IT: { hello: "Benvenuto!", scene: "house, Italo disco and techno", colours: ["#009246", "#FFFFFF", "#CE2B37"] },
  GR: { hello: "Kalós írthes!", scene: "house and laïká", colours: ["#0D5EAF", "#FFFFFF"] },
  PL: { hello: "Witaj!", scene: "techno and disco polo", colours: ["#FFFFFF", "#DC143C"] },
  SE: { hello: "Välkommen!", scene: "house and pop", colours: ["#006AA7", "#FECC00"] },
  // Africa
  NG: { hello: "Welcome · Ẹ káàbọ̀", scene: "afrobeats, highlife and amapiano", colours: ["#008751", "#FFFFFF"] },
  GH: { hello: "Akwaaba!", scene: "afrobeats, highlife and hiplife", colours: ["#CE1126", "#FCD116", "#006B3F"] },
  ZA: { hello: "Welcome · Siyakwamukela", scene: "amapiano, gqom and house", colours: ["#007A4D", "#FFB612", "#DE3831"] },
  KE: { hello: "Karibu!", scene: "gengetone, benga and afrobeats", colours: ["#006600", "#BB0000", "#000000"] },
  // North Africa and the Middle East
  EG: { hello: "Ahlan wa sahlan!", scene: "mahraganat, shaabi and house", colours: ["#CE1126", "#FFFFFF", "#000000"] },
  MA: { hello: "Marhaba!", scene: "chaabi, gnawa and raï", colours: ["#C1272D", "#006233"] },
  AE: { hello: "Marhaba!", scene: "Arabic pop, house and afro house", colours: ["#00732F", "#FF0000", "#000000"] },
  // Asia and the Pacific
  IN: { hello: "Namaste!", scene: "Bollywood, bhangra and EDM", colours: ["#FF9933", "#FFFFFF", "#138808"] },
  JP: { hello: "Yōkoso!", scene: "city pop, techno and J-pop", colours: ["#BC002D", "#FFFFFF"] },
  KR: { hello: "Hwanyeong-hamnida!", scene: "K-pop, house and hip-hop", colours: ["#CD2E3A", "#0047A0", "#FFFFFF"] },
  PH: { hello: "Mabuhay!", scene: "OPM, budots and EDM", colours: ["#0038A8", "#CE1126", "#FCD116"] },
  ID: { hello: "Selamat datang!", scene: "dangdut, funkot and EDM", colours: ["#FF0000", "#FFFFFF"] },
  TH: { hello: "Sawasdee!", scene: "luk thung, mor lam and EDM", colours: ["#A51931", "#F4F5F8", "#2D2A4A"] },
  AU: { hello: "G'day!", scene: "drum & bass, house and techno", colours: ["#00008B", "#FF0000", "#FFFFFF"] },
  NZ: { hello: "Kia ora!", scene: "drum & bass, reggae and house", colours: ["#00247D", "#CC142B", "#FFFFFF"] },
};

/** The visitor's country's flavour, or null. */
export function flavourOf(country: string | null | undefined): Flavour | null {
  return FLAVOURS[(country ?? "").toUpperCase()] ?? null;
}
