<!--
  The shop: seven editions of one download, priced for where the visitor is,
  three ways to pay, a free week of any of them, and a free edition that
  needs no purchase at all. What every edition carries is a matrix, not a
  promise; what the others charge is a table with its sources. The checkout
  is the shop's own (`src/shop/Checkout.svelte`), so every way to pay the
  site already has works here.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { EDITIONS, MODULES, MODULE_TITLE, NAMED, money, type Edition, type Module, type Plan } from "../../../shared/catalog";
  import { BAND_NAME, band as bandOf, currencyFor, regional, type Band } from "../../../shared/regions";
  import { catalog } from "../../lib/catalog.svelte";
  import { session } from "../../lib/session.svelte";
  import { post } from "../../lib/api";
  import { countries, flag } from "../../lib/countries";
  import SignIn from "../SignIn.svelte";
  import Checkout from "../../shop/Checkout.svelte";
  import EditionMatrix from "../sections/EditionMatrix.svelte";
  import { animate, gsap, reduced } from "../motion";
  import { region, shared } from "../region.svelte";
  import { RELEASES } from "../download";

  type Bought = Exclude<Plan, "trial">;
  const ORDER: Edition[] = ["hobbyist", "autopilot", "karaoke", "apprentice", "pro", "full", "custom"];
  const FINDER: { label: string; edition: Edition }[] = [
    { label: "I play for fun", edition: "hobbyist" },
    { label: "I DJ for a living", edition: "pro" },
    { label: "I host karaoke", edition: "karaoke" },
    { label: "I'm learning", edition: "apprentice" },
    { label: "The music should run itself", edition: "autopilot" },
    { label: "I want everything", edition: "full" },
  ];
  const GROUPS: { name: string; modules: Module[] }[] = [
    { name: "Mixing", modules: ["four_decks", "stems", "dvs", "controllers", "plugins"] },
    { name: "Assistance and learning", modules: ["assistant", "autopilot", "teacher"] },
    { name: "The show", modules: ["video", "streaming", "crowd", "events", "replay", "sources"] },
    { name: "Karaoke", modules: ["karaoke"] },
  ];

  let root: HTMLElement;
  let plan = $state<Bought>("perpetual");
  let edition = $state<Edition>("pro");
  let modules = $state<Module[]>(["stems"]);
  let country = $state("US");
  let promo = $state("");
  let quote = $state<any>(null);
  let quoteError = $state<string | null>(null);
  let done = $state<any>(null);
  let trialMsg = $state<string | null>(null);
  let voucher = $state("");
  let voucherMsg = $state<string | null>(null);
  const list = countries();

  const c = $derived(catalog.data);
  const currency = $derived(currencyFor(country));
  const b = $derived(bandOf(country) as Band);
  const chosenModules = $derived(edition === "custom" ? modules : []);
  const PER: Record<Bought, string> = { perpetual: "once", monthly: "a month", yearly: "a year" };

  function price(e: Edition, p: Bought = plan): string {
    if (e === "hobbyist") return "Free";
    if (e === "custom") return money(regional(e, p, b, modules.length ? modules : ["four_decks"]), currency);
    return money(regional(e, p, b), currency);
  }

  /** What paying yearly saves against paying monthly for a year, for Pro DJ (all editions keep the same proportion). */
  const saving = $derived.by(() => {
    const m = regional("pro", "monthly", b) * 12;
    const y = regional("pro", "yearly", b);
    return m > 0 ? Math.round((1 - y / m) * 100) : 0;
  });

  function pick(e: Edition, go = true) {
    edition = e;
    if (go) document.getElementById("checkout")?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
    if (!reduced()) gsap.fromTo(`[data-edition="${e}"]`, { scale: 0.98 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  }

  const toggle = (m: Module) => (modules = modules.includes(m) ? modules.filter((x) => x !== m) : MODULES.filter((x) => x === m || modules.includes(x)));

  let timer: ReturnType<typeof setTimeout>;
  $effect(() => {
    const body = { edition, plan, country, promo: promo.trim() || null, modules: chosenModules };
    clearTimeout(timer);
    if (edition === "hobbyist") return;
    timer = setTimeout(async () => {
      try {
        quote = await post("/api/quote", body);
        quoteError = null;
      } catch (e) {
        quoteError = (e as Error).message;
      }
    }, 250);
  });

  async function trial() {
    trialMsg = null;
    try {
      done = await post("/api/trial", { edition: edition === "hobbyist" || edition === "custom" ? "full" : edition });
    } catch (e) {
      trialMsg = (e as Error).message;
    }
  }

  async function redeem() {
    voucherMsg = null;
    try {
      done = await post("/api/redeem", { code: voucher });
    } catch (e) {
      voucherMsg = (e as Error).message;
    }
  }

  const has = (e: Edition, m: Module) => !!c?.editions[e]?.modules.includes(m);
  const usd = (n?: number) => (n === undefined ? "—" : `$${n % 1 ? n.toFixed(2) : n}`);

  onMount(() => {
    void catalog.load().then(() => {
      const where = region.country ?? catalog.data?.visitor.country;
      if (where) country = where;
    });
    const q = new URLSearchParams(location.search);
    const want = q.get("edition") as Edition | null;
    if (want && EDITIONS.includes(want)) edition = want;
    // A discount voucher from `/redeem`: its line goes in the promo box, where the quote and every checkout read it.
    const v = q.get("voucher");
    if (v) promo = v;
    return animate(root);
  });
</script>

<div class="pricing" bind:this={root}>
  <header class="head">
    <div class="bg" aria-hidden="true" style:background-image={`url(${shared("download")})`}></div>
    <div class="wrap">
      <p class="eyebrow">Pricing</p>
      <h1 class="h1">One download.<br />Seven editions.</h1>
      <p class="lead">Every edition is the same application, unlocked by signing in. Start free with the Hobbyist edition, try any other for {c?.trialDays ?? 7} days, and pay only for what you use.</p>
      <div class="plans" role="radiogroup" aria-label="How to pay">
        {#each ["perpetual", "monthly", "yearly"] as const as p (p)}
          <button role="radio" aria-checked={plan === p} onclick={() => (plan = p)} data-plan={p}>
            {c?.plans[p].name ?? p}{#if p === "yearly" && saving > 0}<span class="save mono">−{saving} %</span>{/if}
          </button>
        {/each}
      </div>
      <p class="where mono" data-region-price>
        {flag(country)} Prices for {list.find((x) => x.code === country)?.name ?? country}{b > 1 ? ` — ${BAND_NAME[b]}, by the World Bank's income groups` : ""} · {currency}
      </p>
    </div>
  </header>

  <section class="wrap finder" aria-labelledby="finder-title">
    <h2 class="h3" id="finder-title">Which one is yours?</h2>
    <div class="chips" role="group" aria-label="What you will use it for">
      {#each FINDER as f (f.label)}
        <button class="chip" aria-pressed={edition === f.edition} onclick={() => pick(f.edition, false)} data-finder={f.edition}>{f.label}</button>
      {/each}
    </div>
  </section>

  <section class="wrap cards" aria-label="Editions">
    {#each ORDER as e (e)}
      {@const info = c?.editions[e]}
      <article class="ed card" class:chosen={edition === e} class:free={e === "hobbyist"} style:--c={info?.colour ?? "var(--accent)"} data-edition={e} data-reveal>
        <div class="top">
          <span class="dot"></span>
          <h3 class="h3">{info?.name ?? e}</h3>
          {#if edition === e}<span class="badge mono">Your pick</span>{/if}
        </div>
        <p class="tag">{info?.tagline ?? ""}</p>
        <p class="price"><b class="mono" data-price>{price(e)}</b>{#if e !== "hobbyist"}<span>{e === "custom" ? `from, ${PER[plan]}` : PER[plan]}</span>{:else}<span>for ever</span>{/if}</p>
        <p class="for">{info?.forWho ?? ""}</p>
        {#if e === "hobbyist"}
          <a class="btn ghost" href={RELEASES}>Download free</a>
        {:else}
          <button class="btn {edition === e ? 'primary' : 'ghost'}" onclick={() => pick(e)} data-choose={e}>{edition === e ? "Chosen — continue" : `Choose ${info?.name ?? e}`}</button>
        {/if}
      </article>
    {/each}
  </section>

  <section class="wrap matrix-wrap" aria-labelledby="matrix-title">
    <h2 class="h2" id="matrix-title" data-reveal>What each edition carries</h2>
    <p class="lead" data-reveal>Feature by feature, so you can see what you get — the free Hobbyist edition included. Every edition has the foundation: two decks, the mixer, the library, cues, loops and pads, the effects, the sampler, recording, the keyboard and a controller, the launcher and the mnemonic keys. What an edition lacks shows in djmanzo as a quiet card naming the edition that has it.</p>
    <div data-reveal><EditionMatrix chosen={edition} onpick={(e) => pick(e)} /></div>
  </section>

  <section class="wrap checkout" id="checkout" aria-labelledby="co-title">
    {#if done}
      <div class="done card" data-done>
        <p class="eyebrow">Done</p>
        <h2 class="h2">It's yours.</h2>
        <p class="lead">
          djmanzo {c?.editions[done.licence.edition as Edition]?.name ?? done.licence.edition}{done.licence.plan === "trial" ? ", free for seven days" : ""}{done.licence.demo ? " (a demo licence)" : ""}.
        </p>
        <ol class="steps">
          <li><a href={RELEASES}>Download djmanzo</a> for your computer.</li>
          <li>In djmanzo, open <b>Settings → Licence</b> and sign in with the same account. It fetches the licence by itself and keeps working offline.</li>
          <li>On a computer that cannot sign in, paste the licence line from <a href="/account">your account</a>.</li>
        </ol>
        <button class="btn ghost" onclick={() => (done = null)}>Back to the shop</button>
      </div>
    {:else}
      <div class="co-grid">
        <div class="summary card">
          <p class="eyebrow">Your edition</p>
          <h2 class="h2" id="co-title">djmanzo {c?.editions[edition]?.name ?? edition}</h2>
          <p class="dim">{c?.editions[edition]?.tagline}</p>

          {#if edition === "custom" && c}
            <h3 class="mono small-h">Modules</h3>
            <div class="mods">
              {#each c.modules as m (m.id)}
                <label class="mod"><input type="checkbox" checked={modules.includes(m.id)} onchange={() => toggle(m.id)} /> {m.title} <span class="mono dim">+{money(regional("custom", plan, b, [m.id]), currency)}</span></label>
              {/each}
            </div>
            {#if quote?.better}
              <p class="hint">{c.editions[quote.better as Edition].name} carries all of that for no more — <button class="linkish" onclick={() => (edition = quote.better)}>choose it instead</button>.</p>
            {/if}
          {/if}

          {#if edition === "hobbyist"}
            <p>The Hobbyist edition needs no purchase. <a href={RELEASES}>Download djmanzo</a> and it is yours.</p>
          {:else}
            <div class="row">
              <label class="field"><span class="mono">Country</span>
                <select bind:value={country} data-country>
                  {#each list as x (x.code)}<option value={x.code}>{flag(x.code)} {x.name}</option>{/each}
                </select>
              </label>
              <label class="field"><span class="mono">Promo code</span><input type="text" bind:value={promo} placeholder="Optional" autocomplete="off" spellcheck="false" /></label>
            </div>
            {#if quote?.promo}<p class="hint" role="status">{quote.promo.ok ? "✓ " : ""}{quote.promo.reason}</p>{/if}
            <p class="fine">A regional price needs a card issued in, and a billing address in, a country priced the same or lower; otherwise the checkout tells you the price you can show, and asks first. Students and teachers pay half with a school e-mail address — whichever is larger; discounts never stack.</p>

            <div class="ticket mono" aria-live="polite" data-ticket>
              {#if quote}
                <div><span>{c?.editions[edition]?.name}, {c?.plans[plan].name.toLowerCase()}</span><span>{#if quote.regional !== quote.base}<s>{money(quote.base, quote.currency)}</s> {/if}{money(quote.regional, quote.currency)}</span></div>
                {#if quote.upgrade}<div><span>Upgrade credit</span><span>− {money(quote.upgrade.credit, quote.currency)}</span></div>{/if}
                {#if quote.discount}<div><span>Promo {quote.promo.code}</span><span>− {money(quote.discount, quote.currency)}</span></div>{/if}
                <div class="total"><span>Total</span><span data-total>{money(quote.total, quote.currency)}</span></div>
              {:else if quoteError}
                <p>{quoteError}</p>
              {:else}
                <p>Working out the price…</p>
              {/if}
            </div>
          {/if}
        </div>

        <div class="pay card content">
          {#if edition !== "hobbyist"}
            <h3 class="h3">Pay</h3>
            {#if !session.user}
              <SignIn compact back={`/pricing${location.search}#checkout`} why="Sign in to buy or to try — the licence is tied to your account, and djmanzo picks it up from there." />
            {:else}
              <p class="dim">Signed in as <b>{session.user.name}</b>. The licence goes to this account.</p>
              {#if quote}
                <Checkout {edition} modules={chosenModules} {plan} {country} {promo} total={quote.total} display={money(quote.total, quote.currency)} ondone={(r) => (done = r)} />
              {/if}
            {/if}
          {/if}
          <div class="try">
            <h3 class="h3">Or try it first</h3>
            <p class="dim">{c?.trialDays ?? 7} days of {edition === "hobbyist" || edition === "custom" ? "the Full edition" : `the ${c?.editions[edition]?.name ?? edition} edition`}, free, once per account. Then djmanzo becomes the Hobbyist edition, and nothing you made is lost.</p>
            {#if session.user}
              <button class="btn ghost" onclick={trial} data-trial>Start the free trial</button>
              {#if trialMsg}<p class="notice">{trialMsg}</p>{/if}
            {:else}
              <p class="dim small">Sign in first, so the trial has somewhere to go.</p>
            {/if}
          </div>
          <details class="voucher">
            <summary>Have a voucher?</summary>
            {#if session.user}
              <div class="row"><input type="text" bind:value={voucher} placeholder="Voucher code" aria-label="Voucher code" /><button class="btn ghost" onclick={redeem}>Redeem</button></div>
              {#if voucherMsg}<p class="notice">{voucherMsg}</p>{/if}
            {:else}
              <p class="dim small">Sign in to redeem it.</p>
            {/if}
          </details>
        </div>
      </div>
    {/if}
  </section>

  <section class="wrap market" aria-labelledby="mk-title">
    <h2 class="h2" id="mk-title" data-reveal>What the others charge</h2>
    <p class="lead" data-reveal>Published prices, in US dollars, each linked to where it came from, so you can compare for yourself.</p>
    <div class="card table" data-reveal>
      <table>
        <thead><tr><th scope="col">Product</th><th scope="col">Once</th><th scope="col">A month</th><th scope="col">A year</th><th scope="col">Note</th></tr></thead>
        <tbody>
          {#each c?.market ?? [] as r (r.product)}
            <tr><th scope="row"><a href={r.source} rel="noopener noreferrer" target="_blank">{r.product}</a></th><td class="mono">{usd(r.perpetual)}</td><td class="mono">{usd(r.monthly)}</td><td class="mono">{usd(r.yearly)}</td><td class="dim">{r.note ?? ""}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>

<style>
  .pricing {
    padding-bottom: 80px;
  }
  .head {
    position: relative;
    padding: calc(var(--bar) + 72px) 0 48px;
    overflow: hidden;
    isolation: isolate;
  }
  .head .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-size: cover;
    background-position: center 60%;
    opacity: 0.35;
    mask-image: linear-gradient(180deg, black, transparent 90%);
  }
  .plans {
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    margin-top: 32px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: color-mix(in srgb, var(--surface) 80%, transparent);
  }
  .plans button {
    font: 600 14px/1 var(--body);
    padding: 11px 18px;
    border: 0;
    border-radius: 9px;
    background: none;
    color: var(--dim);
    cursor: pointer;
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .plans button[aria-checked="true"] {
    background: var(--accent);
    color: var(--on-accent);
  }
  .save {
    font-size: 11px;
    padding: 3px 6px;
    border-radius: 5px;
    background: color-mix(in srgb, var(--accent-2) 25%, transparent);
    color: var(--text);
  }
  .plans button[aria-checked="true"] .save {
    background: color-mix(in srgb, var(--on-accent) 18%, transparent);
    color: var(--on-accent);
  }
  .where {
    font-size: 12px;
    color: var(--dim);
    margin: 14px 0 0;
  }
  .finder {
    margin-top: 8px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 14px;
    margin-top: 28px;
  }
  .ed {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 22px;
    position: relative;
    transition:
      border-color 0.25s,
      box-shadow 0.25s,
      transform 0.25s;
  }
  .ed:hover {
    transform: translateY(-3px);
  }
  .ed.chosen {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 24px 60px -24px color-mix(in srgb, var(--accent) 55%, transparent);
  }
  .ed.free {
    background: linear-gradient(160deg, color-mix(in srgb, var(--accent-2) 10%, var(--surface)), var(--surface));
  }
  .top {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 12px var(--c);
  }
  .badge {
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    margin-left: auto;
  }
  .tag,
  .for {
    margin: 0;
    color: var(--dim);
    font-size: 14px;
  }
  .for {
    flex: 1;
  }
  .price {
    margin: 4px 0 0;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .price b {
    font-size: 30px;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  .price span {
    color: var(--dim);
    font-size: 13px;
  }
  .matrix-wrap,
  .checkout,
  .market {
    margin-top: clamp(72px, 9vw, 120px);
  }
  .table {
    margin-top: 28px;
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  thead th {
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 1;
  }
  th,
  td {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
  }
  tbody th {
    font-weight: 500;
  }
  .table a {
    color: var(--text);
  }
  .co-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 16px;
    align-items: start;
  }
  @media (max-width: 960px) {
    .co-grid {
      grid-template-columns: 1fr;
    }
  }
  .summary,
  .pay,
  .done {
    padding: 26px;
  }
  .small-h {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    font-weight: 500;
    margin: 22px 0 8px;
  }
  .mods {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 6px;
  }
  .mod {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
  }
  .mod span {
    margin-left: auto;
    font-size: 12px;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
  }
  .field {
    display: grid;
    gap: 6px;
    flex: 1 1 200px;
  }
  .field span {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dim);
  }
  select,
  input[type="text"] {
    font: inherit;
    padding: 11px 12px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
    min-width: 0;
  }
  .hint {
    color: var(--accent);
    font-size: 14px;
  }
  .linkish {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
  }
  .fine {
    font-size: 12px;
    color: var(--dim);
    margin: 14px 0 0;
  }
  .ticket {
    margin-top: 20px;
    border-top: 1px dashed var(--line);
    padding-top: 14px;
    font-size: 14px;
    display: grid;
    gap: 8px;
  }
  .ticket div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .ticket s {
    color: var(--dim);
  }
  .ticket .total {
    font-size: 20px;
    color: var(--text);
    border-top: 1px solid var(--line);
    padding-top: 10px;
  }
  .try {
    margin-top: 28px;
    padding-top: 22px;
    border-top: 1px solid var(--line);
  }
  .voucher {
    margin-top: 20px;
  }
  .voucher summary {
    cursor: pointer;
    color: var(--dim);
  }
  .small {
    font-size: 13px;
  }
  .steps {
    padding-left: 20px;
    color: var(--dim);
  }
  .steps a {
    color: var(--accent);
  }
</style>
