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

  const TABS = [
    { id: "perform", name: "Perform", what: "Play with the record: pads, loops, slip and brake, the sampler and the stems.", facts: ["decks", "pads", "fx", "transport"] },
    { id: "mix", name: "Mix", what: "Two decks and the mixer, nothing else in the way: blend into the next record.", facts: ["decks", "deckqueue", "safe"] },
    { id: "dig", name: "Library", what: "Find the next record — and what the assistant thinks would follow, with its reasons.", facts: ["library", "camelot", "find", "sources"] },
    { id: "prepare", name: "Prepare", what: "Set cues and grids and shape the night before it starts.", facts: ["waveforms", "phrases", "camelot"] },
    { id: "autopilot", name: "Autopilot", what: "Let djmanzo play; watch it, steer it, take it back with a touch.", facts: ["automix", "autopilot-surface", "suggest", "room"] },
    { id: "karaoke", name: "Karaoke", what: "Host the singers: who is up, what they sing, in which key, with their voice in or out.", facts: ["k-rotation", "k-voice", "k-phones", "k-breaks"] },
    { id: "practice", name: "Practice", what: "Try a technique in your headphones while the night goes on.", facts: ["teacher", "curriculum", "knowhow"] },
    { id: "event", name: "Events", what: "Prepare a night: the event, the plan, what to do if it goes wrong.", facts: ["events", "setplan"] },
    { id: "keys", name: "Space", what: "Press Space: a guide to every key, sequences that read as words.", facts: ["leader", "keysets", "keyboard"] },
    { id: "launcher", name: "Launcher", what: "Press 0: every view, guide, panel, preset, theme and workspace, one key away.", facts: ["launcher", "leader", "palette"] },
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
    <p class="lead" data-reveal>Real screenshots of djmanzo, shown in {shot?.theme ?? "its"} theme — the one closest to your look. The numbers point out what is on each screen; press the picture to see it full size.</p>

    <div class="tabs" role="tablist" aria-label="Screens" tabindex="-1" onkeydown={keys} data-reveal>
      {#each TABS as t (t.id)}
        <button role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="tour-panel" tabindex={tab === t.id ? 0 : -1} onclick={() => choose(t.id)} data-tab={t.id}>{t.name}</button>
      {/each}
    </div>

    <div class="panel" id="tour-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      <p class="what" data-what>{current.what}</p>
      <div class="frame" bind:this={frame} data-reveal>
        {#if shot}
          {#key shot.src}<Shot {shot} label={current.name} />{/key}
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
