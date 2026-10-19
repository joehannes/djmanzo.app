/**
 * Which Claude model a feature speaks through.
 *
 * No model is named in this repository. The owner names one per feature as
 * a Worker variable or secret — `GUIDE_MODEL` for the guide, `BLOG_MODEL`
 * for the blog's drafts — and where none is named, the Worker asks the
 * Models API for the newest model the key can use and remembers the answer
 * for a day. A smaller model for the guide costs less per visitor; that is
 * the owner's call, made without a deploy.
 *
 * A key made outside any workspace must name the workspace each request
 * spends from; `ANTHROPIC_WORKSPACE_ID` does, for every client made here.
 *
 * The owner pays for no AI (19 October), so by default nothing here reaches
 * Claude: the guide, the screening of new accounts' posts and the blog's
 * drafts run on Cloudflare's Workers AI, within a share of its free daily
 * allowance that this file counts (`spend`). Past it, each falls back as it
 * does without AI. Claude stays one variable away (`AI_PROVIDER=claude`) for
 * the day there are credits.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AppEnv } from "./env";
import { fail } from "./http";

export type Provider = "claude" | "workers-ai" | "off";

/** Who speaks: Claude only when asked for and keyed, Workers AI when bound, else nobody. */
export function provider(env: AppEnv): Provider {
  const asked = env.AI_PROVIDER?.trim();
  if (asked === "off") return "off";
  if (asked === "claude" && env.ANTHROPIC_API_KEY) return "claude";
  return env.AI ? "workers-ai" : "off";
}

/** A model on the Workers Free plan, cheap per token, with JSON mode. */
export const WORKERS_AI_DEFAULT = "@cf/google/gemma-4-26b-a4b-it";

/**
 * Neurons per million tokens, as Cloudflare's pricing page gives them
 * (15 October 2026). A model not listed is counted at a deliberately high
 * rate, so the day's share runs out early rather than late.
 */
export const NEURON_RATES: Record<string, { input: number; output: number }> = {
  "@cf/google/gemma-4-26b-a4b-it": { input: 9091, output: 27273 },
  "@cf/zai-org/glm-4.7-flash": { input: 5500, output: 36400 },
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast": { input: 26668, output: 204805 },
};
const UNKNOWN_RATE = { input: 60000, output: 450000 };

/** Workers AI gives every account 10,000 neurons a day free; the owner's other projects share them. */
export const DAILY_NEURONS = 6000;

export function workersModel(env: AppEnv): string {
  return env.WORKERS_AI_MODEL?.trim() || WORKERS_AI_DEFAULT;
}

const today = () => `ai:neurons:${new Date().toISOString().slice(0, 10)}`;

/** What a reply cost, in neurons. */
export function neurons(model: string, usage: { prompt_tokens?: number; completion_tokens?: number } | undefined): number {
  const rate = NEURON_RATES[model] ?? UNKNOWN_RATE;
  return ((usage?.prompt_tokens ?? 0) * rate.input + (usage?.completion_tokens ?? 0) * rate.output) / 1_000_000;
}

/** The neurons spent today, as this site has counted them. */
export async function spentToday(env: AppEnv): Promise<number> {
  return Number(await env.KV.get(today())) || 0;
}

/** Whether today's share is used up. */
export async function overBudget(env: AppEnv): Promise<boolean> {
  return (await spentToday(env)) >= (Number(env.AI_NEURONS_DAILY) || DAILY_NEURONS);
}

/** Count a reply against today's share. */
export async function spend(env: AppEnv, amount: number): Promise<void> {
  await env.KV.put(today(), String((await spentToday(env)) + amount), { expirationTtl: 2 * 86400 });
}

/** Today's free share is used up: the caller falls back as it does without AI. */
export class OverBudget extends Error {
  constructor() {
    super("Today's free AI is used up.");
  }
}

type Said = { role: "system" | "user" | "assistant"; content: string };

/**
 * One answer from Workers AI, held to a schema: within today's share, counted
 * after, and null when what came back is not in shape.
 */
export async function workersJson<T>(env: AppEnv, schema: z.ZodType<T>, messages: Said[], maxTokens: number): Promise<T | null> {
  if (await overBudget(env)) throw new OverBudget();
  const model = workersModel(env);
  const out = (await env.AI.run(model as keyof AiModels, {
    messages,
    max_tokens: maxTokens,
    response_format: { type: "json_schema", json_schema: z.toJSONSchema(schema) },
    // These models think before answering unless told not to, and the thinking spends the whole allowance.
    chat_template_kwargs: { enable_thinking: false },
  } as never)) as { response?: unknown; choices?: { finish_reason?: string; message?: { content?: unknown } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number; neurons?: number } };
  const said = out.response ?? out.choices?.[0]?.message?.content;
  // Without the reply's own count, the worst it could have been: about three characters a token in, the whole allowance out.
  const usage = out.usage ?? { prompt_tokens: Math.ceil(messages.reduce((n, m) => n + m.content.length, 0) / 3), completion_tokens: maxTokens };
  // Cloudflare says what a reply cost when it can; that is what is counted then.
  await spend(env, typeof out.usage?.neurons === "number" ? out.usage.neurons : neurons(model, usage));
  let value: unknown = said;
  if (typeof said === "string") {
    try {
      value = JSON.parse(said.slice(said.indexOf("{"), said.lastIndexOf("}") + 1));
    } catch {
      value = undefined;
    }
  }
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;
  // Out of shape: what came back, briefly, for whoever reads the logs.
  const choice = (out.choices?.[0] ?? {}) as { finish_reason?: string; message?: Record<string, unknown> };
  console.error(JSON.stringify({ at: "workers-ai", model, finish: choice.finish_reason, usage: out.usage, message: Object.keys(choice.message ?? {}), said: JSON.stringify(said ?? choice.message ?? out).slice(0, 400) }));
  return null;
}

const NEWEST = "config:model:newest";

/** A client on the owner's key, naming their workspace when one is set. */
export function anthropic(env: AppEnv): Anthropic {
  const workspace = env.ANTHROPIC_WORKSPACE_ID?.trim();
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, defaultHeaders: workspace ? { "anthropic-workspace-id": workspace } : undefined });
}

export async function modelFor(env: AppEnv, client: Anthropic, which: "GUIDE_MODEL" | "BLOG_MODEL" | "MOD_MODEL"): Promise<string> {
  const named = env[which]?.trim();
  if (named) return named;
  const known = await env.KV.get(NEWEST);
  if (known) return known;
  // The Models API lists the most recently released first.
  const page = await client.models.list({ limit: 1 });
  const id = page.data[0]?.id;
  if (!id) fail(502, "No model is available to this key.");
  await env.KV.put(NEWEST, id, { expirationTtl: 86400 });
  return id;
}
