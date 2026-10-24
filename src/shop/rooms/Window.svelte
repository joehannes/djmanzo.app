<!--
  The shop window: every way to pay less, painted on the glass, and none of
  them a countdown. The price for where the visitor is comes from the
  Worker's catalogue, which reads the country from the connection.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { catalog } from "../../lib/catalog.svelte";

  onMount(() => void catalog.load());
  const c = $derived(catalog.data);
  const off = $derived(c ? Math.round((1 - (c.bands.share[String(c.visitor.band)] ?? 1)) * 100) : 0);
  const where = $derived.by(() => {
    const code = c?.visitor.country;
    try {
      return code ? (new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? null) : null;
    } catch {
      return null;
    }
  });
</script>

<div class="window" data-window>
  <div class="sign big" style:--tilt="-2deg">
    <b>Hobbyist</b>
    <span>free, for ever</span>
    <small>Everything basic a DJ needs, and what every trial comes back to.</small>
  </div>
  <div class="sign" style:--tilt="1.5deg">
    <b>{c?.trialDays ?? 7} days</b>
    <span>of any edition, free</span>
    <small>Once per account. Then you keep the Hobbyist edition.</small>
  </div>
  <div class="sign" style:--tilt="-1deg" data-region>
    {#if c && off > 0}
      <b>−{off} %</b>
      <span>{where ? `in ${where}` : "where you are"}</span>
      <small>Prices follow what a living costs where you live, by the World Bank's income groups.</small>
    {:else}
      <b>Fair</b>
      <span>wherever you are</span>
      <small>Where living costs less, djmanzo costs less: 40, 60 or 70 % off, by the World Bank's income groups.</small>
    {/if}
  </div>
  <div class="sign" style:--tilt="2deg">
    <b>½</b>
    <span>for students and teachers</span>
    <small>Half the list price, with a school or university e-mail address.</small>
  </div>
  <div class="sign" style:--tilt="-1.5deg">
    <b>Upgrade</b>
    <span>pay the difference</span>
    <small>What you paid counts in full towards a bigger edition.</small>
  </div>
  <p class="small-print">Discounts never stack: you get the best one that applies. No timers, no "only today": the price is the same on a Tuesday.</p>
</div>

<style>
  .window {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(12px, 2vw, 22px);
    align-items: flex-start;
    align-content: flex-start;
  }
  .sign {
    flex: 1 1 200px;
    max-width: 280px;
    display: grid;
    gap: 2px;
    padding: 16px 18px;
    border-radius: 10px;
    background: rgb(255 248 230 / 0.12);
    border: 2px solid rgb(255 248 230 / 0.55);
    backdrop-filter: blur(3px);
    transform: rotate(var(--tilt));
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.3);
    text-shadow: 0 1px 8px rgb(0 0 0 / 0.6);
  }
  .sign b {
    font-family: var(--display);
    font-weight: 400;
    font-size: clamp(1.6rem, 3vw, 2.3rem);
    color: var(--mango);
    line-height: 1;
  }
  .sign span {
    font-family: var(--hand);
    font-size: 1.45rem;
  }
  .sign small {
    font-size: 13px;
    opacity: 0.9;
  }
  .sign.big {
    flex-basis: 260px;
    background: rgb(242 169 59 / 0.2);
    border-color: var(--mango);
  }
  .small-print {
    flex-basis: 100%;
    margin: 4px 0 0;
    font-size: 14px;
    text-shadow: 0 1px 8px rgb(0 0 0 / 0.8);
  }
</style>
