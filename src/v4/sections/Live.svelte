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
  import { RELEASES } from "../download";

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
  interface Release {
    name: string;
    tag_name: string;
    published_at: string;
    html_url: string;
    body: string | null;
    prerelease: boolean;
  }

  let items = $state<Card[] | null>(null);
  let posts = $state<Post[] | null>(null);
  let releases = $state<Release[] | null>(null);
  const communityName = (id: string) => COMMUNITIES.find((c) => c.id === id)?.name ?? id;
  const date = (s: string | number) => new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  /** A release's first sentence of prose, past its heading and its download table. */
  function gist(body: string | null): string {
    const line = (body ?? "")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#") && !l.startsWith("|"));
    return (line ?? "").replace(/[*_`]/g, "").slice(0, 180);
  }

  onMount(() => {
    api<Card[]>("/api/outboard/items").then((r) => (items = r.slice(0, 4)), () => (items = []));
    api<Post[]>("/api/talkback/posts?sort=hot").then((r) => (posts = r.slice(0, 5)), () => (posts = []));
    fetch("/api/releases")
      .then((r) => (r.ok ? r.json() : []))
      .then((r: Release[]) => (releases = r), () => (releases = []));
  });
</script>

<section class="section live" id="community" aria-labelledby="live-title">
  <div class="wrap">
    <p class="eyebrow" data-reveal>Made by DJs</p>
    <h2 class="h2" id="live-title" data-split>A marketplace that costs nothing. A forum that stays on topic.</h2>
    <p class="lead" data-reveal>Themes, skins and visuals made by DJs for djmanzo, free, signed by their makers and checked before they are listed. And a place to ask the question everyone at the gig was thinking.</p>

    <div class="cols">
      <article class="card col" data-reveal>
        <div class="banner" style:background-image={`url(${shared("market")})`} aria-hidden="true"></div>
        <header><h3 class="h3">Marketplace</h3><a href={href("market")} class="more">Browse all →</a></header>
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
          <p class="empty">New shelves: nothing listed yet. Made a theme, a skin or a look in djmanzo? <a href={href("market")}>Put it up</a> — free for everyone.</p>
        {:else}
          <p class="empty">Loading…</p>
        {/if}
      </article>

      <article class="card col" data-reveal>
        <div class="banner" style:background-image={`url(${shared("community")})`} aria-hidden="true"></div>
        <header><h3 class="h3">Forum</h3><a href={href("community")} class="more">Join in →</a></header>
        {#if posts && posts.length}
          <ul class="threads">
            {#each posts as p (p.id)}
              <li data-post>
                <a href={href("community", [p.id])}>{p.title}</a>
                <small class="mono">{communityName(p.community)} · {p.author} · ▲ {p.score} · {p.comments} {p.comments === 1 ? "reply" : "replies"}</small>
              </li>
            {/each}
          </ul>
        {:else if posts}
          <p class="empty">Quiet so far. Ask the first question — mixing, harmonic keys, karaoke hosting, gear — <a href={href("community")}>in the forum</a>.</p>
        {:else}
          <p class="empty">Loading…</p>
        {/if}
        <p class="small"><a href="/wishes">Feature requests</a>: ask for what djmanzo should do next, and vote.</p>
      </article>
    </div>

    <div class="releases" id="releases">
      <header><h3 class="h3" data-reveal>What's new</h3><a href={RELEASES} class="more">Download →</a></header>
      {#if releases && releases.length}
        <ol class="rel">
          {#each releases as r (r.tag_name)}
            <li data-reveal data-release={r.tag_name}>
              <span class="mono tag">{r.tag_name}</span>
              <span class="mono when">{date(r.published_at)}</span>
              <a href={r.html_url}>{r.name}</a>
              {#if gist(r.body)}<p>{gist(r.body)}</p>{/if}
            </li>
          {/each}
        </ol>
      {:else if releases}
        <p class="empty">The newest release is on <a href={RELEASES}>the download screen</a>.</p>
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
  .empty a,
  .small a {
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
