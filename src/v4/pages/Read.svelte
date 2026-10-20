<!--
  A page that is only words — a blog post, the imprint, the terms, the
  privacy notice, the community rules — written by the Worker
  (`worker/seo.ts`) and shown here inside the site's own frame.
-->
<script lang="ts">
  import { onMount } from "svelte";

  let host: HTMLElement;
  let missing = $state(false);

  onMount(() => {
    const words = document.getElementById("static");
    if (words) host.appendChild(words);
    else missing = true;
  });
</script>

<article class="read wrap" bind:this={host} data-read>
  {#if missing}
    <p class="dim">This page could not be found. <a href="/">Back to djmanzo</a>.</p>
  {/if}
</article>

<style>
  .read {
    max-width: 48rem;
    padding-top: calc(var(--bar) + 56px);
    padding-bottom: 96px;
  }
  .read :global(#static) {
    padding: 0;
    max-width: none;
    font: inherit;
    font-size: 17px;
    line-height: 1.7;
  }
  .read :global(h1) {
    font: 600 clamp(2.2rem, 5vw, 3.6rem) / 1.05 var(--display);
    letter-spacing: -0.03em;
    margin: 0.4em 0 0.5em;
  }
  .read :global(h2) {
    font: 600 1.5rem/1.2 var(--display);
    letter-spacing: -0.02em;
    margin: 1.8em 0 0.5em;
  }
  .read :global(a) {
    color: var(--accent);
  }
  .read :global(nav),
  .read :global(footer),
  .read :global(.byline) {
    font: 12px/1.6 var(--mono);
    color: var(--dim);
  }
  .read :global(footer) {
    margin-top: 48px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
  }
  .read :global(pre),
  .read :global(code) {
    background: var(--raised);
    border-radius: 6px;
    padding: 0 5px;
    font-family: var(--mono);
    font-size: 0.9em;
  }
  .read :global(blockquote) {
    border-left: 2px solid var(--accent);
    margin: 1em 0;
    padding-left: 16px;
    color: var(--dim);
  }
</style>
