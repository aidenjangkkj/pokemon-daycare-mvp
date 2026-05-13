import { describe, expect, it } from "vitest";
import {
  applyDailyDecay,
  canPerformAction,
  createInitialRun,
  evolveIfReady,
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

  it("sets final stage immediately for no-evolution species", () => {
    const run = createInitialRun(
      132,
      ["normal"],
      20,
      1,
      "hardy",
      "balanced",
      [],
      1,
      [132],
    );
    const hatched = hatchIfReady({ ...run, day: 3 });
    const evolved = evolveIfReady(hatched);

    expect(hatched.pet.stage).toBe("final");
    expect(hatched.pet.isFinalEvolution).toBe(true);
    expect(evolved.pet.speciesId).toBe(132);
  });

  it("handles single-evolution line (2 stages)", () => {
    const run = createInitialRun(
      1,
      ["grass"],
      20,
      1,
      "hardy",
      "balanced",
      [],
      1,
      [1, 2],
    );
    const hatched = hatchIfReady({ ...run, day: 3 });
    const evolved = evolveIfReady({ ...hatched, day: 7 });

    expect(hatched.pet.stage).toBe("juvenile");
    expect(evolved.pet.speciesId).toBe(2);
    expect(evolved.pet.stage).toBe("final");
  });

  it("handles multi-stage evolution line (3 stages)", () => {
    const run = createInitialRun(
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
    const hatched = hatchIfReady({ ...run, day: 3 });
    const middle = evolveIfReady({ ...hatched, day: 7 });
    const final = evolveIfReady({ ...middle, day: 11 });

    expect(middle.pet.speciesId).toBe(2);
    expect(middle.pet.stage).toBe("juvenile");
    expect(final.pet.speciesId).toBe(3);
    expect(final.pet.stage).toBe("final");
  });
});
