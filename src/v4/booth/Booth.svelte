<!--
  The booth, opened under the home page's deck: a record to spin and
  scratch, beat lights, the stems' faders with their meters, EQ, filter,
  echo, space and pitch knobs, a DJ's moves (brake, rewind, roll, build &
  drop), and a sampler with sounds for the occasion, the region and the
  visitor's own voice — everything the deck plays, live (`booth.svelte.ts`).
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { getEngine, hasEngine } from "../../lib/audio/engine";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { deck, setStem, setLevel, levels, stemLevels, beatClock, brake, rewind, roll, moves, speed, play as playDeck } from "../sound.svelte";
  import { STEMS, type Stem } from "../wave/model";
  import { region, skin } from "../region.svelte";
  import { i18n } from "../i18n.svelte";
  import { BOOTH } from "../i18n/booth";
  import { HOME } from "../i18n/home";
  import { bankOf, VOICE, type BankId } from "./sounds";
  import { booth, turn, centre, press, hush, buildAndDrop, record, play, fold, type Knob as KnobId } from "./booth.svelte";
  import Knob from "./Knob.svelte";

  const w = $derived(BOOTH[i18n.lang]);
  const names = $derived(HOME[i18n.lang].stems.names);
  const KNOBS: KnobId[] = ["low", "mid", "high", "filter", "echo", "space", "pitch"];
  const BANKS: (BankId | "voice")[] = ["region", "everywhere", "wedding", "anniversary", "colmado", "usparty", "voice"];
  const pads = $derived(booth.bank === "voice" ? [VOICE] : bankOf(booth.bank, region.skin));
  const emoji = $derived(GENRE_BY_ID[deck.genre]?.emoji ?? "🎵");

  let disc: HTMLElement;
  let meters = $state<Record<Stem, number>>({ drums: 0, bass: 0, rest: 0 });
  let beat = $state(-1);
  let pulse = $state(0);

  onMount(() => {
    let angle = 0;
    let spin = 0;
    let last = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // 33⅓ turns a minute while it plays, with the pitch fader; a brake stops it, a rewind spins it back.
      const want = !deck.playing ? 0 : moves.now === "brake" ? 0 : moves.now === "rewind" ? -900 : 200 * speed.rate;
      spin += (want - spin) * Math.min(1, dt * (moves.now === "brake" ? 2.2 : 6));
      angle = (angle + spin * dt) % 360;
      if (disc) disc.style.transform = `rotate(${angle}deg)`;
      if (deck.playing && hasEngine()) {
        meters = stemLevels();
        const c = beatClock();
        const t = getEngine().ctx.currentTime;
        beat = c ? Math.floor((t - c.one) / c.beat) % 4 : -1;
        pulse = getEngine().levels().low;
      } else {
        beat = -1;
        pulse = 0;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    // Put away (closed, or the page left), the booth leaves nothing playing.
    return () => {
      cancelAnimationFrame(frame);
      fold();
    };
  });

  // The record: drag it to scratch.
  let scratching: { x: number; y: number; at: number } | null = null;
  function grab(e: PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    scratching = { x: e.clientX, y: e.clientY, at: 0 };
  }
  function drag(e: PointerEvent) {
    if (!scratching) return;
    const moved = Math.hypot(e.clientX - scratching.x, e.clientY - scratching.y);
    const now = performance.now();
    if (moved > 14 && now - scratching.at > 140) {
      void getEngine().wake();
      play("scratch");
      scratching = { x: e.clientX, y: e.clientY, at: now };
    }
  }

  const ensurePlaying = () => {
    if (!deck.playing) playDeck();
  };
</script>

<section class="booth" data-booth style:--pulse={pulse} aria-label={w.open.replace(/^\S+\s/, "")}>
  <p class="lead small">{w.lead}</p>

  <div class="top">
    <div class="turntable">
      <button class="platter" onpointerdown={grab} onpointermove={drag} onpointerup={() => (scratching = null)} onpointercancel={() => (scratching = null)} aria-label={w.platter} title={w.platter} data-platter>
        <span class="disc" bind:this={disc}><span class="groove"></span><span class="label">{emoji}</span></span>
      </button>
      <div class="beats" aria-hidden="true">
        {#each [0, 1, 2, 3] as b (b)}<span class:on={beat === b} class:one={b === 0}></span>{/each}
      </div>
    </div>

    <div class="faders" role="group" aria-label={w.stems}>
      {#each STEMS as s, i (s)}
        <div class="fader" style:--c={skin().stems[i]}>
          <div class="track">
            <span class="meter" style:height={`${Math.round(meters[s] * 100)}%`}></span>
            <input type="range" min="0" max="1" step="0.01" value={levels[s]} oninput={(e) => setLevel(s, Number((e.currentTarget as HTMLInputElement).value))} aria-label={names[s]} data-fader={s} />
          </div>
          <button class="mute" aria-pressed={deck.on[s]} onclick={() => setStem(s, !deck.on[s])} title={names[s]}>{names[s]}</button>
        </div>
      {/each}
    </div>

    <div class="knobs">
      {#each KNOBS as k (k)}
        <Knob label={w.knobs[k]} value={booth.knobs[k]} min={k === "echo" || k === "space" ? 0 : -1} hint={w.knobHint} onturn={(v) => turn(k, v)} />
      {/each}
      <button class="btn ghost small centre" onclick={centre}>{w.centre}</button>
    </div>
  </div>

  <div class="moves" role="group">
    <button class="move" onclick={() => (deck.playing ? brake() : ensurePlaying())} disabled={deck.source !== "loop" && deck.playing} data-move="brake">🛑 {w.moves.brake}</button>
    <button class="move" onclick={() => (deck.playing ? rewind() : ensurePlaying())} disabled={deck.source !== "loop" && deck.playing} data-move="rewind">⏪ {w.moves.rewind}</button>
    <button class="move" class:held={moves.now === "roll"} onpointerdown={() => roll(true, 0.5)} onpointerup={() => roll(false)} onpointerleave={() => roll(false)} disabled={deck.source !== "loop"} title={w.hold} data-move="roll">🔁 {w.moves.roll}</button>
    <button class="move" onclick={buildAndDrop} data-move="drop">🚀 {w.moves.drop}</button>
  </div>

  <div class="sampler">
    <div class="tabs" role="tablist" aria-label={w.sampler}>
      {#each BANKS as b (b)}
        <button role="tab" class="chip" aria-selected={booth.bank === b} onclick={() => (booth.bank = b)} data-bank={b}>{b === "region" ? w.banks.region.replace("{region}", skin().name) : w.banks[b]}</button>
      {/each}
    </div>
    <div class="modes">
      {#each ["tap", "repeat", "loop"] as const as m (m)}
        <button class="chip small" aria-pressed={booth.mode === m} onclick={() => (booth.mode = m)} data-mode={m}>{w.modes[m]}</button>
      {/each}
      {#if booth.mode === "repeat"}
        <span class="dim small">{w.every}</span>
        {#each [[0.25, "1/16"], [0.5, "1/8"], [1, "1/4"]] as const as [v, label] (v)}
          <button class="chip small" aria-pressed={booth.every === v} onclick={() => (booth.every = v)}>{label}</button>
        {/each}
      {/if}
      {#if Object.keys(booth.going).length}<button class="chip small stop" onclick={hush} data-hush>■ {w.hush}</button>{/if}
    </div>

    {#if booth.bank === "voice"}
      <div class="voice">
        <button class="btn {booth.voice.state === 'recording' ? 'primary rec' : 'ghost'}" onclick={record} data-record>
          {booth.voice.state === "recording" ? w.voice.recording : w.voice.record}
        </button>
        {#if booth.voice.state === "ready"}<span class="small" data-voice-ready>{w.voice.ready.replace("{seconds}", String(booth.voice.seconds))}</span>{/if}
        {#if booth.voice.state === "denied"}<span class="small notice">{w.voice.denied}</span>{/if}
        {#if booth.voice.state === "unsupported"}<span class="small notice">{w.voice.unsupported}</span>{/if}
        {#if booth.voice.state === "ready"}
          <Knob label={w.voice.pitch} value={booth.voice.pitch / 12} hint={w.knobHint} onturn={(v) => (booth.voice.pitch = Math.round(v * 12))} />
        {/if}
      </div>
      <p class="dim small">{w.voice.private}</p>
    {/if}

    <div class="pads" class:voicepads={booth.bank === "voice"}>
      {#each pads as id (id)}
        <button
          class="pad"
          class:going={!!booth.going[id]}
          class:hit={booth.hit.id === id}
          disabled={id === VOICE && booth.voice.state !== "ready"}
          onpointerdown={(e) => {
            e.preventDefault();
            press(id);
          }}
          onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), press(id))}
          data-pad={id}
          data-track={`pad:${id}`}
        >
          {#key booth.hit.at}<span class="flash" class:on={booth.hit.id === id}></span>{/key}
          <span class="name">{id === VOICE ? w.voice.pad : w.sounds[id]}</span>
          {#if booth.going[id]}<span class="mono tiny">{booth.going[id] === "loop" ? "⟳ 1" : `⟳ ${booth.every === 0.25 ? "1/16" : booth.every === 0.5 ? "1/8" : "1/4"}`}</span>{/if}
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .booth {
    display: grid;
    gap: 14px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    box-shadow: 0 0 calc(var(--pulse, 0) * 60px) calc(var(--pulse, 0) * -10px) color-mix(in srgb, var(--accent) 60%, transparent) inset;
  }
  .lead {
    margin: 0;
    color: var(--dim);
  }
  .top {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 18px;
    align-items: center;
  }
  .turntable {
    display: grid;
    gap: 8px;
    justify-items: center;
  }
  .platter {
    width: 108px;
    height: 108px;
    border-radius: 50%;
    border: 0;
    padding: 6px;
    background: color-mix(in srgb, var(--text) 10%, var(--raised));
    cursor: grab;
    touch-action: none;
  }
  .platter:active {
    cursor: grabbing;
  }
  .disc {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: repeating-radial-gradient(circle, #111 0 2px, #1c1c1c 2px 3px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
    position: relative;
  }
  .groove {
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, transparent 0 40deg, rgba(255, 255, 255, 0.12) 50deg, transparent 60deg 220deg, rgba(255, 255, 255, 0.08) 230deg, transparent 240deg);
  }
  .label {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--accent);
    font-size: 20px;
    z-index: 1;
  }
  .beats {
    display: flex;
    gap: 6px;
  }
  .beats span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--text) 15%, transparent);
    transition: background 0.05s;
  }
  .beats span.on {
    background: var(--accent2, var(--accent));
    box-shadow: 0 0 10px var(--accent2, var(--accent));
  }
  .beats span.one.on {
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
  }
  .faders {
    display: flex;
    gap: 12px;
  }
  .fader {
    display: grid;
    justify-items: center;
    gap: 6px;
  }
  .track {
    position: relative;
    width: 34px;
    height: 116px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: color-mix(in srgb, var(--text) 6%, transparent);
    overflow: hidden;
  }
  .meter {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, var(--c), color-mix(in srgb, var(--c) 30%, transparent));
    opacity: 0.45;
    transition: height 0.06s linear;
  }
  .track input {
    writing-mode: vertical-lr;
    direction: rtl;
    width: 26px;
    height: 104px;
    accent-color: var(--c);
    position: relative;
    cursor: ns-resize;
  }
  .mute {
    font: 600 11px/1.4 var(--mono, monospace);
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--c);
    background: transparent;
    color: var(--dim);
    cursor: pointer;
  }
  .mute[aria-pressed="true"] {
    background: color-mix(in srgb, var(--c) 30%, transparent);
    color: var(--text);
  }
  .knobs {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 14px;
    align-items: flex-end;
  }
  .centre {
    align-self: center;
  }
  .moves {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .move {
    font: inherit;
    font-weight: 600;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: var(--raised);
    color: var(--text);
    cursor: pointer;
    touch-action: none;
    user-select: none;
  }
  .move:active,
  .move.held {
    transform: translateY(1px);
    background: color-mix(in srgb, var(--accent) 25%, var(--raised));
  }
  .move:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .sampler {
    display: grid;
    gap: 10px;
  }
  .tabs,
  .modes {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .tabs .chip[aria-selected="true"] {
    background: var(--accent);
    color: var(--onAccent, #000);
    border-color: var(--accent);
  }
  .stop {
    border-color: var(--accent);
  }
  .pads {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .pad {
    position: relative;
    min-height: 58px;
    display: grid;
    place-items: center;
    gap: 2px;
    padding: 8px;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 10%, var(--raised)), var(--raised));
    color: var(--text);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    touch-action: manipulation;
    user-select: none;
  }
  .pad:active {
    transform: scale(0.97);
  }
  .pad.going {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent) inset;
  }
  .pad:disabled {
    opacity: 0.4;
  }
  .flash {
    position: absolute;
    inset: 0;
    background: var(--accent);
    opacity: 0;
  }
  .flash.on {
    animation: flash 0.35s ease-out;
  }
  @keyframes flash {
    from {
      opacity: 0.55;
    }
    to {
      opacity: 0;
    }
  }
  .name {
    position: relative;
  }
  .tiny {
    font-size: 10px;
    color: var(--dim);
    position: relative;
  }
  .voice {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .rec {
    animation: rec 1s ease-in-out infinite alternate;
  }
  @keyframes rec {
    to {
      filter: brightness(1.4);
    }
  }
  .voicepads {
    grid-template-columns: minmax(120px, 220px);
  }
  .small {
    font-size: 13px;
  }
  @media (max-width: 760px) {
    .top {
      grid-template-columns: auto 1fr;
    }
    .knobs {
      grid-column: 1 / -1;
    }
    .pads {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .flash.on,
    .rec {
      animation: none;
    }
  }
</style>
