/**
 * Pictures of the real application for a stage's reveal.
 *
 * The owner's rule (§133): screenshots come from `docs/screenshots/`, named
 * `<screen>--<theme>[--<skin>][--<state>].png`. Until that folder fills,
 * these — taken from the running application earlier — stand in, each named
 * the same way, and the reveal says which theme it shows. A stage asks for
 * screens; the visitor's own theme is preferred.
 */

export interface Shot {
  src: string;
  screen: string;
  /** The theme package's name as the application's picker shows it, when the picture was taken in a chosen theme. */
  theme: string | null;
  alt: string;
}

export const SHOTS: Shot[] = [
  { src: "/shots/cockpit.webp", screen: "cockpit", theme: null, alt: "djmanzo's cockpit: two decks, their waveforms, the mixer between them" },
  { src: "/shots/techno.webp", screen: "cockpit", theme: "Industrial Techno", alt: "djmanzo in the Industrial Techno theme, two decks playing" },
  { src: "/shots/bachata.webp", screen: "cockpit", theme: "Bachata Rosa", alt: "djmanzo in the Bachata Rosa theme" },
  { src: "/shots/malecon.webp", screen: "cockpit", theme: "Malecón Night", alt: "djmanzo in the Malecón Night theme" },
  { src: "/shots/bay.webp", screen: "cockpit", theme: "Bioluminescent Bay", alt: "djmanzo in the Bioluminescent Bay theme" },
  { src: "/shots/neon.webp", screen: "cockpit", theme: "Karaoke Neon", alt: "djmanzo in the Karaoke Neon theme" },
  { src: "/shots/bachata-next.webp", screen: "next", theme: "Bachata Rosa", alt: "The Next rail: records that would follow the one playing, each with its reasons" },
  { src: "/shots/karaoke.webp", screen: "karaoke", theme: null, alt: "The Singers panel beside the decks: the queue, break music between singers, the quiz, singers from their phones" },
  { src: "/shots/palette.webp", screen: "palette", theme: null, alt: "The command palette: every verb djmanzo understands" },
];

/** The best picture for a stage: one of its screens, in the visitor's theme if there is one. */
export function shotFor(screens: string[], theme: string): Shot | null {
  // In the order the stage names its screens, then the visitor's theme first.
  for (const screen of screens) {
    const fits = SHOTS.filter((s) => s.screen === screen);
    const pick = fits.find((s) => s.theme === theme) ?? fits[0];
    if (pick) return pick;
  }
  return null;
}
