import type { RequestCard } from "../../../shared/types/game";
import type { PokemonSummary } from "../../../shared/types/pokemon";
import { createId } from "../../../shared/utils/id";
import { calculateRequestDifficulty } from "./request.difficulty";
import { createRequestHints } from "./request.hint";
import { calculateRequestWeight } from "./request.weight";
import type { DaycareEnvironment, WeightedRequestCandidate } from "./request.types";

function calculateEstimatedCareLevel(pokemon: PokemonSummary): number {
  if (pokemon.turnsToHatch <= 20) {
    return 1;
  }

  if (pokemon.turnsToHatch <= 40) {
    return 2;
  }

  return 3;
}

function calculateRewardBase(pokemon: PokemonSummary): number {
  const careLevel = calculateEstimatedCareLevel(pokemon);

  return 10 + careLevel * 5;
}

function toWeightedCandidate(
  pokemon: PokemonSummary,
  environment: DaycareEnvironment,
): WeightedRequestCandidate {
  return {
    pokemon,
    weight: calculateRequestWeight(pokemon, environment),
    hints: createRequestHints(pokemon),
    estimatedCareLevel: calculateEstimatedCareLevel(pokemon),
    rewardBase: calculateRewardBase(pokemon),
    difficulty: calculateRequestDifficulty(pokemon),
  };
}

function pickWeightedCandidate(
  candidates: WeightedRequestCandidate[],
): WeightedRequestCandidate | null {
  const totalWeight = candidates.reduce(
    (sum, candidate) => sum + candidate.weight,
    0,
  );

  if (totalWeight <= 0) {
    return candidates[0] ?? null;
  }

  const threshold = Math.random() * totalWeight;
  let cursor = 0;

  for (const candidate of candidates) {
    cursor += candidate.weight;

    if (cursor >= threshold) {
      return candidate;
    }
  }

  return candidates.at(-1) ?? null;
}

export function generateRequestCards(
  pokemons: PokemonSummary[],
  environment: DaycareEnvironment,
  count: number,
): RequestCard[] {
  const remainingCandidates = pokemons.map((pokemon) =>
    toWeightedCandidate(pokemon, environment),
  );

  const cards: RequestCard[] = [];

  while (cards.length < count && remainingCandidates.length > 0) {
    const selectedCandidate = pickWeightedCandidate(remainingCandidates);

    if (!selectedCandidate) {
      break;
    }

    cards.push({
      requestId: createId("request"),
      speciesId: selectedCandidate.pokemon.speciesId,
      hints: selectedCandidate.hints,
      estimatedCareLevel: selectedCandidate.estimatedCareLevel,
      rewardBase: selectedCandidate.rewardBase,
      difficulty: selectedCandidate.difficulty,
    });

    const selectedIndex = remainingCandidates.findIndex(
      (candidate) =>
        candidate.pokemon.speciesId === selectedCandidate.pokemon.speciesId,
    );

    if (selectedIndex >= 0) {
      remainingCandidates.splice(selectedIndex, 1);
    }
  }

  return cards;
}
