<!--
  One question about one sense, with the reason, and a yes and a no of the
  same weight. Asked by the guide, or at Silence; never twice once answered.
-->
<script lang="ts">
  import { senses, type Sense } from "./senses.svelte";

  let { what, onanswer }: { what: Sense; onanswer?: (yes: boolean) => void } = $props();

  const ASK: Record<Sense, { q: string; why: string; yes: string }> = {
    where: {
      q: "May the night follow roughly where you are?",
      why: "Your town and time zone, read from your connection, set the light and the weather over the path. Nothing is stored.",
      yes: "Use roughly where I am",
    },
    gps: {
      q: "May it follow your own sky?",
      why: "Your browser's location, rounded to about a kilometre, gives the real sunset and the weather over your street. It stays in this tab; only the rounded point is sent, to ask for the weather.",
      yes: "Use my location",
    },
  };

  async function answer(yes: boolean) {
    if (yes) await senses.allow(what);
    else senses.decline(what);
    onanswer?.(yes);
  }
</script>

{#if senses.consent[what] === null}
  <div class="consent" data-consent={what}>
    <p class="q">{ASK[what].q}</p>
    <p class="why">{ASK[what].why}</p>
    <div class="row">
      <button onclick={() => answer(true)} disabled={senses.busy === what}>{ASK[what].yes}</button>
      <button onclick={() => answer(false)}>No, thank you</button>
    </div>
  </div>
{/if}

<style>
  .consent {
    border: 1px solid color-mix(in srgb, var(--ink) 30%, transparent);
    border-radius: 8px;
    padding: 12px 14px;
    background: color-mix(in srgb, var(--night) 70%, transparent);
  }
  .q {
    margin: 0 0 4px;
    font-family: var(--display);
  }
  .why {
    margin: 0 0 10px;
    font-size: 13px;
    opacity: 0.85;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  button {
    font: inherit;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1.5px solid color-mix(in srgb, var(--ink) 45%, transparent);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
  }
</style>
