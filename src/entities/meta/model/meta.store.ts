import { create } from "zustand";
import type {
  CleanlinessBand,
  FacilityLevel,
  FoodProfile,
} from "../../../shared/constants/theme";
import { DEFAULT_FACILITY_LEVEL_BY_THEME } from "../../../shared/constants/theme";
import type { MetaProgress, RunRecord, Theme } from "../../../shared/types/game";
import type { DaycareEnvironment } from "../../request/model/request.types";
import {
  createEnvironmentWithProgressSignals,
  createMetaProgressFromRecords,
} from "./meta.logic";
import {
  clearMetaStorage,
  readMetaStorage,
  writeMetaStorage,
} from "./meta.storage";

interface EnvironmentStore {
  environment: DaycareEnvironment;
  progress: MetaProgress;
  hydrateEnvironmentFromStorage: () => void;
  syncProgressFromRecords: (
    clearedRuns: RunRecord[],
    restRuns: RunRecord[],
  ) => void;
  grantFreeThemeChange: () => void;
  tickThemeChangeCooldown: () => void;
  setThemePrimary: (theme: Theme) => void;
  setThemeSecondary: (theme: Theme | null) => void;
  setFoodProfile: (foodProfile: FoodProfile) => void;
  setCleanlinessBand: (cleanlinessBand: CleanlinessBand) => void;
  setFacilityLevel: (theme: Theme, level: FacilityLevel) => void;
  resetEnvironment: () => void;
}

const INITIAL_ENVIRONMENT: DaycareEnvironment = {
  themePrimary: "forest",
  themeSecondary: null,
  facilityLevelByTheme: DEFAULT_FACILITY_LEVEL_BY_THEME,
  foodProfile: "balanced",
  cleanlinessBand: "mid",
  themeChangeCooldownTurns: 0,
  freeThemeChangeAvailable: false,
  recentSpeciesIds: [],
  registeredSpeciesIds: [],
  recentAverageFailCount: 0,
  hasRecentRestPenalty: false,
};

const INITIAL_PROGRESS: MetaProgress = {
  reputation: 0,
  operationPoint: 0,
  unlockTier: 0,
};

interface ThemeChangePrerequisite {
  normalizedThemeSecondary?: Theme | null;
  requiresSecondaryUnlock?: boolean;
}

function getSafeEnvironment(
  environment: DaycareEnvironment | undefined,
): DaycareEnvironment {
  return {
    ...INITIAL_ENVIRONMENT,
    ...environment,
    facilityLevelByTheme: {
      ...INITIAL_ENVIRONMENT.facilityLevelByTheme,
      ...environment?.facilityLevelByTheme,
    },
    recentSpeciesIds: environment?.recentSpeciesIds ?? [],
    registeredSpeciesIds: environment?.registeredSpeciesIds ?? [],
    recentAverageFailCount: environment?.recentAverageFailCount ?? 0,
    themeChangeCooldownTurns: environment?.themeChangeCooldownTurns ?? 0,
    freeThemeChangeAvailable:
      environment?.freeThemeChangeAvailable ?? false,
    hasRecentRestPenalty: environment?.hasRecentRestPenalty ?? false,
  };
}

function getSafeProgress(
  progress: MetaProgress | undefined,
): MetaProgress {
  return {
    ...INITIAL_PROGRESS,
    ...progress,
    unlockTier: progress?.unlockTier ?? 0,
  };
}

function canApplyThemeChange(
  environment: DaycareEnvironment,
  progress: MetaProgress,
  prerequisite?: ThemeChangePrerequisite,
): boolean {
  if (environment.themeChangeCooldownTurns > 0) {
    return false;
  }

  if (
    prerequisite?.requiresSecondaryUnlock &&
    prerequisite.normalizedThemeSecondary &&
    progress.reputation < 3
  ) {
    return false;
  }

  return environment.freeThemeChangeAvailable || progress.operationPoint >= 1;
}

function consumeThemeChangeCost(
  progress: MetaProgress,
  isFree: boolean,
): MetaProgress {
  return {
    ...progress,
    operationPoint: isFree ? progress.operationPoint : progress.operationPoint - 1,
  };
}

export const useEnvironmentStore = create<EnvironmentStore>((set) => ({
  environment: INITIAL_ENVIRONMENT,
  progress: INITIAL_PROGRESS,

  hydrateEnvironmentFromStorage: () => {
    const storedMeta = readMetaStorage();

    if (!storedMeta) {
      return;
    }

    const safeEnvironment = getSafeEnvironment(storedMeta.environment);
    const safeProgress = getSafeProgress(storedMeta.progress);

    writeMetaStorage(safeEnvironment, safeProgress);

    set({
      environment: safeEnvironment,
      progress: safeProgress,
    });
  },

  syncProgressFromRecords: (clearedRuns, restRuns) => {
    set((state) => {
      const nextProgress = createMetaProgressFromRecords(
        clearedRuns,
        restRuns,
      );

      const nextEnvironment = createEnvironmentWithProgressSignals(
        getSafeEnvironment(state.environment),
        clearedRuns,
        restRuns,
      );

      writeMetaStorage(nextEnvironment, nextProgress);

      return {
        environment: nextEnvironment,
        progress: nextProgress,
      };
    });
  },

  grantFreeThemeChange: () => {
    set((state) => {
      const safeProgress = getSafeProgress(state.progress);
      const nextEnvironment: DaycareEnvironment = {
        ...getSafeEnvironment(state.environment),
        freeThemeChangeAvailable: true,
      };

      writeMetaStorage(nextEnvironment, safeProgress);

      return {
        environment: nextEnvironment,
        progress: safeProgress,
      };
    });
  },

  tickThemeChangeCooldown: () => {
    set((state) => {
      const safeProgress = getSafeProgress(state.progress);
      const safeEnvironment = getSafeEnvironment(state.environment);
      const nextEnvironment: DaycareEnvironment = {
        ...safeEnvironment,
        themeChangeCooldownTurns: Math.max(
          0,
          safeEnvironment.themeChangeCooldownTurns - 1,
        ),
      };

      writeMetaStorage(nextEnvironment, safeProgress);

      return {
        environment: nextEnvironment,
        progress: safeProgress,
      };
    });
  },

  setThemePrimary: (theme) => {
    set((state) => {
      const safeProgress = getSafeProgress(state.progress);
      const safeEnvironment = getSafeEnvironment(state.environment);

      if (safeEnvironment.themePrimary === theme) {
        return state;
      }

      if (!canApplyThemeChange(safeEnvironment, safeProgress)) {
        return state;
      }
      const isFree = safeEnvironment.freeThemeChangeAvailable;

      const nextEnvironment: DaycareEnvironment = {
        ...safeEnvironment,
        themePrimary: theme,
        themeSecondary:
          safeEnvironment.themeSecondary === theme
            ? null
            : safeEnvironment.themeSecondary,
        themeChangeCooldownTurns: 2,
        freeThemeChangeAvailable: false,
      };
      const nextProgress = consumeThemeChangeCost(safeProgress, isFree);

      writeMetaStorage(nextEnvironment, nextProgress);

      return {
        environment: nextEnvironment,
        progress: nextProgress,
      };
    });
  },

  setThemeSecondary: (theme) => {
    set((state) => {
      const safeProgress = getSafeProgress(state.progress);
      const safeEnvironment = getSafeEnvironment(state.environment);
      const normalizedTheme =
        theme === safeEnvironment.themePrimary ? null : theme;

      if (safeEnvironment.themeSecondary === normalizedTheme) {
        return state;
      }

      if (
        !canApplyThemeChange(safeEnvironment, safeProgress, {
          normalizedThemeSecondary: normalizedTheme,
          requiresSecondaryUnlock: true,
        })
      ) {
        return state;
      }
      const isFree = safeEnvironment.freeThemeChangeAvailable;

      const nextEnvironment: DaycareEnvironment = {
        ...safeEnvironment,
        themeSecondary: normalizedTheme,
        themeChangeCooldownTurns: 2,
        freeThemeChangeAvailable: false,
      };
      const nextProgress = consumeThemeChangeCost(safeProgress, isFree);

      writeMetaStorage(nextEnvironment, nextProgress);

      return {
        environment: nextEnvironment,
        progress: nextProgress,
      };
    });
  },

  setFoodProfile: (foodProfile) => {
    set((state) => {
      const safeProgress = getSafeProgress(state.progress);
      const nextEnvironment: DaycareEnvironment = {
        ...getSafeEnvironment(state.environment),
        foodProfile,
      };

      writeMetaStorage(nextEnvironment, safeProgress);

      return {
        environment: nextEnvironment,
        progress: safeProgress,
      };
    });
  },

  setCleanlinessBand: (cleanlinessBand) => {
    set((state) => {
      const safeProgress = getSafeProgress(state.progress);
      const nextEnvironment: DaycareEnvironment = {
        ...getSafeEnvironment(state.environment),
        cleanlinessBand,
      };

      writeMetaStorage(nextEnvironment, safeProgress);

      return {
        environment: nextEnvironment,
        progress: safeProgress,
      };
    });
  },

  setFacilityLevel: (theme, level) => {
    set((state) => {
      const safeProgress = getSafeProgress(state.progress);
      const nextEnvironment: DaycareEnvironment = {
        ...getSafeEnvironment(state.environment),
        facilityLevelByTheme: {
          ...getSafeEnvironment(state.environment).facilityLevelByTheme,
          [theme]: level,
        },
      };

      writeMetaStorage(nextEnvironment, safeProgress);

      return {
        environment: nextEnvironment,
        progress: safeProgress,
      };
    });
  },

  resetEnvironment: () => {
    clearMetaStorage();

    set({
      environment: INITIAL_ENVIRONMENT,
      progress: INITIAL_PROGRESS,
    });
  },
}));
