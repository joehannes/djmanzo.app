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
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AppEnv } from "./env";
import { fail } from "./http";

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
