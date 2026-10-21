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
  import { LOOKS, fontHref, lookVars } from "./looks";
  import { setGenre } from "./sound.svelte";
  import { isOwn, parse, type Route } from "./router";
  import { ScrollTrigger } from "./motion";
  import SiteBar from "./SiteBar.svelte";
  import Footer from "./Footer.svelte";
  import Assistant from "./Assistant.svelte";
  import Home from "./pages/Home.svelte";
  import Pricing from "./pages/Pricing.svelte";
  import Market from "./pages/Market.svelte";
  import Community from "./pages/Community.svelte";
  import Read from "./pages/Read.svelte";
  import Account from "./pages/Account.svelte";
  import Wishes from "./pages/Wishes.svelte";
  import Features from "./pages/Features.svelte";
  import Toast from "./Toast.svelte";

  let route = $state<Route>(parse(location.pathname));
  let ready = $state(false);

  $effect(() => {
    const root = document.documentElement;
    const s = skin();
    const look = LOOKS[s.id];
    for (const [k, v] of Object.entries({ ...cssVars(s), ...lookVars(look, s.tokens.accent, s.tokens.accent2) })) root.style.setProperty(k, v);
    // The skin's display face, fetched only when it is worn.
    const href = fontHref(look);
    if (!document.querySelector(`link[data-face][href="${href}"]`)) {
      const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
      link.dataset.face = s.id;
      document.head.append(link);
    }
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

  /** A link to one of this page's own addresses (`/pricing`, `/outboard/…`, `/talkback/…`) is followed in place. */
  function intercept(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a");
    if (!a || a.target || a.hasAttribute("download") || a.origin !== location.origin) return;
    // A link within this page (`#main`) is the browser's to follow.
    if (a.hash && a.pathname === location.pathname && a.search === location.search) return;
    if (!isOwn(a.pathname)) return;
    e.preventDefault();
    history.pushState(null, "", a.pathname + a.search + a.hash);
    go(parse(location.pathname));
    // A section of another page (`/#tour`): once that page is shown.
    const id = a.hash.slice(1);
    if (id) requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()));
  }

  onMount(() => {
    // Back from a provider: what it said, read once and taken out of the address.
    session.readReturn();
    void session.refresh();
    catalog
      .load()
      .then(() => settle(catalog.data?.visitor.country ?? null))
      .catch(() => settle(null))
      .finally(() => (ready = true));
    // The back button, and the forum moving itself (`navigate`).
    const popped = () => go(parse(location.pathname));
    addEventListener("popstate", popped);
    document.addEventListener("click", intercept);
    return () => {
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
  {:else if route.page === "features"}
    <Features />
  {:else if route.page === "account"}
    <Account />
  {:else if route.page === "wishes"}
    <Wishes />
  {:else if route.page === "read"}
    <Read />
  {:else}
    <Home />
  {/if}
</main>

<Footer />
<Assistant {route} />
<Toast {route} />
