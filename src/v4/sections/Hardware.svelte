<!--
  Hardware: search the controllers djmanzo has a mapping for, and see the
  ones it is going to have — each badged honestly, with the caveat that no
  mapping has yet met its device. Better than a wall of logos: a search box.
-->
<script lang="ts">
  import { searched } from "../insights";
  import { DEVICES, STATUS_WORDS, search } from "../hardware";
  import { art } from "../region.svelte";
  import FactList from "./FactList.svelte";
  import { i18n } from "../i18n.svelte";
  import { SECTIONS, fill } from "../i18n/sections";
  import { tf } from "../i18n/facts.svelte";
  import { FACT_BY_ID } from "../../../shared/facts";

  const w = $derived(SECTIONS[i18n.lang].hardware);
  /** What a shipped mapping has not yet been through, in the visitor's words. */
  const mappedCaveat = $derived(FACT_BY_ID.mapped ? (tf(FACT_BY_ID.mapped).caveat ?? STATUS_WORDS.mapped.caveat) : STATUS_WORDS.mapped.caveat);

  let q = $state("");
  let only = $state<"all" | "mapped" | "planned">("all");
  const found = $derived(search(q).filter((d) => only === "all" || d.status === only));
  // For Insights: what visitors look for here, and whether they found it.
  $effect(() => searched("hardware", q, found.length));
</script>

<section class="section hardware" id="hardware" aria-labelledby="hw-title">
  <div class="wrap">
    <div class="top">
      <div>
        <p class="eyebrow" data-reveal>{w.eyebrow}</p>
        <h2 class="h2" id="hw-title" data-split>{w.title}</h2>
        <p class="lead" data-reveal>{w.lead}</p>
      </div>
      <div class="pic" data-reveal aria-hidden="true"><div class="img" data-parallax="0.2" style:background-image={`url(${art("gear")})`}></div></div>
    </div>

    <div class="tool card" data-reveal>
      <div class="controls">
        <label class="search">
          <span class="sr-only">{w.search}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          <input type="search" placeholder={w.placeholder} bind:value={q} data-hw-search />
        </label>
        <div class="filters" role="group" aria-label={w.show}>
          {#each [["all", w.all], ["mapped", w.mapped], ["planned", w.planned]] as [v, l] (v)}
            <button class="chip" aria-pressed={only === v} onclick={() => (only = v as typeof only)}>{l}</button>
          {/each}
        </div>
      </div>
      <ul class="devices" aria-live="polite">
        {#each found as d (d.maker + d.model)}
          <li class:planned={d.status === "planned"} data-device={d.model}>
            <span class="kind mono">{w.kinds[d.kind]}</span>
            <b>{d.model}</b>
            <span class="maker">{d.maker}</span>
            <span class="status {d.status === 'mapped' ? 'shipped' : 'planned'}">{d.status === 'mapped' ? w.mapped : w.planned}</span>
          </li>
        {:else}
          <li class="none">{@html fill(w.none, { wishes: "/wishes" })}</li>
        {/each}
      </ul>
      <p class="caveat">{mappedCaveat}</p>
    </div>
    <div class="more">
      <FactList ids={["mapping", "keyboard", "dvs", "platters", "club"]} compact />
    </div>
  </div>
</section>

<style>
  .top {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 48px;
    align-items: end;
  }
  @media (max-width: 900px) {
    .top {
      grid-template-columns: 1fr;
    }
  }
  .pic {
    position: relative;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--line);
  }
  .img {
    position: absolute;
    inset: -12% 0;
    background-size: cover;
    background-position: center;
  }
  .tool {
    margin-top: 40px;
    padding: 18px;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .search {
    flex: 1 1 320px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--bg);
    color: var(--dim);
  }
  .search:focus-within {
    border-color: var(--accent);
  }
  .search input {
    flex: 1;
    min-width: 0;
    height: 46px;
    border: 0;
    background: none;
    color: var(--text);
    font: 15px var(--body);
    outline: none;
  }
  .filters {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .devices {
    list-style: none;
    padding: 0;
    margin: 18px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
  }
  .devices li {
    display: grid;
    gap: 4px;
    padding: 14px;
    border-radius: 10px;
    background: var(--raised);
    border: 1px solid var(--line);
  }
  .devices li.planned {
    background: transparent;
    border-style: dashed;
  }
  .kind {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .devices b {
    font: var(--display-weight, 600) 17px/1.2 var(--display);
  }
  .maker {
    color: var(--dim);
    font-size: 13px;
  }
  .devices .status {
    justify-self: start;
    margin-top: 6px;
  }
  .devices .none {
    grid-column: 1 / -1;
    color: var(--dim);
    background: transparent;
  }
  .more {
    margin-top: 24px;
  }
  .more :global(.facts) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    column-gap: 32px;
  }
</style>
