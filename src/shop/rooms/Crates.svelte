<!--
  The crates: every kind of music the shop's engine can play, as a sleeve.
  Pull one out and its back cover says where it was born, how it is danced
  and how its DJs mix it; it plays, and it can take you to its place on the
  record-earth in the back room.
-->
<script lang="ts">
  import { gsap } from "gsap";
  import { GENRES, type Genre } from "../../lib/genres";
  import { PLACE_BY_GENRE } from "../world/places";
  import { playGroove, sound, stopAll } from "../sound.svelte";

  let picked = $state<Genre | null>(null);
  let back: HTMLElement | undefined = $state();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const playingThis = $derived(!!picked && sound.source === "crates" && sound.genre === picked.id);

  function pull(g: Genre, el: HTMLElement) {
    picked = g;
    if (!reduced) {
      gsap.fromTo(el, { y: -18 }, { y: 0, duration: 0.5, ease: "bounce.out" });
      requestAnimationFrame(() => back && gsap.fromTo(back, { rotateY: -80, opacity: 0 }, { rotateY: 0, opacity: 1, duration: 0.55, ease: "power3.out" }));
    }
  }

  function toggle() {
    if (!picked) return;
    if (playingThis) stopAll("crates");
    else playGroove(picked.id, "crates");
  }

  function travel() {
    if (!picked) return;
    dispatchEvent(new CustomEvent("shop:walk", { detail: "world" }));
    dispatchEvent(new CustomEvent("shop:place", { detail: picked.id }));
  }
</script>

<div class="crates">
  <div class="rack" role="group" aria-label="Sleeves">
    {#each GENRES as g (g.id)}
      <button
        class="sleeve"
        class:picked={picked?.id === g.id}
        style:--bg={g.palette.bg}
        style:--fg={g.palette.ink}
        style:--hi={g.palette.primary}
        style:--lo={g.palette.secondary}
        onclick={(e) => pull(g, e.currentTarget)}
        data-sleeve={g.id}
      >
        <span class="emoji" aria-hidden="true">{g.emoji}</span>
        <b>{g.name}</b>
        <small>{g.bpm[0]}–{g.bpm[1]} BPM</small>
      </button>
    {/each}
  </div>

  <article class="back" bind:this={back} aria-live="polite" data-back>
    {#if picked}
      <h2>{picked.name}</h2>
      <p class="roots">{picked.roots}</p>
      <dl>
        <dt>Tempo</dt>
        <dd>{picked.bpm[0]}–{picked.bpm[1]} beats a minute</dd>
        <dt>Danced as</dt>
        <dd>{picked.dances.map((d) => d.name).join(", ")}</dd>
        <dt>How it's mixed</dt>
        <dd>{picked.mixing}</dd>
      </dl>
      <div class="acts">
        <button class="go" onclick={toggle} data-play>{playingThis ? "Stop" : "Play it"}</button>
        {#if PLACE_BY_GENRE[picked.id]}
          <button class="quiet" onclick={travel} data-travel>Find it on the world</button>
        {/if}
      </div>
      <p class="fine">The shop plays a sketch of its groove, made on the spot. djmanzo plays your own records.</p>
    {:else}
      <p class="empty">Pull a sleeve out of the crate.</p>
    {/if}
  </article>
</div>

<style>
  .crates {
    display: grid;
    grid-template-columns: 1.3fr minmax(280px, 0.9fr);
    gap: clamp(14px, 3vw, 36px);
    align-items: start;
  }
  @media (max-width: 860px) {
    .crates {
      grid-template-columns: 1fr;
    }
  }
  .rack {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
    gap: 10px;
    perspective: 900px;
  }
  .sleeve {
    aspect-ratio: 1;
    display: grid;
    align-content: space-between;
    padding: 10px;
    border-radius: 4px;
    border: 0;
    text-align: left;
    font: inherit;
    color: var(--fg);
    background:
      radial-gradient(circle at 78% 22%, var(--hi) 0 18%, transparent 19%),
      radial-gradient(circle at 78% 22%, var(--lo) 0 30%, transparent 31%),
      linear-gradient(160deg, var(--bg), color-mix(in srgb, var(--bg) 70%, black));
    box-shadow:
      0 6px 14px rgb(0 0 0 / 0.45),
      inset 0 0 0 1px rgb(255 255 255 / 0.08);
    cursor: pointer;
    transform: rotateX(8deg);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }
  .sleeve:hover,
  .sleeve:focus-visible {
    transform: rotateX(0deg) translateY(-6px);
    box-shadow: 0 14px 24px rgb(0 0 0 / 0.5);
  }
  .sleeve.picked {
    outline: 3px solid var(--mango);
    outline-offset: 2px;
    transform: translateY(-8px);
  }
  .emoji {
    font-size: 28px;
  }
  .sleeve b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 15px;
    line-height: 1.1;
  }
  .sleeve small {
    font-size: 11px;
    opacity: 0.8;
  }
  .back {
    background: var(--paper);
    color: var(--ink-dark);
    border-radius: 6px;
    padding: clamp(14px, 2vw, 22px);
    box-shadow: 0 18px 40px rgb(0 0 0 / 0.45);
    transform-origin: left center;
    min-height: 220px;
  }
  .back h2 {
    font-family: var(--display);
    font-weight: 400;
    margin: 0 0 6px;
  }
  .roots {
    margin: 0 0 12px;
    font-style: italic;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 6px 14px;
    margin: 0;
    font-size: 15px;
  }
  dt {
    font-weight: 700;
  }
  dd {
    margin: 0;
  }
  .acts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .go,
  .quiet {
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
  .quiet {
    background: transparent;
    border: 2px solid var(--ink-dark);
    color: var(--ink-dark);
  }
  .fine {
    font-size: 12px;
    opacity: 0.7;
    margin: 12px 0 0;
  }
  .empty {
    font-family: var(--hand);
    font-size: 1.4rem;
    margin: 0;
  }
</style>
