/**
 * The Signal Path (the website itself, at /), driven in
 * a browser with its painting really drawn: the first visit lands on
 * Silence and the guide re-dresses everything; the map leads into a stage
 * and back; a stage's reveal says what djmanzo does from the fact sheet,
 * statuses included; a link to a stage works; reduced motion and a phone
 * get the same path.
 */
import { expect, test, type Page } from "@playwright/test";

function errors(page: Page): string[] {
  const out: string[] = [];
  page.on("pageerror", (e) => out.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/fonts\.g|Failed to load resource/.test(m.text())) out.push(m.text());
  });
  return out;
}

const accent = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());

test("a first visit lands on Silence, and the guide dresses the path in the visitor's music", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/");
  const silence = page.locator('[data-stage="silence"]');
  await expect(silence).toBeVisible({ timeout: 15_000 });
  await expect(silence).toContainText("Before the first note");
  // The painting is drawn, not missing.
  await expect(page.locator("[data-world]")).toBeVisible();
  await expect(page.getByText("could not start WebGL")).toHaveCount(0);

  await page.getByRole("button", { name: "Next beat" }).click();
  const guide = page.locator("[data-guide]");
  await guide.getByRole("radio", { name: "I DJ" }).click();
  const before = await accent(page);
  await guide.getByRole("radio", { name: "EDM & electronic" }).click();
  await guide.getByRole("radio", { name: "Electro swing" }).click();
  // Electro swing's gold, inherited rig and all.
  await expect.poll(() => accent(page)).toBe("#d4a64a");
  expect(before).not.toBe("#d4a64a");

  await guide.getByRole("button", { name: /Drop the needle/ }).click();
  await expect(page.locator('[data-stage="groove"]')).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/#\/groove$/);
  expect(errs).toEqual([]);
});

test("the map leads into a stage and back, and a reveal says what djmanzo does, with its status", async ({ page }) => {
  const errs = errors(page);
  await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "bachata", role: "dj", visited: ["silence", "groove"] })));
  await page.goto("/");
  // A returning visitor starts on the map, with the stages they have seen lit.
  const meter = page.getByRole("navigation", { name: "The stages" });
  await expect(meter).toBeVisible({ timeout: 15_000 });
  await expect(meter.locator('[data-meter="groove"]')).toHaveClass(/lit/);
  await expect(meter.locator('[data-meter="confluence"]')).not.toHaveClass(/lit/);

  await meter.locator('[data-meter="confluence"]').click();
  const stage = page.locator('[data-stage="confluence"]');
  await expect(stage).toBeVisible({ timeout: 15_000 });
  await expect(stage).toContainText("Two rivers never meet by accident.");
  // In Bachata, the confluence is a colmado counter under a red bulb.
  await expect(stage).toContainText("colmado counter");

  await stage.getByRole("button", { name: "Reveal" }).click();
  await expect(stage.locator('[data-fact="decks"]')).toContainText("Two decks and the mixer");
  // Part-built is said so, with what is missing; a module names the edition that has it.
  await expect(stage.locator('[data-fact="replay"]')).toContainText("part-built");
  await expect(stage.locator('[data-fact="replay"]')).toContainText("a command with no button yet");
  await expect(stage.locator('[data-fact="autopilot-surface"]')).toContainText("from Auto-Pilot");
  await expect(stage.locator('[data-fact="stems"]')).toHaveCount(0);
  await expect(stage.locator('[data-fact="decks6"]')).toContainText("from Pro DJ");
  await expect(stage.locator('[data-fact="dvs"]')).toContainText("Not yet run against a pressed record");
  await expect(stage.locator("figure img")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(meter).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/#\/$/);
  await expect(meter.locator('[data-meter="confluence"]')).toHaveClass(/lit/);
  expect(errs).toEqual([]);
});

test("a link to a stage opens it, and the keys walk its beats", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "hiphop", role: "dj", visited: ["silence"] })));
  await page.goto("/#/voice");
  const stage = page.locator('[data-stage="voice"]');
  await expect(stage).toBeVisible({ timeout: 15_000 });
  await page.keyboard.press("ArrowRight");
  await expect(stage).toHaveAttribute("data-beat", "1");
  await expect(stage.locator('[data-fact="karaoke"]')).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(stage).toContainText("The signal goes on to");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-stage="amp"]')).toBeVisible({ timeout: 15_000 });
});

test("with reduced motion the path is the same, and nothing waits on an animation", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "electroswing", role: "dj", visited: ["silence"] })));
  await page.goto("/#/cone");
  const stage = page.locator('[data-stage="cone"]');
  await expect(stage).toBeVisible({ timeout: 15_000 });
  // The words are there at once, not arriving.
  await expect(stage.locator(".line span").first()).toHaveCSS("opacity", "1");
  await expect(stage).toContainText("gramophone horn");
  await page.close();
});

test("a phone gets the same path", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errs = errors(page);
  await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "house", role: "dj", visited: ["silence"] })));
  await page.goto("/");
  const meter = page.getByRole("navigation", { name: "The stages" });
  await expect(meter).toBeVisible({ timeout: 15_000 });
  await meter.locator('[data-meter="needle"]').click();
  const stage = page.locator('[data-stage="needle"]');
  await expect(stage).toBeVisible({ timeout: 15_000 });
  await stage.getByRole("button", { name: "Next beat" }).click();
  const panel = stage.locator(".panel");
  const box = await panel.boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 390).toBe(true);
  expect(errs).toEqual([]);
  await page.close();
});

test("the Amp's reveal is the real box office: a licence can be bought from inside the stage", async ({ page }) => {
  const errs = errors(page);
  await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "latin", role: "dj", visited: ["silence"] })));
  await page.goto("/#/amp");
  const stage = page.locator('[data-stage="amp"]');
  await expect(stage).toBeVisible({ timeout: 15_000 });
  await stage.getByRole("button", { name: "Reveal" }).click();
  const shop = stage.locator("[data-shop]");
  await expect(shop.getByRole("heading", { name: "Pick your edition" })).toBeVisible();
  await shop.locator(".slot", { has: page.getByRole("heading", { name: "Pro DJ", exact: true }) }).getByRole("button", { name: "Choose" }).click();
  await shop.getByRole("combobox").first().selectOption("US");
  await shop.getByRole("textbox", { name: "Your DJ name" }).fill("Amp tester");
  await shop.getByRole("button", { name: "Sign in for the demo" }).click();
  await expect(shop.getByText("Signed in as")).toBeVisible();
  await shop.getByRole("button", { name: /Rehearse paying \$119/ }).click();
  await expect(shop.getByRole("heading", { name: "It's yours." })).toBeVisible();
  await expect(shop).toContainText("djmanzo Pro DJ");
  expect(errs).toEqual([]);
});

test("the plays answer the hand: the Amp's dial runs through the editions", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "edm", role: "dj", visited: ["silence"] })));
  await page.goto("/#/amp");
  const stage = page.locator('[data-stage="amp"]');
  await expect(stage).toBeVisible({ timeout: 15_000 });
  await stage.getByRole("button", { name: "Play" }).click();
  const dial = stage.getByRole("slider");
  await expect(stage.locator("[data-amp]")).toContainText("Hobbyist");
  await dial.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await expect(stage.locator("[data-amp]")).toContainText("Full");
  await expect(stage.locator("[data-amp]")).toContainText("$149 once");
  // The dial's arrows turn the dial; they do not leave the beat.
  await expect(stage).toHaveAttribute("data-beat", "2");
});

test("the path is the site: its old address still lands, and the island is one link away", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("djmanzo.signal", JSON.stringify({ style: "house", role: "dj", visited: ["silence"] })));
  // A link from the preview days keeps its stage.
  await page.goto("/signal/#/amp");
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/#\/amp$/);
  await expect(page.locator('[data-stage="amp"]')).toBeVisible({ timeout: 15_000 });
  // The pass, the blog and the wishlist are still the island's.
  await page.locator('[data-corner="you"]').click();
  await page.locator("[data-elsewhere]").getByRole("link", { name: "your pass" }).click();
  await expect(page).toHaveURL(/\/island\/#\/pase$/);
  await expect(page.getByRole("region", { name: "Tu Pase" })).toBeVisible({ timeout: 15_000 });
});
