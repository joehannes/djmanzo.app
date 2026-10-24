import { describe, expect, it } from "vitest";
import { tintOf, weatherOf } from "../src/signal/world/engine";

describe("the visitor's night over the painting", () => {
  it("rains, snows and fogs only when the sky does", () => {
    expect(weatherOf(null)).toEqual([0, 0, 0]);
    expect(weatherOf("clear")).toEqual([0, 0, 0]);
    expect(weatherOf("rain")[0]).toBe(1);
    expect(weatherOf("snow")[1]).toBe(1);
    expect(weatherOf("fog")[2]).toBe(1);
  });

  it("is cool at night, warm at dawn and dusk, plain by day", () => {
    const [nr, , nb] = tintOf(0);
    const [wr, , wb] = tintOf(0.5);
    const [dr, , db] = tintOf(1);
    expect(nb).toBeGreaterThan(nr);
    expect(wr).toBeGreaterThan(wb);
    expect(wr).toBeGreaterThan(nr);
    expect(Math.abs(dr - db)).toBeLessThan(0.06);
  });
});
