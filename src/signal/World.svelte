<!--
  The canvas the whole Signal Path is painted on. The engine does the work;
  this hands it the style and passes on what the visitor points at.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Engine, type Night } from "./world/engine";
  import type { StageId, StyleTokens } from "../style/genome/types";

  interface Props {
    order: StageId[];
    style: StyleTokens;
    /** The visitor's hour and sky. */
    night: Night;
    onpick: (s: StageId) => void;
    onhover: (s: StageId | null) => void;
    engine?: Engine | null;
  }
  let { order, style, night, onpick, onhover, engine = $bindable(null) }: Props = $props();
  let canvas: HTMLCanvasElement;
  let failed = $state(false);

  onMount(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      engine = new Engine(canvas, order, { pick: (s) => onpick(s), hover: (s) => onhover(s) }, { reducedMotion: reduced });
    } catch {
      failed = true;
    }
    return () => engine?.dispose();
  });

  $effect(() => {
    engine?.setStyle(style);
  });
  $effect(() => {
    engine?.setNight(night);
  });
</script>

<canvas bind:this={canvas} class="world" data-world aria-hidden="true"></canvas>
{#if failed}
  <p class="nogl">This browser could not start WebGL, so the painting is missing — everything else still works below.</p>
{/if}

<style>
  .world {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    display: block;
    touch-action: none;
    cursor: grab;
    background: var(--night);
  }
  .nogl {
    position: fixed;
    top: 40%;
    left: 50%;
    translate: -50% 0;
    max-width: 30em;
    text-align: center;
    color: var(--ink);
  }
</style>
