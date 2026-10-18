import { describe, expect, it } from "vitest";
import { daylightAt, sunAltitude, sunTimes } from "../src/signal/sense/sun";

// Published sunrise and sunset times (timeanddate.com, in UTC), to the minute.
const minutes = (d: Date | null) => (d ? d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 : NaN);
const near = (d: Date | null, hhmm: string, iso: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  expect(d?.toISOString().slice(0, 10)).toBe(iso);
  expect(Math.abs(minutes(d) - (h * 60 + m))).toBeLessThan(3);
};

describe("the sun", () => {
  it("rises and sets in London at midsummer and midwinter", () => {
    const summer = sunTimes(new Date("2024-06-21T12:00:00Z"), 51.5074, -0.1278);
    near(summer.rise, "03:43", "2024-06-21");
    near(summer.set, "20:21", "2024-06-21");
    const winter = sunTimes(new Date("2024-12-21T12:00:00Z"), 51.5074, -0.1278);
    near(winter.rise, "08:03", "2024-12-21");
    near(winter.set, "15:53", "2024-12-21");
  });

  it("finds the day by the place, not by the UTC date: Sydney's midsummer sunrise is the evening before in UTC", () => {
    // 13:00 in Sydney on 21 December 2024 is 02:00 UTC that day.
    const t = sunTimes(new Date("2024-12-21T02:00:00Z"), -33.8688, 151.2093);
    near(t.rise, "18:41", "2024-12-20");
    near(t.set, "09:05", "2024-12-21");
  });

  it("does not rise in a polar night", () => {
    expect(sunTimes(new Date("2024-12-21T12:00:00Z"), 78.22, 15.65)).toEqual({ rise: null, set: null });
  });

  it("stands high at noon, low at midnight, and the daylight follows it", () => {
    // Linz, at the equinox: roughly 90° − 48.3° at noon.
    const noon = new Date("2026-03-20T11:00:00Z");
    expect(sunAltitude(noon, 48.3, 14.3)).toBeGreaterThan(40);
    expect(sunAltitude(new Date("2026-03-20T23:00:00Z"), 48.3, 14.3)).toBeLessThan(-30);
    expect(daylightAt(noon, 48.3, 14.3)).toBe(1);
    expect(daylightAt(new Date("2026-03-20T23:00:00Z"), 48.3, 14.3)).toBe(0);
    const dusk = daylightAt(new Date("2026-03-20T17:20:00Z"), 48.3, 14.3);
    expect(dusk).toBeGreaterThan(0);
    expect(dusk).toBeLessThan(1);
  });
});
