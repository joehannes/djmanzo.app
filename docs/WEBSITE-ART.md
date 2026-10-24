# The website's art: the Signal Path

The owner's direction for the website's second iteration (DIRECTIVE §139):
not flat and comic, but painted and musical; a guided journey rather than a
catalogue; a game map that morphs into game screens; styles that come from
the music a visitor plays, hierarchically (EDM, then Electro swing); real
photographs, assembled "like a puzzle masterpiece of art — mysterious,
energetic, refreshing and punch line abstract summarising revealing". This
page is how that is drawn. [WEBSITE.md](WEBSITE.md) is how the site works.

## The metaphor

Sound travels from a groove, through a needle and a mixer, to an amplifier,
through a speaker cone into the air and into bodies on a floor. The website
is that journey, in ten stages (`website/src/stages/script.ts`):

| Stage | Night | What it reveals |
|---|---|---|
| Silence | Doors | The guide, and you |
| Groove | Warm-up | The collection |
| Needle | Warm-up | Reading the music: waveforms, phrases, key, stems |
| Cue | Warm-up | The headphones: the assistant, the practice deck, the teacher |
| Confluence | Build | The decks and the mixer |
| Voice | Build | Karaoke — the second input |
| Amp | Peak | The editions and the box office |
| Cone & air | Peak | Visuals, video, recording, going live |
| Floor | Release | Reading the room |
| Afterglow | Sunrise | The reveal, the pass, the poster |

Beside the main line, as on a mixing desk, are sends that return to it: the
**Outboard** (the marketplace), **Talkback** (the discussion space),
**Transmission** (the blog), **Spectrum** (honest comparisons) and the
**Request line** (the wishlist).

The map is a painted macro landscape of real equipment: from far away,
groove ridges are hills, the mixer a city grid, a speaker cone a crater
lake; up close, each is the real object. One line of light — the signal —
runs through it, drawn the way djmanzo draws a deck: as water
([VISUAL-LANGUAGE.md](VISUAL-LANGUAGE.md)). At Afterglow the camera pulls back
and the landscape is revealed as a DJ's setup, and the path the visitor
took through it becomes their constellation.

## Every screen has four beats

1. **Mystery.** One abstract line over a painting, before anything is
   explained ("Two rivers never meet by accident.").
2. **Reveal.** The real application doing it — the owner's demo videos and
   the screenshots in [`screenshots/`](screenshots/), never a mock-up — and
   one honest fact, taken from `website/shared/facts.ts`.
3. **Play.** Something for the hands that is about music and art, never a
   pretend djmanzo: scrub a needle through a genre's history, let two
   painted streams meet, sing to make the scene move.
4. **Pass it on.** The next stage, or the poster.

## Painting with photographs

Every scene is assembled from photographs — the owner's own first, then
licensed ones — set as planes at depth, so a scene is a collage with
parallax. One shader chain makes them a single painted world:

- **Anisotropic Kuwahara** for the brush: strokes that follow the image's
  edges. Its radius is the style's `brush.radius`, and it is **large while
  the camera travels and falls as it arrives** — the painting resolves, and
  that is the transition between map and screen.
- **A gradient map** from the style's palette, so every photograph takes the
  room's colours.
- **Grain** (paper or film, `brush.grain`) and **a flow field**
  (`brush.flow`) that bends the strokes: radial for a festival, horizontal
  film lines for the jazz age, a spray-paint cross for a block party.
- **Bloom** on what the style says glows.

Photographs of people are used only with their consent; crowds stay
silhouettes.

## The style genome

What a style looks, sounds, dresses and moves like is data
(`website/src/style/genome/`), and a child names only what it changes. The
three paths written in depth:

| | EDM | Electro swing (EDM's rig through Art Deco) |
|---|---|---|
| Palette | Neon cyan, magenta and acid green on black | Gold, oxblood and cream on black — one EDM cyan kept |
| Type | Orbitron | Limelight, with Josefin Sans |
| Light | Lasers, LED walls, moving heads | Brass spotlights, chandeliers, a projector's slow flicker |
| Room | Scaffolding, LED tunnels | A speakeasy: velvet, gramophones, a cabaret stage |
| Clothes | Festival wear, reflective fabric | 1920s-inspired, not costume: fringe, pinstripes, suspenders |
| Dance | Shuffle, hands up | Charleston, Lindy Hop, Balboa, the Shim Sham |
| Motion | Four on the floor, `power2.inOut` | Swung, a little overshoot (`back.out`) |
| The cone | A line-array tower and a laser fan | A gramophone horn the size of a door |
| djmanzo look | Club + Halftone | Velvet |

| | Latin & Caribbean | Bachata |
|---|---|---|
| Palette | Coral, mango and sea green on deep plum | Rose, gold and wine |
| Room | A colmado terrace, string lights, a speaker tower | One red bulb, a speaker on the step |
| Dance | Partner dances, everyone from grandmother to kids | Three steps and a tap; Dominican footwork |
| Motion | The tresillo, `sine.inOut` | Four, with the tap |
| djmanzo look | Latin + Papel picado | Bachata Rosa + Palm shadows |

| | Urban | Hip-hop |
|---|---|---|
| Palette | Yellow, red and blue on black brick | The same, from a mixtape cover |
| Room | Brick walls, crates, a speaker stack | A block party in a park, 1973 |
| Dance | Breaking, popping, locking, the cypher | Toprock, footwork, freezes |
| Motion | Half time, hard stops (`power3.out`) | Swung, cut on the one |
| djmanzo look | Scratch | Scratch |

Every family and genre carries its **complements** — the good things beside
the music: morning raves, dance classes, running clubs, cooking the food of
the party, breaking as a sport, crate digging. Excess is never part of a
style. Roots and places are told as history; nothing on the site guesses
who a visitor is from where they are.

Each style names the djmanzo theme and skin that suit it, and a test holds
every pair to what the application ships and will wear together
(`website/test/genome.test.ts`), so the screenshot a stage shows is the
visitor's own look.

## Motion and sound

- **Motion has a musical reason**: the style's pulse sets what moves on the
  beat, and its easing sets how things arrive. Nothing flashes: no strobes,
  ever; and with reduced motion the site is a gallery of still paintings
  that cross-dissolve.
- **Sound is the owner's own loops** (made in Suno on a paid plan), four
  per path in one key and tempo, crossfaded on bar lines as the visitor
  moves through the night. Nothing plays before the visitor's first gesture.

## Sources

The research behind the genome — the scenes' histories, the personality
research that may shape mood and motion but never labels people, the
complements — is cited in each node's `sources`.

## How it is built

The painting is **three.js on WebGL2 with hand-written GLSL** — the Kuwahara
pass, the gradient map, the bristles and the grain are one fragment shader
(`website/src/signal/world/painter.ts`). WebGPU with three.js's node
materials, Threlte and GSAP were considered and set aside for now: WebGL2
runs everywhere the site is shown, and under the software renderer this
repository's browser tests draw with, so every change to the painting is
looked at before it ships. The moves are small tweens of the engine's own
(`world/tween.ts`). The quality tier is guessed from the renderer the
browser reports and lowered if frames stay slow — nothing is fetched to
decide it. No new dependency was added for any of this.

The second iteration was the site at `/` until 20 October; it is now at
**`/signal/`**, the professional site (the fourth) having taken `/`. The island, the first, stays at
**`/island/`** for what the path does not yet hold (the pass, the blog, the
wishlist, Backstage).

## The visitor's night

Where the visitor allowed it (WEBSITE.md, "The guide, and what the site may
know about a visitor"), the painting takes their night:

- **The hour** — the sun's real height where they are (`sense/sun.ts`), or
  their clock where they shared no place — tints the light: a cool night, a
  warm edge of the day, a plain day, and a little more or less of it.
- **The sky** over them paints over the picture like weather on a window:
  rain running down the glass, snow drifting, a fog that lifts the darks.
  Thunder is rain with more fog — **never a flash**, as above.
- **Afterglow** says when the sun rises where they are.
- **The constellation** (`poster/`) is the visitor's night as a print: each
  stage they walked a star where it lies on the map, joined in the order the
  signal runs, under their music's lineage and, if they shared it, their
  town and sky. It is made in the browser and kept or shared from there.

With reduced motion the weather and the grain hold still.
