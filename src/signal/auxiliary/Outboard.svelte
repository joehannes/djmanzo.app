<!--
  Outboard, the marketplace (§139, ADR-0012): what makers have shared for
  djmanzo, free; an item's page with its versions, ratings and maker; the
  way in for djmanzo (its index); and, for a maker, the upload and their own
  page. Nothing is offered that djmanzo cannot install: other kinds are
  shown as coming.
-->
<script lang="ts">
  import { api, ApiError } from "../../lib/api";
  import { session } from "../../lib/session.svelte";
  import Join from "./Join.svelte";
  import Preview from "./Preview.svelte";
  import Report from "./Report.svelte";
  import { ago, type Standing } from "./routes";
  import { i18n } from "../../v4/i18n.svelte";
  import { LANG_INFO } from "../../v4/i18n/strings";
  import { OUTBOARD } from "../../v4/i18n/outboard";
  import { count } from "../../v4/i18n/talkback";
  import { fill } from "../../v4/i18n/sections";

  const w = $derived(OUTBOARD[i18n.lang]);
  /** The byline either side of the maker's name. */
  const by = $derived(w.by.split("{author}"));
  const when = (ms: number) => ago(ms, Date.now(), LANG_INFO[i18n.lang].tag);
  /** Text for an html phrase's blank. */
  const esc = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  let { rest }: { rest: string[] } = $props();

  interface Card {
    id: string;
    kind: string;
    name: string;
    author: string;
    owner: string;
    licence: string;
    description: string;
    version: string | null;
    fingerprint: string;
    preview: Record<string, unknown>;
    rating: { mean: number | null; score: number; count: number };
    downloads: number;
  }
  interface Item extends Card {
    status: string;
    reason: string | null;
    versions: { version: string; size: number; sha256: string; changelog: string; status: string; reason: string | null; created: number }[];
    reviews: { uid: string; stars: number; review: string; created: number; downloaded: number }[];
    mine: { stars: number; review: string } | null;
    downloaded: boolean;
    maker: { name: string; about: string; links: { url: string; platform: string }[] } | null;
  }

  let info = $state<{ kinds: { kind: string; name: string; what: string }[]; coming: { name: string; what: string }[]; standing: Standing } | null>(null);
  let items = $state<Card[] | null>(null);
  let kind = $state("");
  let q = $state("");
  let item = $state<Item | null>(null);
  let error = $state<string | null>(null);
  const indexUrl = $derived(`${location.origin}/api/outboard/packs.json`);

  async function load() {
    try {
      info = await api("/api/outboard");
      items = await api(`/api/outboard/items?kind=${encodeURIComponent(kind)}&q=${encodeURIComponent(q)}`);
      error = null;
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function open(id: string) {
    item = null;
    try {
      item = await api(`/api/outboard/items/${encodeURIComponent(id)}`);
      stars = item!.mine?.stars ?? 0;
      review = item!.mine?.review ?? "";
    } catch (e) {
      error = (e as Error).message;
    }
  }

  $effect(() => {
    void load();
  });
  let maker = $state<{ name: string | null; about: string; links: { url: string; platform: string }[]; items: Card[] } | null>(null);
  $effect(() => {
    maker = null;
    if (rest[0] === "maker" && rest[1]) void api(`/api/outboard/makers/${encodeURIComponent(rest[1])}`).then((m) => (maker = m)).catch((e) => (error = (e as Error).message));
    else if (rest[0]) void open(rest[0]);
    else item = null;
  });

  // --- Rating
  let stars = $state(0);
  let review = $state("");
  let rated = $state<string | null>(null);
  async function rate() {
    if (!item || !stars) return;
    try {
      item = await api(`/api/outboard/items/${item.id}/rating`, { method: "POST", json: { stars, review } });
      rated = w.rated;
    } catch (e) {
      rated = (e as Error).message;
    }
  }

  // --- Upload
  let file = $state<File | null>(null);
  let changelog = $state("");
  let uploading = $state(false);
  let uploaded = $state<string | null>(null);
  async function upload() {
    if (!file) return;
    uploading = true;
    uploaded = null;
    try {
      const r = await api<{ id: string; version: string }>(`/api/outboard/upload?changelog=${encodeURIComponent(changelog)}`, {
        method: "POST",
        body: await file.arrayBuffer(),
        headers: { "content-type": "application/zip" },
      });
      uploaded = fill(w.uploaded, { v: r.version });
      file = null;
      changelog = "";
    } catch (e) {
      uploaded = e instanceof ApiError ? e.message : w.notArrived;
    } finally {
      uploading = false;
    }
  }

  // --- A maker's own page
  let about = $state("");
  let links = $state("");
  let saved = $state<string | null>(null);
  async function saveProfile() {
    try {
      const p = await api<{ links: { url: string }[] }>("/api/outboard/profile", {
        method: "PUT",
        json: { about, links: links.split(/\s+/).filter(Boolean) },
      });
      saved = count(w.savedLinks, p.links.length);
    } catch (e) {
      saved = (e as Error).message;
    }
  }

  /** The support links signed into a pack's manifest (§137), as its listing keeps them. */
  const signedSupport = (preview: Record<string, unknown>) => (Array.isArray(preview.support) ? preview.support : []) as { kind: string; url: string }[];
  const SUPPORT_NAME: Record<string, string> = { patreon: "Patreon", kofi: "Ko-fi", buymeacoffee: "Buy Me a Coffee", github: "GitHub Sponsors", paypal: "PayPal", liberapay: "Liberapay", other: "" };
  const kindName = (k: string) => (w.kind as Record<string, string>)[k] ?? k;
  const supportName = (k: string) => SUPPORT_NAME[k] || w.elsewhere;
  const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`;
  const meanText = (r: Card["rating"]) => (r.count ? `${r.mean!.toFixed(1)} ★ (${r.count})` : w.notRated);
</script>

{#if error}<p class="note" role="alert">{error}</p>{/if}

{#if rest[0] === "maker"}
  <p><a class="link" href="/outboard">{w.backAll}</a></p>
  {#if maker}
    <section data-maker>
      <h2>{maker.name ?? w.aMaker}</h2>
      {#if maker.about}<p>{maker.about}</p>{/if}
      {#if maker.links.length}
        <p class="support">{w.supportThem} {#each maker.links as l (l.url)}<a class="link" href={l.url} rel="noopener noreferrer" target="_blank">{l.platform}</a>{" "}{/each}</p>
      {/if}
      <div class="grid">
        {#each maker.items as c (c.id)}
          <a class="card" href={`/outboard/${c.id}`}><Preview kind={c.kind} preview={c.preview} /><b>{c.name}</b><span class="note">{meanText(c.rating)}</span></a>
        {:else}
          <p class="note">{w.nothingListed}</p>
        {/each}
      </div>
    </section>
  {/if}
{:else if rest[0]}
  <p><a class="link" href="/outboard">{w.backAll}</a></p>
  {#if !item}
    <p class="note">…</p>
  {:else}
    <article class="item" data-item={item.id}>
      <div class="cols">
        <Preview kind={item.kind} preview={item.preview} big />
        <div>
          <p class="kind">{kindName(item.kind)}{item.version ? fill(w.version, { v: item.version }) : ""}</p>
          <h2>{item.name}</h2>
          <p>{by[0]}<a class="link" href={`/outboard/maker/${item.owner}`}>{item.author}</a>{by[1] ?? ""} · {item.licence}</p>
          {#if item.description}<p>{item.description}</p>{/if}
          {#if item.status !== "listed"}
            <p class="note" data-status>{item.status === "pending" ? w.pending : fill(w.removedReason, { reason: item.reason ?? "" })}</p>
          {/if}
          <p class="rating">{meanText(item.rating)} · {fill(w.downloaded, { n: item.downloads })}</p>
          <p class="note">{@html fill(w.installs, { key: `<code>${esc(item.fingerprint)}</code>` })}</p>
          {#if item.kind === "keys"}
            <p class="note" data-wear>{@html fill(w.wear, { made: item.preview.edition ? fill(w.madeFor, { edition: esc(String(item.preview.edition)) }) : "" })}</p>
          {/if}
          {#if signedSupport(item.preview).length}
            <p class="support" data-signed-support>{w.thank}
              {#each signedSupport(item.preview) as l (l.url)}<a class="link" href={l.url} rel="noopener noreferrer" target="_blank">{supportName(l.kind)}</a>{" "}{/each}
            </p>
          {/if}
          {#each item.versions.filter((v) => v.status === "listed").slice(0, 1) as v (v.version)}
            <a class="go" href={`/api/outboard/items/${item.id}/v/${encodeURIComponent(v.version)}.djpack`} download data-download>{fill(w.download, { name: item.name, version: v.version, size: kb(v.size) })}</a>
          {/each}
          {#if item.maker?.links.length}
            <p class="support">{fill(w.supportName, { name: item.maker.name ?? w.aMaker })}
              {#each item.maker.links as l (l.url)}<a class="link" href={l.url} rel="noopener noreferrer" target="_blank">{l.platform}</a>{" "}{/each}
            </p>
          {/if}
        </div>
      </div>

      <h3>{w.versions}</h3>
      <ul class="versions">
        {#each item.versions as v (v.version)}
          <li>
            <b>{v.version}</b> · {when(v.created)}{v.status !== "listed" ? ` · ${v.status}` : ""}
            {#if v.changelog}<br /><span>{v.changelog}</span>{/if}
            {#if v.reason}<br /><span class="note">{v.reason}</span>{/if}
          </li>
        {/each}
      </ul>

      <h3>{w.ratings}</h3>
      {#if item.status === "listed" && info?.standing.vouched && info.standing.uid !== item.owner && !info.standing.closed}
        <form class="rate" onsubmit={(e) => { e.preventDefault(); void rate(); }} data-rate>
          <div class="stars" role="radiogroup" aria-label={w.yourRating}>
            {#each [1, 2, 3, 4, 5] as n (n)}
              <button type="button" role="radio" aria-checked={stars === n} aria-label={count(w.stars, n)} class:on={stars >= n} onclick={() => (stars = n)}>★</button>
            {/each}
          </div>
          <textarea bind:value={review} maxlength="1000" placeholder={w.reviewPlaceholder} aria-label={w.reviewAria}></textarea>
          <button class="go" disabled={!stars}>{w.rate}</button>
          {#if rated}<p class="note" role="status">{rated}</p>{/if}
        </form>
      {:else if info && info.standing.uid !== item.owner}
        <Join standing={info.standing} doing="rate" />
      {/if}
      <ul class="reviews">
        {#each item.reviews as r (r.uid)}
          <li><b>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</b>{r.downloaded ? w.reviewDownloaded : ""} · {when(r.created)}{#if r.review}<br />{r.review}{/if}</li>
        {:else}
          <li class="note">{w.noRatings}</li>
        {/each}
      </ul>
      <p class="acts-row"><a class="link" href="/talkback/c/outboard">{w.talk}</a> <Report kind="item" target={item.id} standing={info?.standing ?? null} /></p>
    </article>
  {/if}
{:else}
  <section class="install">
    <h2>{w.inDjmanzo}</h2>
    <p>{@html w.howTo}</p>
    <code class="address" data-index>{indexUrl}</code>
  </section>

  <div class="filters">
    <div class="chips" role="radiogroup" aria-label={w.kindAria}>
      <button role="radio" aria-checked={kind === ""} class:on={kind === ""} onclick={() => { kind = ""; void load(); }}>{w.everything}</button>
      {#each info?.kinds ?? [] as k (k.kind)}
        <button role="radio" aria-checked={kind === k.kind} class:on={kind === k.kind} onclick={() => { kind = k.kind; void load(); }}>{(w.kinds as Record<string, string>)[k.kind] ?? k.name}</button>
      {/each}
    </div>
    <form onsubmit={(e) => { e.preventDefault(); void load(); }}>
      <input type="search" bind:value={q} placeholder={w.find} aria-label={w.findAria} />
    </form>
  </div>

  <div class="grid" data-items>
    {#each items ?? [] as c (c.id)}
      <a class="card" href={`/outboard/${c.id}`} data-card={c.id}>
        <Preview kind={c.kind} preview={c.preview} />
        <b>{c.name}</b>
        <span>{fill(w.byAuthor, { kind: kindName(c.kind), author: c.author })}</span>
        <span class="note">{meanText(c.rating)} · {fill(w.downloaded, { n: c.downloads })}</span>
      </a>
    {:else}
      <p class="note">{items ? w.empty : "…"}</p>
    {/each}
  </div>

  <section class="share">
    <h2>{w.share}</h2>
    <p>{@html w.shareText}</p>
    {#if info}
      {#if info.standing.closed}
        <Join standing={info.standing} />
      {:else if !info.standing.uploads}
        <p class="note" data-uploads-closed>{w.uploadsClosed}</p>
      {:else if !info.standing.vouched}
        <Join standing={info.standing} doing="upload" />
      {:else}
        <form class="upload" onsubmit={(e) => { e.preventDefault(); void upload(); }} data-upload>
          <input type="file" accept=".djpack,application/zip" aria-label={w.fileAria} onchange={(e) => (file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null)} />
          <input type="text" bind:value={changelog} maxlength="1200" placeholder={w.changelog} aria-label={w.changelogAria} />
          <button class="go" disabled={!file || uploading}>{uploading ? w.checking : w.upload}</button>
        </form>
        {#if uploaded}<p class="note" role="status">{uploaded}</p>{/if}
      {/if}
      {#if info.standing.vouched && !info.standing.closed}
        <details class="mine">
          <summary>{w.makerPage}</summary>
          <form onsubmit={(e) => { e.preventDefault(); void saveProfile(); }}>
            <textarea bind:value={about} maxlength="400" placeholder={w.aboutPlaceholder} aria-label={w.aboutAria}></textarea>
            <input type="text" bind:value={links} placeholder={w.linksPlaceholder} aria-label={w.linksAria} />
            <button class="go">{w.save}</button>
            {#if saved}<p class="note" role="status">{saved}</p>{/if}
          </form>
          <p class="note">{w.official}</p>
        </details>
      {/if}
    {/if}
  </section>

  <section class="coming">
    <h2>{w.coming}</h2>
    <p class="note">{w.comingNote}</p>
    <ul>
      {#each info?.coming ?? [] as k (k.name)}{@const t = w.comingKinds[k.name] ?? [k.name, k.what]}<li><b>{t[0]}</b> — {t[1]}</li>{/each}
    </ul>
  </section>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
    margin: 14px 0 24px;
  }
  .card {
    display: grid;
    gap: 4px;
    color: inherit;
    text-decoration: none;
    padding: 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--ink) 6%, transparent);
  }
  .card:hover,
  .card:focus-visible {
    background: color-mix(in srgb, var(--ink) 12%, transparent);
  }
  .card span {
    font-size: 13px;
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chips button,
  .stars button {
    font: inherit;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
  }
  .chips .on {
    background: var(--glow);
    color: var(--night);
    border-color: var(--glow);
  }
  .stars button {
    border: 0;
    font-size: 26px;
    padding: 0 2px;
    opacity: 0.4;
  }
  .stars .on {
    opacity: 1;
    color: var(--glow);
  }
  .cols {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .cols {
      grid-template-columns: 1fr;
    }
  }
  .kind {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 12px;
    opacity: 0.75;
    margin: 0;
  }
  .rate,
  .upload,
  .mine form {
    display: grid;
    gap: 8px;
    max-width: 36rem;
  }
  .address {
    display: block;
    padding: 10px 12px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--ink) 10%, transparent);
    overflow-wrap: anywhere;
    user-select: all;
  }
  .versions,
  .reviews,
  .coming ul {
    padding-left: 18px;
    display: grid;
    gap: 6px;
  }
  .support {
    margin-top: 12px;
  }
</style>
