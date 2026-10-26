/**
 * The booth on the home page's deck, in a real browser: every sampler sound
 * rendered and measured, and the knobs, faders, moves, pads and the voice
 * played with the loop.
 */
import { expect as plainExpect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const expect = plainExpect.configure({ timeout: 15_000 });

test("every sampler sound sounds: finite, audible, not clipping hard, and over within five seconds", async ({ page }) => {
  const js = buildSync({ entryPoints: ["src/v4/booth/sounds.ts"], bundle: true, format: "iife", globalName: "Sounds", write: false }).outputFiles[0].text;
  await page.goto("about:blank");
  await page.addScriptTag({ content: js });
  const report = await page.evaluate(async () => {
    const { SOUNDS } = (window as unknown as { Sounds: { SOUNDS: Record<string, (c: BaseAudioContext, o: AudioNode, t: number) => void> } }).Sounds;
    const out: Record<string, { peak: number; tail: number; broken: boolean }> = {};
    for (const id of Object.keys(SOUNDS)) {
      const ctx = new OfflineAudioContext(1, 44100 * 5, 44100);
      SOUNDS[id](ctx, ctx.destination, 0.01);
      const d = (await ctx.startRendering()).getChannelData(0);
      let peak = 0;
      let tail = 0;
      let broken = false;
      d.forEach((v, i) => {
        if (!Number.isFinite(v)) broken = true;
        peak = Math.max(peak, Math.abs(v));
        if (i > d.length - 22050) tail = Math.max(tail, Math.abs(v));
      });
      out[id] = { peak, tail, broken };
    }
    return out;
  });
  expect(Object.keys(report).length).toBeGreaterThan(40);
  for (const [id, r] of Object.entries(report)) {
    expect(r.broken, id).toBe(false);
    expect(r.peak, `${id} is heard`).toBeGreaterThan(0.02);
    expect(r.peak, `${id} does not blast`).toBeLessThan(2);
    expect(r.tail, `${id} has ended by five seconds`).toBeLessThan(0.01);
  }
});

test("the booth: the loop plays through the knobs and faders, the moves and the pads, and a voice goes on a pad", async ({ page, context }) => {
  await context.grantPermissions(["microphone"]);
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/favicon|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  await page.goto("/");
  await page.locator("[data-booth-toggle]").click();
  const booth = page.locator("[data-booth]");
  await expect(booth).toBeVisible();
  // The genre buttons come in their groups.
  await expect(page.locator("[data-groove-group=local] [data-groove]").first()).toBeVisible();
  await page.locator("[data-play]").click();
  await expect(page.locator("[data-deck-source=loop]")).toBeVisible();
  // A knob turned with the keyboard, a fader moved, a stem off and on.
  const filter = booth.locator('[role=slider][data-knob="Filter"]');
  await filter.focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowUp");
  await expect(filter).toHaveAttribute("aria-valuenow", "0.3");
  await booth.locator("[data-fader=drums]").fill("0.4");
  // The moves.
  await booth.locator("[data-move=brake]").click();
  await page.waitForTimeout(1500);
  await booth.locator("[data-move=rewind]").click();
  await page.waitForTimeout(1000);
  await booth.locator("[data-move=drop]").click();
  // A pad on the next sixteenth; then one going round, and everything stopped.
  await booth.locator("[data-bank=wedding]").click();
  await booth.locator("[data-pad=bells]").dispatchEvent("pointerdown");
  await booth.locator("[data-mode=repeat]").click();
  await booth.locator("[data-pad=clink]").dispatchEvent("pointerdown");
  await expect(booth.locator("[data-pad=clink].going")).toBeVisible();
  await booth.locator("[data-hush]").click();
  await expect(booth.locator(".pad.going")).toHaveCount(0);
  // The voice: Chromium's pretend microphone, a second of it, on its own pad.
  await booth.locator("[data-bank=voice]").click();
  await expect(booth.locator("[data-pad=voice]")).toBeDisabled();
  await booth.locator("[data-record]").click();
  await page.waitForTimeout(1200);
  await booth.locator("[data-record]").click();
  await expect(booth.locator("[data-voice-ready]")).toBeVisible();
  await expect(booth.locator("[data-pad=voice]")).toBeEnabled();
  await booth.locator("[data-mode=tap]").click();
  await booth.locator("[data-pad=voice]").dispatchEvent("pointerdown");
  await page.waitForTimeout(300);
  expect(errs).toEqual([]);
});
