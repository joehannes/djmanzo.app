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

test("an item and a post have addresses of their own: opened from a link, kept in the address bar, and the back button works", async ({ page, request }) => {
  const item = (await (await request.get("/api/outboard/items")).json())[0];
  const post = (await (await request.get("/api/talkback/posts?c=mixing")).json())[0];
  expect(item && post).toBeTruthy();

  // What a crawler reads is in the page before the painting opens over it.
  const html = await (await request.get(`/outboard/${item.id}`)).text();
  expect(html).toContain(`<link rel="canonical" href="http://127.0.0.1:8787/outboard/${item.id}" />`);
  expect(html).toMatch(new RegExp(`<main id="static">[\\s\\S]*${item.name}`));

  await page.goto(`/outboard/${item.id}`);
  await expect(page.locator(`[data-item="${item.id}"]`)).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("#static")).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/outboard/${item.id}$`));
  // Within the app a link changes the address without loading the page again.
  await page.evaluate(() => ((window as unknown as { stayed: boolean }).stayed = true));
  await page.locator('[data-aux="outboard"] a', { hasText: "Everything in Outboard" }).first().click();
  await expect(page).toHaveURL(/\/outboard$/);
  await page.locator(`[data-card="${item.id}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/outboard/${item.id}$`));
  await page.goBack();
  await expect(page).toHaveURL(/\/outboard$/);
  await expect(page.locator(`[data-card="${item.id}"]`)).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { stayed?: boolean }).stayed)).toBe(true);

  await page.goto(`/talkback/${post.id}`);
  await expect(page.locator(`[data-post="${post.id}"]`)).toBeVisible({ timeout: 15_000 });
  // An older link by its hash lands on the page's own address.
  await page.goto("/#/talkback/c/mixing");
  await expect(page).toHaveURL(/\/talkback\/c\/mixing$/);
  await expect(page.locator('[data-community="mixing"]')).toBeVisible();
});

test("a blog post is a page to read, without the painting", async ({ page, request }) => {
  const r = await request.post("/api/admin/blog", { headers: CREW, data: { title: "Reading the room", slug: "reading-the-room-e2e", lang: "en", excerpt: "What a floor tells you.", body: "The **floor** speaks.", published: true } });
  expect(r.ok()).toBe(true);
  await page.goto("/blog/reading-the-room-e2e");
  await expect(page.getByRole("heading", { name: "Reading the room" })).toBeVisible();
  await expect(page.locator("#static strong")).toHaveText("floor");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page.locator("#static")).toContainText("Reading the room");
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

test("a phone reads Talkback and Outboard without scrolling sideways", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const where of ["/#/talkback", "/#/outboard"]) {
    await page.goto(where);
    await expect(page.locator("[data-aux] h1")).toBeVisible({ timeout: 15_000 });
    const width = await page.locator("[data-aux]").evaluate((el) => el.scrollWidth);
    expect(width, where).toBeLessThanOrEqual(390);
  }
});

