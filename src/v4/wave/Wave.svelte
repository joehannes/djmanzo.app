<!--
  A live waveform: the deck's music drawn on the GPU, the past to the left of
  the playhead, what is coming to the right — a recorded loop from its own
  measured shape, the synthesiser's sketch from its pattern. It draws only while on screen,
  and holds still for a visitor who asked for less motion.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { deck, where } from "../sound.svelte";
  import { WaveGL } from "./gl";
  import { STEMS, bands, render, stems } from "./model";
  import { levels as loopLevels } from "../loops";

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
    wave = new WaveGL(canvas, { mode, rows: mode === "bands" ? 3 : STEMS.length, colours, playhead });
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
        const { clock, now, genre, idle, drawing } = where();
        const columns = Math.max(64, Math.min(900, Math.round(canvas.clientWidth / 2)));
        const at = reduced && idle ? 0 : now;
        const from = at - playhead * span;
        let levels: Float32Array;
        if (drawing.kind === "loop") {
          // The recording's own shape, read from where the loop is.
          levels = loopLevels(drawing.peaks, drawing.seconds, drawing.t0, from, from + span, columns, mode, deck.on, STEMS);
        } else {
          const parts = render(genre.pattern, clock, from, from + span, columns, deck.on);
          levels = mode === "bands" ? bands(parts, columns) : stems(parts, columns);
        }
        if (drawing.kind !== "loop") grain(levels, columns, from, span);
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
