<!--
  The visitor's scene, made practical: what djmanzo actually does for DJs in
  this region, drawn entirely from shared/facts.ts — the single source of
  truth for every claim on the site. Nothing here is invented; each card
  names a shipped feature and its source document.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { gsap, ScrollTrigger } from "../motion";
  import { skin, region } from "../region.svelte";
  import { flavourOf } from "../../../shared/flavours";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { bankOfGenres } from "../skins";
  import { i18n } from "../i18n.svelte";
  import { FACTS, type Fact } from "../../../shared/facts";
  import ShaderBackdrop from "./ShaderBackdrop.svelte";

  const s = $derived(skin());
  const flavour = $derived(flavourOf(region.country));
  const grooves = $derived(bankOfGenres(s, region.country));
  const localGenres = $derived(grooves.local.map((id) => GENRE_BY_ID[id]).filter(Boolean));
  const caps = (t: string) => t.toLocaleUpperCase(i18n.lang);

  /**
   * Facts relevant to this skin's region, filtered to shipped features only.
   * Each fact carries its own `scene` — a moment from a DJ's working life
   * where this is what helps — written in facts.ts and verified against the
   * app's documentation. We surface the four most scene-relevant facts here.
   */
  const sceneFacts = $derived.by(() => {
    // Prefer facts that have a `scene` field and are shipped.
    const withScene = FACTS.filter((f) => f.status === "shipped" && f.scene);
    // Rank by relevance to this skin's genre family and region.
    const scored = withScene.map((f) => {
      let score = 0;
      // Boost facts whose module matches the skin's family.
      if (f.module === "foundation") score += 1;
      if (s.family === "latin" && (f.module === "karaoke" || f.id === "automix")) score += 3;
      if (s.family === "edm" && (f.id === "stems" || f.id === "fx" || f.id === "pads")) score += 3;
      if (s.family === "urban" && (f.id === "keyboard" || f.id === "dvs" || f.id === "mapped")) score += 3;
      if (s.family === "party" && (f.id === "karaoke" || f.id === "requests" || f.id === "k-phones")) score += 3;
      // Boost facts that mention genres in this skin's local list.
      const aboutLower = f.about.toLowerCase();
      for (const g of grooves.local) {
        const name = GENRE_BY_ID[g]?.name?.toLowerCase() ?? "";
        if (name && aboutLower.includes(name)) score += 2;
      }
      return { fact: f, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 4).map((s) => s.fact);
  });

  let root: HTMLElement;
  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-scene-card]", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });
      gsap.from("[data-scene-genre]", {
        scale: 0.85,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.8)",
        stagger: 0.04,
        scrollTrigger: { trigger: "[data-scene-genres]", start: "top 90%", once: true },
      });
    }, root);
    return () => ctx.revert();
  });
</script>

<section class="section scene" bind:this={root} id="scene" aria-labelledby="scene-title">
  <ShaderBackdrop />
  <div class="wrap">
    <p class="eyebrow" data-reveal>{caps(s.name)} · {caps("Scene")}</p>
    <h2 class="h2" id="scene-title" data-split>{s.line}</h2>
    <p class="lead" data-reveal>
      {flavour?.scene
        ? `${flavour.hello} — ${flavour.scene}.`
        : `What djmanzo does for DJs in ${s.region}.`}
    </p>

    <div class="grid">
      <!-- Left: the genres this scene plays, as tactile chips. -->
      <div class="card panel genres-panel" data-scene-card data-scene-genres>
        <span class="panel-label mono">{caps("Local Grooves")}</span>
        <div class="genre-row">
          {#each localGenres as g (g.id)}
            <span class="genre-chip" data-scene-genre>
              <span class="emoji" aria-hidden="true">{g.emoji}</span>
              <span class="name">{g.name}</span>
              {#if g.bpm}<span class="bpm mono">{g.bpm[0]}–{g.bpm[1]}</span>{/if}
            </span>
          {/each}
        </div>
        {#if grooves.special.length}
          <span class="panel-label mono special-label">{caps("Specials")}</span>
          <div class="genre-row">
            {#each grooves.special as id (id)}
              {@const g = GENRE_BY_ID[id]}
              {#if g}
                <span class="genre-chip special" data-scene-genre>
                  <span class="emoji" aria-hidden="true">{g.emoji}</span>
                  <span class="name">{g.name}</span>
                </span>
              {/if}
            {/each}
          </div>
        {/if}
      </div>

      <!-- Right: four real features, each with its scene from facts.ts. -->
      <div class="cards">
        {#each sceneFacts as fact (fact.id)}
          <article class="card practice-card" data-scene-card>
            <span class="practice-icon" aria-hidden="true">
              {#if fact.module === "stems"}∿
              {:else if fact.module === "karaoke"}♤
              {:else if fact.module === "teacher"}✎
              {:else if fact.module === "assistant"}⚡
              {:else if fact.module === "controllers"}⎔
              {:else if fact.module === "video"}◎
              {:else if fact.module === "crowd"}◉
              {:else}●
              {/if}
            </span>
            <div>
              <h3 class="h3 mono">{caps(fact.name)}</h3>
              <p>{fact.scene ?? fact.about}</p>
              <span class="source dim mono">{fact.source}</span>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .scene {
    overflow: hidden;
    isolation: isolate;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    gap: clamp(24px, 4vw, 56px);
    margin-top: clamp(28px, 5vw, 48px);
    align-items: start;
  }
  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
  }

  /* Genre panel */
  .panel {
    padding: 20px;
    border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
    background:
      radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 40%),
      var(--surface);
  }
  .panel-label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.14em;
    color: var(--dim);
    margin-bottom: 10px;
  }
  .special-label { margin-top: 14px; }
  .genre-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .genre-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 13px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line));
    background: color-mix(in srgb, var(--raised) 80%, transparent);
    font-size: 13px;
    transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .genre-chip:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px -6px color-mix(in srgb, var(--accent) 40%, transparent);
  }
  .genre-chip.special {
    border-color: color-mix(in srgb, var(--accent-2) 35%, var(--line));
  }
  .genre-chip.special:hover {
    border-color: var(--accent-2);
    box-shadow: 0 4px 16px -6px color-mix(in srgb, var(--accent-2) 40%, transparent);
  }
  .emoji { font-size: 15px; line-height: 1; }
  .name { font-weight: 500; }
  .bpm {
    font-size: 11px;
    color: var(--dim);
    letter-spacing: 0.04em;
  }

  /* Practice cards */
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 600px) {
    .cards { grid-template-columns: 1fr; }
  }
  .practice-card {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 18px;
    border-color: color-mix(in srgb, var(--line) 80%, transparent);
    transition: border-color 0.25s, transform 0.2s;
  }
  .practice-card:hover {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--line));
    transform: translateY(-2px);
  }
  .practice-icon {
    flex: none;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 14%, var(--raised));
    color: var(--accent);
    font-size: 18px;
    line-height: 1;
  }
  .practice-card h3 {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 6px;
  }
  .practice-card p {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: var(--dim);
  }
  .source {
    display: block;
    margin-top: 8px;
    font-size: 10px;
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
</style>