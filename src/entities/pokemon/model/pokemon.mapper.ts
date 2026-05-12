import type {
  PokeApiPokemon,
  PokeApiPokemonSpecies,
  PokemonSummary,
} from "../../../shared/types/pokemon";

function findKoreanName(species: PokeApiPokemonSpecies): string | null {
  return (
    species.names.find((item) => item.language.name === "ko")?.name ?? null
  );
}

function getPixelSpriteUrl(pokemon: PokeApiPokemon): string | null {
  return (
    pokemon.sprites.front_default ??
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    null
  );
}

export function mapPokemonSummary(
  pokemon: PokeApiPokemon,
  species: PokeApiPokemonSpecies,
): PokemonSummary {
  return {
    id: pokemon.id,
    speciesId: species.id,
    name: pokemon.name,
    localizedName: findKoreanName(species) ?? pokemon.name,
    types: pokemon.types
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((item) => item.type.name),
    spriteUrl: getPixelSpriteUrl(pokemon),
    habitat: species.habitat?.name ?? null,
    hatchCounter: species.hatch_counter,
    turnsToHatch: species.hatch_counter * 2,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
  };
}
