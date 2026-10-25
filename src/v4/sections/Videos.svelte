<!--
  The owner's videos of djmanzo (`videos.ts`), added in Backstage: a card
  for each, in the order of the part of the page it shows, and nothing at
  all while there are none. A card is only a title until it is pressed;
  then YouTube's no-cookie player loads in its place.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "../i18n.svelte";
  import { BITS } from "../i18n/bits";
  import { fill } from "../i18n/sections";
  import { ordered, playerSrc, videos, type Video } from "../videos";

  const w = $derived(BITS[i18n.lang].videos);
  let list = $state<Video[]>([]);
  let playing = $state<string | null>(null);

  onMount(() => {
    void videos().then((v) => (list = ordered(v)));
  });
</script>

{#if list.length}
  <section class="section videos" id="videos" aria-labelledby="videos-title" data-videos>
    <div class="wrap">
      <h2 class="h2" id="videos-title">{w.title}</h2>
      <p class="lead">{w.lead}</p>
      <div class="grid">
        {#each list as v (v.id)}
          <figure class="card">
            {#if playing === v.id}
              <iframe src={playerSrc(v)} title={v.title} allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
            {:else}
              <button class="poster" onclick={() => (playing = v.id)} aria-label={fill(w.play, { title: v.title })} data-video={v.id}>
                <span class="play" aria-hidden="true">▶</span>
              </button>
            {/if}
            <figcaption>{v.title}</figcaption>
          </figure>
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 20px;
    margin-top: 28px;
  }
  .card {
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
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--on-accent);
    font-size: 24px;
    padding-left: 4px;
  }
  .poster:hover .play,
  .poster:focus-visible .play {
    transform: scale(1.06);
  }
  figcaption {
    padding: 12px 16px;
    font-weight: 600;
  }
</style>
