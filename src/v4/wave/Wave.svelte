<!--
  A live waveform: the deck's music drawn on the GPU, the past to the left of
  the playhead, what is coming to the right. It draws only while on screen,
  and holds still for a visitor who asked for less motion.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { deck, where } from "../sound.svelte";
  import { WaveGL } from "./gl";
  import { bands, render, stems } from "./model";

  let {
    mode = "bands",
    colours,
    span = 6,
    playhead = 0.5,
    label,
  }: { mode?: "bands" | "lanes"; colours: string[]; span?: number; playhead?: number; label: string } = $props();

  let canvas: HTMLCanvasElement;

  /**
   * The fine texture of real audio in a waveform, tied to the music's time
   * (not the screen), so it travels with the waveform instead of shimmering.
   */
  function grain(levels: Float32Array, columns: number, from: number, span: number) {
    const rows = levels.length / columns;
    for (let c = 0; c < columns; c++) {
      const t = Math.floor((from + ((c + 0.5) * span) / columns) * 160);
      const n = Math.abs(Math.sin(t * 12.9898) * 43758.5453) % 1;
      const k = 0.8 + 0.2 * n;
      for (let r = 0; r < rows; r++) levels[r * columns + c] *= k;
    }
  }
  let wave: WaveGL | null = null;

  $effect(() => {
    // Read the colours first: behind `wave?.` they would not be read while `wave` is null, and a new skin would never reach the shader.
    const c = colours;
    wave?.setColours(c);
  });

  onMount(() => {
    wave = new WaveGL(canvas, { mode, rows: mode === "bands" ? 3 : 4, colours, playhead });
    canvas.dataset.renderer = wave.webgl ? "webgl2" : "2d";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    let last = 0;
    const frame = (t: number) => {
      raf = 0;
      if (!visible) return;
      // Less motion: a few still frames a second, enough to follow the stems.
      if (!reduced || t - last > 250) {
        last = t;
        const { clock, now, genre, idle } = where();
        const columns = Math.max(64, Math.min(900, Math.round(canvas.clientWidth / 2)));
        const at = reduced && idle ? 0 : now;
        const from = at - playhead * span;
        const parts = render(genre.pattern, clock, from, from + span, columns, deck.on);
        const levels = mode === "bands" ? bands(parts, columns) : stems(parts, columns);
        grain(levels, columns, from, span);
        const beat = clock.stepDur * 4;
        const phase = (((at - clock.time) % beat) + beat) % beat;
        wave?.draw(levels, columns, { idle, pulse: idle ? 0 : Math.exp((-phase / beat) * 6) });
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      wave?.dispose();
    };
  });
</script>

<div class="wave {mode}" role="img" aria-label={label}>
  <canvas bind:this={canvas} aria-hidden="true" data-wave={mode}></canvas>
</div>

<style>
  .wave,
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
