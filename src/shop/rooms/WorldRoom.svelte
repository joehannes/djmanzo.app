<!--
  The back room: the world as a record under a glass dome. The continents lie
  as on Gleason's flat map of 1892, the North Pole at the label, Antarctica as
  the ice round the rim; a small sun hangs inside the dome over the place
  where it is noon right now. Put the needle on a place and its music plays.
  Every place is also a plain button, for a keyboard, a screen reader, or a
  browser without WebGL.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { subsolar } from "../../signal/sense/sun";
  import { PLACES, PLACE_BY_GENRE, type Place } from "../world/places";
  import type { RecordEarth } from "../world/scene";
  import { playGroove, sound, stopAll, tempoOf } from "../sound.svelte";

  let { active }: { active: boolean } = $props();

  let canvas: HTMLCanvasElement;
  let earth: RecordEarth | null = null;
  let flat = $state(false);
  let playing = $state<Place | null>(null);
  let sea = $state(false);
  let hover = $state<{ place: Place; x: number; y: number } | null>(null);
  const sun = subsolar(new Date());
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const genre = $derived(playing ? GENRE_BY_ID[playing.genre] : null);

  function dropped(p: Place | null) {
    playing = p;
    sea = !p;
    if (p) playGroove(p.genre, "world");
    else stopAll("world");
  }

  function lifted() {
    playing = null;
    sea = false;
    stopAll("world");
  }

  /** Play a place: on the record if there is one, straight away if not. */
  function go(p: Place) {
    if (earth) earth.play(p);
    else dropped(p);
  }

  function lift() {
    if (earth) earth.stop();
    else lifted();
  }

  function asked(e: Event) {
    const p = PLACE_BY_GENRE[(e as CustomEvent<string>).detail];
    if (p) go(p);
  }

  onMount(() => {
    let disposed = false;
    addEventListener("shop:place", asked);
    // three.js is only loaded for this room, and only if the browser draws WebGL.
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) flat = true;
    else
      void import("../world/scene")
        .then(({ RecordEarth }) => {
          if (disposed) return;
          earth = new RecordEarth(
            canvas,
            {
              drop: dropped,
              lift: lifted,
              hover: (p, at) => (hover = p && at ? { place: p, x: at.x, y: at.y } : null),
            },
            { reducedMotion: reduced },
          );
          earth.setVisible(active);
        })
        .catch(() => (flat = true));
    return () => {
      disposed = true;
      removeEventListener("shop:place", asked);
      earth?.dispose();
    };
  });

  $effect(() => {
    // Read `active` first: behind `earth?.` it would not be read while earth is null, and the effect would never run again.
    const on = active;
    earth?.setVisible(on);
  });

  // Another room took the record player: lift the needle here, quietly.
  $effect(() => {
    if (sound.source !== "world" && playing) {
      playing = null;
      earth?.stop();
    }
  });

  const deg = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(0)}° ${v >= 0 ? pos : neg}`;
</script>

<div class="world">
  <div class="stage" class:flat>
    <canvas bind:this={canvas} aria-label="The world as a record under a glass dome, with a tonearm beside it" data-earth></canvas>
    {#if hover && !flat}
      <span class="tag" style:left={`${hover.x}px`} style:top={`${hover.y}px`} aria-hidden="true">{GENRE_BY_ID[hover.place.genre].name} · {hover.place.where}</span>
    {/if}
    {#if flat}
      <p class="flatnote">This browser draws no 3D, so the record stays in its sleeve. Every place still plays from the list.</p>
    {:else}
      <p class="how">Drag the record to turn it. Drag the arm onto a place, or tap a pin.</p>
    {/if}
  </div>

  <aside class="placard" aria-live="polite" data-placard>
    {#if playing && genre}
      <p class="now">Now playing, from {playing.where}</p>
      <h2><span aria-hidden="true">{genre.emoji}</span> {genre.name}</h2>
      <p class="roots">{genre.roots}</p>
      <dl>
        <dt>Tempo</dt>
        <dd>{tempoOf(genre.id)} beats a minute here; {genre.bpm[0]}–{genre.bpm[1]} in the wild</dd>
        <dt>{genre.dances[0].name}</dt>
        <dd>{genre.dances[0].how}</dd>
        <dt>The rooms</dt>
        <dd>{genre.rooms}</dd>
      </dl>
      <button class="lift" onclick={lift} data-lift>Lift the needle</button>
    {:else if sea}
      <h2>Open sea</h2>
      <p>Nothing pressed in this groove. Try a pin.</p>
    {:else}
      <h2>Where the music was born</h2>
      <p>Seventeen places on side A. The record turns them under the needle for you.</p>
    {/if}
    <ul class="places" aria-label="Places on the record">
      {#each PLACES as p (p.genre)}
        <li>
          <button class:on={playing?.genre === p.genre} style:--dot={GENRE_BY_ID[p.genre].palette.primary} onclick={() => go(p)} data-place={p.genre}>
            {GENRE_BY_ID[p.genre].name}<small>{p.where}</small>
          </button>
        </li>
      {/each}
    </ul>
    <p class="sun">
      The little sun stands where it is noon right now, over {deg(sun.lat, "N", "S")}, {deg(sun.lon, "E", "W")}: the lit half of the record is in daylight.
    </p>
  </aside>
</div>

<style>
  .world {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.75fr);
    gap: clamp(12px, 2vw, 28px);
    height: 100%;
    min-height: 0;
  }
  @media (max-width: 860px) {
    .world {
      grid-template-columns: 1fr;
      height: auto;
    }
  }
  .stage {
    position: relative;
    min-height: 340px;
  }
  @media (max-width: 860px) {
    .stage {
      height: 58vh;
    }
  }
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  .flat canvas {
    display: none;
  }
  .tag {
    position: absolute;
    transform: translate(-50%, -130%);
    pointer-events: none;
    white-space: nowrap;
    font-size: 13px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--paper);
    color: var(--ink-dark);
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.4);
  }
  .how,
  .flatnote {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    margin: 0;
    font-family: var(--hand);
    font-size: 1.2rem;
    text-align: center;
    width: max-content;
    max-width: 100%;
    text-shadow: 0 1px 8px rgb(0 0 0 / 0.8);
    pointer-events: none;
  }
  .flatnote {
    top: 40%;
    bottom: auto;
    max-width: 30ch;
    width: auto;
  }
  .placard {
    background: var(--paper);
    color: var(--ink-dark);
    border-radius: 6px;
    padding: clamp(14px, 2vw, 20px);
    box-shadow: 0 18px 40px rgb(0 0 0 / 0.45);
    overflow-y: auto;
    min-height: 0;
    align-self: start;
    max-height: 100%;
    box-sizing: border-box;
  }
  .now {
    margin: 0;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.7;
  }
  h2 {
    font-family: var(--display);
    font-weight: 400;
    margin: 2px 0 6px;
    font-size: clamp(1.2rem, 2vw, 1.6rem);
  }
  .roots {
    margin: 0 0 10px;
    font-style: italic;
  }
  dl {
    display: grid;
    gap: 2px;
    margin: 0;
    font-size: 14px;
  }
  dt {
    font-weight: 700;
    margin-top: 6px;
  }
  dd {
    margin: 0;
  }
  .lift {
    margin-top: 12px;
    font: inherit;
    font-weight: 800;
    padding: 8px 14px;
    border-radius: 999px;
    border: 2px solid var(--ink-dark);
    background: transparent;
    color: var(--ink-dark);
    cursor: pointer;
  }
  .places {
    list-style: none;
    padding: 0;
    margin: 14px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .places button {
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    display: inline-grid;
    text-align: left;
    padding: 5px 10px 5px 22px;
    border-radius: 6px;
    border: 1px solid rgb(42 26 14 / 0.25);
    background:
      radial-gradient(circle at 10px 50%, var(--dot) 0 4px, transparent 5px),
      rgb(255 255 255 / 0.5);
    color: var(--ink-dark);
    cursor: pointer;
  }
  .places small {
    font-weight: 400;
    font-size: 11px;
    opacity: 0.7;
  }
  .places button.on {
    border-color: var(--ink-dark);
    background:
      radial-gradient(circle at 10px 50%, var(--dot) 0 4px, transparent 5px),
      var(--mango);
  }
  .sun {
    font-size: 12px;
    opacity: 0.75;
    margin: 12px 0 0;
  }
</style>
