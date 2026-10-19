<!--
  A send beside the main line: Outboard, Talkback, or one of the pages a site
  that hosts others' words must have — a full page over the painting, read
  without WebGL as well as with it. Escape, or "The map", returns.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { session } from "../../lib/session.svelte";
  import Outboard from "./Outboard.svelte";
  import Talkback from "./Talkback.svelte";
  import Legal from "./Legal.svelte";
  import { SUBTITLE, TITLE, type AuxRoute } from "./routes";

  let { route, onmap }: { route: AuxRoute; onmap: () => void } = $props();

  onMount(() => {
    if (!session.loaded) void session.refresh();
  });

  function keys(e: KeyboardEvent) {
    if (e.key === "Escape" && !(e.target as HTMLElement).closest("input, textarea, select")) onmap();
  }
</script>

<svelte:window onkeydown={keys} />

<div class="aux" data-aux={route.id}>
  <header>
    <button class="back" onclick={onmap}>← The map</button>
    <nav aria-label="Sends">
      <a href="/outboard" class:on={route.id === "outboard"}>Outboard</a>
      <a href="/talkback" class:on={route.id === "talkback"}>Talkback</a>
    </nav>
  </header>
  <main>
    <h1>{TITLE[route.id]}</h1>
    <p class="sub">{SUBTITLE[route.id]}</p>
    {#if route.id === "outboard"}
      <Outboard rest={route.rest} />
    {:else if route.id === "talkback"}
      <Talkback rest={route.rest} />
    {:else}
      <Legal page={route.id} />
    {/if}
  </main>
  <footer>
    <a href="/imprint">Imprint</a> · <a href="/terms">Terms</a> · <a href="/rules">Community rules</a> · <a href="/privacy">Privacy</a>
  </footer>
</div>

<style>
  .aux {
    position: fixed;
    inset: 0;
    overflow: auto;
    z-index: 4;
    background: color-mix(in srgb, var(--night) 94%, transparent);
    backdrop-filter: blur(6px);
    color: var(--ink);
    font-family: var(--text);
  }
  header {
    position: sticky;
    top: 0;
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 12px 16px;
    padding-right: 220px;
    background: color-mix(in srgb, var(--night) 96%, transparent);
    z-index: 1;
  }
  @media (max-width: 640px) {
    header {
      padding-right: 16px;
      padding-top: 56px;
    }
  }
  header nav {
    display: flex;
    gap: 10px;
  }
  header nav a {
    color: inherit;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ink) 30%, transparent);
  }
  header nav a.on {
    background: var(--glow);
    color: var(--night);
    border-color: var(--glow);
  }
  .back {
    font: inherit;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
  }
  main {
    max-width: 72rem;
    margin: 0 auto;
    padding: 8px 16px 40px;
    box-sizing: border-box;
  }
  h1 {
    font-family: var(--display);
    font-weight: 400;
    font-size: clamp(1.8rem, 4vw, 3rem);
    margin: 10px 0 4px;
  }
  .sub {
    opacity: 0.85;
    margin: 0 0 20px;
  }
  footer {
    text-align: center;
    padding: 20px 16px 30px;
    font-size: 13px;
    opacity: 0.8;
  }
  footer a {
    color: inherit;
  }
  main :global(h2) {
    font-family: var(--display);
    font-weight: 400;
    font-size: 1.4rem;
    margin: 20px 0 8px;
  }
  main :global(.note) {
    font-size: 13px;
    opacity: 0.8;
  }
  main :global(.link) {
    font: inherit;
    background: none;
    border: 0;
    padding: 0;
    color: var(--glow);
    text-decoration: underline;
    cursor: pointer;
  }
  main :global(.go) {
    display: inline-block;
    font: inherit;
    font-weight: 800;
    padding: 9px 16px;
    border: 0;
    border-radius: 6px;
    background: var(--accent);
    color: var(--night);
    text-decoration: none;
    cursor: pointer;
  }
  main :global(.go:disabled) {
    opacity: 0.5;
    cursor: default;
  }
  main :global(.quiet) {
    font: inherit;
    padding: 6px 12px;
    border-radius: 6px;
    background: transparent;
    color: var(--ink);
    border: 1px solid color-mix(in srgb, var(--ink) 40%, transparent);
    cursor: pointer;
  }
  main :global(input[type="text"]),
  main :global(input[type="search"]),
  main :global(textarea),
  main :global(select) {
    font: inherit;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--ink) 30%, transparent);
    background: color-mix(in srgb, var(--night) 70%, black);
    color: var(--ink);
    box-sizing: border-box;
    max-width: 100%;
  }
  main :global(textarea) {
    min-height: 5rem;
  }
</style>
