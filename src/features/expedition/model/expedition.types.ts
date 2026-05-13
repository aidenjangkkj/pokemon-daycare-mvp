import type { NatureDisposition, Theme } from "../../../shared/types/game";

export type ExpeditionMode = "auto" | "direct";

export interface ExpeditionInput {
  mode: ExpeditionMode;
  actionSuccessBase: number;
  energy: number;
  pokemonTypes: string[];
  natureDisposition: NatureDisposition;
  themePrimary: Theme;
  themeSecondary: Theme | null;
  miniGameSuccess?: boolean;
}

export interface ExpeditionResult {
  successChance: number;
  success: boolean;
  bonusCurrencyMultiplier: number;
  bonusItemMultiplier: number;
  bonusOperationPoint: number;
}
