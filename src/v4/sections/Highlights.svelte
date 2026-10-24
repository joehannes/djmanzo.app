<!--
  The highlights, at a glance: what makes djmanzo worth a look, one line
  each, every one a link to where the page explains it; under each, for
  whoever wants more, what is in it, feature by feature, and the way to
  every feature of its kind on the features page. The words are the facts'
  (`shared/facts.ts`).
-->
<script lang="ts">
  import { FACTS, FACT_BY_ID, type Area } from "../../../shared/facts";
  import { tf } from "../i18n/facts.svelte";
  import { href } from "../router";
  import { i18n } from "../i18n.svelte";
  import { HOME } from "../i18n/home";

  const ITEMS = [
    { key: "stems" as const, to: "#stems", area: "mixing" as Area, facts: ["stems", "outputs", "deckqueue", "transport", "fx", "sampler"], icon: "M3 6h18M3 10h12M3 14h16M3 18h8" },
    { key: "assistant" as const, to: "#assistant", area: "assist" as Area, facts: ["suggest", "asks", "automix", "autopilot-surface", "packs", "find"], icon: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.7 7.1 18.2 8 12.7 4 8.8 9.5 8z" },
    { key: "karaoke" as const, to: "#karaoke", area: "karaoke" as Area, facts: ["k-rotation", "k-voice", "k-words", "k-screen", "k-visuals", "k-mics", "k-breaks", "k-phones", "k-score", "k-quiz", "k-range", "k-guests", "k-record"], icon: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" },
    { key: "keys" as const, to: "#keys", area: "hands" as Area, facts: ["leader", "keysets", "keyboard", "palette"], icon: "M3 7h18v10H3zM7 11h.01M11 11h.01M15 11h.01M7 14h10" },
    { key: "tour" as const, to: "#tour", area: "hands" as Area, facts: ["launcher", "palette", "layouts", "deckqueue"], icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
    { key: "visuals" as const, to: "#visuals", area: "show" as Area, facts: ["visuals", "k-visuals", "lights", "live", "room"], icon: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
    { key: "learn" as const, to: "#learn", area: "learn" as Area, facts: ["teacher", "curriculum", "knowhow"], icon: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5" },
    { key: "hardware" as const, to: "#hardware", area: "hands" as Area, facts: ["mapped", "mapping", "platters", "dvs", "api"], icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
    { key: "market" as const, to: href("market"), area: "look" as Area, facts: ["marketplace", "keysets", "theme-packs", "look-studio"], icon: "M4 7h16l-1.5 11H5.5zM8 7a4 4 0 0 1 8 0" },
    { key: "pricing" as const, to: href("pricing"), area: "editions" as Area, facts: ["hobbyist-free", "editions", "trial", "quiet-cards"], icon: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  ];
  const w = $derived(HOME[i18n.lang]);
  const shipped = FACTS.filter((f) => f.status === "shipped").length;
  /** The features in a highlight that exist, by name, and how they stand. */
  const inIt = (ids: string[]) => ids.map((id) => FACT_BY_ID[id]).filter((f) => !!f).map(tf);
</script>

<section class="highlights" aria-labelledby="hl-title">
  <div class="wrap">
    <div class="head">
      <h2 class="h3" id="hl-title" data-reveal>{w.hl.title}</h2>
      <a class="all" href={href("features")} data-reveal>{w.hl.all.replace("{n}", String(shipped))}</a>
    </div>
    <ul class="grid">
      {#each ITEMS as it (it.key)}
        <li data-reveal>
          <a href={it.to}>
            <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d={it.icon} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
            <b>{w.hl.items[it.key].title}</b>
            <span class="text">{w.hl.items[it.key].text}</span>
          </a>
          <details class="more" data-more={it.area}>
            <summary>{w.hl.inIt} <span class="mono">{inIt(it.facts).length}</span></summary>
            <ul>
              {#each inIt(it.facts) as f (f.id)}
                <li title={f.about}>{f.name}{#if f.status !== "shipped"}<span class="st mono">{f.status === "part" ? w.hl.part : w.hl.planned}</span>{/if}</li>
              {/each}
            </ul>
            <a class="every" href={`${href("features")}#${it.area}`}>{w.hl.every}</a>
          </details>
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .highlights {
    padding: clamp(56px, 8vw, 96px) 0 0;
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 22px;
  }
  .all {
    color: var(--accent);
    font-weight: 600;
    text-decoration: none;
  }
  .grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    /* A card opened to its list grows alone, not its whole row. */
    align-items: start;
  }
  @media (max-width: 1100px) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (max-width: 720px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 440px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  .grid > li {
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    transition:
      border-color 0.2s,
      transform 0.2s,
      background-color 0.2s;
  }
  .grid > li:hover {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
    background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  }
  .grid > li > a {
    display: grid;
    align-content: start;
    gap: 8px;
    flex: 1;
    padding: 18px 18px 10px;
    text-decoration: none;
  }
  .more {
    padding: 0 18px 14px;
    font-size: 13px;
    color: var(--dim);
  }
  .more summary {
    cursor: pointer;
    color: var(--accent);
    font-weight: 600;
  }
  .more summary .mono {
    font-size: 11px;
    opacity: 0.8;
  }
  .more ul {
    margin: 8px 0;
    padding-left: 16px;
    display: grid;
    gap: 3px;
  }
  .st {
    margin-left: 6px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--accent);
  }
  .every {
    color: var(--accent);
    font-weight: 600;
    text-decoration: none;
  }
  .icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    color: var(--accent);
  }
  b {
    font: 600 16px/1.25 var(--display);
  }
  .text {
    font-size: 14px;
    color: var(--dim);
  }
</style>
