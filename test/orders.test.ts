import { describe, expect, it } from "vitest";
import { crew, openSite, person } from "./people";

describe("Backstage's orders", () => {
  it("show who placed each and what it came to, and a waiting one can be called off, by the crew only", async () => {
    const env = openSite({ BANK_TRANSFER_DETAILS: "IBAN AT00 0000 0000 0000 0000, the owner" });
    const buyer = await person(env, "Buyer");
    // Where the receipt goes, confirmed first: the address GitHub vouched for, by the buyer's own press.
    expect((await buyer.call("/api/me/contact", { method: "POST", json: { email: "buyer@example.test" } })).data.contact.confirmed).toBeGreaterThan(0);
    const placed = await buyer.call("/api/checkout/transfer", { method: "POST", json: { edition: "full", plan: "perpetual", country: "AT", billing: "AT" } });
    expect(placed.status).toBe(200);
    const id = placed.data.order.id as string;

    const listed = await crew(env)("/api/admin/orders");
    expect(listed.status).toBe(200);
    const row = listed.data.orders.find((o: { id: string }) => o.id === id);
    expect(row).toMatchObject({ status: "pending", provider: "transfer", edition: "full", plan: "perpetual", who: { name: "Buyer", email: "buyer@example.test", providers: ["github"], owner: false } });
    expect(row.total).toBeGreaterThan(0);
    expect(row.base).toBeGreaterThanOrEqual(row.total);

    // The buyer reads no one's orders, and calls none off.
    expect((await buyer.call("/api/admin/orders")).status).toBe(403);
    expect((await buyer.call(`/api/admin/orders/${id}/cancel`, { method: "POST", json: {} })).status).toBe(403);

    const called = await crew(env)(`/api/admin/orders/${id}/cancel`, { method: "POST", json: {} });
    expect(called.status).toBe(200);
    expect(called.data.status).toBe("cancelled");
    expect((await crew(env)("/api/admin/orders")).data.orders.find((o: { id: string }) => o.id === id).status).toBe("cancelled");
    // Only a waiting order is called off.
    expect((await crew(env)(`/api/admin/orders/${id}/cancel`, { method: "POST", json: {} })).status).toBe(409);
    // A paid one is not either.
    const second = (await buyer.call("/api/checkout/transfer", { method: "POST", json: { edition: "karaoke", plan: "perpetual", country: "AT", billing: "AT" } })).data.order.id as string;
    expect((await crew(env)(`/api/admin/orders/${second}/paid`, { method: "POST", json: { bankCountry: "AT" } })).status).toBe(200);
    expect((await crew(env)(`/api/admin/orders/${second}/cancel`, { method: "POST", json: {} })).status).toBe(409);
  });
});
