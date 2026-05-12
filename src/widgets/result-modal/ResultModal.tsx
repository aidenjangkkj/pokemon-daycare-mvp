import type { RunRecord } from "../../shared/types/game";
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
      <section className={styles.modal}>
        <h2>{getResultTitle(record)}</h2>

        <div className={styles.badge}>등급 {record.grade}</div>

        <div className={styles.summary}>
          <div className={styles.row}>
            <span>Species ID</span>
            <strong>{record.speciesId}</strong>
          </div>

          <div className={styles.row}>
            <span>종료 일수</span>
            <strong>Day {record.endDay}</strong>
          </div>

          <div className={styles.row}>
            <span>실패 횟수</span>
            <strong>{record.failCount}회</strong>
          </div>

          <div className={styles.row}>
            <span>평균 상태</span>
            <strong>{record.averageStat.toFixed(1)}</strong>
          </div>

          <div className={styles.row}>
            <span>최종 단계</span>
            <strong>{record.finalStage}</strong>
          </div>
        </div>

        <h3>보상</h3>

        <div className={styles.summary}>
          <div className={styles.row}>
            <span>재화</span>
            <strong>{record.reward.currency}</strong>
          </div>

          <div className={styles.row}>
            <span>운영 포인트</span>
            <strong>{record.reward.operationPoint}</strong>
          </div>

          <div className={styles.row}>
            <span>등급 배율</span>
            <strong>x{record.reward.gradeMultiplier}</strong>
          </div>

          <div className={styles.row}>
            <span>신규 도감 보너스</span>
            <strong>{record.reward.isNewDex ? "적용" : "미적용"}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </section>
    </div>
  );
}
