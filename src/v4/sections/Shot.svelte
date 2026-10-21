<!--
  A screenshot of the real application, large, with what is on it pointed
  out: numbered spots on the picture (`hotspots.ts`), a legend that names
  each one, and a press on the picture to see it full screen at its own
  size. A spot is a button: hovered, focused or pressed it says what it
  marks, and the legend lights the same number.
-->
<script lang="ts">
  import type { Shot } from "../../signal/shots";
  import { SPOTS, type Spot } from "../hotspots";

  let { shot, legend = true, label = "" }: { shot: Shot; legend?: boolean; label?: string } = $props();

  const spots = $derived<Spot[]>(SPOTS[shot.screen] ?? []);
  let lit = $state<number | null>(null);
  let dialog: HTMLDialogElement | undefined = $state();

  function zoom() {
    dialog?.showModal();
  }
</script>

<figure class="shot" data-shot-frame={shot.screen}>
  <div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span class="mono">djmanzo{label ? ` — ${label}` : ""}</span></div>
  <div class="pic">
    <button class="zoom" onclick={zoom} aria-label="See it full screen: {shot.alt}">
      <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" data-shot={shot.theme} />
    </button>
    {#each spots as s, i (i)}
      <button
        class="spot"
        class:lit={lit === i}
        style:left={`${s.x}%`}
        style:top={`${s.y}%`}
        onmouseenter={() => (lit = i)}
        onmouseleave={() => (lit = null)}
        onfocus={() => (lit = i)}
        onblur={() => (lit = null)}
        onclick={() => (lit = lit === i ? null : i)}
        aria-label="{i + 1}: {s.title}"
        data-spot>{i + 1}</button
      >
      {#if lit === i}
        <span class="tip" role="tooltip" style:left={`${Math.min(Math.max(s.x, 14), 86)}%`} style:top={`${s.y}%`} class:below={s.y < 30}><b>{s.title}</b>{s.text}</span>
      {/if}
    {/each}
  </div>
  <figcaption class="mono">{shot.shows} · {shot.theme} theme{shot.skin ? `, ${shot.skin} skin` : ""} · <button class="linkish" onclick={zoom}>full size</button></figcaption>
</figure>

{#if legend && spots.length}
  <ol class="legend">
    {#each spots as s, i (i)}
      <li class:lit={lit === i} onmouseenter={() => (lit = i)} onmouseleave={() => (lit = null)}><span class="n mono">{i + 1}</span><span><b>{s.title}</b> {s.text}</span></li>
    {/each}
  </ol>
{/if}

<dialog bind:this={dialog} class="lightbox" aria-label={shot.alt} onclick={(e) => e.target === dialog && dialog?.close()}>
  <div class="big">
    <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} />
    {#each spots as s, i (i)}
      <span class="spot static" style:left={`${s.x}%`} style:top={`${s.y}%`} title={s.title}>{i + 1}</span>
    {/each}
  </div>
  <div class="bar">
    <p class="mono">{shot.shows} — {shot.theme}</p>
    <button class="btn ghost small" onclick={() => dialog?.close()}>Close</button>
  </div>
</dialog>

<style>
  .shot {
    margin: 0;
    border-radius: 14px;
    border: 1px solid var(--line);
    background: var(--surface);
    overflow: hidden;
    box-shadow:
      0 40px 90px -40px color-mix(in srgb, var(--accent) 45%, transparent),
      0 24px 60px -30px rgba(0, 0, 0, 0.8);
  }
  .chrome {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 12px;
    border-bottom: 1px solid var(--line);
  }
  .chrome i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--line);
  }
  .chrome span {
    margin-left: 8px;
    font-size: 12px;
    color: var(--dim);
  }
  .pic {
    position: relative;
  }
  .zoom {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
  }
  img {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    background: var(--raised);
  }
  .spot {
    position: absolute;
    translate: -50% -50%;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid var(--bg);
    background: var(--accent);
    color: var(--on-accent);
    font: 700 12px/1 var(--mono);
    cursor: pointer;
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 60%, transparent);
    animation: ping 2.8s ease-out infinite;
    z-index: 2;
  }
  .spot.lit {
    background: var(--text);
    color: var(--bg);
    animation: none;
  }
  .spot.static {
    animation: none;
    cursor: default;
  }
  @keyframes ping {
    0% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 55%, transparent);
    }
    70%,
    100% {
      box-shadow: 0 0 0 12px transparent;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spot {
      animation: none;
    }
  }
  .tip {
    position: absolute;
    z-index: 3;
    translate: -50% calc(-100% - 20px);
    width: min(300px, 70vw);
    padding: 10px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--bg) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--line));
    box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.7);
    font-size: 13px;
    line-height: 1.45;
    color: var(--dim);
    pointer-events: none;
    backdrop-filter: blur(8px);
  }
  .tip.below {
    translate: -50% 20px;
  }
  .tip b {
    display: block;
    color: var(--text);
    margin-bottom: 2px;
  }
  figcaption {
    padding: 10px 14px;
    font-size: 12px;
    color: var(--dim);
    border-top: 1px solid var(--line);
  }
  .linkish {
    background: none;
    border: 0;
    padding: 0;
    color: var(--accent);
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  .legend {
    list-style: none;
    padding: 0;
    margin: 18px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 10px 22px;
    counter-reset: none;
  }
  .legend li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    font-size: 14px;
    color: var(--dim);
    padding: 6px 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  .legend li.lit {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .legend b {
    color: var(--text);
  }
  .n {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    color: var(--accent);
    font-size: 11px;
    font-weight: 700;
  }
  .lightbox {
    width: min(1640px, 96vw);
    max-width: none;
    max-height: 96vh;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--bg);
    color: var(--text);
  }
  .lightbox::backdrop {
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(4px);
  }
  .big {
    position: relative;
  }
  .big img {
    aspect-ratio: auto;
  }
  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
  }
  .bar p {
    margin: 0;
    font-size: 12px;
    color: var(--dim);
  }
</style>
