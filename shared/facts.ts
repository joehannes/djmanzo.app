/**
 * Everything the website says djmanzo does, and where it says so.
 *
 * The owner's rule (DIRECTIVE §134): no page, guide or article may say
 * anything wrong or outdated about the application. So nothing on the site
 * — a stage, the box office, the guide, a blog draft — describes the
 * application from memory: it reads this list. Each entry names the module
 * that carries it (`editions.json`, from `dj_core::edition`), whether it is
 * shipped, part-built or planned, and the document that says so.
 *
 * `CHECKED_AGAINST` is the commit of `main` the list was last read against.
 * `npm run facts:drift` prints every change to those documents since then;
 * read it, correct this file, and move the commit forward before a deploy.
 *
 * Statuses are the documents' own. Where FEATURES §2 ("Beyond VirtualDJ")
 * speaks in the present tense about something §4 ("Outlook") plans — Pro DJ
 * Link, StagelinQ, Art-Net — the plan is what is true, and this list says
 * planned.
 */

import { BUY_ONCE, CHEAPEST_WITH, type Edition, type Module } from "./catalog";

export const CHECKED_AGAINST = "fdf04ce068aa9f37b71bdcaef22b8763811462a3";

/** The documents a fact can come from, as `git diff` names them. */
export const SOURCES = ["README.md", "docs/FEATURES.md", "docs/EDITIONS.md", "docs/MARKETPLACE.md", "docs/VIDEO.md", "docs/KARAOKE-NIGHT.md", "docs/LOOK-SPEC.md"] as const;

export type Status = "shipped" | "part" | "planned";

/** Where on the Signal Path a fact is told. */
export type Stage = "groove" | "needle" | "cue" | "confluence" | "voice" | "amp" | "cone" | "floor" | "afterglow" | "outboard";

export interface Fact {
  id: string;
  name: string;
  /** One or two sentences a DJ would understand, no further than the source goes. */
  about: string;
  /** The module that carries it, or the foundation every edition has. */
  module: Module | "foundation";
  /** Other modules that carry it too: any one of them is enough (`dj_app::gate`'s "any of"). */
  also?: Module[];
  status: Status;
  /** What the source itself says has not been proved. Shown wherever the fact is. */
  caveat?: string;
  stage: Stage;
  /** Document and section. */
  source: string;
}

export const FACTS: Fact[] = [
  // --- The foundation: every edition -------------------------------------------
  { id: "decks", name: "Two decks and the mixer", about: "Play, cue, sync, keylock, a pitch fader over ±16 %, channel faders and a crossfader with A / thru / B assignment, three-band EQ with kills, a filter, gain from loudness analysis, headphone cue, booth out and a limiter.", module: "foundation", status: "shipped", caveat: "The pitch range cannot yet be changed from ±16 %, and the crossfader's curve cannot yet be chosen.", stage: "confluence", source: "FEATURES §1 Decks, Mixer" },
  { id: "transport", name: "Slip, reverse, brake and backspin", about: "The performance moves on the deck itself, with quantize and beat jump.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Decks" },
  { id: "pads", name: "Cues, loops and pads", about: "Eight hot cues, loops by beat count, loop rolls down to 1/16, a slicer, and pad pages for cues, loops, rolls, saved loops, the sampler and effects.", module: "foundation", status: "shipped", caveat: "Hot cues cannot yet be named or coloured.", stage: "confluence", source: "FEATURES §1 Cues, loops, pads" },
  { id: "fx", name: "The effects rack", about: "Echo, delay, reverb, gate, crush, flanger, phaser and filter — beat-synced, three slots per deck and on the master, with chain presets.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Effects" },
  { id: "sampler", name: "The sampler", about: "Banks of pads — one-shot, loop, hold, stutter — synced to the master tempo, and recorded from a deck.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Sampler" },
  { id: "record", name: "Recording the master", about: "The set to disk, as a WAV.", module: "foundation", status: "shipped", stage: "cone", source: "FEATURES §1 Output" },
  { id: "library", name: "The library", about: "Folders, playlists, crates and smart folders; imports from rekordbox, Traktor and iTunes with their cues and grids, and from Serato with its crates, hot cues and loops; duplicates found; instant search; the collection as cards with their own artwork.", module: "foundation", status: "shipped", stage: "groove", source: "FEATURES §1 Browser and library" },
  { id: "camelot", name: "Key and tempo, read", about: "BPM, key on the Camelot wheel with compatible keys, loudness, and 31 genre families across Latin America, North America, Europe, Africa and beyond.", module: "foundation", status: "shipped", stage: "needle", source: "FEATURES §1 Browser; §1 Genre families" },
  { id: "waveforms", name: "Waveforms drawn in Rust", about: "Scrolling and overview waveforms with an editable beat grid, cue and loop overlays and colour by band, rendered in Rust so they stay fast on Linux.", module: "foundation", status: "shipped", stage: "needle", source: "FEATURES §1 Waveforms; README Stack" },
  { id: "phrases", name: "Phrases", about: "Phrase length and anchor found in the record, marked on the waveform, with phrase-locked loops and jumps.", module: "foundation", status: "shipped", caveat: "Verified against synthetic tracks, not yet measured against a corpus of real records.", stage: "needle", source: "FEATURES §1 Phrase detection" },
  { id: "find", name: "Find it from memory", about: "A half-remembered line, a description, or a hum.", module: "assistant", also: ["karaoke"], status: "shipped", caveat: "The hum has never been tried with a real microphone, and finds only records already in the collection; only a description can name a record not owned.", stage: "groove", source: "FEATURES §1 Find it from memory; dj_app::gate" },
  { id: "keyboard", name: "The keyboard is a controller", about: "The same vocabulary and file format as a MIDI mapping, so a laptop with nothing plugged in is a playable instrument.", module: "foundation", status: "shipped", stage: "confluence", source: "README For the hands" },
  { id: "mapped", name: "A controller on its shipped mapping", about: "Pioneer DDJ-200, DDJ-SR, CDJ-3000 in HID mode, and a generic two-deck mapping.", module: "foundation", status: "shipped", caveat: "Untested on hardware: it works against stand-ins and has not yet met the device itself.", stage: "confluence", source: "README For the hands; EDITIONS foundation" },
  { id: "themes", name: "Themes and skins", about: "Palettes, among them four Caribbean themes, with artwork layers over them; panels moved, zoomed and popped out into windows of their own.", module: "foundation", status: "shipped", stage: "cone", source: "FEATURES §2 Also shipped; §3" },
  { id: "layouts", name: "Layouts", about: "Starter, Essentials, Pro, Performance, Scratch and Stem Performance, and a DJ's own as a file that cannot run code.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §3" },
  { id: "requests", name: "Requests from the room", about: "The room asks for songs from a QR code — no app to install — and the DJ reads the list most-wanted first.", module: "karaoke", also: ["crowd"], status: "shipped", stage: "floor", source: "FEATURES §1 Audience requests; EDITIONS Karaoke; dj_app::gate" },
  { id: "share", name: "Share a set", about: "Tonight's tracklist handed to WhatsApp, X, Bluesky or Threads with the message written; the DJ presses send.", module: "streaming", status: "shipped", stage: "afterglow", source: "FEATURES §1 Share a set; EDITIONS module table (Going live)" },
  { id: "linux", name: "Linux and macOS", about: "On Linux, audio goes through ALSA's default device, which PipeWire serves; macOS and Linux are the promised platforms.", module: "foundation", status: "part", caveat: "JACK cannot yet be chosen as the audio host, and CI runs Ubuntu rather than Xubuntu.", stage: "afterglow", source: "FEATURES §2 Where §2 is not yet true; README Under it" },

  // --- Modules -----------------------------------------------------------------
  { id: "decks6", name: "Four to six decks", about: "Decks three and four, and up to six.", module: "four_decks", status: "shipped", stage: "confluence", source: "FEATURES §1 Decks" },
  { id: "stems", name: "Live stems", about: "Vocals, drums, bass and the rest apart, separated ahead of the playhead into a cache, so the audio adds no latency; EQ per stem, and one deck's vocal over another's mix.", module: "stems", status: "shipped", stage: "needle", source: "README; FEATURES §1 Effects, Hardware" },
  { id: "automix", name: "Automix and the autopilot", about: "The application runs the mix from an assembled set, in six postures, and gives way the moment a hand touches a control.", module: "autopilot", status: "shipped", caveat: "Never verified against real audio: the development machine has no output device.", stage: "confluence", source: "FEATURES §1 Autopilot, Assistant takeover" },
  { id: "autopilot-surface", name: "The Auto-Pilot panel", about: "Style the night by its shape, length, tempo range, era and the genres you like or leave out; fill it from your collection, start it, take over, hand it back, keep it as a playlist.", module: "autopilot", status: "shipped", caveat: "It fills from your own collection only. Filling from the online sources, and drawing the night's energy by hand instead of picking one of four shapes, are still to come.", stage: "confluence", source: "EDITIONS What is built; FEATURES §2 Practice and activities" },
  { id: "suggest", name: "What to play next, and why", about: "Next-track suggestions ranked by key, tempo, loudness and phrase, each with its reasons; a transition planner that proposes where and how.", module: "assistant", status: "shipped", caveat: "Energy is approximated by loudness. The planner cannot know where the outro is: a phrase boundary near the end is a guess.", stage: "cue", source: "FEATURES §1 Next-track suggestions, Transition planner" },
  { id: "asks", name: "It asks before it acts", about: "The assistant stages a whole transition as one thing to accept, modify or reject, and speaks only in actions a DJ could have pressed.", module: "assistant", status: "shipped", stage: "cue", source: "FEATURES §1 Interface; README What makes it different" },
  { id: "packs", name: "Knowledge packs and guides", about: "A genre's or a night's shape for the assistant, and guides on each topic.", module: "assistant", status: "shipped", stage: "cue", source: "README For the night; FEATURES §1 Set planning workspace" },
  { id: "teacher", name: "The teacher", about: "The practice lab and a practice deck only the headphones hear, the coach that names what the hands just did, twenty-eight techniques and a quiz.", module: "teacher", status: "shipped", stage: "cue", source: "EDITIONS What is built; FEATURES §1 Learning module, DJ technique catalogue" },
  { id: "curriculum", name: "The Apprentice course", about: "Ten stages in order, from the decks and beatmatching to the first gig and the road ahead: twenty-three lessons, the genre one written from your knowledge pack. The coach checks each move from what you just played; beatmatching by ear is checked from the two tempos, and SYNC does not count. Your progress is kept.", module: "teacher", status: "shipped", caveat: "Twenty-three lessons so far; more are to come, and the owner has still to review what each says.", stage: "cue", source: "EDITIONS What is built; FEATURES §2 Practice and activities; README What's coming" },
  { id: "karaoke", name: "A karaoke night", about: "The singers' screen with words in time, the queue and a sign-up page, vocals out, a microphone and effects per singer, duets, a guide voice, break music, and finding the song a singer cannot name.", module: "karaoke", status: "part", caveat: "Still to come: duet parts and phones as microphones.", stage: "voice", source: "README For the night; FEATURES §1 Karaoke" },
  { id: "oldmac", name: "djmanzo on older Macs", about: "The whole application, opening on karaoke, for Intel Macs back to macOS 10.13.", module: "foundation", status: "shipped", caveat: "Nobody has yet run it on a 2011 Mac. Timing words by listening and spoken commands need macOS 10.15 or later.", stage: "voice", source: "EDITIONS; KARAOKE-NIGHT" },
  { id: "room", name: "Reading the room", about: "A camera and a microphone say whether the floor is stiller or busier than earlier tonight; the crowd's reactions from their phones; what each mix did — each stated with how sure it is.", module: "crowd", status: "shipped", caveat: "The measuring has never been run against a real camera. No image is recorded, saved or sent.", stage: "floor", source: "README For the night; FEATURES §1 Reading the room" },
  { id: "mapping", name: "Map any controller", about: "Press a control, choose what it does, save; HID devices, lights, Lua for what a table cannot say, and an interface that reads what is plugged in.", module: "controllers", status: "shipped", caveat: "Untested on hardware: it works against stand-ins and has not yet met the device itself.", stage: "confluence", source: "FEATURES §1 Hardware" },
  { id: "platters", name: "Motorised platters", about: "Absolute platter position with the motor driven by the transport.", module: "controllers", status: "shipped", caveat: "Untested on hardware: it works against stand-ins and has not yet met the device itself.", stage: "confluence", source: "FEATURES §1 Hardware" },
  { id: "dvs", name: "Timecode vinyl", about: "Real turntables drive a deck, relative or absolute; djmanzo writes its own control signal, so no licensed record is needed.", module: "dvs", status: "shipped", caveat: "Not yet run against a pressed record.", stage: "confluence", source: "FEATURES §1 Timecode vinyl / DVS" },
  { id: "visuals", name: "Video and visuals", about: "Video on a deck, its picture crossfading as the sound does, layered WebGL looks and MilkDrop presets.", module: "video", status: "shipped", caveat: "On Linux, H.264 video plays only with the distribution's gstreamer1.0-libav installed; video has been driven only on Linux so far.", stage: "cone", source: "README For the night; VIDEO.md" },
  { id: "live", name: "Going live", about: "Now playing on a stream: an overlay for OBS and a text file, for Twitch, YouTube, Instagram, TikTok or Kick.", module: "streaming", status: "shipped", stage: "cone", source: "FEATURES §1 Now playing on a live stream" },
  { id: "outputs", name: "Stems out", about: "One deck's stems as four stereo pairs — vocals, drums, bass, the rest — for outboard processing.", module: "stems", status: "shipped", caveat: "Untested on hardware: it works against stand-ins and has not yet met the device itself.", stage: "cone", source: "FEATURES §1 Output" },
  { id: "deckouts", name: "Decks out", about: "Each deck on its own stereo pair, before its fader, for an outboard mixer.", module: "foundation", status: "shipped", caveat: "Untested on hardware: it works against stand-ins and has not yet met the device itself.", stage: "cone", source: "FEATURES §1 Output" },
  { id: "clap", name: "CLAP plugins", about: "Audio plugins hosted on the master, with generic controls and no plugin window.", module: "plugins", status: "shipped", stage: "confluence", source: "FEATURES §1 Effects" },
  { id: "sources", name: "Online sources", about: "Search Spotify, YouTube, Jamendo and the Internet Archive, and match a result to a file already owned. For finding and planning: mixing Spotify or YouTube Music audio is not allowed by them.", module: "sources", status: "shipped", stage: "groove", source: "FEATURES §1 Browser; Deliberately not planned" },
  { id: "events", name: "Events and the press kit", about: "A booking kept step by step, the night's plan, and a press kit.", module: "events", status: "shipped", stage: "afterglow", source: "README For the night" },
  { id: "replay", name: "Replay", about: "A set is data: heard back, a single mix rendered again from the Mixes panel, a transition looped to practise, two takes compared.", module: "replay", status: "part", caveat: "Rendering a whole set again offline is a command with no button yet. Live inputs — microphone, aux, timecode — cannot be reproduced and are said to be.", stage: "cone", source: "FEATURES §1 Deterministic replay; §2" },
  { id: "api", name: "An open surface", about: "A control API over OSC and line-delimited JSON on TCP, in the same actions the interface uses; MIDI clock in and out; and tempo sync between djmanzo machines (not Ableton Link).", module: "controllers", status: "shipped", stage: "confluence", source: "FEATURES §1 Hardware, Output; §2 Where §2 is not yet true" },

  // --- Planned, and said so -------------------------------------------------------
  { id: "editions", name: "Seven editions, one download", about: "Auto-Pilot, Hobbyist, Apprentice, Karaoke, Pro DJ, Full and Custom, all one application, unlocked by signing in. Each shows only what it carries; what it lacks is a quiet card naming the edition that has it.", module: "foundation", status: "part", caveat: "Signing in from djmanzo reaches this shop once a release is built to name it, which is the owner's step. Until then djmanzo refuses nothing; once it does, djmanzo with no licence is the free Hobbyist edition.", stage: "amp", source: "EDITIONS; ADR-0011" },
  { id: "trial", name: "Seven days of any edition", about: "A free trial of any edition, Full included, once per account. When it ends without a purchase, djmanzo becomes the Hobbyist edition, free, for ever: what the trial added shows as quiet cards, and nothing you made is lost.", module: "foundation", status: "part", caveat: "Started here, or in djmanzo from Settings → Licence once a release names this shop; the days left show in djmanzo's status strip.", stage: "amp", source: "EDITIONS The 7-day trial" },
  { id: "marketplace", name: "The marketplace", about: "Themes, skins, visuals, controller mappings, knowledge packs, lessons, karaoke screens, plugins and DJ techniques the autopilot can perform — everything in it free. Theme, skin and visuals packs already install today, signed, from Settings in every edition; the marketplace to find them in is still to be built.", module: "foundation", status: "planned", stage: "outboard", source: "MARKETPLACE; ADR-0012" },
  { id: "setplan", name: "The set plan", about: "The night planned as an arc, steered without rebuilding.", module: "events", also: ["autopilot"], status: "shipped", stage: "cue", source: "EDITIONS module table (Events); FEATURES §1 Set planning workspace; dj_app::gate" },
  { id: "hobbyist-free", name: "The Hobbyist edition, free for ever", about: "Two decks, the mixer, the library, cues, loops and pads, the effects, the sampler, recording, the keyboard and a controller, with no purchase. It is what a trial ends in: what the trial added shows as quiet cards, and nothing you made is lost.", module: "foundation", status: "part", caveat: "Once the shop opens in djmanzo; until then djmanzo refuses nothing.", stage: "amp", source: "EDITIONS Proposed prices; The 7-day trial; README What's coming" },
  { id: "quiet-cards", name: "A look at what more there is", about: "In every edition but Full, a panel the edition does not carry is drawn as a quiet card: what it does and the cheapest edition that has it. Never a broken button, never a pop-up, never while you mix.", module: "foundation", status: "shipped", caveat: "Controls inside a panel, such as a stem button on a Hobbyist's deck, are left out rather than shown as cards.", stage: "amp", source: "EDITIONS A look at what more there is; The order of work" },
  { id: "look-studio", name: "The look studio", about: "Click a theme and its skins together from eight starters, sixteen palettes or any three colours, eight styles and twelve motifs, worn on the whole window while you make it; or have any AI make one from a template you copy. Every theme stays readable at WCAG contrast. Keep it as a pack signed with your key, or share it as a .djpack.", module: "foundation", status: "shipped", caveat: "Making it with your own AI provider inside djmanzo needs the assistant; copying the template to any AI works in every edition. The projector and karaoke visuals are not part of a design yet.", stage: "cone", source: "LOOK-SPEC The look studio, AI templates, Not yet; FEATURES §3; README For the night" },
  { id: "theme-packs", name: "Themes and skins as packs", about: "A theme (fourteen colours for a dark room and a light one, every pair you read held to its contrast) or a skin (SVG tiles that can only draw, still, drifting or breathing with the bass) installs as a signed .djpack from Settings, in every edition, and is worn like djmanzo's own.", module: "foundation", status: "shipped", stage: "outboard", source: "MARKETPLACE Themes and skins, as built; LOOK-SPEC Skin motion" },
  { id: "hardware", name: "More hardware", about: "Mappings for the controllers people own — DDJ-FLX4, DDJ-400, Mixtrack, Inpulse, Kontrol S2 and S4, Denon, Rane, Reloop — and phones as remotes.", module: "controllers", status: "planned", stage: "confluence", source: "FEATURES §4 More hardware" },
  { id: "club", name: "Club players and lighting", about: "Pro DJ Link, StagelinQ, Ableton Link, Art-Net and DMX, MIDI 2.0.", module: "controllers", status: "planned", caveat: "None of these is proved until it meets the real device.", stage: "confluence", source: "FEATURES §4 More hardware" },
  { id: "windows", name: "Windows", about: "Built, tested in CI and packaged with every release.", module: "foundation", status: "part", caveat: "Never yet run by a person on a Windows machine.", stage: "afterglow", source: "FEATURES §4 Platforms" },
  { id: "gig", name: "A real gig", about: "Everything here has been tested in the repository; none of it in front of a crowd yet.", module: "foundation", status: "planned", stage: "floor", source: "README What's coming" },
];

export const FACT_BY_ID: Record<string, Fact> = Object.fromEntries(FACTS.map((f) => [f.id, f]));

/** The one sentence every page that sells djmanzo must be able to say. */
export const STATUS_LINE =
  "djmanzo is in beta: a complete DJ application for macOS and Linux, tested in its own repository — against stand-ins where the hardware was missing — and not yet through a real gig.";

/** What an edition carries, as facts: the foundation's and its modules'. */
export function factsFor(modules: readonly Module[]): Fact[] {
  return FACTS.filter((f) => f.module === "foundation" || modules.includes(f.module));
}

/** Whether an edition carrying `modules` has a fact: the foundation's, or any one of its modules. */
export function carriedBy(f: Fact, modules: readonly Module[]): boolean {
  return f.module === "foundation" || [f.module, ...(f.also ?? [])].some((m) => modules.includes(m));
}

/** The cheapest edition that has a fact, or null for the foundation's. */
export function cheapestFor(f: Fact): Edition | null {
  if (f.module === "foundation") return null;
  const named = [f.module, ...(f.also ?? [])].map((m) => CHEAPEST_WITH[m]);
  return named.sort((a, b) => (a === "custom" ? Infinity : BUY_ONCE[a]) - (b === "custom" ? Infinity : BUY_ONCE[b]))[0];
}

/** How a fact's module reads in a sentence: "every edition", or the module (and the others that carry it). */
export function moduleWords(f: Fact, title: (m: Module) => string): string {
  if (f.module === "foundation") return "every edition";
  return `module: ${[f.module, ...(f.also ?? [])].map(title).join(" or ")}`;
}
