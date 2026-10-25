<!--
  People (the island's plaza until 25 October): what DJs and singers say
  about djmanzo, their mixes and performances, the conversation, and a way
  to tell friends. Nothing here is written by the site about itself:
  testimonials are real people's words, read by the crew in Backstage
  before they appear, and the page says so while it is still empty. The
  owner's own videos are on the home page.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api, post } from "../../lib/api";
  import { session } from "../../lib/session.svelte";
  import { animate } from "../motion";
  import { i18n } from "../i18n.svelte";
  import { LANG_INFO } from "../i18n/strings";
  import { PEOPLE } from "../i18n/people";
  import { count } from "../i18n/talkback";
  import { fill } from "../i18n/sections";
  import { href } from "../router";
  import { groove } from "../region.svelte";
  import { GENRE_BY_ID } from "../../lib/genres";

  const w = $derived(PEOPLE[i18n.lang]);
  let root: HTMLElement;

  interface Item {
    id: string;
    kind: string;
    body: string;
    author: string;
    rating?: number | null;
    link?: string | null;
    role?: string | null;
    genre?: string | null;
    createdAt: number;
  }
  let testimonials = $state<Item[]>([]);
  let comments = $state<Item[]>([]);
  let samples = $state<Item[]>([]);
  let playing = $state<string | null>(null);

  let kind = $state<"comment" | "testimonial" | "sample">("comment");
  let body = $state("");
  let link = $state("");
  let rating = $state(5);
  let author = $state("");
  let message = $state<string | null>(null);

  onMount(() => {
    animate(root);
    void Promise.allSettled([api<Item[]>("/api/comments?kind=testimonial"), api<Item[]>("/api/comments?kind=comment"), api<Item[]>("/api/comments?kind=sample")]).then(([t, c, s]) => {
      if (t.status === "fulfilled") testimonials = t.value;
      if (c.status === "fulfilled") comments = c.value;
      if (s.status === "fulfilled") samples = s.value;
    });
  });

  async function send(e: SubmitEvent) {
    e.preventDefault();
    message = null;
    try {
      const genre = GENRE_BY_ID[groove()]?.name;
      const r = await post<Item & { approved?: boolean }>("/api/comments", { kind, body, link, rating, author: session.user?.name ?? author, genre });
      body = "";
      link = "";
      if (r.approved) {
        comments = [r, ...comments];
        message = w.posted;
      } else message = kind === "comment" ? w.heldComment : w.heldOther;
    } catch (e2) {
      message = (e2 as Error).message;
    }
  }

  function youtubeId(url: string): string | null {
    try {
      const u = new URL(url);
      if (u.hostname === "youtu.be") return u.pathname.slice(1, 12);
      return u.hostname.endsWith("youtube.com") ? u.searchParams.get("v") : null;
    } catch {
      return null;
    }
  }

  const url = typeof location !== "undefined" ? location.origin : "";
  async function share() {
    try {
      await navigator.share({ title: "djmanzo", text: w.shareText, url });
    } catch {
      // The visitor closed the sheet.
    }
  }
  const SHARES = $derived([
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${w.shareText} ${url}`)}` },
    { name: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(w.shareText)}&url=${encodeURIComponent(url)}` },
    { name: "Bluesky", href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${w.shareText} ${url}`)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "Threads", href: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${w.shareText} ${url}`)}` },
  ]);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const date = (t: number) => new Date(t).toLocaleDateString(LANG_INFO[i18n.lang].tag, { day: "numeric", month: "short", year: "numeric" });
</script>

<div class="people" bind:this={root} data-people>
  <header class="head">
    <div class="wrap">
      <p class="eyebrow">{w.eyebrow}</p>
      <h1 class="h1">{@html w.title}</h1>
      <p class="lead">{w.lead}</p>
    </div>
  </header>

  <div class="wrap body">
    <h2 class="h2">{w.say}</h2>
    {#if testimonials.length}
      <div class="quotes">
        {#each testimonials as t (t.id)}
          <blockquote>
            {#if t.rating}<span class="stars" aria-label={fill(w.outOf5, { n: t.rating })}>{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</span>{/if}
            <p>{t.body}</p>
            <footer>— {t.author}{t.role ? `, ${t.role}` : ""}{t.genre ? ` · ${t.genre}` : ""}</footer>
          </blockquote>
        {/each}
      </div>
    {:else}
      <p class="empty" data-no-testimonials>{w.noTestimonials}</p>
    {/if}

    <h2 class="h2">{w.mixes}</h2>
    {#if samples.length}
      <div class="reels">
        {#each samples as s (s.id)}
          {@const id = youtubeId(s.link ?? "")}
          <figure>
            {#if id && playing === s.id}
              <iframe src="https://www.youtube-nocookie.com/embed/{encodeURIComponent(id)}?autoplay=1&rel=0" title={s.body} allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
            {:else if id}
              <button class="poster" onclick={() => (playing = s.id)} aria-label={fill(w.play, { title: s.body })}><span class="play" aria-hidden="true">▶</span></button>
            {:else if s.link}
              <a class="btn ghost small" href={s.link} target="_blank" rel="noopener nofollow">{w.listen}</a>
            {/if}
            <figcaption>{s.body}{s.author ? ` — ${s.author}` : ""}</figcaption>
          </figure>
        {/each}
      </div>
      <p class="dim small">{w.loads}</p>
    {:else}
      <p class="empty">{w.noMixes}</p>
    {/if}

    <h2 class="h2">{w.conversation}</h2>
    {#if comments.length}
      <ul class="comments">
        {#each comments as c (c.id)}
          <li><b>{c.author}</b> <span class="dim small">{date(c.createdAt)}</span><p>{c.body}</p></li>
        {/each}
      </ul>
    {:else}
      <p class="dim">{w.quiet}</p>
    {/if}

    <form class="say" onsubmit={send} data-say>
      <div class="chips" role="radiogroup" aria-label={w.leaving}>
        {#each ["comment", "testimonial", "sample"] as const as k (k)}
          <button type="button" class="chip" role="radio" aria-checked={kind === k} class:on={kind === k} onclick={() => (kind = k)}>{w.kinds[k]}</button>
        {/each}
      </div>
      {#if kind === "sample"}
        <label class="field"><span>{w.linkLabel}</span><input type="url" bind:value={link} required placeholder="https://youtu.be/…" /></label>
      {/if}
      {#if kind === "testimonial"}
        <div class="rate" role="radiogroup" aria-label={w.rating}>
          {#each [1, 2, 3, 4, 5] as n (n)}<button type="button" class="star" class:on={n <= rating} role="radio" aria-checked={rating === n} aria-label={count(w.stars, n)} onclick={() => (rating = n)}>★</button>{/each}
        </div>
      {/if}
      <label class="field"><span>{w.bodyLabel[kind]}</span><textarea bind:value={body} required maxlength="800"></textarea></label>
      {#if !session.user}<label class="field"><span>{w.name}</span><input type="text" bind:value={author} maxlength="40" /></label>{/if}
      <button class="btn primary">{w.submit}</button>
      {#if message}<p class="small" role="status">{message}</p>{/if}
    </form>

    <h2 class="h2">{w.tell}</h2>
    <div class="share">
      {#if canShare}<button class="btn primary" onclick={share}>{w.share}</button>{/if}
      {#each SHARES as s (s.name)}<a class="btn ghost" href={s.href} target="_blank" rel="noopener">{s.name}</a>{/each}
    </div>
    <p class="dim small">{@html fill(w.wishes, { wishes: href("wishes") })}</p>
  </div>
</div>

<style>
  .head {
    padding: calc(var(--bar) + 64px) 0 24px;
  }
  .body {
    padding-bottom: 80px;
    display: grid;
    gap: 16px;
  }
  .body > .h2 {
    margin-top: 32px;
  }
  .quotes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    gap: 16px;
  }
  blockquote {
    margin: 0;
    padding: 18px;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    background: var(--surface);
  }
  blockquote footer {
    color: var(--dim);
    font-size: 14px;
  }
  .stars {
    color: var(--accent);
    letter-spacing: 2px;
  }
  .empty {
    padding: 16px 18px;
    border-radius: var(--radius);
    border: 1px dashed var(--line);
    color: var(--dim);
    max-width: 70ch;
  }
  .reels {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    gap: 16px;
  }
  figure {
    margin: 0;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    background: var(--surface);
    overflow: hidden;
  }
  .poster,
  iframe {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    border: 0;
  }
  .poster {
    display: grid;
    place-items: center;
    cursor: pointer;
    background: radial-gradient(60% 80% at 30% 20%, color-mix(in srgb, var(--accent) 30%, transparent), transparent), var(--raised);
  }
  .play {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--on-accent);
    padding-left: 4px;
  }
  figcaption {
    padding: 10px 14px;
    font-size: 14px;
  }
  .comments {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 12px;
    max-width: 70ch;
  }
  .comments p {
    margin: 4px 0 0;
  }
  .say {
    display: grid;
    gap: 12px;
    max-width: 640px;
    padding: 18px;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    background: var(--surface);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .field {
    display: grid;
    gap: 6px;
  }
  .field span {
    font-weight: 600;
    font-size: 14px;
  }
  input,
  textarea {
    font: inherit;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
  }
  textarea {
    min-height: 110px;
    resize: vertical;
  }
  .rate {
    display: flex;
    gap: 4px;
  }
  .star {
    background: none;
    border: 0;
    font-size: 24px;
    color: var(--line);
    cursor: pointer;
  }
  .star.on {
    color: var(--accent);
  }
  .share {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .small {
    font-size: 13px;
  }
  .small :global(a) {
    color: var(--accent);
  }
  .say > .btn {
    justify-self: start;
  }
</style>
