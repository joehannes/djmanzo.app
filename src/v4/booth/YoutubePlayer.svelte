<!--
  Winamp-inspired YouTube player v3: sits in the top control region of the booth.
  Each skin gives it a structurally distinct shape, texture, border treatment,
  and button style — not just colour swaps. The video frame is integrated as
  part of the player chassis, and transport controls feel like physical hardware.

  v3 fix: All per-skin styling uses inline styles via CSS custom properties
  instead of data-attribute selectors, which break under Svelte 5's scoped CSS.
  This guarantees the Winamp-inspired structural differences render correctly.

  Playback bug fix: stableVideoId only updates when the actual video ID changes,
  preventing iframe recreation on unrelated reactive updates. The iframe src
  uses a key derived from stableVideoId to force navigation on track change.
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
  let stableVideoId = $state<string | null>(null);
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

  // Compute inline styles from skin tokens — avoids Svelte scoping issues with data-attr selectors
  const playerStyle = $derived.by(() => {
    const s = bskin;
    let borderRadius = "2px";
    if (s.playerShape === "rounded") borderRadius = "12px";
    else if (s.playerShape === "pill") borderRadius = "24px";
    else if (s.playerShape === "notched") borderRadius = "4px";

    let border = "2px solid var(--hw-edge, #3a3a40)";
    if (s.playerBorder === "thin") border = "1px solid var(--hw-edge, #3a3a40)";
    else if (s.playerBorder === "thick") border = "3px solid var(--hw-edge, #3a3a40)";
    else if (s.playerBorder === "double") border = "3px double var(--hw-edge, #3a3a40)";
    else if (s.playerBorder === "inset") border = "2px inset var(--hw-edge, #3a3a40)";
    else if (s.playerBorder === "bevel") border = "2px outset var(--hw-edge, #3a3a40)";

    return `border-radius: ${borderRadius}; border: ${border}; background-image: ${s.playerTexture}, linear-gradient(180deg, #1e1e24, #131318); box-shadow: ${s.playerShadow};`;
  });

  const titleBarStyle = $derived.by(() => {
    const s = bskin;
    if (s.titleBarStyle === "raised") return "background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-bottom: 1px solid var(--hw-edge, #3a3a40); box-shadow: 0 1px 0 rgba(0,0,0,0.3);";
    if (s.titleBarStyle === "recessed") return `background: ${s.lcdBg}; border-bottom: 1px solid rgba(0,0,0,0.4); box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);`;
    if (s.titleBarStyle === "gradient") return "background: linear-gradient(90deg, color-mix(in srgb, var(--accent, #ff8a2a) 15%, transparent), transparent); border-bottom: 1px solid var(--hw-edge, #3a3a40);";
    return "background: transparent; border-bottom: 1px solid var(--hw-edge, #3a3a40);";
  });

  const videoWindowStyle = $derived.by(() => {
    const s = bskin;
    if (s.videoShape === "rounded") return "border-radius: 8px; margin: 4px; width: calc(100% - 8px);";
    if (s.videoShape === "arch") return "border-radius: 16px 16px 4px 4px; margin: 4px 4px 0; width: calc(100% - 8px);";
    if (s.videoShape === "circle") return "border-radius: 50%; aspect-ratio: 1; margin: 8px auto; width: 160px;";
    return "border-radius: 0;";
  });

  const btnStyle = $derived.by(() => {
    const s = bskin;
    if (s.transportShape === "round") return "width: 32px; height: 32px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.4);";
    if (s.transportShape === "diamond") return "width: 32px; height: 32px; border-radius: 4px; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); border: none; box-shadow: none;";
    if (s.transportShape === "pill") return "width: 40px; height: 26px; border-radius: 13px; box-shadow: 0 2px 0 #050506;";
    return "width: 36px; height: 28px; border-radius: 3px; box-shadow: 0 2px 0 #050506;";
  });

  // Notched clip-path applied via inline style since clip-path can't be in CSS var
  const playerClipPath = $derived(bskin.playerShape === "notched" ? "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)" : "");

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
  style={playerStyle + (playerClipPath ? ` clip-path: ${playerClipPath};` : "")}
>
  {#if stableVideoId && embedUrl}
    <div class="title-bar mono" style={titleBarStyle}>
      <span class="title-text">{track?.title ?? "Unknown Track"}</span>
      <span class="title-artist dim">{track?.artist ?? ""}</span>
      {#if activeGenre}
        <span class="genre-tag">{activeGenre.emoji}</span>
      {/if}
    </div>

    <div class="video-window" style={videoWindowStyle}>
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

    <div class="transport-strip" role="group" aria-label="Transport">
      <button class="hw-btn prev" style={btnStyle} onclick={() => crate.prev()} title="Previous" aria-label="Previous">
        <span class="btn-icon">⏮</span>
      </button>
      <button class="hw-btn stop" style={btnStyle} onclick={() => crate.stop()} title="Stop" aria-label="Stop">
        <span class="btn-icon">⏹</span>
      </button>
      <button class="hw-btn next" style={btnStyle} onclick={() => crate.next()} title="Next" aria-label="Next">
        <span class="btn-icon">⏭</span>
      </button>
      <div class="track-info mono">
        <span class="info-title">{track?.title ?? ""}</span>
      </div>
    </div>
  {:else}
    <div class="title-bar mono" style={titleBarStyle}>
      <span class="title-text dim">{caps("No Track Selected")}</span>
      {#if activeGenre}
        <span class="genre-tag">{activeGenre.emoji}</span>
      {/if}
    </div>
    <div class="video-window empty-video" style={videoWindowStyle}>
      <div class="empty-display">
        <span class="empty-icon">♫</span>
        <span class="mono empty-text">{caps("Select a track from the Crate")}</span>
        {#if activeGenre}
          <span class="genre-hint dim mono">{activeGenre.emoji} {activeGenre.name}</span>
        {/if}
      </div>
    </div>
    <div class="transport-strip" role="group" aria-label="Transport">
      <button class="hw-btn prev" style={btnStyle} onclick={() => crate.prev()} title="Previous" aria-label="Previous" disabled={!crate.queue.length}>
        <span class="btn-icon">⏮</span>
      </button>
      <button class="hw-btn stop" style={btnStyle} onclick={() => crate.stop()} title="Stop" aria-label="Stop" disabled={!crate.playing}>
        <span class="btn-icon">⏹</span>
      </button>
      <button class="hw-btn next" style={btnStyle} onclick={() => crate.next()} title="Next" aria-label="Next" disabled={!crate.queue.length}>
        <span class="btn-icon">⏭</span>
      </button>
      <div class="track-info mono">
        <span class="info-title dim">{caps("Idle")}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Base chassis — skin-specific styling applied via inline styles to avoid Svelte scoping issues */
  .yt-player {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-width: 520px;
    margin-left: auto;
    overflow: hidden;
    position: relative;
    transition: all 0.2s ease;
  }

  /* Title bar base */
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

  /* Video window base — shape applied via inline style */
  .video-window {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
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

  /* Empty video placeholder */
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

  /* Transport strip */
  .transport-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent);
    border-top: 1px solid var(--hw-edge, #3a3a40);
  }

  /* Hardware button base — shape/size applied via inline style */
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
  .hw-btn:disabled {
    opacity: 0.35;
    cursor: default;
    pointer-events: none;
  }
  .btn-icon {
    font-size: 13px;
    line-height: 1;
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

  /* Mobile responsive */
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
  }
</style>