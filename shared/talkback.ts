/**
 * Talkback, the discussion space (§134): its communities, flair and rules,
 * and how a new account grows into it. Read by the Worker and the page.
 * Good, related subjects only: the craft, the music, the gear, the life
 * around the gigs, and djmanzo itself.
 */

export interface Community {
  id: string;
  name: string;
  group: string;
  about: string;
}

export const COMMUNITIES: Community[] = [
  { id: "mixing", group: "Craft", name: "Mixing and transitions", about: "Getting from one record to the next: blends, cuts, echoes out, the long mix and the short one." },
  { id: "phrasing", group: "Craft", name: "Beatmatching and phrasing", about: "By ear and with sync; counting bars; where the next record should come in." },
  { id: "harmonic", group: "Craft", name: "Harmonic mixing", about: "Keys, the Camelot wheel, keylock, and when to ignore all of it." },
  { id: "scratch", group: "Craft", name: "Scratching and turntablism", about: "Cuts, tears, flares, timecode vinyl and the platter." },
  { id: "karaoke", group: "Craft", name: "Hosting karaoke", about: "Running the rotation, the shy singer, the mic, and the room between songs." },
  { id: "room", group: "Craft", name: "Reading the room", about: "Energy, requests, the floor that empties and how to win it back." },
  { id: "edm", group: "Music", name: "EDM & electronic", about: "House, techno, trance, bass and everything with a four-to-the-floor heart." },
  { id: "jazzage", group: "Music", name: "Jazz age & vintage", about: "Electro swing, the 1920s in new clothes, and the records they sample." },
  { id: "latin", group: "Music", name: "Latin & Caribbean", about: "Bachata, merengue, salsa, reggaeton, dembow, cumbia, kompa and soca." },
  { id: "urban", group: "Music", name: "Urban", about: "Hip-hop, R&B, afrobeats and amapiano." },
  { id: "classics", group: "Music", name: "Classics", about: "The records every generation knows the words to." },
  { id: "party", group: "Music", name: "Party & sing-along", about: "Weddings, open format, Schlager and après-ski." },
  { id: "digging", group: "Music", name: "Crate digging", about: "Finding records: shops, labels, bandcamp, the B-side nobody plays." },
  { id: "controllers", group: "Gear", name: "Controllers and mappings", about: "What to buy, how to map it, and what djmanzo already reads." },
  { id: "sound", group: "Gear", name: "Sound and PA", about: "Speakers, monitors, cables, gain staging and the limiter." },
  { id: "linux", group: "Gear", name: "Linux audio", about: "PipeWire, ALSA, JACK, latency and the machine under the decks." },
  { id: "lighting", group: "Gear", name: "Lighting and visuals", about: "Lights, projectors, MilkDrop and what the room sees." },
  { id: "first-gigs", group: "Gigs and life", name: "First gigs", about: "The first booking, the first set, the first time it went wrong." },
  { id: "preparing", group: "Gigs and life", name: "Preparing a night", about: "Set plans, requests in advance, the venue's rules." },
  { id: "business", group: "Gigs and life", name: "Business basics", about: "Fees, contracts, invoices and saying no." },
  { id: "hearing", group: "Gigs and life", name: "Hearing protection", about: "Earplugs, monitor levels and keeping your ears for the next thirty years." },
  { id: "road", group: "Gigs and life", name: "Health on the road", about: "Sleep, food, late nights and getting home." },
  { id: "beside", group: "Gigs and life", name: "Beside the music", about: "Dance classes, running, production, photography: what else a DJ's life holds." },
  { id: "help", group: "djmanzo", name: "Help", about: "Questions about djmanzo, answered by the people who use it." },
  { id: "show", group: "djmanzo", name: "Show and tell", about: "Your setup, your theme, your mix: what you made with djmanzo." },
  { id: "proposals", group: "djmanzo", name: "Proposals", about: "What djmanzo should do next. The crew carries the best to the wishlist." },
  { id: "outboard", group: "djmanzo", name: "Outboard", about: "One thread for each pack in the marketplace." },
];

export const COMMUNITY_BY_ID: Record<string, Community> = Object.fromEntries(COMMUNITIES.map((c) => [c.id, c]));

export const FLAIRS = [
  { id: "question", name: "Question" },
  { id: "proposal", name: "Proposal" },
  { id: "show", name: "Show & tell" },
  { id: "guide", name: "Guide" },
] as const;

/** The rules, as the community and the screening read them: the good parts only. */
export const RULES = [
  "Be kind. Disagree with ideas, never attack people. No harassment, hate or threats.",
  "Stay on the subject: DJing, music, the gear, the life around gigs, and djmanzo.",
  "No piracy: no links to copied music, stems, samples or software. Share what is yours to share.",
  "No promotion of excess: no glorifying drugs, drink or burning out.",
  "No spam and no advertising unrelated to the craft. Your own mixes and work are welcome where they fit.",
  "No one's personal details, and nothing sexual.",
  "Report what breaks these rules; the crew decides, and always says why.",
];

/** What an account may do at each trust level, a day. */
export const TRUST = [
  { level: 0, name: "New", posts: 3, comments: 10, links: false, about: "For your first three days and until a post of yours has been read: three posts and ten comments a day, no links, and your posts may wait for the crew." },
  { level: 1, name: "Member", posts: 10, comments: 50, links: true, about: "Ten posts and fifty comments a day, links included." },
  { level: 2, name: "Regular", posts: 20, comments: 200, links: true, about: "Twenty posts and two hundred comments a day." },
] as const;

/** Days an account is new for. */
export const NEW_DAYS = 3;
/** Karma that makes a regular. */
export const REGULAR_KARMA = 20;

/** An account's trust level from its age, its posts that have been read, and its karma. */
export function trustLevel(ageMs: number, readPosts: number, karma: number): 0 | 1 | 2 {
  if (ageMs < NEW_DAYS * 86_400_000 || readPosts === 0) return 0;
  return karma >= REGULAR_KARMA ? 2 : 1;
}

/** Reddit's hot: the score's order of magnitude, plus time, so a new post can rise past an old one. */
export function hot(score: number, created: number): number {
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  return sign * order + created / 1000 / 45000;
}

/** The deepest a comment nests. */
export const DEEPEST = 6;
