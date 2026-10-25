<!--
  Live stems, played: the deck's three parts drawn as three lanes on the GPU,
  each one switchable — the music and the picture both follow. The words
  are the facts'.
-->
<script lang="ts">
  import { shared, skin } from "../region.svelte";
  import { deck, play, setStem } from "../sound.svelte";
  import { hasLoop } from "../loops";
  import { STEMS, type Stem } from "../wave/model";
  import Wave from "../wave/Wave.svelte";
  import FactList from "./FactList.svelte";
  import { i18n } from "../i18n.svelte";
  import { HOME } from "../i18n/home";

  const w = $derived(HOME[i18n.lang].stems);
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
        {#if !deck.playing}
          <button class="btn primary small" onclick={() => play()}>{w.play}</button>
        {/if}
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
    padding: 16px;
    background: color-mix(in srgb, var(--surface) 85%, transparent);
    backdrop-filter: blur(10px);
  }
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
    background: var(--raised);
    color: var(--text);
    font: 600 13px var(--body);
    cursor: pointer;
    text-align: left;
    transition:
      opacity 0.2s,
      border-color 0.2s;
  }
  .lane-btn[aria-pressed="false"] {
    opacity: 0.45;
  }
  .lane-btn[aria-pressed="true"] {
    border-color: color-mix(in srgb, var(--c) 60%, var(--line));
  }
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
    background: var(--bg);
    overflow: hidden;
  }
  .foot {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 12px;
    min-height: 36px;
  }
  .small {
    font-size: 12px;
  }
  @media (max-width: 520px) {
    .lanes {
      grid-template-columns: 96px 1fr;
      height: 240px;
    }
  }
</style>
