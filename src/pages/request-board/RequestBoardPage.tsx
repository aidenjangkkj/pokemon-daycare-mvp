import type {
  CleanlinessBand,
  FacilityLevel,
  FoodProfile,
} from "../../shared/constants/theme";
import type {
  MetaProgress,
  RequestCard,
  RunRecord,
  Theme,
} from "../../shared/types/game";
import type { DaycareEnvironment } from "../../entities/request/model/request.types";
import { Button as BitButton } from "@/components/ui/8bit/button";
import { Block } from "@/components/ui/8bit/block";
import {
  Card as BitCard,
  CardContent as BitCardContent,
  CardHeader as BitCardHeader,
  CardTitle as BitCardTitle,
} from "@/components/ui/8bit/card";
import { RecordsPage } from "../records/RecordsPage";

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
}: RequestBoardPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <BitCard className="max-w-[1448px] mx-auto" font="retro">
        <BitCardContent className="p-4">
        <h1 className="text-3xl font-bold">포켓몬 키우미 집 MVP</h1>
        <p className="mt-2">의뢰 게시판에서 알 의뢰 1건을 수락하세요.</p>
        <p className="mt-2">평판 {progress.reputation} / 운영 포인트 {progress.operationPoint} / 해금 Tier {progress.unlockTier}</p>
        <p className="mt-1">등록 종 수 {environment.registeredSpeciesIds.length} / 최근 10런 평균 실패 {environment.recentAverageFailCount.toFixed(2)}</p>
        </BitCardContent>
      </BitCard>

      <BitCard className="max-w-[1448px] mx-auto mt-3" font="retro">
        <BitCardContent className="p-4">
        <h2 className="text-2xl font-bold mb-3">의뢰 게시판</h2>

        {isLoading && <p>1세대 의뢰 후보를 불러오는 중입니다...</p>}

        {isError && (
          <section>
            <p className="text-red-300">의뢰 후보를 불러오지 못했습니다.</p>
            <p>{getErrorMessage(error)}</p>
            <BitButton type="button" font="retro" onClick={onRetry}>
              다시 불러오기
            </BitButton>
          </section>
        )}

        {!isLoading && !isError && requestCards.length === 0 && (
          <p>현재 해금 Tier에서 생성 가능한 의뢰가 없습니다. 기록을 쌓아 의뢰 풀을 확장하세요.</p>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {requestCards.map((card, index) => (
            <BitCard key={card.requestId} font="retro">
              <BitCardHeader>
                <BitCardTitle>알 의뢰 #{index + 1}</BitCardTitle>
              </BitCardHeader>
              <BitCardContent>
                <Block>이름: ???</Block>
                <Block>Species ID: {card.speciesId}</Block>
                <Block>예상 케어 수준: {card.estimatedCareLevel}</Block>
                <Block>기본 보상: {card.rewardBase}</Block>
                <ul className="list-disc pl-5 my-2">
                  {card.hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
                <BitButton type="button" font="retro" onClick={() => onStartRun(card.speciesId)}>
                  의뢰 수락
                </BitButton>
              </BitCardContent>
            </BitCard>
          ))}
        </section>
        </BitCardContent>
      </BitCard>

      <RecordsPage
        clearedRuns={clearedRuns}
        restRuns={restRuns}
        onResetRecords={onResetRecords}
      />
    </main>
  );
}
