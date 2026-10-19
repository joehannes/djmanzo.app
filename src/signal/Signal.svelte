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
  import Corner from "./Corner.svelte";
  import Aux from "./aux/Aux.svelte";
  import { auxRoute, type AuxRoute } from "./aux/routes";
  import { STAGES, STAGE_BY_ID } from "../stages/script";
  import { resolveStyle } from "../style/genome";
  import type { StageId } from "../style/genome/types";
  import type { Engine } from "./world/engine";
  import { signal } from "./state.svelte";
  import { senses } from "./sense/senses.svelte";

  const ORDER = STAGES.map((s) => s.id);
  let engine = $state<Engine | null>(null);
  let stage = $state<StageId | null>(null);
  let hovered = $state<StageId | null>(null);
  // A send beside the main line (Outboard, Talkback, the site's own pages), over the map.
  let aux = $state<AuxRoute | null>(null);
  const style = $derived(resolveStyle(signal.style));
  const night = $derived({ daylight: senses.daylight, sky: senses.sky });

  // A send's page hides the painting, so the painting rests while it is open.
  $effect(() => {
    engine?.cover(aux !== null);
  });

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
    aux = null;
    stage = null;
    history.replaceState(null, "", `#/${id}`);
    // Without WebGL there is no painting to travel through, but every stage still opens.
    await engine?.enter(id);
    stage = id;
    signal.visit(id);
  }

  async function toMap() {
    const was = stage;
    if (aux && !was) {
      aux = null;
      history.replaceState(null, "", "#/");
      return;
    }
    aux = null;
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

  /** Where the address bar says to be: a send, or a stage. */
  function follow() {
    const route = auxRoute(location.hash);
    if (route) {
      if (stage) void engine?.leave();
      stage = null;
      aux = route;
      return true;
    }
    const id = location.hash.match(/^#\/([a-z]+)/)?.[1] as StageId | undefined;
    if (id && STAGE_BY_ID[id] && id !== stage) {
      void enter(id);
      return true;
    }
    return false;
  }

  onMount(() => {
    // Links inside the sends (an item, a post, a community) and the browser's back button.
    const changed = () => {
      if (!follow() && aux) aux = null;
    };
    addEventListener("hashchange", changed);
    // Wait a frame for the engine, then go where the address says — or start at Silence.
    requestAnimationFrame(() => {
      if (!follow() && !signal.visited.length) void enter("silence");
    });
    return () => removeEventListener("hashchange", changed);
  });
</script>

<World order={ORDER} {style} {night} bind:engine onpick={(s) => enter(s)} onhover={(s) => (hovered = s)} />
<Corner {stage} ongo={(s) => enter(s)} />

{#if aux}
  <Aux route={aux} onmap={toMap} />
{:else if stage}
  {#key stage}
    <StageScreen stage={STAGE_BY_ID[stage]} {style} onnext={nextStage} onmap={toMap} ongo={(s) => enter(s)} onplay={(k) => engine?.play(k)} />
  {/key}
{:else}
  <MapHud {hovered} {style} {engine} onenter={(s) => enter(s)} />
{/if}
