import { afterEach, describe, expect, it, vi } from "vitest";
import { anthropic, modelFor } from "../worker/model";
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
