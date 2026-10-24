<!--
  Questions a DJ asks before downloading anything, grouped, answered from
  the facts and the catalogue — never from hope.
-->
<script lang="ts">
  import { FACT_BY_ID } from "../../../shared/facts";
  import { PLAN_INFO, TRIAL_DAYS } from "../../../shared/catalog";
  import { href } from "../router";

  const f = (id: string) => `${FACT_BY_ID[id].about}${FACT_BY_ID[id].caveat ? ` ${FACT_BY_ID[id].caveat}` : ""}`;

  const GROUPS: { name: string; qa: [string, string][] }[] = [
    {
      name: "Price and licence",
      qa: [
        ["Is it really free?", `Yes: the Hobbyist edition. ${f("hobbyist-free")}`],
        ["Buy once, or subscribe?", `Either. ${PLAN_INFO.perpetual.name}: ${PLAN_INFO.perpetual.about} ${PLAN_INFO.monthly.name}: ${PLAN_INFO.monthly.about} ${PLAN_INFO.yearly.name}: ${PLAN_INFO.yearly.about}`],
        ["Why is it cheaper where I live?", "Prices follow what living costs: 40, 60 or 70 % off, by the World Bank's income groups, for a card and a billing address from there. Students and teachers pay half. Discounts never stack — you get the larger."],
        ["Can I try a paid edition first?", `${TRIAL_DAYS} days of any edition, Full included, once per account. ${FACT_BY_ID.trial.about.split(". ").slice(1).join(". ")}`],
        ["What if I outgrow my edition?", "Upgrade and pay only the difference: what you paid counts in full."],
      ],
    },
    {
      name: "Platforms and hardware",
      qa: [
        ["Does it really run on Linux?", f("linux")],
        ["And Windows?", f("windows")],
        ["My Mac is old.", f("oldmac")],
        ["Will my controller work?", "Search the hardware list above. With no shipped mapping, map it yourself in djmanzo: press a control, choose what it does."],
      ],
    },
    {
      name: "Privacy and the room",
      qa: [
        ["What does this page know about me?", "Only the country your connection comes from, to choose its look and its prices. The look you pick stays in your browser. The shop and the forum keep what you buy and post, as the privacy notice says."],
        ["Does djmanzo watch the crowd?", f("room")],
        ["Is the marketplace really free?", "Everything in it is free, for everyone: no payments, no commission. A maker may link their own tip jar. Packs are signed by their maker and checked before they are listed; other people's music is never allowed."],
      ],
    },
  ];
</script>

<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap grid">
    <div>
      <p class="eyebrow" data-reveal>Questions</p>
      <h2 class="h2" id="faq-title" data-reveal>Straight answers.</h2>
      <p class="lead" data-reveal>Something missing? <a href={href("community")}>Ask in the forum</a>, or ask the assistant at the bottom of the page.</p>
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
