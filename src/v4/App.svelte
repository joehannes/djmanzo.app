<!--
  The site, version 4: djmanzo presented the way a DJ expects DJ software to
  be — a product, its prices, its marketplace and its community — dressed in
  the look of where the visitor plays, and with the music in it. The
  marketplace and forum are the working ones (Outboard and Talkback), in
  this look; the checkout is the shop's own.
-->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import "./v4.css";
  import { catalog } from "../lib/catalog.svelte";
  import { session } from "../lib/session.svelte";
  import { region, settle, skin, groove } from "./region.svelte";
  import { cssVars } from "./skins";
  import { setGenre } from "./sound.svelte";
  import { fromSitePath, parse, type Route } from "./router";
  import { ScrollTrigger } from "./motion";
  import SiteBar from "./SiteBar.svelte";
  import Footer from "./Footer.svelte";
  import Assistant from "./Assistant.svelte";
  import Home from "./pages/Home.svelte";
  import Pricing from "./pages/Pricing.svelte";
  import Market from "./pages/Market.svelte";
  import Community from "./pages/Community.svelte";

  /** Where this page is served while it is a preview; the forum's own links come back here. */
  const BASE = location.pathname.endsWith("/") ? location.pathname : `${location.pathname}/`;
  let route = $state<Route>(parse(location.hash));
  let ready = $state(false);

  $effect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(cssVars(skin()))) root.style.setProperty(k, v);
    root.dataset.skin = region.skin;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", skin().tokens.bg);
  });

  // The deck plays the skin's music: a new look brings its groove, in time if the deck is playing.
  // Only a change of skin does; a groove the visitor picked stays.
  let lastSkin: string | null = null;
  $effect(() => {
    const id = region.skin;
    const g = groove();
    if (id === lastSkin) return;
    lastSkin = id;
    untrack(() => setGenre(g));
  });

  function go(r: Route) {
    const changed = r.page !== route.page || r.rest.join("/") !== route.rest.join("/");
    route = r;
    if (changed && r.page !== "home") scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  /** The marketplace's and forum's own path links (`/outboard/…`, `/talkback/…`) stay on this page. */
  function intercept(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a");
    if (!a || a.target || a.hasAttribute("download") || a.origin !== location.origin) return;
    const h = fromSitePath(a.pathname + a.search);
    if (!h) return;
    e.preventDefault();
    location.hash = h;
  }

  /** The forum moves itself by pushing its own path (`navigate`); turn that into this page's address. */
  function popped() {
    if (location.pathname !== BASE) {
      const h = fromSitePath(location.pathname);
      if (h) {
        history.replaceState(null, "", BASE + h);
        go(parse(h));
        return;
      }
    }
    go(parse(location.hash));
  }

  onMount(() => {
    void session.refresh();
    catalog
      .load()
      .then(() => settle(catalog.data?.visitor.country ?? null))
      .catch(() => settle(null))
      .finally(() => (ready = true));
    const hash = () => go(parse(location.hash));
    addEventListener("hashchange", hash);
    addEventListener("popstate", popped);
    document.addEventListener("click", intercept);
    return () => {
      removeEventListener("hashchange", hash);
      removeEventListener("popstate", popped);
      document.removeEventListener("click", intercept);
    };
  });
</script>

<SiteBar {route} />

<main id="main" data-page={route.page} data-ready={ready ? "" : undefined}>
  {#if route.page === "pricing"}
    <Pricing />
  {:else if route.page === "market"}
    <Market rest={route.rest} />
  {:else if route.page === "community"}
    <Community rest={route.rest} />
  {:else}
    <Home />
  {/if}
</main>

<Footer />
<Assistant {route} />
