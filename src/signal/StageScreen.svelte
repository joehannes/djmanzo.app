<!--
  A stage as a game screen: four beats over the painting.

  1. Mystery — one line, and what this stage becomes in the visitor's music.
  2. Reveal — the real application (a screenshot of it, in the visitor's
     theme where there is one) and what it does here, from the fact sheet.
  3. Play — what the hands do: art, never a pretend djmanzo.
  4. Pass it on — the next stage, or back to the map.

  The arrow keys move between beats, Escape goes back to the map.
-->
<script lang="ts">
  import type { Stage } from "../stages/script";
  import { STAGE_BY_ID } from "../stages/script";
  import type { StyleTokens } from "../style/genome/types";
  import Facts from "./Facts.svelte";
  import Guide from "./Guide.svelte";
  import AmpDial from "./AmpDial.svelte";
  import Taquilla from "../places/Taquilla.svelte";
  import "./shop.css";
  import { shotFor } from "./shots";

  interface Props {
    stage: Stage;
    style: StyleTokens;
    onnext: () => void;
    onmap: () => void;
    /** The stage's play, 0–1: where the visitor leans, or how far they turn it up. */
    onplay: (k: number) => void;
  }
  let { stage, style, onnext, onmap, onplay }: Props = $props();

  const BEATS = ["Mystery", "Reveal", "Play", "Pass it on"];
  let beat = $state(0);
  const shot = $derived(shotFor(stage.screens, style.app.theme));
  const next = $derived(stage.next ? STAGE_BY_ID[stage.next] : null);
  const complement = $derived(style.complements[(stage.id.length + style.id.length) % style.complements.length]);

  function step(d: number) {
    const b = beat + d;
    if (b < 0) return;
    if (b >= BEATS.length) onnext();
    else beat = b;
  }

  // At the Confluence, leaning the pointer (or a finger) left or right is the play.
  function lean(e: PointerEvent) {
    if (beat === 2 && stage.id === "confluence") onplay(e.clientX / innerWidth);
  }

  function keys(e: KeyboardEvent) {
    if ((e.target as HTMLElement).closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Escape") onmap();
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") onplay(0.5);
  }
</script>

<svelte:window onkeydown={keys} onpointermove={lean} />

<section class="screen" data-stage={stage.id} data-beat={beat} aria-label={stage.name}>
  <header class="top">
    <button class="map" onclick={onmap}>← The map</button>
    <h1>{stage.name}</h1>
    <ol class="beats" aria-label="Beats">
      {#each BEATS as b, i (b)}
        <li><button aria-current={beat === i ? "step" : undefined} onclick={() => (beat = i)}>{b}</button></li>
      {/each}
    </ol>
  </header>

  {#key beat}
    {#if beat === 0}
      <div class="mystery">
        <p class="line">
          {#each stage.mystery.split(" ") as word, i (i)}<span style="--i:{i}">{word}&nbsp;</span>{/each}
        </p>
        <p class="scene">{style.name}: {style.scene[stage.id]}</p>
      </div>
    {:else if beat === 1}
      <div class="panel reveal">
        {#if stage.id === "silence"}
          <p class="punch">{stage.reveal}</p>
          <Guide ondone={onnext} />
        {:else if stage.id === "amp"}
          <p class="punch">{stage.reveal}</p>
          <div class="shop" data-shop>
            <Taquilla go={(id) => (location.href = `/#/${id}`)} />
          </div>
        {:else}
          <p class="punch">{stage.reveal}</p>
          <div class="cols">
            {#if shot}
              <figure>
                <img src={shot.src} alt={shot.alt} loading="lazy" />
                <figcaption>The real application{shot.theme ? ` — the ${shot.theme} theme` : ""}.</figcaption>
              </figure>
            {/if}
            <Facts ids={stage.facts} />
          </div>
        {/if}
      </div>
    {:else if beat === 2}
      <div class="panel play">
        <p class="punch">{stage.play}</p>
        {#if stage.id === "amp"}
          <AmpDial {onplay} />
        {/if}
        <p class="aside">Beside the music, in {style.name}: <b>{complement.what}</b> — {complement.why}</p>
      </div>
    {:else}
      <div class="panel pass">
        {#if next}
          <p class="punch">The signal goes on to <b>{next.name}</b>.</p>
          <p class="aside">{next.mystery}</p>
          <button class="go" onclick={onnext}>Follow it →</button>
        {:else}
          <p class="punch">That was the whole path.</p>
        {/if}
        <button class="quiet" onclick={onmap}>Back to the map</button>
      </div>
    {/if}
  {/key}

  {#if beat < BEATS.length - 1 && !(stage.id === "silence" && beat === 1)}
    <button class="next" onclick={() => step(1)} aria-label="Next beat">→</button>
  {/if}
</section>

<style>
  .screen {
    position: fixed;
    inset: 0;
    pointer-events: none;
    color: var(--ink);
    font-family: var(--text);
  }
  .screen > * {
    pointer-events: auto;
  }
  .top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    flex-wrap: wrap;
  }
  h1 {
    margin: 0;
    font-family: var(--display);
    font-weight: 400;
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    letter-spacing: 0.02em;
  }
  .map,
  .quiet {
    font: inherit;
    background: color-mix(in srgb, var(--night) 60%, transparent);
    color: var(--ink);
    border: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
    border-radius: 999px;
    padding: 6px 14px;
    cursor: pointer;
  }
  .beats {
    display: flex;
    gap: 6px;
    list-style: none;
    margin: 0 0 0 auto;
    padding: 0;
  }
  .beats button {
    font: inherit;
    font-size: 12px;
    background: none;
    border: 0;
    color: var(--ink);
    opacity: 0.55;
    cursor: pointer;
    padding: 4px 6px;
    border-bottom: 2px solid transparent;
  }
  .beats button[aria-current="step"] {
    opacity: 1;
    border-bottom-color: var(--glow);
  }
  .mystery {
    position: absolute;
    left: 50%;
    top: 46%;
    translate: -50% -50%;
    width: min(46rem, 90vw);
    padding: 40px 30px;
    text-align: center;
    /* A soft night behind the words, so the painting never fights them. */
    background: radial-gradient(closest-side, color-mix(in srgb, var(--night) 72%, transparent), transparent);
  }
  .line {
    font-family: var(--display);
    font-size: clamp(1.8rem, 4.6vw, 3.6rem);
    line-height: 1.12;
    margin: 0 0 18px;
    text-shadow: 0 2px 30px color-mix(in srgb, var(--night) 80%, transparent);
  }
  .line span {
    display: inline-block;
    opacity: 0;
    translate: 0 0.4em;
    filter: blur(6px);
    animation: word 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
    animation-delay: calc(var(--i) * 90ms + 200ms);
  }
  @keyframes word {
    to {
      opacity: 1;
      translate: 0 0;
      filter: blur(0);
    }
  }
  .scene {
    font-style: italic;
    opacity: 0;
    animation: word 1.2s 1.6s forwards;
    max-width: 34rem;
    margin: 0 auto;
  }
  .panel {
    position: absolute;
    left: clamp(16px, 4vw, 48px);
    bottom: clamp(16px, 6vh, 56px);
    width: min(56rem, calc(100vw - 32px));
    max-height: calc(100vh - 140px);
    overflow: auto;
    padding: 20px 22px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--night) 78%, transparent);
    backdrop-filter: blur(6px);
    border-left: 4px solid var(--glow);
    animation: rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  @keyframes rise {
    from {
      opacity: 0;
      translate: 0 24px;
    }
  }
  .punch {
    font-family: var(--display);
    font-size: clamp(1.1rem, 2.2vw, 1.6rem);
    line-height: 1.25;
    margin: 0 0 14px;
  }
  .cols {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }
  figure {
    margin: 0;
  }
  figure img {
    width: 100%;
    border-radius: 3px;
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 60%, var(--night)), 0 20px 40px rgba(0, 0, 0, 0.5);
    rotate: -0.6deg;
  }
  figcaption {
    margin-top: 10px;
    font-size: 13px;
    opacity: 0.8;
  }
  .aside {
    opacity: 0.85;
  }
  .go {
    font: inherit;
    font-weight: 800;
    padding: 12px 22px;
    border: 0;
    border-radius: 6px;
    background: var(--accent);
    color: var(--night);
    cursor: pointer;
    margin-right: 10px;
  }
  .next {
    position: absolute;
    right: clamp(16px, 4vw, 48px);
    bottom: clamp(16px, 6vh, 56px);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 0;
    font-size: 26px;
    background: var(--glow);
    color: var(--night);
    cursor: pointer;
    box-shadow: 0 0 40px color-mix(in srgb, var(--glow) 60%, transparent);
  }
  @media (max-width: 760px) {
    .cols {
      grid-template-columns: 1fr;
    }
    .beats {
      display: none;
    }
    .panel {
      bottom: 96px;
      max-height: calc(100vh - 200px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .line span,
    .scene,
    .panel {
      animation: none;
      opacity: 1;
      translate: 0 0;
      filter: none;
    }
  }
</style>
