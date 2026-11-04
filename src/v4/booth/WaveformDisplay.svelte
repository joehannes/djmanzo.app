<!--
  A waveform display powered by wavesurfer.js: works with both the deck's
  loop audio and YouTube crate tracks. Shows hot cue markers, loop regions,
  and supports zoom. Skin-aware colours via CSS custom properties.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import WaveSurfer from "wavesurfer.js";
  import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
  import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
  import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.js";
  import { booth, setHotCue, setLoopIn, setLoopOut, toggleLoop, clearLoop, setWaveZoom } from "./booth.svelte";
  import { skin } from "../region.svelte";
  import { crate } from "../crate/crate.svelte";

  let container: HTMLDivElement;
  let ws: WaveSurfer | null = null;
  let regions: RegionsPlugin | null = null;

  const s = $derived(skin());

  /** Load audio from a URL (for deck loops) or create an empty waveform for YouTube mode. */
  function loadAudio(url?: string) {
    if (!ws) return;
    if (url) {
      ws.load(url);
    } else {
      // YouTube mode: show a placeholder waveform that responds to crate state.
      ws.setOptions({ height: 64 });
    }
  }

  /** Sync hot cue markers to the waveform. */
  function syncCues() {
    if (!regions) return;
    // Clear existing cue markers.
    regions.getRegions().filter((r) => r.id.startsWith("cue-")).forEach((r) => r.remove());
    // Add markers for each hot cue.
    for (const cue of booth.hotCues) {
      regions.addRegion({
        id: `cue-${cue.id}`,
        start: cue.time,
        end: cue.time + 0.1,
        color: `${s.tokens.accent}88`,
        drag: false,
        resize: false,
        content: document.createTextNode(cue.label),
      });
    }
  }

  /** Sync loop region to the waveform. */
  function syncLoop() {
    if (!regions) return;
    regions.getRegions().filter((r) => r.id === "loop-region").forEach((r) => r.remove());
    if (booth.loop.inPoint !== null && booth.loop.outPoint !== null) {
      regions.addRegion({
        id: "loop-region",
        start: booth.loop.inPoint,
        end: booth.loop.outPoint,
        color: booth.loop.active ? `${s.tokens.accent2}44` : `${s.tokens.dim}22`,
        drag: true,
        resize: true,
      });
    }
  }

  onMount(() => {
    regions = RegionsPlugin.create();
    const timeline = TimelinePlugin.create({ height: 16, fontSize: 9 });
    const zoom = ZoomPlugin.create();

    ws = WaveSurfer.create({
      container,
      height: 64,
      waveColor: s.tokens.dim,
      progressColor: s.tokens.accent,
      cursorColor: s.tokens.accent2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      minPxPerSec: 50 * booth.waveZoom,
      plugins: [regions, timeline, zoom],
    });

    // Click to seek.
    ws.on("interaction", () => ws?.play());

    // Region click: jump to hot cue.
    regions.on("region-clicked", (region, e) => {
      e.stopPropagation();
      if (region.id.startsWith("cue-")) {
        const id = parseInt(region.id.replace("cue-", ""));
        const time = booth.hotCues.find((c) => c.id === id)?.time;
        if (time !== undefined) ws?.seekTo(time / (ws.getDuration() || 1));
      }
    });

    // Region drag/update: update loop points.
    regions.on("region-updated", (region) => {
      if (region.id === "loop-region") {
        setLoopIn(region.start);
        setLoopOut(region.end);
      }
    });

    // Double-click on waveform to set a hot cue at that position.
    ws.on("dblclick", () => {
      const time = ws?.getCurrentTime() ?? 0;
      setHotCue(time);
      syncCues();
    });

    // Right-click to set loop in-point.
    container.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const duration = ws?.getDuration() || 1;
      const time = (x / rect.width) * duration;
      if (e.shiftKey) {
        setLoopOut(time);
      } else {
        setLoopIn(time);
      }
      syncLoop();
    });

    return () => {
      ws?.destroy();
      ws = null;
      regions = null;
    };
  });

  // React to hot cue changes.
  $effect(() => {
    void booth.hotCues;
    syncCues();
  });

  // React to loop changes.
  $effect(() => {
    void booth.loop;
    syncLoop();
  });

  // React to zoom changes.
  $effect(() => {
    if (ws) ws.zoom(50 * booth.waveZoom);
  });

  // React to skin changes — update colours.
  $effect(() => {
    if (ws) {
      ws.setOptions({
        waveColor: s.tokens.dim,
        progressColor: s.tokens.accent,
        cursorColor: s.tokens.accent2,
      });
    }
  });

  /** Expose load method for parent components. */
  export function load(url: string) {
    loadAudio(url);
  }
</script>

<div class="waveform-wrap">
  <div class="waveform" bind:this={container}></div>
  <div class="wave-controls">
    <button class="wc-btn mono" onclick={() => setWaveZoom(Math.max(1, booth.waveZoom / 2))} title="Zoom out">−</button>
    <span class="wc-label mono">{Math.round(booth.waveZoom)}×</span>
    <button class="wc-btn mono" onclick={() => setWaveZoom(Math.min(16, booth.waveZoom * 2))} title="Zoom in">+</button>
    <span class="wc-sep"></span>
    <button class="wc-btn mono" onclick={toggleLoop} class:on={booth.loop.active} title="Toggle loop">LOOP</button>
    <button class="wc-btn mono" onclick={clearLoop} title="Clear loop">CLR</button>
    <span class="wc-sep"></span>
    <button class="wc-btn mono" onclick={() => { const t = ws?.getCurrentTime() ?? 0; setHotCue(t); syncCues(); }} title="Set hot cue at current position">CUE</button>
  </div>
</div>

<style>
  .waveform-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 0;
  }
  .waveform {
    width: 100%;
    height: 64px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--surface) 80%, transparent);
    overflow: hidden;
  }
  .wave-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px;
  }
  .wc-btn {
    padding: 3px 8px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--surface);
    color: var(--dim);
    font-size: 10px;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.15s;
  }
  .wc-btn:hover {
    border-color: var(--accent);
    color: var(--text);
  }
  .wc-btn.on {
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border-color: var(--accent);
    color: var(--accent);
  }
  .wc-label {
    font-size: 10px;
    color: var(--dim);
    min-width: 24px;
    text-align: center;
  }
  .wc-sep {
    width: 1px;
    height: 14px;
    background: var(--line);
    margin: 0 2px;
  }
</style>