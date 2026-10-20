/**
 * The site, its fourth version (at /, previewed at /v4/ until 20 October), in a browser: the look that
 * follows where the visitor is, and stays theirs to change; the deck and its
 * stems; the tour in the visitor's theme; the hardware search; the shop from
 * the finder to a started trial; the marketplace and forum kept on the page;
 * the assistant's scripted answers; a phone; less motion. Nothing here can
 * say whether it sounds right — only that what should play is told to.
 */
import { expect as plainExpect, test, type Page } from "@playwright/test";

const expect = plainExpect.configure({ timeout: 15_000 });

function errors(page: Page): string[] {
  const out: string[] = [];
  page.on("pageerror", (e) => out.push(e.message));
  return out;
}

test.beforeEach(async ({ page }) => {
  // A first visit each test; a reload within one keeps what was chosen.
  await page.addInitScript(() => {
    if (sessionStorage.getItem("fresh")) return;
    sessionStorage.setItem("fresh", "1");
    localStorage.removeItem("djmanzo.v4.skin");
  });
});

const skinOf = (page: Page) => page.locator("html").getAttribute("data-skin");

test("the look follows where the visitor is, and the deck plays that place's music", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=DE");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "club");
  await expect(page.locator("[data-hero-photo]")).toHaveAttribute("style", /club-hero\.webp/);
  await expect(page.locator("[data-groove=techno]")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-look]")).toContainText("Club · Europe · DE");

  await page.goto("/?country=DO");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "tropical");
  // A Dominican visitor hears merengue first, and sees the app in its Caribbean theme.
  await expect(page.locator("[data-groove=merengue]")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-tab=perform]")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("img[data-shot]")).toHaveAttribute("data-shot", "Caribbean");
  // The page is in the skin's colours.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())).toBe("#ff6b3d");
  expect(errs).toEqual([]);
});

test("the visitor can change the look, it stays, and the waveforms follow it", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=DE");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "club");
  await page.locator("#stems").scrollIntoViewIfNeeded();
  await expect(page.locator("canvas[data-wave=lanes]")).toHaveAttribute("data-colours", "#38e1c6 #7b61ff #2563ff #e6fbff");
  await page.click("[data-skin-picker]");
  await page.click("[data-skin=neon]");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "neon");
  await expect(page.locator("canvas[data-wave=lanes]")).toHaveAttribute("data-colours", "#ff4fd8 #4fd2ff #7c3aed #f7e8ff");
  await expect(page.locator("canvas[data-wave=bands]")).toHaveAttribute("data-colours", "#4fd2ff #ff4fd8 #f7e8ff");
  // A new look brings its own music.
  await expect(page.locator("[data-groove=pop]")).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "neon");
  await page.click("[data-skin-picker]");
  await page.getByRole("button", { name: "Follow my location again" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "club");
  expect(errs).toEqual([]);
});

test("the deck plays, changes groove in time, and its stems switch one by one", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=US");
  await expect(page.locator("[data-wave=bands]")).toHaveAttribute("data-renderer", /webgl2|2d/);
  await page.click("[data-play]");
  await expect(page.locator("[data-play]")).toHaveAttribute("aria-label", "Stop the deck");
  await expect(page.locator("[data-bpm]")).toHaveText("90.0");
  await page.click("[data-groove=house]");
  await expect(page.locator("[data-bpm]")).toHaveText("123.0");
  await expect(page.locator("[data-play]")).toHaveAttribute("aria-label", "Stop the deck");

  await page.locator("#stems").scrollIntoViewIfNeeded();
  await page.click("[data-stem=drums]");
  await expect(page.locator("[data-stem=drums]")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-stems]")).toContainText("3 of 4 parts on");
  await page.click("[data-stem=drums]");
  await expect(page.locator("[data-stems]")).toContainText("4 of 4 parts on");
  await page.locator("#top").scrollIntoViewIfNeeded();
  await page.click("[data-play]");
  await expect(page.locator("[data-play]")).toHaveAttribute("aria-label", "Play the deck");
  expect(errs).toEqual([]);
});

test("the tour and the hardware search", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=DE");
  await page.locator("#tour").scrollIntoViewIfNeeded();
  await page.click("[data-tab=karaoke]");
  await expect(page.locator("[data-tab=karaoke]")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tour-panel [data-fact=karaoke]")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-tab=practice]")).toHaveAttribute("aria-selected", "true");

  await page.locator("#hardware").scrollIntoViewIfNeeded();
  await page.fill("[data-hw-search]", "pioneer 400");
  await expect(page.locator("[data-device]")).toHaveCount(1);
  await expect(page.locator("[data-device]")).toContainText("Mapping ships");
  await page.fill("[data-hw-search]", "kontrol");
  await expect(page.locator("[data-device]")).toContainText("Planned");
  await page.fill("[data-hw-search]", "nothing like this");
  await expect(page.locator("#hardware")).toContainText("Not in the list");
  expect(errs).toEqual([]);
});

test("the shop: the finder, the plans, a live quote, and a trial started", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/pricing?country=US");
  await expect(page.locator("[data-edition=pro] [data-price]")).toHaveText("$119");
  await page.click("[data-plan=monthly]");
  await expect(page.locator("[data-edition=pro] [data-price]")).not.toHaveText("$119");
  await page.click("[data-plan=perpetual]");
  await page.click("[data-finder=karaoke]");
  await expect(page.locator("[data-edition=karaoke]")).toHaveClass(/chosen/);
  await expect(page.locator("[data-total]")).toHaveText("$55");
  await expect(page.locator("[data-edition=hobbyist] [data-price]")).toHaveText("Free");

  // A visitor from a lower-priced country sees their own price.
  await page.selectOption("[data-country]", "DO");
  await expect(page.locator("[data-total]")).not.toHaveText("$55");

  await page.getByPlaceholder("Your DJ name").fill("Test DJ");
  await page.getByRole("button", { name: "Sign in for the demo" }).click();
  await page.click("[data-trial]");
  await expect(page.locator("[data-done]")).toContainText("It's yours.");
  await expect(page.locator("[data-done]")).toContainText("free for seven days");
  expect(errs).toEqual([]);
});

test("the marketplace and forum are the working ones, and their links stay on this page", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/talkback");
  await expect(page.locator("[data-forum]")).toContainText("Mixing and transitions");
  await page.locator("[data-community=mixing]").click();
  await expect(page).toHaveURL(/\/talkback\/c\/mixing$/);
  await expect(page.locator("[data-forum] [data-community=mixing]")).toHaveClass(/on/);

  await page.goto("/outboard");
  await expect(page.locator("[data-market]")).toContainText("Everything");
  await expect(page.locator("[data-market]")).toContainText("/api/outboard/packs.json");
  expect(errs).toEqual([]);
});

test("the assistant answers, and its answers lead somewhere", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=DE");
  await page.click("[data-ask]");
  await expect(page.locator("[data-assistant]")).toContainText("djmanzo's assistant");
  await page.getByRole("button", { name: "Is it free?" }).click();
  await expect(page.locator("[data-assistant]")).toContainText("The Hobbyist edition is");
  await page.locator("[data-assistant] [data-act=start_trial]").click();
  await expect(page).toHaveURL(/\/pricing$/);
  expect(errs).toEqual([]);
});

test("on a phone nothing goes sideways, and the menu opens", async ({ page }) => {
  const errs = errors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const at of ["/?country=NG", "/pricing?country=NG", "/outboard", "/talkback"]) {
    await page.goto(at);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), at).toBeLessThanOrEqual(0);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("navigation", { name: "Site", exact: true }).getByRole("link", { name: "Pricing" })).toBeVisible();
  expect(errs).toEqual([]);
});

test("with less motion asked for, nothing is left hidden", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?country=DE");
  await page.locator("#faq").scrollIntoViewIfNeeded();
  const hidden = await page.evaluate(() => [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).opacity === "0").length);
  expect(hidden).toBe(0);
  expect(await skinOf(page)).toBe("club");
});

test("older addresses land: the preview's, its hash pages, and the Signal Path's stages", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/v4/?country=DO#/pricing");
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/pricing\?country=DO$/);
  await expect(page.locator("[data-edition=pro]")).toBeVisible();
  await page.goto("/#/market");
  await expect(page).toHaveURL(/\/outboard$/);
  await expect(page.locator("[data-market]")).toBeVisible();
  await page.goto("/#/voice");
  await expect(page).toHaveURL(/\/signal\/#\/voice$/);
  expect(errs).toEqual([]);
});

test("a page that is only words is shown in the site's frame, and the site's own links stay in place", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/terms");
  await expect(page.locator("[data-read] #static h1")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Site", exact: true })).toBeVisible();
  // From the words to the shop and back, without loading the page again.
  await page.evaluate(() => ((window as unknown as { stayed: boolean }).stayed = true));
  await page.getByRole("navigation", { name: "Site", exact: true }).getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.locator("[data-edition=pro]")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/terms$/);
  expect(await page.evaluate(() => (window as unknown as { stayed?: boolean }).stayed)).toBe(true);
  expect(errs).toEqual([]);
});
