import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { DAILY_NEURONS, OverBudget, anthropic, modelFor, neurons, provider, spentToday, workersJson, WORKERS_AI_DEFAULT } from "../worker/model";
import { guide } from "../worker/guide";
import { screen } from "../worker/moderation";
import { testEnv } from "./kv";

// What the client actually sends, caught at fetch.
function listen(): Headers[] {
  const sent: Headers[] = [];
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push(new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined)));
    return new Response(JSON.stringify({ data: [{ id: "newest", type: "model" }], has_more: false, first_id: "newest", last_id: "newest" }), {
      headers: { "content-type": "application/json" },
    });
  });
  return sent;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the client on the owner's key", () => {
  it("names the owner's workspace on every request when one is set", async () => {
    const sent = listen();
    const env = testEnv({ ANTHROPIC_API_KEY: "k", ANTHROPIC_WORKSPACE_ID: "wrkspc_test" });
    expect(await modelFor(env, anthropic(env), "GUIDE_MODEL")).toBe("newest");
    expect(sent).toHaveLength(1);
    expect(sent[0].get("anthropic-workspace-id")).toBe("wrkspc_test");
    expect(sent[0].get("x-api-key")).toBe("k");
  });

  it("names none for a key made inside a workspace", async () => {
    const sent = listen();
    const env = testEnv({ ANTHROPIC_API_KEY: "k", ANTHROPIC_WORKSPACE_ID: " " });
    await modelFor(env, anthropic(env), "BLOG_MODEL");
    expect(sent[0].has("anthropic-workspace-id")).toBe(false);
  });
});

/** A stand-in for the Workers AI binding: answers what it is given, and remembers what it was asked. */
function workersAi(answer: unknown, usage: { prompt_tokens: number; completion_tokens: number; neurons?: number } | null = { prompt_tokens: 2000, completion_tokens: 200 }) {
  const asked: { model: string; input: any }[] = [];
  return {
    asked,
    run: async (model: string, input: unknown) => {
      asked.push({ model, input });
      return { response: answer, ...(usage ? { usage } : {}) };
    },
  };
}

const guideReq = () => new Request("https://djmanzo.test/api/guide", { method: "POST", headers: { "cf-connecting-ip": "198.51.100.9" } });

describe("which model speaks, when the owner pays for none", () => {
  it("is Workers AI by default, even with a key set; Claude only when asked for and keyed", () => {
    expect(provider(testEnv({ AI: {}, ANTHROPIC_API_KEY: "k" }))).toBe("workers-ai");
    expect(provider(testEnv({ AI: {}, ANTHROPIC_API_KEY: "k", AI_PROVIDER: "claude" }))).toBe("claude");
    expect(provider(testEnv({ AI: {}, AI_PROVIDER: "claude" }))).toBe("workers-ai");
    expect(provider(testEnv({ AI: {}, ANTHROPIC_API_KEY: "k", AI_PROVIDER: "off" }))).toBe("off");
    expect(provider(testEnv({ ANTHROPIC_API_KEY: "k" }))).toBe("off");
  });

  it("guides on Workers AI, held to the reply's shape, and counts what it cost", async () => {
    const ai = workersAi({ say: "What do you play?", options: ["House"], actions: [{ kind: "go_to", value: "nowhere" }] });
    const env = testEnv({ AI: ai, ANTHROPIC_API_KEY: "k" });
    const answer = await guide(env, guideReq(), { turns: [] });
    expect(answer).toMatchObject({ say: "What do you play?", options: ["House"], actions: [] });
    expect(ai.asked[0].model).toBe(WORKERS_AI_DEFAULT);
    expect(ai.asked[0].input.response_format.type).toBe("json_schema");
    expect(ai.asked[0].input.messages[0].role).toBe("system");
    // Thinking would spend the whole allowance before a word of the answer.
    expect(ai.asked[0].input.chat_template_kwargs).toEqual({ enable_thinking: false });
    expect(await spentToday(env)).toBeCloseTo(neurons(WORKERS_AI_DEFAULT, { prompt_tokens: 2000, completion_tokens: 200 }));
  });

  it("stops at the day's free share: the guide falls back, a new post waits for the crew", async () => {
    const ai = workersAi({ say: "Hi", options: [], actions: [] });
    const env = testEnv({ AI: ai, AI_NEURONS_DAILY: "30" });
    // 2000 tokens in and 200 out at the default model's rates is about 23.6 neurons: two answers start under the share of 30, the third does not.
    expect(await guide(env, guideReq(), { turns: [] })).toMatchObject({ say: "Hi" });
    expect(await guide(env, guideReq(), { turns: [] })).toMatchObject({ say: "Hi" });
    expect(await guide(env, guideReq(), { turns: [] })).toEqual({ fallback: "limit" });
    expect(await screen(env, "A title", "A body")).toBeNull();
    expect(ai.asked).toHaveLength(2);
  });

  it("counts a reply that does not say what it cost at the most it could have cost", async () => {
    const env = testEnv({ AI: workersAi({ verdict: "allow", rule: "", reason: "Fine." }, null) });
    expect(await screen(env, "Echo out or cut?", "Which first?")).toEqual({ verdict: "allow", rule: "", reason: "Fine." });
    expect(await spentToday(env)).toBeGreaterThanOrEqual(neurons(WORKERS_AI_DEFAULT, { prompt_tokens: 0, completion_tokens: 300 }));
  });

  it("counts what Cloudflare says a reply cost, when it says", async () => {
    const env = testEnv({ AI: workersAi({ verdict: "hold", rule: "1", reason: "Off topic." }, { prompt_tokens: 7596, completion_tokens: 40, neurons: 96.98 }) });
    await screen(env, "A title", "A body");
    expect(await spentToday(env)).toBeCloseTo(96.98);
  });

  it("takes nothing out of shape: a malformed reply is no reply", async () => {
    const schema = z.object({ verdict: z.enum(["allow", "hold"]) });
    expect(await workersJson(testEnv({ AI: workersAi('{"verdict":"maybe"}') }), schema, [{ role: "user", content: "x" }], 50)).toBeNull();
    expect(await workersJson(testEnv({ AI: workersAi("not json at all") }), schema, [{ role: "user", content: "x" }], 50)).toBeNull();
    expect(await workersJson(testEnv({ AI: workersAi('Sure! {"verdict":"hold"}') }), schema, [{ role: "user", content: "x" }], 50)).toEqual({ verdict: "hold" });
    const over = testEnv({ AI: workersAi({}), AI_NEURONS_DAILY: "0.0001" });
    await workersJson(over, schema, [{ role: "user", content: "x" }], 50);
    await expect(workersJson(over, schema, [{ role: "user", content: "x" }], 50)).rejects.toBeInstanceOf(OverBudget);
    expect(DAILY_NEURONS).toBeLessThan(10_000);
  });
});
