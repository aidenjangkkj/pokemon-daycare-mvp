import type {
  CareActionType,
  CareStat,
  PetState,
  Stage,
} from "../../../shared/types/game";

export interface ActionModifierContext {
  pet: PetState;
  action: CareActionType;
  consecutiveCount: number;
}

export type ActionDelta = Partial<Record<CareStat, number>>;

export type TypeActionModifierMap = Partial<
  Record<CareActionType, ActionDelta>
>;

export type StageEfficiencyMap = Record<Stage, number>;
