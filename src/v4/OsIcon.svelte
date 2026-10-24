<!--
  A small mark for a computer's system, drawn here (no logo files): an apple
  for macOS, four panes for Windows, a penguin for Linux, a laptop for
  anything else. Decorative: whatever carries it says the system in words.
-->
<script lang="ts">
  import type { Os } from "./download";

  let { os, size = 16 }: { os: Os; size?: number } = $props();
</script>

<svg class="os-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
  {#if os === "mac"}
    <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.9c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
  {:else if os === "windows"}
    <path d="M3 5.2 10.4 4.2v7.2H3zM11.4 4.1 21 2.7v8.7h-9.6zM3 12.4h7.4v7.2L3 18.6zM11.4 12.4H21v8.8l-9.6-1.3z" />
  {:else if os === "linux"}
    <path d="M12 2.5c-2.3 0-3.6 1.9-3.6 4.4 0 1.4.3 2.3-.6 3.6-1.2 1.6-2.7 3.6-2.7 6.2 0 .7.1 1.3.3 1.9-.9.4-1.9.9-1.9 1.6 0 .9 1.6 1 3 1.3 1.1.2 1.9.9 2.7.9.7 0 1.2-.4 1.5-.9h2.6c.3.5.8.9 1.5.9.8 0 1.6-.7 2.7-.9 1.4-.3 3-.4 3-1.3 0-.7-1-1.2-1.9-1.6.2-.6.3-1.2.3-1.9 0-2.6-1.5-4.6-2.7-6.2-.9-1.3-.6-2.2-.6-3.6 0-2.5-1.3-4.4-3.6-4.4zm-1.3 3.6a.8 1 0 1 1 0 2 .8 1 0 0 1 0-2zm2.6 0a.8 1 0 1 1 0 2 .8 1 0 0 1 0-2zM12 8.6l1.6.9-1.6 1-1.6-1zm0 3.2c1.8 0 3.1 1.9 3.1 4.4S13.8 20 12 20s-3.1-1.3-3.1-3.8 1.3-4.4 3.1-4.4z" />
  {:else}
    <path d="M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1zm1 2v7h14V7zM1.5 17.5h21l-1 2h-19z" />
  {/if}
</svg>

<style>
  .os-icon {
    flex: none;
    display: block;
  }
</style>
