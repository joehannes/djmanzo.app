/** People for the Worker's tests: accounts a provider vouches for, each with its own session. */
import { handle } from "../worker/index";
import { findOrCreate } from "../worker/auth";
import { put, type User } from "../worker/store";
import { memoryD1, memoryR2 } from "./d1";
import { testEnv } from "./kv";

export const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

export interface Reply {
  status: number;
  data: any;
  res: Response;
}

/** A client that calls the Worker as one browser would. */
export function browser(env: never, cookie = "", headers: Record<string, string> = {}) {
  return async (path: string, init: RequestInit & { json?: unknown } = {}): Promise<Reply> => {
    const h = new Headers({ ...headers, ...(init.headers as Record<string, string>) });
    if (cookie) h.set("cookie", cookie);
    if (init.json !== undefined) h.set("content-type", "application/json");
    const res = await handle(new Request(`https://djmanzo.test${path}`, { ...init, headers: h, body: init.json !== undefined ? JSON.stringify(init.json) : init.body }), env, exec);
    const type = res.headers.get("content-type") ?? "";
    const data = type.includes("json") ? await res.clone().json() : null;
    return { status: res.status, data, res };
  };
}

let n = 0;
/** Someone signed in with GitHub, `days` old. */
export async function person(env: never, name: string, days = 30) {
  const e = env as { KV: KVNamespace };
  const sub = String(++n);
  const user: User = await findOrCreate(env, "github", { sub, email: `${name.toLowerCase()}@example.test`, verified: true, name, avatar: null });
  user.createdAt = Date.now() - days * 86_400_000;
  await put(e.KV, `user:${user.id}`, user);
  const sid = `sid-${sub}`;
  await put(e.KV, `session:${sid}`, { uid: user.id, createdAt: Date.now() });
  return { user, call: browser(env, `djm_sid=${sid}`) };
}

/** A site with Outboard and Talkback open: D1, R2 and the imprint all there. */
export function openSite(extra: Record<string, unknown> = {}) {
  return testEnv({
    DB: memoryD1(),
    MEDIA: memoryR2(),
    IMPRINT_NAME: "The Owner",
    IMPRINT_ADDRESS: "Somewhere 1, 4020 Linz, Austria",
    IMPRINT_EMAIL: "owner@example.test",
    ADMIN_TOKEN: "crew-secret",
    ...extra,
  });
}

export const crew = (env: never) => browser(env, "", { authorization: "Bearer crew-secret" });
