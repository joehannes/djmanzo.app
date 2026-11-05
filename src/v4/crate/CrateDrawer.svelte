<!--
  The YouTube crate: a pure playlist and search panel. The video player lives
  in the booth's LCD area (see Booth.svelte); this drawer is exclusively for
  browsing curated tracks by genre/era, searching, and building a queue.
  Local deck sounds are replaced by YouTube music when a track is playing.
-->
<script lang="ts">
  import { crate } from "./crate.svelte";
  import { ERAS, ERA_LABELS } from "./curated";
  import { i18n } from "../i18n.svelte";
  import { skin } from "../region.svelte";
  import { setYoutubeActive } from "../booth/booth.svelte";

  const labels = $derived(ERA_LABELS[i18n.lang] ?? ERA_LABELS.en);
  const caps = (t: string) => t.toLocaleUpperCase(i18n.lang);
  const filtered = $derived(crate.filtered);
  const genres = $derived(crate.availableGenres);

  // Mark YouTube as active source when playing, deactivate when stopped.
  $effect(() => {
    setYoutubeActive(!!crate.playing);
  });

  // Scroll behaviour: save position when crate opens, scroll so the player
  // (top of booth) is visible at the top of viewport; restore on close.
  // If playing, keep player in view even if crate hides lower booth areas.
  let savedScrollY = $state<number | null>(null);
  $effect(() => {
    if (crate.open) {
      savedScrollY = window.scrollY;
      const player = document.querySelector("[data-yt-player]");
      const booth = document.getElementById("booth-console");
      const target = player ?? booth;
      if (target) {
        // Scroll so player/top-of-booth is near top of viewport, accounting for fixed navbar
        const barHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bar") || "60");
        const rect = target.getBoundingClientRect();
        const scrollTo = window.scrollY + rect.top - barHeight - 12;
        window.scrollTo({ top: Math.max(0, scrollTo), behavior: "smooth" });
      }
    } else if (savedScrollY !== null) {
      // Only restore if player is NOT playing — if playing, stay near the player
      if (!crate.playing) {
        requestAnimationFrame(() => window.scrollTo({ top: savedScrollY!, behavior: "smooth" }));
      }
      savedScrollY = null;
    }
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

  <!-- Drawer body: playlist and search only — video is in the booth -->
  <div class="drawer">
    <!-- Now playing indicator with play/pause -->
    {#if crate.playing || crate.queue.length > 0}
      <div class="now-playing">
        <button class="play-pause-btn" onclick={() => {
          if (crate.playing) {
            crate.stop();
          } else if (crate.queue.length > 0) {
            const idx = crate.queueIndex >= 0 ? crate.queueIndex : 0;
            crate.play(crate.queue[idx]);
          }
        }} aria-label={crate.playing ? "Pause" : "Play"}>
          {#if crate.playing}
            <span class="eq"><span></span><span></span><span></span></span>
          {:else}
            <span class="play-icon">▶</span>
          {/if}
        </button>
        <span class="np-title">{crate.currentTrack?.title ?? (crate.queue.length ? crate.queue[0].title : "")}</span>
        <span class="np-artist dim">{crate.currentTrack?.artist ?? (crate.queue.length ? crate.queue[0].artist : "")}</span>
        <div class="transport">
          <button class="ctrl sm" onclick={() => crate.prev()} title="Previous">⏮</button>
          <button class="ctrl sm stop" onclick={() => crate.stop()} title="Stop">⏹</button>
          <button class="ctrl sm" onclick={() => crate.next()} title="Next">⏭</button>
        </div>
      </div>
    {/if}

    <!-- Search bar with Christian music toggle -->
    <div class="search-row">
      <input
        type="search"
        class="search mono"
        placeholder="Search tracks…"
        bind:value={crate.query}
      />
      <label class="christian-toggle mono" title="Prefer Christian/gospel music in results">
        <input type="checkbox" bind:checked={crate.preferChristian} />
        <span class="toggle-label">✝ Christian</span>
      </label>
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
  .christian-toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    margin-top: 6px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: transparent;
    color: var(--dim);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    flex: none;
  }
  .christian-toggle:hover { border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); color: var(--text); }
  .christian-toggle input { display: none; }
  .christian-toggle input:checked + .toggle-label { color: var(--accent); }
  .christian-toggle:has(input:checked) {
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border-color: var(--accent);
  }
  .toggle-label { pointer-events: none; }

  .crate.open .drawer {
    max-height: 60vh;
    overflow-y: auto;
  }

  /* Now playing bar — compact with play/pause */
  .now-playing {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px var(--gutter);
    border-bottom: 1px solid var(--line);
    background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  }
  .play-pause-btn {
    flex: none;
    width: 26px;
    height: 26px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent) 12%, var(--surface));
    color: var(--accent);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all 0.15s;
  }
  .play-pause-btn:hover {
    background: color-mix(in srgb, var(--accent) 24%, var(--surface));
    border-color: var(--accent);
  }
  .play-icon { font-size: 9px; margin-left: 2px; }
  .np-title { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
  .np-artist { font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
  .transport { display: flex; gap: 3px; margin-left: auto; flex: none; }
  .ctrl.sm {
    width: 26px;
    height: 26px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: var(--surface);
    color: var(--text);
    font-size: 11px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background-color 0.15s, border-color 0.15s;
  }
  .ctrl.sm:hover { background: var(--raised); border-color: var(--accent); }
  .ctrl.sm.stop:hover { border-color: #ff4444; color: #ff6666; }

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
    flex: none;
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
  /* Mobile: compact layout for small viewports */
  @media (max-width: 760px) {
    .tab {
      padding: 6px 14px 5px;
      gap: 6px;
    }
    .tab-label { font-size: 10px; }
    .badge { font-size: 9px; padding: 1px 5px; }
    .crate.open .drawer { max-height: 55vh; }
    .now-playing {
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px var(--gutter);
    }
    .np-title { font-size: 12px; }
    .np-artist { font-size: 10px; }
    .transport { gap: 3px; }
    .ctrl.sm { width: 26px; height: 26px; font-size: 11px; }
    .search-row { padding: 8px var(--gutter); }
    .search { padding: 8px 10px; font-size: 13px; }
    .filters { padding: 2px var(--gutter) 8px; gap: 6px; }
    .chip { padding: 4px 9px; font-size: 11px; gap: 4px; }
    .chip.era { font-size: 10px; }
    .lists { grid-template-columns: 1fr; }
    .pane { max-height: 220px; padding: 10px var(--gutter); }
    .pane-label { font-size: 9px; margin-bottom: 6px; }
    .track { padding: 6px 8px; gap: 8px; }
    .play-btn { width: 26px; height: 26px; font-size: 10px; }
    .title { font-size: 12px; }
    .artist { font-size: 10px; }
    .era-tag { font-size: 9px; }
    .remove-btn { width: 20px; height: 20px; font-size: 10px; }
    .empty-msg { font-size: 12px; padding: 14px 0; }
    .eq { height: 12px; }
    .eq span { width: 2px; }
  }

  /* Extra-small phones */
  @media (max-width: 400px) {
    .tab { padding: 5px 10px 4px; gap: 4px; }
    .tab-icon { font-size: 14px; }
    .tab-label { font-size: 9px; letter-spacing: 0.08em; }
    .crate.open .drawer { max-height: 50vh; }
    .now-playing { padding: 6px var(--gutter); }
    .np-title { font-size: 11px; }
    .np-artist { font-size: 9px; }
    .ctrl.sm { width: 24px; height: 24px; font-size: 10px; border-radius: 4px; }
    .search { padding: 7px 8px; font-size: 12px; border-radius: 6px; }
    .chip { padding: 3px 7px; font-size: 10px; }
    .pane { max-height: 180px; padding: 8px var(--gutter); }
    .track { padding: 5px 6px; gap: 6px; }
    .play-btn { width: 24px; height: 24px; font-size: 9px; }
    .title { font-size: 11px; }
    .artist { font-size: 9px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .eq span { animation: none; height: 70%; }
    .drawer { transition: none; }
    .chevron { transition: none; }
  }
</style>