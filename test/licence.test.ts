import { describe, expect, it } from "vitest";
import { termEnd } from "../worker/licence";
import { encode, verifyWebhook } from "../worker/stripe";

describe("terms", () => {
  it("a month's term is a calendar month plus three days' grace", () => {
    const from = Date.UTC(2026, 0, 31);
    expect(termEnd("perpetual", from)).toBeNull();
    expect(termEnd("yearly", from)).toBe(Date.UTC(2027, 0, 31) + 3 * 86400_000);
  });
});

describe("Stripe plumbing", () => {
  it("encodes nested parameters the way Stripe reads them", () => {
    const s = encode({ items: [{ price_data: { unit_amount: 899, recurring: { interval: "month" } } }], expand: ["latest_invoice.payment_intent"] }).toString();
    expect(decodeURIComponent(s)).toBe("items[0][price_data][unit_amount]=899&items[0][price_data][recurring][interval]=month&expand[0]=latest_invoice.payment_intent");
  });

  it("accepts a correctly signed webhook and refuses a tampered one", async () => {
    const secret = "whsec_test";
    const payload = '{"type":"invoice.paid"}';
    const t = Math.floor(Date.now() / 1000);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)))].map((b) => b.toString(16).padStart(2, "0")).join("");
    expect(await verifyWebhook(secret, `t=${t},v1=${mac}`, payload)).toBe(true);
    expect(await verifyWebhook(secret, `t=${t},v1=${mac}`, payload.replace("paid", "void"))).toBe(false);
    expect(await verifyWebhook(secret, `t=${t - 1000},v1=${mac}`, payload)).toBe(false);
  });
});
