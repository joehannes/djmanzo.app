/**
 * The owner's videos of the application, shown on the home page.
 *
 * The owner adds them in Backstage as YouTube links (§139: the product is
 * shown by the owner's own videos and the screenshots folder), each tagged
 * with the part of the home page it shows. Nothing is fetched from YouTube
 * until the visitor presses play.
 */

export interface Video {
  /** A YouTube video id. */
  id: string;
  title: string;
  genre?: string | null;
  /** Which part of the home page it shows (`VIDEO_PLACES`); older videos name a Signal Path stage. */
  stage?: string | null;
}

/** The parts of the home page a video can show, in the page's order. */
export const VIDEO_PLACES = [
  { id: "deck", name: "The deck, at the top" },
  { id: "stems", name: "Stems" },
  { id: "tour", name: "The tour of the screens" },
  { id: "keys", name: "Keys" },
  { id: "karaoke", name: "Karaoke" },
  { id: "hardware", name: "Hardware" },
  { id: "live", name: "Live: video, lights and streaming" },
] as const;

/** Where a video tagged with one of the Signal Path's stages, before 25 October, now belongs. */
const FROM_STAGE: Record<string, string> = {
  silence: "deck",
  groove: "deck",
  needle: "deck",
  cue: "keys",
  confluence: "stems",
  voice: "karaoke",
  amp: "hardware",
  cone: "live",
  floor: "live",
  afterglow: "live",
};

/** The part of the home page a video shows. */
export const placeOf = (v: Video): string => (v.stage ? (FROM_STAGE[v.stage] ?? v.stage) : "deck");

/** The videos in the home page's order. */
export function ordered(list: Video[]): Video[] {
  const at = (v: Video) => VIDEO_PLACES.findIndex((p) => p.id === placeOf(v));
  return [...list].sort((a, b) => at(a) - at(b));
}

/** Where the player is loaded from, once the visitor asks: YouTube's no-cookie address. */
export const playerSrc = (v: Video) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0`;

let list: Promise<Video[]> | null = null;

/** The site's video list, fetched once per visit; none when the server cannot be reached. */
export function videos(): Promise<Video[]> {
  list ??= fetch("/api/videos")
    .then((r) => (r.ok ? (r.json() as Promise<Video[]>) : []))
    .catch(() => []);
  return list;
}
