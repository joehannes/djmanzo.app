<!--
  A pack seen without opening it: a theme's own colours as a small window,
  a skin's tile drawn faintly over a panel as djmanzo draws it, a visuals
  pack's looks by name. The tile was checked to only draw before it was
  stored, and an <img> runs nothing in an SVG anyway.
-->
<script lang="ts">
  let { kind, preview, big = false }: { kind: string; preview: Record<string, any>; big?: boolean } = $props();
  const dark = $derived((preview.dark ?? {}) as Record<string, string>);
  const tileSrc = $derived(preview.tile ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(preview.tile)}` : null);
</script>

<div class="preview {kind}" class:big aria-hidden="true">
  {#if kind === "theme"}
    <div class="room" style:background={dark["--bg"]} style:color={dark["--text"]}>
      <div class="panel" style:background={dark["--panel"]} style:border-color={dark["--border-strong"]}>
        <span style:color={dark["--text"]}>Aa</span>
        <span style:color={dark["--text-dim"]}>dim</span>
        <b style:background={dark["--accent"]} style:color={dark["--on-accent"]}>PLAY</b>
        <i style:background={dark["--accent-2"]}></i>
        <i style:background={dark["--warn"]}></i>
        <i style:background={dark["--danger"]}></i>
      </div>
    </div>
  {:else if kind === "skin" && tileSrc}
    <div class="room skin" style:background-image={`url("${tileSrc}")`} style:background-size={preview.size ?? "120px"} style:opacity={1}></div>
  {:else}
    <div class="room visuals">
      {#each (preview.looks ?? []).slice(0, 4) as look, i (i)}<span>{look}</span>{/each}
    </div>
  {/if}
</div>

<style>
  .preview {
    border-radius: 6px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background: #111;
  }
  .room {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }
  .panel {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid;
    border-radius: 6px;
    font: 700 13px/1 system-ui, sans-serif;
  }
  .big .panel {
    font-size: 18px;
    padding: 18px 22px;
    gap: 14px;
  }
  .panel b {
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 11px;
  }
  .panel i {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }
  .skin {
    background-color: #eceae4;
    background-repeat: repeat;
  }
  .visuals {
    background: radial-gradient(circle at 30% 40%, #ff5d73 0, transparent 45%), radial-gradient(circle at 70% 60%, #5ef2d6 0, transparent 50%), #0b0b10;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-content: center;
    justify-content: center;
    padding: 10px;
  }
  .visuals span {
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font: 600 12px/1 system-ui, sans-serif;
    padding: 5px 8px;
    border-radius: 999px;
  }
</style>
