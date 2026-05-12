import { describe, expect, it } from "vitest";
import { clamp, clampStat } from "./clamp";

describe("clamp", () => {
  it("returns min when value is below min", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it("returns max when value is above max", () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("clampStat", () => {
  it("clamps to 0~100", () => {
    expect(clampStat(-3)).toBe(0);
    expect(clampStat(20)).toBe(20);
    expect(clampStat(999)).toBe(100);
  });
});
