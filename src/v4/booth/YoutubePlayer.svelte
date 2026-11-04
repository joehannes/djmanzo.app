<!--
  YouTube player bar: sits in the top-right control region of the booth.
  Shows video with full controls, track info, genre badge, and transport.
  Genre is synced with the crate's active filter selection.
  The iframe src only changes when the video ID actually changes, preventing
  Svelte from destroying/recreating the player on unrelated reactive updates.
-->
<script lang="ts">
  import { crate } from "../crate/crate.svelte";
  import { i18n } from "../i18n.svelte";
  import { GENRE_BY_ID } from "../../lib/genres";

  const caps = (t: string) => t.toLocaleUpperCase(i18n.lang);

  // Stable video ID — only used to build the embed URL when it actually changes.
  // This prevents Svelte from recreating the iframe on every tick.
  let stableVideoId = $state<string | null>(null);

  $effect(() => {
    if (crate.playing && crate.playing !== stableVideoId) {
      stableVideoId = crate.playing;
    } else if (!crate.playing) {
      stableVideoId = null;
    }
  });

  const embedUrl = $derived(
    stableVideoId
      ? `https://www.youtube.com/embed/${stableVideoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&controls=1&fs=1&playsinline=1&enablejsapi=1`
      : ""
  );

  const track = $derived(crate.currentTrack);

  // Synced genre: first active genre filter, or first genre of current track
  const activeGenre = $derived.by(() => {
    if (crate.activeGenres.size > 0) {
      const first = [...crate.activeGenres][0];
      return GENRE_BY_ID[first] ?? null;
    }
    if (track?.genres?.length) {
      return GENRE_BY_ID[track.genres[0]] ?? null;
    }
    return null;
  });
</script>

<div class="yt-player" class:active={!!crate.playing} data-yt-player>
  {#if stableVideoId && embedUrl}
    <div class="yt-video-wrap">
      <iframe
        class="yt-frame"
        src={embedUrl}
        title="YouTube player"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
        loading="eager"
      ></iframe>
      {#if activeGenre}
        <span class="genre-badge mono">{activeGenre.emoji} {activeGenre.name}</span>
      {/if}
    </div>
    <div class="yt-controls">
      <div class="yt-info">
        <span class="yt-title">{track?.title ?? "Unknown Track"}</span>
        <span class="yt-artist dim">{track?.artist ?? ""}</span>
      </div>
      <div class="yt-transport" role="group" aria-label="Transport">
        <button class="tb mono" onclick={() => crate.prev()} title="Previous" aria-label="Previous">⏮</button>
        <button class="tb mono stop" onclick={() => crate.stop()} title="Stop" aria-label="Stop">⏹</button>
        <button class="tb mono" onclick={() => crate.next()} title="Next" aria-label="Next">⏭</button>
      </div>
    </div>
  {:else}
    <div class="yt-empty">
      <span class="empty-icon">▶</span>
      <span class="mono">{caps("Select a track from the Crate")}</span>
      {#if activeGenre}
        <span class="genre-hint dim mono">{activeGenre.emoji} {activeGenre.name}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .yt-player {
    display: flex;
    align-items: stretch;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--booth-radius, 10px);
    border: 1px solid var(--hw-edge, #3a3a40);
    background: linear-gradient(180deg, #1a1a1f, #111114);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.06),
      0 4px 20px rgb(0 0 0 / 0.6);
    max-width: 480px;
    margin-left: auto;
    min-height: 90px;
  }
  .yt-player:not(.active) {
    align-items: center;
    justify-content: center;
  }

  /* Video container */
  .yt-video-wrap {
    flex: none;
    width: 200px;
    aspect-ratio: 16 / 9;
    border-radius: 6px;
    overflow: hidden;
    background: #000;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1);
    position: relative;
  }
  .yt-frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .genre-badge {
    position: absolute;
    top: 4px;
    left: 4px;
    font-size: 9px;
    letter-spacing: 0.06em;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgb(0 0 0 / 0.7);
    color: var(--accent, #ff8a2a);
    pointer-events: none;
  }

  /* Controls area */
  .yt-controls {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }
  .yt-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .yt-title {
    font: 600 13px/1.3 var(--body, sans-serif);
    color: var(--text, #ececf1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .yt-artist {
    font: 400 11px/1.2 var(--body, sans-serif);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Transport buttons */
  .yt-transport {
    display: flex;
    gap: 5px;
  }
  .tb {
    width: 34px;
    height: 28px;
    border: 1px solid var(--hw-edge, #3a3a40);
    border-radius: 5px;
    background: linear-gradient(180deg, #2a2a30, #1c1c21);
    color: var(--hw-print, #8a8a94);
    font-size: 13px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all 0.12s;
    box-shadow: 0 2px 0 #050506;
  }
  .tb:hover {
    background: linear-gradient(180deg, #3a3a42, #2a2a30);
    color: var(--text, #ececf1);
    border-color: var(--accent, #ff8a2a);
  }
  .tb:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 #050506;
  }
  .tb.stop:hover {
    border-color: #ff4444;
    color: #ff6666;
  }

  /* Empty state */
  .yt-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: var(--dim, #555);
    font-size: 12px;
    text-align: center;
  }
  .empty-icon {
    font-size: 24px;
    opacity: 0.4;
  }
  .genre-hint {
    font-size: 10px;
    margin-top: 2px;
  }

  /* Mobile responsive */
  @media (max-width: 760px) {
    .yt-player {
      max-width: 100%;
      gap: 8px;
      padding: 8px 10px;
      min-height: 70px;
    }
    .yt-video-wrap {
      width: 140px;
    }
    .yt-title { font-size: 12px; }
    .yt-artist { font-size: 10px; }
    .tb { width: 28px; height: 24px; font-size: 11px; }
    .genre-badge { font-size: 8px; padding: 1px 4px; }
  }

  @media (max-width: 400px) {
    .yt-player {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      padding: 6px 8px;
    }
    .yt-video-wrap {
      width: 100%;
      max-height: 120px;
    }
    .yt-controls {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .yt-info { flex: 1; min-width: 0; }
    .tb { width: 26px; height: 22px; font-size: 10px; }
  }
</style>