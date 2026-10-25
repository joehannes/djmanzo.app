<!--
  A screenshot of the real application, large, with what is on it pointed
  out: numbered spots on the picture (`hotspots.ts`), a legend that names
  each one, and a press on the picture to see it full screen at its own
  size. A spot is a button: hovered, focused or pressed it says what it
  marks, and the legend lights the same number. Where a screen's subject is
  one panel (`FOCUS`), the picture opens on a close-up of it, enlarged, with
  its spots where they fall there, and the whole window a press away.
-->
<script lang="ts">
  import type { Shot } from "../../signal/shots";
  import { FOCUS, SPOTS, type Spot } from "../hotspots";
  import { i18n } from "../i18n.svelte";
  import { BITS } from "../i18n/bits";
  import { altOf, showsOf, spotOf } from "../i18n/screens";
  import { fill } from "../i18n/sections";

  let { shot, legend = true, label = "" }: { shot: Shot; legend?: boolean; label?: string } = $props();

  const spots = $derived<Spot[]>(SPOTS[shot.screen] ?? []);
  /** The spots' words, in the visitor's language. */
  const said = $derived(spots.map((s) => spotOf(s, i18n.lang)));
  const w = $derived(BITS[i18n.lang].shot);
  const alt = $derived(altOf(shot, i18n.lang));
  const shows = $derived(showsOf(shot, i18n.lang));
  let whole = $state(false);
  const region = $derived(FOCUS[shot.screen] ?? null);
  const focus = $derived(whole ? null : region);
  /** Where a spot falls in what is shown: the close-up's own percentages, or null when it is outside it. */
  const at = (s: Spot) => {
    if (!focus) return { x: s.x, y: s.y };
    const x = ((s.x - focus.x) / focus.w) * 100;
    const y = ((s.y - focus.y) / focus.h) * 100;
    return x >= 0 && x <= 100 && y >= 0 && y <= 100 ? { x, y } : null;
  };
  /** The close-up's own shape, from the picture's pixels. */
  const ratio = $derived(focus ? (focus.w * shot.width) / (focus.h * shot.height) : shot.width / shot.height);
  let lit = $state<number | null>(null);
  let dialog: HTMLDialogElement | undefined = $state();

  function zoom() {
    dialog?.showModal();
  }
</script>

<figure class="shot" data-shot-frame={shot.screen}>
  <div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span class="mono">djmanzo{label ? ` — ${label}` : ""}</span></div>
  <div class="pic" class:focused={!!focus} style:aspect-ratio={focus ? String(ratio) : null} style:width={focus ? `min(100%, calc(78vh * ${ratio}))` : null} data-focus={focus ? "close" : "whole"}>
    <button class="zoom" onclick={zoom} aria-label={fill(w.full, { alt })}>
      <img
        src={shot.src}
        {alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
        decoding="async"
        data-shot={shot.theme}
        style:width={focus ? `${(100 / focus.w) * 100}%` : null}
        style:left={focus ? `${(-focus.x / focus.w) * 100}%` : null}
        style:top={focus ? `${(-focus.y / focus.h) * 100}%` : null}
      />
    </button>
    {#each spots as s, i (i)}
      {@const p = at(s)}
      {#if p}
      <button
        class="spot"
        class:lit={lit === i}
        style:left={`${p.x}%`}
        style:top={`${p.y}%`}
        onmouseenter={() => (lit = i)}
        onmouseleave={() => (lit = null)}
        onfocus={() => (lit = i)}
        onblur={() => (lit = null)}
        onclick={() => (lit = lit === i ? null : i)}
        aria-label="{i + 1}: {said[i].title}"
        data-spot>{i + 1}</button
      >
      {#if lit === i}
        <span class="tip" role="tooltip" style:left={`${Math.min(Math.max(p.x, 14), 86)}%`} style:top={`${p.y}%`} class:below={p.y < 30}><b>{said[i].title}</b>{said[i].text}</span>
      {/if}
      {/if}
    {/each}
  </div>
  <figcaption class="mono">
    {shows} · {fill(w.theme, { theme: shot.theme })}{shot.skin ? `, ${fill(w.skin, { skin: shot.skin })}` : ""} ·
    {#if region}<button class="linkish" onclick={() => (whole = !whole)} aria-pressed={whole} data-whole>{whole ? w.closeUp : w.whole}</button> ·{/if}
    <button class="linkish" onclick={zoom}>{w.fullSize}</button>
  </figcaption>
</figure>

{#if legend && spots.length}
  <ol class="legend">
    {#each spots as s, i (i)}
      <li class:lit={lit === i} onmouseenter={() => (lit = i)} onmouseleave={() => (lit = null)}><span class="n mono">{i + 1}</span><span><b>{said[i].title}</b> {said[i].text}</span></li>
    {/each}
  </ol>
{/if}

<dialog bind:this={dialog} class="lightbox" aria-label={alt} onclick={(e) => e.target === dialog && dialog?.close()}>
  <div class="big">
    <img src={shot.src} {alt} width={shot.width} height={shot.height} />
    {#each spots as s, i (i)}
      <span class="spot static" style:left={`${s.x}%`} style:top={`${s.y}%`} title={said[i].title}>{i + 1}</span>
    {/each}
  </div>
  <div class="bar">
    <p class="mono">{shows} — {shot.theme}</p>
    <button class="btn ghost small" onclick={() => dialog?.close()}>{w.close}</button>
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
  .pic.focused {
    overflow: hidden;
    margin: 0 auto;
    background: var(--raised);
  }
  .pic.focused .zoom {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .pic.focused img {
    position: absolute;
    max-width: none;
    height: auto;
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
