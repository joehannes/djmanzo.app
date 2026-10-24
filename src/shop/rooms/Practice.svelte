<!--
  The practice room: the two things every DJ learns first, played, not read.
  Keys: a bachata on one deck and a dembow on the other; turn the second
  round the Camelot wheel and hear neighbours blend and strangers clash.
  Beats: two techno records a little apart; bring them together with the
  pitch fader and a nudge, by ear, and the meter only confirms it.
-->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { gsap } from "gsap";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { beatOffset, camelotSemis, matched, relation, shiftTo, type Relation } from "../practice";
  import { engine, sound, stopAll, take } from "../sound.svelte";

  const NOTES = ["A", "B♭", "B", "C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭"];
  const keyName = (n: number) => `${NOTES[camelotSemis(n)]} minor`;
  const A_KEY = 8;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Keys ---------------------------------------------------------------------------

  let keyB = $state(7);
  const rel = $derived<Relation>(relation(A_KEY, keyB));
  const keysOn = $derived(sound.source === "camelot");
  const SAY: Record<Relation, string> = {
    same: "The same key: every note of one is a note of the other. Safe, and a little plain.",
    neighbour: "Next door on the wheel: they share all but one note, so the blend sounds like one song.",
    clash: "Too far round the wheel: notes rub against each other. Hear it? Turn it back towards 8A.",
  };

  function playKeys() {
    if (keysOn) return stopAll("camelot");
    const e = take("camelot");
    const [a, b] = e.decks;
    e.sync = true;
    e.setTempo(125);
    a.setGenre("bachata");
    a.shift = shiftTo(GENRE_BY_ID.bachata.root, A_KEY);
    b.setGenre("dembow");
    b.shift = shiftTo(GENRE_BY_ID.dembow.root, keyB);
    // One set of drums is enough to hear the keys by.
    b.parts.drums = false;
    b.parts.perc = false;
    e.setCrossfader(0.5);
    a.start();
    b.start();
    sound.genre = "bachata";
  }

  function turn(n: number) {
    keyB = n;
    if (keysOn) engine().decks[1].shift = shiftTo(GENRE_BY_ID.dembow.root, n);
  }

  /** The wheel's segments, 12 o'clock first, clockwise. */
  const SEGMENTS = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const a0 = ((i - 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
    const [R, r] = [96, 58];
    const p = (rad: number, a: number) => `${(100 + rad * Math.cos(a)).toFixed(2)} ${(100 + rad * Math.sin(a)).toFixed(2)}`;
    const mid = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return {
      n,
      d: `M ${p(R, a0)} A ${R} ${R} 0 0 1 ${p(R, a1)} L ${p(r, a1)} A ${r} ${r} 0 0 0 ${p(r, a0)} Z`,
      x: 100 + 77 * Math.cos(mid),
      y: 100 + 77 * Math.sin(mid),
    };
  });

  // --- Beats --------------------------------------------------------------------------

  let pitchB = $state(0);
  let offset = $state(0);
  let together = $state(0);
  let won = $state(false);
  const beatsOn = $derived(sound.source === "beatmatch");
  let raf = 0;
  let unlisten: (() => void) | null = null;
  const lamps: HTMLElement[] = [];
  let medal: HTMLElement | undefined = $state();

  function playBeats() {
    if (beatsOn) return stopAll("beatmatch");
    const e = take("beatmatch");
    const [a, b] = e.decks;
    e.sync = false;
    a.setGenre("techno");
    b.setGenre("techno");
    a.pitch = 0;
    // Off by two to five per cent, either way, as two records are.
    const off = (2 + Math.random() * 3) * (Math.random() < 0.5 ? -1 : 1);
    pitchB = Math.round(off * 20) / 20;
    b.pitch = pitchB / 100;
    b.parts.perc = false;
    b.parts.keys = false;
    e.setCrossfader(0.5);
    a.start();
    b.start();
    b.nextTime += 0.08 + Math.random() * 0.12;
    sound.genre = "techno";
    won = false;
    together = 0;
    watch();
  }

  function setPitch(v: number) {
    pitchB = v;
    if (beatsOn) engine().decks[1].pitch = v / 100;
  }

  /** A touch on the platter's edge: the record comes a little earlier or later. */
  function nudge(by: number) {
    if (!beatsOn) return;
    engine().decks[1].nextTime += by;
  }

  function watch() {
    const e = engine();
    unlisten ??= e.listen((deck, step, time) => {
      if (sound.source !== "beatmatch" || step % 4 !== 0 || reduced) return;
      const lamp = lamps[deck];
      if (lamp) gsap.delayedCall(Math.max(0, time - e.ctx.currentTime), () => gsap.fromTo(lamp, { opacity: 1, scale: 1.25 }, { opacity: 0.25, scale: 1, duration: 0.22 }));
    });
    let last = performance.now();
    const tick = (now: number) => {
      raf = 0;
      if (sound.source !== "beatmatch") return;
      const [a, b] = e.decks;
      offset = beatOffset(a, b);
      if (matched(a.pitch, b.pitch, offset)) together += now - last;
      else together = 0;
      last = now;
      if (!won && together > 2000) {
        won = true;
        if (!reduced) requestAnimationFrame(() => medal && gsap.fromTo(medal, { scale: 0.6, rotate: -12, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: "back.out(2.4)" }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  const beatMs = $derived(Math.round(offset * 1000));
  const near = $derived(Math.abs(pitchB) < 0.25);

  onDestroy(() => {
    cancelAnimationFrame(raf);
    unlisten?.();
  });
</script>

<div class="practice">
  <section class="bench" aria-labelledby="keys-h" data-camelot>
    <h2 id="keys-h">Keys that agree</h2>
    <p>Deck A plays a bachata in <b>8A</b>, {keyName(A_KEY)}. Turn deck B, a dembow, round the wheel.</p>
    <div class="wheelrow">
      <svg viewBox="0 0 200 200" class="wheel" role="group" aria-label="The Camelot wheel, minor keys">
        {#each SEGMENTS as s (s.n)}
          {@const r = relation(A_KEY, s.n)}
          <path
            d={s.d}
            class="seg {r}"
            class:picked={keyB === s.n}
            role="button"
            tabindex="0"
            aria-label={`${s.n}A, ${keyName(s.n)}`}
            aria-pressed={keyB === s.n}
            onclick={() => turn(s.n)}
            onkeydown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), turn(s.n))}
            data-key={s.n}
          />
          <text x={s.x} y={s.y} class:a={s.n === A_KEY}>{s.n}A</text>
        {/each}
        <text x="100" y="96" class="centre">B: {keyB}A</text>
        <text x="100" y="114" class="centre small">{keyName(keyB)}</text>
      </svg>
      <div class="verdict {rel}" aria-live="polite" data-relation={rel}>
        <b>{rel === "clash" ? "Clash" : rel === "neighbour" ? "Blend" : "Same key"}</b>
        <p>{SAY[rel]}</p>
        <button class="go" onclick={playKeys} data-keys-play>{keysOn ? "Stop" : "Play both decks"}</button>
      </div>
    </div>
    <p class="fine">djmanzo reads every track's key onto this wheel and marks the ones that fit; its next-track suggestions weigh key with tempo, and say why.</p>
  </section>

  <section class="bench" aria-labelledby="beats-h" data-beatmatch>
    <h2 id="beats-h">Two beats as one</h2>
    <p>Two techno records, deck B a little fast or slow and a little late. Match its tempo with the pitch fader, then nudge it into step. Listen for one kick, not two.</p>
    <div class="lamps" aria-hidden="true">
      <span bind:this={lamps[0]}>A</span>
      <span bind:this={lamps[1]}>B</span>
    </div>
    <label class="fader">
      <span>Deck B pitch <b>{pitchB > 0 ? "+" : ""}{pitchB.toFixed(2)} %</b></span>
      <input type="range" min="-8" max="8" step="0.05" value={pitchB} disabled={!beatsOn} oninput={(e) => setPitch(Number(e.currentTarget.value))} data-pitch />
    </label>
    <div class="nudges">
      <button onclick={() => nudge(0.012)} disabled={!beatsOn} data-nudge="back">◀ Hold it back</button>
      <button onclick={() => nudge(-0.012)} disabled={!beatsOn} data-nudge="on">Push it on ▶</button>
    </div>
    <div class="meter" aria-live="off">
      <div class="track"><i style:left={`${50 + Math.max(-50, Math.min(50, beatMs / 4))}%`}></i></div>
      <small>{beatsOn ? (near ? `Tempo close. Beats ${beatMs === 0 ? "together" : `${Math.abs(beatMs)} ms ${beatMs > 0 ? "late" : "early"}`}.` : "Tempo apart: the beats drift.") : "Press play, then use your ears."}</small>
    </div>
    <div class="acts">
      <button class="go" onclick={playBeats} data-beats-play>{beatsOn ? "Stop" : "Play both records"}</button>
      {#if won}
        <span class="medal" bind:this={medal} data-matched>Matched. That is the whole trick.</span>
      {/if}
    </div>
    <p class="fine">djmanzo has sync for nights you want your hands free. Its Apprentice course checks beatmatching by ear from the two tempos, on a practice deck only your headphones hear, and there sync does not count.</p>
  </section>
</div>

<style>
  .practice {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(14px, 2.5vw, 32px);
    align-items: start;
  }
  @media (max-width: 960px) {
    .practice {
      grid-template-columns: 1fr;
    }
  }
  .bench {
    background: var(--chalk);
    color: var(--chalk-ink);
    border: 6px solid var(--wood);
    border-radius: 8px;
    padding: clamp(12px, 2vw, 20px);
    box-shadow: 0 16px 36px rgb(0 0 0 / 0.4);
  }
  h2 {
    font-family: var(--display);
    font-weight: 400;
    margin: 0 0 4px;
    font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  }
  .bench > p {
    margin: 0 0 10px;
  }
  .wheelrow {
    display: grid;
    grid-template-columns: minmax(180px, 230px) 1fr;
    gap: 14px;
    align-items: center;
  }
  @media (max-width: 520px) {
    .wheelrow {
      grid-template-columns: 1fr;
      justify-items: center;
    }
  }
  .wheel {
    width: 100%;
    max-width: 230px;
  }
  .seg {
    stroke: var(--chalk);
    stroke-width: 2;
    cursor: pointer;
    outline: none;
  }
  .seg.same,
  .seg.neighbour {
    fill: #4f9d69;
  }
  .seg.clash {
    fill: #8a4b4b;
  }
  .seg.picked {
    fill: var(--mango);
  }
  .seg:focus-visible {
    stroke: var(--chalk-ink);
    stroke-width: 3;
  }
  .wheel text {
    fill: var(--chalk-ink);
    font: 700 11px var(--text);
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
  }
  .wheel text.a {
    text-decoration: underline;
  }
  .wheel .centre {
    font: 400 15px var(--display);
  }
  .wheel .centre.small {
    font: 400 11px var(--text);
  }
  .verdict b {
    font-family: var(--hand);
    font-size: 1.8rem;
  }
  .verdict.clash b {
    color: #ff9a8a;
  }
  .verdict.neighbour b,
  .verdict.same b {
    color: #9be3ae;
  }
  .verdict p {
    margin: 2px 0 10px;
  }
  .go,
  .nudges button {
    font: inherit;
    font-weight: 800;
    padding: 9px 16px;
    border-radius: 999px;
    cursor: pointer;
  }
  .go {
    border: 0;
    background: var(--mango);
    color: var(--ink-dark);
  }
  .nudges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 10px 0;
  }
  .nudges button {
    background: transparent;
    color: var(--chalk-ink);
    border: 2px solid var(--chalk-ink);
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .lamps {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
  }
  .lamps span {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--mango);
    color: var(--ink-dark);
    font-weight: 800;
    opacity: 0.25;
  }
  .fader {
    display: grid;
    gap: 4px;
  }
  .fader input {
    width: 100%;
    accent-color: var(--mango);
  }
  .meter .track {
    position: relative;
    height: 10px;
    border-radius: 999px;
    background: linear-gradient(90deg, #8a4b4b, #4f9d69 46% 54%, #8a4b4b);
  }
  .meter i {
    position: absolute;
    top: -4px;
    width: 4px;
    height: 18px;
    margin-left: -2px;
    background: var(--chalk-ink);
    border-radius: 2px;
  }
  .meter small {
    display: block;
    margin-top: 6px;
  }
  .acts {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .medal {
    font-family: var(--hand);
    font-size: 1.5rem;
    color: #9be3ae;
  }
  .fine {
    font-size: 12px;
    opacity: 0.75;
    margin: 12px 0 0;
  }
</style>
