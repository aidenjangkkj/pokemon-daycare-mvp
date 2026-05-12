import { describe, expect, it } from "vitest";
import {
  calculateRecentAverageFailCount,
  createEnvironmentWithProgressSignals,
} from "./meta.logic";
import type { DaycareEnvironment } from "../../request/model/request.types";
import type { RunRecord } from "../../../shared/types/game";

const baseEnvironment: DaycareEnvironment = {
  themePrimary: "forest",
  themeSecondary: null,
  facilityLevelByTheme: {
    forest: 1,
    shore: 0,
    volcano: 0,
    cave: 0,
    city: 0,
    sky: 0,
  },
  foodProfile: "balanced",
  cleanlinessBand: "mid",
  themeChangeCooldownTurns: 0,
  freeThemeChangeAvailable: false,
  recentSpeciesIds: [],
  registeredSpeciesIds: [],
  recentAverageFailCount: 0,
  hasRecentRestPenalty: false,
};

function createRecord(
  endedAt: string,
  grade: RunRecord["grade"],
  speciesId: number,
  failCount: number,
): RunRecord {
  return {
    runId: `${endedAt}-${speciesId}`,
    requestId: `req-${speciesId}`,
    speciesId,
    endedAt,
    endDay: 3,
    endType: grade === "Rest" ? "rest" : "clear",
    grade,
    failCount,
    averageStat: 60,
    finalStage: "final",
    reward: {
      currency: 10,
      operationPoint: 1,
      gradeMultiplier: 1,
      speciesRarityMultiplier: 1,
      evolutionStageMultiplier: 1,
      themeSynergyBonusMultiplier: 1,
      newDexCurrencyBonusMultiplier: 1,
      newDexOperationPointBonus: 0,
      isNewDex: false,
    },
    evolutionHistory: [speciesId],
  };
}

describe("calculateRecentAverageFailCount", () => {
  it("returns 0 for empty records", () => {
    expect(calculateRecentAverageFailCount([])).toBe(0);
  });
});

describe("createEnvironmentWithProgressSignals", () => {
  it("enables recent rest penalty when 2 of latest 3 are Rest", () => {
    const records = [
      createRecord("2026-05-13T10:00:00.000Z", "Rest", 10, 3),
      createRecord("2026-05-12T10:00:00.000Z", "A", 20, 0),
      createRecord("2026-05-11T10:00:00.000Z", "Rest", 30, 3),
    ];

    const nextEnvironment = createEnvironmentWithProgressSignals(
      baseEnvironment,
      [records[1]],
      [records[0], records[2]],
    );

    expect(nextEnvironment.hasRecentRestPenalty).toBe(true);
    expect(nextEnvironment.recentSpeciesIds).toEqual([10, 20, 30]);
  });
});
