import { describe, expect, it } from "vitest";
import {
  calculateConditionCompletionRate,
  calculateGrade,
} from "./grade.logic";

const pet = {
  pokemonId: 1,
  speciesId: 1,
  types: ["grass"],
  natureId: 1,
  natureName: "hardy",
  natureDisposition: "balanced" as const,
  stage: "juvenile" as const,
  isFinalEvolution: false,
  hunger: 80,
  cleanliness: 80,
  mood: 80,
  energy: 80,
};

describe("calculateGrade", () => {
  it("returns S when all S conditions are met", () => {
    expect(
      calculateGrade({
        pet,
        failCount: 0,
        conditionCompletionRate: 1,
        isRestMode: false,
      }),
    ).toBe("S");
  });

  it("returns A when S fails but A conditions are met", () => {
    expect(
      calculateGrade({
        pet: { ...pet, hunger: 60, cleanliness: 60, mood: 60, energy: 60 },
        failCount: 1,
        conditionCompletionRate: 1,
        isRestMode: false,
      }),
    ).toBe("A");
  });

  it("returns Rest when rest mode is true", () => {
    expect(
      calculateGrade({
        pet,
        failCount: 0,
        conditionCompletionRate: 1,
        isRestMode: true,
      }),
    ).toBe("Rest");
  });
});

describe("calculateConditionCompletionRate", () => {
  it("returns 1 when conditions are empty", () => {
    expect(calculateConditionCompletionRate([])).toBe(1);
  });

  it("returns ratio of satisfied conditions", () => {
    expect(
      calculateConditionCompletionRate([true, false, true]),
    ).toBeCloseTo(2 / 3);
  });
});
