/**
 * The site, its fourth version (at /, previewed at /v4/ until 20 October), in a browser: the look that
 * follows where the visitor is, and stays theirs to change; the deck and its
 * stems; the tour in the visitor's theme; the hardware search; the shop from
 * the finder to a started trial; the marketplace and forum kept on the page;
 * the assistant's scripted answers; a phone; less motion. Nothing here can
 * say whether it sounds right — only that what should play is told to.
 */
import { expect as plainExpect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const expect = plainExpect.configure({ timeout: 15_000 });

/** The deck's recorded loops, as the site ships them. */
const LOOP_INDEX = JSON.parse(readFileSync("src/v4/loops/index.json", "utf8")) as Record<string, { bpm: number; camelot: string }>;

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
  await expect(page.locator("[data-look]")).toContainText("Club · Europe · Germany");

  await page.goto("/?country=DO");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "tropical");
  // A Dominican visitor hears merengue first, and sees the app in its Caribbean theme.
  await expect(page.locator("[data-groove=merengue]")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-tab=perform]")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tour-panel img[data-shot]")).toHaveAttribute("data-shot", "Caribbean");
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
  // A new look brings its own music: the first of its grooves, not the club's techno.
  await expect(page.locator("[data-groove]").first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-groove=techno]")).not.toHaveAttribute("aria-pressed", "true");

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
  await expect(page.locator("[data-bpm]")).toHaveText(LOOP_INDEX.hiphop.bpm.toFixed(1));
  await page.click("[data-groove=house]");
  // The recorded loop's own tempo, as it was made, not the middle of house's range.
  await expect(page.locator("[data-bpm]")).toHaveText(LOOP_INDEX.house.bpm.toFixed(1));
  await expect(page.locator("[data-play]")).toHaveAttribute("aria-label", "Stop the deck");

  await page.locator("#stems").scrollIntoViewIfNeeded();
  await page.click("[data-stem=drums]");
  await expect(page.locator("[data-stem=drums]")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-stems]")).toContainText("2 of 3 parts on");
  await page.click("[data-stem=drums]");
  await expect(page.locator("[data-stems]")).toContainText("3 of 3 parts on");
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
  await expect(page.locator("#tour-panel [data-fact=k-rotation]")).toBeVisible();
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

test("the assistant answers its own questions from the facts, in the visitor's language, and only a question in the visitor's words goes to the AI", async ({ page }) => {
  const errs = errors(page);
  const sent: { turns: { text: string }[]; context: { lang?: string } }[] = [];
  await page.route("**/api/guide", async (r) => {
    if (r.request().method() !== "POST") return r.fulfill({ json: { on: true } });
    sent.push(r.request().postDataJSON());
    return r.fulfill({ json: { say: "Antwort der KI.", options: [], actions: [] } });
  });
  await page.goto("/?country=DE");
  await page.click("[data-ask]");
  await expect(page.locator("[data-assistant]")).toContainText("djmanzo's assistant");
  await page.getByRole("button", { name: "Is it free?" }).click();
  await expect(page.locator("[data-assistant]")).toContainText("The Hobbyist edition is, for ever");
  await page.locator("[data-assistant] [data-act=start_trial]").click();
  await expect(page).toHaveURL(/\/pricing$/);
  // In German: the offered questions are German, answered at once, and the AI is never asked.
  await page.goto("/?country=DE&lang=de");
  await page.click("[data-ask]");
  await page.locator("[data-ask-canned=controller]").click();
  await expect(page.locator("[data-assistant] [data-canned=controller][data-line=guide]")).toContainText("Ehrlich gesagt: Keins wurde bisher am echten Gerät gespielt.");
  await expect(page.locator("[data-ask-canned=controller]")).toHaveCount(0);
  expect(sent).toHaveLength(0);
  // A question in the visitor's own words goes to the AI, told the language they read the site in.
  await page.getByRole("textbox", { name: "Deine Frage" }).fill("Kann ich damit auf einer Hochzeit auflegen?");
  await page.getByRole("button", { name: "Senden" }).click();
  await expect(page.locator("[data-assistant]")).toContainText("Antwort der KI.");
  expect(sent).toHaveLength(1);
  expect(sent[0].context.lang).toBe("de");
  expect(sent[0].turns.at(-1)?.text).toBe("Kann ich damit auf einer Hochzeit auflegen?");
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

test("older addresses land: the preview's, its hash pages, the retired sites and the Signal Path's stages", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/v4/?country=DO#/pricing");
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/pricing\?country=DO$/);
  await expect(page.locator("[data-edition=pro]")).toBeVisible();
  await page.goto("/#/market");
  await expect(page).toHaveURL(/\/outboard$/);
  await expect(page.locator("[data-market]")).toBeVisible();
  // The Signal Path is retired: its stages land on the page and section that show the same.
  await page.goto("/#/voice");
  await expect(page).toHaveURL(/\/#karaoke$/);
  await page.goto("/signal/#/amp");
  await expect(page).toHaveURL(/\/pricing$/);
  await page.goto("/shop/");
  await expect(page).toHaveURL(/\/pricing$/);
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

test("signing in stays on this site, and every page knows who is signed in", async ({ page }) => {
  const errs = errors(page);
  const visited: string[] = [];
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) visited.push(new URL(f.url()).pathname);
  });
  await page.goto("/features");
  await page.locator("[data-account-link]").click();
  await expect(page).toHaveURL(/\/account$/);
  await page.getByPlaceholder("Your DJ name").fill("Night Owl");
  await page.getByRole("button", { name: "Sign in for the demo" }).click();
  await expect(page.locator("[data-account-link]")).toHaveAttribute("aria-label", /Night Owl/);

  // Every page, loaded afresh, knows.
  for (const path of ["/", "/pricing", "/outboard", "/talkback", "/wishes"]) {
    await page.goto(path);
    await expect(page.locator("[data-account-link]"), path).toHaveAttribute("data-account-name", "Night Owl");
  }
  // Back from a provider: the page it left from says so, and the address is clean again.
  await page.goto("/pricing?signedin=github");
  await expect(page.getByText(/signed in with GitHub/i)).toBeVisible();
  await expect(page).toHaveURL(/\/pricing$/);
  expect(visited.filter((p) => p.startsWith("/island"))).toEqual([]);
  expect(errs).toEqual([]);
});

test("signed in with a very long name, the bar still fits the screen: the avatar alone, the name in its label", async ({ page }) => {
  const name = "DJ Maximiliano Alessandro de la Cruz Bartholomew-Featherstonehaugh the Third";
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/account");
  await page.getByPlaceholder("Your DJ name").fill(name);
  await page.getByRole("button", { name: "Sign in for the demo" }).click();
  const link = page.locator("[data-account-link]");
  // The server keeps a name to 48 characters; the label carries what it kept.
  await expect(link).toHaveAttribute("aria-label", new RegExp(name.slice(0, 40)));
  await expect(link).not.toContainText("Maximiliano");
  for (const width of [1600, 1366, 1280, 1200, 1100, 1081, 900, 640, 390, 360]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/pricing");
    await expect(link).toBeVisible();
    // Every visible thing in the bar ends inside the screen: a button cut off at the edge counts as not fitting.
    const past = await page.evaluate(() =>
      [...document.querySelectorAll("header.bar .inner > * , header.bar .right > *")]
        .filter((e) => (e as HTMLElement).offsetParent !== null && getComputedStyle(e).position !== "fixed")
        .map((e) => ({ what: (e.textContent ?? "").trim().slice(0, 24) || e.className, right: Math.ceil(e.getBoundingClientRect().right) }))
        .filter((e) => e.right > innerWidth),
    );
    expect(past, `${width}px: the bar fits`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px: nothing goes sideways`).toBeLessThanOrEqual(0);
  }
});

test("a panel's screenshot opens close up, every spot on it, and the whole window is a press away", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=DE");
  const shot = page.locator("[data-shot-frame=mykeys]").first();
  await shot.scrollIntoViewIfNeeded();
  await expect(shot.locator("[data-focus]")).toHaveAttribute("data-focus", "close");
  await expect(shot.locator("[data-spot]")).toHaveCount(5);
  // Close up, the picture is drawn larger than the frame it is in.
  const frame = await shot.locator("[data-focus]").boundingBox();
  const img = await shot.locator("img").boundingBox();
  expect(img!.width).toBeGreaterThan(frame!.width * 2);
  await shot.locator("[data-whole]").click();
  await expect(shot.locator("[data-focus]")).toHaveAttribute("data-focus", "whole");
  expect(Math.round((await shot.locator("img").boundingBox())!.width)).toBe(Math.round((await shot.locator("[data-focus]").boundingBox())!.width));
  expect(errs).toEqual([]);
});

test("the visitor's own country is welcomed in its words and colours, and a country not listed sees its region alone", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=DO");
  const local = page.locator("[data-local]");
  await expect(local).toHaveAttribute("data-local", "DO");
  await expect(local).toContainText("¡Bienvenido!");
  await expect(local).toContainText("Dominican Republic");
  await expect(local).toContainText("merengue");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--flag"))).toContain("linear-gradient");
  await page.goto("/?country=DE");
  await expect(page.locator("[data-local]")).toContainText("Willkommen!");
  await page.goto("/?country=IS");
  await expect(page.locator("[data-local]")).toHaveCount(0);
  expect(errs).toEqual([]);
});

test("the flag beside the look picks the language: the bar, the welcome written for the look, and the page's own tag follow, and it stays", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?country=DE");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#hero-title")).toContainText("Made for the long blend.");
  await page.locator("[data-lang-picker]").click();
  await expect(page.locator("[data-lang]")).toHaveCount(7);
  await page.locator("[data-lang=de]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("[data-lang-picker]")).toHaveAttribute("data-lang-picker", "de");
  await expect(page.locator("#hero-title")).toContainText("Gebaut für lange Blends.");
  await expect(page.locator("[data-welcome]")).toHaveAttribute("data-welcome", "club.de");
  await expect(page.getByRole("navigation", { name: "Website", exact: true }).getByRole("link", { name: "Preise" })).toBeVisible();
  await expect(page.locator("#get .go")).toContainText("Download für");
  // Another look, the same language: the welcome is that scene's.
  await page.locator("[data-skin-picker]").click();
  await page.locator("[data-skin=tropical]").click();
  await expect(page.locator("#hero-title")).toContainText("Salsa, Bachata, Reggaeton.");
  // Kept in this browser; an address that names a language wins.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await page.goto("/?lang=ja");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator("footer")).toContainText("利用規約");
  expect(errs).toEqual([]);
});

test("every feature, the home page's sections and the status line follow the language, and English comes straight back", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/?lang=de");
  await expect(page.locator("#hl-title")).toHaveText("Warum DJs und Karaoke-Gastgeber zweimal hinschauen");
  await expect(page.locator("#stems-title")).not.toContainText("Take any record apart");
  await expect(page.locator("footer")).toContainText("djmanzo ist in der Beta");
  await expect(page.locator("#keys-title")).toHaveText("Tasten, die sich wie Wörter lesen.");
  await expect(page.locator("#karaoke-title")).toContainText("Ein ganzer Karaoke-Abend");
  await expect(page.locator("#hw-title")).toHaveText("Schließ an, was du hast.");
  await expect(page.locator("#faq-title")).toHaveText("Klare Antworten.");
  await expect(page.locator("#faq")).toContainText("Läuft es wirklich unter Linux?");
  await page.goto("/?lang=ja");
  await expect(page.locator("#live-title")).toHaveText("お金のかからないマーケットプレイス。脱線しないフォーラム。");
  await expect(page.locator("#keys [data-whichkey]")).toHaveAttribute("aria-label", "キーを試す：Space を押してから文字を");
  await page.goto("/features?lang=ja");
  await expect(page.locator("#h-mixing")).toHaveText("ミックス");
  await expect(page.locator("[data-fact=decks] h3")).toHaveText("2 台のデッキとミキサー");
  await expect(page.locator("[data-fact=gig] .waits")).toHaveText("観客のいる一夜と、そこで見つかったことの記録。");
  await expect(page.locator("[data-fact=dvs] .caveat")).toHaveText("プレスしたレコードではまだ試していません。");
  await page.locator("[data-lang-picker]").click();
  await page.locator("[data-lang=en]").click();
  await expect(page.locator("[data-fact=decks] h3")).toHaveText("Two decks and the mixer");
  await expect(page.locator("#h-mixing")).toHaveText("Mixing");
  expect(errs).toEqual([]);
});

test("release notes: every version in the visitor's language, a feature's built for every system, a patch carried by the next build", async ({ page }) => {
  const errs = errors(page);
  const lines = (s: string) => Object.fromEntries(["en", "es", "pt", "de", "fr", "it", "ja"].map((l) => [l, [`${s} (${l})`]]));
  const titles = (s: string) => Object.fromEntries(["en", "es", "pt", "de", "fr", "it", "ja"].map((l) => [l, `${s} (${l})`]));
  // djmanzo's notes, as /api/release-notes serves them from GitHub.
  await page.route("**/api/release-notes", (r) =>
    r.fulfill({
      json: [
        { version: "0.50.1", date: "2026-10-25", built: false, title: titles("A fix"), notes: lines("Fixed") },
        { version: "0.50.0", date: "2026-10-24", built: true, title: titles("A feature"), notes: { en: ["New"], de: ["Neu"] } },
      ],
    }),
  );
  await page.goto("/releases?lang=de#v0.50.0");
  await expect(page.locator("h1")).toHaveText("Was sich geändert hat, Version für Version");
  await expect(page.locator("[data-version]")).toHaveCount(2);
  await expect(page.locator("[data-version='0.50.1']")).toContainText("Patch · im nächsten Build");
  await expect(page.locator("[data-version='0.50.1']")).toContainText("Fixed (de)");
  await expect(page.locator("[data-version='0.50.0']")).toContainText("Gebaut für jedes System · Download");
  await expect(page.locator("[data-version='0.50.0'] li")).toHaveText(["Neu"]);
  // A language the notes lack falls back to English.
  await page.goto("/releases?lang=ja");
  await expect(page.locator("[data-version='0.50.0'] li")).toHaveText(["New"]);
  // And the footer leads there.
  await expect(page.locator("footer a[href='/releases']")).toHaveText("リリースノート");
  expect(errs).toEqual([]);
});

test("a gift bought at the shop: the voucher line and its link, kept in the account; the demo's is a rehearsal", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/pricing?lang=de");
  // The demo sign-in speaks German now, as the rest of the page does.
  await page.getByPlaceholder("Dein DJ-Name").fill("Gift DJ");
  await page.getByRole("button", { name: "Für die Demo anmelden" }).click();
  await page.locator("[data-plan=perpetual]").click();
  // Only bought once: a subscription cannot be a gift.
  await page.locator("[data-plan=monthly]").click();
  await expect(page.locator("[data-gift-toggle]")).toBeDisabled();
  await page.locator("[data-plan=perpetual]").click();
  await page.locator("[data-gift-toggle]").check();
  await page.locator("[data-gift-for]").fill("lena@example.test");
  await page.locator("[data-gift-note]").fill("Alles Gute");
  await page.getByRole("button", { name: /Zahlung von .* proben/ }).click();
  await expect(page.locator("[data-gift-done]")).toContainText("Dein Geschenk ist fertig.");
  await expect(page.locator("[data-gift-rehearsal]")).toBeVisible();
  await expect(page.locator("[data-gift-line]")).toHaveValue(/^djmanzo-voucher-1\./);
  await expect(page.locator("[data-gift-link]")).toHaveValue(/\/redeem\?voucher=djmanzo-voucher-1/);
  await page.goto("/account?lang=de");
  await expect(page.locator("[data-gifts]")).toContainText("Gekaufte Geschenke");
  await expect(page.locator("[data-gifts]")).toContainText("für lena@example.test");
  expect(errs).toEqual([]);
});

test("Backstage: the crew sets a password, comes in with it, and grants a licence to an account", async ({ page }) => {
  const errs = errors(page);
  // A DJ with an account, to grant to.
  await page.goto("/account");
  await page.getByPlaceholder("Your DJ name").fill("Granted DJ");
  await page.getByRole("button", { name: "Sign in for the demo" }).click();
  await expect(page.locator("[data-account-link]")).toHaveAttribute("data-account-name", "Granted DJ");
  const uid = await page.evaluate(async () => ((await (await fetch("/api/me")).json()) as { user: { id: string } }).user.id);
  await page.context().clearCookies();
  // The address to remember leads to Backstage; a guess does not open it.
  await page.goto("/backstage");
  await expect(page).toHaveURL(/\/backstage$/);
  await expect(page.locator("[data-backstage]")).toBeVisible();
  await page.locator("[data-crew-password]").fill("not the password");
  await page.getByRole("button", { name: "Come in" }).click();
  await expect(page.getByText("That is not the crew's token or password.")).toBeVisible();
  await page.locator("[data-crew-password]").fill("crew-secret");
  await page.getByRole("button", { name: "Come in" }).click();
  // Who the overview's people are: the token signed in as the "Owner" account.
  await page.locator("[data-people] summary").click();
  await expect(page.locator("[data-people] [data-person]").first()).toBeVisible();
  await expect(page.locator("[data-people]")).toContainText("Owner: the crew's password or token");
  await page.locator("[data-password] summary").click();
  // The local store outlives a run, so a password may be set already; the unit tests hold a fresh site to having none.
  await expect(page.locator("[data-password]")).toContainText("There is no default password.");
  await expect(page.locator("[data-password]")).toContainText(/None is set yet|One is set/);
  await page.locator("[data-pw-new]").fill("a long crew password");
  await page.locator("[data-pw-again]").fill("a long crew password");
  await page.getByRole("button", { name: /(Set|Change) the password/ }).click();
  await expect(page.locator("[data-pw-msg]")).toContainText("Saved.");
  // Out, and in again with the password.
  await page.context().clearCookies();
  // A fresh load: the same address with only a hash would keep the page, and who it thinks is signed in.
  await page.goto("/");
  // The island's old address still leads here.
  await page.goto("/island/#/backstage");
  await expect(page).toHaveURL(/\/backstage$/);
  await page.locator("[data-crew-password]").fill("a long crew password");
  await page.getByRole("button", { name: "Come in" }).click();
  await page.locator("[data-grant] summary").click();
  await page.locator("[data-grant-who]").fill(uid);
  await page.locator("[data-grant-edition]").selectOption("karaoke");
  await page.getByRole("button", { name: "Grant it" }).click();
  await expect(page.locator("[data-granted]")).toContainText("Granted: karaoke, perpetual, for good, to Granted DJ");
  expect(errs).toEqual([]);
});

test("Insights: a visitor's pages and search reach Backstage, with no cookie and nothing kept in their browser", async ({ browser, page }) => {
  // An ordinary browser: a headless one is taken for a robot and not counted.
  const visitor = await browser.newContext({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" });
  const v = await visitor.newPage();
  const words = `insight ${Date.now().toString(36)}`;
  await v.goto("/");
  await v.goto("/features");
  await v.locator("[data-feature-search]").fill(words);
  await v.waitForTimeout(2000);
  const stored = await v.evaluate(() => ({ cookie: document.cookie, local: Object.keys(localStorage).filter((k) => /insight|visit/i.test(k)), session: sessionStorage.length }));
  expect(stored).toEqual({ cookie: "", local: [], session: 0 });
  // Leaving the page sends what is left.
  await v.close({ runBeforeUnload: true });
  await visitor.close();

  await page.goto("/backstage");
  await page.locator("[data-crew-password]").fill("crew-secret");
  await page.getByRole("button", { name: "Come in" }).click();
  await page.locator("[data-insights] summary").click();
  await page.locator("[data-insights-days='7']").click();
  await expect(page.locator("[data-insights-searches]")).toContainText(words);
  await expect(page.locator("[data-insights-pages]")).toContainText("/features");
  await expect(page.locator("[data-insights-stats]")).toContainText("visits");
});

test("buying: the address the receipt goes to is confirmed first, and the order's state is said plainly after", async ({ page }) => {
  const errs = errors(page);
  // The shop with a bank transfer and e-mail, and a real (not demo) account: answered here, so nothing is stored.
  let contact: { email: string; confirmed: number | null } | null = null;
  await page.route("**/api/catalog", async (r) => {
    const j = await (await r.fetch()).json();
    await r.fulfill({ json: { ...j, pay: { demo: false, stripe: null, paypal: null, transfer: true } } });
  });
  await page.route("**/api/me", async (r) => {
    const j = await (await r.fetch()).json();
    await r.fulfill({ json: { ...j, mail: true, user: { id: "u_buyer", name: "Kai", email: "kai@example.test", avatar: null, demo: false, owner: false, providers: ["github"], contact } } });
  });
  let asked = "";
  await page.route("**/api/me/contact", async (r) => {
    asked = r.request().postDataJSON().email;
    await r.fulfill({ json: { sent: true, mail: true, contact: null, pending: asked } });
  });
  await page.route("**/api/me/contact/confirm", async (r) => {
    contact = { email: asked, confirmed: Date.now() };
    await r.fulfill({ json: { contact } });
  });
  await page.route("**/api/checkout/transfer", (r) =>
    r.fulfill({ json: { order: { id: "o_e2eTransfer1", total: 5500, currency: "EUR", edition: "karaoke", plan: "perpetual", status: "pending", email: asked }, instructions: "IBAN AT00 1234 5678 9012 3456", reference: "o_e2eTransfer1", display: "€55.00", mailedTo: asked } }),
  );
  await page.goto("/pricing?edition=karaoke#checkout");
  // No way to pay shows before the address is settled.
  await expect(page.locator("[data-contact-email]")).toHaveValue("kai@example.test");
  await expect(page.getByRole("button", { name: /bank details/i })).toHaveCount(0);
  await page.locator("[data-contact-email]").fill("kai.bookings@example.org");
  await page.locator("[data-contact-ask]").click();
  await page.locator("[data-contact-code]").fill("123456");
  await page.locator("[data-contact-confirm]").click();
  await expect(page.locator("[data-contact-ready]")).toContainText("kai.bookings@example.org");
  await page.getByRole("button", { name: /bank details/i }).click();
  const status = page.locator("[data-status=waiting]");
  await expect(status).toContainText("djmanzo Karaoke is reserved for you.");
  await expect(status).toContainText("Nothing has been paid yet.");
  await expect(status.locator("[data-status-bank]")).toHaveText("IBAN AT00 1234 5678 9012 3456");
  await expect(status.locator("[data-status-mail]")).toContainText("kai.bookings@example.org");
  await expect(status.getByRole("link", { name: "Download djmanzo" })).toBeVisible();
  await expect(status.locator("[data-status-trial]")).toBeVisible();
  expect(errs).toEqual([]);
});

test("Backstage: payments are set without a deploy, shown back only by their ends, and the shop follows", async ({ page, request }) => {
  const errs = errors(page);
  const clear = { values: { STRIPE_PUBLISHABLE_KEY: "", STRIPE_SECRET_KEY: "" } };
  try {
    await page.goto("/backstage");
    await page.locator("[data-crew-password]").fill("crew-secret");
    await page.getByRole("button", { name: "Come in" }).click();
    await page.locator("[data-payments] summary").click();
    await expect(page.locator("[data-pay-mode]")).toContainText("Card form: off");
    await page.locator("[data-pay-field=STRIPE_PUBLISHABLE_KEY]").fill("pk_test_51E2eTestKeyPublishable");
    await page.locator("[data-pay-field=STRIPE_SECRET_KEY]").fill("sk_test_51E2eTestKeySecretWXYZ");
    await page.locator("[data-payments]").getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-pay-msg]")).toContainText("Saved.");
    await expect(page.locator("[data-pay-mode]")).toContainText("Card form: test");
    await expect(page.locator("[data-payments]")).toContainText("…WXYZ (backstage)");
    await expect(page.locator("[data-payments]")).not.toContainText("sk_test_51E2eTestKeySecretWXYZ");
    // The shop offers the card form now, and the demo checkout steps aside.
    const pay = (await (await request.get("/api/catalog")).json()).pay;
    expect(pay.stripe.key).toBe("pk_test_51E2eTestKeyPublishable");
    expect(pay.demo).toBe(false);
  } finally {
    // The local store outlives a run: put the demo shop back for every other test.
    await request.put("/api/admin/payments", { data: clear, headers: { authorization: "Bearer crew-secret" } });
  }
  expect(errs).toEqual([]);
});

test("Backstage: a sign-in provider is switched on with its keys, and the sign-in page offers it", async ({ page, request }) => {
  const errs = errors(page);
  const clear = { values: { GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "" } };
  try {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/backstage$/);
    await page.locator("[data-crew-password]").fill("crew-secret");
    await page.getByRole("button", { name: "Come in" }).click();
    await page.locator("[data-signin-keys] summary").click();
    const google = page.locator("[data-signin-provider=google]");
    await expect(google).toContainText("— off");
    await expect(google.locator("[data-signin-register]")).toHaveText(/\/callback\/google$/);
    await expect(page.locator("[data-signin-provider=instagram]")).toContainText("Only Instagram professional accounts");
    await page.locator("[data-signin-field=GOOGLE_CLIENT_ID]").fill("1234-e2e.apps.googleusercontent.com");
    await page.locator("[data-signin-field=GOOGLE_CLIENT_SECRET]").fill("GOCSPX-e2e-secret-WXYZ");
    await page.locator("[data-signin-save]").click();
    await expect(page.locator("[data-signin-msg]")).toContainText("Saved.");
    await expect(google).toContainText("✓ offered");
    await expect(google).toContainText("…WXYZ (backstage)");
    await expect(page.locator("[data-signin-keys]")).not.toContainText("GOCSPX-e2e-secret-WXYZ");
    // The sign-in page offers it now, to someone not signed in.
    expect((await (await request.get("/api/me")).json()).providers.map((p: { id: string }) => p.id)).toContain("google");
    await page.context().clearCookies();
    await page.goto("/account");
    await expect(page.locator("[data-provider=google]")).toContainText("Continue with Google");
  } finally {
    await request.put("/api/admin/signin", { data: clear, headers: { authorization: "Bearer crew-secret" } });
  }
  expect(errs).toEqual([]);
});

test("the deck plays the genre's recorded loop: three parts that switch off and on, its own tempo and key, and the music's making credited", async ({ page }) => {
  const errs = errors(page);
  const index = JSON.parse(readFileSync("src/v4/loops/index.json", "utf8")) as Record<string, { bpm: number; camelot: string }>;
  const fetched: string[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/v4/loops/")) fetched.push(`${r.status()} ${new URL(r.url()).pathname}`);
  });
  await page.goto("/?country=DE");
  await page.locator("[data-groove=house]").click();
  await expect(page.locator("[data-bpm]")).toHaveText(index.house.bpm.toFixed(1));
  await expect(page.locator("[data-deck]")).toContainText(index.house.camelot);
  await page.locator("[data-play]").click();
  await expect(page.locator("[data-deck]")).toHaveAttribute("data-deck-source", "loop", { timeout: 20_000 });
  await expect(page.locator("[data-play]")).toHaveAttribute("aria-busy", "false");
  // AAC where the browser plays it; this test's Chromium has no AAC, so Opus.
  for (const stem of ["drums", "bass", "rest"]) expect(fetched.some((f) => new RegExp(`^200 /v4/loops/house/${stem}\\.(m4a|webm)$`).test(f)), stem).toBe(true);
  // Another genre: its own loop.
  await page.locator("[data-groove=techno]").click();
  await expect(page.locator("[data-bpm]")).toHaveText(index.techno.bpm.toFixed(1));
  await expect.poll(() => fetched.filter((f) => f.startsWith("200 /v4/loops/techno/")).length, { timeout: 20_000 }).toBeGreaterThanOrEqual(3);
  await expect(page.locator("[data-deck]")).toHaveAttribute("data-deck-source", "loop", { timeout: 20_000 });
  // The stems: three, each switchable, and the music's making said beside them.
  await page.locator("#stems").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-stem]")).toHaveCount(3);
  await page.locator("[data-stem=drums]").click();
  await expect(page.locator("[data-stem=drums]")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#stems")).toContainText("2 of 3 parts on");
  await expect(page.locator("[data-credit]")).toContainText("ACE-Step");
  await page.locator("[data-stem=drums]").click();
  await page.locator("[data-play]").click();
  await expect(page.locator("[data-deck]")).not.toHaveAttribute("data-deck-source", /./);
  expect(errs).toEqual([]);
});

test("the comparison, the kinds of nights and the people's page are pages of this site, in the visitor's language", async ({ page }) => {
  const errs = errors(page);
  await page.goto("/compare?lang=es");
  await expect(page.locator("[data-compare] h1")).toContainText("djmanzo junto");
  await expect(page.locator("[data-compare]")).toContainText("djmanzo frente a VirtualDJ");
  await expect(page.locator("[data-compare] table")).toContainText("Funciona en Windows");
  await page.goto("/nights?lang=en");
  await page.locator("[data-night=karaoke]").click();
  await expect(page.locator("[data-night-open=karaoke]")).toContainText("Between singers");
  await expect(page.locator("[data-night-open=karaoke]")).toContainText("The edition: Karaoke");
  await page.goto("/people");
  await expect(page.locator("[data-people]")).toContainText("What people say");
  await expect(page.locator("[data-say]")).toBeVisible();
  // The island's addresses for them land here.
  await page.goto("/island/#/arena");
  await expect(page).toHaveURL(/\/compare$/);
  // Each is a link in the footer.
  for (const path of ["/compare", "/nights", "/people"]) await expect(page.locator(`footer a[href="${path}"]`)).toHaveCount(1);
  expect(errs).toEqual([]);
});
