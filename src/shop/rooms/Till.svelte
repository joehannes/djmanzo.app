<!--
  The till: the editions as records in a rack behind the counter, each with
  its price for where the visitor is. The free one is the first thing in
  reach. Paying happens at the island's box office, which already knows how.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { catalog } from "../../lib/catalog.svelte";
  import { money, type Edition } from "../../../shared/catalog";
  import { regional, type Band } from "../../../shared/regions";

  type Plan = "perpetual" | "monthly" | "yearly";
  const ORDER: Edition[] = ["hobbyist", "autopilot", "karaoke", "apprentice", "pro", "full", "custom"];
  let plan = $state<Plan>("perpetual");

  onMount(() => void catalog.load());
  const c = $derived(catalog.data);

  function price(e: Edition): string {
    if (!c) return "…";
    if (e === "hobbyist") return "Free";
    if (e === "custom") return "Your choice of modules";
    const b = (c.visitor.band || 1) as Band;
    return `${money(regional(e, plan, b), c.visitor.currency)}${plan === "perpetual" ? "" : ` ${c.plans[plan].per}`}`;
  }
</script>

<div class="till" data-till>
  <div class="first">
    <h2>Take the single home</h2>
    <p>djmanzo, the Hobbyist edition: free, for macOS and Linux. Every edition comes in the same download; signing in unlocks what you have.</p>
    <a class="go" href="https://github.com/joehannes/djmanzo/releases/latest" data-download>Download djmanzo</a>
    {#if c}<p class="status">{c.status}</p>{/if}
  </div>

  <div class="rack">
    <div class="plans" role="radiogroup" aria-label="How to pay">
      {#each ["perpetual", "monthly", "yearly"] as const as p (p)}
        <button role="radio" aria-checked={plan === p} class:on={plan === p} onclick={() => (plan = p)} data-plan={p}>{c?.plans[p].name ?? p}</button>
      {/each}
    </div>
    <ul class="editions">
      {#each ORDER as e (e)}
        {@const info = c?.editions[e]}
        <li class="ed" style:--colour={info?.colour ?? "#999"} data-edition={e}>
          <span class="disc" aria-hidden="true">{info?.emoji ?? ""}</span>
          <div>
            <b>{info?.name ?? e}</b>
            <small>{info?.forWho ?? ""}</small>
          </div>
          <em>{price(e)}</em>
        </li>
      {/each}
    </ul>
    <p class="fine">{c ? c.plans[plan].about : ""} Prices shown for where you are; the box office checks the rest.</p>
    <a class="go quiet" href="/pricing" data-box-office>Try one free for {c?.trialDays ?? 7} days, or buy</a>
  </div>
</div>

<style>
  .till {
    display: grid;
    grid-template-columns: minmax(260px, 0.8fr) 1.3fr;
    gap: clamp(14px, 2.5vw, 32px);
    align-items: start;
  }
  @media (max-width: 860px) {
    .till {
      grid-template-columns: 1fr;
    }
  }
  .first,
  .rack {
    background: var(--paper);
    color: var(--ink-dark);
    border-radius: 6px;
    padding: clamp(14px, 2vw, 22px);
    box-shadow: 0 18px 40px rgb(0 0 0 / 0.45);
  }
  .first {
    background: linear-gradient(160deg, #ffe2a8, var(--mango));
  }
  h2 {
    font-family: var(--display);
    font-weight: 400;
    margin: 0 0 8px;
    font-size: clamp(1.2rem, 2vw, 1.6rem);
  }
  .first p {
    margin: 0 0 12px;
  }
  .status {
    font-size: 13px;
    opacity: 0.8;
    margin-top: 12px !important;
  }
  .go {
    display: inline-block;
    font-weight: 800;
    padding: 10px 18px;
    border-radius: 999px;
    background: var(--ink-dark);
    color: var(--paper);
    text-decoration: none;
  }
  .go.quiet {
    background: var(--mango);
    color: var(--ink-dark);
  }
  .plans {
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: rgb(42 26 14 / 0.1);
    margin-bottom: 10px;
  }
  .plans button {
    font: inherit;
    font-weight: 700;
    font-size: 14px;
    padding: 6px 14px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--ink-dark);
    cursor: pointer;
  }
  .plans button.on {
    background: var(--ink-dark);
    color: var(--paper);
  }
  .editions {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 6px;
  }
  .ed {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 10px;
    align-items: center;
    padding: 6px 8px;
    border-radius: 8px;
    border-left: 6px solid var(--colour);
    background: rgb(255 255 255 / 0.6);
  }
  .disc {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: radial-gradient(circle, var(--colour) 0 30%, #1b1714 31% 100%);
    font-size: 14px;
  }
  .ed b {
    font-family: var(--display);
    font-weight: 400;
  }
  .ed small {
    display: block;
    font-size: 12px;
    opacity: 0.75;
  }
  .ed em {
    font-style: normal;
    font-weight: 800;
    white-space: nowrap;
    text-align: right;
  }
  .fine {
    font-size: 13px;
    opacity: 0.8;
    margin: 10px 0 12px;
  }
</style>
