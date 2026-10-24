/**
 * The Signal Path's senses and its guide, in a browser: the scripted guide
 * when there is no key, the guide that Claude speaks for (its answers played
 * from the page's side, since no key is set here), consent asked once and
 * kept, the visitor's town and sunrise at Afterglow, the constellation, and
 * "Forget me" leaving nothing behind.
 */
import { expect, test, type Page } from "@playwright/test";

const accent = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());

const LINZ = { known: true, city: "Linz", region: "Upper Austria", country: "AT", timezone: "Europe/Vienna", lat: 48.3, lon: 14.3, band: 1, bandName: "List price" };
const RAIN = { sky: "rain", symbol: "rain", night: true, temperature: 9, wind: 3, rain: 0.6, cloud: 100, at: "2026-10-17T20:00:00Z", credit: "Weather: MET Norway (api.met.no), CC BY 4.0" };

async function returning(page: Page, saved: object, consent: object | null = null) {
  await page.addInitScript(
    ([s, c]) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("djmanzo.signal", JSON.stringify(s));
        if (c) localStorage.setItem("djmanzo.consent", JSON.stringify(c));
        sessionStorage.setItem("seeded", "1");
      }
    },
    [saved, consent] as const,
  );
}

test("without a key the scripted guide asks, and the question about where is asked once and the answer kept", async ({ page }) => {
  const where: string[] = [];
  page.on("request", (r) => r.url().includes("/api/where") && where.push(r.url()));
  await page.goto("/signal/#/silence");
  await page.getByRole("button", { name: "Next beat" }).click();
  const guide = page.locator("[data-guide]");
  await expect(guide).toHaveAttribute("data-mode", "script");
  await expect(guide.locator("[data-consent]")).toHaveCount(0);
  await guide.getByRole("radio", { name: "Latin & Caribbean" }).click();
  const ask = guide.locator('[data-consent="where"]');
  await expect(ask).toBeVisible();
  await ask.getByRole("button", { name: "No, thank you" }).click();
  await expect(ask).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("djmanzo.consent") || "{}"))).toEqual({ where: false, gps: null });
  await page.reload();
  await page.getByRole("button", { name: "Next beat" }).click();
  await expect(page.locator('[data-consent="where"]')).toHaveCount(0);
  // A no is a no: the server was never asked where the visitor is.
  expect(where).toEqual([]);
});

test("with a key, the guide answers, re-dresses the path at once, and offers the rest as buttons", async ({ page }) => {
  const sent: { turns: { from: string; text: string }[]; context: Record<string, unknown> }[] = [];
  await page.route("**/api/guide", async (r) => {
    if (r.request().method() === "GET") return r.fulfill({ json: { on: true } });
    sent.push(r.request().postDataJSON());
    await r.fulfill({
      json: {
        say: "Electro swing: brass, a Charleston kick, and a laser through the haze. Shall we go where two records meet?",
        options: ["Show me", "What does it cost?"],
        actions: [
          { kind: "set_style", value: "electroswing" },
          { kind: "go_to", value: "confluence" },
          { kind: "ask", value: "where" },
        ],
      },
    });
  });
  await page.goto("/signal/#/silence");
  await page.getByRole("button", { name: "Next beat" }).click();
  const guide = page.locator("[data-guide]");
  await expect(guide).toHaveAttribute("data-mode", "claude");
  await expect(guide).toContainText("Claude, an AI made by Anthropic");
  // The opening is the page's own: nothing has been sent yet.
  expect(sent).toHaveLength(0);

  await guide.getByRole("button", { name: "I DJ" }).click();
  await guide.getByLabel("Say something to the guide").fill("electro swing, mostly");
  await guide.getByRole("button", { name: "Say" }).click();
  await expect(guide.locator(".guide-line").last()).toContainText("Charleston");
  await expect.poll(() => accent(page)).toBe("#d4a64a");

  expect(sent).toHaveLength(2);
  expect(sent[1].turns.map((t) => t.from)).toEqual(["visitor", "guide", "visitor"]);
  expect(sent[1].context).toMatchObject({ stage: "silence", role: "dj", where: false });

  // Asking is a card with a yes and a no; going somewhere is a button the visitor presses.
  await expect(guide.locator('[data-consent="where"]')).toBeVisible();
  await guide.locator('[data-offer="go_to"]').click();
  await expect(page.locator('[data-stage="confluence"]')).toBeVisible({ timeout: 15_000 });
});

test("when the guide is capped the scripted questions take over and say why", async ({ page }) => {
  await page.route("**/api/guide", (r) => r.fulfill({ json: r.request().method() === "GET" ? { on: true } : { fallback: "limit" } }));
  await page.goto("/signal/#/silence");
  await page.getByRole("button", { name: "Next beat" }).click();
  const guide = page.locator("[data-guide]");
  await guide.getByRole("button", { name: "I host karaoke" }).click();
  await expect(guide).toHaveAttribute("data-mode", "script");
  await expect(guide).toContainText("talked a lot today");
  await expect(guide.getByRole("radio", { name: "I host karaoke" })).toHaveAttribute("aria-checked", "true");
});

test("a visitor who shared where they are sees their town, their sky and their sunrise, and can forget it all", async ({ page }) => {
  let asked = 0;
  await page.route("**/api/where", (r) => {
    asked++;
    return r.fulfill({ json: LINZ });
  });
  await page.route("**/api/weather?*", (r) => r.fulfill({ json: RAIN }));
  await returning(page, { style: "bachata", role: "dj", visited: ["silence", "groove", "confluence", "amp"] }, { where: true, gps: null });
  await page.goto("/signal/#/");
  await expect(page.locator("[data-tonight]")).toHaveText("Tonight in Linz · rain", { timeout: 15_000 });
  expect(asked).toBe(1);

  await page.locator('[data-meter="afterglow"]').click();
  await expect(page.locator("[data-sunrise]")).toContainText(/In Linz, the sun rises at/, { timeout: 15_000 });
  // The constellation, at Afterglow's play.
  await page.getByRole("button", { name: "Play" }).click();
  const poster = page.locator("[data-poster]");
  await expect(poster.getByRole("link", { name: "Keep it" })).toHaveAttribute("href", /^data:image\/png;base64,/, { timeout: 15_000 });

  await page.locator('[data-corner="you"]').click();
  await expect(page.locator("[data-yournight]")).toContainText("Roughly where you are: yes (Linz)");
  await page.locator("[data-forget]").click();
  await expect(page.locator("[data-yournight]")).toContainText("this browser holds nothing of your visit now");
  const left = await page.evaluate(() => [localStorage.getItem("djmanzo.signal"), localStorage.getItem("djmanzo.consent"), sessionStorage.getItem("djmanzo.guide"), sessionStorage.getItem("djmanzo.weather")]);
  expect(left).toEqual([null, null, null, null]);
  await expect(page.locator("[data-tonight]")).toHaveCount(0);
});

test("the sky over the painting can be shown without asking anyone where they are", async ({ page }) => {
  let asked = 0;
  await page.route("**/api/where", (r) => {
    asked++;
    return r.fulfill({ json: LINZ });
  });
  await returning(page, { style: "edm", role: null, visited: ["silence"] });
  await page.goto("/signal/?sky=snow#/");
  await expect(page.locator("[data-tonight]")).toHaveText("Tonight · snow", { timeout: 15_000 });
  expect(asked).toBe(0);
});
