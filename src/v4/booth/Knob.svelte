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
    onturn: (v: number) => void;
  }
  let { label, value, min = -1, hint = "", onturn }: Props = $props();

  const span = $derived(1 - min);
  /** −135° to +135°, as a real knob turns. */
  const angle = $derived(-135 + ((value - min) / span) * 270);
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
    onpointerdown={down}
    onpointermove={move}
    onpointerup={() => (start = null)}
    onpointercancel={() => (start = null)}
    ondblclick={() => onturn(min < 0 ? 0 : min)}
    onkeydown={key}
    data-knob={label}
  >
    <span class="cap"><span class="mark"></span></span>
  </button>
  <span class="label mono">{label}</span>
</div>

<style>
  .knob {
    display: grid;
    justify-items: center;
    gap: 4px;
  }
  .dial {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 0;
    padding: 4px;
    cursor: ns-resize;
    touch-action: none;
    background: conic-gradient(from -135deg, var(--accent) 0deg calc(var(--a) + 135deg), color-mix(in srgb, var(--text) 14%, transparent) calc(var(--a) + 135deg) 270deg, transparent 270deg);
  }
  .dial:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .cap {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--text) 22%, var(--raised)), var(--raised) 70%);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    transform: rotate(var(--a));
    position: relative;
  }
  .mark {
    position: absolute;
    left: 50%;
    top: 4px;
    width: 3px;
    height: 10px;
    margin-left: -1.5px;
    border-radius: 2px;
    background: var(--text);
  }
  .moved .mark {
    background: var(--accent);
  }
  .label {
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
  }
</style>
