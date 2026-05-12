import type { NatureDisposition, Theme } from "../../../shared/types/game";

export interface ExpeditionInput {
  actionSuccessBase: number;
  energy: number;
  pokemonTypes: string[];
  natureDisposition: NatureDisposition;
  themePrimary: Theme;
  themeSecondary: Theme | null;
}

export interface ExpeditionResult {
  successChance: number;
  success: boolean;
  bonusCurrencyMultiplier: number;
  bonusOperationPoint: number;
}
