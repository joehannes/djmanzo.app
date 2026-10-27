<!--
  The road ahead: everything not shipped yet, from `shared/facts.ts`'s
  `soon`, in three groups — almost there, in progress, planned — each with
  what it waits on. Each is drawn as a record with the needle part-way in:
  the arc it has travelled is how close it is, drawn as it scrolls into view.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { FACTS, type Fact } from "../../../shared/facts";
  import { t } from "../i18n.svelte";
  import { tf } from "../i18n/facts.svelte";
  import { gsap, reduced, ScrollTrigger } from "../motion";
  import { riser, scratch } from "../sfx.svelte";

  let { compact = false }: { compact?: boolean } = $props();

  const ORDER = ["almost", "progress", "planned"] as const;
  /** How far round the record the needle has come, for each kind of "soon". */
  const DONE = { almost: 0.86, progress: 0.55, planned: 0.18 } as const;
  const WORD = { almost: "road.almost", progress: "road.progress", planned: "road.planned" } as const;
  const ABOUT = { almost: "road.almostAbout", progress: "road.progressAbout", planned: "road.plannedAbout" } as const;
  const groups = ORDER.map((how) => ({ how, facts: FACTS.filter((f): f is Fact & { soon: NonNullable<Fact["soon"]> } => f.soon?.how === how) })).filter((g) => g.facts.length);

  const R = 26;
  const C = 2 * Math.PI * R;

  let root: HTMLElement;

  onMount(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      for (const arc of root.querySelectorAll<SVGCircleElement>("[data-arc]")) {
        const done = Number(arc.dataset.arc);
        gsap.fromTo(
          arc,
          { strokeDashoffset: C },
          { strokeDashoffset: C * (1 - done), duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: arc, start: "top 88%", once: true } },
        );
      }
      for (const arm of root.querySelectorAll<SVGGElement>("[data-arm]")) {
        gsap.fromTo(arm, { rotate: -32 }, { rotate: -32 + 26 * Number(arm.dataset.arm), svgOrigin: "60 8", duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: arm, start: "top 88%", once: true } });
      }
      const almost = root.querySelector("[data-group='almost']");
      if (almost) ScrollTrigger.create({ trigger: almost, start: "top 75%", once: true, onEnter: () => riser(0.9) });
    }, root);
    return () => ctx.revert();
  });
</script>

<section class="road" class:compact id="road-ahead" bind:this={root} aria-labelledby="road-title">
  <div class="wrap">
    <p class="eyebrow" data-reveal>{t("road.eyebrow")}</p>
    <h2 class="h2" id="road-title" data-split>{t("road.title")}</h2>
    <p class="lead" data-reveal>{t("road.lead")}</p>
    {#each groups as g (g.how)}
      <div class="group" data-group={g.how}>
        <h3 class="h3" data-reveal>{t(WORD[g.how])}</h3>
        <p class="dim small about" data-reveal>{t(ABOUT[g.how])}</p>
        <ul class="items">
          {#each g.facts as raw (raw.id)}
            {@const f = tf(raw) as typeof raw}
            <li class="item card" data-reveal data-soon={f.id}>
              <button class="disc" aria-label={`${f.name}: ${t(WORD[g.how])}`} onclick={scratch}>
                <svg viewBox="0 0 72 72" aria-hidden="true">
                  <circle cx="36" cy="36" r="33" class="vinyl" />
                  <circle cx="36" cy="36" r="{R}" class="groove" />
                  <circle cx="36" cy="36" r="{R}" class="done" data-arc={DONE[g.how]} stroke-dasharray={C} stroke-dashoffset={C * (1 - DONE[g.how])} transform="rotate(-90 36 36)" />
                  <circle cx="36" cy="36" r="9" class="label" />
                  <circle cx="36" cy="36" r="1.6" class="spindle" />
                  <g data-arm={DONE[g.how]} class="arm"><line x1="60" y1="8" x2="44" y2="30" /><circle cx="60" cy="8" r="3" /></g>
                </svg>
              </button>
              <div>
                <b>{f.name}</b>
                <p class="small">{f.about}</p>
                <p class="waits small"><span class="tag {g.how}">{t(WORD[g.how])}</span> {f.soon.waits}</p>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<style>
  .road {
    padding: clamp(64px, 10vw, 120px) 0;
  }
  .group {
    margin-top: 36px;
  }
  .about {
    margin: 4px 0 0;
  }
  .items {
    list-style: none;
    padding: 0;
    margin: 14px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
    gap: 12px;
  }
  .compact .items {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  }
  .item {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 14px;
    align-items: start;
    padding: 16px;
  }
  .compact .item p:not(.waits) {
    display: none;
  }
  .disc {
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    width: 72px;
    height: 72px;
  }
  .disc:hover svg {
    animation: spin 1.6s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .disc:hover svg {
      animation: none;
    }
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .vinyl {
    fill: #111;
    stroke: color-mix(in srgb, var(--text) 20%, transparent);
  }
  .groove {
    fill: none;
    stroke: color-mix(in srgb, var(--text) 14%, transparent);
    stroke-width: 6;
  }
  .done {
    fill: none;
    stroke: var(--accent);
    stroke-width: 6;
    stroke-linecap: round;
  }
  .label {
    fill: var(--accent2, var(--accent));
  }
  .spindle {
    fill: #111;
  }
  .arm line {
    stroke: var(--text);
    stroke-width: 2.5;
    stroke-linecap: round;
  }
  .arm circle {
    fill: var(--text);
  }
  .item b {
    font: var(--display-weight, 600) 17px/1.25 var(--display);
  }
  .item p {
    margin: 6px 0 0;
  }
  .waits {
    color: var(--dim);
  }
  .tag {
    display: inline-block;
    margin-right: 6px;
    padding: 1px 8px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid var(--line);
  }
  .tag.almost {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
  }
  .tag.progress {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
