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
  import { SYSTEMS, SYSTEM_NAME, type System } from "./download";
  import { choice, chooseSystem, start as startChoice } from "./dlchoice.svelte";
  import { restore, setSounds, sounds } from "./sfx.svelte";
  import { LANG_INFO, chooseLanguage, i18n, pickerLanguages, startLanguage, t, type Lang } from "./i18n.svelte";
  import { crate } from "./crate/crate.svelte";
  import { aboutOf, countryName, regionOf } from "./i18n/looks";
  import { JOURNEY } from "./i18n/journey";
  import OsIcon from "./OsIcon.svelte";
  import Flag from "./Flag.svelte";

  let { route }: { route: Route } = $props();

  let solid = $state(false);
  let menu = $state(false);
  let picker = $state(false);
  let systems = $state(false);
  let langs = $state(false);

  /** The bar's system menu: switch the system, then the main Download button, glowing. */
  function forSystem(os: System) {
    systems = false;
    chooseSystem(os);
    const there = () => document.getElementById("get")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (route.page !== "home") {
      navigate("/");
      requestAnimationFrame(() => requestAnimationFrame(there));
    } else there();
  }
  /** The cheapest edition bought once, at the visitor's price. */
  const from = $derived.by(() => {
    const c = catalog.data;
    if (!c) return null;
    const where = region.country ?? c.visitor.country;
    const b = bandOf(where);
    const paid = NAMED.map((e) => regional(e, "perpetual", b)).filter((p) => p > 0);
    return money(Math.min(...paid), currencyFor(where));
  });

  /** Why the bar wears this look, in the visitor's language. */
  const by = (how: string) => (how === "choice" || how === "connection" || how === "language" || how === "address" ? t(`look.${how}`) : "");

  /** The languages read where the visitor is, and English, first. */
  const order = $derived(pickerLanguages(region.country));

  function speak(lang: Lang) {
    langs = false;
    chooseLanguage(lang);
  }

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

  /*
   * The bar is two shapes, drawn from where its parts are. The wing holds the name and the
   * places to go: it hangs from the top of the window at the start side, deepest under the
   * name like a wing's leading edge, and thins toward its end, where it sweeps up to a point.
   * The island holds the options and floats apart at the other end, its leading edge swept
   * the same way, as if cut from the wing's tail. Both are measured in reading order and
   * mirrored when the page reads right to left.
   */
  type Hull = { w: number; h: number; tip: number; wing: string; island: string; edge: string; belly: string; wake: string[]; rtl: boolean; marks: string };
  let hull = $state<Hull | null>(null);
  let barEl: HTMLElement | undefined = $state();
  let wingEl: HTMLElement | undefined = $state();
  let rightEl: HTMLElement | undefined = $state();

  const K = 0.5523; // a quarter circle, as a cubic
  const r1 = (n: number) => Math.round(n * 10) / 10;

  /** T is the wing's swept end and Ti the island's swept start, both as the stylesheet pads them. */
  function shapes(w: number, h: number, tip: number, i0: number, i1: number, T: number, Ti: number, rtl: boolean): Hull {
    const X = (x: number) => r1(rtl ? w - x : x);
    const P = (x: number, y: number) => `${X(x)} ${r1(y)}`;
    const b = tip - T; // where the underside turns up into the swept end
    const yb = h - 7; // the underside, thin at the end
    const y0 = h + 7; // and deep at the start, under the name
    const under = `C ${P(b * 0.2, y0)} ${P(b * 0.56, yb)} ${P(b, yb)}`;
    const sweep = `C ${P(b + 0.46 * T, yb)} ${P(tip - 0.1 * T, 0.32 * h)} ${P(tip, 0)}`;
    const wing = `M ${P(0, 0)} L ${P(tip, 0)} C ${P(tip - 0.1 * T, 0.32 * h)} ${P(b + 0.46 * T, yb)} ${P(b, yb)} C ${P(b * 0.56, yb)} ${P(b * 0.2, y0)} ${P(0, y0)} Z`;
    const edge = `M ${P(0, y0)} ${under} ${sweep}`;
    const top = 7;
    const bot = h - 7;
    const r = (bot - top) / 2;
    const L = i1 - r - i0;
    const island =
      `M ${P(i0, bot)} C ${P(i0 + 0.46 * Ti, bot)} ${P(i0 + 0.9 * Ti, top + 0.32 * (bot - top))} ${P(i0 + Ti, top + 3)} ` +
      `Q ${P(i0 + Ti + 1, top)} ${P(i0 + Ti + 7, top)} L ${P(i1 - r, top)} ` +
      `C ${P(i1 - r + K * r, top)} ${P(i1, top + r - K * r)} ${P(i1, top + r)} ` +
      `C ${P(i1, top + r + K * r)} ${P(i1 - r + K * r, bot)} ${P(i1 - r, bot)} ` +
      `C ${P(i1 - r - 0.36 * L, bot + 2.5)} ${P(i0 + 0.3 * L, bot + 1.2)} ${P(i0, bot)} Z`;
    const belly = `M ${P(i1 - r, bot)} C ${P(i1 - r - 0.36 * L, bot + 2.5)} ${P(i0 + 0.3 * L, bot + 1.2)} ${P(i0, bot)}`;
    // The air leaving the wing's point, toward the island: two thin lines that fade.
    const gap = Math.max(0, i0 - tip);
    const reach = Math.min(150, gap * 0.7);
    const wake = reach > 24 ? [`M ${P(tip - 4, 5)} L ${P(tip + reach, 5)}`, `M ${P(tip - 12, 12)} L ${P(tip + reach * 0.62, 12)}`] : [];
    // Where the shapes lie across the window, for the tests: the swept end's start and point, the island's ends.
    const marks = [b, tip, i0, i1].map(X).join(" ");
    return { w, h, tip, wing, island, edge, belly, wake, rtl, marks };
  }

  function measure() {
    if (!barEl || !wingEl || !rightEl) return;
    const box = barEl.getBoundingClientRect();
    const css = getComputedStyle(barEl);
    const rtl = css.direction === "rtl";
    const room = (name: string, or: number) => parseFloat(css.getPropertyValue(name)) || or;
    const w = box.width;
    const end = (r: DOMRect) => (rtl ? w - r.left : r.right);
    const start = (r: DOMRect) => (rtl ? w - r.right : r.left);
    const wr = wingEl.getBoundingClientRect();
    const rr = rightEl.getBoundingClientRect();
    hull = shapes(w, box.height, end(wr), start(rr), end(rr), room("--sweep", 58), room("--lead", 28), rtl);
  }

  /** The edge under the wing, for the stylesheet's mask: the visitor's country's colours run along it. */
  const edgeMask = $derived(
    hull
      ? `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${hull.w}' height='${hull.h + 14}'><path d='${hull.edge}' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round'/></svg>`)}")`
      : undefined,
  );

  $effect(() => {
    void i18n.lang;
    requestAnimationFrame(measure);
  });

  onMount(() => {
    restore();
    startChoice();
    startLanguage();
    const watch = new ResizeObserver(() => measure());
    for (const el of [barEl, wingEl, rightEl]) if (el) watch.observe(el);
    document.fonts?.ready.then(measure);
    const scroll = () => (solid = scrollY > 40);
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".skins")) picker = false;
      if (!(e.target as HTMLElement).closest(".dlmenu")) systems = false;
      if (!(e.target as HTMLElement).closest(".langs")) langs = false;
    };
    document.addEventListener("click", close);
    return () => {
      watch.disconnect();
      removeEventListener("scroll", scroll);
      document.removeEventListener("click", close);
    };
  });
</script>

<a class="skip" href="#main">{t("nav.skip")}</a>
<!-- A speaker, with its waves while the site's sounds are on. -->
{#snippet speaker(on: boolean)}
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" fill-opacity=".18" />
    {#if on}<path class="wave1" d="M15.5 9.2a4 4 0 0 1 0 5.6" /><path class="wave2" d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />{:else}<path d="m16 9.5 5 5m0-5-5 5" />{/if}
  </svg>
{/snippet}

<!--
  Each place has a sign that says what it is, a shape that echoes it and a type that suits it:
  the machine in a panel's engraved capitals, the price on a ticket in a receipt's type, the
  crates of the marketplace stencilled, the community in a rounded hand, the journal written,
  and the journey in the visitor's own look.
-->
{#snippet icon(kind: string)}
  <svg class="ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    {#if kind === "features"}
      <path d="M6 3.5v17M12 3.5v17M18 3.5v17" opacity=".42" />
      <rect class="cap c1" x="3.6" y="13" width="4.8" height="3.2" rx="1" fill="currentColor" />
      <rect class="cap c2" x="9.6" y="6.5" width="4.8" height="3.2" rx="1" fill="currentColor" />
      <rect class="cap c3" x="15.6" y="10.5" width="4.8" height="3.2" rx="1" fill="currentColor" />
    {:else if kind === "hardware"}
      <rect x="1.8" y="5.5" width="20.4" height="13" rx="3.2" />
      <g class="jog"><circle cx="7.4" cy="12" r="3.3" /><circle cx="7.4" cy="9.6" r=".8" fill="currentColor" stroke="none" /></g>
      <g class="jog"><circle cx="16.6" cy="12" r="3.3" /><circle cx="16.6" cy="9.6" r=".8" fill="currentColor" stroke="none" /></g>
      <path d="M12 9.2v5.6" />
    {:else if kind === "pricing"}
      <g class="tag"><path d="M3.2 12.6V5.2a2 2 0 0 1 2-2h7.4l8.2 8.4-8.6 8.6z" fill="currentColor" fill-opacity=".14" /><circle cx="8" cy="8" r="1.6" /></g>
    {:else if kind === "market"}
      <g class="discs"><path d="M5.6 11.2a4.2 4.2 0 0 1 8.4 0" /><path d="M10.4 11.2a4.2 4.2 0 0 1 8.4 0" /></g>
      <path d="M2.8 11.2h18.4l-1.7 9H4.5z" fill="currentColor" fill-opacity=".14" />
      <path d="M8.5 15.4h7" />
    {:else if kind === "community"}
      <path class="b1" d="M4 4h9.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8.6L5.4 15.8V13H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="currentColor" fill-opacity=".14" />
      <path class="b2" d="M18 8.5h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.8v2.8L16 17.5h-4a2 2 0 0 1-2-2v-.6" />
    {:else if kind === "journal"}
      <path d="M5 3h9.5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5z" fill="currentColor" fill-opacity=".14" /><path d="M8 3v18M10.6 8h3.4M10.6 11.4h2.6" />
      <path class="pen" d="M20.2 6.4l1.2 1.2-5.6 5.6-1.8.6.6-1.8z" />
    {:else}
      <circle cx="4.6" cy="18.6" r="2" />
      <path class="route" d="M6.8 18.6h5.4a3.4 3.4 0 0 0 0-6.8H9.6a3.4 3.4 0 0 1 0-6.8h5.2" />
      <path class="spark" d="M19.4 1.6l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill="currentColor" stroke="none" />
    {/if}
  </svg>
{/snippet}

<header class="bar" class:solid={solid || route.page !== "home" || menu} bind:this={barEl}>
  <!-- The two shapes the bar is drawn as; nothing here can be pressed. -->
  {#if hull}
    <div class="hull" aria-hidden="true" data-hull={hull.marks}>
      <svg class="shade" width={hull.w} height={hull.h + 14}><path d={hull.island} /></svg>
      <div class="glass wingglass" style:clip-path={`path("${hull.wing}")`}></div>
      <div class="glass islandglass" style:clip-path={`path("${hull.island}")`}></div>
      <div class="edgewrap">
        <div class="edge" style:mask-image={edgeMask} style:-webkit-mask-image={edgeMask} style:--tip={`${hull.tip}px`} class:rtl={hull.rtl}></div>
      </div>
      <svg class="lines" width={hull.w} height={hull.h + 14}>
        <defs>
          <linearGradient id="wake-fade" x1={hull.rtl ? "1" : "0"} x2={hull.rtl ? "0" : "1"} y1="0" y2="0">
            <stop offset="0" style="stop-color: var(--accent)" stop-opacity=".55" />
            <stop offset="1" style="stop-color: var(--accent)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <!-- A hairline in the look's colour runs under the edge, so a flag's dark stripe never loses the shape. -->
        <path class="stripe" d={hull.edge} transform="translate(0 3.2)" />
        <path class="rim" d={hull.island} />
        <path class="belly" d={hull.belly} />
        {#each hull.wake as d, i (i)}<path class="wake" d={d} stroke="url(#wake-fade)" style:animation-delay={`${0.25 + i * 0.12}s`} />{/each}
        {#key route.page}<path class="glint" d={hull.edge} pathLength="1000" />{/key}
      </svg>
    </div>
  {/if}
  <div class="inner wrap">
    <div class="wing" bind:this={wingEl}>
      <a class="brand" href={href("home")} aria-label={t("nav.home")} onclick={(e) => { e.preventDefault(); navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="2" /><circle cx="16" cy="16" r="9" fill="none" stroke="var(--accent)" stroke-width="2" /><circle cx="16" cy="16" r="2.5" fill="currentColor" /></svg>
        <b>djmanzo</b><span class="beta">beta</span>
      </a>

      <nav class="links" class:open={menu} aria-label={t("nav.site")}>
        <a class="nav pad" class:on={route.page === "features"} href={href("features")} onclick={() => (menu = false)}>{@render icon("features")}<span class="lbl">{t("nav.features")}</span></a>
        <button class="nav capsule" onclick={() => section("hardware")}>{@render icon("hardware")}<span class="lbl">{t("nav.hardware")}</span></button>
        <a class="nav ticket" class:on={route.page === "pricing"} href={href("pricing")} onclick={() => (menu = false)}>{@render icon("pricing")}<span class="lbl">{t("nav.pricing")}</span></a>
        <a class="nav crate" class:on={route.page === "market"} href={href("market")} onclick={() => (menu = false)}>{@render icon("market")}<span class="lbl">{t("nav.market")}</span></a>
        <a class="nav bubble" class:on={route.page === "community"} href={href("community")} onclick={() => (menu = false)}>{@render icon("community")}<span class="lbl">{t("nav.community")}</span></a>
        <a class="nav journal" href="/blog">{@render icon("journal")}<span class="lbl">{t("nav.journal")}</span></a>
        <a class="nav journey" class:on={route.page === "journey"} href={href("journey")} onclick={() => (menu = false)} title={JOURNEY[i18n.lang].nav} data-journey-link>{@render icon("journey")}<span class="lbl jl">{JOURNEY[i18n.lang].nav}</span></a>
        <!-- On a narrow phone the sound switch lives here, so the bar fits. -->
        <button class="nav sound-row" aria-pressed={sounds.on} onclick={() => setSounds(!sounds.on)} data-sounds-row>{@render speaker(sounds.on)} <span class="lbl">{sounds.on ? t("sound.onLabel") : t("sound.offLabel")}</span></button>
      </nav>
    </div>

    <div class="right" bind:this={rightEl}>
      <!-- Global YouTube player controls: play/pause from anywhere -->
      {#if crate.playing || crate.queue.length > 0}
        <button
          class="player-btn"
          aria-pressed={!!crate.playing}
          title={crate.playing ? "Pause player" : "Resume player"}
          aria-label={crate.playing ? "Pause player" : "Resume player"}
          onclick={() => {
            if (crate.playing) {
              crate.stop();
            } else if (crate.queue.length > 0) {
              const idx = crate.queueIndex >= 0 ? crate.queueIndex : 0;
              crate.play(crate.queue[idx]);
            }
          }}
          data-player-global
        >
          {#if crate.playing}
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          {:else}
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          {/if}
        </button>
      {/if}
      <button
        class="sound-btn"
        aria-pressed={sounds.on}
        title={sounds.on ? t("sound.on") : t("sound.off")}
        aria-label={sounds.on ? t("sound.onLabel") : t("sound.offLabel")}
        onclick={() => setSounds(!sounds.on)}
        data-sounds>{@render speaker(sounds.on)}</button>
      <div class="skins">
        <button class="skin-btn" aria-haspopup="true" aria-expanded={picker} onclick={() => (picker = !picker)} data-skin-picker>
          <span class="swatch" style:background={`linear-gradient(135deg, ${skin().tokens.accent}, ${skin().tokens.accent2})`}></span>
          <span class="skin-name">{skin().name}</span>
        </button>
        {#if picker}
          <div class="pop card" role="menu" aria-label={t("look.menu")}>
            <p class="why mono">{skin().name} · {regionOf(skin().id, i18n.lang)}{by(region.by) ? ` — ${by(region.by)}` : ""}{region.country ? ` (${countryName(region.country, i18n.lang)})` : ""}</p>
            {#each SKINS as s (s.id)}
              {@const p = LOOKS[s.id].pattern}
              <button role="menuitemradio" aria-checked={region.skin === s.id} class="opt" onclick={() => pick(s.id)} data-skin={s.id} title={aboutOf(s.id, i18n.lang)}>
                <span class="swatch tile" style:background-color={s.tokens.bg} style:background-image={svgUri(p.svg, `0 0 ${p.size} ${p.size}`, s.tokens.accent, s.tokens.accent2)} style:background-size={`${p.size / 2}px`}></span>
                <span><b style:font-family={LOOKS[s.id].font.stack}>{s.name}</b><small>{regionOf(s.id, i18n.lang)}</small></span>
              </button>
            {/each}
            <p class="about">{aboutOf(region.skin, i18n.lang)}</p>
            {#if region.chosen}
              <button class="follow" onclick={() => (follow(), (picker = false))}>{t("look.follow")}</button>
            {/if}
          </div>
        {/if}
      </div>
      <!-- The language: a flag; the ones read where the visitor is and English first, then every other the site speaks. -->
      <div class="langs">
        <button class="lang-btn" aria-haspopup="menu" aria-expanded={langs} aria-label={t("lang.choose", { name: LANG_INFO[i18n.lang].name })} title={LANG_INFO[i18n.lang].name} onclick={() => (langs = !langs)} data-lang-picker={i18n.lang}>
          <Flag lang={i18n.lang} size={26} />
        </button>
        {#if langs}
          <div class="pop card langmenu" role="menu" aria-label={t("lang.label")}>
            {#each order.first as l (l)}
              <button role="menuitemradio" aria-checked={i18n.lang === l} class="opt" lang={LANG_INFO[l].tag} dir={LANG_INFO[l].rtl ? "rtl" : "ltr"} onclick={() => speak(l)} data-lang={l} data-sound="scratch">
                <Flag lang={l} size={20} /> <span>{LANG_INFO[l].name}</span>
              </button>
            {/each}
            <div class="more" data-lang-rest>
              {#each order.rest as l (l)}
                <button role="menuitemradio" aria-checked={i18n.lang === l} class="opt" lang={LANG_INFO[l].tag} dir={LANG_INFO[l].rtl ? "rtl" : "ltr"} onclick={() => speak(l)} data-lang={l} data-sound="scratch">
                  <Flag lang={l} size={20} /> <span>{LANG_INFO[l].name}</span>
                </button>
              {/each}
            </div>
            {#if i18n.lang !== "en"}<p class="about">{t("lang.partial")}</p>{/if}
          </div>
        {/if}
      </div>
      {#if session.user}
        <!-- The avatar alone, so a long name never pushes the bar past the screen; the name is in the tooltip and the label. -->
        <a class="nav account signed" class:on={route.page === "account"} href={href("account")} title={`${session.user.name}: your account and licences`} aria-label={`Signed in as ${session.user.name}: your account and licences`} data-account-link data-account-name={session.user.name}>
          {#if session.user.avatar}<img src={session.user.avatar} alt="" width="28" height="28" />{:else}<span class="initial" aria-hidden="true">{[...session.user.name.trim()][0]?.toUpperCase() ?? "?"}</span>{/if}
        </a>
      {:else}
        <a class="nav account" class:on={route.page === "account"} href={href("account")} data-account-link>{t("nav.signin")}</a>
      {/if}
      {#if solid && route.page !== "pricing" && from}
        <a class="price mono" href={href("pricing")} data-from>{t("bar.from", { price: from })}</a>
      {/if}
      <!-- A download arrow and the chosen system: a menu of systems; choosing one goes to the main Download button. -->
      <div class="dlmenu">
        <button class="btn primary small dl" aria-haspopup="menu" aria-expanded={systems} title={t("dl.choose", { os: SYSTEM_NAME[choice.os] })} aria-label={t("dl.choose", { os: SYSTEM_NAME[choice.os] })} data-download data-sound="scratch" onclick={() => (systems = !systems)}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M6.5 10 12 15.5 17.5 10M4 20h16" /></svg>
          <OsIcon os={choice.os} />
          <svg class="caret" viewBox="0 0 24 24" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {#if systems}
          <div class="pop card sysmenu" role="menu" aria-label={t("dl.menu")}>
            {#each SYSTEMS as os (os)}
              <button role="menuitemradio" aria-checked={choice.os === os} class="opt" onclick={() => forSystem(os)} data-bar-system={os}>
                <OsIcon {os} /> <span>{SYSTEM_NAME[os]}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
      <button class="burger" aria-label={t("nav.menu")} aria-expanded={menu} onclick={() => (menu = !menu)}><span></span><span></span></button>
    </div>
  </div>
</header>

<style>
  /* The island's round keys: the sound, the look and the language. */
  .player-btn {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
    cursor: pointer;
    transition:
      border-color 0.2s,
      color 0.2s,
      box-shadow 0.2s,
      background-color 0.2s;
  }
  .player-btn:hover {
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
  }
  .player-btn[aria-pressed="true"] {
    color: var(--accent);
    border-color: var(--accent);
    animation: player-pulse 1.8s ease-in-out infinite;
  }
  @keyframes player-pulse {
    0%, 100% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
    50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 10%, transparent); }
  }
  .sound-btn {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--text) 13%, transparent);
    background: color-mix(in srgb, var(--text) 4%, transparent);
    color: color-mix(in srgb, var(--text) 78%, transparent);
    cursor: pointer;
    transition:
      border-color 0.2s,
      color 0.2s,
      box-shadow 0.2s;
  }
  .sound-btn:hover {
    color: var(--text);
    border-color: color-mix(in srgb, var(--text) 28%, transparent);
  }
  .sound-btn[aria-pressed="true"] {
    color: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }
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
  .account.signed {
    padding: 3px;
    border-radius: 50%;
  }
  .account img,
  .account .initial {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }
  .account .initial {
    display: grid;
    place-items: center;
    background: var(--accent);
    color: var(--on-accent);
    font: var(--display-bold, 700) 12px/1 var(--display);
  }
  /* Off the start side, so it never widens a page read right to left. */
  .skip {
    position: absolute;
    inset-inline-start: -9999px;
  }
  .skip:focus {
    inset-inline-start: 12px;
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
    /* The wing's swept end and the island's swept start: the shapes are drawn into this room. */
    --sweep: 58px;
    --lead: 28px;
  }
  /* The drawn shapes, behind the bar's contents, a little deeper than the bar where the wing hangs. */
  .hull {
    position: absolute;
    inset: 0 0 auto 0;
    height: calc(100% + 14px);
    pointer-events: none;
    z-index: -1;
  }
  .hull > * {
    position: absolute;
    inset: 0;
  }
  .glass {
    transition: background-color 0.35s;
    backdrop-filter: blur(14px) saturate(1.25);
    -webkit-backdrop-filter: blur(14px) saturate(1.25);
  }
  /* At the top of the home page the wing is light over the picture; anywhere else, and once scrolled, it is solid. */
  .wingglass {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 52%, transparent), color-mix(in srgb, var(--bg) 30%, transparent));
  }
  .bar.solid .wingglass {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 92%, transparent), color-mix(in srgb, var(--raised, var(--bg)) 84%, transparent));
  }
  .islandglass {
    background: linear-gradient(180deg, color-mix(in srgb, var(--raised, var(--bg)) 90%, transparent), color-mix(in srgb, var(--bg) 88%, transparent));
  }
  /* The island floats: its shadow falls a little below it. */
  .shade {
    filter: blur(9px);
    transform: translateY(6px);
    opacity: 0.55;
  }
  .shade path {
    fill: rgb(0 0 0 / 0.6);
  }
  /* The wing's edge in the visitor's country's colours (App.svelte sets --flag), or the look's own, along the curve. */
  .edgewrap {
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--accent) 45%, transparent));
  }
  .edge {
    position: absolute;
    inset: 0;
    background-image: var(--flag), linear-gradient(90deg, var(--accent), var(--accent2, var(--accent)));
    background-size: var(--tip) 100%;
    background-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    opacity: 0.9;
  }
  .edge.rtl {
    background-position: right top;
  }
  .lines {
    overflow: visible;
    fill: none;
  }
  .stripe {
    stroke: color-mix(in srgb, var(--accent) 60%, transparent);
    stroke-width: 1;
  }
  .rim {
    stroke: color-mix(in srgb, var(--text) 15%, transparent);
    stroke-width: 1;
  }
  .belly {
    stroke: color-mix(in srgb, var(--accent) 55%, transparent);
    stroke-width: 1.6;
    stroke-linecap: round;
  }
  .wake {
    stroke-width: 1.2;
    stroke-linecap: round;
    stroke-dasharray: 160;
    stroke-dashoffset: 160;
    animation: wake 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  }
  @keyframes wake {
    to {
      stroke-dashoffset: 0;
    }
  }
  /* On every new page a glint runs along the wing's edge, from the name to the point. */
  .glint {
    stroke: color-mix(in srgb, #fff 85%, var(--accent));
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-dasharray: 70 1100;
    stroke-dashoffset: 70;
    opacity: 0;
    animation: glint 1.25s cubic-bezier(0.45, 0, 0.2, 1) 0.15s;
  }
  @keyframes glint {
    0% {
      stroke-dashoffset: 70;
      opacity: 0.95;
    }
    85% {
      opacity: 0.85;
    }
    100% {
      stroke-dashoffset: -1000;
      opacity: 0;
    }
  }
  /* The bar spans wider than the page's column: the wing and the island need the room. */
  .inner {
    height: 100%;
    max-width: 1760px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .wing {
    display: flex;
    align-items: center;
    gap: 20px;
    height: 100%;
    padding-inline-end: var(--sweep);
    flex: none;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    color: var(--text);
  }
  .brand b {
    font: var(--display-bold, 700) 20px/1 var(--display);
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
    align-items: center;
    gap: 6px;
  }
  /*
   * The places to go: a sign and a word on a plate of its own shape. The plate is faint at rest,
   * clear under the pointer, and lit in the look's colour on the page the visitor is on.
   */
  .nav {
    --plate: color-mix(in srgb, var(--text) 4.5%, transparent);
    --rim: color-mix(in srgb, var(--text) 9%, transparent);
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 36px;
    font: 600 13.5px/1 "Barlow Semi Condensed", var(--body);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: color-mix(in srgb, var(--text) 80%, transparent);
    background: none;
    border: 0;
    padding: 0 12px;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition:
      color 0.2s,
      transform 0.2s cubic-bezier(0.3, 0.7, 0.3, 1.4);
  }
  .nav::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 9px;
    background: var(--plate);
    border: 1px solid var(--rim);
    transition:
      background-color 0.2s,
      border-color 0.2s,
      box-shadow 0.2s;
  }
  .nav:hover {
    --plate: color-mix(in srgb, var(--text) 9%, transparent);
    --rim: color-mix(in srgb, var(--text) 18%, transparent);
    color: var(--text);
    transform: translateY(-1px);
  }
  .nav.on {
    --plate: color-mix(in srgb, var(--accent) 16%, transparent);
    --rim: color-mix(in srgb, var(--accent) 55%, transparent);
    color: var(--text);
  }
  .nav.on::before {
    box-shadow: 0 0 14px -4px color-mix(in srgb, var(--accent) 70%, transparent);
  }
  .nav:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
  .ico {
    flex: none;
    color: color-mix(in srgb, var(--accent) 70%, var(--text));
    overflow: visible;
  }
  .nav.on .ico,
  .nav:hover .ico {
    color: var(--accent);
  }
  .ico * {
    transition: transform 0.35s cubic-bezier(0.3, 0.7, 0.3, 1.3);
    transform-box: fill-box;
    transform-origin: center;
  }
  /* Features: a performance pad, its light on when lit; the faders move under the pointer. */
  .nav.pad::before {
    border-radius: 6px;
  }
  .nav.pad::after {
    content: "";
    position: absolute;
    top: 5px;
    inset-inline-end: 5px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--text) 22%, transparent);
    transition:
      background-color 0.2s,
      box-shadow 0.2s;
  }
  .nav.pad:hover::after,
  .nav.pad.on::after {
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
  }
  .nav:hover .c1 {
    transform: translateY(-6px);
  }
  .nav:hover .c2 {
    transform: translateY(7px);
  }
  .nav:hover .c3 {
    transform: translateY(-3px);
  }
  /* Hardware: a controller's round shape; its platters turn. */
  .nav.capsule::before {
    border-radius: 999px;
  }
  .nav:hover .jog {
    transform: rotate(160deg);
  }
  /* Pricing: a ticket, notched at both ends and edged in dashes, in a receipt's type; the tag swings. */
  .nav.ticket {
    font: 500 12.5px/1 var(--mono);
    letter-spacing: 0.04em;
    padding-inline: 14px;
  }
  .nav.ticket::before {
    border-radius: 5px;
    border-style: dashed;
    -webkit-mask:
      radial-gradient(circle 5px at 0 50%, #0000 96%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 5px at 100% 50%, #0000 96%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 5px at 0 50%, #0000 96%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 5px at 100% 50%, #0000 96%, #000) right / 51% 100% no-repeat;
  }
  .nav .tag {
    transform-origin: 33% 33%;
  }
  .nav:hover .tag {
    transform: rotate(-16deg);
  }
  /* The marketplace: a record crate's cut corners and stencilled letters; the records lift out. */
  .nav.crate {
    font: 400 14px/1 "Saira Stencil One", var(--body);
    letter-spacing: 0.06em;
  }
  /* A clipped corner loses its border, so the crate's rim is a layer of its own and its face sits inside it. */
  .nav.crate::before,
  .nav.crate::after {
    content: "";
    position: absolute;
    z-index: -1;
    border: 0;
    border-radius: 0;
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  }
  .nav.crate::before {
    inset: 0;
    background: var(--rim);
  }
  .nav.crate::after {
    inset: 1px;
    clip-path: polygon(7.6px 0, 100% 0, 100% calc(100% - 7.6px), calc(100% - 7.6px) 100%, 0 100%, 0 7.6px);
    background: var(--face);
    transition: background-color 0.2s;
  }
  .nav.crate {
    --face: color-mix(in srgb, var(--text) 5%, var(--bg));
  }
  .nav.crate:hover {
    --face: color-mix(in srgb, var(--text) 10%, var(--bg));
  }
  .nav.crate.on {
    --face: color-mix(in srgb, var(--accent) 16%, var(--bg));
  }
  .nav:hover .discs {
    transform: translateY(-3px);
  }
  /* The community: a speech bubble, in a rounded, friendly hand; the second bubble answers. */
  .nav.bubble {
    font: 600 15px/1 "Fredoka", var(--body);
    text-transform: none;
    letter-spacing: 0.01em;
  }
  .nav.bubble::before {
    border-radius: 15px 15px 15px 4px;
  }
  :global([dir="rtl"]) .nav.bubble::before {
    border-radius: 15px 15px 4px 15px;
  }
  .nav:hover .b2 {
    transform: translate(1px, -2px);
  }
  .nav:hover .b1 {
    transform: translate(-1px, 1px);
  }
  /* The journal: a notebook's page, bound at the start, in handwriting; the pen writes. */
  .nav.journal {
    font: 700 19px/1 "Caveat", var(--body);
    text-transform: none;
    letter-spacing: 0.01em;
  }
  .nav.journal::before {
    border-radius: 2px 10px 10px 2px;
    border-inline-start: 3px solid color-mix(in srgb, var(--accent) 45%, transparent);
    transform: rotate(-1.2deg);
  }
  .nav:hover .pen {
    transform: translate(-2px, 2px) rotate(-12deg);
  }
  /* The journey: the one place that asks about the visitor, in their look's own type, its route drawn in dashes that walk. */
  .nav.journey {
    font: var(--display-bold, 700) 14px/1 var(--display);
    text-transform: none;
    letter-spacing: var(--display-track, -0.01em);
    color: var(--accent);
    --plate: color-mix(in srgb, var(--accent) 9%, transparent);
    --rim: color-mix(in srgb, var(--accent) 50%, transparent);
  }
  .nav.journey::before {
    border-radius: 999px 999px 999px 999px;
    border-style: dashed;
  }
  .nav.journey:hover,
  .nav.journey.on {
    --plate: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--accent);
  }
  .nav.journey .ico {
    color: var(--accent);
  }
  .nav.journey .route {
    stroke-dasharray: 2.4 2.6;
  }
  .nav.journey:hover .route {
    animation: walk 0.9s linear infinite;
  }
  .nav.journey:hover .spark {
    transform: scale(1.35) rotate(45deg);
  }
  @keyframes walk {
    to {
      stroke-dashoffset: -10;
    }
  }
  /* The options float on their island, apart from the places to go. */
  .right {
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-inline: var(--lead) 9px;
  }
  .wave2 {
    animation: speaker 1.6s ease-in-out infinite;
  }
  @keyframes speaker {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .wake,
    .glint,
    .wave2,
    .nav:hover .route {
      animation: none;
    }
    .wake {
      stroke-dashoffset: 0;
    }
    .nav,
    .nav:hover,
    .nav:hover .ico * {
      transform: none;
    }
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
  @media (max-width: 1799px) {
    .price {
      display: none;
    }
  }
  .skins,
  .langs {
    position: relative;
  }
  .lang-btn {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--text) 13%, transparent);
    background: color-mix(in srgb, var(--text) 4%, transparent);
    cursor: pointer;
  }
  .lang-btn[aria-expanded="true"] {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
  }
  .langmenu {
    width: 340px;
  }
  /* Every other language, two to a row under a line. */
  .langmenu .more {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid var(--line);
  }
  .skin-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding-block: 0;
    padding-inline: 8px 12px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--text) 13%, transparent);
    background: color-mix(in srgb, var(--text) 4%, transparent);
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
    inset-inline-end: 0;
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
    text-align: start;
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
  .dl {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding-inline: 12px;
  }
  .dl .caret {
    margin-inline-start: -2px;
    opacity: 0.8;
  }
  .dlmenu {
    position: relative;
  }
  .sysmenu {
    width: 190px;
  }
  .sysmenu .opt {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  /* Between the full menu and the folded one, the bar is tight: the look's name goes, so nothing is cut. */
  @media (max-width: 1360px) {
    .skin-name {
      display: none;
    }
  }
  /* Where every word is shown but the room runs short, the journal gives its place: it is in the footer, and in the menu. */
  @media (min-width: 1600px) and (max-width: 1799px) {
    .nav.journal {
      display: none;
    }
  }
  /*
   * Narrower, the places become a dock of signs: each word waits under its sign, in its own type,
   * and shows when the pointer or the keyboard comes to it. The journey keeps its words while it can.
   */
  @media (min-width: 1081px) and (max-width: 1599px) {
    .links {
      gap: 5px;
    }
    .links .nav:not(.journey) {
      width: 40px;
      padding: 0;
      justify-content: center;
    }
    .links .nav:not(.journey) .lbl {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      translate: -50% -4px;
      padding: 7px 10px;
      border-radius: 8px;
      background: var(--raised, var(--bg));
      border: 1px solid var(--line);
      box-shadow: 0 10px 24px rgb(0 0 0 / 0.4);
      color: var(--text);
      opacity: 0;
      pointer-events: none;
      transition:
        opacity 0.18s,
        translate 0.22s cubic-bezier(0.3, 0.7, 0.3, 1.3);
    }
    .links .nav:not(.journey):hover .lbl,
    .links .nav:not(.journey):focus-visible .lbl {
      opacity: 1;
      translate: -50% 0;
    }
    .nav.pad::after {
      top: 4px;
      inset-inline-end: 4px;
    }
  }
  /* Narrower still, the journey is its star alone, its name in its title. */
  @media (min-width: 1081px) and (max-width: 1240px) {
    .nav.journey .jl {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  }
  /* Folded, the places open as a card of plates under the bar, two to a row. */
  @media (max-width: 1080px) {
    .links {
      display: none;
      position: fixed;
      top: calc(var(--bar) + 14px);
      inset-inline: 10px;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 14px;
      border-radius: 18px 18px 22px 22px;
      background: color-mix(in srgb, var(--bg) 95%, transparent);
      backdrop-filter: blur(14px);
      border: 1px solid var(--line);
      box-shadow: 0 24px 60px rgb(0 0 0 / 0.5);
    }
    .links.open {
      display: grid;
    }
    .links .nav {
      height: 48px;
      padding-inline: 14px;
      justify-content: flex-start;
    }
    .links .nav .ico {
      width: 20px;
      height: 20px;
    }
    .burger {
      display: inline-flex;
    }
    .price {
      display: none;
    }
  }
  .sound-row {
    display: none;
  }
  @media (max-width: 640px) {
    .bar {
      --sweep: 34px;
      --lead: 18px;
    }
    .wing {
      gap: 10px;
    }
    .skin-name,
    .account:not(.signed),
    .beta {
      display: none;
    }
    .dl {
      gap: 4px;
      padding-inline: 9px;
    }
    .inner {
      gap: 10px;
    }
    .right {
      gap: 6px;
    }
    .sound-btn,
    .lang-btn {
      width: 32px;
      height: 32px;
    }
    .skin-btn {
      height: 32px;
      padding: 0 6px;
    }
    .burger {
      width: 34px;
    }
    /* A menu from the bar opens across the screen under it, whichever side its button is on. */
    .pop {
      position: fixed;
      top: calc(var(--bar) + 6px);
      inset-inline: 10px;
      width: auto;
    }
  }
  /* A narrow phone: the sound switch moves into the folded menu, the avatar shrinks a little. */
  @media (max-width: 420px) {
    /* The shapes draw in less room; the download key keeps its arrow, its system is named in its label and its menu. */
    .bar {
      --sweep: 24px;
      --lead: 13px;
    }
    .inner {
      gap: 6px;
    }
    .right {
      gap: 4px;
      padding-inline-end: 5px;
    }
    .dl :global(.os-icon) {
      display: none;
    }
    .sound-btn {
      display: none;
    }
    .links .sound-row {
      display: inline-flex;
    }
    .links {
      grid-template-columns: 1fr;
    }
    .account img,
    .account .initial {
      width: 24px;
      height: 24px;
    }
  }
</style>
