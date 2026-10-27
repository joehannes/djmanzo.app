<!--
  The trail under the bar, once the visitor has scrolled into a page: where
  they are (djmanzo › the page › the part of it they are reading), what
  comes next and a jump to it, how far down they are, and a map of the
  page's parts with what DJs ask first. Built from the page's own sections,
  so a page added later has its trail without being listed here.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { i18n, t } from "./i18n.svelte";
  import { JOURNEY, TRAIL_SECTIONS, ASKS, type Ask, type TrailSection } from "./i18n/journey";
  import { href, type PageId, type Route } from "./router";
  import { reduced } from "./motion";

  let { route }: { route: Route } = $props();
  const w = $derived(JOURNEY[i18n.lang]);

  /** A section's own name for the trail, by its id (or its heading's), where a short one is written. */
  const SHORT: Record<string, TrailSection> = { top: "top", "hl-title": "highlights", "road-ahead": "road", ...Object.fromEntries(TRAIL_SECTIONS.map((s) => [s, s])) };
  const ASK_TO: Record<Ask, string> = { controller: "/#hardware", library: "/features#library", price: "/pricing", free: "/pricing", stems: "/#stems", karaoke: "/#karaoke", journey: href("journey") };
  const NAMED: Partial<Record<PageId, () => string>> = {
    features: () => t("nav.features"),
    pricing: () => t("nav.pricing"),
    market: () => t("nav.market"),
    community: () => t("nav.community"),
    journey: () => w.nav,
  };

  type Part = { key: string; heading: string; el: HTMLElement };
  let parts = $state<Part[]>([]);
  let now = $state(-1);
  let progress = $state(0);
  let shown = $state(false);
  let open = $state(false);
  let pageName = $state("");

  const cut = (s: string) => {
    const one = s.replace(/\s+/g, " ").trim();
    return one.length > 34 ? `${one.slice(0, 32).trimEnd()}…` : one;
  };
  const label = (p: Part) => (SHORT[p.key] ? w.trail.sections[SHORT[p.key]] : p.heading);

  /** The page's parts: its sections with an id or a heading, big enough to be a place. */
  function collect() {
    const main = document.getElementById("main");
    if (!main) return;
    const found: Part[] = [];
    for (const el of main.querySelectorAll<HTMLElement>("section")) {
      if (el.closest("[aria-hidden=true]") || el.offsetHeight < 140 || el.parentElement?.closest("section")) continue;
      const by = el.getAttribute("aria-labelledby");
      const key = el.id || by || "";
      const h = (by && document.getElementById(by)) || el.querySelector("h1, h2, h3");
      const heading = cut(h?.textContent ?? "");
      if (key && (SHORT[key] || heading)) found.push({ key, heading, el });
    }
    parts = found;
    const h1 = main.querySelector("h1")?.textContent ?? "";
    pageName = route.page === "home" ? "" : (NAMED[route.page]?.() ?? cut(h1));
    measure();
  }

  function measure() {
    const line = innerHeight * 0.35;
    let at = -1;
    parts.forEach((p, i) => {
      if (p.el.getBoundingClientRect().top < line) at = i;
    });
    now = at;
    const room = document.documentElement.scrollHeight - innerHeight;
    progress = room > 0 ? Math.min(1, scrollY / room) : 0;
    shown = scrollY > 260 && parts.length >= 2;
    if (!shown) open = false;
  }

  function jump(p: Part) {
    open = false;
    p.el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  }

  onMount(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    // A page's sections come and go (a filter, a language's words arriving): read them again when the page changes.
    let again = 0;
    const watch = new MutationObserver(() => {
      clearTimeout(again);
      again = window.setTimeout(collect, 300);
    });
    const main = document.getElementById("main");
    if (main) watch.observe(main, { childList: true, subtree: true });
    const key = (e: KeyboardEvent) => e.key === "Escape" && (open = false);
    addEventListener("keydown", key);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("keydown", key);
      watch.disconnect();
      clearTimeout(again);
    };
  });

  // A new page, or a new language: the parts and their names again.
  $effect(() => {
    void route.page;
    void route.rest;
    void i18n.lang;
    const id = window.setTimeout(collect, 350);
    return () => clearTimeout(id);
  });

  const current = $derived(now >= 0 ? parts[now] : null);
  const next = $derived(parts[now + 1] ?? null);
</script>

{#if route.page !== "backstage"}
  <nav class="trail" class:shown aria-label={w.trail.where} aria-hidden={!shown} inert={!shown} data-trail>
    <div class="wrap row">
      <ol class="crumbs">
        <li><a href={href("home")}>djmanzo</a></li>
        {#if pageName}<li><a href={href(route.page)}>{pageName}</a></li>{/if}
        {#if current}
          <li class="here">
            <button class="at" aria-expanded={open} aria-current="location" onclick={() => (open = !open)} data-trail-here>
              {label(current)} <span class="caret" aria-hidden="true">▾</span>
            </button>
          </li>
        {/if}
      </ol>
      <span class="grow"></span>
      {#if next}
        <button class="next" onclick={() => jump(next)} data-trail-next={next.key}>
          <span class="dim">{w.trail.next}</span> <b>{label(next)}</b> <span class="arrow" aria-hidden="true">↓</span>
        </button>
      {/if}
      <button class="mapbtn" aria-expanded={open} onclick={() => (open = !open)} aria-label={w.trail.map} title={w.trail.map} data-trail-map>
        <span class="dots" aria-hidden="true">{#each parts as _, i (i)}<i class:passed={i < now} class:now={i === now}></i>{/each}</span>
      </button>
    </div>
    <span class="progress" style:--p={progress} aria-hidden="true"></span>

    {#if open}
      <div class="map" data-trail-panel>
        <div class="wrap cols">
          <div>
            <p class="mono dim k">{w.trail.map}</p>
            <ol class="parts">
              {#each parts as p, i (p.key)}
                <li><button class:passed={i < now} class:now={i === now} onclick={() => jump(p)} data-trail-part={p.key}><span class="mono n">{String(i + 1).padStart(2, "0")}</span> {label(p)}</button></li>
              {/each}
            </ol>
            <button class="totop small" onclick={() => (open = false, scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" }))}>↑ {w.trail.top}</button>
          </div>
          <div>
            <p class="mono dim k">{w.trail.asks}</p>
            <div class="asks">
              {#each ASKS as q (q)}
                <a class="chip" class:lit={q === "journey"} href={ASK_TO[q]} onclick={() => (open = false)} data-trail-ask={q}>{w.trail.ask[q]}</a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </nav>
{/if}

<style>
  .trail {
    position: fixed;
    left: 0;
    right: 0;
    top: var(--bar);
    z-index: 40;
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: blur(14px) saturate(1.2);
    border-bottom: 1px solid var(--line);
    transform: translateY(-110%);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
      opacity 0.25s;
  }
  .trail.shown {
    transform: none;
    opacity: 1;
    pointer-events: auto;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 38px;
    font-size: 13px;
  }
  .crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    list-style: none;
    margin: 0;
    padding: 0;
    min-width: 0;
    white-space: nowrap;
  }
  .crumbs li {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .crumbs li + li::before {
    content: "›";
    color: var(--dim);
  }
  :global([dir="rtl"]) .crumbs li + li::before {
    content: "‹";
  }
  .crumbs a {
    color: var(--dim);
    text-decoration: none;
  }
  .crumbs a:hover {
    color: var(--text);
  }
  .at {
    font: inherit;
    font-weight: 600;
    color: var(--text);
    background: none;
    border: 0;
    padding: 4px 6px;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .at:hover,
  .at[aria-expanded="true"] {
    background: color-mix(in srgb, var(--text) 8%, transparent);
  }
  .caret {
    font-size: 10px;
    color: var(--dim);
  }
  .grow {
    flex: 1;
  }
  .next {
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--line));
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--text);
    cursor: pointer;
    white-space: nowrap;
    max-width: 46vw;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background 0.2s;
  }
  .next:hover {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
  }
  .next .arrow {
    color: var(--accent);
    display: inline-block;
    animation: nudge 1.8s ease-in-out infinite;
  }
  @keyframes nudge {
    50% {
      transform: translateY(2px);
    }
  }
  .mapbtn {
    background: none;
    border: 0;
    padding: 6px 4px;
    cursor: pointer;
  }
  .dots {
    display: flex;
    gap: 3px;
  }
  .dots i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--line);
    transition: background 0.2s;
  }
  .dots i.passed {
    background: color-mix(in srgb, var(--accent) 50%, var(--line));
  }
  .dots i.now {
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
  }
  .progress {
    position: absolute;
    left: 0;
    bottom: -1px;
    height: 2px;
    width: 100%;
    background: var(--accent);
    transform-origin: left;
    transform: scaleX(var(--p));
  }
  :global([dir="rtl"]) .progress {
    transform-origin: right;
  }
  .map {
    border-top: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    max-height: calc(100vh - var(--bar) - 40px);
    overflow: auto;
    animation: drop 0.22s ease-out;
  }
  @keyframes drop {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding-block: 18px 22px;
  }
  .k {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0 0 10px;
  }
  .parts {
    list-style: none;
    margin: 0;
    padding: 0;
    columns: 2;
    column-gap: 16px;
  }
  .parts button {
    font: inherit;
    font-size: 14px;
    width: 100%;
    text-align: start;
    background: none;
    border: 0;
    padding: 6px 8px;
    border-radius: 6px;
    color: var(--dim);
    cursor: pointer;
  }
  .parts button:hover {
    background: color-mix(in srgb, var(--text) 7%, transparent);
    color: var(--text);
  }
  .parts button.passed {
    color: color-mix(in srgb, var(--text) 70%, var(--dim));
  }
  .parts button.now {
    color: var(--text);
    font-weight: 600;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .n {
    font-size: 11px;
    color: var(--accent);
    margin-inline-end: 6px;
  }
  .totop {
    margin-top: 8px;
    font: inherit;
    font-size: 13px;
    background: none;
    border: 0;
    color: var(--accent);
    cursor: pointer;
    padding: 4px 8px;
  }
  .asks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .asks .chip {
    text-decoration: none;
    font-size: 13px;
  }
  .asks .chip.lit {
    border-color: var(--accent);
    color: var(--accent);
  }
  @media (max-width: 720px) {
    .crumbs li:not(.here):not(:first-child) {
      display: none;
    }
    .next {
      max-width: 52vw;
    }
    .cols {
      grid-template-columns: 1fr;
    }
    .parts {
      columns: 1;
    }
    .dots {
      display: none;
    }
    .mapbtn::after {
      content: "☰";
      color: var(--dim);
      font-size: 15px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .trail,
    .map {
      transition: none;
      animation: none;
    }
    .next .arrow {
      animation: none;
    }
  }
</style>
