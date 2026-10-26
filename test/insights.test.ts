import { describe, expect, it } from "vitest";
import { record, report, suggest, type Report } from "../worker/insights";
import { browser, crew, openSite, person } from "./people";

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const visitor = (env: never, ip: string, ua = CHROME, more: Record<string, string> = {}) => browser(env, "", { "user-agent": ua, "cf-connecting-ip": ip, ...more });
const hit = (events: unknown[], extra: Record<string, unknown> = {}) => ({ method: "POST", json: { events, lang: "de", look: "studio", ...extra } });

describe("insights", () => {
  it("keep what visitors look at and look for without an address, a cookie or anyone's own words about themselves", async () => {
    const env = openSite();
    const db = (env as unknown as { DB: { sqlite: { prepare(s: string): { all(): Record<string, unknown>[] } } } }).DB.sqlite;
    const one = visitor(env, "203.0.113.5");
    const sent = await one(
      "/api/hit",
      hit(
        [
          { k: "view", p: "/?utm=x", s: 0 },
          { k: "section", p: "/", d: "stems", s: 1 },
          { k: "leave", p: "/", n: 30000, s: 2 },
          { k: "view", p: "/features", s: 3 },
          { k: "search", p: "/features", d: "MIDI clock", n: 3, s: 4 },
          { k: "search", p: "/features", d: "serato import", n: 0, s: 5 },
          { k: "leave", p: "/features", n: 12000, s: 6 },
          { k: "view", p: "/pricing", s: 7 },
          { k: "click", p: "/pricing", d: "checkout", s: 8 },
          { k: "ask", p: "/pricing", d: "Does it run on Windows? write me at dj.someone@example.org or +43 660 1234567", s: 9 },
        ],
        { ref: "https://www.reddit.com/r/DJs/" },
      ),
    );
    expect(sent.status).toBe(204);
    expect(sent.res.headers.get("set-cookie")).toBeNull();
    // A second visitor, on a phone, who sees the home page and goes.
    await visitor(env, "198.51.100.7", PHONE)("/api/hit", hit([{ k: "view", p: "/", s: 0 }]));
    // Not counted: a robot, a browser asking not to be followed, a body out of shape.
    await visitor(env, "192.0.2.1", "Googlebot/2.1 (+http://www.google.com/bot.html)")("/api/hit", hit([{ k: "view", p: "/", s: 0 }]));
    await visitor(env, "192.0.2.2", CHROME, { "sec-gpc": "1" })("/api/hit", hit([{ k: "view", p: "/", s: 0 }]));
    await visitor(env, "192.0.2.3", CHROME, { dnt: "1" })("/api/hit", hit([{ k: "view", p: "/", s: 0 }]));
    expect((await visitor(env, "192.0.2.4")("/api/hit", hit([{ k: "nonsense", p: "/", s: 0 }]))).status).toBe(204);

    const rows = db.prepare("SELECT * FROM hits").all();
    expect(rows).toHaveLength(11);
    const stored = JSON.stringify(rows);
    for (const secret of ["203.0.113.5", "198.51.100.7", "dj.someone@example.org", "1234567", "utm"]) expect(stored).not.toContain(secret);
    expect(new Set(rows.map((r) => r.visit)).size).toBe(2);
    expect(rows.find((r) => r.kind === "view" && r.path === "/" && r.referrer)?.referrer).toBe("reddit.com");

    const r = (await crew(env)("/api/admin/insights?days=7")).data.report as Report;
    expect(r).toMatchObject({ visits: 2, views: 4, bounce: 0.5, pagesPerVisit: 2 });
    expect(r.pages.find((p) => p.path === "/")).toMatchObject({ views: 2, visits: 2, seconds: 30, entries: 2, exits: 1 });
    expect(r.pages.find((p) => p.path === "/features")).toMatchObject({ views: 1, seconds: 12 });
    expect(r.paths.map((p) => p.path)).toEqual(expect.arrayContaining(["/ → /features → /pricing", "/"]));
    expect(r.searches).toEqual(expect.arrayContaining([expect.objectContaining({ words: "serato import", found: 0 }), expect.objectContaining({ words: "midi clock", found: 3 })]));
    expect(r.asks[0].words).toBe("Does it run on Windows? write me at [address] or [number]");
    expect(r.sections).toEqual([expect.objectContaining({ path: "/", section: "stems", visits: 1, share: 0.5 })]);
    expect(r.by.device).toEqual(expect.arrayContaining([{ value: "computer", visits: 1 }, { value: "phone", visits: 1 }]));
    expect(r.by.lang).toEqual([{ value: "de", visits: 2 }]);
    expect(r.funnel.find((f) => f.step === "looked at the prices")?.visits).toBe(1);
    expect(r.funnel.find((f) => f.step === "started a checkout")?.visits).toBe(1);

    // Only the crew reads it.
    expect((await (await person(env, "Lena")).call("/api/admin/insights")).status).toBe(403);
    expect((await one("/api/admin/insights")).status).toBe(403);
  });

  it("make a visit of one day only: the same browser tomorrow is someone new", async () => {
    const env = openSite();
    const req = () => new Request("https://djmanzo.test/api/hit", { method: "POST", headers: { "user-agent": CHROME, "cf-connecting-ip": "203.0.113.9" } });
    const day = Date.parse("2026-10-20T12:00:00Z");
    await record(env, req(), { events: [{ k: "view", p: "/", s: 0 }] }, day);
    await record(env, req(), { events: [{ k: "view", p: "/pricing", s: 0 }] }, day + 3_600_000);
    await record(env, req(), { events: [{ k: "view", p: "/", s: 0 }] }, day + 86_400_000);
    const r = await report(env, 30, day + 86_400_000);
    expect(r.visits).toBe(2);
    expect(r.paths.map((p) => p.path).sort()).toEqual(["/", "/ → /pricing"]);
  });

  it("offer starting points once there is enough to read, and say when there is not", () => {
    const base: Report = {
      days: 30, since: "2026-10-01", visits: 5, views: 6, daily: [], pages: [], bounce: 0.8, pagesPerVisit: 1.2, paths: [],
      searches: [{ where: "/features", words: "serato import", times: 3, visits: 3, found: 0 }], asks: [], clicks: [], sections: [],
      by: { lang: [], look: [], country: [], device: [], referrer: [] }, funnel: [], paid: 0,
    };
    const few = suggest(base);
    expect(few[0].area).toBe("too early");
    expect(few.some((i) => i.saw.includes("serato import"))).toBe(true);
    const many = suggest({ ...base, visits: 200, views: 260, pages: [{ path: "/", views: 200, visits: 200, seconds: 20, entries: 190, exits: 150 }], by: { ...base.by, device: [{ value: "phone", visits: 120 }] } });
    expect(many.map((i) => i.area)).toEqual(expect.arrayContaining(["first look", "finding", "devices"]));
    expect(many.find((i) => i.area === "first look")?.saw).toContain("80%");
  });
});
