<!--
  The booth, opened under the home page's deck, laid out as the gear it
  stands for: a turntable (a record to scratch, a rim to nudge, a tonearm to
  lower and a pitch fader), a mixer (EQ, the filter, the stems' channel
  faders with their meters and kill buttons, a beat-effects unit) and a
  sampler's pads, with banks for the occasion, the region and the visitor's
  own voice. Everything the deck plays, live (`booth.svelte.ts`).
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { getEngine, hasEngine } from "../../lib/audio/engine";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { deck, setStem, setLevel, levels, stemLevels, beatClock, brake, rewind, roll, moves, speed, toggle, play as playDeck } from "../sound.svelte";
  import { STEMS, type Stem } from "../wave/model";
  import { region, skin } from "../region.svelte";
  import { i18n } from "../i18n.svelte";
  import { BOOTH } from "../i18n/booth";
  import { HOME } from "../i18n/home";
  import { bankOf, VOICE, type BankId } from "./sounds";
  import { booth, turn, centre, press, hush, buildAndDrop, record, play, fold, bend, effect, FX_KINDS, type FxKind } from "./booth.svelte";
  import Knob from "./Knob.svelte";
  import Fader from "./Fader.svelte";

  const w = $derived(BOOTH[i18n.lang]);
  const names = $derived(HOME[i18n.lang].stems.names);
  const BANKS: (BankId | "voice")[] = ["region", "everywhere", "wedding", "anniversary", "colmado", "usparty", "voice"];
  const pads = $derived(booth.bank === "voice" ? [VOICE] : bankOf(booth.bank, region.skin));
  const genre = $derived(GENRE_BY_ID[deck.genre]);
  /** As a mixer's display spells them, in every language. */
  const FX_NAME: Record<FxKind, string> = { echo: "ECHO", space: "SPACE", flanger: "FLANGER", crush: "CRUSH", gate: "TRANS" };
  /** The pads' lights, as a controller's: each its own colour. */
  const LED = ["#ff3d6e", "#ffb000", "#22d3ff", "#7cff4f", "#b26bff", "#ff6a1a", "#19ffb0", "#ff4fd8"];
  const SEGMENTS = 12;
  const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}`;
  const pitchText = $derived(`${signed(booth.knobs.pitch * 8)} %`);
  const tempoNow = $derived(deck.playing ? `${signed((speed.rate - 1) * 100)} %` : pitchText);

  let disc: HTMLElement;
  let platter: HTMLElement;
  let meters = $state<Record<Stem, number>>({ drums: 0, bass: 0, rest: 0 });
  let beat = $state(-1);
  let pulse = $state(0);
  let beatLength = $state(0.5);

  /** The rim of the jog, held: where it was last, when, and how fast it was turning (degrees a second). */
  let rim: { angle: number; at: number; speed: number } | null = null;
  let rimAt = 0;

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
      // A rim let rest stops nudging, as a jog wheel does.
      if (rim && now - rimAt > 90 && booth.bend !== 0) bend(0);
      if (deck.playing && hasEngine()) {
        // As a mixer's meters: up at once, down slowly, so a drum hit is seen between the hits.
        const heard = stemLevels();
        meters = { drums: Math.max(heard.drums, meters.drums - dt * 1.4), bass: Math.max(heard.bass, meters.bass - dt * 1.4), rest: Math.max(heard.rest, meters.rest - dt * 1.4) };
        const c = beatClock();
        const t = getEngine().ctx.currentTime;
        beat = c ? Math.floor((t - c.one) / c.beat) % 4 : -1;
        if (c) beatLength = c.beat;
        pulse = getEngine().levels().low;
      } else {
        beat = -1;
        pulse = 0;
        meters = { drums: 0, bass: 0, rest: 0 };
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

  // The record: drag it to scratch; turn its rim to nudge the tempo.
  let scratching: { x: number; y: number; at: number } | null = null;
  const angleAt = (e: PointerEvent) => {
    const r = platter.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  function grab(e: PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const r = platter.getBoundingClientRect();
    const out = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) / (r.width / 2);
    if (out > 0.8 && deck.playing) {
      rim = { angle: angleAt(e), at: performance.now(), speed: 0 };
      rimAt = rim.at;
    } else scratching = { x: e.clientX, y: e.clientY, at: 0 };
  }
  function drag(e: PointerEvent) {
    const now = performance.now();
    if (rim) {
      const a = angleAt(e);
      let d = a - rim.angle;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      const v = (d / Math.max(8, now - rim.at)) * 1000;
      rim = { angle: a, at: now, speed: rim.speed * 0.6 + v * 0.4 };
      rimAt = now;
      // A quarter turn in a quarter of a second is about +4 %, as a CDJ's jog.
      bend(rim.speed * 0.00011);
      return;
    }
    if (!scratching) return;
    const moved = Math.hypot(e.clientX - scratching.x, e.clientY - scratching.y);
    if (moved > 14 && now - scratching.at > 140) {
      void getEngine().wake();
      play("scratch");
      scratching = { x: e.clientX, y: e.clientY, at: now };
    }
  }
  function letGo() {
    scratching = null;
    if (rim) {
      rim = null;
      bend(0);
    }
  }

  const ensurePlaying = () => {
    if (!deck.playing) playDeck();
  };
  const nextFx = (step: number) => effect({ kind: FX_KINDS[(FX_KINDS.indexOf(booth.fx.kind) + step + FX_KINDS.length) % FX_KINDS.length] });
</script>

<section class="booth" data-booth style:--pulse={pulse} style:--beat={`${beatLength}s`} aria-label={w.open.replace(/^\S+\s/, "")}>
  <p class="lead small">{w.lead}</p>

  <div class="console">
    <!-- The turntable -->
    <div class="unit deckunit">
      <div class="tt">
        <div class="plinth">
          <button
            class="platter"
            bind:this={platter}
            onpointerdown={grab}
            onpointermove={drag}
            onpointerup={letGo}
            onpointercancel={letGo}
            aria-label={`${w.platter} · ${w.hw.jog}`}
            title={`${w.platter} · ${w.hw.jog}`}
            data-platter
          >
            <span class="disc" bind:this={disc}>
              <span class="rim"></span>
              <span class="vinyl"><span class="groove"></span><span class="label"><span class="emoji">{genre?.emoji ?? "🎵"}</span><span class="side mono">{genre?.name ?? ""}</span></span></span>
            </span>
            <span class="spindle"></span>
          </button>
          <span class="strobe" class:on={deck.playing} aria-hidden="true"></span>
          <button class="arm" class:down={deck.playing} onclick={toggle} aria-pressed={deck.playing} aria-label={w.hw.arm} title={w.hw.arm} data-arm>
            <svg viewBox="0 0 60 200" aria-hidden="true">
              <circle cx="40" cy="22" r="17" class="base" />
              <circle cx="40" cy="22" r="7" class="pivot" />
              <rect x="34" y="-6" width="12" height="16" rx="3" class="weight" />
              <path d="M40 22 L40 150 L22 178" class="tube" />
              <rect x="10" y="170" width="20" height="26" rx="3" transform="rotate(35 20 183)" class="shell" />
            </svg>
          </button>
          <div class="speedsel mono" aria-hidden="true"><span class:lit={deck.playing}>33</span><span>45</span></div>
        </div>
        <div class="pitch">
          <span class="print">{signed(8)}</span>
          <Fader label={w.knobs.pitch} min={-1} value={booth.knobs.pitch} length={176} rest={0} ticks={[0, 0.25, 0.5, 0.75, 1]} text={pitchText} hint={w.hw.pitch} onmove={(v) => turn("pitch", v)} data="pitch" />
          <span class="print">{signed(-8)}</span>
          <span class="lcd tiny" data-tempo>{tempoNow}</span>
        </div>
      </div>
      <div class="beats" aria-hidden="true">
        {#each [0, 1, 2, 3] as b (b)}<span class:on={beat === b} class:one={b === 0}></span>{/each}
      </div>
      <div class="moves" role="group">
        <button class="hw move" onclick={() => (deck.playing ? brake() : ensurePlaying())} disabled={deck.source !== "loop" && deck.playing} data-move="brake"><i class="led"></i>{w.moves.brake}</button>
        <button class="hw move" onclick={() => (deck.playing ? rewind() : ensurePlaying())} disabled={deck.source !== "loop" && deck.playing} data-move="rewind"><i class="led"></i>{w.moves.rewind}</button>
        <button class="hw move" class:held={moves.now === "roll"} onpointerdown={() => roll(true, 0.5)} onpointerup={() => roll(false)} onpointerleave={() => roll(false)} disabled={deck.source !== "loop"} title={w.hold} data-move="roll"><i class="led"></i>{w.moves.roll}</button>
        <button class="hw move" onclick={buildAndDrop} data-move="drop"><i class="led"></i>{w.moves.drop}</button>
      </div>
    </div>

    <!-- The mixer -->
    <div class="unit mixer">
      <div class="eq">
        <Knob label={w.knobs.high} print="HI" value={booth.knobs.high} hint={w.knobHint} onturn={(v) => turn("high", v)} />
        <Knob label={w.knobs.mid} print="MID" value={booth.knobs.mid} hint={w.knobHint} onturn={(v) => turn("mid", v)} />
        <Knob label={w.knobs.low} print="LOW" value={booth.knobs.low} hint={w.knobHint} onturn={(v) => turn("low", v)} />
        <Knob label={w.knobs.filter} print="FILTER" size={54} value={booth.knobs.filter} hint={w.knobHint} onturn={(v) => turn("filter", v)} />
      </div>
      <div class="channels" role="group" aria-label={w.stems}>
        {#each STEMS as s, i (s)}
          <div class="ch" style:--c={skin().stems[i]}>
            <button class="hw kill" aria-pressed={deck.on[s]} onclick={() => setStem(s, !deck.on[s])} title={names[s]} data-kill={s}><i class="led"></i>{names[s]}</button>
            <div class="meterfader">
              <span class="ladder" aria-hidden="true">
                {#each { length: SEGMENTS } as _, k (k)}<i class:lit={meters[s] * SEGMENTS * 1.25 > SEGMENTS - k} class:red={k === 0} class:amber={k > 0 && k < 3}></i>{/each}
              </span>
              <Fader label={names[s]} value={levels[s]} length={150} ticks={[0, 0.25, 0.5, 0.75, 1]} onmove={(v) => setLevel(s, v)} data={s} />
            </div>
          </div>
        {/each}
      </div>
      <div class="beatfx" role="group" aria-label={w.hw.fx}>
        <span class="print fxname">BEAT FX</span>
        <div class="lcd fxlcd">
          <button class="fxsel" onclick={() => nextFx(-1)} aria-label={`${w.hw.fx} ◀`} data-fx-prev>◀</button>
          <span data-fx-kind={booth.fx.kind}>{FX_NAME[booth.fx.kind]}</span>
          <span class="dim">{Math.round(booth.fx.depth * 100)}</span>
          <button class="fxsel" onclick={() => nextFx(1)} aria-label={`${w.hw.fx} ▶`} data-fx-next>▶</button>
        </div>
        <Knob label={`${w.hw.fx}: ${FX_NAME[booth.fx.kind]}`} print="LEVEL/DEPTH" min={0} value={booth.fx.depth} hint={w.knobHint} onturn={(v) => effect({ depth: v })} data="depth" />
        <button class="hw fxon" class:beat={booth.fx.on && beat >= 0} aria-pressed={booth.fx.on} onclick={() => effect({ on: !booth.fx.on })} title={w.hw.fxOn} aria-label={w.hw.fxOn} data-fx-on>ON</button>
      </div>
      <button class="hw small centre" onclick={centre}>{w.centre}</button>
    </div>

    <!-- The sampler -->
    <div class="unit sampler">
      <div class="tabs" role="tablist" aria-label={w.sampler}>
        {#each BANKS as b (b)}
          <button role="tab" class="hw tab" aria-selected={booth.bank === b} onclick={() => (booth.bank = b)} data-bank={b}><i class="led"></i>{b === "region" ? w.banks.region.replace("{region}", skin().name) : w.banks[b]}</button>
        {/each}
      </div>
      <div class="modes">
        {#each ["tap", "repeat", "loop"] as const as m (m)}
          <button class="hw mode" aria-pressed={booth.mode === m} onclick={() => (booth.mode = m)} data-mode={m}><i class="led"></i>{w.modes[m]}</button>
        {/each}
        {#if booth.mode === "repeat"}
          <span class="print">{w.every}</span>
          {#each [[0.25, "1/16"], [0.5, "1/8"], [1, "1/4"]] as const as [v, label] (v)}
            <button class="hw rate mono" aria-pressed={booth.every === v} onclick={() => (booth.every = v)}>{label}</button>
          {/each}
        {/if}
        {#if Object.keys(booth.going).length}<button class="hw stop" onclick={hush} data-hush>■ {w.hush}</button>{/if}
      </div>

      {#if booth.bank === "voice"}
        <div class="voice">
          <button class="rec" class:on={booth.voice.state === "recording"} onclick={record} data-record aria-label={booth.voice.state === "recording" ? w.voice.recording : w.voice.record}>
            <span class="dot"></span>
          </button>
          <span class="small">{booth.voice.state === "recording" ? w.voice.recording : w.voice.record}</span>
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
        {#each pads as id, i (id)}
          <button
            class="pad"
            style:--led={LED[i % LED.length]}
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
  </div>
</section>

<style>
  .booth {
    --hw-print: rgb(232 232 238 / 0.55);
    --hw-edge: rgb(255 255 255 / 0.07);
    --lcd: color-mix(in srgb, var(--accent) 45%, #c8f6ff);
    display: grid;
    gap: 12px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
  }
  .lead {
    margin: 0;
    color: var(--dim);
  }
  /* The console: three pieces of gear on one stand, lit a little by the bass. Gear is not mirrored for a language read right to left. */
  .console {
    direction: ltr;
    display: grid;
    grid-template-columns: minmax(300px, 1.05fr) minmax(290px, 0.95fr) minmax(300px, 1.1fr);
    gap: 10px;
    padding: 10px;
    border-radius: 18px;
    background: linear-gradient(180deg, #0d0d10, #070709);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.06),
      0 24px 60px -24px #000,
      0 0 calc(var(--pulse, 0) * 70px) calc(var(--pulse, 0) * -12px) color-mix(in srgb, var(--accent) 55%, transparent);
  }
  .unit {
    position: relative;
    display: grid;
    align-content: start;
    gap: 12px;
    padding: 16px 14px 14px;
    border-radius: 12px;
    border: 1px solid var(--hw-edge);
    /* Brushed metal, with its four screws. */
    background:
      radial-gradient(circle at 9px 9px, #3a3a40 0 2.5px, #111 3px, transparent 3.5px),
      radial-gradient(circle at calc(100% - 9px) 9px, #3a3a40 0 2.5px, #111 3px, transparent 3.5px),
      radial-gradient(circle at 9px calc(100% - 9px), #3a3a40 0 2.5px, #111 3px, transparent 3.5px),
      radial-gradient(circle at calc(100% - 9px) calc(100% - 9px), #3a3a40 0 2.5px, #111 3px, transparent 3.5px),
      repeating-linear-gradient(90deg, rgb(255 255 255 / 0.014) 0 1px, transparent 1px 3px),
      linear-gradient(180deg, #202025, #16161a);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.08),
      inset 0 -2px 0 rgb(0 0 0 / 0.5);
    color: #ececf1;
  }
  .print {
    font: 600 9.5px/1 var(--mono, monospace);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--hw-print);
  }
  .lcd {
    font-family: var(--mono, monospace);
    font-variant-numeric: tabular-nums;
    color: var(--lcd);
    text-shadow: 0 0 6px color-mix(in srgb, var(--lcd) 55%, transparent);
    background: linear-gradient(180deg, #06101a, #050a10);
    border-radius: 5px;
    box-shadow:
      inset 0 0 0 1px rgb(255 255 255 / 0.06),
      inset 0 2px 8px #000;
    padding: 4px 8px;
  }
  .tiny {
    font-size: 11px;
  }

  /* --- The turntable --- */
  .tt {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
  }
  .plinth {
    position: relative;
    justify-self: center;
    width: min(100%, 262px);
    padding: 6px 30px 6px 0;
  }
  .platter {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 0;
    padding: 0;
    background: radial-gradient(circle, #9a9aa2 0 48%, #5a5a62 49%, #2a2a30 70%);
    box-shadow:
      0 0 0 2px #0a0a0c,
      0 10px 24px rgb(0 0 0 / 0.7);
    cursor: grab;
    touch-action: none;
  }
  .platter:active {
    cursor: grabbing;
  }
  .disc {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: grid;
    place-items: center;
  }
  /* The platter's strobe dots, lit when the strobe is. */
  .rim {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: repeating-conic-gradient(from 0deg, #c8c8d0 0 2.2deg, #4a4a52 2.2deg 5deg);
    -webkit-mask: radial-gradient(circle, transparent 0 46%, #000 46.5% 49.5%, transparent 50%);
    mask: radial-gradient(circle, transparent 0 46%, #000 46.5% 49.5%, transparent 50%);
  }
  .vinyl {
    position: relative;
    width: 88%;
    aspect-ratio: 1;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle, transparent 0 30%, rgb(255 255 255 / 0.05) 30.5% 31%, transparent 31.5%),
      repeating-radial-gradient(circle, #0b0b0d 0 1.5px, #18181b 1.5px 2.6px);
    box-shadow:
      0 0 0 1px #000,
      inset 0 0 18px rgb(0 0 0 / 0.8);
  }
  .groove {
    position: absolute;
    inset: 4%;
    border-radius: 50%;
    background: conic-gradient(from 20deg, transparent 0 35deg, rgb(255 255 255 / 0.13) 48deg, transparent 62deg 210deg, rgb(255 255 255 / 0.09) 224deg, transparent 238deg);
  }
  .label {
    position: relative;
    width: 36%;
    aspect-ratio: 1;
    border-radius: 50%;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 1px;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 80%, #fff) 0 8%, var(--accent) 9% 100%);
    color: var(--on-accent, #000);
  }
  .emoji {
    font-size: clamp(16px, 2.2vw, 22px);
    line-height: 1;
  }
  .side {
    font-size: 7.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    max-width: 70px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .spindle {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #fff, #888 60%, #333);
  }
  .strobe {
    position: absolute;
    left: 4px;
    bottom: 10px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #2a1408;
    box-shadow: inset 0 1px 2px #000;
  }
  .strobe.on {
    background: #ff8a2a;
    box-shadow: 0 0 14px 4px rgb(255 138 42 / 0.55);
  }
  /* The tonearm: resting off the record, lowered onto it while the deck plays. */
  .arm {
    position: absolute;
    right: 0;
    top: 0;
    width: 52px;
    height: 74%;
    border: 0;
    padding: 0;
    background: none;
    cursor: pointer;
    transform-origin: 67% 11%;
    transform: rotate(-26deg);
    transition: transform 0.7s cubic-bezier(0.3, 0.7, 0.2, 1);
  }
  .arm.down {
    transform: rotate(4deg);
  }
  .arm svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    filter: drop-shadow(0 6px 6px rgb(0 0 0 / 0.6));
  }
  .arm .base {
    fill: #2c2c32;
    stroke: #55555d;
  }
  .arm .pivot {
    fill: #9a9aa4;
  }
  .arm .weight {
    fill: #44444c;
  }
  .arm .tube {
    fill: none;
    stroke: #c9c9d2;
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .arm .shell {
    fill: #1d1d22;
    stroke: #6a6a74;
  }
  .arm:focus-visible {
    outline: 2px solid var(--accent);
    border-radius: 8px;
  }
  .speedsel {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    gap: 4px;
    font-size: 9px;
  }
  .speedsel span {
    padding: 2px 5px;
    border-radius: 3px;
    background: #121215;
    color: var(--hw-print);
    box-shadow: inset 0 0 0 1px var(--hw-edge);
  }
  .speedsel .lit {
    color: #ff8a2a;
    text-shadow: 0 0 6px #ff8a2a;
  }
  .pitch {
    display: grid;
    justify-items: center;
    gap: 6px;
  }
  .beats {
    display: flex;
    gap: 6px;
    justify-content: center;
  }
  .beats span {
    width: 26px;
    height: 6px;
    border-radius: 2px;
    background: #25252a;
    transition: background 0.05s;
  }
  .beats span.on {
    background: var(--lcd);
    box-shadow: 0 0 10px var(--lcd);
  }
  .beats span.one.on {
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
  }

  /* --- Buttons of rubber, with their light --- */
  .hw {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font: 600 12px/1.2 var(--font, inherit);
    padding: 9px 12px;
    border-radius: 7px;
    border: 0;
    color: #e6e6ec;
    background: linear-gradient(180deg, #2c2c32, #1f1f24);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.1),
      0 2px 0 #050506,
      0 3px 6px rgb(0 0 0 / 0.45);
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
    transition:
      transform 0.06s,
      box-shadow 0.06s,
      background 0.15s;
  }
  .hw:active,
  .hw.held {
    transform: translateY(2px);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.06),
      0 0 0 #050506;
  }
  .hw:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .hw:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .led {
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3a2a22;
    box-shadow: inset 0 1px 1px #000;
  }
  .hw[aria-pressed="true"] .led,
  .hw[aria-selected="true"] .led,
  .hw.held .led,
  .move:active .led {
    background: var(--c, var(--accent));
    box-shadow: 0 0 8px var(--c, var(--accent));
  }
  .moves {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
  }
  .move {
    justify-content: center;
    padding: 10px 6px;
    font-size: 12px;
    text-align: center;
  }

  /* --- The mixer --- */
  .mixer {
    grid-template-columns: auto 1fr;
    grid-template-areas: "eq ch" "fx fx" "centre centre";
  }
  .eq {
    grid-area: eq;
    display: grid;
    gap: 10px;
    justify-items: center;
    padding-inline-end: 10px;
    border-inline-end: 1px solid var(--hw-edge);
  }
  .channels {
    grid-area: ch;
    display: flex;
    justify-content: space-around;
    gap: 8px;
  }
  .ch {
    display: grid;
    justify-items: center;
    align-content: start;
    gap: 10px;
  }
  /* The moves at the foot of the turntable, the pads at the foot of the sampler, as on the gear. */
  .deckunit,
  .sampler {
    display: flex;
    flex-direction: column;
  }
  .deckunit .moves,
  .sampler .pads {
    margin-top: auto;
  }
  .kill {
    white-space: nowrap;
    font-size: 10.5px;
    padding: 6px 8px;
    font-family: var(--mono, monospace);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .meterfader {
    display: flex;
    gap: 5px;
    align-items: stretch;
  }
  .ladder {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 6px 0;
  }
  .ladder i {
    width: 6px;
    height: 7px;
    border-radius: 1.5px;
    background: #1e2a1e;
  }
  .ladder i.amber {
    background: #2e2614;
  }
  .ladder i.red {
    background: #301616;
  }
  .ladder i.lit {
    background: #43ff6a;
    box-shadow: 0 0 6px #43ff6a;
  }
  .ladder i.lit.amber {
    background: #ffc531;
    box-shadow: 0 0 6px #ffc531;
  }
  .ladder i.lit.red {
    background: #ff3838;
    box-shadow: 0 0 6px #ff3838;
  }
  .beatfx {
    grid-area: fx;
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-template-areas: "name name name" "lcd depth on";
    gap: 8px 12px;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--hw-edge);
  }
  .fxname {
    grid-area: name;
  }
  .fxlcd {
    grid-area: lcd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-size: 13px;
    letter-spacing: 0.08em;
    min-width: 0;
  }
  .fxlcd .dim {
    opacity: 0.6;
  }
  .fxsel {
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    font-size: 10px;
    padding: 2px 4px;
  }
  .fxon {
    width: 46px;
    height: 46px;
    justify-content: center;
    border-radius: 50%;
    font-family: var(--mono, monospace);
    letter-spacing: 0.08em;
  }
  .fxon[aria-pressed="true"] {
    color: #111;
    background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--accent) 70%, #fff), var(--accent));
    box-shadow:
      0 0 16px color-mix(in srgb, var(--accent) 70%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 0.4);
  }
  .fxon.beat {
    animation: onbeat var(--beat) steps(2, jump-none) infinite;
  }
  @keyframes onbeat {
    50% {
      filter: brightness(1.5);
    }
  }
  .centre {
    grid-area: centre;
    justify-self: end;
    font-size: 11.5px;
    padding: 7px 10px;
  }

  /* --- The sampler --- */
  .tabs,
  .modes {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .tab {
    font-size: 11.5px;
    padding: 6px 9px;
  }
  .mode {
    font-size: 11.5px;
    padding: 7px 10px;
  }
  .rate {
    font-size: 11px;
    padding: 6px 8px;
  }
  .rate[aria-pressed="true"] {
    color: var(--accent);
  }
  .stop {
    margin-inline-start: auto;
    font-size: 11.5px;
    padding: 7px 10px;
    color: #ff7676;
  }
  .pads {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    background: #0b0b0d;
    box-shadow: inset 0 2px 8px #000;
  }
  /* A pad: rubber over a light of its own colour, brighter when hit, breathing on the beat while it goes round. */
  .pad {
    position: relative;
    aspect-ratio: 1.15;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 2px;
    padding: 6px;
    border-radius: 9px;
    border: 0;
    background: linear-gradient(180deg, #2a2a30, #1c1c21);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--led) 45%, transparent),
      inset 0 0 14px color-mix(in srgb, var(--led) 18%, transparent),
      0 3px 0 #050506;
    color: #f2f2f6;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.15;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    touch-action: manipulation;
    user-select: none;
    transition:
      transform 0.05s,
      box-shadow 0.12s;
  }
  .pad:active {
    transform: translateY(2px) scale(0.98);
    box-shadow:
      inset 0 0 0 1px var(--led),
      inset 0 0 26px color-mix(in srgb, var(--led) 60%, transparent),
      0 1px 0 #050506;
  }
  .pad.going {
    animation: breathe var(--beat) ease-in-out infinite alternate;
  }
  @keyframes breathe {
    from {
      box-shadow:
        inset 0 0 0 1px var(--led),
        inset 0 0 10px color-mix(in srgb, var(--led) 30%, transparent),
        0 3px 0 #050506;
    }
    to {
      box-shadow:
        inset 0 0 0 2px var(--led),
        inset 0 0 30px color-mix(in srgb, var(--led) 65%, transparent),
        0 0 16px color-mix(in srgb, var(--led) 45%, transparent),
        0 3px 0 #050506;
    }
  }
  .pad:disabled {
    opacity: 0.4;
  }
  .flash {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, var(--led), transparent 75%);
    opacity: 0;
  }
  .flash.on {
    animation: flash 0.35s ease-out;
  }
  @keyframes flash {
    from {
      opacity: 0.75;
    }
    to {
      opacity: 0;
    }
  }
  .name {
    position: relative;
    max-width: 100%;
    overflow-wrap: anywhere;
    hyphens: auto;
    text-shadow: 0 1px 2px #000;
  }
  .pad .tiny {
    font-size: 10px;
    color: var(--led);
    position: relative;
  }
  .voice {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
  }
  .rec {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 0;
    display: grid;
    place-items: center;
    background: linear-gradient(180deg, #2c2c32, #1c1c21);
    box-shadow:
      0 2px 0 #050506,
      inset 0 1px 0 rgb(255 255 255 / 0.1);
    cursor: pointer;
  }
  .rec .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #6a1a1a;
  }
  .rec.on .dot {
    background: #ff2b2b;
    box-shadow: 0 0 12px #ff2b2b;
    animation: rec 0.8s ease-in-out infinite alternate;
  }
  @keyframes rec {
    to {
      opacity: 0.45;
    }
  }
  .voicepads {
    grid-template-columns: minmax(110px, 200px);
  }
  .small {
    font-size: 13px;
  }
  .sampler .dim {
    color: var(--hw-print);
  }
  @media (max-width: 1180px) {
    .console {
      grid-template-columns: 1fr 1fr;
    }
    .sampler {
      grid-column: 1 / -1;
    }
    .pads {
      grid-template-columns: repeat(8, 1fr);
    }
  }
  @media (max-width: 760px) {
    .console {
      grid-template-columns: 1fr;
      padding: 6px;
    }
    .pads {
      grid-template-columns: repeat(4, 1fr);
    }
    .moves {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .flash.on,
    .rec.on .dot,
    .pad.going,
    .fxon.beat {
      animation: none;
    }
    .arm {
      transition: none;
    }
  }
</style>
