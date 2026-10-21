<!--
  The bar every page shares: the name, the places to go, the look (chosen
  from where the visitor is, and theirs to change), the account, and
  Download, always one click away. Past the top of the page it turns solid
  and says what djmanzo costs.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { session } from "../lib/session.svelte";
  import { catalog } from "../lib/catalog.svelte";
  import { NAMED, money } from "../../shared/catalog";
  import { band as bandOf, currencyFor, regional } from "../../shared/regions";
  import { region, choose, follow, skin } from "./region.svelte";
  import { SKINS, type SkinId } from "./skins";
  import { LOOKS, svgUri } from "./looks";
  import { href, navigate, type Route } from "./router";
  import { RELEASES, downloadLabel, osOf } from "./download";

  let { route }: { route: Route } = $props();

  let solid = $state(false);
  let menu = $state(false);
  let picker = $state(false);
  const dl = downloadLabel(osOf(navigator.userAgent));
  /** The cheapest edition bought once, at the visitor's price. */
  const from = $derived.by(() => {
    const c = catalog.data;
    if (!c) return null;
    const where = region.country ?? c.visitor.country;
    const b = bandOf(where);
    const paid = NAMED.map((e) => regional(e, "perpetual", b)).filter((p) => p > 0);
    return money(Math.min(...paid), currencyFor(where));
  });

  const BY: Record<string, string> = {
    choice: "your choice",
    connection: "from your connection",
    language: "from your browser's language",
    address: "from the address",
    none: "",
  };

  function pick(id: SkinId) {
    choose(id);
    picker = false;
  }

  function section(id: string) {
    menu = false;
    if (route.page !== "home") {
      navigate("/");
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()));
    } else document.getElementById(id)?.scrollIntoView();
  }

  onMount(() => {
    const scroll = () => (solid = scrollY > 40);
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".skins")) picker = false;
    };
    document.addEventListener("click", close);
    return () => {
      removeEventListener("scroll", scroll);
      document.removeEventListener("click", close);
    };
  });
</script>

<a class="skip" href="#main">Skip to the content</a>
<header class="bar" class:solid={solid || route.page !== "home" || menu}>
  <div class="inner wrap">
    <a class="brand" href={href("home")} aria-label="djmanzo, home">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="2" /><circle cx="16" cy="16" r="9" fill="none" stroke="var(--accent)" stroke-width="2" /><circle cx="16" cy="16" r="2.5" fill="currentColor" /></svg>
      <b>djmanzo</b><span class="beta">beta</span>
    </a>

    <nav class="links" class:open={menu} aria-label="Site">
      <a class="nav" class:on={route.page === "features"} href={href("features")} onclick={() => (menu = false)}>Features</a>
      <button class="nav" onclick={() => section("hardware")}>Hardware</button>
      <a class="nav" class:on={route.page === "pricing"} href={href("pricing")} onclick={() => (menu = false)}>Pricing</a>
      <a class="nav" class:on={route.page === "market"} href={href("market")} onclick={() => (menu = false)}>Marketplace</a>
      <a class="nav" class:on={route.page === "community"} href={href("community")} onclick={() => (menu = false)}>Community</a>
      <a class="nav" href="/blog">Journal</a>
    </nav>

    <div class="right">
      <div class="skins">
        <button class="skin-btn" aria-haspopup="true" aria-expanded={picker} onclick={() => (picker = !picker)} data-skin-picker>
          <span class="swatch" style:background={`linear-gradient(135deg, ${skin().tokens.accent}, ${skin().tokens.accent2})`}></span>
          <span class="skin-name">{skin().name}</span>
        </button>
        {#if picker}
          <div class="pop card" role="menu" aria-label="Looks">
            <p class="why mono">{skin().name} · {skin().region}{BY[region.by] ? ` — ${BY[region.by]}` : ""}{region.country ? ` (${region.country})` : ""}</p>
            {#each SKINS as s (s.id)}
              {@const p = LOOKS[s.id].pattern}
              <button role="menuitemradio" aria-checked={region.skin === s.id} class="opt" onclick={() => pick(s.id)} data-skin={s.id} title={LOOKS[s.id].about}>
                <span class="swatch tile" style:background-color={s.tokens.bg} style:background-image={svgUri(p.svg, `0 0 ${p.size} ${p.size}`, s.tokens.accent, s.tokens.accent2)} style:background-size={`${p.size / 2}px`}></span>
                <span><b style:font-family={LOOKS[s.id].font.stack}>{s.name}</b><small>{s.region}</small></span>
              </button>
            {/each}
            <p class="about">{LOOKS[region.skin].about}</p>
            {#if region.chosen}
              <button class="follow" onclick={() => (follow(), (picker = false))}>Follow my location again</button>
            {/if}
          </div>
        {/if}
      </div>
      {#if session.user}
        <a class="nav account signed" class:on={route.page === "account"} href={href("account")} title="Your account and licences" data-account-link>
          {#if session.user.avatar}<img src={session.user.avatar} alt="" width="22" height="22" />{:else}<span class="initial" aria-hidden="true">{session.user.name.slice(0, 1)}</span>{/if}
          <span class="who">{session.user.name}</span>
        </a>
      {:else}
        <a class="nav account" class:on={route.page === "account"} href={href("account")} data-account-link>Sign in</a>
      {/if}
      {#if solid && route.page !== "pricing" && from}
        <a class="price mono" href={href("pricing")} data-from>Free · editions from {from}</a>
      {/if}
      <a class="btn primary small dl" href={RELEASES} title={dl.note} data-download>{dl.label}</a>
      <button class="burger" aria-label="Menu" aria-expanded={menu} onclick={() => (menu = !menu)}><span></span><span></span></button>
    </div>
  </div>
</header>

<style>
  .swatch.tile {
    border: 1px solid var(--line);
  }
  .about {
    margin: 8px 6px 2px;
    max-width: 30ch;
    font-size: 12px;
    line-height: 1.45;
    color: var(--dim);
  }
  .account.signed {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .account img,
  .account .initial {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
  }
  .account .initial {
    display: grid;
    place-items: center;
    background: var(--accent);
    color: var(--on-accent);
    font: 700 12px/1 var(--display);
  }
  .account .who {
    max-width: 12ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .skip {
    position: absolute;
    left: -9999px;
  }
  .skip:focus {
    left: 12px;
    top: 12px;
    z-index: 100;
    background: var(--accent);
    color: var(--on-accent);
    padding: 8px 12px;
    border-radius: 8px;
  }
  .bar {
    position: fixed;
    inset: 0 0 auto 0;
    height: var(--bar);
    z-index: 50;
    transition:
      background-color 0.3s,
      border-color 0.3s,
      backdrop-filter 0.3s;
    border-bottom: 1px solid transparent;
  }
  .bar.solid {
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: blur(14px) saturate(1.2);
    border-bottom-color: color-mix(in srgb, var(--line) 70%, transparent);
  }
  .inner {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 22px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    color: var(--text);
  }
  .brand b {
    font: 700 20px/1 var(--display);
    letter-spacing: -0.03em;
  }
  .beta {
    font: 500 10px/1 var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
    border-radius: 5px;
    padding: 3px 5px;
  }
  .links {
    display: flex;
    gap: 4px;
  }
  .nav {
    font: 500 14px/1 var(--body);
    color: color-mix(in srgb, var(--text) 82%, transparent);
    background: none;
    border: 0;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
  }
  .nav:hover,
  .nav.on {
    color: var(--text);
    background: color-mix(in srgb, var(--text) 7%, transparent);
  }
  .right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .price {
    font-size: 12px;
    color: var(--dim);
    text-decoration: none;
    white-space: nowrap;
  }
  .price:hover {
    color: var(--text);
  }
  /* The price line only where the bar has room for it beside every link. */
  @media (max-width: 1500px) {
    .price {
      display: none;
    }
  }
  .skins {
    position: relative;
  }
  .skin-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding: 0 12px 0 8px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
    background: color-mix(in srgb, var(--bg) 40%, transparent);
    color: var(--text);
    font: 500 13px/1 var(--body);
    cursor: pointer;
  }
  .swatch {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    flex: none;
  }
  .pop {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    width: 300px;
    max-height: min(76vh, 680px);
    overflow-y: auto;
    padding: 8px;
    box-shadow: 0 24px 60px rgb(0 0 0 / 0.55);
  }
  .why {
    font-size: 11px;
    color: var(--dim);
    margin: 6px 8px 8px;
    line-height: 1.5;
  }
  .opt {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 10px;
    border-radius: 9px;
    border: 0;
    background: none;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    font: inherit;
  }
  .opt:hover,
  .opt[aria-checked="true"] {
    background: var(--raised);
  }
  .opt b {
    display: block;
    font: 600 14px/1.2 var(--body);
  }
  .opt small {
    color: var(--dim);
    font-size: 12px;
  }
  .follow {
    width: 100%;
    margin-top: 4px;
    padding: 9px;
    border: 0;
    border-top: 1px solid var(--line);
    background: none;
    color: var(--accent);
    font: 500 13px var(--body);
    cursor: pointer;
  }
  .burger {
    display: none;
    width: 40px;
    height: 40px;
    border: 0;
    background: none;
    cursor: pointer;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    align-items: center;
  }
  .burger span {
    width: 20px;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
  }
  @media (max-width: 1080px) {
    .links {
      display: none;
      position: fixed;
      top: var(--bar);
      left: 0;
      right: 0;
      flex-direction: column;
      padding: 12px var(--gutter) 20px;
      background: color-mix(in srgb, var(--bg) 96%, transparent);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--line);
    }
    .links.open {
      display: flex;
    }
    .links .nav {
      font-size: 17px;
      padding: 14px 8px;
      text-align: left;
    }
    .burger {
      display: inline-flex;
    }
    .price {
      display: none;
    }
  }
  @media (max-width: 640px) {
    .skin-name,
    .account,
    .dl {
      display: none;
    }
    .inner {
      gap: 10px;
    }
  }
</style>
