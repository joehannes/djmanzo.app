<!--
  A living divider between sections: a thin waveform line that pulses with the
  deck's beat, drawn in the skin's accent, replacing the static SVG band where
  it appears. It draws only while visible and holds still for reduced motion.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { skin } from "../region.svelte";
  import { deck, where } from "../sound.svelte";
  import { reduced } from "../motion";

  let canvas: HTMLCanvasElement;

  function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
  }

  onMount(() => {
    if (reduced()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let visible = false;

    const draw = () => {
      raf = 0;
      if (!visible) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(devicePixelRatio, 2);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }
      ctx.clearRect(0, 0, w, h);

      const s = skin();
      const { clock, now, idle } = where();
      const beat = clock.stepDur * 4;
      const phase = (((now - clock.time) % beat) + beat) % beat;
      const pulse = idle ? 0 : Math.exp((-phase / beat) * 4);
      const amp = idle ? 4 : 6 + pulse * 14;
      const freq = idle ? 0.015 : 0.02 + pulse * 0.01;
      const t = now * 0.8;

      // Two overlapping sine waves in the skin's accents.
      const [ar, ag, ab] = hexToRgb(s.tokens.accent);
      const [br, bg, bb] = hexToRgb(s.tokens.accent2);

      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      // Primary wave
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.round(ar * 255)},${Math.round(ag * 255)},${Math.round(ab * 255)},${0.5 + pulse * 0.4})`;
      for (let x = 0; x <= w; x += 3) {
        const y = h / 2 + Math.sin(x * freq + t) * amp + Math.sin(x * freq * 2.3 + t * 1.4) * amp * 0.3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary wave, offset
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.round(br * 255)},${Math.round(bg * 255)},${Math.round(bb * 255)},${0.25 + pulse * 0.25})`;
      for (let x = 0; x <= w; x += 3) {
        const y = h / 2 + Math.sin(x * freq * 1.7 + t * 0.7 + 1.2) * amp * 0.6;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Beat flash: a brief bright dot at centre on the downbeat.
      if (pulse > 0.6) {
        const glow = (pulse - 0.6) * 2.5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 3 + glow * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(ar * 255)},${Math.round(ag * 255)},${Math.round(ab * 255)},${glow * 0.7})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    }, { threshold: 0.1 });
    io.observe(canvas);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  });
</script>

<div class="wave-sep wrap" aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .wave-sep {
    position: relative;
    height: 48px;
    opacity: 0.7;
    mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  @media (prefers-reduced-motion: reduce) {
    .wave-sep {
      /* Fall back to the CSS divider already on .divider */
      height: 48px;
      background-image: var(--divider, none);
      background-size: auto 48px;
      background-repeat: repeat-x;
      background-position: center;
    }
    canvas { display: none; }
  }
</style>