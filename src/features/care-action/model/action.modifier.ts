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

const NORMAL_TYPE_MODIFIER: TypeActionModifierMap = {
  rest: { energy: 3 },
};

const FIRE_TYPE_MODIFIER: TypeActionModifierMap = {
  trainMove: { mood: 4, energy: -2 },
};

const GRASS_TYPE_MODIFIER: TypeActionModifierMap = {
  brushCare: { cleanliness: 6, mood: 2 },
};

const ICE_TYPE_MODIFIER: TypeActionModifierMap = {
  rest: { energy: 4 },
};

const FIGHTING_TYPE_MODIFIER: TypeActionModifierMap = {
  trainMove: { mood: 5, energy: -3 },
};

const POISON_TYPE_MODIFIER: TypeActionModifierMap = {
  feedBerry: { hunger: 3, mood: -2 },
};

const GROUND_TYPE_MODIFIER: TypeActionModifierMap = {
  trainMove: { energy: -4, mood: 2 },
};

const FLYING_TYPE_MODIFIER: TypeActionModifierMap = {
  expedition: { mood: 4 },
};

const PSYCHIC_TYPE_MODIFIER: TypeActionModifierMap = {
  trainMove: { mood: 4, energy: 2 },
};

const BUG_TYPE_MODIFIER: TypeActionModifierMap = {
  brushCare: { cleanliness: 4 },
};

const GHOST_TYPE_MODIFIER: TypeActionModifierMap = {
  rest: { energy: 2, mood: 2 },
};

const DRAGON_TYPE_MODIFIER: TypeActionModifierMap = {
  trainMove: { mood: 6, energy: -4 },
};

export const TYPE_ACTION_MODIFIER_MAP: Record<string, TypeActionModifierMap> = {
  normal: NORMAL_TYPE_MODIFIER,
  fire: FIRE_TYPE_MODIFIER,
  water: WATER_TYPE_MODIFIER,
  electric: ELECTRIC_TYPE_MODIFIER,
  grass: GRASS_TYPE_MODIFIER,
  ice: ICE_TYPE_MODIFIER,
  fighting: FIGHTING_TYPE_MODIFIER,
  poison: POISON_TYPE_MODIFIER,
  ground: GROUND_TYPE_MODIFIER,
  flying: FLYING_TYPE_MODIFIER,
  psychic: PSYCHIC_TYPE_MODIFIER,
  bug: BUG_TYPE_MODIFIER,
  rock: ROCK_TYPE_MODIFIER,
  ghost: GHOST_TYPE_MODIFIER,
  dragon: DRAGON_TYPE_MODIFIER,
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

export const ACTION_ITEM_MODIFIER_MAP: TypeActionModifierMap = {
  feedBerry: { hunger: 6 },
  trainMove: { mood: 3, energy: 2 },
  brushCare: { cleanliness: 6 },
  rest: { energy: 5 },
};
