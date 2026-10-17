<!--
  The Signal Path: the map, a stage, and the moves between them. The
  address bar keeps up (#/groove), so a link to a stage works, and the
  browser's back button returns to the map.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import World from "./World.svelte";
  import MapHud from "./MapHud.svelte";
  import StageScreen from "./StageScreen.svelte";
  import { STAGES, STAGE_BY_ID } from "../stages/script";
  import { resolveStyle } from "../style/genome";
  import type { StageId } from "../style/genome/types";
  import type { Engine } from "./world/engine";
  import { signal } from "./state.svelte";

  const ORDER = STAGES.map((s) => s.id);
  let engine = $state<Engine | null>(null);
  let stage = $state<StageId | null>(null);
  let hovered = $state<StageId | null>(null);
  const style = $derived(resolveStyle(signal.style));

  // The style's colours and type, for everything drawn in HTML over the canvas.
  $effect(() => {
    const p = style.palette;
    const root = document.documentElement.style;
    root.setProperty("--night", p.night);
    root.setProperty("--ink", p.ink);
    root.setProperty("--accent", p.accents[0]);
    root.setProperty("--glow", p.glow);
    root.setProperty("--display", `"${style.type.display}", "Bungee", system-ui, sans-serif`);
    root.setProperty("--text", `"${style.type.text}", "Figtree", system-ui, sans-serif`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", p.night);
    for (const family of [style.type.display, style.type.text]) {
      const id = `font-${family.replace(/\s+/g, "-")}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`;
      document.head.appendChild(link);
    }
  });

  async function enter(id: StageId) {
    hovered = null;
    stage = null;
    history.replaceState(null, "", `#/${id}`);
    // Without WebGL there is no painting to travel through, but every stage still opens.
    await engine?.enter(id);
    stage = id;
    signal.visit(id);
  }

  async function toMap() {
    const was = stage;
    stage = null;
    history.replaceState(null, "", "#/");
    await engine?.leave();
    if (was) engine?.showOnMap(was);
  }

  function nextStage() {
    const s = stage ? STAGE_BY_ID[stage] : null;
    if (s?.next) void enter(s.next);
    else void toMap();
  }

  onMount(() => {
    const id = location.hash.match(/^#\/([a-z]+)/)?.[1] as StageId | undefined;
    // Wait a frame for the engine, then go where the address says — or start at Silence.
    requestAnimationFrame(() => {
      if (id && STAGE_BY_ID[id]) void enter(id);
      else if (!signal.visited.length) void enter("silence");
    });
  });
</script>

<World order={ORDER} {style} bind:engine onpick={(s) => enter(s)} onhover={(s) => (hovered = s)} />

{#if stage}
  {#key stage}
    <StageScreen stage={STAGE_BY_ID[stage]} {style} onnext={nextStage} onmap={toMap} onplay={(k) => engine?.play(k)} />
  {/key}
{:else}
  <MapHud {hovered} {style} {engine} onenter={(s) => enter(s)} />
{/if}
