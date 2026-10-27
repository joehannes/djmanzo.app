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
  import { fold } from "./booth/booth.svelte";
  import { isOwn, parse, type Route } from "./router";
  import { ScrollTrigger } from "./motion";
  import SiteBar from "./SiteBar.svelte";
  import Trail from "./Trail.svelte";
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
  import Releases from "./pages/Releases.svelte";
  import Backstage from "./pages/Backstage.svelte";
  import Compare from "./pages/Compare.svelte";
  import Nights from "./pages/Nights.svelte";
  import People from "./pages/People.svelte";
  import Journey from "./pages/Journey.svelte";
  import Toast from "./Toast.svelte";
  import { flavourOf } from "../../shared/flavours";
  import { i18n } from "./i18n.svelte";
  import { describe, track, view } from "./insights";

  let route = $state<Route>(parse(location.pathname));
  let ready = $state(false);

  $effect(() => {
    const root = document.documentElement;
    const s = skin();
    const look = LOOKS[s.id];
    const vars = { ...cssVars(s), ...lookVars(look, s.tokens.accent, s.tokens.accent2) };
    // The visitor's own country, under the region's look: its colours as a rule under the bar and a faint light from the top.
    const flavour = flavourOf(region.country);
    const lit = flavour?.colours.find((c) => c.toUpperCase() !== "#FFFFFF" && c !== "#000000");
    if (flavour && lit) vars["--glow"] = `${vars["--glow"]}, radial-gradient(40% 30% at 50% 0%, ${lit}24, transparent 70%)`;
    root.style.setProperty("--flag", flavour ? `linear-gradient(90deg, ${flavour.colours.map((c, i, all) => `${c} ${(i / all.length) * 100}% ${((i + 1) / all.length) * 100}%`).join(", ")})` : "none");
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
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
    view(location.pathname);
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

  /** For Insights, what a press is called: by its `data-track`, or by what the control already says it is. */
  const NAMED: [string, (el: HTMLElement) => string][] = [
    ["[data-track]", (el) => el.dataset.track ?? ""],
    ["[data-download-kind]", (el) => `download:${el.dataset.downloadKind}`],
    ["[data-download-default]", (el) => `download:${el.dataset.downloadDefault || "menu"}`],
    ["[data-lang]", (el) => `language:${el.dataset.lang}`],
    ["[data-skin]", (el) => `look:${el.dataset.skin}`],
    ["[data-groove]", (el) => `deck:${el.dataset.groove}`],
    ["[data-stem]", (el) => `deck part:${el.dataset.stem}`],
    ["[data-choose]", (el) => `edition:${el.dataset.choose}`],
    ["[data-plan]", (el) => `plan:${el.dataset.plan}`],
    ["[data-trial]", () => "trial"],
    ["[data-night]", (el) => `night:${el.dataset.night}`],
  ];

  /** For Insights: a press on something named, a sign-in begun, a link to another site. */
  function noted(e: MouseEvent) {
    const el = e.target as HTMLElement;
    for (const [selector, name] of NAMED) {
      const hit = el.closest<HTMLElement>(selector);
      if (hit) return track("click", name(hit));
    }
    const a = el.closest("a");
    if (!a?.href) return;
    if (a.origin === location.origin && a.pathname.startsWith("/auth/start/")) track("click", `signin:${a.pathname.split("/")[3] ?? ""}`);
    else if (a.origin !== location.origin && /^https?:/.test(a.protocol)) track("click", `out:${a.hostname.replace(/^www\./, "")}`);
  }

  onMount(() => {
    describe(() => ({ lang: i18n.lang, look: region.skin }));
    view(location.pathname);
    document.addEventListener("click", noted, { capture: true });
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
    // The window minimised or another tab in front: the deck, the pads and the effects stop, not play on unseen.
    const hidden = () => document.visibilityState === "hidden" && fold();
    document.addEventListener("visibilitychange", hidden);
    addEventListener("pagehide", fold);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      removeEventListener("pagehide", fold);
      removeEventListener("popstate", popped);
      document.removeEventListener("click", intercept);
      document.removeEventListener("click", noted, { capture: true });
    };
  });
</script>

<SiteBar {route} />
<Trail {route} />

<main id="main" data-page={route.page} data-ready={ready ? "" : undefined}>
  <!-- A new language builds the page again: headings split into words for their entrance are whole again, in the new words. -->
  {#key i18n.lang}
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
  {:else if route.page === "releases"}
    <Releases />
  {:else if route.page === "compare"}
    <Compare />
  {:else if route.page === "nights"}
    <Nights />
  {:else if route.page === "people"}
    <People />
  {:else if route.page === "journey"}
    <Journey />
  {:else if route.page === "backstage"}
    <Backstage />
  {:else if route.page === "read"}
    <Read />
  {:else}
    <Home />
  {/if}
  {/key}
</main>

<Footer />
<Assistant {route} />
<Toast {route} />
