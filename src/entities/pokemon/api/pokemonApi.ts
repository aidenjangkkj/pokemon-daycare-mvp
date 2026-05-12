import { requestCachedPokeApi } from "../../../shared/api/pokeApi";
import { GEN_1_SPECIES_IDS } from "../../../shared/constants/pokemon";
import type {
  PokeApiEvolutionChain,
  PokeApiItem,
  PokeApiNature,
  PokeApiPokemon,
  PokeApiPokemonSpecies,
  PokemonSummary,
} from "../../../shared/types/pokemon";
import { getEvolutionLineSpeciesIds as parseEvolutionLineSpeciesIds } from "../../../features/evolution/model/evolution.logic";
import { mapPokemonSummary } from "../model/pokemon.mapper";
import { isAvailableMvpPokemon } from "../model/pokemon.utils";

const POKEMON_CANDIDATE_BATCH_SIZE = 12;
const POKEMON_CANDIDATE_BATCH_DELAY_MS = 120;

function extractIdFromUrl(url: string): string {
  const segments = url.split("/").filter(Boolean);

  return segments.at(-1) ?? "unknown";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function getPokemon(id: number): Promise<PokeApiPokemon> {
  return requestCachedPokeApi<PokeApiPokemon>(`pokemon:${id}`, `/pokemon/${id}`);
}

export function getPokemonSpecies(id: number): Promise<PokeApiPokemonSpecies> {
  return requestCachedPokeApi<PokeApiPokemonSpecies>(
    `species:${id}`,
    `/pokemon-species/${id}`,
  );
}

export function getEvolutionChainByUrl(
  url: string,
): Promise<PokeApiEvolutionChain> {
  const evolutionChainId = extractIdFromUrl(url);

  return requestCachedPokeApi<PokeApiEvolutionChain>(
    `evolution-chain:${evolutionChainId}`,
    url,
  );
}

export function getNature(id: number): Promise<PokeApiNature> {
  return requestCachedPokeApi<PokeApiNature>(`nature:${id}`, `/nature/${id}`);
}

export function getItem(id: number): Promise<PokeApiItem> {
  return requestCachedPokeApi<PokeApiItem>(`item:${id}`, `/item/${id}`);
}

export async function getEvolutionLineSpeciesIds(
  speciesId: number,
): Promise<number[]> {
  const species = await getPokemonSpecies(speciesId);
  const evolutionChain = await getEvolutionChainByUrl(
    species.evolution_chain.url,
  );

  const evolutionLineSpeciesIds =
    parseEvolutionLineSpeciesIds(evolutionChain);

  if (evolutionLineSpeciesIds.length === 0) {
    return [speciesId];
  }

  const selectedIndex = evolutionLineSpeciesIds.findIndex(
    (id) => id === speciesId,
  );

  if (selectedIndex < 0) {
    return [speciesId];
  }

  return evolutionLineSpeciesIds.slice(selectedIndex);
}

export async function getPokemonSummary(id: number): Promise<PokemonSummary> {
  const [pokemon, species] = await Promise.all([
    getPokemon(id),
    getPokemonSpecies(id),
  ]);

  return mapPokemonSummary(pokemon, species);
}

async function getPokemonSummariesSafely(
  speciesIds: number[],
): Promise<PokemonSummary[]> {
  const settledResults = await Promise.allSettled(
    speciesIds.map((speciesId) => getPokemonSummary(speciesId)),
  );

  return settledResults
    .filter((result): result is PromiseFulfilledResult<PokemonSummary> => {
      return result.status === "fulfilled";
    })
    .map((result) => result.value)
    .filter(isAvailableMvpPokemon);
}

export async function getGen1PokemonCandidates(): Promise<PokemonSummary[]> {
  const candidates: PokemonSummary[] = [];

  for (
    let index = 0;
    index < GEN_1_SPECIES_IDS.length;
    index += POKEMON_CANDIDATE_BATCH_SIZE
  ) {
    const batchSpeciesIds = GEN_1_SPECIES_IDS.slice(
      index,
      index + POKEMON_CANDIDATE_BATCH_SIZE,
    );

    const batchCandidates = await getPokemonSummariesSafely(batchSpeciesIds);
    candidates.push(...batchCandidates);

    const hasNextBatch =
      index + POKEMON_CANDIDATE_BATCH_SIZE < GEN_1_SPECIES_IDS.length;

    if (hasNextBatch) {
      await delay(POKEMON_CANDIDATE_BATCH_DELAY_MS);
    }
  }

  if (candidates.length === 0) {
    throw new Error("1세대 의뢰 후보를 불러오지 못했습니다.");
  }

  return candidates;
}
