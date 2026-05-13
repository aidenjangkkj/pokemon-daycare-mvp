import { GEN_1_MIN_ID, GEN_1_MAX_ID } from "../../../shared/constants/pokemon";
import type {
  PokeApiPokemonSpecies,
  PokemonSummary,
} from "../../../shared/types/pokemon";

export function isGen1SpeciesId(speciesId: number): boolean {
  return speciesId >= GEN_1_MIN_ID && speciesId <= GEN_1_MAX_ID;
}

export function isAvailableMvpPokemon(pokemon: PokemonSummary): boolean {
  return (
    isGen1SpeciesId(pokemon.speciesId) &&
    !pokemon.isLegendary &&
    !pokemon.isMythical
  );
}

export function isMissionSelectableSpecies(
  species: PokeApiPokemonSpecies,
): boolean {
  return species.evolves_from_species === null;
}
