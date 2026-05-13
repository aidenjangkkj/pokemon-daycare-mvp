import { THEME_TYPE_MAP } from "../../../shared/constants/theme";
import { clamp } from "../../../shared/utils/clamp";
import type {
  ExpeditionInput,
  ExpeditionResult,
} from "./expedition.types";

function hasThemeMatch(input: ExpeditionInput): boolean {
  const primaryTypes = THEME_TYPE_MAP[input.themePrimary];
  const secondaryTypes = input.themeSecondary
    ? THEME_TYPE_MAP[input.themeSecondary]
    : [];
  const themeTypes = [...primaryTypes, ...secondaryTypes];

  return input.pokemonTypes.some((type) => themeTypes.includes(type));
}

export function calculateExpeditionResult(
  input: ExpeditionInput,
): ExpeditionResult {
  const matchedTheme = hasThemeMatch(input);
  const energyPenalty = input.energy < 30 ? 0.15 : 0;
  const successChance = clamp(
    input.actionSuccessBase + (matchedTheme ? 0.2 : 0) - energyPenalty,
    0.05,
    0.95,
  );
  const success =
    input.mode === "direct"
      ? Boolean(input.miniGameSuccess)
      : Math.random() < successChance;

  const natureCurrencyBonus =
    input.natureDisposition === "active" ? 0.1 : 0;
  const natureItemBonus =
    input.natureDisposition === "stable" ? 0.1 : 0;
  const natureOperationBonus = input.natureDisposition === "stable" ? 1 : 0;

  return {
    successChance,
    success,
    bonusCurrencyMultiplier:
      (matchedTheme ? 1.1 : 1) * (1 + natureCurrencyBonus),
    bonusItemMultiplier:
      (matchedTheme ? 1.2 : 1) * (1 + natureItemBonus),
    bonusOperationPoint: natureOperationBonus,
  };
}
