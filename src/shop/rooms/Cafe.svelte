<!--
  The café: Talkback, the discussion space, as tables in the shop's corner.
  The busiest conversations are on the tables; the chalkboard lists the
  topics. Sitting down opens the forum itself.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../lib/api";
  import { COMMUNITIES } from "../../../shared/talkback";

  interface Post {
    id: string;
    community: string;
    author: string;
    title: string;
    flair: string | null;
    score: number;
    comments: number;
  }

  let posts = $state<Post[] | null>(null);
  let failed = $state(false);
  const name = (id: string) => COMMUNITIES.find((c) => c.id === id)?.name ?? id;
  const groups = [...new Set(COMMUNITIES.map((c) => c.group))];

  onMount(() => {
    api<Post[]>("/api/talkback/posts?sort=hot")
      .then((r) => (posts = r.slice(0, 6)))
      .catch(() => (failed = true));
  });
</script>

<div class="cafe">
  <div class="tables" data-tables>
    {#if posts && posts.length}
      {#each posts as p, i (p.id)}
        <a class="table" href={`/talkback/${encodeURIComponent(p.id)}`} style:--tilt={`${((i % 3) - 1) * 0.8}deg`} data-post>
          <small>{name(p.community)}{p.flair ? ` · ${p.flair}` : ""}</small>
          <b>{p.title}</b>
          <span>{p.author} · ▲ {p.score} · {p.comments} {p.comments === 1 ? "reply" : "replies"}</span>
        </a>
      {/each}
    {:else}
      <div class="empty">
        <p class="hand">{failed ? "The café is closed for a moment." : posts ? "Every table's free." : "Pulling up chairs…"}</p>
        {#if posts}<p>Bring the question you were afraid to ask at a gig. Someone here will have asked it before, or be glad you did.</p>{/if}
      </div>
    {/if}
  </div>

  <aside class="board">
    <h2>On the board today</h2>
    {#each groups as g (g)}
      <p><b>{g}:</b>
        {#each COMMUNITIES.filter((c) => c.group === g) as c, i (c.id)}{#if i}{", "}{/if}<a href={`/talkback/c/${c.id}`}>{c.name.toLowerCase()}</a>{/each}</p>
    {/each}
    <p class="rule">House rule: the good parts only. Kind words, real help, nobody's music but your own.</p>
    <a class="go" href="/talkback">Sit down</a>
  </aside>
</div>

<style>
  .cafe {
    display: grid;
    grid-template-columns: 1.4fr minmax(260px, 0.8fr);
    gap: clamp(14px, 2.5vw, 32px);
    align-items: start;
  }
  @media (max-width: 860px) {
    .cafe {
      grid-template-columns: 1fr;
    }
  }
  .tables {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
  .table {
    display: grid;
    gap: 6px;
    padding: 14px 16px;
    border-radius: 50% / 18%;
    background: radial-gradient(ellipse at 50% 30%, #fff8e8, var(--paper));
    color: var(--ink-dark);
    text-decoration: none;
    box-shadow: 0 12px 26px rgb(0 0 0 / 0.45);
    transform: rotate(var(--tilt));
    transition: transform 0.2s;
  }
  .table:hover,
  .table:focus-visible {
    transform: rotate(0deg) translateY(-4px);
  }
  .table small,
  .table span {
    font-size: 12px;
    opacity: 0.7;
  }
  .empty {
    grid-column: 1 / -1;
    background: color-mix(in srgb, var(--walnut) 70%, transparent);
    border: 2px dashed rgb(246 236 216 / 0.4);
    border-radius: 10px;
    padding: 22px;
  }
  .hand {
    font-family: var(--hand);
    font-size: 1.6rem;
    margin: 0 0 6px;
  }
  .empty p:last-child {
    margin: 0;
  }
  .board {
    background: var(--chalk);
    color: var(--chalk-ink);
    border: 6px solid var(--wood);
    border-radius: 6px;
    padding: clamp(14px, 2vw, 20px);
    box-shadow: 0 16px 36px rgb(0 0 0 / 0.4);
    font-size: 14px;
  }
  h2 {
    font-family: var(--hand);
    font-weight: 700;
    font-size: 1.8rem;
    margin: 0 0 6px;
  }
  .board p {
    margin: 0 0 8px;
  }
  .rule {
    font-family: var(--hand);
    font-size: 1.15rem;
  }
  .go {
    display: inline-block;
    font-weight: 800;
    padding: 9px 16px;
    border-radius: 999px;
    background: var(--mango);
    color: var(--ink-dark);
    text-decoration: none;
  }
</style>
