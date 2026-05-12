import { describe, expect, it } from "vitest";
import {
  applyDailyDecay,
  canPerformAction,
  createInitialRun,
  hatchIfReady,
} from "./run.logic";

function createRun() {
  return createInitialRun(
    1,
    ["grass"],
    20,
    1,
    "hardy",
    "balanced",
    [],
    1,
    [1, 2, 3],
  );
}

describe("run.logic", () => {
  it("creates initial run with typed pet", () => {
    const run = createRun();

    expect(run.pet.types).toEqual(["grass"]);
    expect(run.pet.stage).toBe("egg");
  });

  it("allows only rest action at egg stage", () => {
    const run = createRun();

    expect(canPerformAction(run.pet, "rest")).toBe(true);
    expect(canPerformAction(run.pet, "feedBerry")).toBe(false);
  });

  it("applies daily decay", () => {
    const run = createRun();
    const decayed = applyDailyDecay(run.pet);

    expect(decayed.hunger).toBe(58);
    expect(decayed.cleanliness).toBe(62);
    expect(decayed.mood).toBe(64);
    expect(decayed.energy).toBe(60);
  });

  it("hatches egg on day 3+", () => {
    const run = createRun();
    const hatched = hatchIfReady({ ...run, day: 3 });

    expect(hatched.pet.stage).toBe("juvenile");
    expect(hatched.evolutionHistory).toEqual([1]);
  });
});
