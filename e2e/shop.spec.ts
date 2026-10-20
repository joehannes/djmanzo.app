/**
 * The record shop (the website's third version, previewed at /shop/), driven
 * in a browser: the counter's question and its band, a sleeve that finds its
 * place on the record-earth, the needle put down and lifted, the practice
 * room's wheel and pitch fader, and the aisle walked by its dividers, its
 * arrow keys and on a phone. Nothing here can tell whether it sounds right;
 * it checks that what should play is told to, and what should stop does.
 */
import { expect as plainExpect, test, type Page } from "@playwright/test";

// The record-earth is drawn by a software renderer here, which is slow.
const expect = plainExpect.configure({ timeout: 20_000 });

function errors(page: Page): string[] {
  const out: string[] = [];
  page.on("pageerror", (e) => out.push(e.message));
  return out;
}

test.beforeEach(async ({ page }) => {
  // A first visit each test; a reload within one keeps what was remembered.
  await page.addInitScript(() => {
    if (sessionStorage.getItem("fresh")) return;
    sessionStorage.setItem("fresh", "1");
    localStorage.removeItem("djmanzo.shop");
  });
});

test("the counter asks one thing, and the band plays a part at a time", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/shop/");
  await page.click("[data-answer=karaoke]");
  await expect(page.locator("[data-ramon]")).toContainText("Wake up Voz");
  await expect(page.locator("[data-answer]")).toHaveCount(0);
  await expect(page.locator("[data-groove=pop]")).toHaveClass(/on/);

  await page.click("[data-player=drums]");
  await expect(page.locator("[data-player=drums]")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-band-note]")).toContainText("One part on its own");
  await expect(page.locator("[data-hush]")).toBeVisible();
  await page.click("[data-player=bass]");
  await expect(page.locator("[data-band-note]")).toContainText("That is what stems are");

  // Hush stops the band, and nobody stays lit.
  await page.click("[data-hush]");
  await expect(page.locator("[data-hush]")).toHaveCount(0);
  await expect(page.locator("[data-player][aria-pressed=true]")).toHaveCount(0);

  // The answer is remembered for the next visit.
  await page.reload();
  await expect(page.locator("[data-ramon]")).toContainText("Wake up Voz");
  expect(errs).toEqual([]);
});

test("a sleeve turns over, plays, and finds its place on the record-earth", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/shop/#crates");
  await page.click("[data-sleeve=bachata]");
  await expect(page.locator("[data-back] h2")).toHaveText("Bachata");
  await page.click("[data-play]");
  await expect(page.locator("[data-play]")).toHaveText("Stop");
  await page.click("[data-travel]");
  await expect(page).toHaveURL(/#world$/);
  // The record turns the place under the needle, which comes down and plays it.
  await expect(page.locator("[data-placard] h2")).toContainText("Bachata");
  await expect(page.locator("[data-place=bachata]")).toHaveClass(/on/);
  // The world took the record player over from the crates.
  await page.click("[data-divider=crates]");
  await expect(page.locator("[data-play]")).toHaveText("Play it");
  expect(errs).toEqual([]);
});

test("the needle goes down on any place, and lifts", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/shop/#world");
  await expect(page.locator("[data-placard] h2")).toHaveText("Where the music was born");
  await page.click("[data-place=merengue]");
  await expect(page.locator("[data-placard]")).toContainText("Now playing, from The Cibao valley");
  await expect(page.locator("[data-hush]")).toBeVisible();
  await page.click("[data-place=techno]");
  await expect(page.locator("[data-placard] h2")).toContainText("Techno");
  await page.click("[data-lift]");
  await expect(page.locator("[data-placard] h2")).toHaveText("Where the music was born");
  await expect(page.locator("[data-hush]")).toHaveCount(0);
  expect(errs).toEqual([]);
});

test("the practice room: neighbours blend, strangers clash, and the pitch fader closes the gap", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/shop/#practice");
  await page.click("[data-key='9']");
  await expect(page.locator("[data-relation]")).toHaveAttribute("data-relation", "neighbour");
  await page.click("[data-key='2']");
  await expect(page.locator("[data-relation]")).toHaveAttribute("data-relation", "clash");
  await expect(page.locator("[data-relation]")).toContainText("Clash");
  // Across the top of the wheel, 12A and 1A are neighbours of each other, not of 8A.
  await page.click("[data-key='8']");
  await expect(page.locator("[data-relation]")).toHaveAttribute("data-relation", "same");
  await page.click("[data-keys-play]");
  await expect(page.locator("[data-keys-play]")).toHaveText("Stop");

  // The beat bench takes the record player over from the wheel.
  await expect(page.locator("[data-pitch]")).toBeDisabled();
  await page.click("[data-beats-play]");
  await expect(page.locator("[data-keys-play]")).toHaveText("Play both decks");
  await expect(page.locator("[data-pitch]")).toBeEnabled();
  await expect(page.locator("[data-beatmatch]")).toContainText("Tempo apart");
  await page.locator("[data-pitch]").fill("0");
  await expect(page.locator("[data-beatmatch]")).toContainText("Tempo close");
  expect(errs).toEqual([]);
});

test("the aisle: dividers, arrow keys, the address, and plain links to every ordinary page", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/shop/");
  await page.click("[data-divider=till]");
  await expect(page).toHaveURL(/#till$/);
  await expect(page.locator("[data-divider=till]")).toHaveAttribute("aria-current", "true");
  await expect(page.locator("[data-edition=autopilot]")).toContainText("$49");
  await expect(page.locator("[data-edition=hobbyist]")).toContainText("Free");
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/#window$/);
  await expect(page.locator("[data-window]")).toContainText("free, for ever");

  // Arriving by address lands in that room.
  await page.goto("/shop/#cafe");
  await expect(page.locator("[data-divider=cafe]")).toHaveAttribute("aria-current", "true");

  const bar = page.getByRole("navigation", { name: "Straight to" });
  for (const [name, href] of [
    ["Market", "/outboard"],
    ["Forum", "/talkback"],
    ["Wishlist", "/island/#/muro"],
    ["Sign in", "/island/#/pase"],
  ]) {
    await expect(bar.getByRole("link", { name })).toHaveAttribute("href", href);
  }
  expect(errs).toEqual([]);
});

test("on a phone every room fits the screen, with nothing sideways", async ({ page }) => {
  const errs = errors(page);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/shop/");
  for (const room of ["counter", "crates", "world", "practice", "makers", "cafe", "wishes", "window", "till"]) {
    await page.click(`[data-divider=${room}]`);
    await expect(page).toHaveURL(new RegExp(`#${room}$`));
    // The address changes once the room is mostly in view; the scroll then settles on it.
    await expect.poll(async () => Math.round((await page.locator(`#${room}`).boundingBox())!.x), { message: room }).toBe(0);
    expect((await page.locator(`#${room}`).boundingBox())!.width, room).toBeLessThanOrEqual(391);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), room).toBeLessThanOrEqual(0);
  }
  expect(errs).toEqual([]);
});
