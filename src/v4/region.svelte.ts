/**
 * Which skin the visitor sees, and why: their own choice if they made one
 * (kept in this browser), else where their connection comes from, else
 * their browser's language. A preview address can force either
 * (`?skin=tropical`, `?country=DO`), which is how the screenshots are made.
 */

import { SKIN_BY_ID, countryFromLanguage, grooveFor, skinForCountry, type SkinId } from "./skins";

const KEY = "djmanzo.v4.skin";

export const region = $state<{ country: string | null; skin: SkinId; chosen: boolean; by: "choice" | "connection" | "language" | "address" | "none" }>({
  country: null,
  skin: "studio",
  chosen: false,
  by: "none",
});

/** Settle the skin once the edge's country is known (from the catalogue). */
export function settle(edgeCountry: string | null) {
  const q = new URLSearchParams(location.search);
  const forcedSkin = q.get("skin") as SkinId | null;
  const forcedCountry = q.get("country");
  const country = (forcedCountry || edgeCountry || countryFromLanguage(navigator.language))?.toUpperCase() ?? null;
  region.country = country;
  let saved: SkinId | null = null;
  try {
    saved = localStorage.getItem(KEY) as SkinId | null;
  } catch {
    // A private window keeps nothing; the skin still follows the connection.
  }
  if (forcedSkin && SKIN_BY_ID[forcedSkin]) {
    region.skin = forcedSkin;
    region.by = "address";
  } else if (saved && SKIN_BY_ID[saved]) {
    region.skin = saved;
    region.chosen = true;
    region.by = "choice";
  } else {
    region.skin = skinForCountry(country);
    region.by = forcedCountry ? "address" : edgeCountry ? "connection" : country ? "language" : "none";
  }
}

export function choose(id: SkinId) {
  region.skin = id;
  region.chosen = true;
  region.by = "choice";
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Not kept; it still applies now.
  }
}

/** Forget the choice and follow the connection again. */
export function follow() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing was kept.
  }
  region.chosen = false;
  region.skin = skinForCountry(region.country);
  region.by = region.country ? "connection" : "none";
}

export const skin = () => SKIN_BY_ID[region.skin];
export const groove = () => grooveFor(SKIN_BY_ID[region.skin], region.country);

/** The skin's photographs, in `public/v4/art/`. */
export const art = (name: "hero" | "crowd" | "gear", id: SkinId = region.skin) => `/v4/art/${id}-${name}.webp`;
export const shared = (name: string) => `/v4/art/${name}.webp`;
