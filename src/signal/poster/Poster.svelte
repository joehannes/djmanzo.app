<!--
  The constellation of taste, shown, and the visitor's to keep: a download,
  or the device's own share sheet where there is one. Made here, from what
  this browser holds; nothing is uploaded to make it.
-->
<script lang="ts">
  import { NODES, lineage, resolveStyle } from "../../style/genome";
  import { signal } from "../state.svelte";
  import { senses } from "../sense/senses.svelte";
  import { drawPoster } from "./constellation";

  let canvas = $state<HTMLCanvasElement>();
  let url = $state<string | null>(null);
  let shared = $state<string | null>(null);
  const style = $derived(resolveStyle(signal.style));

  $effect(() => {
    if (!canvas) return;
    const input = {
      style,
      lineage: lineage(signal.style)
        .slice(1)
        .map((id) => NODES[id].name),
      visited: signal.visited,
      role: signal.role,
      city: senses.city,
      sky: senses.sky,
      date: new Date(),
    };
    // The style's typefaces first, so the poster is lettered in them.
    void document.fonts.ready.then(() => {
      if (!canvas) return;
      drawPoster(canvas, input);
      url = canvas.toDataURL("image/png");
    });
  });

  async function share() {
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((ok) => canvas!.toBlob(ok, "image/png"));
    if (!blob) return;
    const file = new File([blob], "djmanzo-constellation.png", { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: "My night on the Signal Path", text: "djmanzo — the Signal Path" });
      shared = "Shared.";
    } catch {
      shared = null;
    }
  }
  const canShare = typeof navigator !== "undefined" && "canShare" in navigator && navigator.canShare?.({ files: [new File([""], "x.png", { type: "image/png" })] });
</script>

<div class="poster" data-poster>
  <canvas bind:this={canvas} aria-label="Your constellation: the stages you walked through, as stars"></canvas>
  <div class="row">
    {#if url}<a class="keep" href={url} download="djmanzo-constellation.png">Keep it</a>{/if}
    {#if canShare}<button class="keep" onclick={share}>Share it</button>{/if}
    {#if shared}<span>{shared}</span>{/if}
  </div>
</div>

<style>
  .poster {
    display: grid;
    gap: 10px;
    justify-items: start;
  }
  canvas {
    width: min(100%, 22rem);
    height: auto;
    aspect-ratio: 1080 / 1350;
    border-radius: 4px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  }
  .row {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .keep {
    font: inherit;
    font-weight: 800;
    padding: 10px 18px;
    border: 0;
    border-radius: 6px;
    background: var(--accent);
    color: var(--night);
    text-decoration: none;
    cursor: pointer;
  }
</style>
