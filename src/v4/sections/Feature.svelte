<!--
  A feature told with a photograph: the picture drifts at its own depth
  beside the words, and the facts follow, with their caveats.
-->
<script lang="ts">
  import FactList from "./FactList.svelte";

  let {
    id,
    eyebrow,
    title,
    lead,
    facts,
    image,
    alt,
    flip = false,
    children,
  }: { id: string; eyebrow: string; title: string; lead: string; facts: string[]; image: string; alt: string; flip?: boolean; children?: import("svelte").Snippet } = $props();
</script>

<section class="section feature" class:flip {id} aria-labelledby={`${id}-title`}>
  <div class="wrap grid">
    <div class="pic" data-reveal>
      <div class="img" data-parallax="0.18" style:background-image={`url(${image})`} role="img" aria-label={alt}></div>
    </div>
    <div class="words">
      <p class="eyebrow" data-reveal>{eyebrow}</p>
      <h2 class="h2" id={`${id}-title`} data-split>{title}</h2>
      <p class="lead" data-reveal>{lead}</p>
      <FactList ids={facts} />
      {@render children?.()}
    </div>
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: clamp(32px, 6vw, 88px);
    align-items: center;
  }
  .flip .pic {
    order: 2;
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
    .flip .pic {
      order: 0;
    }
  }
  .pic {
    position: relative;
    aspect-ratio: 4 / 5;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid var(--line);
  }
  @media (max-width: 900px) {
    .pic {
      aspect-ratio: 16 / 10;
    }
  }
  .img {
    position: absolute;
    inset: -12% 0;
    background-size: cover;
    background-position: center;
  }
  .pic::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--bg) 70%, transparent));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 6%, transparent);
  }
</style>
