import type {
  Grade,
  RunRecord,
  RunReward,
} from "../../shared/types/game";
import { Button as BitButton } from "@/components/ui/8bit/button";
import { Block } from "@/components/ui/8bit/block";
import { Card as BitCard, CardContent as BitCardContent, CardHeader as BitCardHeader, CardTitle as BitCardTitle } from "@/components/ui/8bit/card";
import styles from "./RecordsPage.module.css";

interface RecordsPageProps {
  clearedRuns: RunRecord[];
  restRuns: RunRecord[];
  onResetRecords: () => void;
}

const FALLBACK_GRADE_MULTIPLIER_MAP: Record<Grade, number> = {
  S: 1.3,
  A: 1.1,
  B: 1,
  Rest: 0.6,
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ko-KR");
}

function getSafeReward(record: RunRecord): RunReward {
  if (record.reward) {
    return record.reward;
  }

  const gradeMultiplier = FALLBACK_GRADE_MULTIPLIER_MAP[record.grade] ?? 1;
  const baseCurrencyReward = record.endType === "clear" ? 20 : 10;
  const baseOperationPointReward = record.endType === "clear" ? 1 : 0;

  return {
    currency: Math.round(baseCurrencyReward * gradeMultiplier),
    operationPoint: baseOperationPointReward,
    gradeMultiplier,
    speciesRarityMultiplier: 1,
    evolutionStageMultiplier: 1,
    themeSynergyBonusMultiplier: 1,
    newDexCurrencyBonusMultiplier: 1,
    newDexOperationPointBonus: 0,
    isNewDex: false,
  };
}

function getEvolutionHistoryText(record: RunRecord): string {
  const evolutionHistory = record.evolutionHistory?.length
    ? record.evolutionHistory
    : [record.speciesId];

  return evolutionHistory.join(" → ");
}

function RunRecordList({
  title,
  records,
}: {
  title: string;
  records: RunRecord[];
}) {
  return (
    <section>
      <h3 className={styles.subTitle}>{title}</h3>

      {records.length === 0 ? (
        <p className={styles.empty}>아직 기록이 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {records.map((record) => {
            const reward = getSafeReward(record);

            return (
              <li key={`${record.runId}-${record.endedAt}`}>
                <Block>
                  Species #{record.speciesId} / 등급 {record.grade} / Day{" "}
                  {record.endDay} / 실패 {record.failCount}회 / 평균 상태{" "}
                  {record.averageStat.toFixed(1)} / 진화 이력{" "}
                  {getEvolutionHistoryText(record)} / 재화 {reward.currency} /
                  운영 포인트 {reward.operationPoint} /{" "}
                  {formatDateTime(record.endedAt)}
                </Block>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function RecordsPage({
  clearedRuns,
  restRuns,
  onResetRecords,
}: RecordsPageProps) {
  return (
    <BitCard className={styles.section} font="retro">
      <BitCardHeader>
        <BitCardTitle className={styles.title}>기록</BitCardTitle>
      </BitCardHeader>
      <BitCardContent>

      <BitButton
        type="button"
        font="retro"
        className={styles.button}
        onClick={onResetRecords}
      >
        기록 초기화
      </BitButton>

      <RunRecordList title="클리어 기록" records={clearedRuns} />
      <RunRecordList title="휴양 전환 기록" records={restRuns} />
      </BitCardContent>
    </BitCard>
  );
}
