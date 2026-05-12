import type {
  RequestCondition,
  RunState,
} from "../../../shared/types/game";
import type { PokemonSummary } from "../../../shared/types/pokemon";
import { calculateAverageStat } from "../../run/model/run.logic";

export function createRequiredConditions(
  pokemon: PokemonSummary,
): RequestCondition[] {
  const conditions: RequestCondition[] = [
    {
      id: "c-avg-60",
      description: "평균 상태 60 이상 유지",
      checker: "avgStat60",
    },
    {
      id: "c-fail-max-1",
      description: "실패 횟수 1회 이하",
      checker: "failCountMax1",
    },
  ];

  if (pokemon.turnsToHatch >= 40) {
    conditions.push({
      id: "c-energy-40",
      description: "종료 시 에너지 40 이상",
      checker: "energyEnd40",
    });
  }

  if (pokemon.hatchCounter >= 20) {
    conditions.push({
      id: "c-day-12",
      description: "12일 이내 종료",
      checker: "dayMax12",
    });
  }

  return conditions;
}

export function evaluateCondition(
  run: RunState,
  condition: RequestCondition,
): boolean {
  if (condition.checker === "avgStat60") {
    return calculateAverageStat(run.pet) >= 60;
  }

  if (condition.checker === "failCountMax1") {
    return run.failCount <= 1;
  }

  if (condition.checker === "dayMax12") {
    return run.day <= 12;
  }

  if (condition.checker === "energyEnd40") {
    return run.pet.energy >= 40;
  }

  return false;
}
