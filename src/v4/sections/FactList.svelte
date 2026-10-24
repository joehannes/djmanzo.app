<!--
  Features as the facts state them (`shared/facts.ts`): what it does, whether
  it ships, is partly built or is planned, and the caveat that goes with it.
  No other words about the application are allowed on the site.
-->
<script lang="ts">
  import { FACT_BY_ID } from "../../../shared/facts";
  import { i18n } from "../i18n.svelte";
  import { HOME } from "../i18n/home";
  import { tf } from "../i18n/facts.svelte";

  let { ids, compact = false }: { ids: string[]; compact?: boolean } = $props();
  const WORD = $derived(HOME[i18n.lang].status);
  const facts = $derived(ids.map((id) => FACT_BY_ID[id]).filter(Boolean).map(tf));
</script>

<ul class="facts" class:compact>
  {#each facts as f (f.id)}
    <li data-fact={f.id} data-reveal>
      <div class="head">
        <b>{f.name}</b>
        <span class="status {f.status}">{WORD[f.status]}</span>
      </div>
      <p>{f.about}</p>
      {#if f.caveat && !compact}<p class="caveat">{f.caveat}</p>{/if}
    </li>
  {/each}
</ul>

<style>
  .facts {
    list-style: none;
    padding: 0;
    margin: 28px 0 0;
    display: grid;
    gap: 18px;
  }
  li {
    padding-top: 18px;
    border-top: 1px solid var(--line);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  b {
    font: 600 16px/1.3 var(--body);
  }
  p {
    margin: 6px 0 0;
    color: var(--dim);
    font-size: 15px;
  }
  .compact p {
    font-size: 14px;
  }
</style>
