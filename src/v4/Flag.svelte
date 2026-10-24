<!--
  A language's flag, drawn small: the United Kingdom for English, Brazil for
  Portuguese (the site speaks Brazilian Portuguese), and each language's own
  country for the rest. Cropped to whatever box it is put in.
-->
<script lang="ts">
  import type { Lang } from "./i18n.svelte";

  let { lang, size = 20 }: { lang: Lang; size?: number } = $props();
</script>

<svg class="flag" viewBox="0 0 30 20" width={size} height={size} preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-flag={lang}>
  {#if lang === "en"}
    <rect width="30" height="20" fill="#012169" />
    <path d="M0 0 30 20M30 0 0 20" stroke="#fff" stroke-width="4" />
    <path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" stroke-width="1.4" />
    <path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6" />
    <path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="3.6" />
  {:else if lang === "es"}
    <rect width="30" height="20" fill="#AA151B" />
    <rect y="5" width="30" height="10" fill="#F1BF00" />
  {:else if lang === "pt"}
    <rect width="30" height="20" fill="#009C3B" />
    <path d="M15 2.2 27.4 10 15 17.8 2.6 10z" fill="#FFDF00" />
    <circle cx="15" cy="10" r="4.6" fill="#002776" />
    <path d="M10.6 8.9c3-.6 6.3-.2 8.8 1.4" stroke="#fff" stroke-width="0.8" fill="none" />
  {:else if lang === "de"}
    <rect width="30" height="20" fill="#000" />
    <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
    <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
  {:else if lang === "fr"}
    <rect width="30" height="20" fill="#fff" />
    <rect width="10" height="20" fill="#002395" />
    <rect x="20" width="10" height="20" fill="#ED2939" />
  {:else if lang === "it"}
    <rect width="30" height="20" fill="#fff" />
    <rect width="10" height="20" fill="#009246" />
    <rect x="20" width="10" height="20" fill="#CE2B37" />
  {:else}
    <rect width="30" height="20" fill="#fff" />
    <circle cx="15" cy="10" r="6" fill="#BC002D" />
  {/if}
</svg>

<style>
  .flag {
    display: block;
    flex: none;
    border-radius: 50%;
  }
</style>
