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

function collectEvolutionPaths(
  node: PokeApiEvolutionChainNode,
): number[][] {
  const speciesId = extractSpeciesIdFromUrl(node.species.url);

  if (!speciesId) {
    return [];
  }

  if (node.evolves_to.length === 0) {
    return [[speciesId]];
  }

  const childPaths = node.evolves_to.flatMap((nextNode) =>
    collectEvolutionPaths(nextNode),
  );

  return childPaths.map((childPath) => [speciesId, ...childPath]);
}

function chooseDeterministicPath(paths: number[][]): number[] {
  return paths
    .slice()
    .sort((a, b) => {
      if (a.length !== b.length) {
        return b.length - a.length;
      }

      const aTerminal = a.at(-1) ?? 0;
      const bTerminal = b.at(-1) ?? 0;

      if (aTerminal !== bTerminal) {
        return aTerminal - bTerminal;
      }

      return a.join("-").localeCompare(b.join("-"));
    })[0] ?? [];
}

function choosePathIncludingSpecies(
  paths: number[][],
  speciesId: number,
): number[] {
  const candidatePaths = paths.filter((path) => path.includes(speciesId));

  if (candidatePaths.length === 0) {
    return [];
  }

  return chooseDeterministicPath(candidatePaths);
}

export function getEvolutionLineSpeciesIds(
  evolutionChain: PokeApiEvolutionChain,
  selectedSpeciesId?: number,
): number[] {
  const allPaths = collectEvolutionPaths(evolutionChain.chain);

  if (allPaths.length === 0) {
    return [];
  }

  if (typeof selectedSpeciesId === "number") {
    return choosePathIncludingSpecies(allPaths, selectedSpeciesId);
  }

  return chooseDeterministicPath(allPaths);
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
