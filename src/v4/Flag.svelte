<!--
  A language's flag, drawn small: English shows the United Kingdom on the left
  and the United States on the right — both halves of the language the site
  speaks. Brazil for Portuguese (the site speaks Brazilian Portuguese), and
  each language's own country for the rest; Arabic and Swahili, read across
  many countries, a letter of their own instead of one country's flag. Cropped
  to whatever box it is put in.
-->
<script lang="ts">
  import type { Lang } from "./i18n.svelte";

  let { lang, size = 20 }: { lang: Lang; size?: number } = $props();
</script>

<svg class="flag" viewBox="0 0 30 20" width={size} height={size} preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-flag={lang}>
  {#if lang === "en"}
    <!-- Dividing line between the two flags -->
    <defs>
      <clipPath id="uk-half"><rect width="15" height="20" /></clipPath>
      <clipPath id="us-half"><rect x="15" width="15" height="20" /></clipPath>
    </defs>

    <!-- LEFT HALF: Union Jack — bold diagonals and cross, clearly readable at small sizes -->
    <g clip-path="url(#uk-half)">
      <rect width="30" height="20" fill="#012169" />
      <!-- White diagonals (St Andrew + St Patrick background) -->
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" stroke-width="5" />
      <!-- Red diagonals (St Patrick) -->
      <path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" stroke-width="2" />
      <!-- White cross (St George background) -->
      <path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="7" />
      <!-- Red cross (St George) -->
      <path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="4" />
    </g>

    <!-- RIGHT HALF: Stars and Stripes — 7 red stripes, white gaps, blue canton with visible stars -->
    <g clip-path="url(#us-half)">
      <!-- Red field (all 7 red stripes are this background) -->
      <rect width="30" height="20" fill="#B22234" />
      <!-- 6 white stripes (stripes 2,4,6,8,10,12 of 13) -->
      <rect y="1.54" width="30" height="1.54" fill="#fff" />
      <rect y="4.62" width="30" height="1.54" fill="#fff" />
      <rect y="7.69" width="30" height="1.54" fill="#fff" />
      <rect y="10.77" width="30" height="1.54" fill="#fff" />
      <rect y="13.85" width="30" height="1.54" fill="#fff" />
      <rect y="16.92" width="30" height="1.54" fill="#fff" />
      <!-- Blue canton — covers top 7 stripes worth of height -->
      <rect x="15" width="15" height="10.77" fill="#3C3B6E" />
      <!-- Stars: 4 rows, larger radius so they're visible at 20px icon size -->
      <g fill="#fff">
        <circle cx="17.5" cy="1.8" r="1" /><circle cx="20.5" cy="1.8" r="1" /><circle cx="23.5" cy="1.8" r="1" /><circle cx="26.5" cy="1.8" r="1" />
        <circle cx="19" cy="3.9" r="1" /><circle cx="22" cy="3.9" r="1" /><circle cx="25" cy="3.9" r="1" />
        <circle cx="17.5" cy="6" r="1" /><circle cx="20.5" cy="6" r="1" /><circle cx="23.5" cy="6" r="1" /><circle cx="26.5" cy="6" r="1" />
        <circle cx="19" cy="8.1" r="1" /><circle cx="22" cy="8.1" r="1" /><circle cx="25" cy="8.1" r="1" />
      </g>
    </g>

    <!-- Thin dividing line between the two halves -->
    <line x1="15" y1="0" x2="15" y2="20" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />

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
  {:else if lang === "ja"}
    <rect width="30" height="20" fill="#fff" />
    <circle cx="15" cy="10" r="6" fill="#BC002D" />
  {:else if lang === "ar"}
    <rect width="30" height="20" fill="#fff" />
    <text x="15" y="15" text-anchor="middle" font-size="14" font-family="serif" fill="#006233">ع</text>
  {:else if lang === "sw"}
    <rect width="30" height="20" fill="#fff" />
    <text x="15" y="15" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#00A551">S</text>
  {:else}
    <rect width="30" height="20" fill="#888" />
  {/if}
</svg>

<style>
  .flag {
    display: block;
    border-radius: 3px;
    overflow: hidden;
    flex: none;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 0.12);
  }
</style>