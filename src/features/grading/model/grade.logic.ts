import type { Grade, PetState } from "../../../shared/types/game";
import { calculateAverageStat } from "../../../entities/run/model/run.logic";

interface CalculateGradeParams {
  pet: PetState;
  failCount: number;
  conditionCompletionRate: number;
  isRestMode: boolean;
}

export function calculateConditionCompletionRate(
  conditions: boolean[],
): number {
  if (conditions.length === 0) {
    return 1;
  }

  const satisfiedCount = conditions.filter(Boolean).length;
  return satisfiedCount / conditions.length;
}

export function calculateGrade(params: CalculateGradeParams): Grade {
  const { pet, failCount, conditionCompletionRate, isRestMode } = params;

  if (isRestMode) {
    return "Rest";
  }

  const averageStat = calculateAverageStat(pet);
  const completionPercent = conditionCompletionRate * 100;

  if (failCount === 0 && completionPercent >= 100 && averageStat >= 75) {
    return "S";
  }

  if (failCount <= 1 && completionPercent >= 100 && averageStat >= 60) {
    return "A";
  }

  if (completionPercent >= 70) {
    return "B";
  }

  return "Rest";
}
