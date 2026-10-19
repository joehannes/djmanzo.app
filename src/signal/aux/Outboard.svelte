<!--
  Outboard, the marketplace (§134, ADR-0012): what makers have shared for
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
      rated = "Thank you: your rating is in.";
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
      uploaded = `Uploaded: version ${r.version} waits for the crew, who list it or tell you why not.`;
      file = null;
      changelog = "";
    } catch (e) {
      uploaded = e instanceof ApiError ? e.message : "The upload did not arrive.";
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
      saved = `Saved, with ${p.links.length} donation link${p.links.length === 1 ? "" : "s"}.`;
    } catch (e) {
      saved = (e as Error).message;
    }
  }

  const KIND_NAME: Record<string, string> = { theme: "Theme", skin: "Skin", visuals: "Visuals" };
  const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`;
  const meanText = (r: Card["rating"]) => (r.count ? `${r.mean!.toFixed(1)} ★ (${r.count})` : "Not rated yet");
</script>

{#if error}<p class="note" role="alert">{error}</p>{/if}

{#if rest[0] === "maker"}
  <p><a class="link" href="/outboard">← Everything in Outboard</a></p>
  {#if maker}
    <section data-maker>
      <h2>{maker.name ?? "A maker"}</h2>
      {#if maker.about}<p>{maker.about}</p>{/if}
      {#if maker.links.length}
        <p class="support">Support them: {#each maker.links as l (l.url)}<a class="link" href={l.url} rel="noopener noreferrer" target="_blank">{l.platform}</a>{" "}{/each}</p>
      {/if}
      <div class="grid">
        {#each maker.items as c (c.id)}
          <a class="card" href={`/outboard/${c.id}`}><Preview kind={c.kind} preview={c.preview} /><b>{c.name}</b><span class="note">{meanText(c.rating)}</span></a>
        {:else}
          <p class="note">Nothing listed yet.</p>
        {/each}
      </div>
    </section>
  {/if}
{:else if rest[0]}
  <p><a class="link" href="/outboard">← Everything in Outboard</a></p>
  {#if !item}
    <p class="note">…</p>
  {:else}
    <article class="item" data-item={item.id}>
      <div class="cols">
        <Preview kind={item.kind} preview={item.preview} big />
        <div>
          <p class="kind">{KIND_NAME[item.kind]}{item.version ? ` · version ${item.version}` : ""}</p>
          <h2>{item.name}</h2>
          <p>by <a class="link" href={`/outboard/maker/${item.owner}`}>{item.author}</a> · {item.licence}</p>
          {#if item.description}<p>{item.description}</p>{/if}
          {#if item.status !== "listed"}
            <p class="note" data-status>{item.status === "pending" ? "Waiting for the crew: only you see it." : `Removed: ${item.reason}`}</p>
          {/if}
          <p class="rating">{meanText(item.rating)} · {item.downloads} downloaded</p>
          <p class="note">Installs in every edition of djmanzo. Signed with the key <code>{item.fingerprint}</code>: djmanzo shows the same before it installs.</p>
          {#each item.versions.filter((v) => v.status === "listed").slice(0, 1) as v (v.version)}
            <a class="go" href={`/api/outboard/items/${item.id}/v/${encodeURIComponent(v.version)}.djpack`} download data-download>Download {item.name} {v.version} ({kb(v.size)})</a>
          {/each}
          {#if item.maker?.links.length}
            <p class="support">Support {item.maker.name}:
              {#each item.maker.links as l (l.url)}<a class="link" href={l.url} rel="noopener noreferrer" target="_blank">{l.platform}</a>{" "}{/each}
            </p>
          {/if}
        </div>
      </div>

      <h3>Versions</h3>
      <ul class="versions">
        {#each item.versions as v (v.version)}
          <li>
            <b>{v.version}</b> · {ago(v.created)}{v.status !== "listed" ? ` · ${v.status}` : ""}
            {#if v.changelog}<br /><span>{v.changelog}</span>{/if}
            {#if v.reason}<br /><span class="note">{v.reason}</span>{/if}
          </li>
        {/each}
      </ul>

      <h3>Ratings</h3>
      {#if item.status === "listed" && info?.standing.vouched && info.standing.uid !== item.owner && !info.standing.closed}
        <form class="rate" onsubmit={(e) => { e.preventDefault(); void rate(); }} data-rate>
          <div class="stars" role="radiogroup" aria-label="Your rating">
            {#each [1, 2, 3, 4, 5] as n (n)}
              <button type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} class:on={stars >= n} onclick={() => (stars = n)}>★</button>
            {/each}
          </div>
          <textarea bind:value={review} maxlength="1000" placeholder="What is it like in a real room? (optional)" aria-label="Your review"></textarea>
          <button class="go" disabled={!stars}>Rate it</button>
          {#if rated}<p class="note" role="status">{rated}</p>{/if}
        </form>
      {:else if info && info.standing.uid !== item.owner}
        <Join standing={info.standing} doing="rate it" />
      {/if}
      <ul class="reviews">
        {#each item.reviews as r (r.uid)}
          <li><b>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</b>{r.downloaded ? " · downloaded" : ""} · {ago(r.created)}{#if r.review}<br />{r.review}{/if}</li>
        {:else}
          <li class="note">No ratings yet.</li>
        {/each}
      </ul>
      <p class="acts-row"><a class="link" href="/talkback/c/outboard">Talk about it in Talkback</a> <Report kind="item" target={item.id} standing={info?.standing ?? null} /></p>
    </article>
  {/if}
{:else}
  <section class="install">
    <h2>In djmanzo</h2>
    <p>Settings → From packs → <b>Browse packs…</b> → paste this address and press <b>Add an index</b>. djmanzo checks every pack again before it installs one, and shows you its maker's key.</p>
    <code class="address" data-index>{indexUrl}</code>
  </section>

  <div class="filters">
    <div class="chips" role="radiogroup" aria-label="Kind">
      <button role="radio" aria-checked={kind === ""} class:on={kind === ""} onclick={() => { kind = ""; void load(); }}>Everything</button>
      {#each info?.kinds ?? [] as k (k.kind)}
        <button role="radio" aria-checked={kind === k.kind} class:on={kind === k.kind} onclick={() => { kind = k.kind; void load(); }}>{k.name}</button>
      {/each}
    </div>
    <form onsubmit={(e) => { e.preventDefault(); void load(); }}>
      <input type="search" bind:value={q} placeholder="Find by name or maker" aria-label="Find in Outboard" />
    </form>
  </div>

  <div class="grid" data-items>
    {#each items ?? [] as c (c.id)}
      <a class="card" href={`/outboard/${c.id}`} data-card={c.id}>
        <Preview kind={c.kind} preview={c.preview} />
        <b>{c.name}</b>
        <span>{KIND_NAME[c.kind]} · by {c.author}</span>
        <span class="note">{meanText(c.rating)} · {c.downloads} downloaded</span>
      </a>
    {:else}
      <p class="note">{items ? "Nothing listed here yet. The first packs arrive with the first makers." : "…"}</p>
    {/each}
  </div>

  <section class="share">
    <h2>Share yours</h2>
    <p>Make a pack in djmanzo — the look studio for themes and skins, Settings → From packs for visuals — and upload the <code>.djpack</code> it saves. It is checked as djmanzo checks one, then the crew lists it or tells you why not. Packs are free; your page may link to your own donation page.</p>
    {#if info}
      {#if info.standing.closed}
        <Join standing={info.standing} />
      {:else if !info.standing.uploads}
        <p class="note" data-uploads-closed>Uploads open once R2 storage is enabled on this site.</p>
      {:else if !info.standing.vouched}
        <Join standing={info.standing} doing="upload" />
      {:else}
        <form class="upload" onsubmit={(e) => { e.preventDefault(); void upload(); }} data-upload>
          <input type="file" accept=".djpack,application/zip" aria-label="Your .djpack" onchange={(e) => (file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null)} />
          <input type="text" bind:value={changelog} maxlength="1200" placeholder="What is new in this version (optional)" aria-label="What is new" />
          <button class="go" disabled={!file || uploading}>{uploading ? "Checking…" : "Upload"}</button>
        </form>
        {#if uploaded}<p class="note" role="status">{uploaded}</p>{/if}
      {/if}
      {#if info.standing.vouched && !info.standing.closed}
        <details class="mine">
          <summary>Your maker's page</summary>
          <form onsubmit={(e) => { e.preventDefault(); void saveProfile(); }}>
            <textarea bind:value={about} maxlength="400" placeholder="A line about you and what you make" aria-label="About you"></textarea>
            <input type="text" bind:value={links} placeholder="Your donation pages, space between: Ko-fi, Liberapay, GitHub Sponsors, Buy Me a Coffee, Open Collective, Patreon, PayPal.me" aria-label="Your donation pages" />
            <button class="go">Save</button>
            {#if saved}<p class="note" role="status">{saved}</p>{/if}
          </form>
          <p class="note">Only those official platforms: djmanzo handles no money and takes nothing.</p>
        </details>
      {/if}
    {/if}
  </section>

  <section class="coming">
    <h2>Coming</h2>
    <p class="note">Asked for, and not yet something djmanzo can install — so not offered yet.</p>
    <ul>
      {#each info?.coming ?? [] as k (k.name)}<li><b>{k.name}</b> — {k.what}</li>{/each}
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
