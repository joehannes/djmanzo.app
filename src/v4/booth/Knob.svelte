<!--
  A rotary knob as on a mixer: drag up or down (or the arrow keys) to turn
  it, double-click to bring it back to the middle. A slider to assistive
  technology.
-->
<script lang="ts">
  interface Props {
    label: string;
    value: number;
    /** −1…+1 (a centred knob, such as an EQ or the filter) or 0…+1 (a send). */
    min?: number;
    hint?: string;
    /** How wide, in pixels. */
    size?: number;
    /** What is printed under it, if not its name ("HI", "COLOR FX"). */
    print?: string;
    /** What a test finds it by, if not its name. */
    data?: string;
    onturn: (v: number) => void;
  }
  let { label, value, min = -1, hint = "", size = 44, print, data, onturn }: Props = $props();

  const span = $derived(1 - min);
  /** −135° to +135°, as a real knob turns. */
  const angle = $derived(-135 + ((value - min) / span) * 270);
  /** The lit arc, in degrees from the far left: from the middle for a centred knob, from the left for a send. */
  const arc = $derived(min < 0 ? [Math.min(angle, 0) + 135, Math.max(angle, 0) + 135] : [0, angle + 135]);
  let start: { y: number; v: number } | null = null;

  function down(e: PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start = { y: e.clientY, v: value };
  }
  function move(e: PointerEvent) {
    if (!start) return;
    onturn(Math.max(min, Math.min(1, start.v + ((start.y - e.clientY) / 140) * span)));
  }
  function key(e: KeyboardEvent) {
    const step = e.shiftKey ? 0.2 : 0.05;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") onturn(Math.min(1, value + step));
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") onturn(Math.max(min, value - step));
    else if (e.key === "Home" || e.key === "0") onturn(min < 0 ? 0 : min);
    else return;
    e.preventDefault();
  }
</script>

<div class="knob">
  <button
    class="dial"
    class:moved={Math.abs(value - (min < 0 ? 0 : min)) > 0.02}
    role="slider"
    aria-label={label}
    aria-valuemin={min}
    aria-valuemax={1}
    aria-valuenow={Math.round(value * 100) / 100}
    title={hint}
    style:--a={`${angle}deg`}
    style:--a0={`${arc[0]}deg`}
    style:--a1={`${arc[1]}deg`}
    style:--size={`${size}px`}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={() => (start = null)}
    onpointercancel={() => (start = null)}
    ondblclick={() => onturn(min < 0 ? 0 : min)}
    onkeydown={key}
    data-knob={data ?? label}
  >
    <span class="cap"><span class="mark"></span></span>
  </button>
  <span class="label mono">{print ?? label}</span>
</div>

<style>
  .knob {
    display: grid;
    justify-items: center;
    gap: 5px;
  }
  /* The ring of light around it, lit from the middle for an EQ or the filter, from the left for a send. */
  .dial {
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    border: 0;
    padding: 5px;
    cursor: ns-resize;
    touch-action: none;
    background: conic-gradient(
      from -135deg,
      rgb(255 255 255 / 0.08) 0 var(--a0),
      var(--accent) var(--a0) var(--a1),
      rgb(255 255 255 / 0.08) var(--a1) 270deg,
      transparent 270deg
    );
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--accent) 35%, transparent));
  }
  .dial:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  /* The cap: knurled rubber with a white line, as on a mixer. */
  .cap {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 50%, #26262a 0 54%, transparent 55%),
      repeating-conic-gradient(from 0deg, #303034 0 5deg, #19191c 5deg 10deg);
    box-shadow:
      0 3px 7px rgb(0 0 0 / 0.7),
      inset 0 1px 0 rgb(255 255 255 / 0.15);
    transform: rotate(var(--a));
    position: relative;
  }
  .mark {
    position: absolute;
    left: 50%;
    top: 3px;
    width: 3px;
    height: 34%;
    margin-left: -1.5px;
    border-radius: 2px;
    background: #f2f2f2;
  }
  .moved .mark {
    background: var(--accent);
    box-shadow: 0 0 5px var(--accent);
  }
  .label {
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--hw-print, var(--dim));
    white-space: nowrap;
  }
</style>
