<!--
  The YouTube crate: a bottom-drawer playlist beside the booth. A DJ opens
  it, picks genres from their region, filters by era, searches for tracks,
  and builds a queue of real YouTube videos to play through an embedded
  player. The micro-screen shows the video; the list below is the crate.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { crate } from "./crate.svelte";
  import { ERAS, ERA_LABELS, type Era } from "./curated";
  import { i18n } from "../i18n.svelte";
  import { skin } from "../region.svelte";
  import { setYoutubeActive } from "../booth/booth.svelte";

  const s = $derived(skin());
  const labels = $derived(ERA_LABELS[i18n.lang] ?? ERA_LABELS.en);
  const caps = (t: string) => t.toLocaleUpperCase(i18n.lang);
  const filtered = $derived(crate.filtered);
  const genres = $derived(crate.availableGenres);

  /**
   * YouTube embed URL — rebuilt only when the playing video ID changes.
   * Using a plain iframe avoids the YT.Player API race conditions where
   * the DOM node gets replaced before the player object is ready.
   */
  const embedUrl = $derived(
    crate.playing
      ? `https://www.youtube.com/embed/${crate.playing}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`
      : ""
  );

  // Mark YouTube as active source when playing, deactivate when stopped.
  $effect(() => {
    setYoutubeActive(!!crate.playing);
  });

  // Listen for YouTube postMessage events for auto-advance.
  onMount(() => {
    function onMessage(e: MessageEvent) {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "onStateChange" && data.info === 0) {
          // Video ended — advance to next track.
          crate.next();
        }
      } catch {
        // Ignore non-JSON messages.
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });
</script>

<div class="crate" class:open={crate.open} aria-label="YouTube Crate">
  <!-- Tab handle to toggle -->
  <button class="tab" onclick={() => crate.toggle()} aria-expanded={crate.open}>
    <span class="tab-icon">♫</span>
    <span class="tab-label mono">{caps("Crate")}</span>
    {#if crate.queue.length}
      <span class="badge mono">{crate.queue.length}</span>
    {/if}
    <span class="chevron" class:up={crate.open}>▲</span>
  </button>

  <!-- Drawer body -->
  <div class="drawer">
    <!-- Top row: player + controls -->
    <div class="top">
      <div class="player-wrap">
        {#if crate.playing}
          <iframe
            class="yt-frame"
            src={embedUrl}
            title="YouTube player"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        {:else}
          <div class="player-empty">
            <span class="empty-icon">▶</span>
            <span class="mono">{caps("Pick a track")}</span>
          </div>
        {/if}
      </div>
      <div class="controls">
        <button class="ctrl" onclick={() => crate.prev()} title="Previous">⏮</button>
        <button class="ctrl" onclick={() => crate.stop()} title="Stop">⏹</button>
        <button class="ctrl" onclick={() => crate.next()} title="Next">⏭</button>
      </div>
    </div>

    <!-- Search bar -->
    <div class="search-row">
      <input
        type="search"
        class="search mono"
        placeholder="Search tracks…"
        bind:value={crate.query}
      />
    </div>

    <!-- Genre chips -->
    <div class="filters">
      <div class="genre-row">
        {#each genres as g (g.id)}
          <button
            class="chip"
            class:on={crate.activeGenres.has(g.id)}
            onclick={() => crate.toggleGenre(g.id)}
          >
            <span aria-hidden="true">{g.emoji}</span>
            <span>{g.name}</span>
          </button>
        {/each}
      </div>
      <!-- Era filters -->
      <div class="era-row">
        <button
          class="chip era"
          class:on={!crate.activeEra}
          onclick={() => crate.setEra(null)}
        >All</button>
        {#each ERAS as era (era)}
          <button
            class="chip era"
            class:on={crate.activeEra === era}
            onclick={() => crate.setEra(era)}
          >{labels[era]}</button>
        {/each}
      </div>
    </div>

    <!-- Track list / queue tabs -->
    <div class="lists">
      <!-- Browse pane -->
      <div class="pane browse">
        <span class="pane-label mono">{caps("Browse")} · {filtered.length}</span>
        <ul class="track-list">
          {#each filtered as track (track.id)}
            <li class="track" class:playing={crate.playing === track.id}>
              <button class="play-btn" onclick={() => crate.play(track)}>
                {#if crate.playing === track.id}
                  <span class="eq"><span></span><span></span><span></span></span>
                {:else}
                  ▶
                {/if}
              </button>
              <div class="info">
                <span class="title">{track.title}</span>
                <span class="artist dim">{track.artist}</span>
              </div>
              <span class="era-tag mono">{labels[track.era]}</span>
            </li>
          {/each}
          {#if !filtered.length}
            <li class="empty-msg dim">No tracks match.</li>
          {/if}
        </ul>
      </div>

      <!-- Queue pane -->
      <div class="pane queue-pane">
        <span class="pane-label mono">{caps("Queue")} · {crate.queue.length}</span>
        <ul class="track-list">
          {#each crate.queue as item (item.key)}
            <li class="track" class:playing={crate.playing === item.id}>
              <button class="play-btn" onclick={() => crate.play(item)}>
                {#if crate.playing === item.id}
                  <span class="eq"><span></span><span></span><span></span></span>
                {:else}
                  ▶
                {/if}
              </button>
              <div class="info">
                <span class="title">{item.title}</span>
                <span class="artist dim">{item.artist}</span>
              </div>
              <button class="remove-btn" onclick={() => crate.remove(item.key)}>✕</button>
            </li>
          {/each}
          {#if !crate.queue.length}
            <li class="empty-msg dim">Queue is empty.</li>
          {/if}
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .crate {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 900;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
  }
  .tab {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px 6px;
    border: 1px solid var(--line);
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .tab:hover { background: var(--raised); }
  .tab-icon { font-size: 16px; }
  .tab-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 999px;
    background: var(--accent);
    color: var(--on-accent);
  }
  .chevron {
    font-size: 10px;
    transition: transform 0.3s ease;
    color: var(--dim);
  }
  .chevron.up { transform: rotate(180deg); }

  .drawer {
    pointer-events: auto;
    width: 100%;
    max-width: 1240px;
    max-height: 0;
    overflow: hidden;
    background: var(--bg);
    border-top: 1px solid var(--line);
    transition: max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .crate.open .drawer {
    max-height: 70vh;
    overflow-y: auto;
  }

  /* Top: player + transport */
  .top {
    display: flex;
    gap: 12px;
    padding: 16px var(--gutter);
    align-items: stretch;
    border-bottom: 1px solid var(--line);
  }
  .player-wrap {
    flex: 1;
    aspect-ratio: 16 / 9;
    max-height: 220px;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  .yt-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
  .player-empty {
    display: grid;
    place-items: center;
    gap: 8px;
    height: 100%;
    color: var(--dim);
    font-size: 13px;
  }
  .empty-icon { font-size: 28px; opacity: 0.4; }
  .controls {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
  }
  .ctrl {
    width: 40px;
    height: 40px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;
  }
  .ctrl:hover {
    background: var(--raised);
    border-color: var(--accent);
  }

  /* Search */
  .search-row { padding: 10px var(--gutter); }
  .search {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
  }
  .search:focus { outline: none; border-color: var(--accent); }

  /* Filters */
  .filters {
    padding: 4px var(--gutter) 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .genre-row, .era-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: transparent;
    color: var(--dim);
    font: 500 12px/1 var(--body);
    cursor: pointer;
    transition: all 0.15s;
  }
  .chip:hover { border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); color: var(--text); }
  .chip.on {
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border-color: var(--accent);
    color: var(--accent);
  }
  .chip.era { font-family: var(--mono); font-size: 11px; letter-spacing: 0.04em; }

  /* Lists */
  .lists {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--line);
    border-top: 1px solid var(--line);
  }
  @media (max-width: 760px) {
    .lists { grid-template-columns: 1fr; }
  }
  .pane {
    background: var(--bg);
    padding: 12px var(--gutter);
    max-height: 300px;
    overflow-y: auto;
  }
  .pane-label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 8px;
  }
  .track-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .track {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    transition: background-color 0.15s;
  }
  .track:hover { background: var(--surface); }
  .track.playing { background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
  .play-btn {
    flex: none;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent) 14%, var(--raised));
    color: var(--accent);
    font-size: 12px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background-color 0.15s;
  }
  .play-btn:hover { background: color-mix(in srgb, var(--accent) 28%, var(--raised)); }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .title {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .artist {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .era-tag {
    flex: none;
    font-size: 10px;
    color: var(--dim);
    letter-spacing: 0.04em;
  }
  .remove-btn {
    flex: none;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--dim);
    font-size: 12px;
    cursor: pointer;
    transition: color 0.15s, background-color 0.15s;
  }
  .remove-btn:hover { color: #ff4444; background: color-mix(in srgb, #ff4444 10%, transparent); }
  .empty-msg {
    padding: 20px 0;
    text-align: center;
    font-size: 13px;
  }

  /* Equaliser bars animation for playing track */
  .eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
  }
  .eq span {
    width: 3px;
    background: var(--accent);
    border-radius: 1px;
    animation: eq-bar 0.6s ease-in-out infinite alternate;
  }
  .eq span:nth-child(1) { height: 60%; animation-delay: 0s; }
  .eq span:nth-child(2) { height: 100%; animation-delay: 0.15s; }
  .eq span:nth-child(3) { height: 40%; animation-delay: 0.3s; }
  @keyframes eq-bar {
    0% { height: 30%; }
    100% { height: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .eq span { animation: none; height: 70%; }
    .drawer { transition: none; }
    .chevron { transition: none; }
  }
</style>