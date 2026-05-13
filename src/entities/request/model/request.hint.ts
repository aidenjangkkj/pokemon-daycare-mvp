import type { PokemonSummary } from "../../../shared/types/pokemon";

function formatHabitat(habitat: string | null): string {
  return habitat ?? "unknown";
}

function getHatchDifficultyLabel(turnsToHatch: number): string {
  if (turnsToHatch <= 20) {
    return "낮음";
  }

  if (turnsToHatch <= 40) {
    return "보통";
  }

  return "높음";
}

export function createRequestHints(pokemon: PokemonSummary): string[] {
  return [
    `타입 단서: ${pokemon.types.join(" / ")}`,
    `서식 단서: ${formatHabitat(pokemon.habitat)}`,
    `부화 부담도: ${getHatchDifficultyLabel(pokemon.turnsToHatch)}`,
  ];
}

export function createProgressiveRequestHints(
  pokemon: PokemonSummary,
  registeredSpeciesCount: number,
): string[] {
  const hints = createRequestHints(pokemon);

  if (registeredSpeciesCount >= 15) {
    hints.push(`키 단서: ${pokemon.height}`);
    hints.push(`몸무게 단서: ${pokemon.weight}`);
  }

  if (registeredSpeciesCount >= 50) {
    hints.push("진화 단계 단서: 기본형");
  }

  return hints;
}
