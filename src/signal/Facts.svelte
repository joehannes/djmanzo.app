<!-- What the application does here: from shared/facts.ts, with each fact's status and caveat. -->
<script lang="ts">
  import { FACT_BY_ID } from "../../shared/facts";
  import { CHEAPEST_WITH, EDITION_INFO } from "../../shared/catalog";

  let { ids }: { ids: string[] } = $props();
  const facts = $derived(ids.map((id) => FACT_BY_ID[id]).filter(Boolean));
</script>

<ul class="facts">
  {#each facts as f (f.id)}
    <li data-fact={f.id} data-status={f.status}>
      <b>{f.name}</b>
      {#if f.status !== "shipped"}<em>{f.status === "planned" ? "planned" : "part-built"}</em>{/if}
      {#if f.module !== "foundation"}<span class="ed">from {EDITION_INFO[CHEAPEST_WITH[f.module]].name}</span>{/if}
      <span>{f.about}</span>
      {#if f.caveat}<small>{f.caveat}</small>{/if}
    </li>
  {/each}
</ul>

<style>
  .facts {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }
  li {
    display: grid;
    gap: 2px;
    padding-left: 12px;
    border-left: 3px solid var(--accent);
  }
  em {
    justify-self: start;
    font-style: normal;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--glow);
    color: var(--night);
  }
  .ed {
    font-size: 12px;
    opacity: 0.75;
  }
  small {
    opacity: 0.8;
    font-style: italic;
  }
</style>
