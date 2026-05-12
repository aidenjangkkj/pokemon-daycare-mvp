import type { Grade, RunReward } from "../../../shared/types/game";

const GRADE_MULTIPLIER_MAP: Record<Grade, number> = {
  S: 1.3,
  A: 1.1,
  B: 1,
  Rest: 0.6,
};

interface CalculateRunRewardParams {
  grade: Grade;
  baseCurrencyReward: number;
  baseOperationPointReward: number;
  isNewDex: boolean;
  speciesRarityMultiplier: number;
  evolutionStageMultiplier: number;
  themeSynergyBonusMultiplier: number;
  expeditionCurrencyMultiplier: number;
  expeditionOperationPointBonus: number;
}

export function calculateRunReward(
  params: CalculateRunRewardParams,
): RunReward {
  const {
    grade,
    baseCurrencyReward,
    baseOperationPointReward,
    isNewDex,
    speciesRarityMultiplier,
    evolutionStageMultiplier,
    themeSynergyBonusMultiplier,
    expeditionCurrencyMultiplier,
    expeditionOperationPointBonus,
  } = params;

  const gradeMultiplier = GRADE_MULTIPLIER_MAP[grade];
  const newDexCurrencyBonusMultiplier = isNewDex ? 1.15 : 1;
  const newDexOperationPointBonus = isNewDex ? 2 : 0;

  return {
    currency: Math.round(
      baseCurrencyReward *
        gradeMultiplier *
        speciesRarityMultiplier *
        evolutionStageMultiplier *
        themeSynergyBonusMultiplier *
        expeditionCurrencyMultiplier *
        newDexCurrencyBonusMultiplier,
    ),
    operationPoint:
      baseOperationPointReward +
      newDexOperationPointBonus +
      expeditionOperationPointBonus,
    gradeMultiplier,
    speciesRarityMultiplier,
    evolutionStageMultiplier,
    themeSynergyBonusMultiplier,
    newDexCurrencyBonusMultiplier,
    newDexOperationPointBonus,
    isNewDex,
  };
}
