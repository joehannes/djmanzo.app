<!--
  The journey: seven quick questions about how a DJ plays (where they are,
  where they play, their styles, their booth, their software, what is next
  and the money question), each skippable, and then the site drawn around
  the answers: the edition that fits and why, the next steps that matter
  for those nights, and their styles playing on the deck (`journey.ts`).
  Kept in this browser and in the page's address, so it can be shared.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { EDITION_INFO } from "../../../shared/catalog";
  import { GENRE_BY_ID } from "../../lib/genres";
  import { i18n } from "../i18n.svelte";
  import { JOURNEY } from "../i18n/journey";
  import { LOOPS } from "../loops";
  import { region, skin } from "../region.svelte";
  import { genresOf } from "../skins";
  import { deck, play, stop } from "../sound.svelte";
  import { href } from "../router";
  import { EMPTY, QUESTIONS, SINGLE, WHERE, answered, editionFor, fromQuery, stepsFor, toQuery, type Answers, type Question } from "../journey";

  const w = $derived(JOURNEY[i18n.lang]);
  const KEPT = "djmanzo:journey";
  const known = (g: string) => !!LOOPS[g] && !!GENRE_BY_ID[g];

  let a = $state<Answers>(structuredClone(EMPTY));
  /** −1 the welcome, 0…6 a question, 7 the journey. */
  let step = $state(-1);
  let more = $state(false);
  let copied = $state(false);
  let root: HTMLElement;

  onMount(() => {
    let from = fromQuery(location.search, known);
    if (!answered(from)) {
      try {
        from = fromQuery(localStorage.getItem(KEPT) ?? "", known);
      } catch {
        // A private window: nothing kept.
      }
    }
    if (answered(from)) {
      a = from;
      step = QUESTIONS.length;
    }
  });

  // The answers kept in this browser, and in the address once the journey is shown.
  $effect(() => {
    const q = toQuery(a);
    try {
      localStorage.setItem(KEPT, q);
    } catch {
      // Kept for this visit only.
    }
    if (step === QUESTIONS.length) history.replaceState(history.state, "", `/journey${q ? `?${q}` : ""}`);
  });

  const question = $derived<Question | null>(step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null);
  /** The styles to choose from: the visitor's region's first, then every other with a loop. */
  const region_ = $derived(genresOf(skin(), region.country));
  const everyStyle = $derived([...region_, ...Object.keys(LOOPS).filter((g) => known(g) && !region_.includes(g)).sort()]);
  const styles = $derived(more ? everyStyle : everyStyle.slice(0, Math.max(10, region_.length)));
  const options = $derived(question && question !== "styles" ? (Object.entries(w.options[question]) as [string, string][]) : []);

  function has(q: Question, v: string): boolean {
    const x = a[q];
    return Array.isArray(x) ? (x as string[]).includes(v) : x === v;
  }
  function choose(q: Question, v: string) {
    if (SINGLE.includes(q)) {
      (a as unknown as Record<string, string | null>)[q] = has(q, v) ? null : v;
      // One answer: on to the next question.
      if (has(q, v)) setTimeout(() => step < QUESTIONS.length && step++, 220);
      return;
    }
    const list = a[q] as string[];
    if (list.includes(v)) list.splice(list.indexOf(v), 1);
    else if (q !== "styles" || list.length < 8) list.push(v);
  }
  function go(to: number) {
    step = to;
    root?.scrollIntoView({ block: "start" });
  }

  const edition = $derived(editionFor(a));
  const info = $derived(EDITION_INFO[edition]);
  const steps = $derived(stepsFor(a));
  const software = $derived(a.software && a.software !== "none" ? w.options.software[a.software] : "");
  const who = $derived(a.you ? w.who[a.you] : null);
  /** What was said, as chips under the heading. */
  const said = $derived([...a.events.map((e) => w.options.events[e]), ...a.gear.filter((g) => g !== "none").map((g) => w.options.gear[g]), ...a.plans.map((p) => w.options.plans[p])]);
  const linkOf = (c: keyof typeof WHERE) => href(WHERE[c].page) + (WHERE[c].part ? `#${WHERE[c].part}` : "");
  const fillIn = (s: string) => s.replace("{software}", software);

  function hear(g: string) {
    if (deck.playing && deck.genre === g) stop();
    else play(g);
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/journey?${toQuery(a)}`);
      copied = true;
      setTimeout(() => (copied = false), 3500);
    } catch {
      copied = false;
    }
  }
  function again() {
    a = structuredClone(EMPTY);
    go(0);
  }
</script>

<div class="journey" bind:this={root} data-journey data-step={step}>
  <header class="head">
    <div class="wrap">
      <p class="eyebrow">{w.eyebrow}</p>
      {#if step < 0}
        <h1 class="h1">{@html w.title}</h1>
        <p class="lead">{w.lead}</p>
      {:else if step < QUESTIONS.length}
        <!-- Answering, the question is what matters: the promise steps back to one line. -->
        <h1 class="h3 asking">{@html w.title.replace(/([。！？])\s*<br\s*\/?>/g, "$1").replace(/<br\s*\/?>/g, " ")}</h1>
      {:else}
        <h1 class="h1" data-journey-heading>{who ? w.heading.replace("{who}", who) : w.yours}</h1>
        {#if said.length}
          <ul class="said" aria-label={w.change}>
            {#each said as s (s)}<li>{s}</li>{/each}
          </ul>
        {/if}
      {/if}
    </div>
  </header>

  <div class="wrap body">
    {#if step === -1}
      <button class="btn primary big" onclick={() => go(0)} data-journey-begin>{w.begin} →</button>
    {:else if question}
      <section class="ask card" aria-labelledby="ask-q" data-question={question}>
        <div class="meter" aria-hidden="true">
          {#each QUESTIONS as q, i (q)}<i class:done={i < step} class:now={i === step}></i>{/each}
        </div>
        <p class="mono dim count">{w.progress.replace("{n}", String(step + 1)).replace("{total}", String(QUESTIONS.length))}</p>
        <h2 class="h2" id="ask-q">{w.questions[question].q}</h2>
        <p class="dim hint">{w.questions[question].hint}</p>
        {#key question}
          <div class="options" role="group" aria-labelledby="ask-q">
            {#if question === "styles"}
              {#each styles as g (g)}
                <button class="chip opt" aria-pressed={has("styles", g)} onclick={() => choose("styles", g)} data-option={g}>{GENRE_BY_ID[g].emoji} {GENRE_BY_ID[g].name}</button>
              {/each}
              {#if !more && everyStyle.length > styles.length}
                <button class="chip more" onclick={() => (more = true)}>+ {everyStyle.length - styles.length}</button>
              {/if}
            {:else}
              {#each options as [id, label], i (id)}
                <button class="chip opt" style:--i={i} aria-pressed={has(question, id)} onclick={() => choose(question, id)} data-option={id}>{label}</button>
              {/each}
            {/if}
          </div>
        {/key}
        <div class="nav">
          <button class="btn ghost small" onclick={() => go(step - 1)} disabled={step === 0}>← {w.back}</button>
          <span class="grow"></span>
          {#if step < QUESTIONS.length - 1}
            <button class="btn ghost small" onclick={() => go(step + 1)} data-journey-skip>{w.skip}</button>
            <button class="btn primary small" onclick={() => go(step + 1)} data-journey-next>{w.next} →</button>
          {:else}
            <button class="btn primary small" onclick={() => go(QUESTIONS.length)} data-journey-finish>{w.finish} →</button>
          {/if}
        </div>
      </section>
    {:else}
      <div class="result">
        <section class="edition card" style:--c={info.colour} aria-labelledby="ed-h" data-journey-edition={edition}>
          <p class="mono dim">{w.forYou}</p>
          <h2 class="h2" id="ed-h">{info.name}</h2>
          <p>{w.why[edition as keyof typeof w.why] ?? w.why.hobbyist}</p>
          {#if a.edition === "free" && edition !== "hobbyist"}<p class="note">{w.freeNote}</p>{/if}
          <a class="btn primary small" href={href("pricing")}>{w.editions} →</a>
        </section>

        <section class="sound card" aria-labelledby="snd-h">
          <h2 class="h3" id="snd-h">{w.sound}</h2>
          {#if a.styles.length}
            <p class="dim small">{w.soundLead}</p>
            <div class="grooves">
              {#each a.styles as g (g)}
                <button class="chip groove" class:on={deck.playing && deck.genre === g} aria-pressed={deck.playing && deck.genre === g} onclick={() => hear(g)} aria-label={`${deck.playing && deck.genre === g ? w.stop : w.play}: ${GENRE_BY_ID[g].name}`} data-hear={g}>
                  <span class="pp" aria-hidden="true">{deck.playing && deck.genre === g ? "❚❚" : "▶"}</span>
                  {GENRE_BY_ID[g].emoji}
                  {GENRE_BY_ID[g].name}
                </button>
              {/each}
            </div>
          {:else}
            <p class="dim small">{w.noStyles}</p>
          {/if}
        </section>

        <section class="steps" aria-labelledby="steps-h">
          <h2 class="h2" id="steps-h">{w.stepsTitle}</h2>
          <ol>
            {#each steps as c, i (c)}
              <li style:--i={i} data-journey-step={c}>
                <a href={linkOf(c)} class="stepcard card">
                  <span class="n mono">{String(i + 1).padStart(2, "0")}</span>
                  <b>{fillIn(w.cards[c].t)}</b>
                  <span class="dim">{fillIn(w.cards[c].d)}</span>
                  <span class="go">{w.go} →</span>
                </a>
              </li>
            {/each}
          </ol>
        </section>

        <div class="after">
          <button class="btn ghost small" onclick={() => go(0)} data-journey-change>{w.change}</button>
          <button class="btn ghost small" onclick={again}>{w.again}</button>
          <button class="btn ghost small" onclick={share} data-journey-share>{w.share}</button>
          {#if copied}<span class="small" role="status">{w.copied}</span>{/if}
        </div>
        <p class="dim small kept">{w.kept}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .head {
    padding: calc(var(--bar) + 64px) 0 20px;
  }
  .asking {
    margin: 0;
    color: var(--dim);
  }
  .body {
    padding-bottom: 90px;
  }
  .big {
    font-size: 18px;
    padding: 16px 28px;
  }
  .said {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0;
    margin: 16px 0 0;
  }
  .said li {
    font: 500 12px/1 var(--mono);
    letter-spacing: 0.04em;
    padding: 7px 10px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
    color: var(--dim);
  }
  /* A question: one card, the answers as chips, the way on at its foot. */
  .ask {
    padding: clamp(18px, 3vw, 32px);
    display: grid;
    gap: 10px;
    max-width: 880px;
  }
  .meter {
    display: flex;
    gap: 6px;
  }
  .meter i {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--line);
    transition: background 0.3s;
  }
  .meter i.done {
    background: color-mix(in srgb, var(--accent) 55%, var(--line));
  }
  .meter i.now {
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
  }
  .count {
    font-size: 12px;
    margin: 6px 0 0;
  }
  .ask .h2 {
    margin: 0;
  }
  .hint {
    margin: 0 0 6px;
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .opt {
    min-height: 44px;
    padding: 0 16px;
    font-size: 15px;
    animation: rise 0.35s calc(var(--i, 0) * 30ms) both ease-out;
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
  .opt[aria-pressed="true"]::before {
    content: "✓";
    color: var(--accent);
    font-weight: 700;
  }
  .more {
    border-style: dashed;
  }
  .nav {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 12px;
  }
  .grow {
    flex: 1;
  }
  /* The journey: the edition and the sound side by side, the steps under them. */
  .result {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 16px;
  }
  .edition,
  .sound {
    padding: 22px;
    display: grid;
    align-content: start;
    gap: 10px;
  }
  .edition {
    border-color: color-mix(in srgb, var(--c) 55%, var(--line));
    background: linear-gradient(160deg, color-mix(in srgb, var(--c) 14%, var(--surface)), var(--surface) 60%);
  }
  .edition .h2 {
    margin: 0;
    color: var(--c);
  }
  .edition p {
    margin: 0;
  }
  .edition .btn {
    justify-self: start;
    margin-top: 4px;
  }
  .note {
    font-size: 14px;
    color: var(--dim);
  }
  .sound .h3 {
    margin: 0;
  }
  .grooves {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .groove .pp {
    font-size: 11px;
    color: var(--accent);
  }
  .groove.on {
    box-shadow: 0 0 14px color-mix(in srgb, var(--accent) 45%, transparent);
  }
  .steps {
    grid-column: 1 / -1;
  }
  .steps ol {
    list-style: none;
    padding: 0;
    margin: 14px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
  .steps li {
    animation: rise 0.45s calc(var(--i, 0) * 60ms) both ease-out;
  }
  .stepcard {
    height: 100%;
    display: grid;
    align-content: start;
    gap: 8px;
    padding: 18px;
    color: var(--text);
    text-decoration: none;
    transition:
      transform 0.2s,
      border-color 0.2s,
      box-shadow 0.2s;
  }
  .stepcard:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
    box-shadow: 0 14px 30px -18px color-mix(in srgb, var(--accent) 60%, transparent);
  }
  .stepcard .n {
    font-size: 12px;
    color: var(--accent);
  }
  .stepcard b {
    font-family: var(--display);
    font-weight: var(--display-weight, 600);
    font-size: 18px;
    line-height: 1.2;
  }
  .stepcard .go {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    margin-top: 4px;
  }
  .after {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .kept {
    grid-column: 1 / -1;
    margin: 0;
  }
  .small {
    font-size: 13px;
  }
  @media (max-width: 800px) {
    .result {
      grid-template-columns: 1fr;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .opt,
    .steps li {
      animation: none;
    }
  }
</style>
