<!--
  Feature requests, on this site: what people want djmanzo to do next, one
  vote an account (or a visitor's address), and each request's stamp — an
  idea, considering, planned, being built, shipped, or not planned and why.
  Laid out the way request boards are read (Canny, Featurebase, GitHub's
  own): the vote count in a box on the left, the status on the right, most
  wanted first or newest first, and a filter by status. The board starts
  with what is honestly on the roadmap, so it is plain from the first look
  that requests do turn into features.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api, post } from "../../lib/api";
  import { session } from "../../lib/session.svelte";
  import { profile } from "../../lib/profile.svelte";
  import { animate } from "../motion";
  import { shared } from "../region.svelte";
  import { href } from "../router";
  import { LANG_INFO, i18n } from "../i18n.svelte";
  import { PAGES } from "../i18n/pages";

  /** The page's words (`pw`: each request is `w` below). */
  const pw = $derived(PAGES[i18n.lang].wishes);

  interface WishRow {
    id: string;
    title: string;
    status: string;
    votes: number;
    createdAt: number;
    author: string;
    tag: string | null;
    note: string | null;
  }

  const TONE: Record<string, string> = { shipped: "var(--accent-2)", building: "#b48cff", planned: "#62a8ff", considering: "var(--accent)", idea: "var(--dim)", "not-planned": "#ff7a7a" };
  const STATUS = $derived(Object.fromEntries(Object.entries(TONE).map(([id, tone]) => [id, { tone, ...pw.status[id as keyof typeof pw.status] }])) as Record<string, { label: string; tone: string; about: string }>);
  const ORDER = ["all", "shipped", "building", "planned", "considering", "idea", "not-planned"];

  let root: HTMLElement;
  let wishes = $state<WishRow[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let filter = $state("all");
  let sort = $state<"top" | "new">("top");
  let query = $state("");
  let open = $state<string | null>(null);
  let detail = $state<Record<string, string>>({});
  let voted = $state<Set<string>>(new Set());
  let title = $state("");
  let body = $state("");
  let author = $state(profile.p.name);
  let posted = $state<string | null>(null);

  async function load() {
    loading = true;
    try {
      wishes = await api("/api/wishes");
      // The board is seeded on its first visit; ask once more if it came back empty.
      if (!wishes.length) {
        await new Promise((r) => setTimeout(r, 1200));
        wishes = await api("/api/wishes");
      }
      error = null;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  const shown = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const list = wishes.filter((w) => (filter === "all" || w.status === filter) && (!q || w.title.toLowerCase().includes(q)));
    return sort === "top" ? list.toSorted((a, b) => b.votes - a.votes || b.createdAt - a.createdAt) : list.toSorted((a, b) => b.createdAt - a.createdAt);
  });
  const count = (s: string) => (s === "all" ? wishes.length : wishes.filter((w) => w.status === s).length);

  async function vote(w: WishRow) {
    try {
      const r = await post(`/api/wishes/${w.id}/vote`);
      w.votes = r.votes;
      const v = new Set(voted);
      if (r.voted) v.add(w.id);
      else v.delete(w.id);
      voted = v;
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function expand(w: WishRow) {
    open = open === w.id ? null : w.id;
    if (open && detail[w.id] === undefined) {
      try {
        detail[w.id] = ((await api(`/api/wishes/${w.id}`)) as { body: string }).body ?? "";
      } catch {
        detail[w.id] = "";
      }
    }
  }

  async function ask(e: SubmitEvent) {
    e.preventDefault();
    posted = null;
    try {
      const w = await post("/api/wishes", { title, body, author, tag: profile.genre?.id });
      wishes = [{ ...w, note: null }, ...wishes];
      voted = new Set([...voted, w.id]);
      title = "";
      body = "";
      posted = pw.posted;
      sort = "new";
      filter = "all";
    } catch (err) {
      posted = (err as Error).message;
    }
  }

  const date = (t: number) => new Date(t).toLocaleDateString(LANG_INFO[i18n.lang].tag, { day: "numeric", month: "short", year: "numeric" });

  onMount(() => {
    void load();
    return animate(root);
  });
</script>

<div class="wishes" bind:this={root} data-wishes>
  <header class="head">
    <div class="bg" aria-hidden="true" style:background-image={`url(${shared("community")})`}></div>
    <div class="wrap">
      <p class="eyebrow">{pw.eyebrow}</p>
      <h1 class="h1">{@html pw.title}</h1>
      <p class="lead">{@html pw.lead.replace("{forum}", href("community"))}</p>
      <ul class="legend">
        {#each Object.entries(STATUS) as [id, s] (id)}
          <li style:--tone={s.tone}><span class="pip"></span><b>{s.label}</b><span class="dim">{s.about}</span></li>
        {/each}
      </ul>
    </div>
  </header>

  <div class="wrap layout">
    <section aria-label={pw.listAria}>
      <div class="tools">
        <input type="search" bind:value={query} placeholder={pw.search} aria-label={pw.search} />
        <div class="seg" role="radiogroup" aria-label={pw.orderAria}>
          <button role="radio" aria-checked={sort === "top"} onclick={() => (sort = "top")}>{pw.top}</button>
          <button role="radio" aria-checked={sort === "new"} onclick={() => (sort = "new")}>{pw.newest}</button>
        </div>
      </div>
      <div class="filters" role="radiogroup" aria-label={pw.statusAria}>
        {#each ORDER as f (f)}
          <button class="chip" role="radio" aria-checked={filter === f} class:on={filter === f} onclick={() => (filter = f)} data-status={f}>
            {f === "all" ? pw.all : STATUS[f].label}<span class="n mono">{count(f)}</span>
          </button>
        {/each}
      </div>

      {#if loading}
        <p class="dim">{pw.reading}</p>
      {:else if error}
        <p class="note" role="alert">{error}</p>
      {/if}

      <ol class="list">
        {#each shown as w (w.id)}
          {@const s = STATUS[w.status] ?? STATUS.idea}
          <li class="wish card" style:--tone={s.tone} data-wish>
            <button class="vote" class:on={voted.has(w.id)} aria-pressed={voted.has(w.id)} onclick={() => vote(w)} aria-label={pw.vote.replace("{title}", w.title).replace("{votes}", String(w.votes))}>
              <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true"><path d="M6 0l6 8H0z" fill="currentColor" /></svg>
              <b class="mono">{w.votes}</b>
            </button>
            <div class="main">
              <button class="title" onclick={() => expand(w)} aria-expanded={open === w.id}>{w.title}</button>
              {#if w.note}<p class="crew"><span class="mono">{pw.crew}</span> {w.note}</p>{/if}
              {#if open === w.id && detail[w.id]}<p class="body">{detail[w.id]}</p>{/if}
              <p class="meta dim">{w.author} · {date(w.createdAt)}{w.tag ? ` · ${w.tag}` : ""}</p>
            </div>
            <span class="stamp mono">{s.label}</span>
          </li>
        {:else}
          {#if !loading}<li class="dim">{pw.none}</li>{/if}
        {/each}
      </ol>
    </section>

    <aside class="card ask" aria-labelledby="ask-h">
      <h2 class="h3" id="ask-h">{pw.askTitle}</h2>
      <p class="dim small">{pw.askAbout}</p>
      <form onsubmit={ask}>
        <label class="field"><span>{pw.what}</span><input type="text" bind:value={title} maxlength="100" required placeholder={pw.whatPlaceholder} /></label>
        <label class="field"><span>{pw.more} <span class="dim">{pw.optional}</span></span><textarea bind:value={body} maxlength="1200" rows="4" placeholder={pw.morePlaceholder}></textarea></label>
        {#if !session.user}<label class="field"><span>{pw.name} <span class="dim">{pw.optional}</span></span><input type="text" bind:value={author} maxlength="40" /></label>{/if}
        <button class="btn primary small">{pw.post}</button>
        {#if posted}<p class="note small" role="status">{posted}</p>{/if}
      </form>
      <p class="dim small">{pw.public}</p>
    </aside>
  </div>
</div>

<style>
  .head {
    position: relative;
    padding: calc(var(--bar) + 64px) 0 36px;
    overflow: hidden;
    isolation: isolate;
  }
  .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-size: cover;
    background-position: center 30%;
    opacity: 0.32;
    mask-image: linear-gradient(180deg, black 10%, transparent 95%);
  }
  .lead :global(a) {
    color: var(--accent);
  }
  .legend {
    list-style: none;
    padding: 0;
    margin: 28px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 8px 18px;
    font-size: 14px;
  }
  .legend li {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 8px;
  }
  .legend .dim {
    grid-column: 2;
    font-size: 13px;
  }
  .pip {
    width: 9px;
    height: 9px;
    margin-top: 7px;
    border-radius: 50%;
    background: var(--tone);
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 28px;
    align-items: start;
    padding-bottom: 96px;
  }
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  .tools {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .tools input {
    flex: 1;
    min-width: 200px;
  }
  input,
  textarea {
    font: inherit;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
    min-width: 0;
  }
  .seg {
    display: inline-flex;
    border: 1px solid var(--line);
    border-radius: 9px;
    overflow: hidden;
  }
  .seg button {
    font: 500 14px/1 var(--body);
    padding: 0 14px;
    background: none;
    border: 0;
    color: var(--dim);
    cursor: pointer;
  }
  .seg button[aria-checked="true"] {
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--text);
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 14px 0 18px;
  }
  .n {
    font-size: 12px;
    opacity: 0.7;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }
  .wish {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 16px;
    align-items: start;
    padding: 14px 16px;
    border-left: 3px solid var(--tone);
  }
  .vote {
    display: grid;
    justify-items: center;
    gap: 4px;
    width: 52px;
    padding: 8px 0;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--dim);
    cursor: pointer;
  }
  .vote b {
    color: var(--text);
    font-size: 15px;
  }
  .vote.on {
    border-color: var(--accent);
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, var(--bg));
  }
  .title {
    font: 600 16px/1.35 var(--body);
    text-align: left;
    background: none;
    border: 0;
    padding: 0;
    color: var(--text);
    cursor: pointer;
  }
  .title:hover {
    color: var(--accent);
  }
  .crew,
  .body,
  .meta {
    margin: 6px 0 0;
    font-size: 14px;
  }
  .crew .mono {
    color: var(--tone);
    font-size: 12px;
  }
  .meta {
    font-size: 12px;
  }
  .stamp {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tone);
    border: 1px solid color-mix(in srgb, var(--tone) 50%, var(--line));
    border-radius: 6px;
    padding: 4px 8px;
    white-space: nowrap;
  }
  @media (max-width: 560px) {
    .wish {
      grid-template-columns: auto minmax(0, 1fr);
    }
    .stamp {
      grid-column: 2;
      justify-self: start;
    }
  }
  .ask {
    position: sticky;
    top: calc(var(--bar) + 16px);
    padding: 22px;
    display: grid;
    gap: 10px;
  }
  .ask form {
    display: grid;
    gap: 10px;
  }
  .field {
    display: grid;
    gap: 4px;
    font-size: 14px;
  }
  .small {
    font-size: 13px;
    margin: 0;
  }
  .note {
    padding: 10px 12px;
    border-radius: 9px;
    background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
  }
</style>
