import type { PokeApiNamedResource } from "./api";

export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokeApiPokemonTypeSlot[];
  sprites: PokeApiPokemonSprites;
  species: PokeApiNamedResource;
}

export interface PokeApiPokemonTypeSlot {
  slot: number;
  type: PokeApiNamedResource;
}

export interface PokeApiPokemonSprites {
  front_default: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokeApiPokemonSpecies {
  id: number;
  name: string;
  evolves_from_species: PokeApiNamedResource | null;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  names: PokeApiLocalizedName[];
  genera: PokeApiLocalizedGenus[];
  flavor_text_entries: PokeApiFlavorTextEntry[];
  habitat: PokeApiNamedResource | null;
  evolution_chain: {
    url: string;
  };
}

export interface PokeApiLocalizedName {
  name: string;
  language: PokeApiNamedResource;
}

export interface PokeApiLocalizedGenus {
  genus: string;
  language: PokeApiNamedResource;
}

export interface PokeApiFlavorTextEntry {
  flavor_text: string;
  language: PokeApiNamedResource;
  version: PokeApiNamedResource;
}

export interface PokeApiEvolutionChain {
  id: number;
  chain: PokeApiEvolutionChainNode;
}

export interface PokeApiEvolutionChainNode {
  species: PokeApiNamedResource;
  evolves_to: PokeApiEvolutionChainNode[];
}

export interface PokeApiNature {
  id: number;
  name: string;
}

export interface PokeApiItem {
  id: number;
  name: string;
}

export interface PokemonSummary {
  id: number;
  speciesId: number;
  name: string;
  localizedName: string;
  height: number;
  weight: number;
  types: string[];
  spriteUrl: string | null;
  habitat: string | null;
  hatchCounter: number;
  turnsToHatch: number;
  isLegendary: boolean;
  isMythical: boolean;
}
