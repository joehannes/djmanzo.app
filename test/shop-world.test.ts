import { describe, expect, it } from "vitest";
import { GENRE_BY_ID } from "../src/lib/genres";
import { subsolar, sunAltitude } from "../src/signal/sense/sun";
import { ARM, PLACES, armFor, cue, gleason, needle, polar, rotate, under } from "../src/shop/world/places";

describe("the record-earth is laid out as Gleason's map is", () => {
  it("puts the pole at the centre, the Pacific at the top, Africa below, Asia right and the Americas left", () => {
    expect(gleason(90, 0)).toEqual({ x: 0, y: 0 });
    // The far south is the rim.
    expect(Math.hypot(gleason(-90, 33).x, gleason(-90, 33).y)).toBeCloseTo(1);
    const africa = gleason(0, 20);
    const asia = gleason(30, 100);
    const americas = gleason(35, -95);
    const pacific = gleason(20, -170);
    expect(africa.y).toBeGreaterThan(0.4);
    expect(asia.x).toBeGreaterThan(0.3);
    expect(americas.x).toBeLessThan(-0.3);
    expect(pacific.y).toBeLessThan(-0.3);
    // Distances from the pole are true: the equator is halfway out.
    expect(Math.hypot(gleason(0, 77).x, gleason(0, 77).y)).toBeCloseTo(0.5);
  });

  it("has a place for every genre on it, each one the engine can play", () => {
    for (const p of PLACES) {
      expect(GENRE_BY_ID[p.genre], p.genre).toBeTruthy();
      const r = polar(gleason(p.lat, p.lon).x, gleason(p.lat, p.lon).y).r;
      expect(r).toBeGreaterThan(0.1);
      expect(r).toBeLessThan(0.98);
    }
  });
});

describe("the tonearm plays a place the way a turntable would", () => {
  it("reaches every groove from the label to the rim", () => {
    for (const r of [0.08, 0.2, 0.5, 0.8, 0.97]) {
      const n = needle(armFor(r));
      expect(Math.hypot(n.x, n.y), `r=${r}`).toBeCloseTo(r, 3);
    }
  });

  it("turns the record so that the place it was asked for comes under the needle", () => {
    for (const turn of [0, 1.3, -2.2]) {
      for (const p of PLACES) {
        const c = cue(gleason(p.lat, p.lon), turn);
        const there = rotate(gleason(p.lat, p.lon), c.turn);
        const n = needle(c.arm);
        expect(Math.hypot(there.x - n.x, there.y - n.y), `${p.genre} at ${turn}`).toBeLessThan(1e-6);
        // And the needle then reads that place, not a neighbour (Santo Domingo has three).
        expect(under(n, c.turn, 0.005)?.genre, p.genre).toBe(p.genre);
      }
    }
  });

  it("rests beside the record, off it", () => {
    const rest = needle(ARM.rest);
    expect(Math.hypot(rest.x, rest.y)).toBeGreaterThan(1);
  });
});

describe("the sun over the dome stands where it really does", () => {
  it("is straight overhead at the point it names, at any moment", () => {
    for (const iso of ["2026-03-20T12:00:00Z", "2026-06-21T06:30:00Z", "2026-10-19T18:45:00Z", "2026-12-21T23:10:00Z"]) {
      const at = new Date(iso);
      const s = subsolar(at);
      expect(sunAltitude(at, s.lat, s.lon), iso).toBeGreaterThan(89.5);
    }
  });

  it("is over the tropic of Cancer at the June solstice and near Greenwich at noon in March", () => {
    expect(subsolar(new Date("2026-06-21T12:00:00Z")).lat).toBeCloseTo(23.44, 0);
    const march = subsolar(new Date("2026-03-20T12:00:00Z"));
    expect(Math.abs(march.lat)).toBeLessThan(0.5);
    expect(Math.abs(march.lon)).toBeLessThan(3);
  });
});

describe("the painted land under the pins", () => {
  it("puts every place where its pin stands", async () => {
    const { gleasonProjection } = await import("../src/shop/world/surface");
    const R = 1000;
    const projection = gleasonProjection(R);
    for (const p of PLACES) {
      const [x, y] = projection([p.lon, p.lat])!;
      const pin = gleason(p.lat, p.lon);
      expect(Math.hypot(x / R - pin.x, y / R - pin.y), p.where).toBeLessThan(1e-6);
    }
  });
});
