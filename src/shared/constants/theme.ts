import type { Theme } from "../types/game";

export type FoodProfile = "balanced" | "protein" | "sweet" | "fresh";

export type CleanlinessBand = "low" | "mid" | "high";

export type FacilityLevel = 0 | 1 | 2 | 3;

export const THEME_TYPE_MAP: Record<Theme, string[]> = {
  forest: ["bug", "grass", "poison"],
  shore: ["water", "electric", "ice"],
  volcano: ["fire", "rock", "ground"],
  cave: ["rock", "ground", "poison", "ghost"],
  city: ["normal", "psychic", "electric"],
  sky: ["flying", "dragon", "normal"],
};

export const THEME_LABEL_MAP: Record<Theme, string> = {
  forest: "숲",
  shore: "수변",
  volcano: "화산",
  cave: "동굴",
  city: "도심",
  sky: "하늘",
};

export const FOOD_PROFILE_LABEL_MAP: Record<FoodProfile, string> = {
  balanced: "균형식",
  protein: "단백질식",
  sweet: "달콤식",
  fresh: "신선식",
};

export const FOOD_PROFILE_TYPE_MAP: Record<FoodProfile, string[]> = {
  balanced: [],
  protein: ["fighting", "rock", "ground"],
  sweet: ["fairy", "normal", "psychic"],
  fresh: ["water", "grass", "ice"],
};

export const DEFAULT_FACILITY_LEVEL_BY_THEME: Record<Theme, FacilityLevel> = {
  forest: 1,
  shore: 0,
  volcano: 0,
  cave: 0,
  city: 0,
  sky: 0,
};
