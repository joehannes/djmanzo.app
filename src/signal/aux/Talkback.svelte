<!--
  Talkback, the discussion space (§134): communities on the craft, the
  music, the gear, the life around gigs and djmanzo; posts with nested
  comments; one vote an account; hot, new and top; search. A new account's
  posts may wait for the crew, and it is told so. What the crew removes
  shows only that it was removed — and its author is told why.
-->
<script lang="ts">
  import { api } from "../../lib/api";
  import { session } from "../../lib/session.svelte";
  import { markdown } from "../../../shared/markdown";
  import Join from "./Join.svelte";
  import Report from "./Report.svelte";
  import { ago, type Standing } from "./routes";

  let { rest }: { rest: string[] } = $props();

  interface Community {
    id: string;
    name: string;
    group: string;
    about: string;
    posts: number;
  }
  interface Post {
    id: string;
    community: string;
    uid: string;
    author: string;
    title: string;
    body: string;
    flair: string | null;
    score: number;
    comments: number;
    status: string;
    reason?: string | null;
    removed?: boolean;
    wish: string | null;
    created: number;
  }
  interface Comment {
    id: string;
    parent: string | null;
    depth: number;
    uid: string;
    author: string;
    body: string;
    score: number;
    status: string;
    removed?: boolean;
    created: number;
  }
  interface Me {
    level: number;
    trust: { name: string; about: string; links: boolean };
    karma: number;
    notices: { id: string; action: string; reason: string; appeal: string | null; created: number }[];
  }

  let info = $state<{ communities: Community[]; flairs: { id: string; name: string }[]; rules: string[]; standing: Standing; me: Me | null; turnstile: string | null } | null>(null);
  let list = $state<Post[] | null>(null);
  let sort = $state<"hot" | "new" | "top">("hot");
  let q = $state("");
  let thread = $state<{ post: Post; comments: Comment[]; votes: Record<string, number> } | null>(null);
  let error = $state<string | null>(null);

  const community = $derived(rest[0] === "c" ? (info?.communities.find((c) => c.id === rest[1]) ?? null) : null);
  const postId = $derived(rest[0] && rest[0] !== "c" ? rest[0] : null);
  const groups = $derived([...new Set((info?.communities ?? []).map((c) => c.group))]);
  const name = (id: string) => info?.communities.find((c) => c.id === id)?.name ?? id;
  const flairName = (id: string | null) => info?.flairs.find((f) => f.id === id)?.name;
  const canWrite = $derived(!!info && !info.standing.closed && info.standing.vouched);

  async function load() {
    try {
      info = await api("/api/talkback");
      error = null;
    } catch (e) {
      error = (e as Error).message;
    }
  }
  async function loadList() {
    try {
      const c = rest[0] === "c" ? rest[1] : "";
      list = await api(`/api/talkback/posts?c=${encodeURIComponent(c)}&sort=${sort}&q=${encodeURIComponent(q)}`);
    } catch (e) {
      error = (e as Error).message;
    }
  }
  async function loadThread(id: string) {
    try {
      thread = await api(`/api/talkback/posts/${encodeURIComponent(id)}`);
    } catch (e) {
      error = (e as Error).message;
      thread = null;
    }
  }

  $effect(() => {
    void load();
  });
  $effect(() => {
    if (postId) void loadThread(postId);
    else {
      thread = null;
      void loadList();
    }
  });

  // --- Voting
  async function vote(kind: "post" | "comment", id: string, value: number) {
    try {
      const r = await api<{ score: number; value: number }>("/api/talkback/vote", { method: "POST", json: { kind, id, value } });
      if (thread) {
        thread.votes[`${kind}:${id}`] = r.value;
        if (kind === "post") thread.post.score = r.score;
        else {
          const c = thread.comments.find((x) => x.id === id);
          if (c) c.score = r.score;
        }
      }
      const p = list?.find((x) => x.id === id);
      if (p) p.score = r.score;
    } catch (e) {
      error = (e as Error).message;
    }
  }

  // --- Writing a post
  let writing = $state(false);
  let draft = $state({ community: "", title: "", body: "", flair: "" });
  let posted = $state<string | null>(null);
  async function send() {
    try {
      const token = (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value;
      const r = await api<{ id: string; status: string; note: string | null }>("/api/talkback/posts", {
        method: "POST",
        json: { community: draft.community || community?.id || "help", title: draft.title, body: draft.body, flair: draft.flair || null, turnstile: token },
      });
      posted = r.status === "held" ? `Posted. It waits for the crew before others see it${r.note ? `: ${r.note}` : "."}` : null;
      writing = false;
      draft = { community: "", title: "", body: "", flair: "" };
      location.hash = `#/talkback/${r.id}`;
    } catch (e) {
      posted = (e as Error).message;
    }
  }

  // Turnstile, only when the owner has set it up and the account is new.
  $effect(() => {
    if (!writing || !info?.turnstile || (info.me?.level ?? 0) > 0) return;
    if (document.getElementById("turnstile-js")) return;
    const s = document.createElement("script");
    s.id = "turnstile-js";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    document.head.appendChild(s);
  });

  // --- Comments
  let replyTo = $state<string | null>(null);
  let reply = $state("");
  async function comment(parent: string | null) {
    if (!thread) return;
    try {
      await api(`/api/talkback/posts/${thread.post.id}/comments`, { method: "POST", json: { body: reply, parent } });
      reply = "";
      replyTo = null;
      await loadThread(thread.post.id);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  // --- The crew carries a proposal to the wishlist
  async function promote() {
    if (!thread) return;
    try {
      const r = await api<{ wish: string }>("/api/admin/talkback/promote", { method: "POST", json: { id: thread.post.id } });
      thread.post.wish = r.wish;
    } catch (e) {
      error = (e as Error).message;
    }
  }

  // --- Appeals
  let appealing = $state<string | null>(null);
  let appealText = $state("");
  async function appeal(id: string) {
    try {
      await api(`/api/me/notices/${id}/appeal`, { method: "POST", json: { text: appealText } });
      appealing = null;
      appealText = "";
      await load();
    } catch (e) {
      error = (e as Error).message;
    }
  }

  /** The comments under `parent`, in the order written. */
  const under = (parent: string | null) => (thread?.comments ?? []).filter((c) => c.parent === parent);
</script>

{#snippet votes(kind: "post" | "comment", id: string, score: number, mine: number, own: boolean)}
  <span class="votes" data-votes={id}>
    <button aria-label="Up" aria-pressed={mine === 1} class:on={mine === 1} disabled={!canWrite || own} onclick={() => vote(kind, id, mine === 1 ? 0 : 1)}>▲</button>
    <b data-score>{score}</b>
    <button aria-label="Down" aria-pressed={mine === -1} class:on={mine === -1} disabled={!canWrite || own} onclick={() => vote(kind, id, mine === -1 ? 0 : -1)}>▼</button>
  </span>
{/snippet}

{#snippet comments(parent: string | null)}
  <ul class="comments">
    {#each under(parent) as c (c.id)}
      <li data-comment={c.id}>
        <div class="line">
          {@render votes("comment", c.id, c.score, thread?.votes[`comment:${c.id}`] ?? 0, c.uid === info?.standing.uid)}
          <span class="by">{c.author} · {ago(c.created)}{c.status === "held" ? " · waiting for the crew" : ""}</span>
        </div>
        {#if c.removed}
          <p class="note">Removed by the crew.</p>
        {:else}
          <div class="md">{@html markdown(c.body)}</div>
          <p class="acts">
            {#if canWrite}<button class="link" onclick={() => { replyTo = c.id; reply = ""; }}>Reply</button>{/if}
            <Report kind="comment" target={c.id} standing={info?.standing ?? null} />
          </p>
        {/if}
        {#if replyTo === c.id}
          <form class="reply" onsubmit={(e) => { e.preventDefault(); void comment(c.id); }}>
            <textarea bind:value={reply} maxlength="4000" aria-label="Your reply"></textarea>
            <button class="go" disabled={reply.trim().length < 2}>Reply</button>
          </form>
        {/if}
        {@render comments(c.id)}
      </li>
    {/each}
  </ul>
{/snippet}

{#if error}<p class="note" role="alert">{error}</p>{/if}
{#if posted}<p class="note" role="status" data-posted>{posted}</p>{/if}

{#if info?.me?.notices.length}
  <details class="notices" data-notices>
    <summary>What the crew has told you ({info.me.notices.length})</summary>
    <ul>
      {#each info.me.notices as n (n.id)}
        <li>
          <b>{n.action}.</b> {n.reason} <span class="note">{ago(n.created)}</span>
          {#if n.appeal}
            <br /><span class="note">You replied: {n.appeal}</span>
          {:else if appealing === n.id}
            <form class="reply" onsubmit={(e) => { e.preventDefault(); void appeal(n.id); }}>
              <textarea bind:value={appealText} maxlength="1200" aria-label="Your reply to the crew"></textarea>
              <button class="go" disabled={appealText.trim().length < 10}>Send to the crew</button>
            </form>
          {:else}
            <button class="link" onclick={() => (appealing = n.id)}>Reply to the crew</button>
          {/if}
        </li>
      {/each}
    </ul>
  </details>
{/if}

{#if postId}
  <p><a class="link" href={thread ? `#/talkback/c/${thread.post.community}` : "#/talkback"}>← {thread ? name(thread.post.community) : "Talkback"}</a></p>
  {#if thread}
    <article class="post" data-post={thread.post.id}>
      <div class="line">
        {@render votes("post", thread.post.id, thread.post.score, thread.votes[`post:${thread.post.id}`] ?? 0, thread.post.uid === info?.standing.uid)}
        <h2>{thread.post.title}</h2>
      </div>
      <p class="by">
        {#if flairName(thread.post.flair)}<span class="flair">{flairName(thread.post.flair)}</span>{/if}
        {thread.post.author} · {ago(thread.post.created)}{thread.post.status === "held" ? " · waiting for the crew: only you see it" : ""}
        {#if thread.post.wish}· <a class="link" href={`/island/#/muro`}>on the wishlist</a>{/if}
      </p>
      {#if thread.post.removed}
        <p class="note">Removed by the crew.</p>
      {:else}
        <div class="md">{@html markdown(thread.post.body)}</div>
        <p class="acts">
          <Report kind="post" target={thread.post.id} standing={info?.standing ?? null} />
          {#if session.admin && thread.post.flair === "proposal" && !thread.post.wish}<button class="link" onclick={promote} data-promote>Carry it to the wishlist</button>{/if}
        </p>
      {/if}
    </article>
    <h3>{thread.comments.length} comment{thread.comments.length === 1 ? "" : "s"}</h3>
    {#if canWrite && thread.post.status === "live"}
      <form class="reply" onsubmit={(e) => { e.preventDefault(); void comment(null); }} data-comment-form>
        <textarea bind:value={reply} maxlength="4000" placeholder="Add a comment" aria-label="Your comment" onfocus={() => (replyTo = null)}></textarea>
        <button class="go" disabled={reply.trim().length < 2 || replyTo !== null}>Comment</button>
      </form>
    {:else if info}
      <Join standing={info.standing} doing="comment" />
    {/if}
    {@render comments(null)}
  {/if}
{:else}
  <div class="layout">
    <nav class="communities" aria-label="Communities">
      <a href="#/talkback" class:on={!community}>Everything</a>
      {#each groups as g (g)}
        <h3>{g}</h3>
        {#each info?.communities.filter((c) => c.group === g) ?? [] as c (c.id)}
          <a href={`#/talkback/c/${c.id}`} class:on={community?.id === c.id} data-community={c.id}>{c.name}{c.posts ? ` · ${c.posts}` : ""}</a>
        {/each}
      {/each}
    </nav>
    <div class="main">
      {#if community}<p class="about">{community.about}</p>{/if}
      <div class="bar">
        <div class="chips" role="radiogroup" aria-label="Sort">
          {#each ["hot", "new", "top"] as const as s (s)}
            <button role="radio" aria-checked={sort === s} class:on={sort === s} onclick={() => { sort = s; void loadList(); }}>{s}</button>
          {/each}
        </div>
        <form onsubmit={(e) => { e.preventDefault(); void loadList(); }}>
          <input type="search" bind:value={q} placeholder="Search Talkback" aria-label="Search Talkback" />
        </form>
        {#if canWrite}<button class="go" onclick={() => (writing = !writing)} aria-expanded={writing} data-write>Write a post</button>{/if}
      </div>
      {#if info && !canWrite}<Join standing={info.standing} doing="post, comment and vote" />{/if}
      {#if info?.me}<p class="note">You are a {info.me.trust.name.toLowerCase()} here (karma {info.me.karma}). {info.me.trust.about}</p>{/if}

      {#if writing}
        <form class="compose" onsubmit={(e) => { e.preventDefault(); void send(); }} data-compose>
          <select bind:value={draft.community} aria-label="Community">
            <option value="">{community ? community.name : "Choose a community"}</option>
            {#each info?.communities ?? [] as c (c.id)}<option value={c.id}>{c.group}: {c.name}</option>{/each}
          </select>
          <input type="text" bind:value={draft.title} maxlength="140" placeholder="Title" aria-label="Title" />
          <textarea bind:value={draft.body} maxlength="10000" rows="7" placeholder="**bold**, *italic*, `code`, > quote, - lists, [a link](https://…)" aria-label="What you want to say"></textarea>
          <select bind:value={draft.flair} aria-label="Flair">
            <option value="">No flair</option>
            {#each info?.flairs ?? [] as f (f.id)}<option value={f.id}>{f.name}</option>{/each}
          </select>
          {#if info?.turnstile && (info.me?.level ?? 0) === 0}<div class="cf-turnstile" data-sitekey={info.turnstile}></div>{/if}
          <button class="go" disabled={draft.title.trim().length < 4 || (!draft.community && !community)}>Post</button>
          <p class="note">Keep to the <a class="link" href="#/rules">community rules</a>.</p>
        </form>
      {/if}

      <ol class="posts" data-posts>
        {#each list ?? [] as p (p.id)}
          <li data-post-row={p.id}>
            {@render votes("post", p.id, p.score, 0, p.uid === info?.standing.uid)}
            <div>
              <a class="title" href={`#/talkback/${p.id}`}>{p.title}</a>
              <p class="by">
                {#if flairName(p.flair)}<span class="flair">{flairName(p.flair)}</span>{/if}
                <a class="link" href={`#/talkback/c/${p.community}`}>{name(p.community)}</a> · {p.author} · {ago(p.created)} · {p.comments} comment{p.comments === 1 ? "" : "s"}{p.status === "held" ? " · waiting for the crew" : ""}
              </p>
            </div>
          </li>
        {:else}
          <li class="note">{list ? (q ? "Nothing found." : "Nothing here yet: the first post is yours to write.") : "…"}</li>
        {/each}
      </ol>
    </div>
  </div>
{/if}

<style>
  .layout {
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    gap: 24px;
  }
  @media (max-width: 760px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .communities {
      max-height: 9rem;
      overflow: auto;
    }
  }
  .communities {
    display: grid;
    gap: 2px;
    align-content: start;
    font-size: 14px;
  }
  .communities h3 {
    margin: 12px 0 4px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.7;
  }
  .communities a {
    color: inherit;
    text-decoration: none;
    padding: 3px 6px;
    border-radius: 4px;
  }
  .communities a.on {
    background: var(--glow);
    color: var(--night);
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  .chips {
    display: flex;
    gap: 6px;
  }
  .chips button {
    font: inherit;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    text-transform: capitalize;
  }
  .chips .on {
    background: var(--glow);
    color: var(--night);
  }
  .posts {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .posts li,
  .line {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .title {
    color: inherit;
    font-weight: 700;
    text-decoration: none;
  }
  .title:hover {
    text-decoration: underline;
  }
  .by {
    margin: 2px 0 0;
    font-size: 13px;
    opacity: 0.8;
  }
  .flair {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
    padding: 1px 6px;
    border-radius: 4px;
    margin-right: 4px;
  }
  .votes {
    display: inline-grid;
    justify-items: center;
    min-width: 2rem;
    font-size: 13px;
  }
  .votes button {
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    opacity: 0.6;
    padding: 0 4px;
  }
  .votes button.on {
    color: var(--glow);
    opacity: 1;
  }
  .votes button:disabled {
    cursor: default;
    opacity: 0.25;
  }
  .comments {
    list-style: none;
    padding-left: 16px;
    border-left: 2px solid color-mix(in srgb, var(--ink) 15%, transparent);
    display: grid;
    gap: 10px;
  }
  .compose,
  .reply {
    display: grid;
    gap: 8px;
    max-width: 44rem;
    margin: 8px 0 14px;
  }
  .md :global(p) {
    margin: 0.4em 0;
  }
  .md :global(pre) {
    overflow: auto;
    padding: 8px;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }
  .md :global(blockquote) {
    margin: 0.4em 0;
    padding-left: 10px;
    border-left: 3px solid var(--accent);
  }
  .md :global(a) {
    color: var(--glow);
  }
  .acts {
    margin: 2px 0;
    display: flex;
    gap: 10px;
    font-size: 13px;
  }
  .about {
    opacity: 0.85;
  }
</style>
