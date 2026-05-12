export type Grade = "S" | "A" | "B" | "Rest";

export type Stage = "egg" | "juvenile" | "final";

export type Theme =
  | "forest"
  | "shore"
  | "volcano"
  | "cave"
  | "city"
  | "sky";

export type CareStat =
  | "hunger"
  | "cleanliness"
  | "mood"
  | "energy";

export type CareActionType =
  | "feedBerry"
  | "trainMove"
  | "brushCare"
  | "rest"
  | "expedition";

export type RunEndType = "clear" | "rest";
export type NatureDisposition = "active" | "stable" | "balanced";

export interface RequestCondition {
  id: string;
  description: string;
  checker: "avgStat60" | "failCountMax1" | "dayMax12" | "energyEnd40";
}

export interface ExpeditionLog {
  day: number;
  successChance: number;
  success: boolean;
  bonusCurrencyMultiplier: number;
  bonusOperationPoint: number;
}

export interface PetState {
  pokemonId: number;
  speciesId: number;
  types: string[];
  natureId: number;
  natureName: string;
  natureDisposition: NatureDisposition;
  stage: Stage;
  isFinalEvolution: boolean;
  hunger: number;
  cleanliness: number;
  mood: number;
  energy: number;
}

export interface RequestCard {
  requestId: string;
  speciesId: number;
  hints: string[];
  estimatedCareLevel: number;
  rewardBase: number;
  difficulty: number;
}

export interface RunHistory {
  day: number;
  action: CareActionType;
  delta: Partial<Record<CareStat, number>>;
}

export interface RunState {
  runId: string;
  day: number;
  failCount: number;
  weeklyCarePoint: number;
  request: {
    requestId: string;
    speciesId: number;
    requiredConditions: RequestCondition[];
    difficulty: number;
  };
  pet: PetState;
  history: RunHistory[];
  evolutionLineSpeciesIds: number[];
  evolutionHistory: number[];
  turnsToHatch: number;
  expeditionLogs: ExpeditionLog[];
}

export interface RunReward {
  currency: number;
  operationPoint: number;
  gradeMultiplier: number;
  speciesRarityMultiplier: number;
  evolutionStageMultiplier: number;
  themeSynergyBonusMultiplier: number;
  newDexCurrencyBonusMultiplier: number;
  newDexOperationPointBonus: number;
  isNewDex: boolean;
}

export interface RunRecord {
  runId: string;
  requestId: string;
  speciesId: number;
  endedAt: string;
  endDay: number;
  endType: RunEndType;
  grade: Grade;
  failCount: number;
  averageStat: number;
  finalStage: Stage;
  reward: RunReward;
  evolutionHistory: number[];
}

export interface MetaProgress {
  reputation: number;
  operationPoint: number;
  unlockTier: 0 | 1 | 2 | 3;
}
