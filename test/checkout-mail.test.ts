/**
 * Buying, end to end, without money: Stripe and Resend stood in for by what
 * their APIs answer, so every step the site takes is checked — the address
 * confirmed first, what is asked of Stripe, the order, the licence, and every
 * message to the buyer.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { browser, crew, openSite, person } from "./people";
import { stripeConfig } from "./stripe-config";

afterEach(() => vi.unstubAllGlobals());

const MAIL = { RESEND_API_KEY: "re_test_AbCdEfGhIjKl", MAIL_FROM: "djmanzo <hello@djmanzo.test>", RECEIPT_NOTE: "No VAT: small business exemption." };
const STRIPE = { STRIPE_PUBLISHABLE_KEY: "pk_test_51AbCdEfGhIjKlMnOp", STRIPE_SECRET_KEY: "sk_test_51AbCdEfGhIjKlMnOpSecret9876", STRIPE_WEBHOOK_SECRET: "whsec_AbCdEfGhIjKlMnOp1234" };

interface Sent {
  to: string[];
  subject: string;
  text: string;
  html: string;
}

/** Resend and Stripe as their APIs answer: what was sent and asked is kept to look at. */
function world(stripe: Partial<Record<string, (body: URLSearchParams) => unknown>> = {}) {
  const mails: Sent[] = [];
  const asked: { path: string; body: URLSearchParams }[] = [];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const u = String(url);
    if (u === "https://api.resend.com/emails") {
      mails.push(JSON.parse(String(init?.body)));
      return Response.json({ id: `email_${mails.length}` });
    }
    if (u.startsWith("https://api.stripe.com/v1/")) {
      const path = u.slice("https://api.stripe.com/v1/".length).split("?")[0];
      const body = new URLSearchParams(init?.body ? String(init.body) : "");
      asked.push({ path: `${init?.method ?? "GET"} ${path}`, body });
      if (path === "payment_method_configurations") return Response.json({ data: [stripeConfig(["card", "apple_pay", "google_pay", "link", "sepa_debit", "klarna"])] });
      if (path === "customers") return Response.json({ id: "cus_1" });
      const answer = stripe[`${init?.method ?? "GET"} ${path}`];
      if (answer) return Response.json(answer(body));
      throw new Error(`unexpected Stripe call ${init?.method ?? "GET"} ${path}`);
    }
    throw new Error(`unexpected fetch ${u}`);
  });
  return { mails, asked };
}

async function signed(secret: string, payload: string) {
  const t = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)))].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `t=${t},v1=${mac}`;
}

const CARD = { id: "pm_card", type: "card", card: { country: "AT", brand: "visa", last4: "4242" }, billing_details: { address: { country: "AT" } } };
const SEPA = { id: "pm_sepa", type: "sepa_debit", sepa_debit: { country: "AT" }, billing_details: { address: { country: "AT" } } };
const KLARNA = { id: "pm_klarna", type: "klarna", billing_details: { address: { country: "AT" } } };
const buyOnce = { edition: "karaoke", plan: "perpetual", country: "AT" };

describe("the address a buyer is written to", () => {
  it("is the one their provider vouched for at a press, any other by a code; and nothing is paid for before it is confirmed", async () => {
    const { mails } = world();
    const env = openSite({ ...MAIL, BANK_TRANSFER_DETAILS: "IBAN AT00 0000, the owner" });
    const dj = await person(env, "Mira");
    // Nothing paid before an address is known.
    expect((await dj.call("/api/checkout/transfer", { method: "POST", json: buyOnce })).status).toBe(428);
    // Another address: a code goes to it, and the account waits for it.
    const asked = await dj.call("/api/me/contact", { method: "POST", json: { email: "Mira.Bookings@Example.org", lang: "de" } });
    expect(asked.data).toMatchObject({ sent: true, pending: "mira.bookings@example.org", contact: null });
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toEqual(["mira.bookings@example.org"]);
    expect(mails[0].subject).toMatch(/^Dein djmanzo-Code: \d{6}$/);
    const code = mails[0].subject.slice(-6);
    expect((await dj.call("/api/checkout/transfer", { method: "POST", json: buyOnce })).status).toBe(428);
    const wrong = code === "000000" ? "111111" : "000000";
    expect((await dj.call("/api/me/contact/confirm", { method: "POST", json: { code: wrong } })).status).toBe(400);
    const ok = await dj.call("/api/me/contact/confirm", { method: "POST", json: { code } });
    expect(ok.status).toBe(200);
    expect(ok.data.contact).toMatchObject({ email: "mira.bookings@example.org" });
    expect((await dj.call("/api/me")).data.user.contact.confirmed).toBeGreaterThan(0);
    // The address GitHub vouched for: confirmed by asking for it, no code.
    const leo = await person(env, "Leo");
    const own = await leo.call("/api/me/contact", { method: "POST", json: { email: "leo@example.test" } });
    expect(own.data).toMatchObject({ sent: false, contact: { email: "leo@example.test" } });
    expect(own.data.contact.confirmed).toBeGreaterThan(0);
    expect(mails).toHaveLength(1);
  });

  it("allows five wrong codes, then asks for a new one", async () => {
    const { mails } = world();
    const env = openSite(MAIL);
    const dj = await person(env, "Ana");
    await dj.call("/api/me/contact", { method: "POST", json: { email: "ana@elsewhere.org" } });
    const code = mails[0].subject.slice(-6);
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 4; i++) expect((await dj.call("/api/me/contact/confirm", { method: "POST", json: { code: wrong } })).status).toBe(400);
    expect((await dj.call("/api/me/contact/confirm", { method: "POST", json: { code: wrong } })).status).toBe(429);
    expect((await dj.call("/api/me/contact/confirm", { method: "POST", json: { code } })).status).toBe(410);
  });
});

describe("a bank transfer", () => {
  it("is confirmed by e-mail at once with how to pay, and the receipt with the licence key follows the crew's 'paid', once", async () => {
    const { mails } = world();
    const env = openSite({ ...MAIL, BANK_TRANSFER_DETAILS: "Account: The Owner\nIBAN AT00 1234 5678 9012\nBIC WISEATXXX" });
    const dj = await person(env, "Kai");
    await dj.call("/api/me/contact", { method: "POST", json: { email: "kai@example.test", lang: "en" } });
    const placed = await dj.call("/api/checkout/transfer", { method: "POST", json: { ...buyOnce, billing: "AT" } });
    expect(placed.status).toBe(200);
    expect(placed.data.mailedTo).toBe("kai@example.test");
    const order = placed.data.order;
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toEqual(["kai@example.test"]);
    expect(mails[0].subject).toContain(order.id);
    for (const words of [placed.data.display, "IBAN AT00 1234 5678 9012", order.id, "/#download", "seven-day trial", "djmanzo Karaoke"]) expect(mails[0].text).toContain(words);

    const paid = await crew(env)(`/api/admin/orders/${order.id}/paid`, { method: "POST", json: { bankCountry: "AT" } });
    expect(paid.status).toBe(200);
    expect(mails).toHaveLength(2);
    const receipt = mails[1];
    expect(receipt.subject).toBe(`djmanzo: your receipt and licence, order ${order.id}`);
    for (const words of ["RECEIPT", `Order: ${order.id}`, `Total paid: ${placed.data.display}`, "Paid with: bank transfer", "Sold by: The Owner, Somewhere 1, 4020 Linz, Austria", "No VAT: small business exemption.", "YOUR LICENCE", "Settings → Licence"]) expect(receipt.text).toContain(words);
    // The licence key itself: the line djmanzo takes, as the account page gives it.
    const line = (await dj.call("/api/me/licence-line")).data.licence as string;
    expect(line.length).toBeGreaterThan(40);
    expect(receipt.text).toContain(line.slice(0, 40));
    expect(receipt.html).toContain("<p");
    // Marked paid again: no second receipt.
    await crew(env)(`/api/admin/orders/${order.id}/paid`, { method: "POST", json: { bankCountry: "AT" } });
    expect(mails).toHaveLength(2);
    expect((await crew(env)("/api/admin/orders")).data.orders[0].mailed).toMatchObject({ waiting: expect.any(Number), receipt: expect.any(Number) });
  });

  it("without e-mail set up, still takes the order and says nothing went out", async () => {
    const { mails } = world();
    const env = openSite({ BANK_TRANSFER_DETAILS: "IBAN AT00 0000, the owner" });
    const dj = await person(env, "Noa");
    expect((await dj.call("/api/me")).data.mail).toBe(false);
    // An address no provider vouched for is kept unconfirmed: nothing could confirm it.
    expect((await dj.call("/api/me/contact", { method: "POST", json: { email: "noa@elsewhere.org" } })).data).toMatchObject({ sent: false, mail: false, contact: { email: "noa@elsewhere.org", confirmed: null } });
    const placed = await dj.call("/api/checkout/transfer", { method: "POST", json: buyOnce });
    expect(placed.status).toBe(200);
    expect(placed.data.mailedTo).toBeNull();
    expect(mails).toHaveLength(0);
  });
});

describe("Stripe", () => {
  it("a card bought once: not kept on the customer, the payment held to the card, the licence at once, the receipt with the card's name", async () => {
    const { mails, asked } = world({
      "GET payment_methods/pm_card": () => CARD,
      "POST payment_intents": (b) => ({ id: "pi_1", status: "succeeded", amount: Number(b.get("amount")) }),
    });
    const env = openSite({ ...MAIL, ...STRIPE });
    const dj = await person(env, "Ivo");
    await dj.call("/api/me/contact", { method: "POST", json: { email: "ivo@example.test" } });
    const r = await dj.call("/api/checkout/stripe", { method: "POST", json: { ...buyOnce, paymentMethod: "pm_card" } });
    expect(r.status).toBe(200);
    // Stripe's test keys move no money: the licence is a rehearsal's, and the receipt says it is a test.
    expect(r.data.licence).toMatchObject({ edition: "karaoke", plan: "perpetual", status: "active", demo: true });
    expect(asked.map((a) => a.path)).not.toContain("POST payment_methods/pm_card/attach");
    const pi = asked.find((a) => a.path === "POST payment_intents")!.body;
    expect(pi.get("payment_method_types[0]")).toBe("card");
    expect(pi.get("confirm")).toBe("true");
    expect(pi.has("mandate_data[customer_acceptance][type]")).toBe(false);
    expect(mails.map((m) => m.subject)).toEqual([`[test] djmanzo: your receipt and licence, order ${r.data.order.id}`]);
    expect(mails[0].text).toContain("Paid with: Visa …4242");
  });

  it("a direct debit the bank clears later: the mandate on record, the order waiting, the buyer told; the webhook brings the licence and the receipt", async () => {
    const { mails, asked } = world({
      "GET payment_methods/pm_sepa": () => SEPA,
      "POST payment_intents": () => ({ id: "pi_2", status: "processing" }),
    });
    const env = openSite({ ...MAIL, ...STRIPE });
    const dj = await person(env, "Sam");
    await dj.call("/api/me/contact", { method: "POST", json: { email: "sam@example.test", lang: "es" } });
    const r = await browser(env, `djm_sid=sid-${dj.user.identities[0].sub}`, { "user-agent": "Firefox/140", "cf-connecting-ip": "203.0.113.20" })("/api/checkout/stripe", { method: "POST", json: { ...buyOnce, paymentMethod: "pm_sepa" } });
    expect(r.status).toBe(200);
    expect(r.data).toMatchObject({ processing: true, order: { status: "pending" } });
    expect(r.data.licence).toBeUndefined();
    const pi = asked.find((a) => a.path === "POST payment_intents")!.body;
    expect(pi.get("payment_method_types[0]")).toBe("sepa_debit");
    expect(pi.get("mandate_data[customer_acceptance][online][ip_address]")).toBe("203.0.113.20");
    expect(pi.get("mandate_data[customer_acceptance][online][user_agent]")).toBe("Firefox/140");
    expect(mails).toHaveLength(1);
    expect(mails[0].subject).toBe(`djmanzo: tu pago del pedido ${r.data.order.id} está en camino`);

    const payload = JSON.stringify({ type: "payment_intent.succeeded", data: { object: { id: "pi_2", metadata: { order: r.data.order.id } } } });
    const hook = await browser(env, "", { "stripe-signature": await signed(STRIPE.STRIPE_WEBHOOK_SECRET, payload), "content-type": "application/json" })("/api/webhooks/stripe", { method: "POST", body: payload });
    expect(hook.status).toBe(200);
    const licences = (await dj.call("/api/me/licences")).data;
    expect(JSON.stringify(licences)).toContain("karaoke");
    expect(mails).toHaveLength(2);
    expect(mails[1].subject).toBe(`[test] djmanzo: tu recibo y tu licencia, pedido ${r.data.order.id}`);
    expect(mails[1].text).toContain("Pagado con: SEPA Direct Debit");
  });

  it("refuses a way to pay this checkout does not offer, though Stripe has it on", async () => {
    world({ "GET payment_methods/pm_klarna": () => KLARNA });
    const env = openSite({ ...MAIL, ...STRIPE });
    const dj = await person(env, "Teo");
    await dj.call("/api/me/contact", { method: "POST", json: { email: "teo@example.test" } });
    const r = await dj.call("/api/checkout/stripe", { method: "POST", json: { ...buyOnce, paymentMethod: "pm_klarna" } });
    expect(r.status).toBe(400);
    expect(r.data.error).toContain("not offered");
  });

  it("a subscription keeps the card on the customer and is held to it", async () => {
    const { asked } = world({
      "GET payment_methods/pm_card": () => CARD,
      "POST payment_methods/pm_card/attach": () => CARD,
      "POST products": () => ({ id: "prod_1" }),
      "POST subscriptions": () => ({ id: "sub_1", status: "active", current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }),
    });
    const env = openSite({ ...MAIL, ...STRIPE });
    const dj = await person(env, "Uma");
    await dj.call("/api/me/contact", { method: "POST", json: { email: "uma@example.test" } });
    const r = await dj.call("/api/checkout/stripe", { method: "POST", json: { edition: "karaoke", plan: "monthly", country: "AT", paymentMethod: "pm_card" } });
    expect(r.status).toBe(200);
    expect(asked.map((a) => a.path)).toContain("POST payment_methods/pm_card/attach");
    const sub = asked.find((a) => a.path === "POST subscriptions")!.body;
    expect(sub.get("payment_settings[payment_method_types][0]")).toBe("card");
    expect(sub.get("payment_settings[save_default_payment_method]")).toBe("on_subscription");
  });
});
