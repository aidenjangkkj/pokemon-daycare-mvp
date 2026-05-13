import type { RunRecord } from "../../shared/types/game";
import { Button as BitButton } from "@/components/ui/8bit/button";
import { Block } from "@/components/ui/8bit/block";
import { Badge as BitBadge } from "@/components/ui/8bit/badge";
import {
  Card as BitCard,
  CardContent as BitCardContent,
  CardHeader as BitCardHeader,
  CardTitle as BitCardTitle,
} from "@/components/ui/8bit/card";
import styles from "./ResultModal.module.css";

interface ResultModalProps {
  record: RunRecord;
  onClose: () => void;
}

function getResultTitle(record: RunRecord): string {
  if (record.endType === "rest") {
    return "휴양 전환";
  }

  return "최종 진화 달성";
}

export function ResultModal({ record, onClose }: ResultModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <BitCard className={styles.modal} font="retro">
        <BitCardHeader>
          <BitCardTitle>{getResultTitle(record)}</BitCardTitle>
        </BitCardHeader>
        <BitCardContent>

        <BitBadge className={styles.badge} font="retro">등급 {record.grade}</BitBadge>

        <Block className={styles.summary}>
          <Block className={styles.row}>
            <span>Species ID</span>
            <strong>{record.speciesId}</strong>
          </Block>

          <Block className={styles.row}>
            <span>종료 일수</span>
            <strong>Day {record.endDay}</strong>
          </Block>

          <Block className={styles.row}>
            <span>실패 횟수</span>
            <strong>{record.failCount}회</strong>
          </Block>

          <Block className={styles.row}>
            <span>평균 상태</span>
            <strong>{record.averageStat.toFixed(1)}</strong>
          </Block>

          <Block className={styles.row}>
            <span>최종 단계</span>
            <strong>{record.finalStage}</strong>
          </Block>
        </Block>

        <h3>보상</h3>

        <Block className={styles.summary}>
          <Block className={styles.row}>
            <span>재화</span>
            <strong>{record.reward.currency}</strong>
          </Block>

          <Block className={styles.row}>
            <span>운영 포인트</span>
            <strong>{record.reward.operationPoint}</strong>
          </Block>

          <Block className={styles.row}>
            <span>등급 배율</span>
            <strong>x{record.reward.gradeMultiplier}</strong>
          </Block>

          <Block className={styles.row}>
            <span>신규 도감 보너스</span>
            <strong>{record.reward.isNewDex ? "적용" : "미적용"}</strong>
          </Block>
        </Block>

        <Block className={styles.actions}>
          <BitButton
            type="button"
            font="retro"
            className={styles.button}
            onClick={onClose}
          >
            확인
          </BitButton>
        </Block>
        </BitCardContent>
      </BitCard>
    </div>
  );
}
