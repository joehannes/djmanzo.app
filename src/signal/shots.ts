/**
 * Pictures of the real application for a stage's reveal and the guide.
 *
 * The owner's rule (§134): screenshots come only from `docs/screenshots/`,
 * named `<screen>--<theme>[--<skin>].png`. `npm run shots` turns that folder
 * into `public/shots/app/` and `shared/shots.json`, with each picture's
 * caption from the folder's README. A stage asks for screens; one shown in
 * the visitor's own theme (and skin) is preferred, then the application's
 * own look.
 */
import index from "../../shared/shots.json";

export interface Shot {
  src: string;
  /** The `<screen>` part of the file name: `dig`, `mix`, `karaoke`, … */
  screen: string;
  /** The theme's name as the application's picker shows it. */
  theme: string;
  /** The skin worn over the theme, by the picker's name, if any. */
  skin: string | null;
  /** What the picture shows, from the folder's README. */
  shows: string;
  alt: string;
  width: number;
  height: number;
}

export const SHOTS: Shot[] = index;

/** The look djmanzo starts in: the one to show when the visitor's own is not pictured. */
export const HOME_THEME = "Organic Base";

/** How well a picture fits a visitor dressed in `theme` and `skin`: their look first, then no skin, then djmanzo's own. */
function fit(s: Shot, theme: string, skin: string | null): number {
  const theirs = s.theme === theme;
  return (theirs ? 8 : 0) + (theirs && s.skin === skin ? 4 : 0) + (s.skin ? 0 : 2) + (s.theme === HOME_THEME ? 1 : 0);
}

/** The best picture for a stage: any of its screens in the visitor's look, else its first screen that is pictured. */
export function shotFor(screens: string[], theme: string, skin: string | null = null): Shot | null {
  let best: Shot | null = null;
  let bestFit = -1;
  // In the stage's order, so of two that fit as well the earlier screen is shown.
  for (const screen of screens) {
    for (const s of SHOTS) {
      if (s.screen !== screen) continue;
      const f = fit(s, theme, skin);
      if (f > bestFit) [best, bestFit] = [s, f];
    }
  }
  return best;
}
