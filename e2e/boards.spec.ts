/**
 * Outboard and Talkback in a browser, on the local test site (stand-in R2,
 * an imprint, a crew token): a maker uploads a pack, the crew lists it, a
 * visitor finds it and downloads exactly what was signed, a fan rates it;
 * a new account's post waits for the crew, a member's goes up at once,
 * gathers a comment and a vote, and is reported.
 */
import { readFileSync } from "node:fs";
import { expect as plainExpect, test, type Page } from "@playwright/test";
import { cookie, emptyBoards, people } from "./seed";

// Each step here waits on the painting and the local database; under a full
// parallel run that has taken longer than the default five seconds.
const expect = plainExpect.configure({ timeout: 15_000 });
const CREW = { authorization: "Bearer crew-secret" };
const fixture = (name: string) => new URL(`../test/fixtures/packs/${name}.djpack`, import.meta.url).pathname;

function errors(page: Page): string[] {
  const out: string[] = [];
  page.on("pageerror", (e) => out.push(e.message));
  return out;
}

test.describe.configure({ mode: "serial" });
// Seeding an account goes through wrangler, a few seconds each.
test.setTimeout(300_000);
test.beforeAll(() => emptyBoards());

test("a pack goes from its maker, through the crew, to anyone who wants it", async ({ browser, request }) => {
  const [maker, fan] = people(["Dot Maker"], ["A Fan"]);

  const makerPage = await (await browser.newContext()).newPage();
  await makerPage.context().addCookies([cookie(maker.sid)]);
  const errs = errors(makerPage);
  await makerPage.goto("/#/outboard");
  const aux = makerPage.locator('[data-aux="outboard"]');
  await expect(aux).toBeVisible({ timeout: 15_000 });
  await expect(aux.locator("[data-index]")).toHaveText(/\/api\/outboard\/packs\.json$/);
  await aux.locator('[data-upload] input[type="file"]').setInputFiles(fixture("good-skin"));
  await aux.locator("[data-upload]").getByRole("button", { name: "Upload" }).click();
  await expect(aux.getByText(/waits for the crew/)).toBeVisible();

  // The crew lists it.
  const queue = await (await request.get("/api/admin/outboard/queue", { headers: CREW })).json();
  expect(queue.map((q: { name: string }) => q.name)).toContain("Dots");
  const queued = queue.find((q: { name: string }) => q.name === "Dots");
  expect((await request.post("/api/admin/outboard/review", { headers: CREW, data: { id: queued.id, version: queued.version, approve: true } })).ok()).toBe(true);

  // Anyone finds it and downloads exactly what was signed.
  const visitor = await (await browser.newContext()).newPage();
  await visitor.goto("/#/outboard");
  const card = visitor.locator(`[data-card="${queued.id}"]`);
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
  const item = visitor.locator(`[data-item="${queued.id}"]`);
  await expect(item).toContainText("Dots");
  await expect(item).toContainText("Installs in every edition");
  const href = await item.locator("[data-download]").getAttribute("href");
  const file = await visitor.request.get(href!);
  expect(Buffer.from(await file.body())).toEqual(readFileSync(fixture("good-skin")));

  // A fan rates it.
  const fanPage = await (await browser.newContext()).newPage();
  await fanPage.context().addCookies([cookie(fan.sid)]);
  await fanPage.goto(`/#/outboard/${queued.id}`);
  const rate = fanPage.locator("[data-rate]");
  await expect(rate).toBeVisible({ timeout: 15_000 });
  await rate.getByRole("radio", { name: "4 stars" }).click();
  await rate.getByRole("textbox", { name: "Your review" }).fill("Subtle enough for a wedding.");
  await rate.getByRole("button", { name: "Rate it" }).click();
  await expect(fanPage.locator(`[data-item="${queued.id}"]`)).toContainText("4.0 ★ (1)");
  await expect(fanPage.locator(`[data-item="${queued.id}"]`)).toContainText("Subtle enough for a wedding.");
  expect(errs).toEqual([]);
});

test("a new account's post waits for the crew; a member's goes up, is answered, voted on and reported", async ({ browser, request }) => {
  const [fresh, ana, ben] = people(["New Here", 0], ["Ana Member"], ["Ben Member"]);

  // A new account: the post is held, and it is told so.
  const newbie = await (await browser.newContext()).newPage();
  await newbie.context().addCookies([cookie(fresh.sid)]);
  await newbie.goto("/#/talkback/c/mixing");
  const tb = newbie.locator('[data-aux="talkback"]');
  await expect(tb.locator("[data-write]")).toBeVisible({ timeout: 15_000 });
  await tb.locator("[data-write]").click();
  await tb.getByRole("textbox", { name: "Title" }).fill("First gig next week");
  await tb.getByRole("textbox", { name: "What you want to say" }).fill("Any advice for a **wedding**?");
  await tb.locator("[data-compose]").getByRole("button", { name: "Post" }).click();
  await expect(newbie.locator("[data-posted]")).toContainText("waits for the crew");
  await expect(newbie.locator("[data-post]")).toContainText("waiting for the crew: only you see it");
  // Nobody else sees it.
  expect((await (await request.get("/api/talkback/posts?c=mixing")).json()).length).toBe(0);

  // Members: each has a post the crew has read.
  for (const who of [ana, ben]) {
    const ctx = await browser.newContext();
    await ctx.addCookies([cookie(who.sid)]);
    const r = await ctx.request.post("/api/talkback/posts", { data: { community: "mixing", title: "Hello there", body: "Glad to be here." } });
    const { id } = await r.json();
    await request.post("/api/admin/crew/decide", { headers: CREW, data: { kind: "post", target: id, keep: true } });
  }

  const anaPage = await (await browser.newContext()).newPage();
  await anaPage.context().addCookies([cookie(ana.sid)]);
  await anaPage.goto("/#/talkback/c/mixing");
  const t = anaPage.locator('[data-aux="talkback"]');
  await t.locator("[data-write]").click();
  await t.getByRole("textbox", { name: "Title" }).fill("Echo out or cut?");
  await t.getByRole("textbox", { name: "What you want to say" }).fill("Which do you reach for **first**?\n\n- echo\n- cut");
  await t.locator("[data-compose]").getByRole("button", { name: "Post" }).click();
  const post = anaPage.locator("[data-post]");
  await expect(post).toContainText("Echo out or cut?");
  await expect(post.locator(".md strong")).toHaveText("first");
  await expect(post.locator(".md li")).toHaveCount(2);
  const postId = await post.getAttribute("data-post");

  // Ben answers and votes it up.
  const benPage = await (await browser.newContext()).newPage();
  await benPage.context().addCookies([cookie(ben.sid)]);
  await benPage.goto(`/#/talkback/${postId}`);
  await benPage.locator("[data-comment-form] textarea").fill("Echo, always, on the last phrase.");
  await benPage.locator("[data-comment-form]").getByRole("button", { name: "Comment" }).click();
  await expect(benPage.locator("[data-comment]")).toContainText("Echo, always");
  const votes = benPage.locator(`[data-votes="${postId}"]`);
  await votes.getByRole("button", { name: "Up" }).click();
  await expect(votes.locator("[data-score]")).toHaveText("1");

  // And reports it.
  await benPage.locator("[data-post] [data-report]").click();
  await benPage.getByRole("textbox", { name: "What is wrong with it" }).fill("Testing the report button.");
  await benPage.getByRole("button", { name: "Send report" }).click();
  await expect(benPage.getByText("The crew reads every report")).toBeVisible();
  const crew = await (await request.get("/api/admin/crew", { headers: CREW })).json();
  expect(crew.reports.map((r: { target: string }) => r.target)).toContain(postId);
});

/** How many animation frames the page asks for in two seconds. */
async function framesIn2s(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const w = window as unknown as { __frames: number };
    const from = w.__frames;
    await new Promise((r) => setTimeout(r, 2000));
    return w.__frames - from;
  });
}

test("the sends are on the map, and the site's own pages say who runs it", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "house", role: "dj", visited: ["silence"] }));
    const w = window as unknown as { __frames: number };
    w.__frames = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      w.__frames++;
      return raf(cb);
    };
  });
  await page.goto("/");
  await page.locator('[data-send="talkback"]').click();
  await expect(page.locator('[data-aux="talkback"]')).toBeVisible({ timeout: 15_000 });
  // The page hides the painting, so the painting rests under it.
  await expect(page.locator("canvas[data-resting]")).toHaveCount(1);
  expect(await framesIn2s(page)).toBe(0);
  await page.getByRole("link", { name: "Imprint" }).click();
  await expect(page.locator("[data-imprint]")).toContainText("Test Owner");
  await page.getByRole("button", { name: "← The map" }).click();
  await expect(page.getByRole("navigation", { name: "The stages" })).toBeVisible();
  // And paints again once the map is back (the software renderer here manages a few frames a second).
  await expect(page.locator("canvas[data-resting]")).toHaveCount(0);
  expect(await framesIn2s(page)).toBeGreaterThan(1);
});

test("a phone reads Talkback and Outboard without scrolling sideways", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const where of ["/#/talkback", "/#/outboard"]) {
    await page.goto(where);
    await expect(page.locator("[data-aux] h1")).toBeVisible({ timeout: 15_000 });
    const width = await page.locator("[data-aux]").evaluate((el) => el.scrollWidth);
    expect(width, where).toBeLessThanOrEqual(390);
  }
});

test("the sends cover neither a stage on the map nor its hint, on a wide screen or a phone", async ({ browser }) => {
  for (const [w, h, mobile] of [[1400, 900, false], [1024, 640, false], [390, 844, true], [375, 667, true]] as const) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "house", role: "dj", visited: ["silence"] })));
    await page.goto("/");
    await expect(page.locator('[data-send="talkback"]')).toBeVisible({ timeout: 15_000 });
    // The labels follow the painting; let it settle.
    await page.waitForTimeout(1500);
    const overlaps = await page.evaluate(() => {
      const box = (el: Element) => el.getBoundingClientRect();
      const meet = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const onScreen = (r: DOMRect) => r.width > 0 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
      const others = [...document.querySelectorAll(".label, .hint")].filter((el) => getComputedStyle(el).opacity !== "0" && onScreen(box(el)));
      return [...document.querySelectorAll("[data-send]")].flatMap((s) => others.filter((o) => meet(box(s), box(o))).map((o) => `${s.getAttribute("data-send")} covers ${o.textContent!.trim().slice(0, 30)}`));
    });
    expect(overlaps, `${w}×${h}`).toEqual([]);
    await page.close();
  }
});
