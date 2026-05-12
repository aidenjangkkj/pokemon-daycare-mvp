import type { CareActionType, CareStat } from "../types/game";

export const INITIAL_STAT_VALUE = 70;

export const DAILY_DECAY: Record<CareStat, number> = {
  hunger: -12,
  cleanliness: -8,
  mood: -6,
  energy: -10,
};

export const CARE_ACTION_DELTAS: Record<
  CareActionType,
  Partial<Record<CareStat, number>>
> = {
  feedBerry: {
    hunger: 25,
    cleanliness: -5,
  },
  trainMove: {
    mood: 20,
    energy: -10,
  },
  brushCare: {
    cleanliness: 30,
    mood: 5,
  },
  rest: {
    energy: 30,
    hunger: -5,
  },
  expedition: {
    energy: -15,
    mood: 5,
  },
};

export const CARE_STATS: CareStat[] = [
  "hunger",
  "cleanliness",
  "mood",
  "energy",
];

export const MAX_ACTIONS_PER_DAY = 2;

export const MAX_EXPEDITION_PER_DAY = 1;

export const REST_MODE_FAIL_COUNT = 3;

export const GEN_1_MIN_ID = 1;

export const GEN_1_MAX_ID = 151;
