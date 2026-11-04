/**
 * The YouTube crate: a bottom-drawer playlist that sits beside the booth.
 * State lives here so any component can read or mutate it reactively.
 *
 * A DJ picks genres from their region, optionally adds an era filter, and
 * the crate shows curated tracks matching those criteria. Fuzzy search
 * narrows further. Clicking a track loads it into the embedded player.
 */

import { CURATED, ERAS, type CrateTrack, type Era } from "./curated";
import { skin, region } from "../region.svelte";
import { bankOfGenres } from "../skins";
import { GENRE_BY_ID } from "../../lib/genres";

/** A track in the current playlist queue. */
export interface QueueItem extends CrateTrack {
  /** Unique key for Svelte each blocks (id + index to allow duplicates). */
  key: string;
}

class CrateState {
  open = $state(false);
  /** Currently playing video ID, or null when idle. */
  playing = $state<string | null>(null);
  /** Active genre filters — toggled on/off by the user. */
  activeGenres = $state<Set<string>>(new Set());
  /** Active era filter, or null for "all eras". */
  activeEra = $state<Era | null>(null);
  /** Fuzzy search query. */
  query = $state("");
  /** The playlist queue: tracks the user has added. */
  queue = $state<QueueItem[]>([]);
  /** Index in queue currently playing, -1 if none. */
  queueIndex = $state(-1);
  /** Prefer Christian/gospel music in search results (on by default). */
  preferChristian = $state(true);

  /** Toggle the drawer open/closed. */
  toggle() {
    this.open = !this.open;
  }

  /** Toggle a genre filter on or off. */
  toggleGenre(id: string) {
    const next = new Set(this.activeGenres);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.activeGenres = next;
  }

  /** Set the era filter (null clears it). */
  setEra(era: Era | null) {
    this.activeEra = this.activeEra === era ? null : era;
  }

  /** Play a track: load it in the embedded player. */
  play(track: CrateTrack) {
    this.playing = track.id;
    // Add to queue if not already there.
    const exists = this.queue.findIndex((q) => q.id === track.id);
    if (exists >= 0) {
      this.queueIndex = exists;
    } else {
      const item: QueueItem = { ...track, key: `${track.id}-${Date.now()}` };
      this.queue = [...this.queue, item];
      this.queueIndex = this.queue.length - 1;
    }
  }

  /** Remove a track from the queue. */
  remove(key: string) {
    const idx = this.queue.findIndex((q) => q.key === key);
    if (idx < 0) return;
    const next = this.queue.filter((q) => q.key !== key);
    this.queue = next;
    if (this.queueIndex >= next.length) this.queueIndex = next.length - 1;
    else if (idx < this.queueIndex) this.queueIndex--;
    // If we removed the playing track, stop.
    if (idx === this.queueIndex && this.playing) {
      // Keep playing the same id if it's still in queue, else stop.
      const still = next[this.queueIndex];
      this.playing = still?.id ?? null;
    }
  }

  /** Skip to next track in queue. */
  next() {
    if (!this.queue.length) return;
    this.queueIndex = (this.queueIndex + 1) % this.queue.length;
    this.playing = this.queue[this.queueIndex].id;
  }

  /** Skip to previous track in queue. */
  prev() {
    if (!this.queue.length) return;
    this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length;
    this.playing = this.queue[this.queueIndex].id;
  }

  /** Stop playback. */
  stop() {
    this.playing = null;
  }

  /**
   * Filtered tracks: matches active genres, era, and fuzzy query against
   * the curated library. When no genres are active, shows all tracks for
   * the current skin's region.
   */
  get filtered(): CrateTrack[] {
    const s = skin();
    const bank = bankOfGenres(s, region.country);
    const regionGenres = new Set([...bank.local, ...bank.common, ...bank.special]);

    let tracks = CURATED;

    // Genre filter: if active, show tracks matching ANY active genre.
    // If none active, default to current region's genres.
    const genreFilter = this.activeGenres.size > 0 ? this.activeGenres : regionGenres;
    tracks = tracks.filter((t) => t.genres.some((g) => genreFilter.has(g)));

    // Era filter.
    if (this.activeEra) {
      tracks = tracks.filter((t) => t.era === this.activeEra);
    }

    // Fuzzy search: match title or artist, case-insensitive.
    const q = this.query.trim().toLowerCase();
    if (q) {
      tracks = tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genres.some((g) => g.includes(q)),
      );
    }

    // Christian music preference: boost/prioritize christian/gospel tracks when enabled.
    // When on, christian tracks sort first; when off, they sort last but still appear.
    if (this.preferChristian) {
      tracks.sort((a, b) => {
        const aChris = a.genres.includes("christian") || a.genres.includes("gospel");
        const bChris = b.genres.includes("christian") || b.genres.includes("gospel");
        if (aChris && !bChris) return -1;
        if (!aChris && bChris) return 1;
        return 0;
      });
    }

    return tracks;
  }

  /** The currently playing track object, or null. */
  get currentTrack(): CrateTrack | null {
    if (!this.playing) return null;
    return this.queue.find((q) => q.id === this.playing) ?? CURATED.find((t) => t.id === this.playing) ?? null;
  }

  /** Available genres for the current skin, as display-ready objects. */
  get availableGenres() {
    const s = skin();
    const bank = bankOfGenres(s, region.country);
    const all = [...new Set([...bank.local, ...bank.common, ...bank.special])];
    return all
      .map((id) => GENRE_BY_ID[id])
      .filter(Boolean)
      .map((g) => ({ id: g.id, name: g.name, emoji: g.emoji }));
  }
}

export const crate = new CrateState();