<!--
  Live stems, played: the deck's three parts drawn as three lanes on the GPU,
  each one switchable — the music and the picture both follow. The words
  are the facts'.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { shared, skin, region } from "../region.svelte";
  import { deck, setGenre, setStem, toggle } from "../sound.svelte";
  import { hasLoop } from "../loops";
  import { bankOfGenres } from "../skins";
  import { STEMS, type Stem } from "../wave/model";
  import Wave from "../wave/Wave.svelte";
  import FactList from "./FactList.svelte";
  import { i18n } from "../i18n.svelte";
  import { HOME } from "../i18n/home";

  const w = $derived(HOME[i18n.lang].stems);
  const genre = $derived(GENRE_BY_ID[deck.genre] ?? GENRE_BY_ID.house);
  const grooves = $derived(bankOfGenres(skin(), region.country));
  let genreMenu = $state(false);
  let genrePicker: HTMLElement;

  function chooseGenre(id: string) {
    setGenre(id);
    genreMenu = false;
  }

  onMount(() => {
    const close = (e: PointerEvent) => {
      if (genreMenu && genrePicker && !genrePicker.contains(e.target as Node)) genreMenu = false;
    };
    const escape = (e: KeyboardEvent) => e.key === "Escape" && (genreMenu = false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  });
</script>

<section class="section stems" id="stems" aria-labelledby="stems-title">
  <div class="bg" aria-hidden="true"><div class="img" data-parallax="0.25" style:background-image={`url(${shared("stems")})`}></div></div>
  <div class="wrap grid">
    <div>
      <p class="eyebrow" data-reveal>{w.eyebrow}</p>
      <h2 class="h2" id="stems-title" data-split>{w.title}</h2>
      <p class="lead" data-reveal>{w.lead}</p>
      <FactList ids={["stems", "outputs"]} />
    </div>
    <div class="panel card" data-reveal data-stems>
      <div class="panel-top">
        <div><span class="mono machine-label">STEM SEPARATION</span><b class="machine-readout">4 CHANNELS</b></div>
        <div class="stem-genre" bind:this={genrePicker}>
          <button class="genre-trigger" aria-haspopup="dialog" aria-expanded={genreMenu} onclick={() => (genreMenu = !genreMenu)} data-stem-genre-trigger>
            <span class="mono">{genre.emoji} {genre.name}</span><span aria-hidden="true">⌄</span>
          </button>
          {#if genreMenu}
            <div class="genre-picker" role="dialog" aria-label="Select a groove" data-stem-genre-picker>
              <div class="picker-head"><span class="mono">SELECT A GROOVE</span><button onclick={() => (genreMenu = false)} aria-label="Close genre selection">×</button></div>
              {#each (["local", "common", "special"] as const).filter((k) => grooves[k].length) as k (k)}
                <div class="picker-group">
                  <span class="mono">{k === "local" ? "FROM HERE" : k === "common" ? "EVERYWHERE" : "SPECIAL"}</span>
                  <div>{#each grooves[k] as id (id)}<button class="genre-chip" aria-pressed={deck.genre === id} onclick={() => chooseGenre(id)}>{GENRE_BY_ID[id].emoji} {GENRE_BY_ID[id].name}</button>{/each}</div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      <div class="lanes">
        <div class="labels">
          {#each STEMS as s, i (s)}
            <button class="lane-btn" aria-pressed={deck.on[s]} onclick={() => setStem(s, !deck.on[s])} style:--c={skin().stems[i]} data-stem={s}>
              <span class="dot"></span>{w.names[s]}
            </button>
          {/each}
        </div>
        <div class="canvas">
          <Wave mode="lanes" colours={skin().stems} span={4} playhead={0.35} label={w.wave} />
        </div>
      </div>
      <div class="foot">
        <button class="stem-play" class:playing={deck.playing} onclick={toggle} aria-label={deck.playing ? "Pause the deck" : w.play} data-stem-play>
          {#if deck.playing}
            <span class="pause-bars" aria-hidden="true"><i></i><i></i></span><span>PAUSE</span>
          {:else}
            <span class="play-triangle" aria-hidden="true"></span><span>PLAY</span>
          {/if}
        </button>
        <span class="mono dim small">{w.on.replace("{n}", String(STEMS.filter((s) => deck.on[s]).length))}</span>
      </div>
      {#if hasLoop(deck.genre)}<p class="credit dim small" data-credit>{w.credit}</p>{/if}
    </div>
  </div>
</section>

<style>
  .credit {
    margin: 10px 0 0;
    font-size: 12px;
  }
  .stems {
    overflow: hidden;
    isolation: isolate;
  }
  .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.28;
    mask-image: linear-gradient(90deg, transparent, black 60%);
  }
  .img {
    position: absolute;
    inset: -10% 0;
    background-size: cover;
    background-position: center;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: clamp(32px, 6vw, 80px);
    align-items: center;
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  .panel {
    position: relative;
    overflow: visible;
    padding: 16px;
    border-color: color-mix(in srgb, var(--accent) 25%, var(--line));
    background:
      radial-gradient(circle at 92% 5%, color-mix(in srgb, var(--accent) 17%, transparent), transparent 30%),
      repeating-linear-gradient(90deg, rgb(255 255 255 / 0.016) 0 1px, transparent 1px 3px),
      linear-gradient(145deg, color-mix(in srgb, var(--surface) 94%, #141419), color-mix(in srgb, var(--bg) 88%, #050507));
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12), 0 24px 44px -30px #000;
    backdrop-filter: blur(14px) saturate(1.2);
  }
  .panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    padding: 0 2px 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
  }
  .machine-label {
    display: block;
    color: var(--dim);
    font-size: 9px;
    letter-spacing: 0.15em;
  }
  .machine-readout {
    display: block;
    margin-top: 3px;
    color: color-mix(in srgb, var(--accent) 58%, #dffaff);
    font: 600 13px/1 var(--mono);
    letter-spacing: 0.08em;
    text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 38%, transparent);
  }
  .stem-genre { position: relative; }
  .genre-trigger {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 9px;
    border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--line));
    border-radius: 6px;
    background: linear-gradient(120deg, color-mix(in srgb, var(--accent) 18%, #121217), #111116);
    color: var(--text);
    font-size: 11px;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12), 0 4px 10px -7px #000;
  }
  .genre-trigger:hover,
  .genre-trigger[aria-expanded="true"] { border-color: var(--accent); color: var(--accent); }
  .genre-trigger:focus-visible,
  .picker-head button:focus-visible,
  .genre-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .genre-picker {
    position: absolute;
    z-index: 10;
    top: calc(100% + 9px);
    right: 0;
    width: min(420px, calc(100vw - 56px));
    display: grid;
    gap: 9px;
    padding: 11px;
    border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--line));
    border-radius: 11px;
    background: linear-gradient(145deg, #27272e, #101014);
    box-shadow: 0 20px 42px -15px #000, 0 0 25px color-mix(in srgb, var(--accent) 16%, transparent);
    animation: picker-in 0.18s ease-out both;
  }
  @keyframes picker-in { from { opacity: 0; transform: translateY(-5px) scale(0.98); } to { opacity: 1; transform: none; } }
  .picker-head { display: flex; align-items: center; justify-content: space-between; color: var(--accent); font-size: 9px; letter-spacing: 0.14em; }
  .picker-head button { width: 23px; height: 23px; padding: 0; border: 1px solid var(--line); border-radius: 50%; background: transparent; color: var(--text); font: 300 20px/1 sans-serif; cursor: pointer; }
  .picker-group { display: grid; grid-template-columns: 78px 1fr; gap: 7px; align-items: start; }
  .picker-group > span { padding-top: 6px; color: var(--dim); font-size: 9px; letter-spacing: 0.08em; }
  .picker-group > div { display: flex; flex-wrap: wrap; gap: 5px; }
  .genre-chip { padding: 5px 8px; border: 1px solid var(--line); border-radius: 999px; background: #202026; color: var(--text); font: 600 11px/1.2 var(--body); cursor: pointer; }
  .genre-chip:hover,
  .genre-chip[aria-pressed="true"] { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 19%, #202026); }
  .lanes {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 12px;
    height: 300px;
  }
  .labels {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    gap: 4px;
  }
  .lane-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: linear-gradient(180deg, color-mix(in srgb, var(--raised) 85%, #34343a), color-mix(in srgb, var(--raised) 92%, #17171b));
    color: var(--text);
    font: 600 13px var(--body);
    cursor: pointer;
    text-align: left;
    transition:
      opacity 0.2s,
      border-color 0.2s,
      transform 0.12s,
      box-shadow 0.2s;
  }
  .lane-btn[aria-pressed="false"] {
    opacity: 0.45;
  }
  .lane-btn[aria-pressed="true"] {
    border-color: color-mix(in srgb, var(--c) 60%, var(--line));
    box-shadow: inset 3px 0 var(--c), inset 0 0 18px color-mix(in srgb, var(--c) 10%, transparent);
  }
  .lane-btn:hover { transform: translateX(2px); }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 12px var(--c);
  }
  .lane-btn[aria-pressed="false"] .dot {
    box-shadow: none;
    background: transparent;
    border: 2px solid var(--c);
  }
  .canvas {
    border-radius: 8px;
    border: 1px solid rgb(255 255 255 / 0.07);
    background: linear-gradient(180deg, #06080c, #020305);
    box-shadow: inset 0 2px 12px #000, 0 0 0 3px rgb(0 0 0 / 0.18);
    overflow: hidden;
  }
  .foot {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 12px;
    min-height: 42px;
    padding-top: 2px;
  }
  .stem-play {
    --red: #ff3b4f;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 92px;
    min-height: 34px;
    padding: 0 13px;
    border: 1px solid color-mix(in srgb, var(--red) 75%, #fff);
    border-radius: 999px;
    background: linear-gradient(180deg, #ff5a66, #b8122d);
    color: #fff;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.38), 0 4px 0 #5b0716, 0 8px 16px -7px rgb(255 20 54 / 0.65);
    font: 800 10px/1 var(--mono);
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: transform 0.08s, filter 0.15s, box-shadow 0.15s;
  }
  .stem-play:hover { filter: brightness(1.1); }
  .stem-play:active { transform: translateY(3px); box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.25), 0 1px 0 #5b0716; }
  .stem-play.playing { background: linear-gradient(180deg, #ef2b45, #8f0b22); }
  .stem-play:focus-visible { outline: 2px solid #ff8390; outline-offset: 3px; }
  .play-triangle { width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 9px solid currentColor; }
  .pause-bars { display: flex; gap: 3px; }
  .pause-bars i { width: 3px; height: 12px; border-radius: 2px; background: currentColor; }
  .small {
    font-size: 12px;
  }
  @media (max-width: 520px) {
    .lanes {
      grid-template-columns: 96px 1fr;
      height: 240px;
    }
    .panel-top { align-items: flex-start; }
    .genre-picker { right: auto; left: 0; }
    .picker-group { grid-template-columns: 1fr; gap: 3px; }
    .picker-group > span { padding-top: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .genre-picker { animation: none; }
    .lane-btn, .stem-play { transition: none; }
  }
</style>
