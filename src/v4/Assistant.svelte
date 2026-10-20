<!--
  The assistant: the site's guide (`/api/guide`, on the free Workers AI),
  asked from any page. It answers from the facts, and what it proposes are
  buttons — a section, an edition, the checkout — and when it hears what the
  visitor plays, the site changes its look to match. When the AI is off or
  today's allowance is spent, it says so and answers the common questions
  from a script.
-->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { post, api } from "../lib/api";
  import { NAMED, type Edition } from "../../shared/catalog";
  import type { Action, GuideAnswer, Turn } from "../../shared/guide";
  import { catalog } from "../lib/catalog.svelte";
  import { choose, skin } from "./region.svelte";
  import { skinForStyle, SKIN_BY_ID } from "./skins";
  import { STAGE_TO, href, stageOf, type Route } from "./router";
  import { gsap, reduced } from "./motion";

  let { route }: { route: Route } = $props();

  interface Line {
    from: "visitor" | "guide";
    text: string;
    options?: string[];
    actions?: Action[];
  }

  let open = $state(false);
  let on = $state<boolean | null>(null);
  let lines = $state<Line[]>([]);
  let draft = $state("");
  let busy = $state(false);
  let panel: HTMLElement | undefined = $state();
  let log: HTMLElement | undefined = $state();

  const SCRIPT: { q: string; a: string; actions: Action[] }[] = [
    {
      q: "What makes djmanzo different?",
      a: "Live stems on any record, an assistant that explains its suggestions and can run the mix until you touch a control, a karaoke night built in, native on Linux as well as macOS — and a Hobbyist edition that is free for ever.",
      actions: [{ kind: "go_to", value: "needle" }],
    },
    { q: "Which edition fits me?", a: "Tell the shop what you do — playing for fun, working, hosting karaoke, learning — and it points at the edition that carries exactly that.", actions: [{ kind: "go_to", value: "amp" }] },
    { q: "Is it free?", a: "The Hobbyist edition is: two decks, the mixer, the library, cues, loops and pads, the effects, the sampler, recording, the keyboard and a controller. Any other edition can be tried for seven days.", actions: [{ kind: "start_trial", value: "" }] },
    { q: "Will my controller work?", a: "Search the hardware list: mappings ship for eleven controllers and a generic two-deck one, written from each maker's table — none has yet met its device. Anything else you can map yourself.", actions: [{ kind: "go_to", value: "floor" }] },
  ];

  function hello() {
    if (lines.length) return;
    lines.push({
      from: "guide",
      text: `Hi — I'm djmanzo's assistant. Ask me anything about the software, or tell me what you play and I'll show you around.${on === false ? " (The AI is resting right now, so I'll answer the common questions.)" : ""}`,
      options: SCRIPT.map((s) => s.q),
    });
  }

  async function toggle() {
    open = !open;
    if (open) {
      hello();
      await tick();
      if (panel && !reduced()) gsap.fromTo(panel, { y: 24, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" });
      panel?.querySelector<HTMLInputElement>("input")?.focus();
    }
  }

  function sectionInView(): string | null {
    const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("section[id]");
    return el?.id ?? null;
  }

  async function say(text: string) {
    text = text.trim();
    if (!text || busy) return;
    draft = "";
    lines.push({ from: "visitor", text });
    const scripted = SCRIPT.find((s) => s.q === text);
    if (scripted && on !== true) {
      lines.push({ from: "guide", text: scripted.a, actions: scripted.actions });
      return scroll();
    }
    busy = true;
    void scroll();
    const turns: Turn[] = lines.slice(-12).map((l) => ({ from: l.from, text: l.text }));
    try {
      const now = new Date();
      const answer = await post<GuideAnswer>("/api/guide", {
        turns,
        context: { stage: stageOf(route, sectionInView()), style: skin().family, lang: navigator.language, time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` },
      });
      if ("fallback" in answer) {
        const s = scripted ?? SCRIPT[0];
        const why = answer.fallback === "limit" ? "Today's free AI is used up" : answer.fallback === "off" ? "The AI is off" : "The AI did not answer";
        lines.push({ from: "guide", text: `${why}, so here is the short answer. ${scripted ? scripted.a : "Pick a question below, or look around: everything here says what ships and what is planned."}`, options: scripted ? undefined : SCRIPT.map((x) => x.q), actions: s === scripted ? s.actions : [] });
      } else {
        for (const a of answer.actions) if (a.kind === "set_style") applyStyle(a.value);
        lines.push({ from: "guide", text: answer.say, options: answer.options, actions: answer.actions.filter((a) => a.kind !== "set_style" && a.kind !== "set_role" && a.kind !== "ask") });
      }
    } catch {
      lines.push({ from: "guide", text: "I couldn't reach the server. The questions below still work.", options: SCRIPT.map((s) => s.q) });
    } finally {
      busy = false;
      void scroll();
    }
  }

  /** The guide heard what the visitor plays: dress the site in it. */
  function applyStyle(node: string) {
    const id = skinForStyle(node);
    if (id && id !== skin().id) {
      choose(id);
      lines.push({ from: "guide", text: `I've dressed the site in the ${SKIN_BY_ID[id].name} look for you — change it any time, top right.` });
    }
  }

  function label(a: Action): string {
    const ed = (v: string) => catalog.data?.editions[v as Edition]?.name ?? v;
    switch (a.kind) {
      case "go_to":
        return a.value === "amp" ? "Open the shop" : `Show me: ${STAGE_TO[a.value]?.section ?? a.value}`;
      case "show":
        return "Show me the screen";
      case "recommend":
        return `See ${ed(a.value)}`;
      case "start_trial":
        return "Try an edition free";
      case "open_checkout":
        return "Go to checkout";
      default:
        return a.value;
    }
  }

  function act(a: Action) {
    if (a.kind === "go_to" || a.kind === "show") {
      const to = a.kind === "show" ? { page: "home" as const, section: "tour" } : STAGE_TO[a.value];
      if (!to) return;
      if (to.page !== "home") location.hash = href(to.page);
      else {
        if (route.page !== "home") location.hash = "#/";
        requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(to.section ?? "top")?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" })));
      }
    } else if (a.kind === "recommend" && (NAMED as string[]).concat("custom").includes(a.value)) location.hash = `${href("pricing")}?edition=${a.value}`;
    else if (a.kind === "start_trial" || a.kind === "open_checkout") {
      location.hash = href("pricing");
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById("checkout")?.scrollIntoView()));
    }
  }

  async function scroll() {
    await tick();
    log?.scrollTo({ top: log.scrollHeight, behavior: reduced() ? "auto" : "smooth" });
  }

  onMount(() => {
    api<{ on: boolean }>("/api/guide").then((r) => (on = r.on), () => (on = false));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && open && (open = false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  });
</script>

<div class="assistant">
  {#if open}
    <div class="panel card" bind:this={panel} role="dialog" aria-label="Ask djmanzo" data-assistant>
      <header>
        <span class="pulse" class:off={on === false}></span>
        <b>Ask djmanzo</b>
        <span class="mono dim">{on === false ? "scripted answers" : "free AI, can be wrong"}</span>
        <button class="x" onclick={() => (open = false)} aria-label="Close">×</button>
      </header>
      <div class="log" bind:this={log} aria-live="polite">
        {#each lines as l, i (i)}
          <div class="line {l.from}" data-line={l.from}>
            <p>{l.text}</p>
            {#if l.actions?.length}
              <div class="acts">
                {#each l.actions as a, j (j)}<button class="btn primary small" onclick={() => act(a)} data-act={a.kind}>{label(a)}</button>{/each}
              </div>
            {/if}
            {#if l.options?.length && i === lines.length - 1}
              <div class="opts">
                {#each l.options as o (o)}<button class="chip" onclick={() => say(o)}>{o}</button>{/each}
              </div>
            {/if}
          </div>
        {/each}
        {#if busy}<div class="line guide"><p class="typing"><i></i><i></i><i></i></p></div>{/if}
      </div>
      <form onsubmit={(e) => (e.preventDefault(), say(draft))}>
        <input type="text" bind:value={draft} placeholder="What do you play? What do you need?" aria-label="Your question" maxlength="400" />
        <button class="btn primary small" disabled={busy || !draft.trim()}>Send</button>
      </form>
    </div>
  {/if}
  <button class="fab" onclick={toggle} aria-expanded={open} data-ask>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    <span>{open ? "Close" : "Ask djmanzo"}</span>
  </button>
</div>

<style>
  .assistant {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 60;
    display: grid;
    justify-items: end;
    gap: 12px;
  }
  .fab {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 48px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--line));
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    backdrop-filter: blur(12px);
    color: var(--text);
    font: 600 14px var(--body);
    cursor: pointer;
    box-shadow: 0 16px 40px -10px rgb(0 0 0 / 0.6);
  }
  .fab svg {
    color: var(--accent);
  }
  .panel {
    width: min(400px, calc(100vw - 40px));
    height: min(560px, calc(100svh - 120px));
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    backdrop-filter: blur(16px);
    box-shadow: 0 30px 80px -10px rgb(0 0 0 / 0.7);
  }
  header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--line);
  }
  header .mono {
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-2);
    box-shadow: 0 0 10px var(--accent-2);
  }
  .pulse.off {
    background: var(--dim);
    box-shadow: none;
  }
  .x {
    margin-left: auto;
    border: 0;
    background: none;
    color: var(--dim);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
  }
  .log {
    overflow-y: auto;
    padding: 16px;
    display: grid;
    align-content: start;
    gap: 12px;
  }
  .line p {
    margin: 0;
    padding: 10px 13px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    width: fit-content;
    max-width: 92%;
  }
  .line.guide p {
    background: var(--raised);
    border-top-left-radius: 4px;
  }
  .line.visitor {
    justify-items: end;
    display: grid;
  }
  .line.visitor p {
    background: var(--accent);
    color: var(--on-accent);
    border-top-right-radius: 4px;
  }
  .acts,
  .opts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
  .opts .chip {
    min-height: 30px;
    font-size: 13px;
  }
  form {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid var(--line);
  }
  input {
    flex: 1;
    min-width: 0;
    font: 14px var(--body);
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
  }
  .typing {
    display: flex !important;
    gap: 4px;
  }
  .typing i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--dim);
    animation: dot 1s infinite ease-in-out;
  }
  .typing i:nth-child(2) {
    animation-delay: 0.15s;
  }
  .typing i:nth-child(3) {
    animation-delay: 0.3s;
  }
  @keyframes dot {
    50% {
      opacity: 0.2;
      transform: translateY(-3px);
    }
  }
  @media (max-width: 520px) {
    .fab span {
      display: none;
    }
    .fab {
      width: 48px;
      padding: 0;
      justify-content: center;
    }
  }
</style>
