/**
 * The guide on the Signal Path, at the door: Workers AI within its free daily
 * share by default, Claude when the owner asks for it (`worker/model.ts`).
 *
 * It asks what the visitor plays and does, dresses the path in their music,
 * walks them through the stages, and answers what djmanzo does — from
 * `shared/facts.ts` and the catalogue, never from memory (DIRECTIVE §134).
 *
 * A reply is structured: what the guide says, up to four quick answers for
 * the visitor to tap, and actions. The model *proposes* actions; this file
 * throws away any that name a style, stage, screen or edition that does not
 * exist, and the page carries out only the harmless ones by itself
 * (re-dressing the path, noting what the visitor does). Everything else —
 * going somewhere, asking for a location, opening the box office — becomes
 * a button the visitor presses or not.
 *
 * It is capped twice, through `brake()`: a number of turns per visitor an
 * hour, and a number per day for everyone together (`GUIDE_DAILY`); on
 * Workers AI the day's free share caps it too. Past any of them, with no AI
 * at all, or on any failure, the
 * answer is `{ fallback }` and the page offers the scripted questions, which
 * say so. Nothing a visitor types is stored here.
 */

import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { EDITIONS, EDITION_INFO, FOUNDATION, MODULES, MODULE_PRICE, MODULE_TITLE, TRIAL_DAYS, listPrice, money } from "../shared/catalog";
import { FACTS, STATUS_LINE, moduleWords } from "../shared/facts";
import { ASKS, KINDS, ROLES, type Action, type GuideAnswer, type GuideContext, type Reply, type Turn } from "../shared/guide";
import { BAND_SHARE, STUDENT_SHARE } from "../shared/regions";
import { NODES, resolveStyle } from "../src/style/genome";
import { STAGES, STAGE_BY_ID } from "../src/stages/script";
import { SHOTS } from "../src/signal/shots";
import type { AppEnv } from "./env";
import { HttpError, brake, clientIp, sha256, text } from "./http";
import { OverBudget, anthropic, modelFor, provider, workersJson } from "./model";
import { where } from "./sense";

export type { Action, GuideAnswer, GuideContext, Reply, Turn };

/** The reply's shape, as the model is held to it. */
const ReplySchema = z.object({
  say: z.string(),
  options: z.array(z.string()),
  actions: z.array(z.object({ kind: z.enum(KINDS), value: z.string() })),
});

/** The visitor's turns per hour, and how long a conversation may run. */
export const PER_VISITOR = 30;
export const LONGEST = 40;

const SCREENS = new Set(SHOTS.map((s) => s.screen));
/** Each pictured screen and what its picture shows, for the guide to choose by. */
const SCREEN_LIST = [...new Map(SHOTS.map((s) => [s.screen, s.shows])).entries()].map(([screen, shows]) => `${screen} (${shows})`).join("; ");

function valid(a: Action): boolean {
  switch (a.kind) {
    case "set_style":
      return !!NODES[a.value];
    case "set_role":
      return (ROLES as readonly string[]).includes(a.value);
    case "go_to":
      return !!STAGE_BY_ID[a.value as keyof typeof STAGE_BY_ID];
    case "show":
      return SCREENS.has(a.value);
    case "recommend":
    case "start_trial":
    case "open_checkout":
      return (EDITIONS as readonly string[]).includes(a.value);
    case "ask":
      return (ASKS as readonly string[]).includes(a.value);
  }
}

/** What the page may act on: the model's reply, with anything that names nothing real thrown away. */
/** What may stand before "edition" in a reply: an edition's own name, or a word that names none ("every edition", "seven editions"). */
const EDITION_WORDS = new Set(
  [
    ...EDITIONS.flatMap((e) => [e, EDITION_INFO[e].name]),
    ...["pro", "autopilot", "auto-pilot", "free", "paid", "any", "each", "every", "one", "your", "this", "that", "the", "an", "which", "other", "same", "seven", "all", "both", "two", "these", "those", "cheaper", "bigger", "larger", "right", "best", "whole", "named", "an", "new", "first", "trial"],
  ].map((w) => w.toLowerCase()),
);

/**
 * A reply without the sentences that name an edition djmanzo does not have.
 * The free model can invent one (asked about bachata at weddings, it offered
 * "the Wedding edition"); no page may show it.
 */
export function withoutInventedEditions(say: string): string {
  const sentences = say.match(/[^.!?]+[.!?]*\s*/g) ?? [say];
  const kept = sentences.filter((s) => [...s.matchAll(/([A-Za-z][\w-]*(?:\s+DJ)?)\s+editions?\b/gi)].every((m) => EDITION_WORDS.has(m[1].toLowerCase())));
  const out = kept.join("").trim();
  return out || "I'm not sure which edition that would be — the shop lists all seven, and what each carries.";
}

export function clean(r: Reply): Reply {
  const actions: Action[] = [];
  for (const a of r.actions) {
    const action = { kind: a.kind, value: text(a.value, 40) };
    // One of each kind: the first the model thought of.
    if (KINDS.includes(action.kind) && valid(action) && !actions.some((b) => b.kind === action.kind)) actions.push(action);
  }
  return {
    say: withoutInventedEditions(text(r.say, 600)),
    options: r.options.map((o) => text(o, 48)).filter(Boolean).slice(0, 4),
    actions: actions.slice(0, 4),
  };
}

// --- What the guide knows ------------------------------------------------------

function stylesSheet(): string {
  return Object.values(NODES)
    .map((n) => {
      const s = resolveStyle(n.id);
      return `- ${n.id} "${n.name}"${n.parent ? ` (under ${n.parent})` : ""}: ${s.mood.slice(0, 3).join(", ")}; dances ${s.dance.slice(0, 3).join(", ")}; ${s.sound.bpm[0]}–${s.sound.bpm[1]} BPM; sounds like ${s.sound.signature.slice(0, 3).join(", ")}.`;
    })
    .join("\n");
}

function stagesSheet(): string {
  return STAGES.map((s, i) => `- ${s.id} (${i}) "${s.name}": ${s.reveal}`).join("\n");
}

function factsSheet(): string {
  return FACTS.map((f) => `- ${f.name} [${f.status}; ${moduleWords(f, (m) => MODULE_TITLE[m])}]: ${f.about}${f.caveat ? ` (Caveat, keep it: ${f.caveat})` : ""}`).join("\n");
}

function pricesSheet(): string {
  const usd = (c: number) => money(c, "USD");
  const named = EDITIONS.filter((e) => e !== "custom").map((e) => {
    const i = EDITION_INFO[e];
    if (listPrice(e, "perpetual") === 0) return `- ${e} "${i.name}": free, for ever, with no purchase; what every trial ends in. ${i.tagline} For: ${i.forWho}`;
    return `- ${e} "${i.name}": ${usd(listPrice(e, "perpetual"))} once, or ${usd(listPrice(e, "monthly"))} a month, or ${usd(listPrice(e, "yearly"))} a year. ${i.tagline} For: ${i.forWho}`;
  });
  const modules = MODULES.map((m) => `${MODULE_TITLE[m]} ${usd(MODULE_PRICE[m])}`).join(", ");
  const bands = Object.entries(BAND_SHARE)
    .map(([b, share]) => `band ${b} pays ${Math.round(share * 100)} %`)
    .join(", ");
  return `${named.join("\n")}
- custom "Custom": the free Hobbyist foundation${FOUNDATION ? ` (${usd(FOUNDATION)})` : ""} and the modules chosen: ${modules}.
Every edition is the same download, unlocked by signing in. A free ${TRIAL_DAYS}-day trial of any edition, once per account. An upgrade costs the difference between the two editions. The monthly and yearly plans are the owner's proposal and may change. Prices follow the World Bank's income groups (${bands}), proven by the card's country and the billing address at checkout. Students and teachers pay ${Math.round(STUDENT_SHARE * 100)} %. Discounts never stack. These prices are the owner's proposal and may change.`;
}

const ACTIONS_DOC = `Actions you may propose (the page checks every one and ignores any that names nothing real):
- set_style <style id>: dress the whole path in that music. Use it as soon as the visitor names their music; pick the deepest id that fits, or the family.
- set_role <dj|karaoke|learning|listening>: what the visitor does with music.
- go_to <stage id>: offer to take them to a stage (they press to go).
- show <screen>: show a real screenshot of djmanzo. The screens there are pictures of: ${SCREEN_LIST}.
- recommend <edition id>: point at the edition that fits what they told you.
- start_trial <edition id>: offer the free trial of that edition.
- open_checkout <edition id>: offer the box office for that edition.
- ask <where|gps>: ask permission — "where" to use roughly where they are from their connection (city, time zone) for the night's light; "gps" for their exact location for the real sunset and weather, which stays in their browser. Ask at most once each, only when it adds something, and never insist.
At most one action of each kind per reply.`;

/** The system prompt: the same for every visitor, so it is cached. */
export function systemPrompt(): string {
  return `You are the guide on the djmanzo website's Signal Path — a painted journey along a DJ's signal, from the silence before the first record (Silence) to the sunrise after the last (Afterglow). You stand at the door like a good host: warm, quick, a little mysterious, never pushy. You speak in punchlines: short, concrete, musical, sometimes abstract — and then you reveal what you meant.

Your work:
1. Find out what the visitor plays or loves, and what they do (DJ, karaoke host, learning, or just listening). As soon as you know their music, propose set_style; as soon as you know what they do, set_role.
2. Walk them along the path: suggest the stage that fits them next (a karaoke host → voice; a learner → cue; someone who wants the music to run itself → confluence, for the autopilot; anyone curious about price → amp).
3. Answer questions about djmanzo, only from the facts below, at the status given.

House rules — never break them:
- ${STATUS_LINE}
- Describe only features in the list below. "planned" means NOT in the application yet: say "planned". "part" means partly built. Keep every caveat when you mention its feature. If you do not know, say so and offer the stage where it is shown.
- Never invent prices, dates, quotes, customers, numbers or reviews. Prices are below; a visitor's own price is shown at the box office (amp), never guessed by you.
- Name other DJ software only fairly and factually.
- Privacy: never ask for a name, an e-mail, an age, an address, a gender, an ethnicity or anything like them. Never guess who someone is from where they are or what they like: a scene's roots are its history, not a visitor's identity. If you are told the visitor's city, use it only for the night ("Tonight in Linz…").
- Only the good parts of a culture: no excess, nothing about drugs or drink as part of a night; healthy complements (dance classes, running clubs, morning raves, crate digging) are welcome.
- The website shows no pretend djmanzo: it shows the real application in screenshots and the owner's videos.
- Say at most three short sentences (about 50 words) per reply. Offer up to four quick answers in options, each a few words, written as the visitor would say them.
- Answer in the visitor's language (their browser's language is in the context, and the language they write in wins).
- You are an AI. If asked, say so plainly: Claude, made by Anthropic, speaking for djmanzo's website.

The stages (id, number for the keys 0–9, name, what it reveals):
${stagesSheet()}

The styles you can dress the path in (id, name, parent):
${stylesSheet()}

What djmanzo does (status in brackets):
${factsSheet()}

The editions and prices, in US dollars:
${pricesSheet()}

${ACTIONS_DOC}`;
}

// --- A turn ---------------------------------------------------------------------

/** The page's context, read only for what it may contain. */
export function context(req: Request, c: GuideContext): string {
  const lines: string[] = [];
  const stage = c.stage && STAGE_BY_ID[c.stage as keyof typeof STAGE_BY_ID];
  if (stage) lines.push(`The visitor is at: ${stage.name} (${stage.id}).`);
  if (c.style && NODES[c.style]) lines.push(`The path is dressed in: ${NODES[c.style].name} (${c.style}).`);
  if (c.role && (ROLES as readonly string[]).includes(c.role)) lines.push(`They said they: ${c.role}.`);
  const visited = (c.visited ?? []).filter((v) => STAGE_BY_ID[v as keyof typeof STAGE_BY_ID]);
  if (visited.length) lines.push(`Stages already seen: ${visited.join(", ")}.`);
  if (c.time && /^\d{1,2}:\d{2}$/.test(c.time)) lines.push(`Their local time: ${c.time}.`);
  if (c.where) {
    const w = where(req);
    if (w.city || w.country) lines.push(`Roughly where they are (they allowed it): ${[w.city, w.country].filter(Boolean).join(", ")}.`);
  }
  if (c.sky && /^[a-z]{3,10}$/.test(c.sky)) lines.push(`The sky over them: ${c.sky}.`);
  if (c.lang && /^[a-zA-Z-]{2,12}$/.test(c.lang)) lines.push(`Their browser's language: ${c.lang}.`);
  return lines.join("\n");
}

/** The conversation as the Messages API wants it: alternating, beginning and ending with the visitor. */
export function messages(turns: Turn[], ctx: string): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = [];
  for (const t of turns.slice(-LONGEST)) {
    const role = t.from === "guide" ? "assistant" : "user";
    const said = text(t.text, 600);
    if (!said) continue;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content = `${last.content as string}\n${said}`;
    else out.push({ role, content: said });
  }
  if (out[0]?.role === "assistant") out.unshift({ role: "user", content: "(The visitor has arrived.)" });
  if (!out.length || out[out.length - 1].role === "assistant") out.push({ role: "user", content: out.length ? "(The visitor is listening.)" : "(The visitor has just arrived at Silence. Greet them and ask your first question.)" });
  const last = out[out.length - 1];
  last.content = `<context>\n${ctx}\n</context>\n\n${last.content as string}`;
  return out;
}

export async function caps(env: AppEnv, req: Request): Promise<boolean> {
  try {
    const visitor = (await sha256(clientIp(req))).slice(0, 24);
    await brake(env.KV, `guide:${visitor}`, PER_VISITOR, 3600);
    await brake(env.KV, "guide:day", Number(env.GUIDE_DAILY) || 400, 86400);
    return true;
  } catch (e) {
    if (e instanceof HttpError && e.status === 429) return false;
    throw e;
  }
}

export type Speak = (env: AppEnv, system: string, msgs: Anthropic.MessageParam[]) => Promise<Reply | null>;

async function claude(env: AppEnv, system: string, msgs: Anthropic.MessageParam[]): Promise<Reply | null> {
  const client = anthropic(env);
  const response = await client.messages.parse({
    model: await modelFor(env, client, "GUIDE_MODEL"),
    max_tokens: 1024,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: msgs,
    output_config: { format: zodOutputFormat(ReplySchema) },
  });
  if (response.stop_reason === "refusal") return null;
  return response.parsed_output ?? null;
}

/** The guide on Workers AI, within the day's free share (`worker/model.ts`). */
async function workers(env: AppEnv, system: string, msgs: Anthropic.MessageParam[]): Promise<Reply | null> {
  const said = msgs.map((m) => ({ role: m.role, content: typeof m.content === "string" ? m.content : m.content.map((b) => ("text" in b ? b.text : "")).join("\n") }));
  return workersJson(env, ReplySchema, [{ role: "system", content: system }, ...said], 1024);
}

export async function guide(env: AppEnv, req: Request, input: { turns?: Turn[]; context?: GuideContext }, speak?: Speak): Promise<GuideAnswer> {
  const who = provider(env);
  if (who === "off") return { fallback: "off" };
  speak ??= who === "claude" ? claude : workers;
  const turns = Array.isArray(input.turns) ? input.turns.filter((t) => t && (t.from === "visitor" || t.from === "guide")) : [];
  if (turns.length > LONGEST) return { fallback: "long" };
  if (!(await caps(env, req))) return { fallback: "limit" };
  try {
    const reply = await speak(env, systemPrompt(), messages(turns, context(req, input.context ?? {})));
    return reply ? clean(reply) : { fallback: "error" };
  } catch (e) {
    if (e instanceof OverBudget) return { fallback: "limit" };
    console.error(JSON.stringify({ at: "guide", error: String((e as Error)?.message ?? e) }));
    return { fallback: "error" };
  }
}

