<!--
  djmanzo beside the software DJs already use, said fairly (the island's
  arena until 25 October). Each corner says what the other one does better
  — that is the part a visitor can trust the rest by. Only rows we are sure
  of are in the table; everything else is said in words, with its
  uncertainty.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { animate } from "../motion";
  import { i18n } from "../i18n.svelte";
  import { COMPARE, RIVALS, ROWS, type Row } from "../i18n/compare";
  import { fill } from "../i18n/sections";
  import { href } from "../router";

  const w = $derived(COMPARE[i18n.lang]);
  let root: HTMLElement;
  onMount(() => animate(root));

  const COLS = ["djmanzo", "VirtualDJ", "Serato", "rekordbox", "Traktor", "djay", "Mixxx"];
  /** Each row's cells, in `COLS`' order: yes, no, or a word in place of yes. */
  const CELLS: Record<Row, (boolean | "beta" | "notYet")[]> = {
    linux: [true, false, false, false, false, false, true],
    windows: ["beta", true, true, true, true, true, true],
    karaoke: [true, true, false, false, false, false, false],
    streaming: ["notYet", true, true, true, true, true, false],
    gigs: ["beta", true, true, true, true, true, true],
  };
  const cell = (v: boolean | "beta" | "notYet") => (v === true ? "✓" : v === false ? "—" : w[v]);
</script>

<div class="compare" bind:this={root} data-compare>
  <header class="head">
    <div class="wrap">
      <p class="eyebrow">{w.eyebrow}</p>
      <h1 class="h1">{@html w.title}</h1>
      <p class="lead">{w.lead}</p>
    </div>
  </header>

  <div class="wrap body">
    <div class="scroll" data-reveal>
      <table>
        <thead>
          <tr><th></th>{#each COLS as c, i (c)}<th class:us={i === 0}>{c}</th>{/each}</tr>
        </thead>
        <tbody>
          {#each ROWS as r (r)}
            <tr>
              <th scope="row">{w.rows[r]}</th>
              {#each CELLS[r] as v, i (i)}<td class:us={i === 0}>{cell(v)}</td>{/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="dim small">{@html fill(w.checked, { wishes: href("wishes") })}</p>

    <div class="corners">
      {#each RIVALS as r (r)}
        <article class="corner" data-reveal>
          <h2>{fill(w.vs, { name: r })}</h2>
          <p><b>{fill(w.stronger, { name: r })}</b> {w.rivals[r][0]}</p>
          <p><b>{w.different}</b> {w.rivals[r][1]}</p>
        </article>
      {/each}
    </div>

    <h2 class="h2">{w.notReady}</h2>
    <ul class="gaps">
      {#each w.gaps as g (g)}<li>{@html g}</li>{/each}
    </ul>
    <p class="closing">{@html fill(w.closing, { pricing: href("pricing") })}</p>
  </div>
</div>

<style>
  .head {
    padding: calc(var(--bar) + 64px) 0 24px;
  }
  .body {
    padding-bottom: 80px;
  }
  .scroll {
    overflow-x: auto;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
  }
  table {
    width: 100%;
    min-width: 680px;
    border-collapse: collapse;
    font-size: 14px;
  }
  th,
  td {
    padding: 10px 12px;
    text-align: center;
    border-bottom: 1px solid var(--line);
  }
  tbody tr:last-child :is(th, td) {
    border-bottom: 0;
  }
  th[scope="row"] {
    text-align: left;
    font-weight: 500;
  }
  .us {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    font-weight: 700;
  }
  .small {
    font-size: 13px;
    margin-top: 10px;
  }
  .small :global(a),
  .closing :global(a) {
    color: var(--accent);
  }
  .corners {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: 16px;
    margin: 36px 0 48px;
  }
  .corner {
    padding: 18px;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    background: var(--surface);
  }
  .corner h2 {
    margin: 0 0 8px;
    font-size: 1.1rem;
  }
  .corner p {
    font-size: 14px;
    color: var(--dim);
  }
  .corner b {
    color: var(--text);
  }
  .gaps {
    display: grid;
    gap: 8px;
    padding-left: 1.2em;
  }
  .closing {
    margin-top: 24px;
    max-width: 70ch;
  }
</style>
