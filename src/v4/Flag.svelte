<!--
  A language's flag, drawn small: the United Kingdom for English, Brazil for
  Portuguese (the site speaks Brazilian Portuguese), and each language's own
  country for the rest; Arabic and Swahili, read across many countries, a
  letter of their own instead of one country's flag. Cropped to whatever box
  it is put in.
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
  {:else if lang === "ja"}
    <rect width="30" height="20" fill="#fff" />
    <circle cx="15" cy="10" r="6" fill="#BC002D" />
  {:else if lang === "zh"}
    <rect width="30" height="20" fill="#EE1C25" />
    <path d="M5.00 2.00L5.67 4.07L7.85 4.07L6.09 5.35L6.76 7.43L5.00 6.15L3.24 7.43L3.91 5.35L2.15 4.07L4.33 4.07z" fill="#FFDE00" />
    <path d="M10.55 1.05L10.38 1.83L11.08 2.23L10.28 2.31L10.11 3.09L9.79 2.36L9.00 2.45L9.59 1.91L9.26 1.18L9.96 1.58z" fill="#FFDE00" /><path d="M12.19 2.92L12.30 3.71L13.09 3.85L12.37 4.20L12.48 4.99L11.93 4.41L11.21 4.76L11.58 4.06L11.03 3.48L11.82 3.62z" fill="#FFDE00" /><path d="M11.81 5.92L12.18 6.62L12.97 6.48L12.42 7.06L12.79 7.76L12.07 7.41L11.52 7.99L11.63 7.20L10.91 6.85L11.70 6.71z" fill="#FFDE00" /><path d="M9.45 8.05L10.04 8.58L10.74 8.18L10.41 8.91L11.00 9.45L10.21 9.36L9.89 10.09L9.72 9.31L8.92 9.23L9.62 8.83z" fill="#FFDE00" />
  {:else if lang === "hi"}
    <rect width="30" height="20" fill="#fff" />
    <rect width="30" height="6.67" fill="#FF9933" />
    <rect y="13.33" width="30" height="6.67" fill="#138808" />
    <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width="0.7" />
    <circle cx="15" cy="10" r="0.6" fill="#000080" />
  {:else if lang === "ar"}
    <rect width="30" height="20" fill="#0B6E4F" />
    <text x="15" y="14.6" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="system-ui, sans-serif">ع</text>
  {:else if lang === "id"}
    <rect width="30" height="20" fill="#fff" />
    <rect width="30" height="10" fill="#CE1126" />
  {:else if lang === "ko"}
    <rect width="30" height="20" fill="#fff" />
    <path d="M10.5 10a4.5 4.5 0 0 1 9 0z" fill="#CD2E3A" />
    <path d="M10.5 10a4.5 4.5 0 0 0 9 0z" fill="#0047A0" />
    <circle cx="12.75" cy="10" r="2.25" fill="#CD2E3A" />
    <circle cx="17.25" cy="10" r="2.25" fill="#0047A0" />
    <path d="M4 4.5 6.5 2M5 5.5 7.5 3M6 6.5 8.5 4M23.5 13.5 26 16M22.5 14.5 25 17M21.5 15.5 24 18M23.5 6.5 26 4M21.5 4.5 24 2M4 15.5 6.5 18M6 13.5 8.5 16" stroke="#000" stroke-width="0.8" />
  {:else if lang === "vi"}
    <rect width="30" height="20" fill="#DA251D" />
    <path d="M15.00 5.40L16.17 8.99L19.95 8.99L16.89 11.21L18.06 14.81L15.00 12.59L11.94 14.81L13.11 11.21L10.05 8.99L13.83 8.99z" fill="#FFFF00" />
  {:else if lang === "th"}
    <rect width="30" height="20" fill="#A51931" />
    <rect y="3.33" width="30" height="13.33" fill="#F4F5F8" />
    <rect y="6.67" width="30" height="6.67" fill="#2D2A4A" />
  {:else if lang === "tr"}
    <rect width="30" height="20" fill="#E30A17" />
    <circle cx="11.5" cy="10" r="5" fill="#fff" />
    <circle cx="12.75" cy="10" r="4" fill="#E30A17" />
    <path d="M16.00 10.00L17.52 9.51L17.52 7.91L18.46 9.20L19.98 8.71L19.04 10.00L19.98 11.29L18.46 10.80L17.52 12.09L17.52 10.49z" fill="#fff" />
  {:else if lang === "sw"}
    <rect width="30" height="20" fill="#1EB53A" />
    <rect y="7" width="30" height="6" fill="#000" />
    <text x="15" y="12.6" text-anchor="middle" font-size="7" font-weight="800" fill="#FCD116" font-family="system-ui, sans-serif">Sw</text>
  {:else if lang === "he"}
    <rect width="30" height="20" fill="#fff" />
    <rect y="2" width="30" height="2.6" fill="#0038B8" />
    <rect y="15.4" width="30" height="2.6" fill="#0038B8" />
    <path d="M15 6.4 18.3 12.1H11.7zM15 13.6 11.7 7.9H18.3z" fill="none" stroke="#0038B8" stroke-width="0.8" />
  {/if}
</svg>

<style>
  .flag {
    display: block;
    flex: none;
    border-radius: 50%;
  }
</style>
