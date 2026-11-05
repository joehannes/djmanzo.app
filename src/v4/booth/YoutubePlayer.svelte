<!--
  Winamp-inspired YouTube player v2: sits in the top control region of the booth.
  Each skin gives it a structurally distinct shape, texture, border treatment,
  and button style — not just colour swaps. The video frame is integrated as
  part of the player chassis, and transport controls feel like physical hardware.

  Playback bug fix: stableVideoId only updates when the actual video ID changes,
  preventing iframe recreation on unrelated reactive updates. The iframe src
  uses a key derived from stableVideoId to force navigation on track change.

  BUILD_BUST: 2026-11-05T14:55:00Z
-->
<script lang="ts">
  import { crate } from "../crate/crate.svelte";
  import { i18n } from "../i18n.svelte";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { boothSkin } from "./booth-skins";
  import { skin } from "../region.svelte";

  const caps = (t: string) => t.toLocaleUpperCase(i18n.lang);
  const bskin = $derived(boothSkin(skin().id));

  // Stable video ID — only changes when the actual track changes.
  // This prevents Svelte from recreating the iframe on every tick.
  let stableVideoId = $state<string | null>(null);
  // A monotonic key that increments on each track change, forcing iframe reload.
  let videoKey = $state(0);

  $effect(() => {
    if (crate.playing && crate.playing !== stableVideoId) {
      stableVideoId = crate.playing;
      videoKey++;
    } else if (!crate.playing && stableVideoId !== null) {
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

  // Play/pause toggle for global controls
  export function togglePlay() {
    if (crate.playing) {
      crate.stop();
    } else if (crate.queue.length > 0) {
      const idx = crate.queueIndex >= 0 ? crate.queueIndex : 0;
      crate.play(crate.queue[idx]);
    }
  }

  export function isPlaying(): boolean {
    return !!crate.playing;
  }
</script>

<div
  class="yt-player"
  class:active={!!crate.playing}
  data-yt-player
  data-player-shape={bskin.playerShape}
  data-player-border={bskin.playerBorder}
  data-video-shape={bskin.videoShape}
  data-transport-shape={bskin.transportShape}
  data-title-bar={bskin.titleBarStyle}
  style:--player-texture={bskin.playerTexture}
  style:--player-shadow={bskin.playerShadow}
>
  {#if stableVideoId && embedUrl}
    <!-- Title bar: skin-specific style -->
    <div class="title-bar mono">
      <span class="title-text">{track?.title ?? "Unknown Track"}</span>
      <span class="title-artist dim">{track?.artist ?? ""}</span>
      {#if activeGenre}
        <span class="genre-tag">{activeGenre.emoji}</span>
      {/if}
    </div>

    <!-- Video window: integrated into the chassis -->
    <div class="video-window">
      {#key videoKey}
      <iframe
        class="yt-frame"
        src={embedUrl}
        title="YouTube player"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
        loading="eager"
      ></iframe>
      {/key}
      {#if activeGenre}
        <span class="genre-overlay mono">{activeGenre.name}</span>
      {/if}
    </div>

    <!-- Transport strip: styled as physical hardware controls -->
    <div class="transport-strip" role="group" aria-label="Transport">
      <button class="hw-btn prev" onclick={() => crate.prev()} title="Previous" aria-label="Previous">
        <span class="btn-icon">⏮</span>
      </button>
      <button class="hw-btn stop" onclick={() => crate.stop()} title="Stop" aria-label="Stop">
        <span class="btn-icon">⏹</span>
      </button>
      <button class="hw-btn next" onclick={() => crate.next()} title="Next" aria-label="Next">
        <span class="btn-icon">⏭</span>
      </button>
      <div class="track-info mono">
        <span class="info-title">{track?.title ?? ""}</span>
      </div>
    </div>
  {:else}
    <!-- Empty state: still shows full Winamp-styled chassis with skin-specific shape/border/texture -->
    <div class="title-bar mono">
      <span class="title-text dim">{caps("No Track Selected")}</span>
      {#if activeGenre}
        <span class="genre-tag">{activeGenre.emoji}</span>
      {/if}
    </div>
    <div class="video-window empty-video">
      <div class="empty-display">
        <span class="empty-icon">♫</span>
        <span class="mono empty-text">{caps("Select a track from the Crate")}</span>
        {#if activeGenre}
          <span class="genre-hint dim mono">{activeGenre.emoji} {activeGenre.name}</span>
        {/if}
      </div>
    </div>
    <div class="transport-strip" role="group" aria-label="Transport">
      <button class="hw-btn prev" onclick={() => crate.prev()} title="Previous" aria-label="Previous" disabled={!crate.queue.length}>
        <span class="btn-icon">⏮</span>
      </button>
      <button class="hw-btn stop" onclick={() => crate.stop()} title="Stop" aria-label="Stop" disabled={!crate.playing}>
        <span class="btn-icon">⏹</span>
      </button>
      <button class="hw-btn next" onclick={() => crate.next()} title="Next" aria-label="Next" disabled={!crate.queue.length}>
        <span class="btn-icon">⏭</span>
      </button>
      <div class="track-info mono">
        <span class="info-title dim">{caps("Idle")}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  /* === BASE CHASSIS (Winamp-inspired structural design) === */
  .yt-player {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-width: 520px;
    margin-left: auto;
    background: linear-gradient(180deg, #1e1e24, #131318);
    background-image: var(--player-texture, none), linear-gradient(180deg, #1e1e24, #131318);
    box-shadow: var(--player-shadow, 0 4px 20px rgb(0 0 0 / 0.6));
    overflow: hidden;
    position: relative;
    transition: all 0.2s ease;
    border: 2px solid var(--hw-edge, #3a3a40);
  }

  /* === SHAPE VARIANTS (Winamp-style structural differences) === */
  /* rect: sharp industrial edges */
  .yt-player[data-player-shape="rect"] {
    border-radius: 2px;
  }
  /* rounded: soft consumer electronics */
  .yt-player[data-player-shape="rounded"] {
    border-radius: 12px;
  }
  /* pill: capsule-shaped portable player */
  .yt-player[data-player-shape="pill"] {
    border-radius: 24px;
  }
  /* notched: distinctive cut corners */
  .yt-player[data-player-shape="notched"] {
    border-radius: 4px;
    clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
  }

  /* === BORDER TREATMENTS === */
  .yt-player[data-player-border="thin"] {
    border: 1px solid var(--hw-edge, #3a3a40);
  }
  .yt-player[data-player-border="thick"] {
    border: 3px solid var(--hw-edge, #3a3a40);
  }
  .yt-player[data-player-border="double"] {
    border: 3px double var(--hw-edge, #3a3a40);
  }
  .yt-player[data-player-border="inset"] {
    border: 2px inset var(--hw-edge, #3a3a40);
  }
  .yt-player[data-player-border="bevel"] {
    border: 2px outset var(--hw-edge, #3a3a40);
  }

  /* === TITLE BAR STYLES === */
  .title-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-size: 11px;
    letter-spacing: 0.06em;
    min-height: 28px;
  }
  .title-text {
    font-weight: 600;
    color: var(--lcd-ink, #38e1c6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }
  .title-artist {
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }
  .genre-tag {
    font-size: 12px;
    flex: none;
  }

  /* flat: no background distinction */
  .yt-player[data-title-bar="flat"] .title-bar {
    background: transparent;
    border-bottom: 1px solid var(--hw-edge, #3a3a40);
  }
  /* raised: elevated panel look */
  .yt-player[data-title-bar="raised"] .title-bar {
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    border-bottom: 1px solid var(--hw-edge, #3a3a40);
    box-shadow: 0 1px 0 rgba(0,0,0,0.3);
  }
  /* recessed: sunken LCD look */
  .yt-player[data-title-bar="recessed"] .title-bar {
    background: var(--lcd-bg, #0a0e14);
    border-bottom: 1px solid rgba(0,0,0,0.4);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
  }
  /* gradient: colourful accent sweep */
  .yt-player[data-title-bar="gradient"] .title-bar {
    background: linear-gradient(90deg, color-mix(in srgb, var(--accent, #ff8a2a) 15%, transparent), transparent);
    border-bottom: 1px solid var(--hw-edge, #3a3a40);
  }

  /* === VIDEO WINDOW === */
  .video-window {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
  }
  /* Video shape variants */
  .yt-player[data-video-shape="rect"] .video-window {
    border-radius: 0;
  }
  .yt-player[data-video-shape="rounded"] .video-window {
    border-radius: 8px;
    margin: 4px;
    width: calc(100% - 8px);
  }
  .yt-player[data-video-shape="arch"] .video-window {
    border-radius: 16px 16px 4px 4px;
    margin: 4px 4px 0;
    width: calc(100% - 8px);
  }
  .yt-player[data-video-shape="circle"] .video-window {
    border-radius: 50%;
    aspect-ratio: 1;
    margin: 8px auto;
    width: 160px;
  }

  .yt-frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .genre-overlay {
    position: absolute;
    bottom: 6px;
    left: 8px;
    font-size: 9px;
    letter-spacing: 0.08em;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgb(0 0 0 / 0.75);
    color: var(--accent, #ff8a2a);
    pointer-events: none;
    text-transform: uppercase;
  }

  /* Empty video placeholder — matches active video-window shape per skin */
  .empty-video {
    display: grid;
    place-items: center;
  }
  .empty-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: var(--dim, #555);
    text-align: center;
  }
  .empty-icon {
    font-size: 28px;
    opacity: 0.35;
  }
  .empty-text {
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .genre-hint {
    font-size: 10px;
    margin-top: 2px;
  }
  .hw-btn:disabled {
    opacity: 0.35;
    cursor: default;
    pointer-events: none;
  }

  /* === TRANSPORT STRIP === */
  .transport-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent);
    border-top: 1px solid var(--hw-edge, #3a3a40);
  }

  /* Hardware button base */
  .hw-btn {
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all 0.12s ease;
    color: var(--hw-print, #8a8a94);
    border: 1px solid var(--hw-edge, #3a3a40);
    background: linear-gradient(180deg, #2a2a30, #1c1c21);
  }
  .hw-btn:hover {
    color: var(--text, #ececf1);
    border-color: var(--accent, #ff8a2a);
    background: linear-gradient(180deg, #3a3a42, #2a2a30);
  }
  .hw-btn:active {
    transform: translateY(1px);
  }
  .hw-btn.stop:hover {
    border-color: #ff4444;
    color: #ff6666;
  }
  .btn-icon {
    font-size: 13px;
    line-height: 1;
  }

  /* Transport button shape variants */
  .yt-player[data-transport-shape="rect"] .hw-btn {
    width: 36px;
    height: 28px;
    border-radius: 3px;
    box-shadow: 0 2px 0 #050506;
  }
  .yt-player[data-transport-shape="round"] .hw-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.4);
  }
  .yt-player[data-transport-shape="diamond"] .hw-btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    transform: rotate(0deg);
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    border: none;
    background: linear-gradient(180deg, #2a2a30, #1c1c21);
    box-shadow: none;
  }
  .yt-player[data-transport-shape="diamond"] .hw-btn:hover {
    background: linear-gradient(180deg, #3a3a42, #2a2a30);
  }
  .yt-player[data-transport-shape="diamond"] .hw-btn:active {
    transform: translateY(1px);
  }
  .yt-player[data-transport-shape="pill"] .hw-btn {
    width: 40px;
    height: 26px;
    border-radius: 13px;
    box-shadow: 0 2px 0 #050506;
  }

  .track-info {
    flex: 1;
    min-width: 0;
    margin-left: 8px;
    overflow: hidden;
  }
  .info-title {
    font-size: 10px;
    letter-spacing: 0.04em;
    color: var(--lcd-ink, #38e1c6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  /* === EMPTY STATE === */
  .yt-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 24px 16px;
    color: var(--dim, #555);
    text-align: center;
    min-height: 120px;
  }
  .empty-icon {
    font-size: 28px;
    opacity: 0.35;
  }
  .empty-text {
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .genre-hint {
    font-size: 10px;
    margin-top: 2px;
  }

  /* === MOBILE RESPONSIVE === */
  @media (max-width: 760px) {
    .yt-player {
      max-width: 100%;
    }
    .title-bar {
      padding: 5px 10px;
      font-size: 10px;
      min-height: 24px;
    }
    .title-artist {
      max-width: 80px;
      font-size: 9px;
    }
    .transport-strip {
      padding: 6px 10px;
      gap: 5px;
    }
    .yt-player[data-transport-shape="rect"] .hw-btn {
      width: 30px;
      height: 24px;
    }
    .yt-player[data-transport-shape="round"] .hw-btn {
      width: 28px;
      height: 28px;
    }
    .yt-player[data-transport-shape="pill"] .hw-btn {
      width: 34px;
      height: 22px;
    }
    .genre-overlay {
      font-size: 8px;
      padding: 1px 6px;
    }
    .info-title {
      font-size: 9px;
    }
  }

  @media (max-width: 400px) {
    .yt-player {
      max-width: 100%;
    }
    .yt-player[data-player-shape="pill"] {
      border-radius: 16px;
    }
    .yt-player[data-player-shape="notched"] {
      clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
    }
    .title-bar {
      padding: 4px 8px;
      gap: 6px;
    }
    .title-artist {
      display: none;
    }
    .transport-strip {
      padding: 5px 8px;
    }
    .yt-player[data-video-shape="circle"] .video-window {
      width: 120px;
    }
  }
</style>