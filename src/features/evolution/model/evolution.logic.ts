import type {
  PokeApiEvolutionChain,
  PokeApiEvolutionChainNode,
} from "../../../shared/types/pokemon";

export function extractSpeciesIdFromUrl(url: string): number | null {
  const segments = url.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);

  if (!lastSegment) {
    return null;
  }

  const speciesId = Number(lastSegment);

  return Number.isFinite(speciesId) ? speciesId : null;
}

function flattenFirstEvolutionPath(
  node: PokeApiEvolutionChainNode,
): number[] {
  const speciesId = extractSpeciesIdFromUrl(node.species.url);

  if (!speciesId) {
    return [];
  }

  const nextNode = node.evolves_to[0];

  if (!nextNode) {
    return [speciesId];
  }

  return [speciesId, ...flattenFirstEvolutionPath(nextNode)];
}

export function getEvolutionLineSpeciesIds(
  evolutionChain: PokeApiEvolutionChain,
): number[] {
  return flattenFirstEvolutionPath(evolutionChain.chain);
}

export function getCurrentEvolutionIndex(
  speciesId: number,
  evolutionLineSpeciesIds: number[],
): number {
  return evolutionLineSpeciesIds.findIndex((id) => id === speciesId);
}

export function getNextEvolutionSpeciesId(
  speciesId: number,
  evolutionLineSpeciesIds: number[],
): number | null {
  const currentIndex = getCurrentEvolutionIndex(
    speciesId,
    evolutionLineSpeciesIds,
  );

  if (currentIndex < 0) {
    return null;
  }

  return evolutionLineSpeciesIds[currentIndex + 1] ?? null;
}

export function isFinalEvolutionSpecies(
  speciesId: number,
  evolutionLineSpeciesIds: number[],
): boolean {
  if (evolutionLineSpeciesIds.length === 0) {
    return false;
  }

  return evolutionLineSpeciesIds.at(-1) === speciesId;
}

export function getNextEvolutionDay(evolutionHistoryLength: number): number {
  return 3 + evolutionHistoryLength * 4;
}

export function getEvolutionReadyDay(
  evolutionHistoryLength: number,
  turnsToHatch: number,
  weeklyCarePoint: number,
): number {
  const baseDay = getNextEvolutionDay(evolutionHistoryLength);
  const hatchPressure = turnsToHatch >= 40 ? 1 : turnsToHatch >= 20 ? 0 : -1;
  const careBonus = weeklyCarePoint >= 10 ? 1 : 0;

  return Math.max(3, baseDay + hatchPressure - careBonus);
}
