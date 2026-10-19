<!--
  Over the map: where you are, which stage the pointer is on, and the signal
  meter — the ten stages as the segments of a level meter, lit where the
  visitor has been, each one a way in. The keys 0–9 jump to a stage.
-->
<script lang="ts">
  import { STAGES, STAGE_BY_ID } from "../stages/script";
  import type { StageId, StyleTokens } from "../style/genome/types";
  import { signal } from "./state.svelte";
  import { senses } from "./sense/senses.svelte";
  import type { Engine } from "./world/engine";

  interface Props {
    hovered: StageId | null;
    style: StyleTokens;
    engine: Engine | null;
    onenter: (s: StageId) => void;
  }
  let { hovered, style, engine, onenter }: Props = $props();

  // Each stage's name, pinned over its place on the painted map, frame by frame.
  const labels: Record<string, HTMLButtonElement> = {};
  $effect(() => {
    if (!engine) return;
    let raf = 0;
    const place = () => {
      raf = requestAnimationFrame(place);
      for (const s of STAGES) {
        const el = labels[s.id];
        if (!el) continue;
        const p = engine.project(s.id);
        el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        el.style.opacity = p.visible ? "1" : "0";
      }
    };
    place();
    return () => cancelAnimationFrame(raf);
  });

  function keys(e: KeyboardEvent) {
    if ((e.target as HTMLElement).closest("input, textarea, select")) return;
    const n = Number(e.key);
    if (e.key.length === 1 && Number.isInteger(n) && STAGES[n]) onenter(STAGES[n].id);
  }
</script>

<svelte:window onkeydown={keys} />

<header class="brand">
  <b>djmanzo</b>
  <span>the Signal Path · {style.name}</span>
  {#if senses.city || senses.sky}
    <span class="tonight" data-tonight>Tonight{senses.city ? ` in ${senses.city}` : ""}{senses.sky ? ` · ${senses.sky}` : ""}</span>
  {/if}
</header>

<p class="hint" aria-live="polite">
  {#if hovered}
    <b>{STAGE_BY_ID[hovered].name}</b> — {STAGE_BY_ID[hovered].mystery}
  {:else}
    Follow the line of light from the groove to the floor. Drag to travel; choose a stage to go in.
  {/if}
</p>

<div class="labels" aria-hidden="true">
  {#each STAGES as s (s.id)}
    <button bind:this={labels[s.id]} class="label" class:on={hovered === s.id} tabindex="-1" onclick={() => onenter(s.id)}>{s.name}</button>
  {/each}
</div>

<nav class="sends" aria-label="Sends">
  <a href="#/outboard" data-send="outboard"><b>Outboard</b><span>the marketplace</span></a>
  <a href="#/talkback" data-send="talkback"><b>Talkback</b><span>the discussion</span></a>
</nav>

<nav class="meter" aria-label="The stages">
  {#each STAGES as s, i (s.id)}
    <button class:lit={signal.visited.includes(s.id)} class:on={hovered === s.id} onclick={() => onenter(s.id)} data-meter={s.id}>
      <span class="seg" aria-hidden="true"></span>
      <span class="name"><small>{i}</small> {s.name}</span>
    </button>
  {/each}
</nav>

<style>
  /* Bottom left, above the meter: the one corner the path never runs through. */
  .sends {
    position: fixed;
    left: 14px;
    bottom: 92px;
    display: grid;
    grid-auto-flow: column;
    gap: 8px;
    z-index: 3;
  }
  .sends a {
    display: grid;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--ink) 30%, transparent);
    background: color-mix(in srgb, var(--night) 75%, transparent);
    backdrop-filter: blur(6px);
    color: var(--ink);
    text-decoration: none;
    font-family: var(--text);
  }
  .sends a:hover,
  .sends a:focus-visible {
    border-color: var(--glow);
  }
  .sends b {
    font-family: var(--display);
    font-weight: 400;
  }
  .sends span {
    font-size: 12px;
    opacity: 0.8;
  }
  .brand {
    position: fixed;
    top: 14px;
    left: 18px;
    display: grid;
    color: var(--ink);
    font-family: var(--text);
    text-shadow: 0 1px 12px var(--night);
  }
  .brand b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.5rem;
    letter-spacing: 0.04em;
  }
  .brand span {
    font-size: 13px;
    opacity: 0.8;
  }
  .brand .tonight {
    font-style: italic;
    opacity: 0.95;
  }
  .hint {
    position: fixed;
    top: 18px;
    left: 50%;
    translate: -50% 0;
    max-width: min(40rem, 60vw);
    margin: 0;
    text-align: center;
    color: var(--ink);
    font-family: var(--text);
    text-shadow: 0 1px 14px var(--night);
  }
  .labels {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }
  .label {
    position: absolute;
    left: 0;
    top: 0;
    margin: 22px 0 0 -60px;
    width: 120px;
    text-align: center;
    pointer-events: auto;
    background: none;
    border: 0;
    color: var(--ink);
    font-family: var(--display);
    font-size: 15px;
    letter-spacing: 0.04em;
    text-shadow: 0 0 10px var(--night), 0 0 18px var(--night);
    cursor: pointer;
    transition: opacity 0.3s;
  }
  .label.on {
    color: var(--glow);
  }
  .meter {
    position: fixed;
    left: 50%;
    bottom: 18px;
    translate: -50% 0;
    display: flex;
    gap: 4px;
    padding: 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--night) 72%, transparent);
    backdrop-filter: blur(6px);
    max-width: calc(100vw - 24px);
    overflow-x: auto;
  }
  .meter button {
    display: grid;
    gap: 4px;
    justify-items: center;
    background: none;
    border: 0;
    color: var(--ink);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
    padding: 2px 4px;
    min-width: 64px;
  }
  .seg {
    width: 100%;
    height: 10px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--ink) 18%, transparent);
  }
  .lit .seg {
    background: var(--accent);
  }
  .on .seg,
  .meter button:hover .seg,
  .meter button:focus-visible .seg {
    background: var(--glow);
    box-shadow: 0 0 14px var(--glow);
  }
  .name small {
    opacity: 0.6;
  }
  @media (max-width: 760px) {
    .hint {
      top: auto;
      /* Above the sends, which sit above the meter. */
      bottom: 156px;
      max-width: 90vw;
    }
  }
</style>
