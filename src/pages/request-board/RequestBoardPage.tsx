import type {
  CleanlinessBand,
  FacilityLevel,
  FoodProfile,
} from "../../shared/constants/theme";
import {
  FOOD_PROFILE_LABEL_MAP,
  THEME_LABEL_MAP,
} from "../../shared/constants/theme";
import {
  CLEANLINESS_BAND_OPTIONS,
  FACILITY_LEVEL_OPTIONS,
  FOOD_PROFILE_OPTIONS,
  THEME_OPTIONS,
} from "../../shared/constants/ui";
import type {
  MetaProgress,
  RequestCard,
  RunRecord,
  Theme,
} from "../../shared/types/game";
import type { DaycareEnvironment } from "../../entities/request/model/request.types";
import { RecordsPage } from "../records/RecordsPage";
import styles from "./RequestBoardPage.module.css";

interface RequestBoardPageProps {
  environment: DaycareEnvironment;
  progress: MetaProgress;
  requestCards: RequestCard[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  clearedRuns: RunRecord[];
  restRuns: RunRecord[];
  onRetry: () => void;
  onStartRun: (speciesId: number) => void;
  onResetRecords: () => void;
  onSetThemePrimary: (theme: Theme) => void;
  onSetThemeSecondary: (theme: Theme | null) => void;
  onSetFoodProfile: (foodProfile: FoodProfile) => void;
  onSetCleanlinessBand: (cleanlinessBand: CleanlinessBand) => void;
  onSetFacilityLevel: (theme: Theme, level: FacilityLevel) => void;
  onResetEnvironment: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function parseFacilityLevel(value: string): FacilityLevel {
  const parsedValue = Number(value);

  if (
    FACILITY_LEVEL_OPTIONS.some(
      (facilityLevel) => facilityLevel === parsedValue,
    )
  ) {
    return parsedValue as FacilityLevel;
  }

  return 0;
}

export function RequestBoardPage({
  environment,
  progress,
  requestCards,
  isLoading,
  isError,
  error,
  clearedRuns,
  restRuns,
  onRetry,
  onStartRun,
  onResetRecords,
  onSetThemePrimary,
  onSetThemeSecondary,
  onSetFoodProfile,
  onSetCleanlinessBand,
  onSetFacilityLevel,
  onResetEnvironment,
}: RequestBoardPageProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>포켓몬 키우미 집 MVP</h1>
        <p className={styles.description}>
          의뢰 게시판에서 알 의뢰 1건을 수락하세요.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>도감 / 해금</h2>
        <p>등록 종 수: {environment.registeredSpeciesIds.length}</p>
        <p>
          최근 10런 평균 실패 횟수:{" "}
          {environment.recentAverageFailCount.toFixed(2)}
        </p>
        <p>
          최근 등장 종: {environment.recentSpeciesIds.join(" → ") || "없음"}
        </p>
        <p>평판: {progress.reputation}</p>
        <p>운영 포인트: {progress.operationPoint}</p>
        <p>해금 Tier: {progress.unlockTier}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>환경 운영</h2>

        <div className={styles.grid}>
          <label className={styles.label}>
            기본 테마
            <select
              className={styles.select}
              value={environment.themePrimary}
              onChange={(event) =>
                onSetThemePrimary(event.target.value as Theme)
              }
            >
              {THEME_OPTIONS.map((theme) => (
                <option key={theme} value={theme}>
                  {THEME_LABEL_MAP[theme]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            보조 테마
            <select
              className={styles.select}
              value={environment.themeSecondary ?? ""}
              onChange={(event) =>
                onSetThemeSecondary(
                  event.target.value
                    ? (event.target.value as Theme)
                    : null,
                )
              }
            >
              <option value="">없음</option>
              {THEME_OPTIONS.filter(
                (theme) => theme !== environment.themePrimary,
              ).map((theme) => (
                <option key={theme} value={theme}>
                  {THEME_LABEL_MAP[theme]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            먹이 프로필
            <select
              className={styles.select}
              value={environment.foodProfile}
              onChange={(event) =>
                onSetFoodProfile(event.target.value as FoodProfile)
              }
            >
              {FOOD_PROFILE_OPTIONS.map((foodProfile) => (
                <option key={foodProfile} value={foodProfile}>
                  {FOOD_PROFILE_LABEL_MAP[foodProfile]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            청결 밴드
            <select
              className={styles.select}
              value={environment.cleanlinessBand}
              onChange={(event) =>
                onSetCleanlinessBand(event.target.value as CleanlinessBand)
              }
            >
              {CLEANLINESS_BAND_OPTIONS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h3>시설 레벨</h3>

        <div className={styles.facilityGrid}>
          {THEME_OPTIONS.map((theme) => (
            <label key={theme} className={styles.label}>
              {THEME_LABEL_MAP[theme]}
              <select
                className={styles.select}
                value={environment.facilityLevelByTheme[theme]}
                onChange={(event) =>
                  onSetFacilityLevel(
                    theme,
                    parseFacilityLevel(event.target.value),
                  )
                }
              >
                {FACILITY_LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    Lv.{level}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={onResetEnvironment}
        >
          환경 초기화
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>의뢰 게시판</h2>

        {isLoading && (
          <p className={styles.statusText}>
            1세대 의뢰 후보를 불러오는 중입니다...
          </p>
        )}

        {isError && (
          <div>
            <p className={styles.errorText}>의뢰 후보를 불러오지 못했습니다.</p>
            <p>{getErrorMessage(error)}</p>
            <button type="button" className={styles.button} onClick={onRetry}>
              다시 불러오기
            </button>
          </div>
        )}

        {!isLoading && !isError && requestCards.length === 0 && (
          <p className={styles.statusText}>
            현재 해금 Tier에서 생성 가능한 의뢰가 없습니다. 기록을 쌓아
            의뢰 풀을 확장하세요.
          </p>
        )}

        <div className={styles.cardGrid}>
          {requestCards.map((card, index) => (
            <article key={card.requestId} className={styles.card}>
              <h3 className={styles.cardTitle}>알 의뢰 #{index + 1}</h3>
              <p>이름: ???</p>
              <p>Species ID: {card.speciesId}</p>
              <p>예상 케어 수준: {card.estimatedCareLevel}</p>
              <p>기본 보상: {card.rewardBase}</p>

              <ul className={styles.hintList}>
                {card.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>

              <button
                type="button"
                className={styles.button}
                onClick={() => onStartRun(card.speciesId)}
              >
                의뢰 수락
              </button>
            </article>
          ))}
        </div>
      </section>

      <RecordsPage
        clearedRuns={clearedRuns}
        restRuns={restRuns}
        onResetRecords={onResetRecords}
      />
    </main>
  );
}
