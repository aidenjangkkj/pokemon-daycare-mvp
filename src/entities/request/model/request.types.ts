import type { RequestCard, Theme } from "../../../shared/types/game";
import type {
  CleanlinessBand,
  FacilityLevel,
  FoodProfile,
} from "../../../shared/constants/theme";
import type { PokemonSummary } from "../../../shared/types/pokemon";

export interface DaycareEnvironment {
  themePrimary: Theme;
  themeSecondary: Theme | null;
  facilityLevelByTheme: Record<Theme, FacilityLevel>;
  foodProfile: FoodProfile;
  cleanlinessBand: CleanlinessBand;
  themeChangeCooldownTurns: number;
  freeThemeChangeAvailable: boolean;
  recentSpeciesIds: number[];
  registeredSpeciesIds: number[];
  recentAverageFailCount: number;
  hasRecentRestPenalty: boolean;
}

export interface WeightedRequestCandidate {
  pokemon: PokemonSummary;
  weight: number;
  hints: string[];
  estimatedCareLevel: number;
  rewardBase: number;
  difficulty: number;
}

export type GeneratedRequestCard = RequestCard;
