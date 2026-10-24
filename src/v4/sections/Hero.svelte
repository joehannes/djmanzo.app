<!--
  The first screen: a photograph of the kind of night the visitor plays,
  drifting at its own depth, the promise in one line, Download one click
  away — and a deck, playing the skin's music on press, its waveform drawn
  on the GPU from what is playing and what is about to.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { art, skin, region } from "../region.svelte";
  import { flavourOf } from "../../../shared/flavours";

  // The visitor's own country inside their region's look (shared/flavours.ts).
  const flavour = $derived(flavourOf(region.country));
  const countryName = (code: string) => {
    try {
      return new Intl.DisplayNames([LANG_INFO[i18n.lang].tag], { type: "region" }).of(code) ?? code;
    } catch {
      return code;
    }
  };
  import { deck, keyOf, setGenre, tempoOf, toggle } from "../sound.svelte";
  import { gsap, lean, reduced, ScrollTrigger } from "../motion";
  import { href } from "../router";
  import { choice } from "../dlchoice.svelte";
  import { LANG_INFO, i18n, t } from "../i18n.svelte";
  import DownloadButton from "../DownloadButton.svelte";
  import Wave from "../wave/Wave.svelte";

  let hero: HTMLElement;
  let photo: HTMLElement;
  let glow: HTMLElement;
  let title: HTMLElement;
  const genre = $derived(GENRE_BY_ID[deck.genre] ?? GENRE_BY_ID.house);
  const key = $derived(keyOf(genre));

  // A new look fades its photograph in.
  let shown: string | null = null;
  $effect(() => {
    const id = region.skin;
    if (shown && shown !== id && photo && !reduced()) gsap.fromTo(photo, { opacity: 0.15 }, { opacity: 1, duration: 0.9, ease: "power2.out" });
    shown = id;
  });

  onMount(() => {
    const undoLean = lean(hero, [
      { el: photo, depth: 18 },
      { el: glow, depth: -30 },
    ]);
    if (reduced()) return undoLean;
    const ctx = gsap.context(() => {
      gsap.from(title.querySelectorAll(".line > span"), { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.09, delay: 0.1 });
      gsap.from("[data-hero-rise]", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.45 });
      gsap.to(photo, { yPercent: 14, scale: 1.08, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-hero-copy]", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }, hero);
    return () => {
      undoLean();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  });
</script>

<section class="hero" bind:this={hero} id="top" aria-labelledby="hero-title">
  <div class="photo-wrap" aria-hidden="true">
    <div class="photo" bind:this={photo} style:background-image={`url(${art("hero")})`} data-hero-photo></div>
    <div class="glow" bind:this={glow}></div>
    <div class="motif" data-motif></div>
    <div class="shade"></div>
  </div>

  <div class="wrap copy" data-hero-copy>
    {#if flavour}
      <p class="local" data-hero-rise data-local={region.country}>
        <span class="flag" aria-hidden="true">{#each flavour.colours as c (c)}<i style:background={c}></i>{/each}</span>
        <b>{flavour.hello}</b> {countryName(region.country!)} · {flavour.scene}
      </p>
    {/if}
    <p class="eyebrow" data-hero-rise>{t("hero.eyebrow")}</p>
    <h1 class="h1" id="hero-title" bind:this={title}>
      <span class="line"><span>{t("hero.l1")}</span></span>
      <span class="line"><span class="accent">{t("hero.l2")}</span></span>
    </h1>
    <!-- The look's own line is in English for now: the looks are translated next. -->
    <p class="lead" data-hero-rise>{t("hero.lead")}{i18n.lang === "en" ? ` ${skin().line}` : ""}</p>
    <div class="ctas" data-hero-rise>
      <DownloadButton id="get" />
      <a class="btn ghost" href={href("pricing")}>{t("hero.pricing")}</a>
    </div>
    <p class="note mono" data-hero-rise>{t(`note.${choice.os}`)} {t("hero.free")}</p>
  </div>

  <div class="wrap deckwrap" data-hero-rise>
    <div class="deck card" data-deck>
      <div class="transport">
        <button class="play" class:on={deck.playing} onclick={toggle} aria-label={deck.playing ? t("hero.stop") : t("hero.play")} data-play>
          {#if deck.playing}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          {:else}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>
          {/if}
        </button>
        <div class="readout mono" aria-live="polite">
          <span><b data-bpm>{tempoOf(genre.id).toFixed(1)}</b> BPM</span>
          <span><b>{key.camelot}</b> {key.name}</span>
          <span class="genre">{genre.name}</span>
        </div>
        <div class="grooves" role="group" aria-label={t("hero.grooves")}>
          {#each skin().genres as g (g)}
            <button class="chip" aria-pressed={deck.genre === g} onclick={() => setGenre(g)} data-groove={g}>{GENRE_BY_ID[g].name}</button>
          {/each}
        </div>
      </div>
      <div class="strip">
        <Wave mode="bands" colours={skin().bands} span={7} playhead={0.42} label={t("hero.wave")} />
        <span class="tag past mono" aria-hidden="true">{t("hero.played")}</span>
        <span class="tag next mono" aria-hidden="true">{t("hero.coming")}</span>
      </div>
      <p class="caption">{deck.playing ? t("hero.playing") : t("hero.idle")}</p>
    </div>
  </div>
</section>

<style>
  .local {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 14px;
    padding: 6px 12px 6px 8px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
    background: color-mix(in srgb, var(--bg) 55%, transparent);
    backdrop-filter: blur(6px);
    font-size: 13px;
    color: var(--dim);
  }
  .local b {
    color: var(--text);
    font-family: var(--display);
  }
  .flag {
    display: inline-flex;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
  }
  .flag i {
    width: 7px;
    height: 14px;
  }
  /* The skin's symbol, large and slow, at the edge of the photograph (`looks.ts`). */
  .motif {
    position: absolute;
    right: -6vw;
    top: 8vh;
    width: min(52vw, 640px);
    aspect-ratio: 1;
    background: var(--motif) center / contain no-repeat;
    opacity: 0.18;
    mix-blend-mode: screen;
    animation: turn 120s linear infinite;
    pointer-events: none;
  }
  @keyframes turn {
    to {
      rotate: 360deg;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .motif {
      animation: none;
    }
  }
  .hero {
    position: relative;
    min-height: max(720px, 100svh);
    display: grid;
    grid-template-rows: 1fr auto;
    padding-top: calc(var(--bar) + 40px);
    overflow: hidden;
    isolation: isolate;
  }
  .photo-wrap {
    position: absolute;
    inset: 0;
    z-index: -1;
  }
  .photo {
    position: absolute;
    inset: -40px;
    background-size: cover;
    background-position: center 40%;
    transform-origin: center;
  }
  .glow {
    position: absolute;
    width: 60vmax;
    height: 60vmax;
    right: -20vmax;
    top: -20vmax;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%);
    mix-blend-mode: screen;
  }
  .shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--bg) 92%, transparent) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 45%, transparent 75%),
      linear-gradient(0deg, var(--bg) 2%, color-mix(in srgb, var(--bg) 30%, transparent) 40%, color-mix(in srgb, var(--bg) 40%, transparent) 100%);
  }
  @media (max-width: 720px) {
    .shade {
      background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 70%, transparent) 0%, color-mix(in srgb, var(--bg) 82%, transparent) 50%, var(--bg) 100%);
    }
  }
  .copy {
    align-self: center;
    padding-bottom: 32px;
    /* It moves with the pointer, so it is a layer of its own: above the deck, so the Download menu opens over it. */
    position: relative;
    z-index: 2;
  }
  .line {
    display: block;
    overflow: hidden;
    padding-bottom: 0.06em;
  }
  .line > span {
    display: inline-block;
  }
  .accent {
    color: var(--accent);
  }
  .ctas {
    position: relative;
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }
  .note {
    font-size: 12px;
    color: var(--dim);
    margin: 14px 0 0;
  }
  .deckwrap {
    padding-bottom: 40px;
  }
  .deck {
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    backdrop-filter: blur(18px) saturate(1.3);
    border-color: color-mix(in srgb, var(--text) 12%, transparent);
    padding: 14px;
    box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.7);
  }
  .transport {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
  }
  .play {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 0;
    background: var(--accent);
    color: var(--on-accent);
    display: grid;
    place-items: center;
    cursor: pointer;
    flex: none;
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 60%, transparent);
    transition: box-shadow 0.3s;
  }
  .play svg {
    fill: currentColor;
  }
  .play.on {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 22%, transparent);
  }
  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    font-size: 12px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .readout b {
    color: var(--text);
    font-weight: 500;
    font-size: 15px;
    letter-spacing: 0;
  }
  .genre {
    color: var(--accent);
  }
  .grooves {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
  }
  .grooves .chip {
    min-height: 30px;
    font-size: 13px;
    padding: 0 12px;
  }
  .strip {
    position: relative;
    height: clamp(90px, 13vw, 140px);
    border-radius: 10px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 70%, transparent), color-mix(in srgb, var(--bg) 92%, transparent));
    overflow: hidden;
  }
  .tag {
    position: absolute;
    top: 8px;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .tag.past {
    left: 10px;
  }
  .tag.next {
    right: 10px;
  }
  .caption {
    margin: 10px 2px 0;
    font-size: 13px;
    color: var(--dim);
  }
  @media (max-width: 720px) {
    .grooves {
      margin-left: 0;
    }
  }
</style>
