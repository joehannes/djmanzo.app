<!--
  Questions a DJ asks before downloading anything, grouped, answered from
  the facts and the catalogue — never from hope.
-->
<script lang="ts">
  import { FACT_BY_ID } from "../../../shared/facts";
  import { TRIAL_DAYS } from "../../../shared/catalog";
  import { href } from "../router";
  import { i18n } from "../i18n.svelte";
  import { tf } from "../i18n/facts.svelte";
  import { SECTIONS, fill } from "../i18n/sections";

  const w = $derived(SECTIONS[i18n.lang].faq);
  /** A feature's own words and its caveat, in the visitor's language (`shared/facts.ts`). */
  const f = (id: string) => {
    const x = tf(FACT_BY_ID[id]);
    return `${x.about}${x.caveat ? ` ${x.caveat}` : ""}`;
  };
  /** All but a text's first sentence. */
  const rest = (text: string) => text.split(/(?<=[.。])\s*/).slice(1).join(i18n.lang === "ja" ? "" : " ");

  const GROUPS = $derived<{ name: string; qa: [string, string][] }[]>([
    {
      name: w.price,
      qa: [[w.free[0], `${w.free[1]} ${f("hobbyist-free")}`], w.plans, w.cheaper, [w.trial[0], `${fill(w.trial[1], { days: TRIAL_DAYS })} ${rest(tf(FACT_BY_ID.trial).about)}`], w.upgrade],
    },
    {
      name: w.platforms,
      qa: [[w.linux, f("linux")], [w.windows, f("windows")], [w.oldmac, f("oldmac")], w.controller],
    },
    {
      name: w.privacy,
      qa: [w.knows, [w.watch, f("room")], w.market],
    },
  ]);
</script>

<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap grid">
    <div>
      <p class="eyebrow" data-reveal>{w.eyebrow}</p>
      <h2 class="h2" id="faq-title" data-split>{w.title}</h2>
      <p class="lead" data-reveal>{@html fill(w.lead, { community: href("community") })}</p>
    </div>
    <div class="groups">
      {#each GROUPS as g (g.name)}
        <div class="group" data-reveal>
          <h3 class="mono">{g.name}</h3>
          {#each g.qa as [q, a] (q)}
            <details>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: clamp(32px, 6vw, 80px);
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  .lead a {
    color: var(--accent);
  }
  .group + .group {
    margin-top: 36px;
  }
  h3 {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    font-weight: 500;
    margin: 0 0 8px;
  }
  details {
    border-bottom: 1px solid var(--line);
  }
  summary {
    list-style: none;
    cursor: pointer;
    padding: 18px 36px 18px 0;
    font: 600 17px/1.35 var(--body);
    position: relative;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary::after {
    content: "+";
    position: absolute;
    right: 6px;
    top: 14px;
    font: 300 24px/1 var(--body);
    color: var(--accent);
    transition: transform 0.25s;
  }
  details[open] summary::after {
    transform: rotate(45deg);
  }
  details p {
    margin: 0 0 18px;
    color: var(--dim);
    max-width: 44rem;
  }
</style>
