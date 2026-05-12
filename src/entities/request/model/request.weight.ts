import {
  FOOD_PROFILE_TYPE_MAP,
  THEME_TYPE_MAP,
} from "../../../shared/constants/theme";
import type { PokemonSummary } from "../../../shared/types/pokemon";
import { clamp } from "../../../shared/utils/clamp";
import type { DaycareEnvironment } from "./request.types";

function hasTypeMatch(types: string[], targetTypes: string[]): boolean {
  return types.some((type) => targetTypes.includes(type));
}

function calculateThemeWeight(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): number {
  const primaryTypes = THEME_TYPE_MAP[environment.themePrimary];
  const secondaryTypes = environment.themeSecondary
    ? THEME_TYPE_MAP[environment.themeSecondary]
    : [];

  if (hasTypeMatch(pokemon.types, primaryTypes)) {
    return 1.4;
  }

  if (hasTypeMatch(pokemon.types, secondaryTypes)) {
    return 1.25;
  }

  return 1;
}

function calculateFacilityWeight(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): number {
  const matchedThemeLevels = Object.entries(THEME_TYPE_MAP)
    .filter(([, types]) => hasTypeMatch(pokemon.types, types))
    .map(([theme]) => {
      const typedTheme = theme as keyof typeof THEME_TYPE_MAP;
      return environment.facilityLevelByTheme[typedTheme];
    });

  const maxLevel = Math.max(0, ...matchedThemeLevels);

  return 1 + maxLevel * 0.05;
}

function calculateFoodWeight(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): number {
  const foodTypes = FOOD_PROFILE_TYPE_MAP[environment.foodProfile];

  if (foodTypes.length === 0) {
    return 1;
  }

  return hasTypeMatch(pokemon.types, foodTypes) ? 1.1 : 1;
}

function calculateCleanWeight(environment: DaycareEnvironment): number {
  if (environment.cleanlinessBand === "high") {
    return 1.1;
  }

  if (environment.cleanlinessBand === "low") {
    return 0.9;
  }

  return 1;
}

function calculateDuplicatePenalty(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): number {
  return environment.recentSpeciesIds.includes(pokemon.speciesId) ? 0.6 : 1;
}

function calculateMissingBonus(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): number {
  return environment.registeredSpeciesIds.includes(pokemon.speciesId)
    ? 1
    : 1.3;
}

function isRareCandidate(pokemon: PokemonSummary): boolean {
  return pokemon.hatchCounter >= 20;
}

function calculateConditionAdjust(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): number {
  if (environment.hasRecentRestPenalty) {
    return isRareCandidate(pokemon) ? 1 : 1.1;
  }

  if (environment.recentAverageFailCount < 2) {
    return 1;
  }

  return isRareCandidate(pokemon) ? 0.85 : 1.1;
}

export function calculateRequestWeight(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): number {
  const baseWeight = 1;

  const finalWeight =
    baseWeight *
    calculateThemeWeight(pokemon, environment) *
    calculateFacilityWeight(pokemon, environment) *
    calculateFoodWeight(pokemon, environment) *
    calculateCleanWeight(environment) *
    calculateDuplicatePenalty(pokemon, environment) *
    calculateMissingBonus(pokemon, environment) *
    calculateConditionAdjust(pokemon, environment);

  return clamp(finalWeight, 0.1, 3);
}
