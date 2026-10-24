<!--
  The makers' shelf: what DJs have made for djmanzo and given away, straight
  from Outboard, the marketplace. Everything on it is free. Each pack opens on
  its own page, where it is rated, discussed and downloaded.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../lib/api";
  import { COMING_KINDS, LISTED_KINDS } from "../../../shared/outboard";
  import Preview from "../../signal/auxiliary/Preview.svelte";

  interface Card {
    id: string;
    kind: string;
    name: string;
    author: string;
    description: string;
    preview: Record<string, unknown>;
    rating: { mean: number | null; count: number };
    downloads: number;
  }

  let items = $state<Card[] | null>(null);
  let failed = $state(false);

  onMount(() => {
    api<Card[]>("/api/outboard/items")
      .then((r) => (items = r.slice(0, 8)))
      .catch(() => (failed = true));
  });
</script>

<div class="makers">
  <div class="shelf" data-shelf>
    {#if items && items.length}
      {#each items as it (it.id)}
        <a class="pack" href={`/outboard/${encodeURIComponent(it.id)}`} data-pack>
          <Preview kind={it.kind} preview={it.preview} />
          <b>{it.name}</b>
          <small>{it.kind} · by {it.author}{it.rating.count ? ` · ★ ${it.rating.mean?.toFixed(1)} (${it.rating.count})` : ""}</small>
        </a>
      {/each}
    {:else}
      <div class="empty">
        <p class="hand">{failed ? "The shelf can't be reached just now." : items ? "Fresh shelves. Nothing on them yet." : "Dusting the shelf…"}</p>
        {#if items}<p>Made a theme, a skin or a look in djmanzo? Pack it there, sign it, and put it up here for everyone, free.</p>{/if}
      </div>
    {/if}
  </div>

  <aside class="label">
    <h2>What goes on this shelf</h2>
    <ul class="kinds">
      {#each LISTED_KINDS as k (k.kind)}
        <li><b>{k.name}</b> {k.what}</li>
      {/each}
    </ul>
    <p class="coming"><b>Coming, once djmanzo can install them:</b> {COMING_KINDS.map((k) => k.name.toLowerCase()).join(", ")}.</p>
    <p>No payments here, no commission. A maker may link their own tip jar. Nobody's records, samples or stems: only what you made.</p>
    <a class="go" href="/outboard">Open the marketplace</a>
  </aside>
</div>

<style>
  .makers {
    display: grid;
    grid-template-columns: 1.4fr minmax(260px, 0.8fr);
    gap: clamp(14px, 2.5vw, 32px);
    align-items: start;
  }
  @media (max-width: 860px) {
    .makers {
      grid-template-columns: 1fr;
    }
  }
  .shelf {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 12px;
  }
  .pack {
    display: grid;
    gap: 4px;
    padding: 8px;
    border-radius: 6px;
    background: var(--paper);
    color: var(--ink-dark);
    text-decoration: none;
    box-shadow: 0 10px 24px rgb(0 0 0 / 0.4);
    transition: transform 0.2s;
  }
  .pack:hover,
  .pack:focus-visible {
    transform: translateY(-4px) rotate(-0.6deg);
  }
  .pack small {
    opacity: 0.7;
    font-size: 12px;
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
  .label {
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
  .kinds {
    padding-left: 18px;
    margin: 0 0 10px;
    display: grid;
    gap: 6px;
    font-size: 14px;
  }
  .coming,
  .label > p {
    font-size: 14px;
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
