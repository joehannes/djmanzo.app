import { describe, expect, it } from "vitest";
import { ALPHABET } from "../worker/promo";
import { keys } from "../worker/licence";
import { b64url, unb64url } from "../worker/http";
import { PREFIX, allows, expired, gives, invalid, readVoucher, signVoucher, voucherId, type VoucherPayload } from "../worker/voucher";
import type { Licence } from "../worker/store";
import { browser, crew, person } from "./people";
import { testEnv } from "./kv";

// Made by the desktop side (dj_app::voucher) with its own key: this site must read it as djmanzo does.
const DESKTOP_KEY = "D3CJiHuiUTvveveS69VWZJohTjd6i216vrgSFH6d4gg=";
const DESKTOP_GIFT =
  "djmanzo-voucher-1.eyJ2IjoxLCJpZCI6Ik1BTlpPLUdJRlQtTFQ1VlVLIiwiZWRpdGlvbiI6ImZ1bGwiLCJwZXJjZW50IjoxMDAsImlzc3VlZCI6MTc5MjQ2MjY5Niwibm90ZSI6IkEgZ2lmdCBvZiBkam1hbnpvIEZ1bGwsIHRvIGtlZXAuIn0.3aodCPMTFgmTzcHlLhVzZJ-uMHfs3d1jTAEZTP7MN562J75TCr51UOY0OKmvXeRoVbkwXVU_KtL2zMe4O7G4CA";

const raw = (b64: string) => crypto.subtle.importKey("raw", Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), { name: "Ed25519" }, false, ["verify"]);
const shop = () => keys(testEnv());
const base: VoucherPayload = { v: 1, id: "MANZO-7K3Q", edition: "full", percent: 100, issued: 1_792_462_696 };

/** Sign any bytes as a voucher, past signVoucher's own checks: what a careless or hostile signer could make. */
async function signAnything(payload: unknown, key: CryptoKey): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return `${PREFIX}${b64url(bytes)}.${b64url(await crypto.subtle.sign({ name: "Ed25519" }, key, bytes))}`;
}

const html = async (r: { res: Response }) => r.res.clone().text();

describe("the voucher line is the application's", () => {
  it("reads the desktop side's gift with its key: Full, outright, with its note", async () => {
    const read = await readVoucher(DESKTOP_GIFT, await raw(DESKTOP_KEY));
    expect(read.refused).toBeUndefined();
    expect(read.payload).toEqual({ v: 1, id: "MANZO-GIFT-LT5VUK", edition: "full", percent: 100, issued: 1792462696, note: "A gift of djmanzo Full, to keep." });
    expect(gives(read.payload!)).toBe("gift");
  });

  it("signs a line that reads back as it was, in djmanzo's field order, with what is empty left out", async () => {
    const { privateKey, publicKey } = await shop();
    const p: VoucherPayload = { ...base, edition: "custom", modules: "stems,dvs", percent: 30, until: 1_800_000_000, for: ["github:1234567", "dj@example.org"], note: "Happy birthday" };
    const line = await signVoucher(p, privateKey);
    expect((await readVoucher(line, publicKey)).payload).toEqual(p);
    const json = new TextDecoder().decode(unb64url(line.slice(PREFIX.length).split(".")[0]));
    expect(json).toBe('{"v":1,"id":"MANZO-7K3Q","edition":"custom","modules":"stems,dvs","percent":30,"issued":1792462696,"until":1800000000,"for":["github:1234567","dj@example.org"],"note":"Happy birthday"}');
    const bare = await signVoucher({ ...base, for: [], note: "" }, privateKey);
    expect(new TextDecoder().decode(unb64url(bare.slice(PREFIX.length).split(".")[0]))).toBe('{"v":1,"id":"MANZO-7K3Q","edition":"full","percent":100,"issued":1792462696}');
  });

  it("tolerates the spaces and line breaks of a pasted line", async () => {
    const broken = DESKTOP_GIFT.replace(/(.{40})/g, "$1\n  ");
    expect((await readVoucher(` ${broken}\n`, await raw(DESKTOP_KEY))).payload?.id).toBe("MANZO-GIFT-LT5VUK");
  });

  it("refuses a changed byte, a wrong key, a damaged line, and something else altogether", async () => {
    const key = await raw(DESKTOP_KEY);
    const [head, body, sig] = [PREFIX, ...DESKTOP_GIFT.slice(PREFIX.length).split(".")];
    // The payload made to say 99 % instead of 100: the signature no longer covers it.
    const tampered = head + b64url(new TextEncoder().encode(new TextDecoder().decode(unb64url(body)).replace("100", "99"))) + "." + sig;
    expect((await readVoucher(tampered, key)).refused).toMatch(/not made by djmanzo/);
    const flipped = new Uint8Array(unb64url(sig));
    flipped[5] ^= 1;
    expect((await readVoucher(`${head}${body}.${b64url(flipped)}`, key)).refused).toMatch(/not made by djmanzo/);
    expect((await readVoucher(DESKTOP_GIFT, (await shop()).publicKey)).refused).toMatch(/not made by djmanzo/);
    expect((await readVoucher(`${head}${body}`, key)).refused).toMatch(/damaged/);
    expect((await readVoucher("djmanzo-licence-1.abc.def", key)).refused).toMatch(/not a djmanzo voucher/);
  });

  it("believes a line under any of several keys", async () => {
    expect((await readVoucher(DESKTOP_GIFT, [(await shop()).publicKey, await raw(DESKTOP_KEY)])).payload?.id).toBe("MANZO-GIFT-LT5VUK");
  });
});

describe("what a voucher may say", () => {
  const no = (p: Record<string, unknown>) => invalid({ ...base, ...p } as VoucherPayload);
  it("accepts the plain gift", () => expect(invalid(base)).toBeNull());
  it("is format 1", () => expect(no({ v: 2 })).toMatch(/format/));
  it("has a name of 1 to 64 characters", () => {
    expect(no({ id: "" })).toMatch(/1 to 64/);
    expect(no({ id: "X".repeat(65) })).toMatch(/1 to 64/);
    expect(no({ id: "X".repeat(64) })).toBeNull();
  });
  it("takes 1 to 100 % off, in whole numbers", () => {
    for (const percent of [0, 101, 12.5, "50"]) expect(no({ percent }), String(percent)).toMatch(/1 to 100/);
    expect(no({ percent: 1 })).toBeNull();
  });
  it("is for an edition djmanzo has", () => expect(no({ edition: "platinum" })).toMatch(/one edition/));
  it("names modules for Custom, and only for Custom", () => {
    expect(no({ edition: "custom" })).toMatch(/names its modules/);
    expect(no({ edition: "custom", modules: "stems,warp-drive" })).toMatch(/names its modules/);
    expect(no({ edition: "custom", modules: "stems" })).toBeNull();
    expect(no({ modules: "stems" })).toMatch(/Only a Custom/);
  });
  it("keeps its note to 280 characters", () => {
    expect(no({ note: "x".repeat(281) })).toMatch(/280/);
    expect(no({ note: "x".repeat(280) })).toBeNull();
  });
  it("is for at most 64 people, none of them blank", () => {
    expect(no({ for: Array.from({ length: 65 }, (_, i) => `github:${i}`) })).toMatch(/at most 64/);
    expect(no({ for: ["github:1", "  "] })).toMatch(/account or an e-mail/);
    expect(no({ for: [] })).toBeNull();
  });
  it("is refused when read, even with a good signature", async () => {
    const { privateKey, publicKey } = await shop();
    expect((await readVoucher(await signAnything({ ...base, percent: 1000 }, privateKey), publicKey)).refused).toMatch(/1 to 100/);
    expect((await readVoucher(await signAnything({ ...base, edition: "custom" }, privateKey), publicKey)).refused).toMatch(/modules/);
  });
  it("cannot be signed when djmanzo would refuse it", async () => {
    await expect(signVoucher({ ...base, percent: 0 }, (await shop()).privateKey)).rejects.toThrow(/1 to 100/);
  });
});

describe("whom it is for, and until when", () => {
  const p: VoucherPayload = { ...base, for: ["GitHub:1234567", "DJ@Example.org"] };
  it("anybody, when it names nobody", () => {
    expect(allows(base, {})).toBe(true);
    expect(allows({ ...base, for: [] }, { account: "google:1" })).toBe(true);
  });
  it("an account it names, or an address, without regard to case", () => {
    expect(allows(p, { account: "github:1234567" })).toBe(true);
    expect(allows(p, { account: ["google:9", "github:1234567"] })).toBe(true);
    expect(allows(p, { email: "dj@example.ORG" })).toBe(true);
    expect(allows(p, { account: "github:7654321", email: "other@example.org" })).toBe(false);
    expect(allows(p, {})).toBe(false);
  });
  it("an address never matches an account, nor an account an address", () => {
    expect(allows({ ...base, for: ["dj@example.org"] }, { account: "dj@example.org" })).toBe(false);
    expect(allows({ ...base, for: ["github:1"] }, { email: "github:1" })).toBe(false);
  });
  it("can be taken until the last second of `until`, not after", () => {
    expect(expired({ ...base, until: 100 }, 100)).toBe(false);
    expect(expired({ ...base, until: 100 }, 101)).toBe(true);
    expect(expired(base, 9e12)).toBe(false);
  });
  it("is named in the promo codes' alphabet", () => {
    const id = voucherId("MANZO-GIFT");
    expect(id).toMatch(/^MANZO-GIFT-[A-Z0-9]{6}$/);
    for (const ch of id.slice(11)) expect(ALPHABET).toContain(ch);
  });
});

describe("Backstage makes vouchers and gives them away", () => {
  it("only for the crew", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    expect((await browser(env)("/api/admin/vouchers", { method: "POST", json: { edition: "full", percent: 100 } })).status).toBe(403);
    expect((await browser(env)("/api/admin/vouchers")).status).toBe(403);
    expect((await browser(env)("/api/admin/vouchers/X/revoke", { method: "POST" })).status).toBe(403);
  });

  it("signs them with the licence key, lists them newest first with their takes, and withdraws one", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const admin = crew(env);
    const one = await admin("/api/admin/vouchers", { method: "POST", json: { edition: "custom", modules: ["dvs", "stems"], percent: 25, count: 3, for: ["dj@example.org"], note: "For the crew" } });
    expect(one.status).toBe(200);
    expect(one.data.vouchers).toHaveLength(3);
    const { publicKey } = await keys(env);
    for (const v of one.data.vouchers) {
      const read = await readVoucher(v.line, publicKey);
      expect(read.payload).toMatchObject({ id: v.id, edition: "custom", modules: "stems,dvs", percent: 25, for: ["dj@example.org"], note: "For the crew" });
    }
    expect(one.data.vouchers[0].id).toMatch(/^MANZO-[A-Z0-9]{6}$/);
    const gift = await admin("/api/admin/vouchers", { method: "POST", json: { edition: "full", percent: 100 } });
    expect(gift.data.vouchers[0].id).toMatch(/^MANZO-GIFT-/);
    expect((await admin("/api/admin/vouchers", { method: "POST", json: { edition: "full", percent: 100, count: 51 } })).status).toBe(400);
    expect((await admin("/api/admin/vouchers", { method: "POST", json: { edition: "full", percent: 0 } })).status).toBe(400);

    const listed = (await admin("/api/admin/vouchers")).data;
    expect(listed).toHaveLength(4);
    expect(listed[0]).toMatchObject({ edition: expect.any(String), taken: 0, revoked: false });
    expect(listed.find((v: { id: string }) => v.id === one.data.vouchers[0].id)).toMatchObject({ edition: "custom", percent: 25, for: 1 });
    expect((await admin(`/api/admin/vouchers/${gift.data.vouchers[0].id}`)).data.line).toBe(gift.data.vouchers[0].line);

    expect((await admin(`/api/admin/vouchers/${gift.data.vouchers[0].id}/revoke`, { method: "POST" })).data.revoked).toBe(true);
    expect((await admin("/api/admin/vouchers")).data.find((v: { id: string }) => v.id === gift.data.vouchers[0].id).revoked).toBe(true);
    expect((await admin("/api/admin/vouchers/NOPE/revoke", { method: "POST" })).status).toBe(404);
  });
});

describe("taking a voucher at /redeem", () => {
  async function made(env: never, json: Record<string, unknown>) {
    return (await crew(env)("/api/admin/vouchers", { method: "POST", json })).data.vouchers[0] as { id: string; line: string };
  }
  const at = (line: string) => `/redeem?voucher=${encodeURIComponent(line)}`;

  it("refuses a line that is not a voucher, a withdrawn one and one past its last day, in a sentence", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const web = browser(env);
    const bad = await web(at("djmanzo-voucher-1.nonsense.here"));
    expect(bad.status).toBe(400);
    expect(await html(bad)).toMatch(/not made by djmanzo|damaged/);
    const gone = await made(env, { edition: "full", percent: 100 });
    await crew(env)(`/api/admin/vouchers/${gone.id}/revoke`, { method: "POST" });
    const withdrawn = await web(at(gone.line));
    expect(withdrawn.status).toBe(410);
    expect(await html(withdrawn)).toMatch(/withdrawn/);
    const old = await made(env, { edition: "full", percent: 100, until: 1_000_000 });
    const late = await web(at(old.line));
    expect(late.status).toBe(410);
    expect(await html(late)).toMatch(/until 1970-01-12; that day has passed/);
  });

  it("a gift asks the visitor to sign in, refuses somebody it is not for, and is taken once into a licence djmanzo fetches", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret", GITHUB_CLIENT_ID: "id", GITHUB_CLIENT_SECRET: "secret" });
    const lena = await person(env, "Lena");
    const other = await person(env, "Otto");
    const gift = await made(env, { edition: "pro", percent: 100, for: ["LENA@example.test"], note: "For the set at the harbour" });

    const anon = await browser(env)(at(gift.line));
    expect(anon.status).toBe(200);
    const page = await html(anon);
    expect(page).toMatch(/A gift: djmanzo Pro DJ/);
    expect(page).toMatch(/For the set at the harbour/);
    expect(page).toContain(`/auth/start/github?return=${encodeURIComponent(`/redeem?id=${gift.id}`)}`);

    // Otto is not who it was made for: no button, and a post is refused too.
    expect(await html(await other.call(`/redeem?id=${gift.id}`))).toMatch(/made for somebody else/);
    const form = { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `id=${gift.id}` };
    expect((await other.call("/redeem", form)).status).toBe(403);
    expect((await browser(env)("/redeem", form)).status).toBe(401);

    expect(await html(await lena.call(`/redeem?id=${gift.id}`))).toMatch(/Take it/);
    const taken = await lena.call("/redeem", form);
    expect(taken.status).toBe(200);
    expect(await html(taken)).toMatch(/It's yours: djmanzo Pro DJ/);

    // A purchase's licence: bought once, not demo, and the line djmanzo would fetch says Pro DJ for her account.
    const lics = (await lena.call("/api/me/licences")).data as Licence[];
    expect(lics).toHaveLength(1);
    expect(lics[0]).toMatchObject({ edition: "pro", plan: "perpetual", status: "active", demo: false, expires: null });
    const line = (await lena.call("/api/me/licence-line")).data;
    const payload = JSON.parse(new TextDecoder().decode(unb64url(line.licence.split(".")[1])));
    expect(payload).toMatchObject({ account: line.account, edition: "pro" });
    expect(payload.paid_until).toBeUndefined();

    // The take is recorded; taking again makes no second licence.
    const listed = (await crew(env)("/api/admin/vouchers")).data;
    expect(listed.find((v: { id: string }) => v.id === gift.id).taken).toBe(1);
    expect(await html(await lena.call(`/redeem?id=${gift.id}`))).toMatch(/already yours/);
    expect((await lena.call("/redeem", form)).status).toBe(403);
    expect((await lena.call("/api/me/licences")).data).toHaveLength(1);
  });

  it("a gift for an account is taken by that account", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const ana = await person(env, "Ana");
    const account = `github:${ana.user.identities[0].sub}`;
    const gift = await made(env, { edition: "karaoke", percent: 100, for: [account.toUpperCase()] });
    const r = await ana.call("/redeem", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `voucher=${encodeURIComponent(gift.line)}` });
    expect(r.status).toBe(200);
    expect((await ana.call("/api/me/licences")).data[0].edition).toBe("karaoke");
  });

  it("honours the desktop side's gift only under a key the owner named", async () => {
    const plain = testEnv();
    expect((await browser(plain)(at(DESKTOP_GIFT))).status).toBe(400);
    const env = testEnv({ DJMANZO_GIFT_KEYS: `  ${DESKTOP_KEY} , not-a-key` });
    const rosa = await person(env, "Rosa");
    expect(await html(await rosa.call(at(DESKTOP_GIFT)))).toMatch(/A gift: djmanzo Full[\s\S]*A gift of djmanzo Full, to keep\./);
    const r = await rosa.call("/redeem", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "id=MANZO-GIFT-LT5VUK" });
    expect(r.status).toBe(200);
    expect((await rosa.call("/api/me/licences")).data[0]).toMatchObject({ edition: "full", plan: "perpetual" });
  });

  it("a discount says what it takes off and goes on to the box office with the voucher", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const v = await made(env, { edition: "full", percent: 40 });
    const r = await browser(env)(at(v.line));
    expect(r.status).toBe(200);
    const page = await html(r);
    expect(page).toMatch(/40 % off djmanzo Full/);
    expect(page).toMatch(/\$149; with this voucher, \$89\.40/);
    expect(page).toContain(`/island/?voucher=${encodeURIComponent(v.line)}#/taquilla`);
  });
});

describe("a discount voucher at the box office", () => {
  const quote = (call: ReturnType<typeof browser>, json: Record<string, unknown>) => call("/api/quote", { method: "POST", json: { edition: "full", plan: "perpetual", country: "US", ...json } });

  it("takes its percentage off the list price, and never on top of another discount", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const admin = crew(env);
    const v = (await admin("/api/admin/vouchers", { method: "POST", json: { edition: "full", percent: 40 } })).data.vouchers[0];
    await admin("/api/admin/promos", { method: "POST", json: { kind: "percent", value: 10, code: "TEN" } });
    await admin("/api/admin/promos", { method: "POST", json: { kind: "percent", value: 50, code: "FIFTY" } });
    const web = browser(env);
    const q = (await quote(web, { voucher: v.line })).data;
    expect(q.voucher).toMatchObject({ ok: true, id: v.id, percent: 40 });
    expect(q.total).toBe(14900 - 5960);
    // Typed into the promo box, a line is a voucher all the same.
    expect((await quote(web, { promo: v.line })).data.total).toBe(8940);
    // A smaller promo gives way to the voucher; a larger one wins; they never add up.
    const small = (await quote(web, { voucher: v.line, promo: "TEN" })).data;
    expect(small.total).toBe(8940);
    expect(small.promo.ok).toBe(false);
    const large = (await quote(web, { voucher: v.line, promo: "FIFTY" })).data;
    expect(large.total).toBe(7450);
    expect(large.voucher.ok).toBe(false);
    // In Ethiopia Full is already 30 % of the list price: 40 % off the list price does not beat it.
    const et = (await quote(web, { voucher: v.line, country: "ET" })).data;
    expect(et.total).toBe(et.regional);
    expect(et.total).toBeLessThan(8940);
    expect(et.voucher.reason).toMatch(/do not stack/);
    // Only for its edition.
    expect((await quote(web, { voucher: v.line, edition: "pro" })).data.voucher).toMatchObject({ ok: false, reason: expect.stringMatching(/Full/) });
  });

  it("a held one asks for its person, a gift is sent to /redeem, and a purchase records the take", async () => {
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const admin = crew(env);
    const held = (await admin("/api/admin/vouchers", { method: "POST", json: { edition: "karaoke", percent: 20, for: ["mara@example.test"] } })).data.vouchers[0];
    const gift = (await admin("/api/admin/vouchers", { method: "POST", json: { edition: "full", percent: 100 } })).data.vouchers[0];
    expect((await quote(browser(env), { edition: "karaoke", voucher: held.line })).data.voucher.reason).toMatch(/sign in/);
    expect((await quote(browser(env), { voucher: gift.line })).data.voucher.reason).toMatch(/\/redeem/);
    const otto = await person(env, "Otto");
    expect((await quote(otto.call, { edition: "karaoke", voucher: held.line })).data.voucher.reason).toMatch(/somebody else/);

    const mara = await person(env, "Mara");
    const bought = await mara.call("/api/checkout/demo", { method: "POST", json: { edition: "karaoke", plan: "perpetual", country: "US", instrument: "US", billing: "US", voucher: held.line } });
    expect(bought.status).toBe(200);
    expect(bought.data.order).toMatchObject({ total: 5500 - 1100, voucher: held.id });
    const listed = (await admin("/api/admin/vouchers")).data;
    expect(listed.find((x: { id: string }) => x.id === held.id).taken).toBe(1);
    expect((await quote(mara.call, { edition: "karaoke", voucher: held.line })).data.voucher.reason).toMatch(/already used/);
    await admin(`/api/admin/vouchers/${held.id}/revoke`, { method: "POST" });
    expect((await quote(otto.call, { edition: "karaoke", voucher: held.line })).data.voucher.reason).toMatch(/withdrawn/);
  });
});
