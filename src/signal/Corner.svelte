<!--
  The top right corner, on the map and on every stage: the guide, which
  follows the visitor along the path, and "Your night" — what the path
  knows about them, each sense to switch, their constellation, "Forget
  me", which removes all of it from this browser, and the way to what is
  still only on the island.
-->
<script lang="ts">
  import { NODES } from "../style/genome";
  import type { StageId } from "../style/genome/types";
  import { senses, clock } from "./sense/senses.svelte";
  import { talk } from "./guide/talk.svelte";
  import { signal } from "./state.svelte";
  import Guide from "./Guide.svelte";
  import Poster from "./poster/Poster.svelte";

  let { stage = null, ongo }: { stage?: StageId | null; ongo: (s: StageId) => void } = $props();
  let open = $state<"guide" | "you" | null>(null);
  let poster = $state(false);
  let forgotten = $state(false);

  const toggle = (what: "guide" | "you") => (open = open === what ? null : what);

  function go(s: StageId) {
    open = null;
    ongo(s);
  }

  function forget() {
    signal.forget();
    senses.forget();
    talk.forget();
    poster = false;
    forgotten = true;
  }

  function keys(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      open = null;
      // Close the drawer, and only the drawer: the stage underneath stays.
      e.stopImmediatePropagation();
    }
  }
</script>

<svelte:window onkeydown={keys} />

<div class="corner">
  {#if stage !== "silence"}
    <button class="tab" aria-expanded={open === "guide"} onclick={() => toggle("guide")} data-corner="guide">Guide</button>
  {/if}
  <button class="tab" aria-expanded={open === "you"} onclick={() => toggle("you")} data-corner="you">Your night</button>
</div>

{#if open === "guide"}
  <aside class="drawer" aria-label="The guide">
    <Guide {stage} ongo={go} />
  </aside>
{:else if open === "you"}
  <aside class="drawer" aria-label="Your night" data-yournight>
    {#if senses.city || senses.sky}
      <p class="sky">
        Tonight{senses.city ? ` in ${senses.city}` : ""}, {clock(senses.now)}{senses.sky ? ` · ${senses.sky}` : ""}.
        {#if senses.nextSunrise}<br />The sun rises at {clock(senses.nextSunrise)}.{/if}
      </p>
    {:else}
      <p class="sky">The night goes by your clock: {clock(senses.now)}.</p>
    {/if}

    <h2>What the path knows</h2>
    <ul class="known">
      <li>Your music: <b>{NODES[signal.style]?.name ?? signal.style}</b>{signal.role ? `, and that you ${signal.role === "listening" ? "listen" : signal.role === "learning" ? "are learning" : signal.role === "karaoke" ? "host karaoke" : "DJ"}` : ""} — in this browser.</li>
      <li>Stages seen: {signal.visited.length} — in this browser.</li>
      <li>
        Roughly where you are:
        {#if senses.consent.where}
          yes{senses.city ? ` (${senses.city})` : ""} — read each visit, not stored. <button class="link" onclick={() => senses.decline("where")}>Stop</button>
        {:else}
          no. <button class="link" onclick={() => senses.allow("where")}>Allow</button>
        {/if}
      </li>
      <li>
        Your own location:
        {#if senses.consent.gps}
          yes — rounded, in this tab only. <button class="link" onclick={() => senses.decline("gps")}>Stop</button>
        {:else}
          no. <button class="link" onclick={() => senses.allow("gps")}>Allow</button>
        {/if}
      </li>
      <li>The talk with the guide: {talk.turns.length} lines — in this tab, and with the guide while it answers.</li>
    </ul>
    {#if senses.note}<p class="note">{senses.note}</p>{/if}
    {#if senses.weather}<p class="note">{senses.weather.credit}.</p>{/if}

    <div class="row">
      <button class="go" onclick={() => (poster = !poster)} aria-expanded={poster}>Your constellation</button>
      <button class="quiet" onclick={forget} data-forget>Forget me</button>
    </div>
    {#if forgotten}<p class="note" role="status">Forgotten: this browser holds nothing of your visit now.</p>{/if}
    {#if poster}<Poster />{/if}

    <h2>Elsewhere on the site</h2>
    <p class="elsewhere" data-elsewhere>
      <a class="link" href="/outboard">Outboard</a>, the marketplace, <a class="link" href="/talkback">Talkback</a>, the discussion, and
      <a class="link" href="/blog">the blog</a>. Still on <a class="link" href="/island/">the island</a>, the site before this one:
      <a class="link" href="/island/#/pase">your pass</a> — your licences, and the licence line for djmanzo —
      <a class="link" href="/island/#/muro">the wishlist</a> and <a class="link" href="/island/#/arena">honest comparisons</a>.
    </p>
    <p class="elsewhere small"><a class="link" href="/imprint">Imprint</a> · <a class="link" href="/terms">Terms</a> · <a class="link" href="/rules">Rules</a> · <a class="link" href="/privacy">Privacy</a></p>
  </aside>
{/if}

<style>
  .corner {
    position: fixed;
    top: 12px;
    right: 14px;
    display: flex;
    gap: 6px;
    z-index: 5;
  }
  .tab {
    font: inherit;
    font-size: 13px;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
    background: color-mix(in srgb, var(--night) 70%, transparent);
    backdrop-filter: blur(6px);
    color: var(--ink);
    cursor: pointer;
  }
  .tab[aria-expanded="true"] {
    background: var(--glow);
    color: var(--night);
    border-color: var(--glow);
  }
  .drawer {
    position: fixed;
    top: 56px;
    right: 14px;
    width: min(26rem, calc(100vw - 28px));
    max-height: calc(100vh - 80px);
    overflow: auto;
    box-sizing: border-box;
    padding: 16px 18px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--night) 90%, transparent);
    backdrop-filter: blur(8px);
    border-top: 3px solid var(--glow);
    color: var(--ink);
    font-family: var(--text);
    z-index: 5;
    animation: drop 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  @keyframes drop {
    from {
      opacity: 0;
      translate: 0 -10px;
    }
  }
  h2 {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.1rem;
    margin: 14px 0 6px;
  }
  .sky {
    margin: 0;
    font-family: var(--display);
    font-size: 1.1rem;
    line-height: 1.35;
  }
  .known {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 6px;
    font-size: 14px;
  }
  .note {
    font-size: 12.5px;
    opacity: 0.75;
    margin: 8px 0 0;
  }
  .elsewhere {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
  .link {
    font: inherit;
    background: none;
    border: 0;
    padding: 0;
    color: var(--glow);
    text-decoration: underline;
    cursor: pointer;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 14px 0 12px;
  }
  .go,
  .quiet {
    font: inherit;
    padding: 9px 16px;
    border-radius: 6px;
    cursor: pointer;
  }
  .go {
    border: 0;
    background: var(--accent);
    color: var(--night);
    font-weight: 800;
  }
  .quiet {
    background: transparent;
    color: var(--ink);
    border: 1px solid color-mix(in srgb, var(--ink) 40%, transparent);
  }
  @media (prefers-reduced-motion: reduce) {
    .drawer {
      animation: none;
    }
  }
</style>
