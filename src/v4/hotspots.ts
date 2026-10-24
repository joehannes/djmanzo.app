/**
 * What to point at on each screenshot: a few numbered spots, each with a
 * name and a sentence, placed by percent of the picture (every screenshot is
 * 1600 × 900, and an activity's arrangement is the same in every theme, so
 * a spot lands on the same control whichever theme the visitor sees).
 *
 * Placed by looking at `docs/screenshots/screens/*--organic-base.png`; the
 * words say only what the facts say (`shared/facts.ts`).
 */

export interface Spot {
  /** Percent of the picture's width and height. */
  x: number;
  y: number;
  title: string;
  text: string;
}

/** The top bar and the decks, the same on every screen that shows the decks. */
const BAR: Spot[] = [
  { x: 48.4, y: 3.1, title: "The launcher (0)", text: "Every view one key away: activities, guides, panels, presets, themes and workspaces." },
  { x: 58.8, y: 3.1, title: "Space: the mnemonic keys", text: "Press Space for a guide to every key; sequences read as words — Space d 1 p is deck 1 play." },
  { x: 69.3, y: 3.1, title: "SAFE", text: "One press takes every control back, clears every effect and flattens the sound." },
  { x: 90.5, y: 3.1, title: "The whisper line", text: "What cannot wait — here, the two decks 5.2 % apart — proposed with a button. It never acts by itself." },
];

const DECK: Spot[] = [
  { x: 29, y: 12, title: "What the record does next", text: "Settles in 18 bars, builds in 18: phrases, builds, drops and breakdowns found by the analysis and marked on the waveform." },
  { x: 8, y: 26.8, title: "Stems", text: "Vocals, drums, bass and the rest, separated ahead of the playhead: one press mutes a part, a scroll across fades it." },
  { x: 17, y: 34.2, title: "Hot cues and pad pages", text: "Eight cues with names and colours; the row above switches the pads to loops, rolls, the slicer, the sampler and effects." },
];

export const SPOTS: Record<string, Spot[]> = {
  perform: [
    ...BAR.slice(0, 3),
    ...DECK,
    { x: 8, y: 52.2, title: "Slip, brake and spin", text: "The performance moves on the deck itself, with beat jump and loops just above." },
    { x: 82, y: 12.3, title: "The sampler", text: "Banks of pads — one-shot, loop, hold, stutter — synced to the master tempo, and recorded from a deck." },
    { x: 10.5, y: 95, title: "Crossfader and curve", text: "Smooth, linear or sharp; the law drawn under the fader is the one in force." },
  ],
  karaoke: [
    BAR[2],
    { x: 76, y: 15.5, title: "The singers", text: "A name, a song from your music — or Can't name it? to find it from what they remember — and the rotation is built." },
    { x: 79, y: 26.1, title: "As recorded · Guide · Out", text: "For each deck: the record's own voice, a little of it left in to follow, or taken out." },
    { x: 80, y: 33.3, title: "Break music", text: "A playlist plays between singers and leads into the next song." },
    { x: 79, y: 47.5, title: "A quiz from your records", text: "Name it, backwards, chipmunk, stems coming in, finish the line — answered from phones." },
    { x: 78, y: 59.3, title: "Singers from their phones", text: "A QR code puts the room in the queue; nothing plays until you load it." },
    { x: 77, y: 82.5, title: "A microphone each", text: "A vocal chain for every input — gate, EQ, compressor, de-esser, echo and room — and words timed by listening." },
    { x: 8, y: 26.8, title: "The voice, as a stem", text: "The vocal is a part of the record like the drums: that is how it is taken out, or left in as a guide." },
  ],
  autopilot: [
    BAR[3],
    { x: 84, y: 15.7, title: "I'll take it / You take it back", text: "Hand the night to the autopilot, and take it back the moment a hand touches a control." },
    { x: 79, y: 30.5, title: "How much it does", text: "Off, watch, suggest, prepare, assist or autopilot: offers with reasons, or the whole mix." },
    { x: 83, y: 76, title: "What could come next", text: "Ranked by key, tempo, loudness and phrase, each with its reasons and the mix it would make." },
    { x: 30, y: 71, title: "The room", text: "A camera and a microphone say whether the floor is stiller or busier than earlier tonight, with how sure they are." },
    ...DECK.slice(0, 1),
  ],
  dig: [
    { x: 7, y: 66, title: "Find it", text: "History, the journal, requests, from memory and duplicates beside your playlists, crates and smart folders." },
    { x: 40, y: 68.4, title: "One search", text: "Instant, typo-tolerant, across the collection — and online sources where the edition has them." },
    { x: 49, y: 79, title: "Tempo and key", text: "BPM and key on the Camelot wheel, read from every record once, in the background." },
    { x: 83, y: 22, title: "Next, with reasons", text: "+6 BPM · 8A · level · a 32-beat blend at 2:17: what each candidate would ask of the mix." },
    ...BAR.slice(1, 3),
  ],
  prepare: [...DECK, ...BAR.slice(0, 2)],
  practice: [
    { x: 30, y: 72, title: "Live, in your headphones", text: "Loop a record, take its stems apart and try an effect — only you hear it, and nothing touches the decks." },
    { x: 22, y: 9, title: "The night goes on", text: "The set keeps playing on the decks while you practise." },
    BAR[2],
  ],
  event: [
    { x: 84, y: 12, title: "A night prepared, step by step", text: "The event, the music, the running order, what to do if it goes wrong — kept as you type." },
    { x: 8, y: 68, title: "The set plan", text: "Rising, journey, flat or descent; how long; what to keep out — built from your collection." },
    BAR[0],
  ],
  requests: [BAR[0], BAR[2]],
  mix: [...BAR, ...DECK],
  launcher: [
    { x: 50, y: 11, title: "Activities, on number keys", text: "Dig, Mix, Perform, Prepare, Requests, Autopilot, Practice, Karaoke, Event — 1 to 9." },
    { x: 30, y: 18, title: "Guides", text: "Next record, the mix, the energy of the night, a request waiting, if something goes wrong." },
    { x: 9, y: 40, title: "Panels", text: "Every panel, to dock beside the decks or pop out into a window of its own." },
    { x: 25, y: 33, title: "Presets", text: "One gesture for a moment of the night: Warm up, Peak, Close — and Open microphones before the first singer." },
    { x: 41, y: 50, title: "Themes", text: "Palettes for rooms and genres, Caribbean ones among them; and your own from the look studio." },
    { x: 58, y: 50, title: "Workspaces", text: "Beginner to 6 Deck, Mobile DJ, Latin / Caribbean, Scratch, Stem Performance — and boards of your own." },
  ],
  keys: [
    { x: 32.5, y: 75.5, title: "Space opens the guide", text: "Every key from here, one word at a time; groups end in ›, and Backspace goes back a step." },
    { x: 46, y: 89.5, title: "Groups that read as words", text: "Deck, Stems, Mixer, Record, Open a panel, Dashboard, Theme, Workspace, Preset." },
    { x: 54, y: 82, title: "Activities on the numbers", text: "Perform, Prepare, Requests, Autopilot, Practice, Karaoke, Event — one digit each." },
    { x: 27.4, y: 97.3, title: "The shortcuts beside it", text: "Ctrl K finds anything, Ctrl F searches the library, Ctrl / lists every key." },
  ],
  mykeys: [
    { x: 68.4, y: 15, title: "Everything else is under Space", text: "The guide shows every key from there; the number keys switch activities." },
    { x: 68.4, y: 25.5, title: "Your own keys", text: "Press the keys, say what they do — deck 1 loop 8, library — and give them a name in the guide." },
    { x: 68.4, y: 37.5, title: "Keyboard sets to wear", text: "Karaoke host, Scratch, Open format, One hand — and more from the marketplace — laid under your own keys." },
    { x: 68.4, y: 46.3, title: "Save yours as a set", text: "Your keys as a set of their own, to keep or to share as a pack." },
    { x: 68.4, y: 66, title: "The performance keyboard", text: "The keys pressed without Space — hot cues, jumps, loops — with the same file format as a controller's mapping." },
  ],
  // Each just right of the control it names (measured on the 1600 × 900 pictures, the same in every theme).
  lighting: [
    { x: 79.3, y: 12.2, title: "Send to the lights", text: "Off until you say so; Blackout beside it." },
    { x: 86.8, y: 17.1, title: "Auto, pulse, chase, wash", text: "Auto changes look only at a phrase; no strobe." },
    { x: 84.4, y: 23.7, title: "Brightness and colours", text: "How bright, and in which colours, the lights follow the music." },
    { x: 96.6, y: 37.2, title: "Art-Net or sACN", text: "To a node's address or to everything on the network; frames a second chosen for the rig." },
  ],
  playlist: [
    { x: 18, y: 74.3, title: "The deck's own playlist", text: "Any playlist, under the deck it plays on: a press loads a record, ▶ loads and plays it." },
    { x: 37.5, y: 70.6, title: "Next when this ends · Repeat", text: "Ticked, the deck goes on by itself and round again — a filler deck while you look after the room." },
    { x: 47.5, y: 70.6, title: "Shuffle", text: "Every record once a round, in an order of its own." },
    { x: 20, y: 81, title: "Tempo and key of each", text: "What is next, its tempo, key and length, at a glance." },
  ],
  palette: [{ x: 50, y: 20, title: "One search for everything", text: "Any record, panel, preset, theme or action, typo-tolerant: Ctrl or Cmd + K." }],
  guides: [{ x: 74, y: 3.1, title: "The guides", text: "One per topic, from the assistant: the next record, the mix, the night, a request waiting." }],
};

/** Part of a screenshot, in percent of its width and height, from its top left. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Where a screen's subject is, for a picture whose subject is a panel and not
 * the whole window: shown enlarged by default (the owner, 21 October:
 * "bigger, more insightful screenshots"), with the whole window a press away.
 * Measured on the 1600 × 900 screenshots, which every theme shares.
 */
export const FOCUS: Record<string, Region> = {
  // The Keys panel down the right, as far as its keyboard map; its spots sit
  // in the gutter just left of it, so none covers a word.
  mykeys: { x: 66.5, y: 5.5, w: 33.5, h: 65 },
  // The Lights panel, top right.
  lighting: { x: 69, y: 5.5, w: 31, h: 46.5 },
  // Deck 1 above its playlist drawer: Karaoke Favourites, going round.
  playlist: { x: 0, y: 56, w: 50.5, h: 31 },
  // The guide that opens on Space, along the bottom.
  keys: { x: 26, y: 72.5, w: 46, h: 27.5 },
};
