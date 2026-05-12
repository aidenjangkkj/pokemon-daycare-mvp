import type { CareActionType, CareStat, Theme } from "../types/game";
import type {
  CleanlinessBand,
  FacilityLevel,
  FoodProfile,
} from "./theme";

export const THEME_OPTIONS: Theme[] = [
  "forest",
  "shore",
  "volcano",
  "cave",
  "city",
  "sky",
];

export const FOOD_PROFILE_OPTIONS: FoodProfile[] = [
  "balanced",
  "protein",
  "sweet",
  "fresh",
];

export const CLEANLINESS_BAND_OPTIONS: CleanlinessBand[] = [
  "low",
  "mid",
  "high",
];

export const FACILITY_LEVEL_OPTIONS: FacilityLevel[] = [0, 1, 2, 3];

export const CARE_ACTION_LABELS: Record<CareActionType, string> = {
  feedBerry: "열매 먹이기",
  trainMove: "기술 훈련",
  brushCare: "브러싱 케어",
  rest: "휴식 유도",
  expedition: "원정 보내기",
};

export const CARE_STAT_LABELS: Record<CareStat, string> = {
  hunger: "배고픔",
  cleanliness: "청결",
  mood: "기분",
  energy: "에너지",
};

export const CARE_STATS: CareStat[] = [
  "hunger",
  "cleanliness",
  "mood",
  "energy",
];

export const CARE_ACTIONS = Object.keys(
  CARE_ACTION_LABELS,
) as CareActionType[];
