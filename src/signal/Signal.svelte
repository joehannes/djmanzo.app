<!--
  The Signal Path: the map, a stage, and the moves between them. The
  address bar keeps up (#/groove), so a link to a stage works, and the
  browser's back button returns to the map. The sends beside the stages
  (Outboard, Talkback, the site's own pages) have paths of their own
  (/outboard/<id>), which the Worker also renders for readers that run no
  script.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import World from "./World.svelte";
  import MapHud from "./MapHud.svelte";
  import StageScreen from "./StageScreen.svelte";
  import Corner from "./Corner.svelte";
  import Aux from "./auxiliary/Aux.svelte";
  import { auxPath, auxRoute, type AuxRoute } from "./auxiliary/routes";
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
  // The address last followed: a hash link fires both popstate and hashchange, and is followed once.
  let seen = "";
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

  /**
   * Where the Signal Path is served: /signal/ since the professional site took / (20 October). There,
   * its sends keep their place in the hash (`/signal/#/outboard/x`), since the paths are the new site's.
   */
  const BASE = location.pathname.startsWith("/signal") ? "/signal/" : "/";
  const sendAt = (route: AuxRoute, search = "") => (BASE === "/" ? auxPath(route) + search : `${BASE}${search}#${auxPath(route)}`);

  async function enter(id: StageId) {
    hovered = null;
    aux = null;
    stage = null;
    seen = "";
    history.replaceState(null, "", `${BASE}#/${id}`);
    // Without WebGL there is no painting to travel through, but every stage still opens.
    await engine?.enter(id);
    stage = id;
    signal.visit(id);
  }

  async function toMap() {
    const was = stage;
    seen = "";
    if (aux && !was) {
      aux = null;
      history.pushState(null, "", `${BASE}#/`);
      return;
    }
    aux = null;
    stage = null;
    history.replaceState(null, "", `${BASE}#/`);
    await engine?.leave();
    if (was) engine?.showOnMap(was);
  }

  function nextStage() {
    const s = stage ? STAGE_BY_ID[stage] : null;
    if (s?.next) void enter(s.next);
    else void toMap();
  }

  /** Where the address bar says to be: a send (by its path, or an older hash link), or a stage. */
  function follow() {
    const named = location.hash.match(/^#\/([a-z]+)/)?.[1];
    const route = auxRoute(location.hash) ?? (named && named in STAGE_BY_ID ? null : auxRoute(location.pathname));
    if (route) {
      // An older #/outboard link, or /talkback/: the page's own address.
      const at = sendAt(route, location.search);
      if (location.pathname + location.search + location.hash !== at) history.replaceState(null, "", at);
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
    // The browser's back button, a hash link, and `navigate` (aux/routes.ts).
    const changed = () => {
      if (location.href === seen) return;
      seen = location.href;
      if (!follow() && aux) aux = null;
      seen = location.href;
    };
    // A link to one of the sends' paths opens it here, without loading the page again.
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!a || !href?.startsWith("/") || href.startsWith("//") || a.target || a.hasAttribute("download")) return;
      const url = new URL(href, location.origin);
      const route = auxRoute(url.pathname);
      if (!route) return;
      e.preventDefault();
      history.pushState(null, "", sendAt(route, url.search));
      changed();
    };
    addEventListener("hashchange", changed);
    addEventListener("popstate", changed);
    document.addEventListener("click", click);
    // Wait a frame for the engine, then go where the address says — or start at Silence.
    requestAnimationFrame(() => {
      if (!follow() && !signal.visited.length) void enter("silence");
    });
    return () => {
      removeEventListener("hashchange", changed);
      removeEventListener("popstate", changed);
      document.removeEventListener("click", click);
    };
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
