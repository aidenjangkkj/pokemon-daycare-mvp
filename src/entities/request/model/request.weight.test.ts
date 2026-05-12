import { describe, expect, it } from "vitest";
import { calculateRequestWeight } from "./request.weight";
import type { DaycareEnvironment } from "./request.types";
import type { PokemonSummary } from "../../../shared/types/pokemon";

const environment: DaycareEnvironment = {
  themePrimary: "shore",
  themeSecondary: "forest",
  facilityLevelByTheme: {
    forest: 1,
    shore: 2,
    volcano: 0,
    cave: 0,
    city: 0,
    sky: 0,
  },
  foodProfile: "fresh",
  cleanlinessBand: "high",
  themeChangeCooldownTurns: 0,
  freeThemeChangeAvailable: false,
  recentSpeciesIds: [],
  registeredSpeciesIds: [],
  recentAverageFailCount: 0,
  hasRecentRestPenalty: false,
};

const waterPokemon: PokemonSummary = {
  id: 7,
  speciesId: 7,
  name: "squirtle",
  localizedName: "꼬부기",
  types: ["water"],
  spriteUrl: null,
  habitat: "waters-edge",
  hatchCounter: 20,
  turnsToHatch: 40,
  isLegendary: false,
  isMythical: false,
};

describe("calculateRequestWeight", () => {
  it("returns higher weight when theme/type match and not registered", () => {
    const weight = calculateRequestWeight(waterPokemon, environment);
    expect(weight).toBeGreaterThan(1);
  });

  it("applies duplicate penalty", () => {
    const withDuplicate = calculateRequestWeight(waterPokemon, {
      ...environment,
      recentSpeciesIds: [7],
    });
    const withoutDuplicate = calculateRequestWeight(waterPokemon, environment);

    expect(withDuplicate).toBeLessThan(withoutDuplicate);
  });
});
