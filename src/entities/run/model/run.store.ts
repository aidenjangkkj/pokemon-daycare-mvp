import { create } from "zustand";
import {
  MAX_ACTIONS_PER_DAY,
  MAX_EXPEDITION_PER_DAY,
} from "../../../shared/constants/game";
import type {
  CareActionType,
  Grade,
  NatureDisposition,
  RunEndType,
  RunRecord,
  RunState,
} from "../../../shared/types/game";
import {
  calculateConditionCompletionRate,
  calculateGrade,
} from "../../../features/grading/model/grade.logic";
import { calculateRunReward } from "../../../features/reward/model/reward.logic";
import { applyActionModifiers } from "../../../features/care-action/model/action.logic";
import { calculateExpeditionResult } from "../../../features/expedition/model/expedition.logic";
import {
  getEvolutionLineSpeciesIds,
  getNature,
  getPokemonSummary,
} from "../../pokemon/api/pokemonApi";
import {
  createRequiredConditions,
  evaluateCondition,
} from "../../request/model/request.condition";
import { useEnvironmentStore } from "../../meta/model/meta.store";
import {
  applyCareAction,
  applyDailyDecay,
  calculateAverageStat,
  canPerformAction,
  createInitialRun,
  evolveIfReady,
  getActionDelta,
  hasZeroStat,
  hatchIfReady,
  shouldEnterRestMode,
} from "./run.logic";
import {
  clearRunRecords,
  clearRunSession,
  readClearedRunRecords,
  readRestRunRecords,
  readRunSession,
  writeClearedRunRecords,
  writeRestRunRecords,
  writeRunSession,
} from "./run.storage";

interface RunStore {
  currentRun: RunState | null;
  actionsToday: number;
  expeditionCountToday: number;
  isRestMode: boolean;
  clearedRuns: RunRecord[];
  restRuns: RunRecord[];
  latestResult: RunRecord | null;
  hydrateFromStorage: () => void;
  startRun: (speciesId: number) => Promise<void>;
  performAction: (
    action: CareActionType,
    options?: { expeditionMode?: "auto" | "direct"; miniGameSuccess?: boolean },
  ) => void;
  endDay: () => void;
  finishCurrentRun: () => void;
  clearRun: () => void;
  resetRecords: () => void;
  dismissLatestResult: () => void;
}

function isNewDexSpecies(
  speciesId: number,
  clearedRuns: RunRecord[],
  restRuns: RunRecord[],
): boolean {
  return ![...clearedRuns, ...restRuns].some(
    (record) => record.speciesId === speciesId,
  );
}

function createRunRecord(
  run: RunState,
  endType: RunEndType,
  grade: Grade,
  clearedRuns: RunRecord[],
  restRuns: RunRecord[],
): RunRecord {
  const isNewDex = isNewDexSpecies(
    run.pet.speciesId,
    clearedRuns,
    restRuns,
  );
  const environment = useEnvironmentStore.getState().environment;
  const matchedTheme = run.pet.types.some((type) => {
    if (environment.themePrimary === "forest") {
      return ["bug", "grass", "poison"].includes(type);
    }
    if (environment.themePrimary === "shore") {
      return ["water", "electric", "ice"].includes(type);
    }
    if (environment.themePrimary === "volcano") {
      return ["fire", "rock", "ground"].includes(type);
    }
    if (environment.themePrimary === "cave") {
      return ["rock", "ground", "poison", "ghost"].includes(type);
    }
    if (environment.themePrimary === "city") {
      return ["normal", "psychic", "electric"].includes(type);
    }

    return ["flying", "dragon", "normal"].includes(type);
  });
  const speciesRarityMultiplier =
    run.turnsToHatch >= 50 ? 1.5 : run.turnsToHatch >= 35 ? 1.2 : 1;
  const evolutionStageMultiplier =
    run.evolutionLineSpeciesIds.length >= 3 ? 1.2 : run.evolutionLineSpeciesIds.length === 2 ? 1.1 : 1;
  const expeditionCurrencyMultiplier =
    run.expeditionLogs.reduce(
      (acc, log) => acc * (log.success ? log.bonusCurrencyMultiplier : 1),
      1,
    );
  const expeditionOperationPointBonus = run.expeditionLogs.reduce(
    (sum, log) => sum + (log.success ? log.bonusOperationPoint : 0),
    0,
  );

  return {
    runId: run.runId,
    requestId: run.request.requestId,
    speciesId: run.pet.speciesId,
    endedAt: new Date().toISOString(),
    endDay: run.day,
    endType,
    grade,
    failCount: run.failCount,
    averageStat: calculateAverageStat(run.pet),
    finalStage: run.pet.stage,
    evolutionHistory:
      run.evolutionHistory.length > 0
        ? run.evolutionHistory
        : [run.pet.speciesId],
    reward: calculateRunReward({
      grade,
      baseCurrencyReward: endType === "clear" ? 20 : 10,
      baseOperationPointReward: endType === "clear" ? 1 : 0,
      isNewDex,
      speciesRarityMultiplier,
      evolutionStageMultiplier,
      themeSynergyBonusMultiplier: matchedTheme ? 1.1 : 1,
      expeditionCurrencyMultiplier,
      expeditionOperationPointBonus,
    }),
  };
}

function getConsecutiveActionCount(
  run: RunState,
  action: CareActionType,
): number {
  const lastAction = run.history.at(-1)?.action;

  if (!lastAction || lastAction !== action) {
    return 1;
  }

  return 2;
}

function calculateWeeklyCarePointGain(action: CareActionType): number {
  return action === "expedition" ? 2 : 1;
}

function toNatureDisposition(natureName: string): NatureDisposition {
  const activeNatures = ["adamant", "jolly", "naive", "hasty", "brave"];
  const stableNatures = ["calm", "bold", "careful", "relaxed", "sassy"];

  if (activeNatures.includes(natureName)) {
    return "active";
  }

  if (stableNatures.includes(natureName)) {
    return "stable";
  }

  return "balanced";
}

export const useRunStore = create<RunStore>((set) => ({
  currentRun: null,
  actionsToday: 0,
  expeditionCountToday: 0,
  isRestMode: false,
  clearedRuns: [],
  restRuns: [],
  latestResult: null,

  hydrateFromStorage: () => {
    const storedSession = readRunSession();

    set({
      currentRun: storedSession?.currentRun ?? null,
      actionsToday: storedSession?.actionsToday ?? 0,
      expeditionCountToday: storedSession?.expeditionCountToday ?? 0,
      isRestMode: storedSession?.isRestMode ?? false,
      clearedRuns: readClearedRunRecords(),
      restRuns: readRestRunRecords(),
    });
  },

  startRun: async (speciesId) => {
    const [evolutionLineSpeciesIds, summary] = await Promise.all([
      getEvolutionLineSpeciesIds(speciesId),
      getPokemonSummary(speciesId),
    ]);
    const natureId = (speciesId % 25) + 1;
    const nature = await getNature(natureId);
    const requiredConditions = createRequiredConditions(summary);

    const currentRun = createInitialRun(
      speciesId,
      summary.types,
      summary.turnsToHatch,
      nature.id,
      nature.name,
      toNatureDisposition(nature.name),
      requiredConditions,
      summary.hatchCounter,
      evolutionLineSpeciesIds,
    );

    writeRunSession({
      currentRun,
      actionsToday: 0,
      expeditionCountToday: 0,
      isRestMode: false,
    });

    set({
      currentRun,
      actionsToday: 0,
      expeditionCountToday: 0,
      isRestMode: false,
      latestResult: null,
    });
  },

  performAction: (action, options) => {
    set((state) => {
      if (!state.currentRun) return state;
      if (state.isRestMode) return state;
      if (state.currentRun.pet.isFinalEvolution) return state;
      if (state.actionsToday >= MAX_ACTIONS_PER_DAY) return state;
      if (!canPerformAction(state.currentRun.pet, action)) return state;

      if (
        action === "expedition" &&
        state.expeditionCountToday >= MAX_EXPEDITION_PER_DAY
      ) {
        return state;
      }

      const baseDelta = getActionDelta(action);
      const consecutiveCount = getConsecutiveActionCount(
        state.currentRun,
        action,
      );
      const modifiedDelta = applyActionModifiers(baseDelta, {
        pet: state.currentRun.pet,
        action,
        consecutiveCount,
      });

      const nextPet = applyCareAction(state.currentRun.pet, modifiedDelta);
      const nextActionsToday = state.actionsToday + 1;
      const nextWeeklyCarePoint =
        state.currentRun.weeklyCarePoint +
        calculateWeeklyCarePointGain(action);
      const nextExpeditionCountToday =
        action === "expedition"
          ? state.expeditionCountToday + 1
          : state.expeditionCountToday;
      const environment = useEnvironmentStore.getState().environment;
      const expeditionResult =
        action === "expedition"
          ? calculateExpeditionResult({
              mode: options?.expeditionMode ?? "auto",
              actionSuccessBase: 0.65,
              energy: state.currentRun.pet.energy,
              pokemonTypes: state.currentRun.pet.types,
              natureDisposition: state.currentRun.pet.natureDisposition,
              themePrimary: environment.themePrimary,
              themeSecondary: environment.themeSecondary,
              miniGameSuccess: options?.miniGameSuccess,
            })
          : null;

      const nextRun: RunState = {
        ...state.currentRun,
        pet: nextPet,
        weeklyCarePoint: nextWeeklyCarePoint,
        expeditionLogs: expeditionResult
          ? [
              ...state.currentRun.expeditionLogs,
              {
                day: state.currentRun.day,
                mode: options?.expeditionMode ?? "auto",
                successChance: expeditionResult.successChance,
                success: expeditionResult.success,
                bonusCurrencyMultiplier:
                  expeditionResult.bonusCurrencyMultiplier,
                bonusItemMultiplier:
                  expeditionResult.bonusItemMultiplier,
                bonusOperationPoint:
                  expeditionResult.bonusOperationPoint,
              },
            ]
          : state.currentRun.expeditionLogs,
        history: [
          ...state.currentRun.history,
          {
            day: state.currentRun.day,
            action,
            delta: modifiedDelta,
          },
        ],
      };

      writeRunSession({
        currentRun: nextRun,
        actionsToday: nextActionsToday,
        expeditionCountToday: nextExpeditionCountToday,
        isRestMode: state.isRestMode,
      });

      return {
        ...state,
        currentRun: nextRun,
        actionsToday: nextActionsToday,
        expeditionCountToday: nextExpeditionCountToday,
      };
    });
  },

  endDay: () => {
    set((state) => {
      if (!state.currentRun) return state;
      if (state.isRestMode) return state;
      if (state.currentRun.pet.isFinalEvolution) return state;

      const decayedPet = applyDailyDecay(state.currentRun.pet);
      const nextFailCount = hasZeroStat(decayedPet)
        ? state.currentRun.failCount + 1
        : state.currentRun.failCount;

      const nextRun = evolveIfReady(
        hatchIfReady({
          ...state.currentRun,
          day: state.currentRun.day + 1,
          failCount: nextFailCount,
          pet: decayedPet,
        }),
      );
      const nextRunWithWeeklyPoint =
        nextRun.day > 1 && (nextRun.day - 1) % 7 === 0
          ? { ...nextRun, weeklyCarePoint: 0 }
          : nextRun;

      const nextIsRestMode = shouldEnterRestMode(nextFailCount);

      if (nextIsRestMode) {
        const restRecord = createRunRecord(
          nextRunWithWeeklyPoint,
          "rest",
          "Rest",
          state.clearedRuns,
          state.restRuns,
        );

        const nextRestRuns = [restRecord, ...state.restRuns];

        clearRunSession();
        writeRestRunRecords(nextRestRuns);

        return {
          ...state,
          currentRun: null,
          actionsToday: 0,
          expeditionCountToday: 0,
          isRestMode: false,
          restRuns: nextRestRuns,
          latestResult: restRecord,
        };
      }

      writeRunSession({
        currentRun: nextRunWithWeeklyPoint,
        actionsToday: 0,
        expeditionCountToday: 0,
        isRestMode: false,
      });

      return {
        ...state,
        currentRun: nextRunWithWeeklyPoint,
        actionsToday: 0,
        expeditionCountToday: 0,
        isRestMode: false,
      };
    });
  },

  finishCurrentRun: () => {
    set((state) => {
      if (!state.currentRun) return state;
      if (!state.currentRun.pet.isFinalEvolution) return state;
      const currentRun = state.currentRun;

      const grade = calculateGrade({
        pet: currentRun.pet,
        failCount: currentRun.failCount,
        conditionCompletionRate: calculateConditionCompletionRate(
          currentRun.request.requiredConditions.map((condition) =>
            evaluateCondition(currentRun, condition),
          ),
        ),
        isRestMode: false,
      });

      const clearedRecord = createRunRecord(
        currentRun,
        "clear",
        grade,
        state.clearedRuns,
        state.restRuns,
      );

      const nextClearedRuns = [clearedRecord, ...state.clearedRuns];

      clearRunSession();
      writeClearedRunRecords(nextClearedRuns);

      return {
        ...state,
        currentRun: null,
        actionsToday: 0,
        expeditionCountToday: 0,
        isRestMode: false,
        clearedRuns: nextClearedRuns,
        latestResult: clearedRecord,
      };
    });
  },

  clearRun: () => {
    clearRunSession();

    set({
      currentRun: null,
      actionsToday: 0,
      expeditionCountToday: 0,
      isRestMode: false,
    });
  },

  resetRecords: () => {
    clearRunRecords();

    set({
      clearedRuns: [],
      restRuns: [],
      latestResult: null,
    });
  },

  dismissLatestResult: () => {
    set({
      latestResult: null,
    });
  },
}));
