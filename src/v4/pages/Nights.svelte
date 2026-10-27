<!--
  Kinds of nights (the island's gig board until 25 October): flyers for
  kinds of nights. Pick one and walk through it in djmanzo's own phases of
  a night — setup, warm-up, build, peak, release, closing — with what
  djmanzo does at each, and which edition the night needs.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { Edition } from "../../../shared/catalog";
  import { EDITION_INFO } from "../../../shared/catalog";
  import { animate } from "../motion";
  import { i18n } from "../i18n.svelte";
  import { NIGHTS, NIGHT_IDS, type NightId } from "../i18n/nights";
  import { fill } from "../i18n/sections";
  import { href } from "../router";

  const w = $derived(NIGHTS[i18n.lang]);
  let root: HTMLElement;
  onMount(() => animate(root));

  /** What does not change with the language: each night's picture and the edition it needs. */
  const KIND: Record<NightId, { emoji: string; edition: Edition }> = {
    bedroom: { emoji: "🛏️", edition: "hobbyist" },
    learning: { emoji: "🎓", edition: "apprentice" },
    family: { emoji: "🍖", edition: "autopilot" },
    wedding: { emoji: "💍", edition: "pro" },
    club: { emoji: "🪩", edition: "pro" },
    bar: { emoji: "🏖️", edition: "autopilot" },
    karaoke: { emoji: "🎤", edition: "karaoke" },
    radio: { emoji: "📡", edition: "pro" },
    allin: { emoji: "👑", edition: "full" },
  };

  let open = $state<NightId>("club");
  const night = $derived(w.nights[open]);
  const ed = $derived(EDITION_INFO[KIND[open].edition]);
</script>

<div class="nights" bind:this={root} data-nights>
  <header class="head">
    <div class="wrap">
      <p class="eyebrow">{w.eyebrow}</p>
      <h1 class="h1">{@html w.title}</h1>
      <p class="lead">{w.lead}</p>
    </div>
  </header>

  <div class="wrap body">
    <div class="board" role="group" aria-label={w.eyebrow}>
      {#each NIGHT_IDS as id, i (id)}
        <button class="flyer" class:on={open === id} style="--tilt:{((i * 29) % 5) - 2}deg" onclick={() => (open = id)} aria-pressed={open === id} data-night={id}>
          <span class="e" aria-hidden="true">{KIND[id].emoji}</span>
          <b>{w.nights[id].title}</b>
          <span class="ed" style="--c:{EDITION_INFO[KIND[id].edition].colour}">{EDITION_INFO[KIND[id].edition].name}</span>
        </button>
      {/each}
    </div>

    <section class="night" aria-live="polite" data-night-open={open}>
      <h2 class="h2">{KIND[open].emoji} {night.title}</h2>
      <p><b>{w.theEdition}</b> {ed.name}. {night.why}</p>
      <ol class="arc">
        {#each night.phases as [phase, what] (phase)}
          <li><span class="phase">{phase}</span><span>{what}</span></li>
        {/each}
      </ol>
      <div class="row">
        <a class="btn primary" href={href("pricing")}>{fill(w.editions, { edition: ed.name })}</a>
        {#if KIND[open].edition === "karaoke" || KIND[open].edition === "full"}<a class="btn ghost" href="/#karaoke">{w.karaoke}</a>{/if}
      </div>
    </section>
  </div>
</div>

<style>
  .head {
    padding: calc(var(--bar) + 64px) 0 24px;
  }
  .body {
    padding-bottom: 80px;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr));
    gap: 14px;
    padding: 18px;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    border: 1px solid var(--line);
  }
  .flyer {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--raised);
    color: var(--text);
    text-align: left;
    rotate: var(--tilt);
    box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.6);
    cursor: pointer;
    font: inherit;
    transition: rotate 0.2s, outline-color 0.2s;
  }
  .flyer.on {
    outline: 2px solid var(--accent);
    rotate: 0deg;
  }
  .e {
    font-size: 26px;
  }
  .ed {
    font: 600 11px/1.6 var(--mono);
    padding: 1px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--c) 70%, transparent);
    color: #111;
  }
  .night {
    margin-top: 32px;
    max-width: 860px;
  }
  .arc {
    list-style: none;
    padding: 0;
    margin: 20px 0;
  }
  .arc li {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--line);
  }
  .phase {
    font-family: var(--display);
    font-weight: var(--display-weight, 600);
    color: var(--accent);
  }
  .row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  @media (max-width: 560px) {
    .arc li {
      grid-template-columns: 1fr;
      gap: 2px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .flyer {
      rotate: 0deg;
      transition: none;
    }
  }
</style>
