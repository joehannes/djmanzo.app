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

  const TABS = [
    { id: "perform", name: "Perform", facts: ["decks", "pads", "fx", "transport"] },
    { id: "prepare", name: "Prepare", facts: ["waveforms", "phrases", "camelot"] },
    { id: "dig", name: "Library", facts: ["library", "find", "sources"] },
    { id: "autopilot", name: "Autopilot", facts: ["automix", "autopilot-surface", "suggest"] },
    { id: "karaoke", name: "Karaoke", facts: ["karaoke", "requests"] },
    { id: "practice", name: "Practice", facts: ["teacher", "curriculum"] },
    { id: "event", name: "Events", facts: ["events", "setplan", "room"] },
  ];

  let tab = $state(TABS[0].id);
  let frame: HTMLElement | undefined = $state();
  const current = $derived(TABS.find((t) => t.id === tab)!);
  const shot = $derived(pick(tab, skin().themes));

  function choose(id: string) {
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
    <p class="eyebrow" data-reveal>The application</p>
    <h2 class="h2" id="tour-title" data-reveal>Everything a night needs, on one screen at a time.</h2>
    <p class="lead" data-reveal>Real screenshots of djmanzo, shown in {shot?.theme ?? "its"} theme — the one closest to your look. djmanzo ships with many themes, and its look studio makes your own.</p>

    <div class="tabs" role="tablist" aria-label="Screens" tabindex="-1" onkeydown={keys} data-reveal>
      {#each TABS as t (t.id)}
        <button role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="tour-panel" tabindex={tab === t.id ? 0 : -1} onclick={() => choose(t.id)} data-tab={t.id}>{t.name}</button>
      {/each}
    </div>

    <div class="panel" id="tour-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      <figure class="frame" bind:this={frame} data-reveal>
        <div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span class="mono">djmanzo — {current.name}</span></div>
        {#if shot}
          <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" data-shot={shot.theme} />
          <figcaption class="mono">{shot.shows} · {shot.theme} theme</figcaption>
        {/if}
      </figure>
      <div class="side">
        <FactList ids={current.facts} compact />
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
  .panel {
    display: grid;
    grid-template-columns: 1.7fr 1fr;
    gap: 36px;
    align-items: start;
  }
  @media (max-width: 960px) {
    .panel {
      grid-template-columns: 1fr;
    }
  }
  .frame {
    margin: 0;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--line);
    background: var(--surface);
    box-shadow:
      0 40px 120px -30px color-mix(in srgb, var(--accent) 35%, transparent),
      0 30px 80px -20px rgb(0 0 0 / 0.7);
  }
  .chrome {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
  }
  .chrome i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--line);
  }
  .chrome span {
    margin-left: 10px;
    font-size: 11px;
    color: var(--dim);
  }
  img {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    object-position: top;
  }
  figcaption {
    font-size: 11px;
    color: var(--dim);
    padding: 10px 14px;
    border-top: 1px solid var(--line);
  }
  .side :global(.facts) {
    margin-top: 0;
  }
</style>
