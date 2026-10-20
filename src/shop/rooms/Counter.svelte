<!--
  The counter: Don Ramón asks one thing, and the band on the counter plays.
  Each musician is one part of the groove — a stem — so a visitor takes a
  song apart and puts it back together within a minute, and it always
  sounds right: every part is in time and in key.
-->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { gsap } from "gsap";
  import { GENRE_BY_ID, scaleNotes } from "../../lib/genres";
  import { Singer } from "../../lib/audio/engine";
  import { ANSWERS, recallVisitor, rememberVisitor, type Visitor } from "../rooms";
  import { engine, setGroove as put, sound, stopAll, take, type Part } from "../sound.svelte";

  let { line }: { line: string } = $props();

  interface Player {
    id: Part | "voice";
    name: string;
    plays: string;
  }
  const BAND: Player[] = [
    { id: "drums", name: "Bombo", plays: "drums" },
    { id: "perc", name: "Güiro", plays: "percussion" },
    { id: "bass", name: "Bajo", plays: "bass" },
    { id: "keys", name: "Teclita", plays: "chords" },
    { id: "voice", name: "Voz", plays: "the tune" },
  ];
  const GROOVES = ["house", "bachata", "merengue", "hiphop", "pop"];

  let visitor = $state<Visitor | null>(recallVisitor());
  const reply = $derived(ANSWERS.find((a) => a.id === visitor)?.reply ?? null);
  let groove = $state(ANSWERS.find((a) => a.id === recallVisitor())?.groove ?? "house");
  let on = $state<Record<Player["id"], boolean>>({ drums: false, perc: false, bass: false, keys: false, voice: false });
  const playing = $derived(sound.source === "band" ? BAND.filter((b) => on[b.id]).length : 0);
  const cards: Record<string, HTMLElement> = {};

  let singer: Singer | null = null;
  let unlisten: (() => void) | null = null;
  // Voz's tune, two bars long, in degrees of the groove's scale.
  const TUNE: [number, number, "a" | "e" | "o" | "u"][] = [
    [0, 4, "a"], [4, 2, "o"], [6, 3, "a"], [8, 4, "e"], [12, 2, "a"],
    [16, 5, "o"], [20, 4, "a"], [24, 2, "u"], [26, 1, "a"], [28, 0, "o"],
  ];

  function answer(v: Visitor) {
    visitor = v;
    rememberVisitor(v);
    const g = ANSWERS.find((a) => a.id === v)!.groove;
    setGroove(g);
  }

  function apply() {
    const e = engine();
    const d = e.decks[0];
    d.parts.drums = on.drums;
    d.parts.perc = on.perc;
    d.parts.bass = on.bass;
    d.parts.keys = on.keys;
  }

  function toggle(id: Player["id"]) {
    const e = take("band");
    const first = !e.decks[0].playing;
    if (first) for (const k of Object.keys(on) as Player["id"][]) on[k] = false;
    on[id] = !on[id];
    const d = e.decks[0];
    put(e, groove);
    apply();
    e.setCrossfader(0);
    if (!Object.values(on).some(Boolean)) {
      stopAll("band");
      return;
    }
    if (!d.playing) d.start();
    sound.genre = groove;
    listen();
  }

  function setGroove(id: string) {
    groove = id;
    if (sound.source === "band") {
      put(engine(), id);
      sound.genre = id;
    }
  }

  function everyone() {
    take("band");
    for (const b of BAND) on[b.id] = true;
    const e = engine();
    const d = e.decks[0];
    put(e, groove);
    apply();
    if (!d.playing) d.start();
    sound.genre = groove;
    listen();
  }

  function listen() {
    if (unlisten) return;
    const e = engine();
    unlisten = e.listen((deck, step, time, genre) => {
      if (deck !== 0 || sound.source !== "band") return;
      const delay = Math.max(0, time - e.ctx.currentTime);
      if (step % 4 === 0) {
        gsap.delayedCall(delay, () => {
          for (const b of BAND) if (on[b.id] && cards[b.id]) gsap.fromTo(cards[b.id], { scale: 1.06, y: -4 }, { scale: 1, y: 0, duration: 0.28, ease: "power2.out" });
        });
      }
      if (!on.voice) return;
      const bar = e.decks[0].bar % 2;
      const at = TUNE.find(([s]) => s === bar * 16 + (step % 16));
      if (!at) return;
      singer ??= new Singer(e);
      const scale = scaleNotes(genre.scale);
      const semis = scale[at[1] % 7] + e.decks[0].shift + e.transpose;
      singer.note(time, genre.root * 2 * Math.pow(2, semis / 12), (60 / e.tempo) * 0.9, at[2]);
    });
  }

  onDestroy(() => unlisten?.());
</script>

<div class="counter">
  <div class="ramon">
    <img src="/shop/art/ramon.webp" alt="Don Ramón behind the counter, smiling" width="384" height="384" loading="lazy" />
    <div class="board" data-ramon>
      <p class="line">{reply ?? line}</p>
      {#if !visitor}
        <div class="answers" role="group" aria-label="What brings you in">
          {#each ANSWERS as a (a.id)}
            <button onclick={() => answer(a.id)} data-answer={a.id}>{a.label}</button>
          {/each}
        </div>
      {:else}
        <button class="again" onclick={() => (visitor = null)}>Ask me again</button>
      {/if}
    </div>
  </div>

  <div class="stage" data-band>
    <h2>The band on the counter</h2>
    <p class="how">Each of them plays one part of the song. Wake them up one by one.</p>
    <div class="players">
      {#each BAND as b (b.id)}
        <button class="player" class:on={on[b.id] && sound.source === "band"} bind:this={cards[b.id]} onclick={() => toggle(b.id)} aria-pressed={on[b.id] && sound.source === "band"} data-player={b.id}>
          <img src={`/shop/art/band-${b.id}.webp`} alt="" width="384" height="384" loading="lazy" />
          <b>{b.name}</b>
          <span>{b.plays}</span>
        </button>
      {/each}
    </div>
    <div class="grooves" role="group" aria-label="What they play">
      {#each GROOVES as g (g)}
        {@const genre = GENRE_BY_ID[g]}
        <button class="sleeve" class:on={groove === g} style:--bg={genre.palette.bg} style:--fg={genre.palette.ink} style:--hi={genre.palette.primary} onclick={() => setGroove(g)} data-groove={g}>
          <span aria-hidden="true">{genre.emoji}</span>{genre.name}
        </button>
      {/each}
    </div>
    <p class="note" data-band-note>
      {#if playing >= 2}
        That is what stems are: a song taken apart without breaking it. djmanzo does this to any record you own, live, while it plays.
      {:else if playing === 1}
        One part on its own. Add another — it can't come out wrong; they all keep time and key.
      {:else}
        <button class="link" onclick={everyone}>Wake them all up</button>, or one at a time.
      {/if}
    </p>
  </div>
</div>

<style>
  .counter {
    display: grid;
    grid-template-columns: minmax(260px, 0.8fr) 1.4fr;
    gap: clamp(16px, 3vw, 40px);
    align-items: center;
    height: 100%;
  }
  @media (max-width: 860px) {
    .counter {
      grid-template-columns: 1fr;
      align-items: start;
    }
  }
  .ramon {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 14px;
    align-items: end;
  }
  .ramon img {
    width: 120px;
    height: 120px;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid var(--brass);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.4);
  }
  .board {
    background: var(--chalk);
    color: var(--chalk-ink);
    border: 6px solid var(--wood);
    border-radius: 6px;
    padding: 14px 16px;
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
  }
  .line {
    font-family: var(--hand);
    font-size: clamp(1.1rem, 1.6vw, 1.35rem);
    margin: 0 0 10px;
  }
  .answers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .answers button,
  .again {
    font: inherit;
    font-weight: 700;
    padding: 8px 14px;
    border-radius: 999px;
    border: 2px solid var(--chalk-ink);
    background: transparent;
    color: var(--chalk-ink);
    cursor: pointer;
  }
  .answers button:hover,
  .answers button:focus-visible {
    background: var(--chalk-ink);
    color: var(--chalk);
  }
  .again {
    font-size: 13px;
    border-width: 1px;
  }
  .stage {
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    color: var(--ink-dark);
    border-radius: 14px;
    padding: clamp(14px, 2vw, 24px);
    box-shadow: 0 18px 40px rgb(0 0 0 / 0.35);
  }
  h2 {
    font-family: var(--display);
    font-weight: 400;
    margin: 0;
    font-size: clamp(1.2rem, 2vw, 1.6rem);
  }
  .how {
    margin: 4px 0 14px;
  }
  .players {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }
  @media (max-width: 520px) {
    .players {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  .player {
    display: grid;
    justify-items: center;
    gap: 2px;
    padding: 8px 4px 10px;
    border-radius: 12px;
    border: 2px solid transparent;
    background: rgb(255 255 255 / 0.55);
    font: inherit;
    color: inherit;
    cursor: pointer;
    filter: grayscale(0.55) brightness(0.92);
    transition:
      filter 0.25s,
      border-color 0.25s,
      background 0.25s;
  }
  .player img {
    width: 100%;
    max-width: 120px;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 50%;
  }
  .player b {
    font-family: var(--display);
    font-weight: 400;
  }
  .player span {
    font-size: 12px;
    opacity: 0.75;
  }
  .player.on {
    filter: none;
    border-color: var(--mango);
    background: rgb(255 255 255 / 0.9);
  }
  .grooves {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .sleeve {
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 7px 12px;
    border-radius: 6px;
    border: 2px solid transparent;
    background: var(--bg);
    color: var(--fg);
    cursor: pointer;
  }
  .sleeve.on {
    border-color: var(--hi);
    box-shadow: 0 0 0 2px var(--paper) inset;
  }
  .note {
    margin: 14px 0 0;
    font-size: 14px;
  }
</style>
