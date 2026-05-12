import type { TypeActionModifierMap } from "./action.types";

export const STAGE_EFFICIENCY_MAP = {
  egg: 1,
  juvenile: 1,
  final: 0.85,
} as const;

export const CONSECUTIVE_ACTION_PENALTY_MULTIPLIER = 0.8;

const WATER_TYPE_MODIFIER: TypeActionModifierMap = {
  brushCare: {
    cleanliness: 10,
  },
};

const ELECTRIC_TYPE_MODIFIER: TypeActionModifierMap = {
  trainMove: {
    energy: 5,
  },
};

const ROCK_TYPE_MODIFIER: TypeActionModifierMap = {
  trainMove: {
    energy: -5,
  },
};

export const TYPE_ACTION_MODIFIER_MAP: Record<string, TypeActionModifierMap> = {
  water: WATER_TYPE_MODIFIER,
  electric: ELECTRIC_TYPE_MODIFIER,
  rock: ROCK_TYPE_MODIFIER,
};

export const NATURE_ACTION_MODIFIER_MAP: Record<
  string,
  TypeActionModifierMap
> = {
  active: {
    trainMove: { mood: 5 },
  },
  stable: {
    rest: { energy: 5 },
  },
  balanced: {},
};
