import { describe, expect, it } from "vitest";
import { expired, readVoucher } from "../worker/voucher";
import { keys } from "../worker/licence";
import type { Licence, Order } from "../worker/store";
import { browser, crew, openSite, person } from "./people";

const demo = { country: "DE", instrument: "DE", billing: "DE" };

/** A real purchase with nothing to pay: the crew's 100 % code, so the order is not the demo's rehearsal. */
async function paidWithCode(env: never, call: (p: string, i?: never) => Promise<{ status: number; data: any }>, json: Record<string, unknown>) {
  const code = `FREE${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  await crew(env)("/api/admin/promos", { method: "POST", json: { kind: "percent", value: 100, code, maxUses: 5 } });
  return call("/api/checkout/free", { method: "POST", json: { country: "DE", promo: code, ...json } } as never);
}
const form = (line: string) => ({ method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `voucher=${encodeURIComponent(line)}` });

describe("a gift voucher, bought", () => {
  it("is a signed gift of the edition for the person named, with the buyer's note, and no licence for the buyer", async () => {
    const env = openSite();
    const ana = await person(env, "Ana");
    const r = await paidWithCode(env, ana.call as never, { edition: "pro", plan: "perpetual", gift: { for: "Lena@Example.test", note: "Happy birthday" } });
    expect(r.status).toBe(200);
    expect(r.data.licence).toBeUndefined();
    expect(r.data.gift.line).toMatch(/^djmanzo-voucher-1\./);
    expect(r.data.order).toMatchObject({ status: "paid", gift: { for: ["lena@example.test"], voucher: r.data.gift.id } });
    // What the line says, read as djmanzo reads it.
    const read = await readVoucher(r.data.gift.line, (await keys(env)).publicKey);
    expect(read.payload).toMatchObject({ edition: "pro", percent: 100, for: ["lena@example.test"], note: "A gift from Ana: Happy birthday" });
    expect(read.payload!.id).toMatch(/^MANZO-GIFT-/);
    // The buyer has no licence from it, and sees it among their gifts.
    expect((await ana.call("/api/me/licences")).data.filter((l: Licence) => !l.demo || l.edition === "pro")).toEqual([]);
    const gifts = (await ana.call("/api/me/gifts")).data;
    expect(gifts).toHaveLength(1);
    expect(gifts[0]).toMatchObject({ id: r.data.gift.id, edition: "pro", taken: false, rehearsal: false });
    expect(expired(read.payload!)).toBe(false);
  });

  it("from the demo checkout is a rehearsal: the line is shown, but past its last day before it is made, so nobody can take it", async () => {
    const env = openSite();
    const ana = await person(env, "Ana");
    const lena = await person(env, "Lena");
    const r = await ana.call("/api/checkout/demo", { method: "POST", json: { ...demo, edition: "full", plan: "perpetual", gift: { for: "lena@example.test" } } });
    expect(r.data.gift.rehearsal).toBe(true);
    const read = await readVoucher(r.data.gift.line, (await keys(env)).publicKey);
    expect(expired(read.payload!)).toBe(true);
    expect(read.payload!.note).toMatch(/rehearsal/);
    expect((await lena.call("/redeem", form(r.data.gift.line))).status).toBe(410);
    expect((await lena.call("/api/me/licences")).data).toEqual([]);
  });

  it("is taken at /redeem by the person it is for, who gets the edition bought once, and the buyer sees it taken", async () => {
    const env = openSite();
    const ana = await person(env, "Ana");
    const lena = await person(env, "Lena");
    const bought = (await paidWithCode(env, ana.call as never, { edition: "karaoke", plan: "perpetual", gift: { for: "lena@example.test" } })).data;
    const someone = await person(env, "Rosa");
    expect((await someone.call("/redeem", form(bought.gift.line))).status).toBe(403);
    expect((await lena.call("/redeem", form(bought.gift.line))).status).toBe(200);
    const mine: Licence[] = (await lena.call("/api/me/licences")).data;
    expect(mine.map((l) => [l.edition, l.plan])).toContainEqual(["karaoke", "perpetual"]);
    expect((await ana.call("/api/me/gifts")).data[0].taken).toBe(true);
  });

  it("for anybody when no one is named, and only bought once: never a subscription, never an upgrade", async () => {
    const env = openSite();
    const ana = await person(env, "Ana");
    const open = (await paidWithCode(env, ana.call as never, { edition: "full", plan: "perpetual", gift: {} })).data;
    const read = await readVoucher(open.gift.line, (await keys(env)).publicKey);
    expect(read.payload!.for).toBeUndefined();
    expect((await ana.call("/api/checkout/demo", { method: "POST", json: { ...demo, edition: "pro", plan: "monthly", gift: {} } })).status).toBe(400);
    expect((await ana.call("/api/checkout/demo", { method: "POST", json: { ...demo, edition: "pro", plan: "perpetual", gift: { for: "not an address" } } })).status).toBe(400);
    // Ana owns Auto-Pilot (a real licence: a demo one is credit towards nothing real); a gift of Full costs the whole of Full, not the difference.
    await crew(env)("/api/admin/licences", { method: "POST", json: { who: ana.user.id, edition: "autopilot", plan: "perpetual" } });
    const forHer = (await ana.call("/api/quote", { method: "POST", json: { edition: "full", plan: "perpetual", country: "DE" } })).data;
    const asGift = (await ana.call("/api/quote", { method: "POST", json: { edition: "full", plan: "perpetual", country: "DE", gift: {} } })).data;
    expect(forHer.upgrade).not.toBeNull();
    expect(asGift.upgrade).toBeNull();
    expect(asGift.total).toBeGreaterThan(forHer.total);
  });
});

describe("the crew grants a licence to an account", () => {
  it("by e-mail address, id or sign-in, straight into the account, with who granted it and why", async () => {
    const env = openSite();
    const lena = await person(env, "Lena");
    const byMail = await crew(env)("/api/admin/licences", { method: "POST", json: { who: "LENA@example.test", edition: "karaoke", plan: "perpetual", why: "Tester" } });
    expect(byMail.status).toBe(200);
    expect(byMail.data.licence).toMatchObject({ uid: lena.user.id, edition: "karaoke", plan: "perpetual", status: "active", expires: null });
    expect(byMail.data.order).toMatchObject({ provider: "grant", total: 0, status: "paid", granted: { by: "Owner", why: "Tester" } });
    const byId = await crew(env)("/api/admin/licences", { method: "POST", json: { who: lena.user.id, edition: "pro", plan: "yearly" } });
    expect(byId.data.licence.expires).toBeGreaterThan(Date.now() + 360 * 86_400_000);
    const bySignIn = await crew(env)("/api/admin/licences", { method: "POST", json: { who: `github:${lena.user.identities[0].sub}`, edition: "custom", modules: ["stems", "dvs"] } });
    expect(bySignIn.data.licence.modules).toEqual(["stems", "dvs"]);
    const hers: Licence[] = (await lena.call("/api/me/licences")).data;
    expect(hers.map((l) => l.edition).sort()).toEqual(["custom", "karaoke", "pro"]);
  });

  it("only by the crew, only to an account that exists, and never the free edition", async () => {
    const env = openSite();
    const lena = await person(env, "Lena");
    expect((await lena.call("/api/admin/licences", { method: "POST", json: { who: lena.user.id, edition: "full" } })).status).toBe(403);
    expect((await crew(env)("/api/admin/licences", { method: "POST", json: { who: "nobody@example.test", edition: "full" } })).status).toBe(404);
    expect((await crew(env)("/api/admin/licences", { method: "POST", json: { who: lena.user.id, edition: "hobbyist" } })).status).toBe(400);
    expect((await crew(env)("/api/admin/licences", { method: "POST", json: { who: lena.user.id, edition: "custom" } })).status).toBe(400);
    const orders: Order[] = (await lena.call("/api/me/orders")).data;
    expect(orders).toEqual([]);
  });
});

describe("the crew's password", () => {
  const signIn = (env: never, token: string, ip = "203.0.113.7") => browser(env, "", { "cf-connecting-ip": ip })("/api/auth/owner", { method: "POST", json: { token } });

  it("has no default: until it is set, only the crew token opens Backstage", async () => {
    const env = openSite();
    expect((await crew(env)("/api/admin/password")).data).toEqual({ set: false, at: null });
    expect((await signIn(env, "")).status).toBe(403);
    expect((await signIn(env, "password")).status).toBe(403);
    expect((await signIn(env, "crew-secret")).status).toBe(200);
  });

  it("is set and changed in Backstage, opens it, and the old one stops working; the token always works", async () => {
    const env = openSite();
    expect((await crew(env)("/api/admin/password", { method: "PUT", json: { password: "too short" } })).status).toBe(400);
    expect((await crew(env)("/api/admin/password", { method: "PUT", json: { password: "first long password" } })).status).toBe(200);
    expect((await crew(env)("/api/admin/password")).data.set).toBe(true);
    const r = await signIn(env, "first long password");
    expect(r.status).toBe(200);
    expect(r.res.headers.get("set-cookie")).toMatch(/djm_sid=/);
    expect((await crew(env)("/api/admin/password", { method: "PUT", json: { password: "second long password" } })).status).toBe(200);
    expect((await signIn(env, "first long password")).status).toBe(403);
    expect((await signIn(env, "second long password")).status).toBe(200);
    expect((await signIn(env, "crew-secret")).status).toBe(200);
    // Only the crew may set it, and it is never kept as itself.
    const lena = await person(env, "Lena");
    expect((await lena.call("/api/admin/password", { method: "PUT", json: { password: "lena's own password" } })).status).toBe(403);
    const kept = await (env as unknown as { KV: KVNamespace }).KV.get("admin:password");
    expect(kept).not.toContain("second long password");
  });

  it("stops answering one address after ten wrong tries, and a right one does not count", async () => {
    const env = openSite();
    for (let i = 0; i < 12; i++) expect((await signIn(env, "crew-secret")).status).toBe(200);
    for (let i = 0; i < 10; i++) expect((await signIn(env, `guess ${i}`)).status).toBe(403);
    expect((await signIn(env, "crew-secret")).status).toBe(429);
    expect((await signIn(env, "crew-secret", "198.51.100.9")).status).toBe(200);
  });
});
