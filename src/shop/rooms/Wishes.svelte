<!--
  The request line: the wishlist as slips pinned to a cork board, the most
  wanted first. What shipped is stamped; what is being built says so. Making
  or backing a wish happens on the wishlist itself.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../lib/api";

  interface Wish {
    id: string;
    title: string;
    status: "idea" | "considering" | "planned" | "building" | "shipped" | "not-planned";
    votes: number;
    note: string | null;
  }

  const STAMP: Record<Wish["status"], string> = {
    idea: "an idea",
    considering: "thinking it over",
    planned: "planned",
    building: "being built",
    shipped: "you asked, we built",
    "not-planned": "not for now",
  };

  let wishes = $state<Wish[] | null>(null);
  let failed = $state(false);
  const built = $derived(wishes?.filter((w) => w.status === "shipped").length ?? 0);

  onMount(() => {
    api<Wish[]>("/api/wishes")
      .then((r) => (wishes = r.filter((w) => w.status !== "not-planned").slice(0, 9)))
      .catch(() => (failed = true));
  });
</script>

<div class="wishes">
  <div class="cork" data-cork>
    {#if wishes && wishes.length}
      {#each wishes as w, i (w.id)}
        <a class="slip {w.status}" href="/wishes" style:--tilt={`${((i * 37) % 7) - 3}deg`} data-wish>
          <b>{w.title}</b>
          <small>▲ {w.votes} · {STAMP[w.status]}</small>
          {#if w.status === "shipped"}<span class="stamp" aria-hidden="true">BUILT</span>{/if}
        </a>
      {/each}
    {:else}
      <p class="hand">{failed ? "The request line is busy. Try again in a moment." : "Pinning up the slips…"}</p>
    {/if}
  </div>
  <aside class="note">
    <h2>Requests welcome</h2>
    <p>Ask for what djmanzo should do next, or back someone else's wish. The most wanted get built first, and the board says where each one stands.</p>
    {#if built}<p><b>{built}</b> {built === 1 ? "wish has" : "wishes have"} already been built.</p>{/if}
    <a class="go" href="/wishes">Make a wish</a>
  </aside>
</div>

<style>
  .wishes {
    display: grid;
    grid-template-columns: 1.4fr minmax(240px, 0.7fr);
    gap: clamp(14px, 2.5vw, 32px);
    align-items: start;
  }
  @media (max-width: 860px) {
    .wishes {
      grid-template-columns: 1fr;
    }
  }
  .cork {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
    padding: 18px;
    border-radius: 8px;
    background:
      radial-gradient(circle at 20% 30%, rgb(0 0 0 / 0.08) 0 1px, transparent 2px) 0 0 / 9px 9px,
      #b5814f;
    border: 8px solid var(--wood);
    box-shadow: inset 0 0 30px rgb(0 0 0 / 0.35), 0 16px 36px rgb(0 0 0 / 0.4);
  }
  .slip {
    position: relative;
    display: grid;
    gap: 6px;
    padding: 18px 12px 12px;
    background: #fffbe9;
    color: var(--ink-dark);
    text-decoration: none;
    font-family: var(--hand);
    font-size: 1.2rem;
    line-height: 1.15;
    box-shadow: 0 6px 12px rgb(0 0 0 / 0.3);
    transform: rotate(var(--tilt));
    transition: transform 0.2s;
  }
  .slip::before {
    content: "";
    position: absolute;
    top: 5px;
    left: 50%;
    width: 12px;
    height: 12px;
    margin-left: -6px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ff8a7a, #b8322a);
    box-shadow: 0 2px 3px rgb(0 0 0 / 0.4);
  }
  .slip:hover,
  .slip:focus-visible {
    transform: rotate(0deg) scale(1.03);
  }
  .slip small {
    font-family: var(--text);
    font-size: 12px;
    opacity: 0.7;
  }
  .slip.building,
  .slip.planned {
    background: #eaf6ff;
  }
  .stamp {
    position: absolute;
    right: 8px;
    bottom: 10px;
    padding: 2px 6px;
    border: 2px solid #2f7d4a;
    color: #2f7d4a;
    font: 400 12px var(--display);
    transform: rotate(-12deg);
    opacity: 0.85;
  }
  .hand {
    grid-column: 1 / -1;
    font-family: var(--hand);
    font-size: 1.5rem;
    margin: 0;
    color: var(--ink-dark);
  }
  .note {
    background: var(--paper);
    color: var(--ink-dark);
    border-radius: 6px;
    padding: clamp(14px, 2vw, 20px);
    box-shadow: 0 18px 40px rgb(0 0 0 / 0.45);
  }
  h2 {
    font-family: var(--display);
    font-weight: 400;
    margin: 0 0 8px;
    font-size: clamp(1.1rem, 1.8vw, 1.4rem);
  }
  .note p {
    margin: 0 0 10px;
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
