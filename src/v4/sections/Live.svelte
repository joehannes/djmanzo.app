<!--
  What the community is doing right now: the newest packs on the
  marketplace, the busiest threads in the forum, and what changed in the
  last releases — all read from the live site and GitHub, each with an
  honest empty state.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../lib/api";
  import { COMMUNITIES } from "../../../shared/talkback";
  import Preview from "../../signal/auxiliary/Preview.svelte";
  import { href } from "../router";
  import { shared } from "../region.svelte";
  import { LANG_INFO, i18n, t } from "../i18n.svelte";
  import { SECTIONS, fill } from "../i18n/sections";

  const w = $derived(SECTIONS[i18n.lang].live);

  interface Card {
    id: string;
    kind: string;
    name: string;
    author: string;
    preview: Record<string, unknown>;
    rating: { mean: number | null; count: number };
    downloads: number;
    updated: number;
  }
  interface Post {
    id: string;
    community: string;
    author: string;
    title: string;
    score: number;
    comments: number;
    created: number;
  }
  /** A version's notes (`/api/release-notes`, djmanzo's contracts/release-notes.json). */
  interface Note {
    version: string;
    date: string;
    built: boolean;
    title: Partial<Record<keyof typeof LANG_INFO, string>>;
    notes: Partial<Record<keyof typeof LANG_INFO, string[]>>;
  }

  let items = $state<Card[] | null>(null);
  let posts = $state<Post[] | null>(null);
  let releases = $state<Note[] | null>(null);
  const communityName = (id: string) => COMMUNITIES.find((c) => c.id === id)?.name ?? id;

  /** A version's title and first line, in the visitor's language where the notes have it. */
  const titleOf = (n: Note) => n.title[i18n.lang] ?? n.title.en ?? "";
  const gist = (n: Note) => (n.notes[i18n.lang] ?? n.notes.en ?? [])[0]?.slice(0, 200) ?? "";
  const day = (d: string) => {
    try {
      return new Intl.DateTimeFormat(LANG_INFO[i18n.lang].tag, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));
    } catch {
      return d;
    }
  };

  onMount(() => {
    api<Card[]>("/api/outboard/items").then((r) => (items = r.slice(0, 4)), () => (items = []));
    api<Post[]>("/api/talkback/posts?sort=hot").then((r) => (posts = r.slice(0, 5)), () => (posts = []));
    // A refusal's body is read too: one left unread holds the request open.
    fetch("/api/release-notes")
      .then(async (r) => (r.ok ? r.json() : (await r.text(), [])))
      .then((r: Note[]) => (releases = r.slice(0, 3)), () => (releases = []));
  });
</script>

<section class="section live" id="community" aria-labelledby="live-title">
  <div class="wrap">
    <p class="eyebrow" data-reveal>{w.eyebrow}</p>
    <h2 class="h2" id="live-title" data-split>{w.title}</h2>
    <p class="lead" data-reveal>{w.lead}</p>

    <div class="cols">
      <article class="card col" data-reveal>
        <div class="banner" style:background-image={`url(${shared("market")})`} aria-hidden="true"></div>
        <header><h3 class="h3">{w.market}</h3><a href={href("market")} class="more">{w.browse}</a></header>
        {#if items && items.length}
          <div class="items">
            {#each items as it (it.id)}
              <a class="item" href={href("market", [it.id])} data-pack>
                <Preview kind={it.kind} preview={it.preview} />
                <b>{it.name}</b>
                <small class="mono">{it.kind} · {it.author}{it.rating.count ? ` · ★ ${it.rating.mean?.toFixed(1)} (${it.rating.count})` : ""} · ↓ {it.downloads}</small>
              </a>
            {/each}
          </div>
        {:else if items}
          <p class="empty">{@html fill(w.marketEmpty, { market: href("market") })}</p>
        {:else}
          <p class="empty">{w.loading}</p>
        {/if}
      </article>

      <article class="card col" data-reveal>
        <div class="banner" style:background-image={`url(${shared("community")})`} aria-hidden="true"></div>
        <header><h3 class="h3">{w.forum}</h3><a href={href("community")} class="more">{w.join}</a></header>
        {#if posts && posts.length}
          <ul class="threads">
            {#each posts as p (p.id)}
              <li data-post>
                <a href={href("community", [p.id])}>{p.title}</a>
                <small class="mono">{communityName(p.community)} · {p.author} · ▲ {p.score} · {p.comments} {p.comments === 1 ? w.reply : w.replies}</small>
              </li>
            {/each}
          </ul>
        {:else if posts}
          <p class="empty">{@html fill(w.forumEmpty, { community: href("community") })}</p>
        {:else}
          <p class="empty">{w.loading}</p>
        {/if}
        <p class="small">{@html fill(w.wishes, { wishes: "/wishes" })}</p>
      </article>
    </div>

    <div class="releases" id="releases">
      <header><h3 class="h3" data-reveal>{t("notes.new")}</h3><a href={href("releases")} class="more">{t("notes.all")} →</a></header>
      {#if releases && releases.length}
        <ol class="rel">
          {#each releases as r (r.version)}
            <li data-reveal data-release={`v${r.version}`}>
              <span class="mono tag">v{r.version}{#if r.built}{` · ${t("notes.built")}`}{/if}</span>
              <span class="mono when">{day(r.date)}</span>
              <a href={`${href("releases")}#v${r.version}`}>{titleOf(r)}</a>
              {#if gist(r)}<p>{gist(r)}</p>{/if}
            </li>
          {/each}
        </ol>
      {:else if releases}
        <p class="empty"><a href={href("releases")}>{t("notes.all")}</a></p>
      {/if}
    </div>
  </div>
</section>

<style>
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 44px;
  }
  @media (max-width: 900px) {
    .cols {
      grid-template-columns: 1fr;
    }
  }
  .col {
    overflow: hidden;
    padding: 0 0 18px;
  }
  .banner {
    height: 150px;
    background-size: cover;
    background-position: center;
    mask-image: linear-gradient(180deg, black 30%, transparent);
  }
  .col header,
  .releases header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 0 18px;
    margin-top: -20px;
    position: relative;
  }
  .releases header {
    padding: 0;
    margin-top: 0;
  }
  .more {
    color: var(--accent);
    text-decoration: none;
    font-size: 14px;
    white-space: nowrap;
  }
  .items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px 18px 0;
  }
  .item {
    display: grid;
    gap: 4px;
    text-decoration: none;
  }
  .item b {
    font-size: 14px;
  }
  .item small {
    color: var(--dim);
    font-size: 11px;
  }
  .threads {
    list-style: none;
    margin: 12px 0 0;
    padding: 0 18px;
  }
  .threads li {
    display: grid;
    gap: 3px;
    padding: 12px 0;
    border-bottom: 1px solid var(--line);
  }
  .threads a {
    text-decoration: none;
    font-weight: 600;
  }
  .threads a:hover {
    color: var(--accent);
  }
  .threads small {
    color: var(--dim);
    font-size: 11px;
  }
  .empty {
    color: var(--dim);
    padding: 14px 18px 0;
    margin: 0;
  }
  .empty :global(a),
  .small :global(a) {
    color: var(--accent);
  }
  .small {
    font-size: 13px;
    color: var(--dim);
    padding: 12px 18px 0;
    margin: 0;
  }
  .releases {
    margin-top: 56px;
  }
  .rel {
    list-style: none;
    padding: 0;
    margin: 18px 0 0;
    display: grid;
    gap: 0;
  }
  .rel li {
    display: grid;
    grid-template-columns: 220px 130px 1fr;
    gap: 6px 18px;
    padding: 16px 0;
    border-top: 1px solid var(--line);
    align-items: baseline;
  }
  .rel .tag {
    color: var(--accent);
    font-size: 13px;
  }
  .rel .when {
    color: var(--dim);
    font-size: 12px;
  }
  .rel a {
    font-weight: 600;
    text-decoration: none;
  }
  .rel p {
    grid-column: 3;
    margin: 0;
    color: var(--dim);
    font-size: 14px;
  }
  @media (max-width: 720px) {
    .rel li {
      grid-template-columns: 1fr;
    }
    .rel p {
      grid-column: 1;
    }
  }
</style>
