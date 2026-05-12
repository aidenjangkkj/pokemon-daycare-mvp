import type { MetaProgress, RunRecord } from "../../../shared/types/game";
import type { DaycareEnvironment } from "../../request/model/request.types";

function getUniqueSpeciesIds(records: RunRecord[]): number[] {
  return Array.from(
    new Set(records.map((record) => record.speciesId)),
  ).sort((a, b) => a - b);
}

function calculateReputation(records: RunRecord[]): number {
  return records.reduce((sum, record) => {
    if (record.grade === "S") return sum + 3;
    if (record.grade === "A") return sum + 2;
    if (record.grade === "B") return sum + 1;

    return sum;
  }, 0);
}

function calculateOperationPoint(records: RunRecord[]): number {
  return records.reduce(
    (sum, record) => sum + (record.reward?.operationPoint ?? 0),
    0,
  );
}

export function calculateRecentAverageFailCount(
  records: RunRecord[],
  limit = 10,
): number {
  const recentRecords = records
    .slice()
    .sort(
      (a, b) =>
        new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
    )
    .slice(0, limit);

  if (recentRecords.length === 0) {
    return 0;
  }

  const totalFailCount = recentRecords.reduce(
    (sum, record) => sum + record.failCount,
    0,
  );

  return totalFailCount / recentRecords.length;
}

export function calculateUnlockTier(
  registeredSpeciesCount: number,
  recentAverageFailCount: number,
): 0 | 1 | 2 | 3 {
  if (registeredSpeciesCount >= 100 && recentAverageFailCount <= 1.5) {
    return 3;
  }

  if (registeredSpeciesCount >= 50) {
    return 2;
  }

  if (registeredSpeciesCount >= 15) {
    return 1;
  }

  return 0;
}

export function createMetaProgressFromRecords(
  clearedRuns: RunRecord[],
  restRuns: RunRecord[],
): MetaProgress {
  const records = [...clearedRuns, ...restRuns];
  const registeredSpeciesIds = getUniqueSpeciesIds(records);
  const recentAverageFailCount = calculateRecentAverageFailCount(records);

  return {
    reputation: calculateReputation(records),
    operationPoint: calculateOperationPoint(records),
    unlockTier: calculateUnlockTier(
      registeredSpeciesIds.length,
      recentAverageFailCount,
    ),
  };
}

export function createEnvironmentWithProgressSignals(
  environment: DaycareEnvironment,
  clearedRuns: RunRecord[],
  restRuns: RunRecord[],
): DaycareEnvironment {
  const records = [...clearedRuns, ...restRuns]
    .slice()
    .sort(
      (a, b) =>
        new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
    );

  const recent3Records = records.slice(0, 3);
  const recentRestCount = recent3Records.filter(
    (record) => record.grade === "Rest",
  ).length;

  return {
    ...environment,
    registeredSpeciesIds: getUniqueSpeciesIds(records),
    recentSpeciesIds: records.slice(0, 5).map((record) => record.speciesId),
    recentAverageFailCount: calculateRecentAverageFailCount(records),
    hasRecentRestPenalty:
      recent3Records.length >= 3 && recentRestCount >= 2,
  };
}
