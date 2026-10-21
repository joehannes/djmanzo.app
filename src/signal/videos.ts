/**
 * The owner's videos of the application, offered in a stage's reveal.
 *
 * The owner adds them in Backstage as YouTube links (§139: the product is
 * shown by the owner's own videos and the screenshots folder), each tagged
 * with the stage it shows and, if it is about one, a style. Nothing is
 * fetched from YouTube until the visitor presses play.
 */
import type { StageId } from "../style/genome/types";

export interface Video {
  /** A YouTube video id. */
  id: string;
  title: string;
  genre?: string | null;
  stage?: string | null;
}

/** The video for a stage: one made for the visitor's style first, then any for the stage. */
export function videoFor(videos: Video[], stage: StageId, style: string): Video | null {
  const here = videos.filter((v) => v.stage === stage);
  return here.find((v) => v.genre === style) ?? here.find((v) => !v.genre) ?? here[0] ?? null;
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
