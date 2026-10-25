<!--
  The marketplace: Outboard, the working one — listing, search, an item's
  page with its versions, ratings and maker, the upload, the report button —
  in this site's look. Every link it makes to itself stays on this page.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Outboard from "../../signal/auxiliary/Outboard.svelte";
  import { LISTED_KINDS } from "../../../shared/outboard";
  import { animate } from "../motion";
  import { shared } from "../region.svelte";
  import { i18n } from "../i18n.svelte";
  import { PAGES } from "../i18n/pages";

  const w = $derived(PAGES[i18n.lang].market);

  let { rest }: { rest: string[] } = $props();
  let root: HTMLElement;
  onMount(() => animate(root));
</script>

<div bind:this={root} data-aux="outboard">
  <header class="head">
    <div class="bg" aria-hidden="true" style:background-image={`url(${shared("market")})`}></div>
    <div class="wrap">
      <p class="eyebrow">{w.eyebrow}</p>
      <h1 class="h1">{@html w.title}</h1>
      <p class="lead">{w.lead}</p>
      <ul class="kinds">
        {#each LISTED_KINDS as k (k.kind)}
          <li data-reveal><b>{w.kinds[k.kind].name}</b><span>{w.kinds[k.kind].what}</span></li>
        {/each}
      </ul>
    </div>
  </header>
  <div class="wrap content body" data-market>
    <Outboard {rest} />
  </div>
</div>

<style>
  .head {
    position: relative;
    padding: calc(var(--bar) + 72px) 0 40px;
    overflow: hidden;
    isolation: isolate;
  }
  .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-size: cover;
    background-position: center;
    opacity: 0.4;
    mask-image: linear-gradient(180deg, black 20%, transparent 95%);
  }
  .kinds {
    list-style: none;
    padding: 0;
    margin: 36px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
  .kinds li {
    display: grid;
    gap: 6px;
    padding: 16px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    backdrop-filter: blur(8px);
  }
  .kinds span {
    color: var(--dim);
    font-size: 14px;
  }
  .body {
    padding-bottom: 96px;
  }
</style>
