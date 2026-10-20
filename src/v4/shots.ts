/**
 * Screenshots of the real application (only from `docs/screenshots/`, via
 * `shared/shots.json`), chosen for the visitor's skin: a screen shown in one
 * of the skin's djmanzo themes if it was pictured in one, best match first,
 * else in djmanzo's own look.
 */

import { HOME_THEME, SHOTS, type Shot } from "../signal/shots";

export function pick(screen: string, themes: string[], list: Shot[] = SHOTS): Shot | null {
  const of = list.filter((s) => s.screen === screen);
  if (!of.length) return null;
  for (const t of themes) {
    const hit = of.find((s) => s.theme === t && !s.skin) ?? of.find((s) => s.theme === t);
    if (hit) return hit;
  }
  return of.find((s) => s.theme === HOME_THEME && !s.skin) ?? of[0];
}
