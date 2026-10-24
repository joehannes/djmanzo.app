<!--
  The tour: the real application, screen by screen, in the djmanzo theme
  closest to the visitor's skin — Caribbean for a Dominican visitor,
  Industrial Techno for a Berliner. Each screen with what it does, from the
  facts. No carousel: every screen is a tab you can see the name of.
-->
<script lang="ts">
  import { gsap, reduced } from "../motion";
  import { skin } from "../region.svelte";
  import { pick } from "../shots";
  import FactList from "./FactList.svelte";
  import Shot from "./Shot.svelte";
  import { i18n } from "../i18n.svelte";
  import { HOME } from "../i18n/home";

  const TABS = [
    { id: "perform" as const, facts: ["decks", "pads", "fx", "transport"] },
    { id: "mix" as const, facts: ["decks", "deckqueue", "safe"] },
    { id: "dig" as const, facts: ["library", "camelot", "find", "sources"] },
    { id: "prepare" as const, facts: ["waveforms", "phrases", "camelot"] },
    { id: "autopilot" as const, facts: ["automix", "autopilot-surface", "suggest", "room"] },
    { id: "karaoke" as const, facts: ["k-rotation", "k-voice", "k-phones", "k-breaks"] },
    { id: "practice" as const, facts: ["teacher", "curriculum", "knowhow"] },
    { id: "event" as const, facts: ["events", "setplan"] },
    { id: "keys" as const, facts: ["leader", "keysets", "keyboard"] },
    { id: "launcher" as const, facts: ["launcher", "leader", "palette"] },
  ];

  const w = $derived(HOME[i18n.lang].tour);
  let tab = $state<(typeof TABS)[number]["id"]>(TABS[0].id);
  let frame: HTMLElement | undefined = $state();
  const current = $derived(TABS.find((t) => t.id === tab)!);
  const shot = $derived(pick(tab, skin().themes));

  function choose(id: (typeof TABS)[number]["id"]) {
    tab = id;
    if (!reduced() && frame) gsap.fromTo(frame, { opacity: 0.25, y: 10, scale: 0.99 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" });
  }

  function keys(e: KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
    if (n < 0 || n >= TABS.length) return;
    e.preventDefault();
    choose(TABS[n].id);
    document.getElementById(`tab-${TABS[n].id}`)?.focus();
  }
</script>

<section class="section tour" id="tour" aria-labelledby="tour-title">
  <div class="wrap">
    <p class="eyebrow" data-reveal>{w.eyebrow}</p>
    <h2 class="h2" id="tour-title" data-split>{w.title}</h2>
    <p class="lead" data-reveal>{w.lead.replace("{theme}", shot?.theme ?? w.its)}</p>

    <div class="tabs" role="tablist" aria-label={w.screens} tabindex="-1" onkeydown={keys} data-reveal>
      {#each TABS as t (t.id)}
        <button role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="tour-panel" tabindex={tab === t.id ? 0 : -1} onclick={() => choose(t.id)} data-tab={t.id}>{w.tabs[t.id].name}</button>
      {/each}
    </div>

    <div class="panel" id="tour-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      <p class="what" data-what>{w.tabs[current.id].what}</p>
      <div class="frame" bind:this={frame} data-reveal>
        {#if shot}
          {#key shot.src}<Shot {shot} label={w.tabs[current.id].name} />{/key}
        {/if}
      </div>
      <div class="facts">
        <FactList ids={current.facts} />
      </div>
    </div>
  </div>
</section>

<style>
  .tabs {
    display: flex;
    gap: 4px;
    margin: 40px 0 20px;
    padding: 4px;
    border: 1px solid var(--line);
    border-radius: 12px;
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    background: var(--surface);
  }
  [role="tab"] {
    font: 500 14px/1 var(--body);
    padding: 11px 16px;
    border-radius: 9px;
    border: 0;
    background: none;
    color: var(--dim);
    cursor: pointer;
    white-space: nowrap;
  }
  [role="tab"][aria-selected="true"] {
    background: var(--raised);
    color: var(--text);
    box-shadow: inset 0 -2px 0 var(--accent);
  }
  .what {
    margin: 0 0 16px;
    font-size: 1.1rem;
    color: var(--text);
  }
  .facts {
    margin-top: 28px;
  }
  .facts :global(ul) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0 32px;
  }
</style>
