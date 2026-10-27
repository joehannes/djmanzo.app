<!--
  A fader as on a mixer or beside a turntable's platter: a ridged cap in a
  slot, dragged (or clicked to, or moved with the arrow keys), double-clicked
  back to where it rests. A slider to assistive technology.
-->
<script lang="ts">
  interface Props {
    label: string;
    value: number;
    /** 0…1 (a channel's level) or −1…+1 (a pitch fader, resting in the middle). */
    min?: number;
    /** Where a double-click or Home puts it. */
    rest?: number;
    /** How tall the slot is, in pixels. */
    length?: number;
    /** What it reads as, for assistive technology ("+2.4 %"). */
    text?: string;
    hint?: string;
    /** Marks along the slot, as fractions of its travel from the bottom. */
    ticks?: number[];
    onmove: (v: number) => void;
    data?: string;
  }
  let { label, value, min = 0, rest = min < 0 ? 0 : 1, length = 120, text, hint = "", ticks = [], onmove, data }: Props = $props();

  const span = $derived(1 - min);
  const at = $derived((value - min) / span);
  let slot: HTMLElement;
  let held = $state(false);

  function to(e: PointerEvent) {
    const r = slot.getBoundingClientRect();
    const k = 1 - (e.clientY - r.top - 9) / Math.max(1, r.height - 18);
    onmove(Math.round((min + Math.max(0, Math.min(1, k)) * span) * 100) / 100);
  }
  function down(e: PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    held = true;
    to(e);
  }
  function key(e: KeyboardEvent) {
    const step = (e.shiftKey ? 0.1 : 0.02) * span;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") onmove(Math.min(1, Math.round((value + step) * 100) / 100));
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") onmove(Math.max(min, Math.round((value - step) * 100) / 100));
    else if (e.key === "Home") onmove(rest);
    else return;
    e.preventDefault();
  }
</script>

<div
  class="fader"
  class:held
  role="slider"
  tabindex="0"
  aria-label={label}
  aria-orientation="vertical"
  aria-valuemin={min}
  aria-valuemax={1}
  aria-valuenow={Math.round(value * 100) / 100}
  aria-valuetext={text}
  title={hint}
  style:--len={`${length}px`}
  style:--at={at}
  bind:this={slot}
  onpointerdown={down}
  onpointermove={(e) => held && to(e)}
  onpointerup={() => (held = false)}
  onpointercancel={() => (held = false)}
  ondblclick={() => onmove(rest)}
  onkeydown={key}
  data-fader={data}
>
  {#each ticks as t (t)}<i class="tick" class:mid={t === 0.5} style:--t={t}></i>{/each}
  <span class="slot"></span>
  <span class="cap"><span class="line"></span></span>
</div>

<style>
  .fader {
    position: relative;
    width: 34px;
    height: var(--len);
    cursor: ns-resize;
    touch-action: none;
    border-radius: 6px;
    outline: none;
  }
  .fader:focus-visible {
    box-shadow: 0 0 0 2px var(--accent);
  }
  .slot {
    position: absolute;
    left: 50%;
    top: 6px;
    bottom: 6px;
    width: 4px;
    margin-left: -2px;
    border-radius: 2px;
    background: #050505;
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 0.06),
      inset 0 1px 2px #000;
  }
  .tick {
    position: absolute;
    left: 3px;
    right: 3px;
    bottom: calc(9px + var(--t) * (var(--len) - 18px));
    height: 1px;
    background: var(--hw-print, rgb(255 255 255 / 0.35));
    opacity: 0.55;
  }
  .tick.mid {
    left: 0;
    right: 0;
    height: 2px;
    opacity: 0.9;
  }
  /* The cap: a ridged block of rubber with its line, as a mixer's. */
  .cap {
    position: absolute;
    left: 1px;
    right: 1px;
    height: 18px;
    bottom: calc(var(--at) * (var(--len) - 18px));
    border-radius: 3px;
    background:
      repeating-linear-gradient(0deg, transparent 0 2px, rgb(255 255 255 / 0.07) 2px 3px),
      linear-gradient(180deg, #3a3a3e, #17171a);
    box-shadow:
      0 3px 6px rgb(0 0 0 / 0.6),
      inset 0 1px 0 rgb(255 255 255 / 0.18);
    transition: transform 0.08s;
  }
  .held .cap {
    transform: scale(1.05);
  }
  .line {
    position: absolute;
    left: 3px;
    right: 3px;
    top: 8px;
    height: 2px;
    border-radius: 1px;
    background: var(--c, var(--accent));
    box-shadow: 0 0 6px var(--c, var(--accent));
  }
</style>
