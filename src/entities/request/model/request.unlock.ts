import type { MetaProgress } from "../../../shared/types/game";
import type { PokemonSummary } from "../../../shared/types/pokemon";

export function getRequiredUnlockTier(
  pokemon: PokemonSummary,
): MetaProgress["unlockTier"] {
  if (pokemon.hatchCounter >= 30) {
    return 3;
  }

  if (pokemon.hatchCounter >= 24) {
    return 2;
  }

  if (pokemon.hatchCounter >= 18) {
    return 1;
  }

  return 0;
}

export function filterPokemonByUnlockTier(
  pokemons: PokemonSummary[],
  unlockTier: MetaProgress["unlockTier"],
): PokemonSummary[] {
  return pokemons.filter(
    (pokemon) => getRequiredUnlockTier(pokemon) <= unlockTier,
  );
}
