<!--
  The Amp's play: a power dial through the editions, cheapest to fullest.
  Turning it up lights the room — that is the art; the prices beside it are
  the box office's own (shared/catalog.ts), and buying is on the Reveal.
-->
<script lang="ts">
  import { BUY_ONCE, EDITION_INFO, money, type Edition } from "../../shared/catalog";

  let { onplay }: { onplay: (k: number) => void } = $props();

  const ORDER = (Object.keys(BUY_ONCE) as Exclude<Edition, "custom">[]).sort((a, b) => BUY_ONCE[a] - BUY_ONCE[b]);
  let at = $state(0);
  const info = $derived(EDITION_INFO[ORDER[at]]);

  $effect(() => {
    onplay(0.15 + (at / (ORDER.length - 1)) * 0.85);
  });
</script>

<div class="amp" data-amp>
  <label class="dial">
    <span class="sr-only">Power: the editions, from the cheapest to everything</span>
    <input type="range" min="0" max={ORDER.length - 1} step="1" bind:value={at} style="--k:{at / (ORDER.length - 1)}" />
  </label>
  <p class="reading" aria-live="polite">
    <b>{info.name}</b> — {info.tagline} <span class="price">{BUY_ONCE[ORDER[at]] ? `${money(BUY_ONCE[ORDER[at]], "USD")} once` : "free, for ever"}</span>
  </p>
</div>

<style>
  .amp {
    display: grid;
    gap: 12px;
  }
  input[type="range"] {
    width: min(100%, 34rem);
    accent-color: var(--glow);
    height: 28px;
  }
  .reading {
    margin: 0;
  }
  .price {
    opacity: 0.8;
    white-space: nowrap;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
