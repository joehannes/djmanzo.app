import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EDITIONS, MODULES, modulesOf as editionModules } from "../shared/catalog";
import { DAY, GRACE, editionOf, entitlement, recordOf, signLine, type Payload } from "../worker/applicence";
import { DEV_PKCS8 } from "../worker/licence";
import type { Licence } from "../worker/store";

// services/licence is the protocol's reference: its development key and its
// test vectors, written by its own tests and read by dj_app::licence's.
const service = (p: string) => readFileSync(new URL(`../../services/licence/${p}`, import.meta.url), "utf8");
const devKey = JSON.parse(service("test/dev-key.json")) as { pkcs8: string; public: string };
const NOW = 1_792_000_000;

async function devSigner(): Promise<CryptoKey> {
  const der = Uint8Array.from(atob(devKey.pkcs8), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "Ed25519" }, false, ["sign"]);
}

const lic = (l: Partial<Licence>): Licence => ({ id: "l", uid: "u", edition: "pro", plan: "perpetual", major: 1, status: "active", expires: null, order: "o", createdAt: 0, ...l });

describe("the licence line is the application's", () => {
  it("signs services/licence's test vector byte for byte", async () => {
    const payload = entitlement("github:583231", { purchases: [{ edition: "custom", modules: "karaoke,stems" }] }, NOW - 10_000)!;
    expect(await signLine(payload, await devSigner())).toBe(service("test/vector.txt"));
  });

  it("signs its monthly-plan vector byte for byte, paid_until and all", async () => {
    const payload = entitlement("google:1093", { purchases: [{ edition: "pro", until: NOW + 20 * DAY }] }, NOW - 10_000)!;
    expect(await signLine(payload, await devSigner())).toBe(service("test/vector-subscription.txt"));
  });

  it("signs with the same development key djmanzo's debug builds believe, when no key is set", () => {
    expect(DEV_PKCS8).toBe(devKey.pkcs8);
  });

  it("counts editions and modules as the service and dj_core::edition do", () => {
    const theirs = JSON.parse(service("src/editions.json")) as { modules: string[]; editions: Record<string, string[]> };
    expect(MODULES).toEqual(theirs.modules);
    for (const e of EDITIONS) if (e !== "custom") expect(editionModules(e), e).toEqual(theirs.editions[e]);
  });
});

describe("what a record entitles", () => {
  it("purchases add up to the edition they make", () => {
    expect(editionOf(["karaoke"])).toEqual({ edition: "karaoke" });
    expect(editionOf([])).toEqual({ edition: "hobbyist" });
    expect(editionOf(["dvs", "stems"])).toEqual({ edition: "custom", modules: "stems,dvs" });
  });

  it("a refund counts for nothing, and a purchase outranks a trial", () => {
    expect(entitlement("google:1", { purchases: [{ edition: "pro", refunded: NOW }] }, NOW)).toBeNull();
    const p = entitlement("google:1", { purchases: [{ edition: "karaoke" }], trial: { edition: "full", ends: NOW + DAY } }, NOW)!;
    expect(p.edition).toBe("karaoke");
    expect(p.trial).toBeUndefined();
  });

  it("a trial is renewed by its end and is over at it", () => {
    const record = { purchases: [], trial: { edition: "full", ends: NOW + 7 * DAY } };
    expect(entitlement("google:1", record, NOW)).toMatchObject({ edition: "full", trial: true, ends: NOW + 7 * DAY, renew_by: NOW + 7 * DAY });
    expect(entitlement("google:1", record, NOW + 7 * DAY)).toBeNull();
  });

  it("a plan carries paid_until and counts a fortnight past it; what was bought once carries no date", () => {
    const plan = { purchases: [{ edition: "karaoke", until: NOW }] };
    expect((entitlement("google:1", plan, NOW - DAY) as Payload).paid_until).toBe(NOW);
    expect(entitlement("google:1", plan, NOW + GRACE - 1)?.edition).toBe("karaoke");
    expect(entitlement("google:1", plan, NOW + GRACE)).toBeNull();
    const mixed = entitlement("google:1", { purchases: [{ edition: "apprentice" }, { edition: "pro", until: NOW }] }, NOW)!;
    expect(mixed.paid_until).toBeUndefined();
  });
});

describe("the shop's licences, read as a record", () => {
  it("leaves out demo purchases, trials, refunds and what an upgrade replaced; keeps a cancelled plan until its end", () => {
    const r = recordOf([
      lic({ edition: "pro", demo: true }),
      lic({ edition: "hobbyist", status: "upgraded" }),
      lic({ edition: "full", status: "revoked" }),
      lic({ edition: "karaoke", plan: "monthly", status: "cancelled", expires: (NOW + DAY) * 1000 }),
      lic({ edition: "custom", modules: ["dvs", "stems"] }),
      lic({ edition: "full", plan: "trial", expires: (NOW + 3 * DAY) * 1000 }),
    ]);
    expect(r).toEqual({
      purchases: [
        { edition: "karaoke", until: NOW + DAY },
        { edition: "custom", modules: "dvs,stems" },
      ],
      trial: { edition: "full", ends: NOW + 3 * DAY },
    });
  });
});
