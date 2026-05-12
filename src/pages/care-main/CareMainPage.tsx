import type {
  CareActionType,
  CareStat,
  RunState,
} from "../../shared/types/game";
import type { PokemonSummary } from "../../shared/types/pokemon";
import {
  CARE_ACTION_LABELS,
  CARE_ACTIONS,
  CARE_STAT_LABELS,
  CARE_STATS,
} from "../../shared/constants/ui";
import { PixiPetStage } from "../../widgets/pixi-stage/PixiPetStage";
import styles from "./CareMainPage.module.css";

const EGG_IMAGE_SRC = "/assets/pokemon-egg.svg";

interface CareMainPageProps {
  currentRun: RunState;
  actionsToday: number;
  expeditionCountToday: number;
  isRestMode: boolean;
  pokemonSummary: PokemonSummary | undefined;
  isPokemonLoading: boolean;
  isPokemonError: boolean;
  pokemonError: unknown;
  onPerformAction: (action: CareActionType) => void;
  onEndDay: () => void;
  onFinishRun: () => void;
  onClearRun: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function getEvolutionHistoryText(currentRun: RunState): string {
  return currentRun.evolutionHistory.length > 0
    ? currentRun.evolutionHistory.join(" → ")
    : "없음";
}

export function CareMainPage({
  currentRun,
  actionsToday,
  expeditionCountToday,
  isRestMode,
  pokemonSummary,
  isPokemonLoading,
  isPokemonError,
  pokemonError,
  onPerformAction,
  onEndDay,
  onFinishRun,
  onClearRun,
}: CareMainPageProps) {
  const isEggStage = currentRun.pet.stage === "egg";
  const isFinalEvolution = currentRun.pet.isFinalEvolution;

  const displayImageSrc = isEggStage
    ? EGG_IMAGE_SRC
    : pokemonSummary?.spriteUrl ?? null;

  const displayImageAlt = isEggStage
    ? "포켓몬 알"
    : pokemonSummary?.localizedName ?? "포켓몬";

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>포켓몬 키우미 집 MVP</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>현재 의뢰</h2>

        {isPokemonLoading && (
          <p className={styles.statusText}>PokeAPI 조회 중...</p>
        )}

        {isPokemonError && (
          <p className={styles.errorText}>
            포켓몬 정보를 불러오지 못했습니다.{" "}
            {getErrorMessage(pokemonError)}
          </p>
        )}

        {pokemonSummary && (
          <div className={styles.petPanel}>
            {displayImageSrc && (
              <PixiPetStage
                imageSrc={displayImageSrc}
                alt={displayImageAlt}
                isPixelArt={!isEggStage}
              />
            )}

            <div className={styles.infoList}>
              <p>이름: {isEggStage ? "알" : pokemonSummary.localizedName}</p>
              <p>현재 계열 포켓몬: {pokemonSummary.localizedName}</p>
              <p>영문명: {pokemonSummary.name}</p>
              <p>타입: {pokemonSummary.types.join(" / ")}</p>
              <p>서식지: {pokemonSummary.habitat ?? "unknown"}</p>
              <p>부화 턴: {pokemonSummary.turnsToHatch}</p>

              {isFinalEvolution && (
                <p>
                  최종 진화 달성! 최종 진화체를 확인한 뒤 결과를 확인하세요.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>현재 런</h2>
        <p>Day: {currentRun.day}</p>
        <p>Species ID: {currentRun.pet.speciesId}</p>
        <p>Evolution Line: {currentRun.evolutionLineSpeciesIds.join(" → ")}</p>
        <p>Evolution History: {getEvolutionHistoryText(currentRun)}</p>
        <p>Stage: {currentRun.pet.stage}</p>
        <p>Fail Count: {currentRun.failCount}</p>
        <p>Weekly Care Point: {currentRun.weeklyCarePoint}</p>
        <p>Actions Today: {actionsToday} / 2</p>
        <p>Expedition Today: {expeditionCountToday} / 1</p>
        <p>휴양 모드: {isRestMode ? "진입" : "미진입"}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>상태값</h2>

        <ul className={styles.statList}>
          {CARE_STATS.map((stat: CareStat) => (
            <li key={stat}>
              {CARE_STAT_LABELS[stat]}: {currentRun.pet[stat]}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>액션</h2>

        {isFinalEvolution ? (
          <p className={styles.statusText}>
            최종 진화체 확인 중입니다. 결과 확인을 누르면 런이 종료됩니다.
          </p>
        ) : (
          <p className={styles.statusText}>
            알 단계에서는 휴식 유도만 적용됩니다.
          </p>
        )}

        <div className={styles.actionGrid}>
          {CARE_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              className={styles.button}
              disabled={isRestMode || isFinalEvolution}
              onClick={() => onPerformAction(action)}
            >
              {CARE_ACTION_LABELS[action]}
            </button>
          ))}
        </div>

        <div className={styles.buttonRow}>
          {isFinalEvolution ? (
            <button
              type="button"
              className={styles.button}
              onClick={onFinishRun}
            >
              결과 확인
            </button>
          ) : (
            <button
              type="button"
              className={styles.button}
              disabled={isRestMode}
              onClick={onEndDay}
            >
              하루 종료
            </button>
          )}

          <button
            type="button"
            className={styles.buttonDanger}
            onClick={onClearRun}
          >
            런 포기
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>히스토리</h2>

        <ul className={styles.historyList}>
          {currentRun.history.map((item, index) => (
            <li key={`${item.day}-${item.action}-${index}`}>
              Day {item.day} - {CARE_ACTION_LABELS[item.action]}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
