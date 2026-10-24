/**
 * Everything the website says djmanzo does, and where it says so.
 *
 * The owner's rule (DIRECTIVE §139): no page, guide or article may say
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

export const CHECKED_AGAINST = "df9c971f16df49240fbd251bcbbbbbf61635b14a";

/** The documents a fact can come from, as `git diff` names them. */
export const SOURCES = ["README.md", "docs/FEATURES.md", "docs/EDITIONS.md", "docs/MARKETPLACE.md", "docs/VIDEO.md", "docs/KARAOKE-NIGHT.md", "docs/KARAOKE.md", "docs/LIGHTING.md", "docs/LOOK-SPEC.md", "docs/KEYS.md"] as const;

export type Status = "shipped" | "part" | "planned";

/** Where on the Signal Path a fact is told. */
export type Stage = "groove" | "needle" | "cue" | "confluence" | "voice" | "amp" | "cone" | "floor" | "afterglow" | "outboard";

/** Where a fact belongs on a page that lists them all: the features page, the editions matrix. */
export type Area = "mixing" | "library" | "hands" | "karaoke" | "assist" | "learn" | "show" | "look" | "editions";

export const AREAS: { id: Area; name: string; about: string }[] = [
  { id: "mixing", name: "Mixing", about: "The decks, the mixer, cues, loops, effects and stems." },
  { id: "library", name: "The library", about: "Your records, read, sorted and found." },
  { id: "hands", name: "Keys, controllers and screens", about: "The keyboard, mnemonic keys, controllers, vinyl and the views you work in." },
  { id: "karaoke", name: "Karaoke", about: "Everything a karaoke host needs, from the queue to the song made for a guest." },
  { id: "assist", name: "The assistant and the autopilot", about: "Suggestions that say why, a mix that runs itself, and taking over." },
  { id: "learn", name: "Learning", about: "The teacher, the course and the know-how." },
  { id: "show", name: "The show", about: "Video, visuals, lights, going live, the room and the night." },
  { id: "look", name: "Looks and packs", about: "Themes, skins, the look studio and the marketplace." },
  { id: "editions", name: "Editions, platforms and status", about: "What runs where, what it costs, and what is not yet proven." },
];

export interface Fact {
  id: string;
  /** Overrides the area its module gives it (`areaOf`). */
  area?: Area;
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
  { id: "decks", name: "Two decks and the mixer", about: "Play, cue, sync, keylock, a pitch fader whose range steps from ±6 to ±100 %, channel faders and a crossfader with A / thru / B assignment and a smooth, linear or sharp curve, three-band EQ with kills, a filter, gain from loudness analysis, headphone cue, booth out and a limiter.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Decks, Mixer; parity table" },
  { id: "transport", name: "Slip, reverse, brake, backspin and a cloned deck", about: "The performance moves on the deck itself, with quantize and beat jump; and an instant double: the same record on the other deck at the same place, speed, key and grid — the same samples, not a reload.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Decks; parity table (clone deck)" },
  { id: "pads", name: "Cues, loops and pads", about: "Eight hot cues with names and colours (imported from Serato and rekordbox, or set with Shift+right-click), loops by beat count, loop rolls down to 1/16, a slicer, and pad pages for cues, loops, rolls, saved loops, the sampler and effects.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Cues, loops, pads; parity table (hot cues)" },
  { id: "fx", name: "The effects rack", about: "Echo, delay, reverb, gate, crush, flanger, phaser and filter — beat-synced, three slots per deck and on the master, with chain presets.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Effects" },
  { id: "sampler", name: "The sampler", about: "Banks of pads — one-shot, loop, hold, stutter — synced to the master tempo, and recorded from a deck.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Sampler" },
  { id: "record", name: "Recording the master", about: "The set to disk, as a WAV.", module: "foundation", status: "shipped", stage: "cone", source: "FEATURES §1 Output" },
  { id: "library", name: "The library", about: "Folders, playlists, crates and smart folders; imports from rekordbox, Traktor and iTunes with their cues and grids, and from Serato with its crates, hot cues and loops; duplicates found; instant search; the collection as cards with their own artwork.", module: "foundation", status: "shipped", stage: "groove", source: "FEATURES §1 Browser and library" },
  { id: "camelot", name: "Key and tempo, read", about: "BPM, key on the Camelot wheel with compatible keys, loudness, and 31 genre families across Latin America, North America, Europe, Africa and beyond.", module: "foundation", status: "shipped", stage: "needle", source: "FEATURES §1 Browser; §1 Genre families" },
  { id: "waveforms", name: "Waveforms drawn in Rust", about: "Scrolling and overview waveforms with an editable beat grid, cue and loop overlays and colour by band, rendered in Rust so they stay fast on Linux.", module: "foundation", status: "shipped", stage: "needle", source: "FEATURES §1 Waveforms; README Stack" },
  { id: "phrases", name: "Phrases, intros and outros", about: "Phrase length and anchor found in the record and marked on the waveform, with phrase-locked loops and jumps; builds, drops, breakdowns and the vocal's entry; and where the music starts and stops, so the automix mixes out where a record's music ends.", module: "foundation", status: "shipped", caveat: "Verified against synthetic tracks, not yet measured against a corpus of real records. A live recording's applause reads as music.", stage: "needle", source: "FEATURES §1 Phrase detection; §2 Structure" },
  { id: "find", name: "Find it from memory", about: "A half-remembered line, a description, or a hum.", module: "assistant", also: ["karaoke"], status: "shipped", caveat: "The hum has never been tried with a real microphone, and finds only records already in the collection; only a description can name a record not owned.", stage: "groove", source: "FEATURES §1 Find it from memory; dj_app::gate" },
  { id: "keyboard", name: "The keyboard is a controller", about: "The same vocabulary and file format as a MIDI mapping, so a laptop with nothing plugged in is a playable instrument.", module: "foundation", status: "shipped", stage: "confluence", source: "README For the hands" },
  { id: "mapped", name: "A controller on its shipped mapping", about: "Mappings written from each maker's own MIDI table, browse knob and load buttons included: Pioneer's DDJ-400 and FLX4 family, DDJ-200, DDJ-SR and CDJ-3000 (in HID mode), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, Roland DJ-707M's deck section and the Launchpad Mini MK3 as a pad grid, and a generic two-deck mapping.", module: "foundation", status: "shipped", caveat: "None has yet been played on the device itself: each works against stand-ins. Several controllers publish no table and wait for learn mode.", stage: "confluence", source: "README For the hands; FEATURES §4 Written since; EDITIONS foundation" },
  { id: "themes", name: "Themes and skins", about: "Palettes, among them four Caribbean themes, with artwork layers over them; panels moved, zoomed and popped out into windows of their own.", module: "foundation", status: "shipped", stage: "cone", source: "FEATURES §2 Also shipped; §3" },
  { id: "layouts", name: "Layouts", about: "Starter, Essentials, Pro, Performance, Scratch and Stem Performance, and a DJ's own as a file that cannot run code.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §3" },
  { id: "requests", name: "Requests from the room", about: "The room asks for songs from a QR code — no app to install — and the DJ reads the list most-wanted first.", module: "karaoke", also: ["crowd"], status: "shipped", stage: "floor", source: "FEATURES §1 Audience requests; EDITIONS Karaoke; dj_app::gate" },
  { id: "share", name: "Share a set", about: "Tonight's tracklist handed to WhatsApp, X, Bluesky or Threads with the message written; the DJ presses send.", module: "streaming", status: "shipped", stage: "afterglow", source: "FEATURES §1 Share a set; EDITIONS module table (Going live)" },
  { id: "linux", name: "Linux and macOS", about: "On Linux, audio goes through ALSA's default device, which PipeWire serves; macOS and Linux are the promised platforms.", module: "foundation", status: "part", caveat: "JACK cannot yet be chosen as the audio host, and CI runs Ubuntu rather than Xubuntu.", stage: "afterglow", source: "FEATURES §2 Where §2 is not yet true, Platforms; README Under it" },

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
  { id: "karaoke", name: "A karaoke night", about: "The singers' screen with words in time, the queue and a sign-up page, vocals out, a microphone and effects per singer, duets, a guide voice, break music, scored singing, a quiz, and finding the song a singer cannot name.", module: "karaoke", status: "part", caveat: "Still to come: duet parts and phones as microphones.", stage: "voice", source: "README For the night; FEATURES §1 Karaoke; KARAOKE §5" },
  { id: "oldmac", name: "djmanzo on older Macs", about: "The whole application, opening on karaoke, for Intel Macs back to macOS 10.13.", module: "foundation", status: "shipped", caveat: "Nobody has yet run it on a 2011 Mac. Timing words by listening and spoken commands need macOS 10.15 or later.", stage: "voice", source: "EDITIONS; KARAOKE-NIGHT" },
  { id: "room", name: "Reading the room", about: "A camera and a microphone say whether the floor is stiller or busier than earlier tonight; the crowd's reactions from their phones; what each mix did — each stated with how sure it is.", module: "crowd", status: "shipped", caveat: "The measuring has never been run against a real camera. No image is recorded, saved or sent.", stage: "floor", source: "README For the night; FEATURES §1 Reading the room" },
  { id: "mapping", name: "Map any controller", about: "Press a control, choose what it does, save; HID devices, lights, Lua for what a table cannot say, and an interface that reads what is plugged in.", module: "controllers", status: "shipped", caveat: "Untested on hardware: it works against stand-ins and has not yet met the device itself.", stage: "confluence", source: "FEATURES §1 Hardware" },
  { id: "platters", name: "Motorised platters", about: "Absolute platter position with the motor driven by the transport.", module: "controllers", status: "shipped", caveat: "Untested on hardware: it works against stand-ins and has not yet met the device itself.", stage: "confluence", source: "FEATURES §1 Hardware" },
  { id: "dvs", name: "Timecode vinyl", about: "Real turntables drive a deck, relative or absolute; djmanzo writes its own control signal, so no licensed record is needed.", module: "dvs", status: "shipped", caveat: "Not yet run against a pressed record.", stage: "confluence", source: "FEATURES §1 Timecode vinyl / DVS" },
  { id: "visuals", name: "Video and visuals", about: "Video on a deck, its picture crossfading as the sound does, layered WebGL looks and MilkDrop presets — the DJ's own presets too — for a projector or a second screen.", module: "video", status: "shipped", caveat: "On Linux, H.264 video plays only with the distribution's gstreamer1.0-libav installed; video has been driven only on Linux so far.", stage: "cone", source: "README For the night; VIDEO.md" },
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
  { id: "marketplace", name: "The marketplace", about: "Free packs made by DJs, signed by their makers: themes, skins, visuals, DJ techniques the autopilot performs, keyboard sets, controller mappings, knowledge packs and lessons that join the course in their stages. djmanzo's Marketplace panel browses them by kind and genre, with pictures and the licence on every card, and installs or removes one with a press; this site lists them too, with seven keyboard sets from the crew to start with.", module: "foundation", status: "part", caveat: "Karaoke screens and plugins as packs are still to come. This site lists themes, skins, visuals and keyboard sets so far; the other kinds install in djmanzo from a file or an index.", stage: "outboard", source: "MARKETPLACE The order of work, Lessons, as built; FEATURES §4" },
  { id: "setplan", name: "The set plan", about: "The night planned as an arc, steered without rebuilding.", module: "events", also: ["autopilot"], status: "shipped", stage: "cue", source: "EDITIONS module table (Events); FEATURES §1 Set planning workspace; dj_app::gate" },
  { id: "hobbyist-free", name: "The Hobbyist edition, free for ever", about: "Two decks, the mixer, the library, cues, loops and pads, the effects, the sampler, recording, the keyboard and a controller, with no purchase. It is what a trial ends in: what the trial added shows as quiet cards, and nothing you made is lost.", module: "foundation", status: "part", caveat: "Once the shop opens in djmanzo; until then djmanzo refuses nothing.", stage: "amp", source: "EDITIONS Proposed prices; The 7-day trial; README What's coming" },
  { id: "quiet-cards", name: "A look at what more there is", about: "In every edition but Full, a panel the edition does not carry is drawn as a quiet card: what it does and the cheapest edition that has it. Never a broken button, never a pop-up, never while you mix.", module: "foundation", status: "shipped", caveat: "Controls inside a panel, such as a stem button on a Hobbyist's deck, are left out rather than shown as cards.", stage: "amp", source: "EDITIONS A look at what more there is; The order of work" },
  { id: "look-studio", name: "The look studio", about: "Click a theme and its skins together from eight starters, sixteen palettes or any three colours, eight styles and twelve motifs, worn on the whole window while you make it; or have any AI make one from a template you copy. Every theme stays readable at WCAG contrast. Keep it as a pack signed with your key, or share it as a .djpack.", module: "foundation", status: "shipped", caveat: "Making it with your own AI provider inside djmanzo needs the assistant; copying the template to any AI works in every edition. The projector and karaoke visuals are not part of a design yet.", stage: "cone", source: "LOOK-SPEC The look studio, AI templates, Not yet; FEATURES §3; README For the night" },
  { id: "theme-packs", name: "Themes and skins as packs", about: "A theme (fourteen colours for a dark room and a light one, every pair you read held to its contrast) or a skin (SVG tiles that can only draw, still, drifting or breathing with the bass) installs as a signed .djpack from Settings, in every edition, and is worn like djmanzo's own.", module: "foundation", status: "shipped", stage: "outboard", source: "MARKETPLACE Themes and skins, as built; LOOK-SPEC Skin motion" },
  { id: "hardware", name: "More hardware", about: "Mappings for more of the controllers people own — Pioneer's larger DDJs, Hercules Inpulse 500, Traktor Kontrol S2 and S4, Denon and Rane, more Reloop — each from its maker's table or the device in hand, and phones as remotes.", module: "controllers", status: "planned", stage: "confluence", source: "FEATURES §4 More hardware" },
  { id: "club", name: "Club players and more lighting", about: "Pro DJ Link, StagelinQ, Ableton Link, USB DMX interfaces, moving heads and more than one universe, MIDI 2.0.", module: "controllers", status: "planned", caveat: "None of these is proved until it meets the real device.", stage: "confluence", source: "FEATURES §4 More hardware" },
  { id: "windows", name: "Windows", about: "Built, tested in CI and packaged with every release.", module: "foundation", status: "part", caveat: "Never yet run by a person on a Windows machine.", stage: "afterglow", source: "FEATURES §4 Platforms" },
  { id: "gig", name: "A real gig", about: "Everything here has been tested in the repository; none of it in front of a crowd yet.", module: "foundation", status: "planned", stage: "floor", source: "README What's coming" },
  // --- Read against main on 21 October 2026: the views, the keys, karaoke in detail, the lights ---
  { id: "leader", area: "hands", name: "Mnemonic keys under Space", about: "Press Space and a guide shows every key: sequences that read as words — Space d 1 p is deck 1 play, Space o i opens the singers. Lay your own keys over djmanzo\'s, and wear a keyboard set made for a purpose on top.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Interface: Space and its leader-key guide; KARAOKE-NIGHT" },
  { id: "keysets", area: "hands", name: "Keyboard sets", about: "Mnemonic layouts for a way of working: nine ship with djmanzo — one for each edition's way of working (Essentials, Learning, Karaoke host, Performance, Autopilot, Dashboards) and Scratch, Open format and One hand — and more come as marketplace packs. A set adds keys on letters djmanzo leaves free, under your own keys, so wearing one never takes a key away; your own keys can be saved as a set, or published with your name and support links in one press.", module: "foundation", status: "shipped", caveat: "One set is worn at a time.", stage: "outboard", source: "KEYS Keyboard sets: one way of working each; MARKETPLACE The order of work, step 4 (§137)" },
  { id: "launcher", area: "hands", name: "The launcher and boards", about: "Press 0 for the launcher: whole views that replace the decks — the Karaoke board puts the singers and your music side by side with the decks in brief, Karaoke prep is for the hour before — and boards of your own, arranged by hand.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Interface: Launcher (0) and boards; KARAOKE-NIGHT Screens for the night" },
  { id: "palette", area: "hands", name: "One search for everything", about: "The command palette (Ctrl or Cmd + K) finds any record, panel, preset, theme or action, typo-tolerant; every panel pops out into a window of its own and stays live.", module: "foundation", status: "shipped", stage: "confluence", source: "FEATURES §1 Interface: One forgiving search; Every panel pops out" },
  { id: "deckqueue", area: "mixing", name: "A playlist under every deck", about: "Each deck has its own playlist drawer: a press loads a record, ▶ loads and plays it, and with Next when this ends and Repeat it goes on by itself, round and round, shuffled if you like — a filler deck of jingles and loops while the other deck does the work.", module: "foundation", status: "shipped", stage: "confluence", source: "DIRECTIVE-STATUS §127; KARAOKE-NIGHT A filler deck" },
  { id: "safe", area: "mixing", name: "The SAFE button", about: "One press in the top bar takes every control back, clears every effect and flattens the sound.", module: "foundation", status: "shipped", stage: "confluence", source: "KARAOKE-NIGHT If anything goes wrong" },
  { id: "feedback", area: "editions", name: "Feedback, wishes and problems", about: "The 💬 beside the cogwheel files a problem, a wish or anything else as the project\'s GitHub issue form, filled in; the version, system and edition are added only while a box is ticked and shown first.", module: "foundation", status: "shipped", stage: "afterglow", source: "FEATURES parity table: Feedback, wishes and problems" },
  { id: "lights", area: "show", name: "Lights that follow the music", about: "The room\'s lights over Art-Net or sACN, following the beat, the phrase and how hard the music is going: one universe, five channel layouts, pulse, chase, wash and an auto look that changes only at a phrase. No strobe.", module: "video", status: "shipped", caveat: "Not yet tried on real lights.", stage: "cone", source: "FEATURES parity table: DMX lighting; LIGHTING.md; EDITIONS module table" },
  { id: "knowhow", area: "learn", name: "Know-how", about: "The course\'s second tab: 110 genre families across six regions — what each blends with, its felt tempo, its rhythm and the moves its DJs reach for — 72 techniques with the theory behind each, and the music theory a DJ and a karaoke host work with, each idea saying where djmanzo shows it. Sixty-seven genres tell their history — where and when each began, what went into it and came out of it, what to listen for, the records everybody in it knows — each genre it names one press away; and anything learned is kept in the journal, on its night, with a notebook of all of it.", module: "teacher", status: "shipped", stage: "cue", source: "FEATURES §1 Practice and activities: Know-how; Where the music came from, and a journal of it (§138)" },

  { id: "k-rotation", area: "karaoke", name: "The singers and the rotation", about: "Type a singer\'s name and start typing their song; the card on top is whoever is up next: load their song on either deck in the key they asked for, bring them in on the next phrase, mark them as sung or not here. Drag a row to change the order, or drag a record onto the panel to ask for it.", module: "karaoke", status: "shipped", stage: "voice", source: "KARAOKE-NIGHT Running the night" },
  { id: "k-voice", area: "karaoke", name: "The voice as recorded, as a guide, or out", about: "Under each deck: As recorded, Guide — a little of the original voice left in to follow — or Out. A song new to the singer is offered with the guide voice already ticked. The key moves a semitone at a time without changing the tempo.", module: "karaoke", status: "shipped", stage: "voice", source: "KARAOKE-NIGHT Running the night, The guide voice; KARAOKE §1" },
  { id: "k-screen", area: "karaoke", name: "The singers\' screen", about: "A second window for the projector or the TV: the words wiped as they are sung, the next line, a count-in, who is up next — over the record\'s artwork or a generated background.", module: "karaoke", status: "shipped", stage: "voice", source: "KARAOKE-NIGHT The singers\' screen; KARAOKE §2, §5" },
  { id: "k-words", area: "karaoke", name: "Words found, and timed by listening", about: "Lyrics from the file itself, a .lrc beside it, or LRCLIB for the whole collection in the background, kept for the night. Words with no times are timed by listening to the record, inside djmanzo, where the machine can run the speech models.", module: "karaoke", status: "shipped", caveat: "Timing by listening needs macOS 10.15 or later on a Mac; words that come already timed follow the song on any machine.", stage: "voice", source: "KARAOKE-NIGHT The words, Listening; KARAOKE §5" },
  { id: "k-visuals", area: "karaoke", name: "Visuals behind the words", about: "djmanzo\'s own layers on the beat, the stems and the singers\' microphones, MilkDrop presets among them and your own, and the artist\'s photographs from Wikimedia Commons, credited — picked in the Singers panel.", module: "karaoke", also: ["video"], status: "shipped", stage: "cone", source: "KARAOKE §5 (K2); dj_app::gate (looks: karaoke or video)" },
  { id: "k-mics", area: "karaoke", name: "A microphone for each singer", about: "A chain per microphone with presets made for karaoke — Singer, Stadium, Radio voice, Big echo, Duet — a monitor each on an interface with enough outputs, and duets with each singer\'s name and lines in their own colour.", module: "karaoke", status: "shipped", stage: "voice", source: "KARAOKE-NIGHT A monitor for each singer, Duets, Karaoke presets" },
  { id: "k-phones", area: "karaoke", name: "Singers from the room", about: "A QR code puts anyone on the Wi-Fi in the queue with a song from your music — nothing plays until you load it — and, when you turn it on, their emoji float in the corner of the singers\' screen.", module: "karaoke", status: "shipped", stage: "floor", source: "KARAOKE-NIGHT Phones, Emoji from the room; KARAOKE §7" },
  { id: "k-breaks", area: "karaoke", name: "Break music that leads somewhere", about: "Music from a playlist you choose while the next singer gets ready, chosen to lead into their song, fading out when you start it.", module: "karaoke", status: "shipped", stage: "voice", source: "KARAOKE-NIGHT Between singers; KARAOKE §8" },
  { id: "k-presets", area: "karaoke", name: "The Karaoke night presets", about: "Vocals out, Guide vocal, Everyone sings, Down a tone, Down a fourth, Up a tone, Original key, and Open microphones — the limiter on and the master a little down, so a microphone has room before it howls.", module: "karaoke", status: "shipped", stage: "voice", source: "KARAOKE-NIGHT Before the first singer, The Karaoke night presets" },
  { id: "k-score", area: "karaoke", name: "Scored singing, and versus rounds", about: "Any record in your collection can be scored, the melody read from its separated vocal; the score is on the singers\' screen while they sing, with a leaderboard after it, per singer in a duet and by team in a versus round.", module: "karaoke", status: "shipped", caveat: "Never tried with a real microphone in a real room.", stage: "voice", source: "KARAOKE §9 (K6), §5" },
  { id: "k-quiz", area: "karaoke", name: "A quiz made from your records", about: "Rounds made by rules from your own collection — name it, a reversed or sped-up clip, the stems coming in one at a time, the missing line — answered from phones with four buttons each.", module: "karaoke", status: "shipped", stage: "floor", source: "KARAOKE §10 (K7), §5" },
  { id: "k-range", area: "karaoke", name: "A singer\'s range, and the key to sing in", about: "Twenty seconds of a singer sliding low to high, and djmanzo suggests songs that fit their voice, each with the key change it needs.", module: "karaoke", status: "shipped", caveat: "Never tried with a real microphone in a real room.", stage: "voice", source: "KARAOKE §11 (K8), §5" },
  { id: "k-guests", area: "karaoke", name: "The guest book, a song for a guest, and WhatsApp", about: "Every singer who sang is written into the night\'s journal. With their agreement, asked one question at a time: their details kept, fifteen seconds of their voice, a song written for them by your AI provider — about them, the song they sang and the night — which djmanzo puts into Suno\'s form, and the finished link sent to their WhatsApp. Nothing leaves the machine unless you send it.", module: "karaoke", status: "shipped", caveat: "Suno has no public API: djmanzo fills its form and you press Create; you press send in WhatsApp. Writing the words needs an AI provider set up in djmanzo.", stage: "afterglow", source: "KARAOKE §4 The guest book; KARAOKE-NIGHT A guest\'s song, sent" },
  { id: "k-record", area: "karaoke", name: "A singer\'s song, recorded for them", about: "With its own agreement, their song as the room heard it — their microphone and its effects over the record — kept as a file to give them; and pitch correction on a microphone.", module: "karaoke", status: "shipped", stage: "voice", source: "KARAOKE §5 (K9), §12" },
];

export const FACT_BY_ID: Record<string, Fact> = Object.fromEntries(FACTS.map((f) => [f.id, f]));

/** The area a module's facts belong to, unless a fact names its own. */
const MODULE_AREA: Record<Module | "foundation", Area> = {
  foundation: "mixing",
  four_decks: "mixing",
  stems: "mixing",
  autopilot: "assist",
  assistant: "assist",
  teacher: "learn",
  karaoke: "karaoke",
  crowd: "show",
  controllers: "hands",
  dvs: "hands",
  video: "show",
  streaming: "show",
  plugins: "mixing",
  sources: "library",
  events: "show",
  replay: "show",
};

/** Facts whose module puts them in the wrong place on a page. */
const AREA_OF: Record<string, Area> = {
  record: "show",
  library: "library",
  camelot: "library",
  waveforms: "library",
  phrases: "library",
  find: "library",
  keyboard: "hands",
  mapped: "hands",
  themes: "look",
  layouts: "hands",
  requests: "karaoke",
  share: "show",
  linux: "editions",
  oldmac: "editions",
  deckouts: "show",
  outputs: "show",
  api: "hands",
  editions: "editions",
  trial: "editions",
  marketplace: "look",
  "hobbyist-free": "editions",
  "quiet-cards": "editions",
  "look-studio": "look",
  "theme-packs": "look",
  windows: "editions",
  gig: "editions",
  karaoke: "karaoke",
};

/** Where a fact belongs on a page that lists them all. */
export function areaOf(f: Fact): Area {
  return f.area ?? AREA_OF[f.id] ?? MODULE_AREA[f.module];
}

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
