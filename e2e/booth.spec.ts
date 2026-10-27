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
  const drums = booth.locator("[data-fader=drums]");
  await drums.focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowDown");
  await expect(drums).toHaveAttribute("aria-valuenow", "0.88");
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

test("put away, the booth leaves nothing playing: not the loop, a pad going round, nor the echo's and the reverb's tails; nor when the page is out of sight", async ({ page }) => {
  // Every way out to the speakers is listened to, from outside the page's code.
  await page.addInitScript(() => {
    const taps: AnalyserNode[] = [];
    (window as unknown as { taps: AnalyserNode[] }).taps = taps;
    const connect = AudioNode.prototype.connect as (this: AudioNode, d: AudioNode | AudioParam, ...r: number[]) => AudioNode | void;
    AudioNode.prototype.connect = function (this: AudioNode, d: AudioNode | AudioParam, ...r: number[]) {
      if (d instanceof AudioDestinationNode) {
        const a = this.context.createAnalyser();
        a.fftSize = 2048;
        connect.call(this, a);
        taps.push(a);
      }
      return connect.call(this, d, ...r);
    } as typeof AudioNode.prototype.connect;
  });
  /** The loudest sample heard over `ms`. */
  const loudest = (ms: number) =>
    page.evaluate(async (ms) => {
      const taps = (window as unknown as { taps: AnalyserNode[] }).taps;
      const buf = new Float32Array(2048);
      let peak = 0;
      const until = performance.now() + ms;
      while (performance.now() < until) {
        for (const a of taps) {
          if (a.context.state !== "running") continue;
          a.getFloatTimeDomainData(buf);
          for (const v of buf) peak = Math.max(peak, Math.abs(v));
        }
        await new Promise((r) => setTimeout(r, 30));
      }
      return peak;
    }, ms);

  const loud = async () => {
    await page.locator("[data-booth-toggle]").click();
    const booth = page.locator("[data-booth]");
    await expect(booth).toBeVisible();
    await page.locator("[data-play]").click();
    await expect(page.locator("[data-deck-source=loop]")).toBeVisible();
    // The beat effect: the reverb, all the way up and on, and a pad going round through it.
    for (let i = 0; i < 5 && !(await booth.locator("[data-fx-kind=space]").count()); i++) await booth.locator("[data-fx-next]").click();
    await expect(booth.locator("[data-fx-kind=space]")).toBeVisible();
    await booth.locator('[role=slider][data-knob="depth"]').focus();
    for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowUp");
    await booth.locator("[data-fx-on]").click();
    await expect(booth.locator("[data-fx-on]")).toHaveAttribute("aria-pressed", "true");
    await booth.locator("[data-bank=wedding]").click();
    await booth.locator("[data-mode=repeat]").click();
    await booth.locator("[data-pad=clink]").dispatchEvent("pointerdown");
    await expect(booth.locator("[data-pad=clink].going")).toBeVisible();
    expect(await loudest(800), "it plays").toBeGreaterThan(0.05);
  };

  await page.goto("/");
  await loud();
  await page.locator("[data-booth-toggle]").click();
  await expect(page.locator("[data-booth]")).toHaveCount(0);
  await expect(page.locator("[data-play].on")).toHaveCount(0);
  await page.waitForTimeout(150);
  expect(await loudest(1500), "closed, nothing is heard").toBeLessThan(0.002);

  // Opened again, it plays again; then the page goes out of sight.
  await loud();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("[data-play].on")).toHaveCount(0);
  await expect(page.locator("[data-booth] .pad.going")).toHaveCount(0);
  await page.waitForTimeout(150);
  expect(await loudest(1500), "out of sight, nothing is heard").toBeLessThan(0.002);
});

test("the gear: cue and play as on a CDJ, the tonearm, the pitch fader and the jog's rim, a stem killed, the beat effects", async ({ page }) => {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("/?lang=en");
  const play = page.locator("[data-play]");
  const cue = page.locator("[data-cue]");
  // Stopped, the cue button plays while it is held, and stops when it is let go.
  await cue.dispatchEvent("pointerdown");
  await expect(play).toHaveClass(/\bon\b/);
  await cue.dispatchEvent("pointerup");
  await expect(play).not.toHaveClass(/\bon\b/);
  // Playing, it goes back to the top and stops.
  await play.click();
  await expect(play).toHaveClass(/\bon\b/);
  await cue.dispatchEvent("pointerdown");
  await cue.dispatchEvent("pointerup");
  await expect(play).not.toHaveClass(/\bon\b/);

  await page.locator("[data-booth-toggle]").click();
  const booth = page.locator("[data-booth]");
  // The tonearm lowered plays the record; lifted, it stops.
  const arm = booth.locator("[data-arm]");
  await arm.click();
  await expect(arm).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-deck-source=loop]")).toBeVisible();
  // The pitch fader up five notches: the display says how much faster.
  const pitch = booth.locator("[data-fader=pitch]");
  await pitch.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowUp");
  await expect(pitch).toHaveAttribute("aria-valuetext", "+1.6 %");
  await expect(page.locator("[data-tempo-shown]")).toHaveText("+1.6%");
  // The jog's rim, turned forward: the tempo rises while it turns, and comes back to the fader's when let go.
  const box = (await booth.locator("[data-platter]").boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const r = box.width * 0.45;
  // From the left of the rim (the tonearm lies over the right), a quarter turn clockwise.
  await page.mouse.move(cx - r, cy);
  await page.mouse.down();
  let pushed = 0;
  for (let i = 1; i <= 8; i++) {
    const a = Math.PI + (i / 8) * (Math.PI / 2);
    await page.mouse.move(cx + r * Math.cos(a), cy + r * Math.sin(a));
    const shown = Number((await page.locator("[data-tempo-shown]").textContent())!.replace("−", "-").replace("%", ""));
    pushed = Math.max(pushed, shown);
  }
  await page.mouse.up();
  expect(pushed, "the rim pushed the tempo").toBeGreaterThan(2.1);
  await expect(page.locator("[data-tempo-shown]")).toHaveText("+1.6%");
  // A stem killed and brought back.
  const kill = booth.locator("[data-kill=bass]");
  await kill.click();
  await expect(kill).toHaveAttribute("aria-pressed", "false");
  await kill.click();
  await expect(kill).toHaveAttribute("aria-pressed", "true");
  // The beat effects go round, and back.
  for (const k of ["space", "flanger", "crush", "gate", "echo"]) {
    await booth.locator("[data-fx-next]").click();
    await expect(booth.locator(`[data-fx-kind=${k}]`)).toBeVisible();
  }
  await booth.locator("[data-fx-prev]").click();
  await expect(booth.locator("[data-fx-kind=gate]")).toBeVisible();
  await booth.locator("[data-fx-on]").click();
  await expect(booth.locator("[data-fx-on]")).toHaveAttribute("aria-pressed", "true");
  // Centred, the knobs, the pitch fader and the effect are back where they rest.
  await booth.getByRole("button", { name: "Centre the knobs" }).click();
  await expect(booth.locator("[data-fx-on]")).toHaveAttribute("aria-pressed", "false");
  await expect(pitch).toHaveAttribute("aria-valuenow", "0");
  await arm.click();
  await expect(arm).toHaveAttribute("aria-pressed", "false");
  expect(errs).toEqual([]);
});
