import {
  CARE_ACTION_DELTAS,
  CARE_STATS,
  DAILY_DECAY,
  INITIAL_STAT_VALUE,
  REST_MODE_FAIL_COUNT,
} from "../../../shared/constants/game";
import type {
  CareActionType,
  CareStat,
  NatureDisposition,
  RequestCondition,
  PetState,
  RunState,
} from "../../../shared/types/game";
import {
  getEvolutionReadyDay,
  getNextEvolutionSpeciesId,
  isFinalEvolutionSpecies,
} from "../../../features/evolution/model/evolution.logic";
import { clampStat } from "../../../shared/utils/clamp";
import { createId } from "../../../shared/utils/id";

export function createInitialPet(
  speciesId: number,
  types: string[],
  natureId: number,
  natureName: string,
  natureDisposition: NatureDisposition,
): PetState {
  return {
    pokemonId: speciesId,
    speciesId,
    types,
    natureId,
    natureName,
    natureDisposition,
    stage: "egg",
    isFinalEvolution: false,
    hunger: INITIAL_STAT_VALUE,
    cleanliness: INITIAL_STAT_VALUE,
    mood: INITIAL_STAT_VALUE,
    energy: INITIAL_STAT_VALUE,
  };
}

export function createInitialRun(
  speciesId: number,
  types: string[],
  turnsToHatch: number,
  natureId: number,
  natureName: string,
  natureDisposition: NatureDisposition,
  requiredConditions: RequestCondition[],
  difficulty: number,
  evolutionLineSpeciesIds: number[],
): RunState {
  const safeEvolutionLineSpeciesIds =
    evolutionLineSpeciesIds.length > 0 ? evolutionLineSpeciesIds : [speciesId];

  return {
    runId: createId("run"),
    day: 1,
    failCount: 0,
    weeklyCarePoint: 0,
    request: {
      requestId: createId("request"),
      speciesId,
      requiredConditions,
      difficulty,
    },
    pet: createInitialPet(
      speciesId,
      types,
      natureId,
      natureName,
      natureDisposition,
    ),
    history: [],
    evolutionLineSpeciesIds: safeEvolutionLineSpeciesIds,
    evolutionHistory: [],
    turnsToHatch,
    expeditionLogs: [],
  };
}

export function normalizeRunState(run: RunState): RunState {
  return {
    ...run,
    pet: {
      ...run.pet,
      types: run.pet.types ?? [],
      natureId: run.pet.natureId ?? 1,
      natureName: run.pet.natureName ?? "hardy",
      natureDisposition: run.pet.natureDisposition ?? "balanced",
    },
    evolutionLineSpeciesIds:
      run.evolutionLineSpeciesIds?.length > 0
        ? run.evolutionLineSpeciesIds
        : [run.pet.speciesId],
    request: {
      ...run.request,
      requiredConditions: run.request.requiredConditions ?? [],
      difficulty: run.request.difficulty ?? 1,
    },
    evolutionHistory: run.evolutionHistory ?? [],
    turnsToHatch: run.turnsToHatch ?? 20,
    expeditionLogs: run.expeditionLogs ?? [],
  };
}

export function getActionDelta(
  action: CareActionType,
): Partial<Record<CareStat, number>> {
  return CARE_ACTION_DELTAS[action];
}

export function canPerformAction(
  pet: PetState,
  action: CareActionType,
): boolean {
  if (pet.stage === "egg") {
    return action === "rest";
  }

  return true;
}

export function applyCareAction(
  pet: PetState,
  delta: Partial<Record<CareStat, number>>,
): PetState {
  return {
    ...pet,
    hunger: clampStat(pet.hunger + (delta.hunger ?? 0)),
    cleanliness: clampStat(pet.cleanliness + (delta.cleanliness ?? 0)),
    mood: clampStat(pet.mood + (delta.mood ?? 0)),
    energy: clampStat(pet.energy + (delta.energy ?? 0)),
  };
}

export function applyDailyDecay(pet: PetState): PetState {
  return {
    ...pet,
    hunger: clampStat(pet.hunger + DAILY_DECAY.hunger),
    cleanliness: clampStat(pet.cleanliness + DAILY_DECAY.cleanliness),
    mood: clampStat(pet.mood + DAILY_DECAY.mood),
    energy: clampStat(pet.energy + DAILY_DECAY.energy),
  };
}

export function hasZeroStat(pet: PetState): boolean {
  return CARE_STATS.some((stat) => pet[stat] <= 0);
}

export function shouldEnterRestMode(failCount: number): boolean {
  return failCount >= REST_MODE_FAIL_COUNT;
}

export function calculateAverageStat(pet: PetState): number {
  const total = CARE_STATS.reduce((sum, stat) => sum + pet[stat], 0);

  return total / CARE_STATS.length;
}

export function hatchIfReady(run: RunState): RunState {
  const normalizedRun = normalizeRunState(run);

  if (normalizedRun.pet.stage !== "egg") {
    return normalizedRun;
  }

  if (normalizedRun.day < 3) {
    return normalizedRun;
  }

  const firstSpeciesId =
    normalizedRun.evolutionLineSpeciesIds[0] ??
    normalizedRun.pet.speciesId;

  const isFinal = isFinalEvolutionSpecies(
    firstSpeciesId,
    normalizedRun.evolutionLineSpeciesIds,
  );

  return {
    ...normalizedRun,
    pet: {
      ...normalizedRun.pet,
      pokemonId: firstSpeciesId,
      speciesId: firstSpeciesId,
      stage: isFinal ? "final" : "juvenile",
      isFinalEvolution: isFinal,
    },
    evolutionHistory: [firstSpeciesId],
  };
}

export function evolveIfReady(run: RunState): RunState {
  const normalizedRun = normalizeRunState(run);

  if (normalizedRun.pet.stage === "egg") {
    return normalizedRun;
  }

  if (normalizedRun.pet.isFinalEvolution) {
    return normalizedRun;
  }

  const nextEvolutionDay = getEvolutionReadyDay(
    normalizedRun.evolutionHistory.length,
    normalizedRun.turnsToHatch,
    normalizedRun.weeklyCarePoint,
  );

  if (normalizedRun.day < nextEvolutionDay) {
    return normalizedRun;
  }

  const nextSpeciesId = getNextEvolutionSpeciesId(
    normalizedRun.pet.speciesId,
    normalizedRun.evolutionLineSpeciesIds,
  );

  if (!nextSpeciesId) {
    return {
      ...normalizedRun,
      pet: {
        ...normalizedRun.pet,
        stage: "final",
        isFinalEvolution: true,
      },
    };
  }

  const isFinal = isFinalEvolutionSpecies(
    nextSpeciesId,
    normalizedRun.evolutionLineSpeciesIds,
  );

  return {
    ...normalizedRun,
    pet: {
      ...normalizedRun.pet,
      pokemonId: nextSpeciesId,
      speciesId: nextSpeciesId,
      stage: isFinal ? "final" : "juvenile",
      isFinalEvolution: isFinal,
    },
    evolutionHistory: [
      ...normalizedRun.evolutionHistory,
      nextSpeciesId,
    ],
  };
}
