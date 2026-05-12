import { STORAGE_KEYS } from "../../../shared/constants/storage";
import type {
  Grade,
  RunRecord,
  RunReward,
  RunState,
} from "../../../shared/types/game";
import {
  readStorageJson,
  removeStorageItem,
  writeStorageJson,
} from "../../../shared/utils/storage";
import { normalizeRunState } from "./run.logic";

export interface StoredRunSession {
  currentRun: RunState | null;
  actionsToday: number;
  expeditionCountToday: number;
  isRestMode: boolean;
}

type LegacyRunRecord = Omit<RunRecord, "reward" | "evolutionHistory"> & {
  reward?: RunReward;
  evolutionHistory?: number[];
};

const FALLBACK_GRADE_MULTIPLIER_MAP: Record<Grade, number> = {
  S: 1.3,
  A: 1.1,
  B: 1,
  Rest: 0.6,
};

function createFallbackReward(record: LegacyRunRecord): RunReward {
  const gradeMultiplier = FALLBACK_GRADE_MULTIPLIER_MAP[record.grade] ?? 1;
  const baseCurrencyReward = record.endType === "clear" ? 20 : 10;
  const baseOperationPointReward = record.endType === "clear" ? 1 : 0;

  return {
    currency: Math.round(baseCurrencyReward * gradeMultiplier),
    operationPoint: baseOperationPointReward,
    gradeMultiplier,
    speciesRarityMultiplier: 1,
    evolutionStageMultiplier: 1,
    themeSynergyBonusMultiplier: 1,
    newDexCurrencyBonusMultiplier: 1,
    newDexOperationPointBonus: 0,
    isNewDex: false,
  };
}

function normalizeRunRecord(record: LegacyRunRecord): RunRecord {
  return {
    ...record,
    reward: record.reward ?? createFallbackReward(record),
    evolutionHistory: record.evolutionHistory ?? [record.speciesId],
  };
}

function readRunRecords(key: string): RunRecord[] {
  const records = readStorageJson<LegacyRunRecord[]>(key) ?? [];

  return records.map(normalizeRunRecord);
}

export function readRunSession(): StoredRunSession | null {
  const session = readStorageJson<StoredRunSession>(STORAGE_KEYS.currentRun);

  if (!session) {
    return null;
  }

  return {
    ...session,
    currentRun: session.currentRun
      ? normalizeRunState(session.currentRun)
      : null,
  };
}

export function writeRunSession(session: StoredRunSession): void {
  writeStorageJson(STORAGE_KEYS.currentRun, session);
}

export function clearRunSession(): void {
  removeStorageItem(STORAGE_KEYS.currentRun);
}

export function readClearedRunRecords(): RunRecord[] {
  const records = readRunRecords(STORAGE_KEYS.clearedRuns);

  writeClearedRunRecords(records);

  return records;
}

export function writeClearedRunRecords(records: RunRecord[]): void {
  writeStorageJson(STORAGE_KEYS.clearedRuns, records);
}

export function readRestRunRecords(): RunRecord[] {
  const records = readRunRecords(STORAGE_KEYS.restRuns);

  writeRestRunRecords(records);

  return records;
}

export function writeRestRunRecords(records: RunRecord[]): void {
  writeStorageJson(STORAGE_KEYS.restRuns, records);
}

export function clearRunRecords(): void {
  removeStorageItem(STORAGE_KEYS.clearedRuns);
  removeStorageItem(STORAGE_KEYS.restRuns);
}
