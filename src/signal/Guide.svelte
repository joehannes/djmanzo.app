<!--
  The guide: what do you do, and what does your night sound like? Each
  answer re-dresses the whole path at once.

  When the owner's key is set, Claude speaks for the guide (`worker/guide.ts`):
  the visitor answers with a tap or in their own words, and the guide answers
  back, re-dresses the path, and offers where to go — as buttons, which the
  visitor presses or not. The opening is the page's own. Without the key, or
  once the guide is capped or fails, the scripted questions below do the
  same job, and say why when it matters.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { EDITION_INFO, TRIAL_DAYS, type Edition } from "../../shared/catalog";
  import type { Action, GuideContext, Role } from "../../shared/guide";
  import { FAMILY_IDS, NODES, children, lineage, resolveStyle } from "../style/genome";
  import type { StageId } from "../style/genome/types";
  import { STAGE_BY_ID } from "../stages/script";
  import { signal } from "./state.svelte";
  import { senses } from "./sense/senses.svelte";
  import Consent from "./sense/Consent.svelte";
  import { talk, WHY, hhmm } from "./guide/talk.svelte";
  import { shotFor } from "./shots";

  interface Props {
    /** Where the visitor is on the path, for the guide's context. */
    stage?: StageId | null;
    /** Go to a stage (an offer the visitor pressed). */
    ongo: (s: StageId) => void;
    /** At Silence: the button that drops the needle and moves on. */
    ondone?: () => void;
  }
  let { stage = null, ongo, ondone }: Props = $props();

  const ROLES: { id: Role; label: string }[] = [
    { id: "dj", label: "I DJ" },
    { id: "karaoke", label: "I host karaoke" },
    { id: "learning", label: "I'm learning" },
    { id: "listening", label: "I just love the music" },
  ];
  const OPENING = "Before the first record, a question: what brings you here?";

  // The family the current style belongs to, and the genre within it, if any.
  const path = $derived(lineage(signal.style));
  const family = $derived(path[1] ?? null);
  const genres = $derived(family ? children(family) : []);
  const look = $derived(resolveStyle(signal.style).app);
  const shot = $derived(talk.showing ? shotFor([talk.showing], look.theme, look.skin) : null);
  let typed = $state("");
  let log = $state<HTMLOListElement>();

  onMount(() => void talk.init());

  // The newest line in view.
  $effect(() => {
    void talk.turns.length;
    void talk.thinking;
    log?.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  });

  function context(): GuideContext {
    return {
      stage: stage ?? undefined,
      style: signal.style,
      role: signal.role ?? undefined,
      visited: signal.visited,
      time: hhmm(new Date()),
      where: senses.consent.where === true,
      sky: senses.sky ?? undefined,
      lang: navigator.language,
    };
  }

  async function say(text: string) {
    for (const a of await talk.say(text, context())) {
      if (a.kind === "set_style") signal.setStyle(a.value);
      else if (a.kind === "set_role") signal.setRole(a.value as Role);
    }
  }

  function chooseRole(r: { id: Role; label: string }) {
    signal.setRole(r.id);
    if (talk.mode === "claude") void say(r.label);
  }

  function follow(a: Action) {
    talk.drop(a);
    if (a.kind === "go_to") return ongo(a.value as StageId);
    signal.pick = a.value as Edition;
    ongo("amp");
  }

  function offerLabel(a: Action): string {
    const name = (e: string) => EDITION_INFO[e as Edition]?.name ?? e;
    if (a.kind === "go_to") return `Take me to ${STAGE_BY_ID[a.value as StageId]?.name ?? a.value} →`;
    if (a.kind === "recommend") return `${name(a.value)}: ${EDITION_INFO[a.value as Edition]?.tagline ?? ""} See it →`;
    if (a.kind === "start_trial") return `Try ${name(a.value)} free for ${TRIAL_DAYS} days →`;
    return `To the box office: ${name(a.value)} →`;
  }

  function submit(e: SubmitEvent) {
    e.preventDefault();
    const t = typed;
    typed = "";
    void say(t);
  }
</script>

<div class="guide" data-guide data-mode={talk.mode}>
  {#if talk.mode === "claude"}
    <ol class="log" bind:this={log} aria-live="polite">
      <li class="guide-line">{OPENING}</li>
      {#each talk.turns as t, i (i)}
        <li class={t.from === "guide" ? "guide-line" : "visitor-line"}>{t.text}</li>
      {/each}
      {#if talk.thinking}<li class="guide-line thinking" aria-label="The guide is thinking"><span></span><span></span><span></span></li>{/if}
    </ol>

    <div class="chips" aria-label="Quick answers">
      {#if !talk.turns.length}
        {#each ROLES as r (r.id)}
          <button class="chip" onclick={() => chooseRole(r)} disabled={talk.thinking}>{r.label}</button>
        {/each}
      {:else}
        {#each talk.options as o (o)}
          <button class="chip" onclick={() => say(o)} disabled={talk.thinking}>{o}</button>
        {/each}
      {/if}
    </div>

    {#if shot}
      <figure>
        <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} />
        <figcaption>The real application: {shot.shows.split(":")[0]}, in the {shot.theme} theme{shot.skin ? `, with the ${shot.skin} skin` : ""}.</figcaption>
      </figure>
    {/if}

    {#each talk.offers as a (a.kind + a.value)}
      {#if a.kind === "ask"}
        {#if senses.consent[a.value as "where" | "gps"] === null}
          <Consent
            what={a.value as "where" | "gps"}
            onanswer={(yes) => {
              talk.drop(a);
              void say(yes ? "Yes, go ahead." : "No, thank you.");
            }}
          />
        {/if}
      {:else}
        <button class="offer" data-offer={a.kind} onclick={() => follow(a)}>{offerLabel(a)}</button>
      {/if}
    {/each}

    <form class="say" onsubmit={submit}>
      <input bind:value={typed} maxlength="600" placeholder="Or say it your way…" aria-label="Say something to the guide" disabled={talk.thinking} />
      <button disabled={!typed.trim() || talk.thinking}>Say</button>
    </form>
    <p class="who">The guide is Claude, an AI made by Anthropic, speaking for this site. What you type goes to it to be answered and is not kept here.</p>
  {:else}
    {#if talk.why && WHY[talk.why]}<p class="why">{WHY[talk.why]}</p>{/if}
    <p class="ask">What brings you here?</p>
    <div class="chips" role="radiogroup" aria-label="What you do">
      {#each ROLES as r (r.id)}
        <button class="chip" role="radio" aria-checked={signal.role === r.id} onclick={() => chooseRole(r)}>{r.label}</button>
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

    {#if family}<Consent what="where" />{/if}
  {/if}

  {#if ondone}<button class="go" onclick={ondone}>Drop the needle →</button>{/if}
</div>

<style>
  .guide {
    display: grid;
    gap: 10px;
  }
  .log {
    list-style: none;
    margin: 0;
    padding: 0 4px 0 0;
    display: grid;
    gap: 8px;
    max-height: min(40vh, 22rem);
    overflow: auto;
  }
  .log li {
    max-width: 85%;
    padding: 8px 12px;
    border-radius: 12px;
    line-height: 1.35;
  }
  .guide-line {
    justify-self: start;
    font-weight: 600;
    background: color-mix(in srgb, var(--accent) 22%, var(--night));
    border-bottom-left-radius: 2px;
  }
  .visitor-line {
    justify-self: end;
    background: color-mix(in srgb, var(--ink) 14%, var(--night));
    border-bottom-right-radius: 2px;
  }
  .thinking {
    display: flex;
    gap: 5px;
  }
  .thinking span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ink);
    animation: dot 1s infinite alternate;
  }
  .thinking span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .thinking span:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes dot {
    to {
      opacity: 0.2;
    }
  }
  .ask {
    margin: 10px 0 0;
    font-family: var(--display);
    font-size: 1.15rem;
  }
  .why,
  .who {
    margin: 0;
    font-size: 12.5px;
    opacity: 0.75;
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
  .offer {
    justify-self: start;
    font: inherit;
    text-align: left;
    padding: 10px 14px;
    border-radius: 8px;
    border: 0;
    background: color-mix(in srgb, var(--glow) 85%, var(--night));
    color: var(--night);
    font-weight: 700;
    cursor: pointer;
  }
  .say {
    display: flex;
    gap: 8px;
  }
  .say input {
    flex: 1;
    min-width: 0;
    font: inherit;
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--ink) 35%, transparent);
    background: color-mix(in srgb, var(--night) 80%, transparent);
    color: var(--ink);
  }
  .say button {
    font: inherit;
    padding: 9px 16px;
    border-radius: 8px;
    border: 0;
    background: var(--accent);
    color: var(--night);
    font-weight: 700;
    cursor: pointer;
  }
  figure {
    margin: 0;
  }
  figure img {
    width: 100%;
    height: auto;
    max-width: 30rem;
    border-radius: 3px;
  }
  figcaption {
    font-size: 12.5px;
    opacity: 0.8;
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
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
  @media (prefers-reduced-motion: reduce) {
    .thinking span {
      animation: none;
    }
  }
</style>
