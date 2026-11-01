# Remaking the deck's loops and the booth's sounds with Suno

`PROMPTS.md` holds twelve prompts: ten songs that carry the deck's 57 genres, and two
that carry the booth's 89 sounds. Each song is built to a fixed grid, so cutting it
needs no listening and no analysis:

- **Loops.** Each song keeps one tempo and runs its sections back to back from 0:00,
  each the same number of bars (16 below 120 BPM, 24 from 120). `cut-loops.sh`
  cuts every section by arithmetic (a bar is 240/BPM seconds) into
  `masters/<genre>/<genre>.flac`, and the loop itself (8 or 16 whole bars from 4 bars
  in, the length the deck uses at that tempo) into `loops/<genre>.wav`.
- **Sounds.** Both songs run at 60 BPM with one sound on the first beat of each bar,
  so sound *k* is in seconds 4(k−1) to 4k. `cut-fx.sh` cuts each slot, trims its
  silence, fades both ends so it never clicks, evens the loudness and writes
  `sampler/<id>.m4a` and `sampler/<id>.webm`, named by the booth's own ids.

If Suno put anything before the first section or bar, that song's `OFFSET` in the
script's table moves its whole grid. Both scripts were run on stand-in audio with a
different tone in every section and slot: every cut came from its own section or slot,
every loop was its exact number of bars, and every sound was trimmed to its tone.

**What remains after the cut.** The deck plays each genre as three parts (drums, bass,
the rest) that switch off and on: `tools/loops/make_loops.py` makes them from
`masters/`, measuring the beat itself rather than trusting the tempo asked for
(`genres.json` holds each genre's tempo and key for its jobs). The booth plays its
sounds made in the browser today (`src/v4/booth/sounds.ts`); it is to play a recorded
sound where `sampler/<id>` has one and keep its own where not, and to gain the new
occasions below. The deck's credit line names the music's maker, and changes with it.

**New occasions** (eight pads each, new sounds in bold):

| Occasion | Pads |
|---|---|
| Birthday | **partyhorn**, **balloonpop**, **candleblow**, **kazoo**, **cheer**, confetti, drumroll, applause |
| New Year's Eve | **countdown**, **midnight**, fireworks, champagne, partyhorn, cheer, gong, sparkle |
| Carnival | **apito**, **surdo**, **repinique**, **cuica**, **steelpan**, agogo, cowbell, airhorn |
| Stadium night | **stadiumhorn**, **buzzer**, **organcharge**, **crowdchant**, whistle, drumroll, clap, boom |
| Karaoke night | **rimshot**, **ding**, **wrong**, **ooh**, applause, drumroll, kazoo, sparkle |
| Halloween | **thunder**, **creak**, **howl**, **organhit**, **chains**, **heartbeat**, gong, riser |
| Lunar New Year | **firecrackers**, **liondrum**, **chacymbal**, **guzheng**, gong, coin, sparkle, fireworks |

The site's own small sounds (needle, scratch, cue click, rewind, riser, microphone tap,
cheer) come along as `ui-…`.
