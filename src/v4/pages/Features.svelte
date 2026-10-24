<!--
  Every feature, for the visitor who wants all of it: each fact on the site
  (`shared/facts.ts`), grouped by area, with what it does, whether it ships,
  is part-built or planned, what is not yet proven, and which editions carry
  it. Searchable, and narrowed to one edition with a press. Each area opens
  on a screenshot of the real application where one shows it.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { EDITION_INFO, type Edition } from "../../../shared/catalog";
  import { AREAS, FACTS, areaOf, carriedBy, type Area, type Fact } from "../../../shared/facts";
  import { animate } from "../motion";
  import { skin } from "../region.svelte";
  import { pick } from "../shots";
  import { href } from "../router";
  import Shot from "../sections/Shot.svelte";
  import RoadAhead from "../sections/RoadAhead.svelte";
  import { SOON_WORDS } from "../../../shared/facts";
  import { tick } from "../sfx.svelte";

  const NAMED: Edition[] = ["hobbyist", "autopilot", "karaoke", "apprentice", "pro", "full"];
  /** The screen that shows an area best. */
  const SCREEN: Partial<Record<Area, string>> = { mixing: "perform", library: "dig", hands: "launcher", karaoke: "karaoke", assist: "autopilot", learn: "practice", show: "lighting" };
  const WORD = { shipped: "Ships", part: "Part-built", planned: "Planned" };

  let root: HTMLElement;
  let query = $state("");
  let edition = $state<Edition | null>(null);
  let status = $state<"all" | "shipped" | "part" | "planned">("all");

  const editionsOf = (f: Fact) => NAMED.filter((e) => carriedBy(f, EDITION_INFO[e].modules));
  const matches = (f: Fact) => {
    const q = query.trim().toLowerCase();
    if (q && !`${f.name} ${f.about} ${f.caveat ?? ""}`.toLowerCase().includes(q)) return false;
    if (edition && (f.status === "planned" || !carriedBy(f, EDITION_INFO[edition].modules))) return false;
    return status === "all" || f.status === status;
  };
  const groups = $derived(AREAS.map((a) => ({ ...a, facts: FACTS.filter((f) => areaOf(f) === a.id && matches(f)) })).filter((g) => g.facts.length));
  const counts = { shipped: FACTS.filter((f) => f.status === "shipped").length, part: FACTS.filter((f) => f.status === "part").length, planned: FACTS.filter((f) => f.status === "planned").length };
  const shown = $derived(groups.reduce((n, g) => n + g.facts.length, 0));

  onMount(() => {
    const e = new URLSearchParams(location.search).get("edition") as Edition | null;
    if (e && NAMED.includes(e)) edition = e;
    // `/features#karaoke`: once the page has drawn.
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    return animate(root);
  });
</script>

<div class="features" bind:this={root} data-features>
  <header class="head">
    <div class="wrap">
      <p class="eyebrow">Every feature</p>
      <h1 class="h1" data-split>All of it,<br />and how far it is.</h1>
      <p class="lead">
        {counts.shipped} features ship, {counts.part} are part-built and {counts.planned} are planned — each with what it does, which editions carry it, and what has not yet been proven. djmanzo is in beta: tested in its own repository, against stand-ins where the hardware was missing, and not yet through a real gig.
      </p>
      <div class="tools">
        <input type="search" bind:value={query} placeholder="Search: stems, karaoke, MilkDrop, vinyl…" aria-label="Search the features" data-feature-search />
        <div class="seg" role="radiogroup" aria-label="Status">
          {#each ["all", "shipped", "part", "planned"] as const as s (s)}
            <button role="radio" aria-checked={status === s} onclick={() => (status = s)}>{s === "all" ? "All" : WORD[s]}</button>
          {/each}
        </div>
      </div>
      <div class="eds" role="group" aria-label="In which edition">
        <span class="dim small">In the edition:</span>
        {#each NAMED as e (e)}
          <button class="chip" class:on={edition === e} aria-pressed={edition === e} style:--c={EDITION_INFO[e].colour} onclick={() => (edition = edition === e ? null : e)} data-edition-filter={e}><span class="dot"></span>{EDITION_INFO[e].name}</button>
        {/each}
      </div>
    </div>
  </header>

  <div class="wrap layout">
    <nav class="toc" aria-label="Areas">
      {#each groups as g (g.id)}
        <a href={`#${g.id}`}>{g.name} <span class="mono dim">{g.facts.length}</span></a>
      {/each}
      <a class="price" href={href("pricing")}>Compare the editions →</a>
    </nav>

    <div class="areas">
      {#if !shown}
        <p class="dim">Nothing matches. Try another word, or another edition.</p>
      {/if}
      {#each groups as g (g.id)}
        {@const screen = SCREEN[g.id]}
        {@const shot = screen ? pick(screen, skin().themes) : null}
        <section class="area" id={g.id} aria-labelledby={`h-${g.id}`}>
          <h2 class="h2" id={`h-${g.id}`}>{g.name}</h2>
          <p class="dim">{g.about}</p>
          {#if shot && !query}
            <div class="shot">{#key shot.src}<Shot {shot} legend={false} label={g.name} />{/key}</div>
          {/if}
          <ul class="list">
            {#each g.facts as f (f.id)}
              {@const eds = editionsOf(f)}
              <li class="fact card" data-fact={f.id} onpointerenter={tick}>
                <div class="top">
                  <h3>{f.name}</h3>
                  {#if f.soon}
                    <span class="status soon {f.soon.how}" title={f.soon.waits}>{SOON_WORDS[f.soon.how]}</span>
                  {:else}
                    <span class="status {f.status}">{WORD[f.status]}</span>
                  {/if}
                </div>
                <p>{f.about}</p>
                {#if f.scene}<p class="scene"><span aria-hidden="true">🎧</span> {f.scene}</p>{/if}
                {#if f.soon}<p class="waits small">{f.soon.waits}</p>{/if}
                {#if f.caveat}<p class="caveat">{f.caveat}</p>{/if}
                <div class="in">
                  {#if f.status === "planned"}
                    <span class="dim small">In no edition yet.</span>
                  {:else if eds.length === NAMED.length}
                    <span class="every small">Every edition, the free Hobbyist one included</span>
                  {:else}
                    {#each eds as e (e)}<span class="ed" style:--c={EDITION_INFO[e].colour}>{EDITION_INFO[e].name}</span>{/each}
                    <span class="dim small">· or Custom</span>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>
  <RoadAhead />
</div>

<style>
  .scene {
    margin: 8px 0 0;
    padding: 8px 10px;
    border-left: 2px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 7%, transparent);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    font-size: 14px;
  }
  .waits {
    margin: 6px 0 0;
    color: var(--dim);
  }
  .status.soon.almost {
    background: var(--accent);
    color: var(--bg);
  }
  .head {
    padding: calc(var(--bar) + 64px) 0 28px;
    background:
      radial-gradient(60% 80% at 90% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%),
      var(--bg);
  }
  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 28px;
  }
  .tools input {
    flex: 1;
    min-width: 240px;
    font: inherit;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text);
  }
  .seg {
    display: inline-flex;
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }
  .seg button {
    font: 500 14px/1 var(--body);
    padding: 0 14px;
    background: none;
    border: 0;
    color: var(--dim);
    cursor: pointer;
  }
  .seg button[aria-checked="true"] {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--text);
  }
  .eds {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c);
  }
  .small {
    font-size: 13px;
  }
  .layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 40px;
    padding-bottom: 96px;
  }
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .toc {
      display: none !important;
    }
  }
  .toc {
    position: sticky;
    top: calc(var(--bar) + 24px);
    align-self: start;
    display: grid;
    gap: 2px;
    padding-top: 36px;
  }
  .toc a {
    display: flex;
    justify-content: space-between;
    padding: 7px 10px;
    border-radius: 8px;
    color: var(--text);
    text-decoration: none;
    font-size: 14px;
  }
  .toc a:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }
  .toc .price {
    margin-top: 12px;
    color: var(--accent);
    font-weight: 600;
  }
  .area {
    padding-top: 36px;
    scroll-margin-top: calc(var(--bar) + 16px);
  }
  .area > .dim {
    margin: 8px 0 0;
  }
  .shot {
    margin: 22px 0 6px;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 20px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
  }
  .fact {
    padding: 18px;
    display: grid;
    align-content: start;
    gap: 8px;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 10px;
  }
  h3 {
    margin: 0;
    font: 600 16px/1.3 var(--display);
  }
  .fact p {
    margin: 0;
    font-size: 14px;
    color: var(--dim);
  }
  .fact .caveat {
    margin: 0;
  }
  .in {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }
  .ed {
    font: 500 11px/1 var(--mono);
    padding: 5px 7px;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--c) 60%, var(--line));
    color: color-mix(in srgb, var(--c) 70%, var(--text));
  }
  .every {
    color: var(--accent-2);
  }
</style>
