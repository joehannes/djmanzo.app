<!--
  The assistant, asked from any page. The questions it offers are answered
  in advance (`i18n/assistant.ts`), from what djmanzo actually does, in the
  visitor's language, at once and the same for everyone. Only a question
  the visitor writes in their own words goes to the AI (`/api/guide`, on the
  free Workers AI), told the language they read the site in. What either
  proposes are buttons — a section, an edition, the checkout — and when it
  hears what the visitor plays, the site changes its look to match. When the
  AI is off or today's allowance is spent, it says so and offers the
  questions it can answer.
-->
<script lang="ts">
  import { track } from "./insights";
  import { onMount, tick } from "svelte";
  import { post, api } from "../lib/api";
  import { NAMED, type Edition } from "../../shared/catalog";
  import type { Action, GuideAnswer, Turn } from "../../shared/guide";
  import { catalog } from "../lib/catalog.svelte";
  import { choose, skin } from "./region.svelte";
  import { skinForStyle, SKIN_BY_ID } from "./skins";
  import { STAGE_TO, href, navigate, stageOf, type Route } from "./router";
  import { gsap, reduced } from "./motion";
  import { LANG_INFO, i18n, t } from "./i18n.svelte";
  import { CANNED, CANNED_BY_ID, answerOf, questionOf } from "./i18n/assistant";
  import type { Key } from "./i18n/strings";

  let { route }: { route: Route } = $props();

  /**
   * A line of the conversation. The site's own lines are kept as what they
   * are (a phrase's key, a canned question or answer), not as words, so they
   * follow the visitor into another language; the AI's and the visitor's
   * own words are kept as written.
   */
  interface Line {
    from: "visitor" | "guide";
    text?: string;
    say?: { key: Key; vars?: Record<string, string> }[];
    /** A canned question (the visitor's line) or its answer (the guide's). */
    canned?: string;
    /** Canned questions offered under the line, by id. */
    offer?: string[];
    /** The AI's suggested replies, sent to it as written. */
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

  const ALL = CANNED.map((c) => c.id);
  /** The canned questions not yet asked. */
  const unasked = () => ALL.filter((id) => !lines.some((l) => l.from === "visitor" && l.canned === id));

  /** A line in the visitor's language, as it reads now. */
  function words(l: Line): string {
    if (l.canned) return l.from === "visitor" ? questionOf(CANNED_BY_ID[l.canned], i18n.lang) : answerOf(CANNED_BY_ID[l.canned], i18n.lang);
    if (l.say) return l.say.map((p) => t(p.key, p.vars)).join(" ");
    return l.text ?? "";
  }

  function hello() {
    if (lines.length) return;
    lines.push({ from: "guide", say: on === false ? [{ key: "ask.hello" }, { key: "ask.resting" }] : [{ key: "ask.hello" }], offer: ALL });
  }

  /** A question offered as a button: answered from what djmanzo does, without the AI. */
  function ask(id: string) {
    if (busy) return;
    track("click", `assistant:${id}`);
    lines.push({ from: "visitor", canned: id });
    const left = unasked();
    lines.push({ from: "guide", canned: id, actions: CANNED_BY_ID[id].actions, offer: left.length ? left : undefined });
    void scroll();
  }

  async function toggle() {
    open = !open;
    if (open) {
      track("click", "assistant:open");
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

  /** The visitor's own words: a canned question typed out is answered as one; anything else goes to the AI. */
  async function say(text: string) {
    text = text.trim();
    if (!text || busy) return;
    draft = "";
    const typed = CANNED.find((c) => Object.values(c.q).some((q) => q.toLowerCase() === text.toLowerCase()));
    if (!typed) track("ask", text);
    if (typed) return ask(typed.id);
    lines.push({ from: "visitor", text });
    busy = true;
    void scroll();
    const turns: Turn[] = lines.slice(-12).map((l) => ({ from: l.from, text: words(l) }));
    try {
      const now = new Date();
      const answer = await post<GuideAnswer>("/api/guide", {
        turns,
        context: { stage: stageOf(route, sectionInView()), style: skin().family, lang: LANG_INFO[i18n.lang].tag, time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` },
      });
      if ("fallback" in answer) {
        const why: Key = answer.fallback === "limit" ? "ask.limit" : answer.fallback === "off" ? "ask.off" : "ask.silent";
        lines.push({ from: "guide", say: [{ key: "ask.fallback", vars: { why: t(why) } }], offer: ALL });
      } else {
        for (const a of answer.actions) if (a.kind === "set_style") applyStyle(a.value);
        lines.push({ from: "guide", text: answer.say, options: answer.options, actions: answer.actions.filter((a) => a.kind !== "set_style" && a.kind !== "set_role" && a.kind !== "ask") });
      }
    } catch {
      lines.push({ from: "guide", say: [{ key: "ask.unreachable" }], offer: ALL });
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
      lines.push({ from: "guide", say: [{ key: "ask.dressed", vars: { look: SKIN_BY_ID[id].name } }] });
    }
  }

  function label(a: Action): string {
    const ed = (v: string) => catalog.data?.editions[v as Edition]?.name ?? v;
    switch (a.kind) {
      case "go_to":
        return a.value === "amp" ? t("ask.act.shop") : t("ask.act.show", { place: a.value in STAGE_TO ? t(`ask.place.${a.value}` as Key) : a.value });
      case "show":
        return t("ask.act.screen");
      case "recommend":
        return t("ask.act.see", { edition: ed(a.value) });
      case "start_trial":
        return t("ask.act.trial");
      case "open_checkout":
        return t("ask.act.checkout");
      default:
        return a.value;
    }
  }

  function act(a: Action) {
    if (a.kind === "go_to" || a.kind === "show") {
      const to = a.kind === "show" ? { page: "home" as const, section: "tour" } : STAGE_TO[a.value];
      if (!to) return;
      if (to.page !== "home") navigate(href(to.page));
      else {
        if (route.page !== "home") navigate("/");
        requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(to.section ?? "top")?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" })));
      }
    } else if (a.kind === "recommend" && (NAMED as string[]).concat("custom").includes(a.value)) navigate(`${href("pricing")}?edition=${a.value}`);
    else if (a.kind === "start_trial" || a.kind === "open_checkout") {
      navigate(href("pricing"));
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
    <div class="panel card" bind:this={panel} role="dialog" aria-label={t("ask.title")} data-assistant>
      <header>
        <span class="pulse" class:off={on === false}></span>
        <b>{t("ask.title")}</b>
        <span class="mono dim">{on === false ? t("ask.scripted") : t("ask.ai")}</span>
        <button class="x" onclick={() => (open = false)} aria-label={t("ask.close")}>×</button>
      </header>
      <div class="log" bind:this={log} aria-live="polite">
        {#each lines as l, i (i)}
          <div class="line {l.from}" data-line={l.from} data-canned={l.canned}>
            <p>{words(l)}</p>
            {#if l.actions?.length}
              <div class="acts">
                {#each l.actions as a, j (j)}<button class="btn primary small" onclick={() => act(a)} data-act={a.kind}>{label(a)}</button>{/each}
              </div>
            {/if}
            {#if (l.options?.length || l.offer?.length) && i === lines.length - 1}
              <div class="opts">
                {#each l.offer ?? [] as id (id)}<button class="chip" onclick={() => ask(id)} data-ask-canned={id}>{questionOf(CANNED_BY_ID[id], i18n.lang)}</button>{/each}
                {#each l.options ?? [] as o (o)}<button class="chip" onclick={() => say(o)}>{o}</button>{/each}
              </div>
            {/if}
          </div>
        {/each}
        {#if busy}<div class="line guide"><p class="typing"><i></i><i></i><i></i></p></div>{/if}
      </div>
      <form onsubmit={(e) => (e.preventDefault(), say(draft))}>
        <input type="text" bind:value={draft} placeholder={t("ask.placeholder")} aria-label={t("ask.input")} maxlength="400" />
        <button class="btn primary small" disabled={busy || !draft.trim()}>{t("ask.send")}</button>
      </form>
    </div>
  {/if}
  <button class="fab" onclick={toggle} aria-expanded={open} data-ask>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    <span>{open ? t("ask.close") : t("ask.title")}</span>
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
