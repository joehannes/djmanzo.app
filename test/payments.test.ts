import { afterEach, describe, expect, it, vi } from "vitest";
import { browser, crew, openSite, person } from "./people";

afterEach(() => vi.unstubAllGlobals());

const PK = "pk_test_51AbCdEfGhIjKlMnOp";
const SK = "sk_test_51AbCdEfGhIjKlMnOpSecret9876";
const WH = "whsec_AbCdEfGhIjKlMnOp1234";
const set = (env: never, json: unknown) => crew(env)("/api/admin/payments", { method: "PUT", json });

describe("the ways to pay, set in Backstage", () => {
  it("connect Stripe without a deploy: the shop offers the card form, and the demo checkout steps aside", async () => {
    const env = openSite();
    const before = (await browser(env)("/api/catalog")).data.pay;
    expect(before.stripe).toBeNull();
    expect(before.demo).toBe(true);
    const r = await set(env, { values: { STRIPE_PUBLISHABLE_KEY: PK, STRIPE_SECRET_KEY: SK, STRIPE_WEBHOOK_SECRET: WH } });
    expect(r.status).toBe(200);
    expect(r.data.mode).toMatchObject({ stripe: "test", stripeWebhook: true, paypal: null });
    const after = (await browser(env)("/api/catalog")).data.pay;
    expect(after.stripe).toEqual({ key: PK, wallets: { applePay: true, googlePay: true } });
    expect(after.demo).toBe(false);
  });

  it("shows Backstage only a secret's last four characters, and keeps none of it readable in KV", async () => {
    const env = openSite();
    await set(env, { values: { STRIPE_PUBLISHABLE_KEY: PK, STRIPE_SECRET_KEY: SK, PAYPAL_CLIENT_ID: "AbCdEfGhIjKlMnOpQrStUv", PAYPAL_CLIENT_SECRET: "EfGhIjKlMnOpQrStUvWxYz12" } });
    const v = (await crew(env)("/api/admin/payments")).data;
    expect(v.fields.STRIPE_SECRET_KEY).toEqual({ set: true, from: "backstage", shown: "…9876" });
    expect(v.fields.PAYPAL_CLIENT_SECRET.shown).toBe("…YZ12".replace("YZ", "Yz"));
    expect(v.fields.STRIPE_PUBLISHABLE_KEY.shown).toBe(PK);
    expect(JSON.stringify(v)).not.toContain(SK);
    const kept = await (env as unknown as { KV: KVNamespace }).KV.get("config:payments");
    expect(kept).not.toContain("sk_test");
    expect(kept).not.toContain("EfGhIjKl");
  });

  it("wins over a Worker secret, and falls back to it when cleared", async () => {
    const env = openSite({ STRIPE_PUBLISHABLE_KEY: "pk_test_FromTheWorkerSecret1", STRIPE_SECRET_KEY: "sk_test_FromTheWorkerSecret1" });
    expect((await crew(env)("/api/admin/payments")).data.fields.STRIPE_SECRET_KEY.from).toBe("worker secret");
    await set(env, { values: { STRIPE_PUBLISHABLE_KEY: PK, STRIPE_SECRET_KEY: SK } });
    expect((await browser(env)("/api/catalog")).data.pay.stripe.key).toBe(PK);
    await set(env, { values: { STRIPE_PUBLISHABLE_KEY: "", STRIPE_SECRET_KEY: "" } });
    expect((await browser(env)("/api/catalog")).data.pay.stripe.key).toBe("pk_test_FromTheWorkerSecret1");
  });

  it("refuses what is not a key, a live key paired with a test key, and anyone but the crew", async () => {
    const env = openSite();
    expect((await set(env, { values: { STRIPE_SECRET_KEY: "hunter2" } })).status).toBe(400);
    expect((await set(env, { values: { STRIPE_PUBLISHABLE_KEY: "pk_live_51AbCdEfGhIjKlMnOp", STRIPE_SECRET_KEY: SK } })).status).toBe(400);
    expect((await set(env, { values: { NOT_A_SETTING: "x" } })).status).toBe(400);
    const lena = await person(env, "Lena");
    expect((await lena.call("/api/admin/payments", { method: "PUT", json: { values: { STRIPE_SECRET_KEY: SK } } })).status).toBe(403);
    expect((await lena.call("/api/admin/payments")).status).toBe(403);
  });

  it("switches Apple Pay and Google Pay in the card form", async () => {
    const env = openSite();
    await set(env, { values: { STRIPE_PUBLISHABLE_KEY: PK, STRIPE_SECRET_KEY: SK }, wallets: { applePay: false } });
    expect((await browser(env)("/api/catalog")).data.pay.stripe.wallets).toEqual({ applePay: false, googlePay: true });
  });

  it("are unreadable, and say so, once the secret they were kept under changes", async () => {
    const env = openSite();
    await set(env, { values: { STRIPE_PUBLISHABLE_KEY: PK, STRIPE_SECRET_KEY: SK } });
    const moved = { ...(env as object), ADMIN_TOKEN: "a-new-crew-secret" } as never;
    const v = await browser(moved, "", { authorization: "Bearer a-new-crew-secret" })("/api/admin/payments");
    expect(v.data.unreadable).toBe(true);
    expect(v.data.fields.STRIPE_SECRET_KEY.set).toBe(false);
  });
});

describe("the crew's checks", () => {
  it("ask Stripe whether charges and payouts are on and where payouts go, and PayPal whether its keys work", async () => {
    const env = openSite();
    await set(env, { values: { STRIPE_PUBLISHABLE_KEY: PK, STRIPE_SECRET_KEY: SK, PAYPAL_CLIENT_ID: "AbCdEfGhIjKlMnOpQrStUv", PAYPAL_CLIENT_SECRET: "EfGhIjKlMnOpQrStUvWxYz12", PAYPAL_ENV: "live" } });
    const asked: string[] = [];
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      asked.push(String(url));
      if (String(url) === "https://api.stripe.com/v1/account") {
        expect(new Headers(init?.headers).get("authorization")).toBe(`Bearer ${SK}`);
        return Response.json({ country: "AT", default_currency: "eur", charges_enabled: true, payouts_enabled: true, external_accounts: { data: [{ bank_name: "WISE EUROPE", last4: "4321" }] } });
      }
      if (String(url).startsWith("https://api.stripe.com/v1/payment_method_domains")) return Response.json({ data: [{ domain_name: "djmanzo.test", apple_pay: { status: "active" }, google_pay: { status: "active" } }] });
      if (String(url) === "https://api-m.paypal.com/v1/oauth2/token") return Response.json({ access_token: "t" });
      throw new Error(`unexpected fetch ${url}`);
    });
    const r = (await crew(env)("/api/admin/payments/check", { method: "POST" })).data;
    expect(r.stripe).toEqual({ ok: true, country: "AT", currency: "eur", charges: true, payouts: true, payoutTo: "WISE EUROPE …4321", applePayDomain: { domain: "djmanzo.test", applePay: "active", googlePay: "active" } });
    expect(r.paypal).toEqual({ ok: true, mode: "live" });
  });

  it("register the site's domain with Stripe for Apple Pay and Google Pay", async () => {
    const env = openSite();
    await set(env, { values: { STRIPE_PUBLISHABLE_KEY: PK, STRIPE_SECRET_KEY: SK } });
    let body = "";
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(String(url)).toBe("https://api.stripe.com/v1/payment_method_domains");
      body = String(init?.body);
      return Response.json({ domain_name: "djmanzo.test", apple_pay: { status: "active" }, google_pay: { status: "active" } });
    });
    const r = await crew(env)("/api/admin/payments/apple-pay", { method: "POST" });
    expect(r.data).toEqual({ domain: "djmanzo.test", applePay: "active", googlePay: "active" });
    expect(body).toBe("domain_name=djmanzo.test");
  });
});
