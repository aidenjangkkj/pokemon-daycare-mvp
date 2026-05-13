import type { PokemonSummary } from "../../../shared/types/pokemon";

function getEvolutionDepthWeight(pokemon: PokemonSummary): number {
  if (pokemon.hatchCounter >= 20) {
    return 1.2;
  }

  if (pokemon.hatchCounter >= 15) {
    return 1.1;
  }

  return 1;
}

function getRarityWeight(pokemon: PokemonSummary): number {
  if (pokemon.hatchCounter >= 25) {
    return 1.3;
  }

  if (pokemon.hatchCounter >= 20) {
    return 1.15;
  }

  return 1;
}

export function calculateRequestDifficulty(
  pokemon: PokemonSummary,
): number {
  const hatchCounterWeight = Number((pokemon.hatchCounter / 10).toFixed(2));
  const evolutionDepthWeight = getEvolutionDepthWeight(pokemon);
  const rarityWeight = getRarityWeight(pokemon);

  return Number((hatchCounterWeight + evolutionDepthWeight + rarityWeight).toFixed(2));
}
