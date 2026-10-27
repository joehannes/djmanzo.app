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
  /** Its welcome in its own script, when the page speaks its language. */
  const own = $derived(flavour?.native?.lang === i18n.lang ? flavour.native : null);
  const countryName = (code: string) => {
    try {
      return new Intl.DisplayNames([LANG_INFO[i18n.lang].tag], { type: "region" }).of(code) ?? code;
    } catch {
      return code;
    }
  };
  /** The country's music, a list of genre names, joined the visitor's language's way ("techno, house und Schlager"). */
  const sceneIn = (scene: string) => {
    if (i18n.lang === "en") return scene;
    try {
      return new Intl.ListFormat(LANG_INFO[i18n.lang].tag, { type: "conjunction" }).format(scene.split(/, | and /));
    } catch {
      return scene;
    }
  };
  import { beatClock, deck, keyOf, play, setGenre, speed, stop, tempoOf, toggle } from "../sound.svelte";
  import { getEngine, hasEngine } from "../../lib/audio/engine";
  import { gsap, lean, reduced, ScrollTrigger } from "../motion";
  import { href } from "../router";
  import { choice } from "../dlchoice.svelte";
  import { LANG_INFO, i18n, t } from "../i18n.svelte";
  import { WELCOME } from "../i18n/welcome";
  import DownloadButton from "../DownloadButton.svelte";
  import Wave from "../wave/Wave.svelte";
  import Booth from "../booth/Booth.svelte";
  import { booth } from "../booth/booth.svelte";
  import { BOOTH } from "../i18n/booth";
  import { bankOfGenres } from "../skins";

  let hero: HTMLElement;
  let photo: HTMLElement;
  let glow: HTMLElement;
  let title: HTMLElement;
  /** The welcome for where the visitor plays, in the language they read. */
  const welcome = $derived(WELCOME[region.skin][i18n.lang]);
  const genre = $derived(GENRE_BY_ID[deck.genre] ?? GENRE_BY_ID.house);
  const key = $derived(keyOf(genre));
  const bw = $derived(BOOTH[i18n.lang]);
  /** The look's grooves in three groups — the region's own (the visitor's country's first), the world's, and specials — those with a loop. */
  const grooves = $derived(bankOfGenres(skin(), region.country));
  let genreMenu = $state(false);
  let genrePicker: HTMLElement;

  function chooseGenre(id: string) {
    setGenre(id);
    genreMenu = false;
  }

  /** The deck's tempo as its display shows it: how far the pitch fader and the jog have moved it. */
  const tempoText = $derived(`${speed.rate >= 1 ? "+" : "−"}${Math.abs((speed.rate - 1) * 100).toFixed(1)}%`);
  /** Which beat of the bar it is on, for the display's counter; −1 at rest. */
  let beatNo = $state(-1);
  $effect(() => {
    if (!deck.playing) {
      beatNo = -1;
      return;
    }
    let frame = 0;
    const count = () => {
      const c = beatClock();
      beatNo = c && hasEngine() ? Math.floor((getEngine().ctx.currentTime - c.one) / c.beat) % 4 : -1;
      frame = requestAnimationFrame(count);
    };
    frame = requestAnimationFrame(count);
    return () => cancelAnimationFrame(frame);
  });

  /**
   * The cue button, as on a CDJ: pressed while the deck plays, back to the
   * top and stopped; pressed while it is stopped, it plays for as long as it
   * is held.
   */
  let cueing = false;
  function cueDown() {
    if (cueing) return;
    if (deck.playing) return stop();
    cueing = true;
    play();
  }
  function cueUp() {
    if (!cueing) return;
    cueing = false;
    stop();
  }

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
    const closeGenreMenu = (e: PointerEvent) => {
      if (genreMenu && genrePicker && !genrePicker.contains(e.target as Node)) genreMenu = false;
    };
    const closeGenreMenuWithKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") genreMenu = false;
    };
    document.addEventListener("pointerdown", closeGenreMenu);
    document.addEventListener("keydown", closeGenreMenuWithKey);
    if (reduced()) return () => {
      undoLean();
      document.removeEventListener("pointerdown", closeGenreMenu);
      document.removeEventListener("keydown", closeGenreMenuWithKey);
    };
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
      document.removeEventListener("pointerdown", closeGenreMenu);
      document.removeEventListener("keydown", closeGenreMenuWithKey);
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
        <b>{own?.hello ?? flavour.hello}</b> {countryName(region.country!)} · {own?.scene ?? sceneIn(flavour.scene)}
      </p>
    {/if}
    <p class="eyebrow" data-hero-rise>{t("hero.eyebrow")}</p>
    <h1 class="h1" id="hero-title" bind:this={title}>
      <span class="line"><span>{welcome.l1}</span></span>
      <span class="line"><span class="accent">{welcome.l2}</span></span>
    </h1>
    <p class="lead" data-hero-rise data-welcome={`${region.skin}.${i18n.lang}`}>{welcome.lead}</p>
    <div class="ctas" data-hero-rise>
      <DownloadButton id="get" />
      <a class="btn ghost" href={href("pricing")}>{t("hero.pricing")}</a>
    </div>
    <p class="note mono" data-hero-rise>{t(`note.${choice.os}`)} {t("hero.free")}</p>
  </div>

  <div class="wrap deckwrap" data-hero-rise>
    <div class="deck card" data-deck data-deck-source={deck.source}>
      <div class="transport">
        <div class="buttons">
          <button
            class="cue"
            class:lit={!deck.playing}
            onpointerdown={cueDown}
            onpointerup={cueUp}
            onpointerleave={cueUp}
            onpointercancel={cueUp}
            onkeydown={(e) => (e.key === "Enter" || e.key === " ") && !e.repeat && (e.preventDefault(), cueDown())}
            onkeyup={(e) => (e.key === "Enter" || e.key === " ") && cueUp()}
            title={bw.hw.cue}
            aria-label={bw.hw.cue}
            data-cue>CUE</button
          >
          <button data-track="deck:play" class="play" class:on={deck.playing} class:busy={deck.loading} aria-busy={deck.loading} onclick={toggle} aria-label={deck.playing ? t("hero.stop") : t("hero.play")} data-play>
            <svg viewBox="0 0 34 18" width="30" height="16" aria-hidden="true"><path d="M2 2v14l11-7z" /><rect x="19" y="2" width="4.5" height="14" rx="1" /><rect x="27" y="2" width="4.5" height="14" rx="1" /></svg>
          </button>
        </div>
        <div class="screen mono">
          <div class="cell bpm" aria-live="polite"><span class="k">BPM</span><b data-bpm>{tempoOf(genre.id).toFixed(1)}</b></div>
          <div class="cell"><span class="k">KEY</span><b>{key.camelot}</b><span class="v">{key.name}</span></div>
          <div class="cell"><span class="k">TEMPO</span><b data-tempo-shown>{tempoText}</b></div>
          <div class="cell" aria-hidden="true"><span class="k">BEAT</span><span class="count">{#each [0, 1, 2, 3] as b (b)}<i class:on={beatNo === b} class:one={b === 0}></i>{/each}</span></div>
          <div class="cell track" bind:this={genrePicker}>
            <span class="k">TRACK</span>
            <button class="genre-trigger" aria-haspopup="dialog" aria-expanded={genreMenu} onclick={() => (genreMenu = !genreMenu)} data-genre-trigger>
              <span>{genre.emoji} {genre.name}</span><span class="genre-caret" aria-hidden="true">⌄</span>
            </button>
            {#if genreMenu}
              <div class="genre-picker card" role="dialog" aria-label={t("hero.grooves")} data-genre-picker>
                <div class="picker-head"><span class="mono">SELECT A GROOVE</span><button class="picker-close" onclick={() => (genreMenu = false)} aria-label="Close genre selection">×</button></div>
                <div class="picker-groups">
                  {#each (["local", "common", "special"] as const).filter((k) => grooves[k].length) as k (k)}
                    <div class="picker-group" data-groove-group={k}>
                      <span class="mono dim gl">{bw.groups[k]}</span>
                      <div class="picker-chips">
                        {#each grooves[k] as g (g)}
                          <button class="chip" aria-pressed={deck.genre === g} onclick={() => chooseGenre(g)} data-groove={g}>{GENRE_BY_ID[g].emoji} {GENRE_BY_ID[g].name}</button>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div class="strip">
        <Wave mode="bands" colours={skin().bands} span={7} playhead={0.42} label={t("hero.wave")} />
        <span class="tag past mono" aria-hidden="true">{t("hero.played")}</span>
        <span class="tag next mono" aria-hidden="true">{t("hero.coming")}</span>
      </div>
      <div class="under">
        <p class="caption">{deck.playing ? t("hero.playing") : t("hero.idle")}</p>
        <button class:open={booth.open} class="booth-toggle" aria-expanded={booth.open} aria-controls="booth-console" onclick={() => (booth.open = !booth.open)} data-booth-toggle>
          <span class="booth-toggle-icon" aria-hidden="true">⌁</span><span>{booth.open ? bw.close : bw.open}</span><span class="booth-toggle-caret" aria-hidden="true">⌄</span>
        </button>
      </div>
      {#if booth.open}<Booth />{/if}
    </div>
  </div>
</section>

<style>
  .picker-group {
    display: grid;
    grid-template-columns: 76px 1fr;
    gap: 8px;
    align-items: start;
  }
  .picker-group .gl {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding-top: 7px;
  }
  .under {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .under .caption {
    margin: 0;
  }
  .play.busy {
    animation: busy 0.9s ease-in-out infinite alternate;
  }
  @keyframes busy {
    to {
      opacity: 0.55;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .play.busy {
      animation: none;
      opacity: 0.6;
    }
  }
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
    font-weight: var(--display-weight, 600);
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
  /* The deck: a CDJ's top plate, dark and a little glossy over the photograph. */
  .deck {
    --lcd: color-mix(in srgb, var(--accent) 45%, #c8f6ff);
    background:
      repeating-linear-gradient(90deg, rgb(255 255 255 / 0.012) 0 1px, transparent 1px 3px),
      linear-gradient(180deg, color-mix(in srgb, #1d1d22 90%, transparent), color-mix(in srgb, #0e0e11 94%, transparent));
    backdrop-filter: blur(18px) saturate(1.3);
    border-color: rgb(255 255 255 / 0.09);
    padding: 14px;
    color: #ececf1;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.08),
      0 30px 80px -20px rgb(0 0 0 / 0.75);
  }
  .transport {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
  }
  /* Gear reads left to right in every language: the buttons and the display are not mirrored. */
  .buttons {
    direction: ltr;
    display: flex;
    gap: 10px;
    flex: none;
  }
  /* Cue and play: round rubber buttons with a ring of light, orange and green as on the players in every booth. */
  .cue,
  .play {
    --ring: #ff9a1f;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 0;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex: none;
    color: #e9e9ee;
    background: radial-gradient(circle at 50% 35%, #34343a, #1b1b1f 70%);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--ring) 22%, #111),
      0 3px 0 #050506,
      0 6px 14px rgb(0 0 0 / 0.5),
      inset 0 1px 0 rgb(255 255 255 / 0.12);
    transition:
      box-shadow 0.2s,
      transform 0.06s;
    touch-action: manipulation;
    user-select: none;
  }
  .cue {
    font: 700 12px/1 var(--mono, monospace);
    letter-spacing: 0.08em;
  }
  .play {
    --ring: #2bff7a;
  }
  .cue:active,
  .play:active {
    transform: translateY(2px);
  }
  .cue.lit,
  .play.on {
    box-shadow:
      0 0 0 3px var(--ring),
      0 0 18px 2px color-mix(in srgb, var(--ring) 55%, transparent),
      0 3px 0 #050506,
      inset 0 1px 0 rgb(255 255 255 / 0.12);
  }
  .cue.lit {
    color: var(--ring);
  }
  .play svg {
    fill: currentColor;
  }
  .play.on svg {
    fill: var(--ring);
  }
  .cue:focus-visible,
  .play:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }
  /* The player's display: what is loaded, its tempo and key, and the beat it is on. */
  .screen {
    direction: ltr;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    align-items: flex-end;
    padding: 8px 14px;
    border-radius: 8px;
    background: linear-gradient(180deg, #07111a, #04080d);
    box-shadow:
      inset 0 0 0 1px rgb(255 255 255 / 0.07),
      inset 0 2px 10px #000;
    color: var(--lcd);
    font-variant-numeric: tabular-nums;
  }
  .cell {
    display: grid;
    gap: 2px;
  }
  .cell .k {
    font-size: 9px;
    letter-spacing: 0.16em;
    opacity: 0.55;
  }
  .cell b {
    font-weight: 600;
    font-size: 15px;
    text-shadow: 0 0 8px color-mix(in srgb, var(--lcd) 60%, transparent);
  }
  .cell.bpm b {
    font-size: 24px;
    line-height: 1;
  }
  .cell .v {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.75;
  }
  .count {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }
  .count i {
    width: 14px;
    height: 7px;
    border-radius: 1.5px;
    background: color-mix(in srgb, var(--lcd) 14%, transparent);
  }
  .count i.on {
    background: var(--lcd);
    box-shadow: 0 0 8px var(--lcd);
  }
  .count i.one.on {
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
  }
  .track {
    position: relative;
  }
  .genre-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    padding: 3px 7px 3px 5px;
    border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
    border-radius: 5px;
    color: var(--accent);
    background: linear-gradient(110deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent 68%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.1), 0 0 14px color-mix(in srgb, var(--accent) 12%, transparent);
    font: inherit;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, transform 0.12s;
  }
  .genre-trigger:hover,
  .genre-trigger[aria-expanded="true"] {
    border-color: var(--accent);
    background: linear-gradient(110deg, color-mix(in srgb, var(--accent) 32%, transparent), transparent 75%);
  }
  .genre-trigger:active { transform: translateY(1px); }
  .genre-trigger:focus-visible,
  .picker-close:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .genre-caret { font-size: 15px; line-height: 0.5; opacity: 0.8; }
  .genre-picker {
    position: absolute;
    z-index: 20;
    top: calc(100% + 12px);
    right: 0;
    width: min(540px, calc(100vw - 56px));
    padding: 12px;
    border-color: color-mix(in srgb, var(--accent) 38%, var(--line));
    background:
      radial-gradient(circle at 90% 0, color-mix(in srgb, var(--accent) 20%, transparent), transparent 40%),
      repeating-linear-gradient(90deg, rgb(255 255 255 / 0.018) 0 1px, transparent 1px 3px),
      linear-gradient(150deg, rgb(35 35 42 / 0.98), rgb(12 12 15 / 0.98));
    box-shadow: 0 22px 45px -16px #000, 0 0 30px color-mix(in srgb, var(--accent) 20%, transparent);
    animation: picker-in 0.18s ease-out both;
  }
  @keyframes picker-in { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }
  .picker-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    color: var(--lcd);
    font-size: 10px;
    letter-spacing: 0.14em;
  }
  .picker-close {
    width: 25px;
    height: 25px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: rgb(0 0 0 / 0.2);
    color: #fff;
    font: 300 21px/1 sans-serif;
    cursor: pointer;
  }
  .picker-groups { display: grid; gap: 9px; }
  .picker-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .picker-chips .chip {
    min-height: 30px;
    font-size: 13px;
    padding: 0 12px;
    color: #e6e6ec;
    border: 0;
    background: linear-gradient(180deg, #2a2a30, #1d1d22);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.09), 0 2px 0 #050506;
    transition: transform 0.06s, box-shadow 0.15s;
  }
  .picker-chips .chip:hover { background: linear-gradient(180deg, #33333a, #222228); }
  .picker-chips .chip:active { transform: translateY(1px); }
  .picker-chips .chip[aria-pressed="true"] {
    color: #fff;
    box-shadow: inset 0 0 0 1px var(--accent), inset 0 0 12px color-mix(in srgb, var(--accent) 35%, transparent), 0 0 12px color-mix(in srgb, var(--accent) 35%, transparent), 0 2px 0 #050506;
  }
  .track .genre {
    color: var(--accent);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  /* The waveform, in the player's screen. */
  .strip {
    position: relative;
    height: clamp(90px, 13vw, 140px);
    border-radius: 10px;
    background: linear-gradient(180deg, #06090d, #020304);
    box-shadow:
      inset 0 0 0 1px rgb(255 255 255 / 0.07),
      inset 0 2px 12px #000,
      0 0 0 4px #0b0b0e;
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
  .booth-toggle {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-width: min(100%, 230px);
    margin: 4px auto -30px;
    padding: 10px 20px;
    border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--line));
    border-radius: 0 0 999px 999px;
    color: #f4f1f5;
    background: linear-gradient(120deg, color-mix(in srgb, var(--accent) 26%, rgb(15 15 19 / 0.92)), color-mix(in srgb, var(--accent-2) 20%, rgb(15 15 19 / 0.92)));
    box-shadow: 0 11px 22px -13px #000, inset 0 1px 0 rgb(255 255 255 / 0.22), 0 0 20px color-mix(in srgb, var(--accent) 14%, transparent);
    backdrop-filter: blur(12px);
    font: 600 13px/1 var(--font, inherit);
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease, margin 0.3s ease;
  }
  .booth-toggle::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: -150% 25%;
    background: linear-gradient(110deg, transparent 35%, rgb(255 255 255 / 0.34) 50%, transparent 65%);
    transform: rotate(8deg) translateX(-100%);
    transition: transform 0.7s ease;
  }
  .booth-toggle:hover::before,
  .booth-toggle.open::before { transform: rotate(8deg) translateX(120%); }
  .booth-toggle:hover,
  .booth-toggle.open {
    transform: translateY(3px);
    box-shadow: 0 15px 26px -13px #000, inset 0 1px 0 rgb(255 255 255 / 0.3), 0 0 28px color-mix(in srgb, var(--accent) 32%, transparent);
  }
  .booth-toggle.open { margin-bottom: -6px; }
  .booth-toggle-icon { color: var(--accent); font-size: 21px; line-height: 0.5; text-shadow: 0 0 10px var(--accent); }
  .booth-toggle-caret { transition: transform 0.25s ease; }
  .booth-toggle.open .booth-toggle-caret { transform: rotate(180deg); }
  .booth-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  @media (max-width: 720px) {
    .genre-picker { right: auto; left: 0; }
    .picker-group { grid-template-columns: 1fr; gap: 4px; }
    .picker-group .gl { padding-top: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .genre-picker { animation: none; }
    .booth-toggle, .booth-toggle::before, .booth-toggle-caret { transition: none; }
  }
</style>
