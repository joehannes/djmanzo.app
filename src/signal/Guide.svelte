<!--
  The guide at Silence, before the needle drops: what do you do, and what
  do you play? Each answer re-dresses the whole path at once. This is the
  scripted guide; the one Claude speaks for (Phase 4) asks the same things
  in conversation and falls back to this when it cannot.
-->
<script lang="ts">
  import { FAMILY_IDS, NODES, children, lineage } from "../style/genome";
  import { signal, type Role } from "./state.svelte";

  let { ondone }: { ondone: () => void } = $props();

  const ROLES: { id: Role; label: string }[] = [
    { id: "dj", label: "I DJ" },
    { id: "karaoke", label: "I host karaoke" },
    { id: "learning", label: "I'm learning" },
    { id: "listening", label: "I just love the music" },
  ];

  // The family the current style belongs to, and the genre within it, if any.
  const path = $derived(lineage(signal.style));
  const family = $derived(path[1] ?? null);
  const genres = $derived(family ? children(family) : []);
</script>

<div class="guide" data-guide>
  <p class="ask">What brings you here?</p>
  <div class="chips" role="radiogroup" aria-label="What you do">
    {#each ROLES as r (r.id)}
      <button class="chip" role="radio" aria-checked={signal.role === r.id} onclick={() => signal.setRole(r.id)}>{r.label}</button>
    {/each}
  </div>

  <p class="ask">What does your night sound like?</p>
  <div class="chips" role="radiogroup" aria-label="Your music">
    {#each FAMILY_IDS as f (f)}
      <button class="chip" role="radio" aria-checked={family === f} onclick={() => signal.setStyle(f)}>{NODES[f].name}</button>
    {/each}
  </div>

  {#if genres.length}
    <p class="ask">Closer?</p>
    <div class="chips" role="radiogroup" aria-label="Your genre">
      {#each genres as g (g)}
        <button class="chip" role="radio" aria-checked={signal.style === g} onclick={() => signal.setStyle(g)}>{NODES[g].name}</button>
      {/each}
    </div>
  {/if}

  <button class="go" onclick={ondone}>Drop the needle →</button>
</div>

<style>
  .guide {
    display: grid;
    gap: 10px;
  }
  .ask {
    margin: 10px 0 0;
    font-family: var(--display);
    font-size: 1.15rem;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    font: inherit;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1.5px solid color-mix(in srgb, var(--ink) 40%, transparent);
    background: color-mix(in srgb, var(--night) 70%, transparent);
    color: var(--ink);
    cursor: pointer;
  }
  .chip[aria-checked="true"] {
    background: var(--glow);
    color: var(--night);
    border-color: var(--glow);
    font-weight: 700;
  }
  .go {
    justify-self: start;
    margin-top: 14px;
    font: inherit;
    font-weight: 800;
    padding: 12px 22px;
    border: 0;
    border-radius: 6px;
    background: var(--accent);
    color: var(--night);
    cursor: pointer;
  }
</style>
