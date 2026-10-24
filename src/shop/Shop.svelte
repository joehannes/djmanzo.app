<!--
  The record shop: one long shop walked sideways, room by room. Scrolling is
  the browser's own, snapping to each room, so a swipe, a trackpad, the arrow
  keys and a screen reader all work; nothing hijacks it. The rooms are the
  navigation too: dividers in a record crate along the bottom, the current
  one standing up. A plain bar along the top always leads straight to the
  ordinary pages: download, editions, market, forum, wishlist, sign in.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ROOMS, ROOM_BY_ID, type RoomId } from "./rooms";
  import { sound, stopAll } from "./sound.svelte";
  import Counter from "./rooms/Counter.svelte";
  import Crates from "./rooms/Crates.svelte";
  import WorldRoom from "./rooms/WorldRoom.svelte";
  import Practice from "./rooms/Practice.svelte";
  import Makers from "./rooms/Makers.svelte";
  import Cafe from "./rooms/Cafe.svelte";
  import Wishes from "./rooms/Wishes.svelte";
  import Window from "./rooms/Window.svelte";
  import Till from "./rooms/Till.svelte";

  let aisle: HTMLElement;
  let current = $state<RoomId>("counter");
  const seen = new Set<RoomId>();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dividers: Record<string, HTMLElement> = {};

  function go(id: RoomId, smooth = true) {
    const bay = document.getElementById(id);
    if (!bay) return;
    aisle.scrollTo({ left: bay.offsetLeft, behavior: smooth && !reduced ? "smooth" : "auto" });
  }

  /** Walk to a room by name from anywhere in the shop (a sleeve's "find it on the world"). */
  function walk(e: Event) {
    const id = (e as CustomEvent<RoomId>).detail;
    if (ROOM_BY_ID[id]) go(id);
  }

  function arrived(id: RoomId) {
    if (id === current && seen.has(id)) return;
    current = id;
    history.replaceState(null, "", `#${id}`);
    for (const r of ROOMS) gsap.to(dividers[r.id], { y: r.id === id ? -14 : 0, duration: reduced ? 0 : 0.35, ease: "back.out(2)" });
    if (seen.has(id) || reduced) return;
    seen.add(id);
    const bay = document.getElementById(id)!;
    gsap.from(bay.querySelectorAll("[data-enter]"), { y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", clearProps: "all" });
  }

  function keys(e: KeyboardEvent) {
    if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
    const i = ROOMS.findIndex((r) => r.id === current);
    if (e.key === "ArrowRight" && i < ROOMS.length - 1) go(ROOMS[i + 1].id);
    else if (e.key === "ArrowLeft" && i > 0) go(ROOMS[i - 1].id);
    else return;
    e.preventDefault();
  }

  onMount(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) arrived(en.target.id as RoomId);
      },
      { root: aisle, threshold: 0.6 },
    );
    for (const r of ROOMS) io.observe(document.getElementById(r.id)!);
    const start = location.hash.slice(1) as RoomId;
    if (ROOM_BY_ID[start]) requestAnimationFrame(() => go(start, false));
    addEventListener("shop:walk", walk);
    // A link to a room (`/shop/#cafe`) from inside the shop changes only the hash; follow it.
    const followHash = () => {
      const id = location.hash.slice(1) as RoomId;
      if (ROOM_BY_ID[id] && id !== current) go(id);
    };
    addEventListener("hashchange", followHash);
    return () => {
      io.disconnect();
      removeEventListener("shop:walk", walk);
      removeEventListener("hashchange", followHash);
    };
  });
</script>

<svelte:window onkeydown={keys} />

<header class="bar">
  <a class="logo" href="/shop/#counter"><b>djmanzo</b> <span>the record shop</span></a>
  <nav aria-label="Straight to">
    <a href="https://github.com/joehannes/djmanzo/releases/latest">Download</a>
    <a href="#till" onclick={(e) => (e.preventDefault(), go("till"))}>Editions</a>
    <a href="/outboard">Market</a>
    <a href="/talkback">Forum</a>
    <a href="/wishes">Wishlist</a>
    <a href="/account">Sign in</a>
  </nav>
  {#if sound.source}
    <button class="hush" onclick={() => stopAll()} data-hush>Hush</button>
  {/if}
</header>

<main class="aisle" bind:this={aisle} tabindex="-1">
  {#each ROOMS as r (r.id)}
    <section class="bay" id={r.id} aria-labelledby={`${r.id}-name`} style:--art={`url(/shop/art/${r.art}.webp)`} data-bay={r.id}>
      <div class="art" aria-hidden="true"></div>
      <div class="inner">
        <header class="sign" data-enter>
          <h1 id={`${r.id}-name`}>{r.name}</h1>
          {#if r.id !== "counter"}<p class="ramon"><span>Don Ramón:</span> “{r.line}”</p>{/if}
        </header>
        <div class="room" data-enter>
          {#if r.id === "counter"}
            <Counter line={r.line} />
          {:else if r.id === "crates"}
            <Crates />
          {:else if r.id === "world"}
            <WorldRoom active={current === "world"} />
          {:else if r.id === "practice"}
            <Practice />
          {:else if r.id === "makers"}
            <Makers />
          {:else if r.id === "cafe"}
            <Cafe />
          {:else if r.id === "wishes"}
            <Wishes />
          {:else if r.id === "window"}
            <Window />
          {:else}
            <Till />
          {/if}
        </div>
      </div>
    </section>
  {/each}
</main>

<nav class="dividers" aria-label="Rooms of the shop">
  {#each ROOMS as r, i (r.id)}
    <button bind:this={dividers[r.id]} class:up={current === r.id} aria-current={current === r.id ? "true" : undefined} onclick={() => go(r.id)} data-divider={r.id}>
      <b>{r.name}</b><small>{i + 1} · {r.verb}</small>
    </button>
  {/each}
</nav>

<style>
  :global(:root) {
    --walnut: #2a1a0e;
    --wood: #5a3a1e;
    --paper: #f6ecd8;
    --chalk: #23332c;
    --chalk-ink: #f1ead8;
    --ink: #f6ecd8;
    --ink-dark: #2a1a0e;
    --mango: #f2a93b;
    --teal: #1f6f78;
    --brass: #c9a050;
    --display: "Bungee", system-ui, sans-serif;
    --text: "Figtree", system-ui, sans-serif;
    --hand: "Caveat", "Figtree", cursive;
  }
  :global(html),
  :global(body) {
    margin: 0;
    height: 100%;
    background: var(--walnut);
    color: var(--ink);
    font-family: var(--text);
    overflow: hidden;
  }
  :global(a) {
    color: inherit;
  }
  :global(.link) {
    font: inherit;
    background: none;
    border: 0;
    padding: 0;
    color: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  .bar {
    position: fixed;
    inset: 0 0 auto 0;
    height: 48px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 16px;
    background: color-mix(in srgb, var(--walnut) 88%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgb(201 160 80 / 0.35);
  }
  .logo {
    text-decoration: none;
    white-space: nowrap;
  }
  .logo b {
    font-family: var(--display);
    font-weight: 400;
    letter-spacing: 0.03em;
  }
  .logo span {
    opacity: 0.75;
    font-size: 13px;
  }
  .bar nav {
    display: flex;
    gap: 14px;
    margin-left: auto;
    overflow-x: auto;
    scrollbar-width: none;
    font-size: 14px;
  }
  .bar nav a {
    text-decoration: none;
    white-space: nowrap;
    opacity: 0.88;
  }
  .bar nav a:hover {
    opacity: 1;
    text-decoration: underline;
  }
  @media (max-width: 640px) {
    .logo span {
      display: none;
    }
  }
  .hush {
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--mango);
    background: transparent;
    color: var(--mango);
    cursor: pointer;
  }
  .aisle {
    position: fixed;
    inset: 48px 0 72px 0;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    outline: none;
  }
  .aisle::-webkit-scrollbar {
    display: none;
  }
  .bay {
    position: relative;
    flex: 0 0 100%;
    height: 100%;
    scroll-snap-align: start;
    overflow: hidden;
  }
  .art {
    position: absolute;
    inset: 0;
    background: var(--art) center / cover no-repeat;
  }
  .art::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgb(20 12 6 / 0.55) 0%, rgb(20 12 6 / 0.15) 30%, rgb(20 12 6 / 0.35) 100%);
  }
  .inner {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    padding: clamp(12px, 2.5vw, 28px) clamp(16px, 4vw, 56px);
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 12px;
    overflow-y: auto;
  }
  .sign h1 {
    font-family: var(--display);
    font-weight: 400;
    font-size: clamp(1.6rem, 3.4vw, 2.6rem);
    margin: 0;
    text-shadow: 0 2px 16px rgb(0 0 0 / 0.6);
  }
  .ramon {
    margin: 4px 0 0;
    font-size: clamp(1rem, 1.4vw, 1.15rem);
    text-shadow: 0 1px 10px rgb(0 0 0 / 0.7);
    max-width: 52rem;
  }
  .ramon span {
    opacity: 0.75;
  }
  .room {
    min-height: 0;
  }
  .dividers {
    position: fixed;
    inset: auto 0 0 0;
    height: 72px;
    z-index: 5;
    display: flex;
    align-items: flex-end;
    gap: 4px;
    padding: 0 10px;
    overflow-x: auto;
    scrollbar-width: none;
    background: linear-gradient(180deg, #6b4524, #4a2c17 60%);
    box-shadow: 0 -6px 24px rgb(0 0 0 / 0.45);
  }
  .dividers button {
    flex: 1 0 auto;
    min-width: 84px;
    height: 52px;
    margin-bottom: -6px;
    display: grid;
    align-content: start;
    text-align: left;
    padding: 6px 10px;
    border: 0;
    border-radius: 8px 8px 0 0;
    background: linear-gradient(180deg, #f3e3c0, #dcc596);
    color: var(--ink-dark);
    font: inherit;
    cursor: pointer;
    box-shadow: 0 -2px 6px rgb(0 0 0 / 0.25);
  }
  .dividers button b {
    font-family: var(--display);
    font-weight: 400;
    font-size: 14px;
    white-space: nowrap;
  }
  .dividers button small {
    font-size: 11px;
    opacity: 0.7;
    white-space: nowrap;
  }
  .dividers button.up {
    background: linear-gradient(180deg, #ffd27a, var(--mango));
  }
  .dividers button:focus-visible {
    outline: 3px solid var(--teal);
    outline-offset: 2px;
  }
</style>
