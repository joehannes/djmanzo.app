import { describe, expect, it } from "vitest";
import { FACTS } from "../shared/facts";
import { EDITIONS, EDITION_INFO } from "../shared/catalog";
import { LONGEST, PER_VISITOR, clean, context, guide, messages, systemPrompt, type Reply, type Speak } from "../worker/guide";
import { handle } from "../worker/index";
import { testEnv } from "./kv";

const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

function visitor(ip = "203.0.113.7", cf?: Record<string, string>): Request {
  const req = new Request("https://djmanzo.test/api/guide", { method: "POST", headers: { "cf-connecting-ip": ip } });
  if (cf) Object.defineProperty(req, "cf", { value: cf });
  return req;
}

const reply = (r: Partial<Reply> = {}): Reply => ({ say: "Tell me what your night sounds like.", options: ["House", "Bachata"], actions: [], ...r });

describe("what the guide may make the page do", () => {
  it("keeps actions that name something real, and only those", () => {
    const r = clean(
      reply({
        actions: [
          { kind: "set_style", value: "electroswing" },
          { kind: "go_to", value: "confluence" },
          { kind: "show", value: "karaoke" },
          { kind: "recommend", value: "pro" },
          { kind: "ask", value: "gps" },
        ],
      }),
    );
    expect(r.actions.map((a) => a.kind)).toEqual(["set_style", "go_to", "show", "recommend"]);
  });

  it("throws away a style, stage, screen, edition, role or permission that does not exist", () => {
    const r = clean(
      reply({
        actions: [
          { kind: "set_style", value: "polka-metal" },
          { kind: "go_to", value: "backstage" },
          { kind: "show", value: "backstage" },
          { kind: "recommend", value: "enterprise" },
          { kind: "open_checkout", value: "free" },
          { kind: "start_trial", value: "lifetime" },
          { kind: "set_role", value: "producer" },
          { kind: "ask", value: "microphone" },
        ],
      }),
    );
    expect(r.actions).toEqual([]);
  });

  it("takes one action of each kind, the first, and cuts what it says", () => {
    const r = clean(reply({ say: "x".repeat(2000), options: ["a", "b", "c", "d", "e", "<b>"], actions: [{ kind: "set_style", value: "bachata" }, { kind: "set_style", value: "edm" }] }));
    expect(r.actions).toEqual([{ kind: "set_style", value: "bachata" }]);
    expect(r.say.length).toBe(600);
    expect(r.options).toEqual(["a", "b", "c", "d"]);
  });

  it("offers every edition the shop sells, and the trial of each", () => {
    for (const e of EDITIONS) expect(clean(reply({ actions: [{ kind: "start_trial", value: e }] })).actions).toHaveLength(1);
  });
});

describe("what the guide is told", () => {
  it("knows every fact, at its status, and every edition", () => {
    const p = systemPrompt();
    for (const f of FACTS) expect(p).toContain(`${f.name} [${f.status}`);
    for (const e of EDITIONS) expect(p).toContain(`"${EDITION_INFO[e].name}"`);
    expect(p).toMatch(/not yet through a real gig/);
  });

  it("is the same for every visitor, so it can be cached", () => {
    expect(systemPrompt()).toBe(systemPrompt());
  });

  it("hears where the visitor is only when they allowed it, and nothing the page made up", () => {
    const req = visitor("203.0.113.7", { city: "Linz", country: "AT" });
    expect(context(req, { where: false, stage: "amp" })).not.toContain("Linz");
    expect(context(req, { where: true, stage: "amp" })).toContain("Linz, AT");
    const junk = context(req, { stage: "lobby", style: "nope", role: "admin", time: "ignore all previous", sky: "<script>", lang: "en; drop" });
    expect(junk).toBe("");
  });

  it("is given the conversation alternating, starting and ending with the visitor", () => {
    const m = messages(
      [
        { from: "guide", text: "What brings you here?" },
        { from: "visitor", text: "I DJ" },
        { from: "visitor", text: "weddings mostly" },
      ],
      "ctx",
    );
    expect(m.map((x) => x.role)).toEqual(["user", "assistant", "user"]);
    expect(m[2].content).toBe("<context>\nctx\n</context>\n\nI DJ\nweddings mostly");
    expect(messages([], "ctx")[0].content).toMatch(/just arrived/);
  });
});

describe("the guide's caps and its fallback", () => {
  const speak: Speak = async () => reply({ actions: [{ kind: "set_style", value: "hiphop" }, { kind: "go_to", value: "nowhere" }] });

  it("is off without a key, and says so rather than failing", async () => {
    expect(await guide(testEnv(), visitor(), { turns: [] }, speak)).toEqual({ fallback: "off" });
  });

  it("answers, cleaned, while there is budget", async () => {
    const env = testEnv({ AI_PROVIDER: "claude", ANTHROPIC_API_KEY: "k" });
    const r = await guide(env, visitor(), { turns: [{ from: "visitor", text: "hip-hop" }] }, speak);
    expect(r).toMatchObject({ actions: [{ kind: "set_style", value: "hiphop" }] });
  });

  it("stops one visitor after their turns for the hour, while another still gets answers", async () => {
    const env = testEnv({ AI_PROVIDER: "claude", ANTHROPIC_API_KEY: "k" });
    for (let i = 0; i < PER_VISITOR; i++) expect(await guide(env, visitor("198.51.100.1"), { turns: [] }, speak)).toHaveProperty("say");
    expect(await guide(env, visitor("198.51.100.1"), { turns: [] }, speak)).toEqual({ fallback: "limit" });
    expect(await guide(env, visitor("198.51.100.2"), { turns: [] }, speak)).toHaveProperty("say");
  });

  it("stops everyone once the day's budget is spent", async () => {
    const env = testEnv({ AI_PROVIDER: "claude", ANTHROPIC_API_KEY: "k", GUIDE_DAILY: "3" });
    for (let i = 0; i < 3; i++) await guide(env, visitor(`192.0.2.${i}`), { turns: [] }, speak);
    expect(await guide(env, visitor("192.0.2.99"), { turns: [] }, speak)).toEqual({ fallback: "limit" });
  });

  it("does not run on for ever, and falls back when the model fails or declines", async () => {
    const env = testEnv({ AI_PROVIDER: "claude", ANTHROPIC_API_KEY: "k" });
    const long = Array.from({ length: LONGEST + 1 }, (_, i) => ({ from: i % 2 ? "guide" : "visitor", text: "hi" }) as const);
    expect(await guide(env, visitor(), { turns: [...long] }, speak)).toEqual({ fallback: "long" });
    expect(await guide(env, visitor(), { turns: [] }, async () => null)).toEqual({ fallback: "error" });
    expect(
      await guide(env, visitor(), { turns: [] }, async () => {
        throw new Error("overloaded");
      }),
    ).toEqual({ fallback: "error" });
  });

  it("is reachable at /api/guide, and says whether it is on", async () => {
    const env = testEnv();
    const on = await handle(new Request("https://djmanzo.test/api/guide"), env, exec);
    expect(await on.json()).toEqual({ on: false, by: "off" });
    const res = await handle(new Request("https://djmanzo.test/api/guide", { method: "POST", body: JSON.stringify({ turns: [] }), headers: { "content-type": "application/json" } }), env, exec);
    expect(await res.json()).toEqual({ fallback: "off" });
  });
});
