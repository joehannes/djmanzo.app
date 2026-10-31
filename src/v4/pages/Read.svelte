<!--
  A page that is only words — a blog post, the imprint, the terms, the
  privacy notice, the community rules — written by the Worker
  (`worker/seo.ts`) and shown here inside the site's own frame.
-->
<script module lang="ts">
  /**
   * The Worker's words, once taken from the page: the page is built again
   * when the language changes (a pack arriving, or the visitor's choice), and
   * the new one takes the same words.
   */
  let kept: HTMLElement | null = null;
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "../i18n.svelte";

  let host: HTMLElement;
  let missing = $state(false);

  /** The site's own pages, which the Worker writes in every language. */
  const LEGAL = ["imprint", "terms", "rules", "privacy"];

  onMount(() => {
    const words = kept ?? document.getElementById("static");
    if (!words) {
      missing = true;
      return;
    }
    const again = kept !== null;
    kept = words;
    // The Worker wrote the words in the address's language (`?lang=`), else English.
    const url = new URL(location.href);
    const written = url.searchParams.get("lang") ?? "en";
    const page = url.pathname.split("/").filter(Boolean)[0] ?? "";
    // One of the site's own pages in another language than the one being read: the Worker has it in that
    // one too. Not while a language's pack is still on its way (the page reads English until it arrives).
    if (written !== i18n.lang && (again || i18n.lang !== "en") && LEGAL.includes(page)) {
      if (i18n.lang === "en") url.searchParams.delete("lang");
      else url.searchParams.set("lang", i18n.lang);
      location.replace(url.toString());
      return;
    }
    host.appendChild(words);
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
  /* A translation of the site's own pages says first that the English text applies. */
  .read :global(.applies) {
    font-size: 14px;
    color: var(--dim);
    border-inline-start: 2px solid var(--line);
    padding-inline-start: 12px;
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
    border-inline-start: 2px solid var(--accent);
    margin: 1em 0;
    padding-inline-start: 16px;
    color: var(--dim);
  }
</style>
