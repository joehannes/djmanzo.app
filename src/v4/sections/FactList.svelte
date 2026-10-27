<!--
  Features as the facts state them (`shared/facts.ts`): what it does, whether
  it ships, is partly built or is planned, and the caveat that goes with it.
  No other words about the application are allowed on the site.

  To be read at a glance: the first fact open, the others as their names and
  status, each opening in place with a press. Every word stays in the page.
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
  {#each facts as f, i (f.id)}
    <li data-fact={f.id} data-reveal>
      <details open={i === 0}>
        <summary class="head">
          <b>{f.name}</b>
          <span class="status {f.status}">{WORD[f.status]}</span>
          <span class="chev" aria-hidden="true"></span>
        </summary>
        <div class="body">
          <p>{f.about}</p>
          {#if f.caveat && !compact}<p class="caveat">{f.caveat}</p>{/if}
        </div>
      </details>
    </li>
  {/each}
</ul>

<style>
  .facts {
    list-style: none;
    padding: 0;
    margin: 28px 0 0;
    display: grid;
    gap: 0;
  }
  li {
    border-top: 1px solid var(--line);
  }
  li:last-child {
    border-bottom: 1px solid var(--line);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 2px;
    cursor: pointer;
    list-style: none;
    transition: color 0.15s;
  }
  .head::-webkit-details-marker {
    display: none;
  }
  .head b {
    flex: 1;
    font: 600 16px/1.3 var(--body);
  }
  .head:hover b {
    color: var(--accent);
  }
  .head:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 4px;
  }
  /* A chevron that turns as the fact opens. */
  .chev {
    flex: none;
    width: 8px;
    height: 8px;
    border-inline-end: 2px solid var(--dim);
    border-bottom: 2px solid var(--dim);
    transform: rotate(45deg) translate(-2px, -2px);
    transition: transform 0.25s;
  }
  details[open] .chev {
    transform: rotate(-135deg) translate(-2px, -2px);
  }
  .body {
    padding: 0 2px 16px;
    animation: open 0.3s ease-out;
  }
  @keyframes open {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
  p {
    margin: 0 0 6px;
    color: var(--dim);
    font-size: 15px;
  }
  .compact p {
    font-size: 14px;
  }
  @media (prefers-reduced-motion: reduce) {
    .body,
    .chev {
      animation: none;
      transition: none;
    }
  }
</style>
