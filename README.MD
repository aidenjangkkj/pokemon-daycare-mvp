# PokeAPI 기반 포켓몬 키우미 집 게임 (MVP)

## 1) 프로젝트 개요
- 장르: 다마고치형 육성/수집 게임
- 컨셉: 플레이어는 트레이너가 아니라 `키우미 집 주인`
- 시작점: 모든 육성은 `알`에서 시작
- 핵심: 포켓몬 직접 선택 대신, 의뢰/환경 운영으로 유입 확률을 조정

### 컨셉 가드레일
- 본 게임은 `키우미 집` 기반의 `힐링형 육성`을 최우선으로 한다.
- 의뢰/환경/아이템/보상 시스템은 힐링 톤을 벗어나지 않도록 설계한다.

## 2) MVP 범위
- 1세대 한정: 전국도감 `#1~#151`
- 의뢰/진화/도감 집계 모두 1세대만 사용
- 1런 = 1포켓몬

### 클리어 구조
- 1차 클리어: 개체 단위 `최종 진화 달성`
- 장기 목표: 1세대 종/진화체 컬렉션 확장

## 3) 게임 루프
1. 의뢰 게시판에서 알 의뢰 1건 수락
2. 알 부화 진행 (`hatch_counter` 기반)
3. 매 턴 액션 선택(돌봄/원정) + 상태값 관리
4. 진화 조건 충족 시 진화 판정
5. 최종 진화 달성 또는 휴양 전환 후 기록 저장

## 4) 핵심 규칙

### 시간/턴
- 1턴 = 게임 내 1일
- 턴 종료 시 자연 감소 적용

### 상태값
- `hunger`, `cleanliness`, `mood`, `energy`: 0~100
- 초기값: 모두 70

### 일일 자연 감소
- `hunger -12`
- `cleanliness -8`
- `mood -6`
- `energy -10`

### 액션 (하루 2회)
- 열매 먹이기: `hunger +25`, `cleanliness -5`
- 기술 훈련: `mood +20`, `energy -10`
- 브러싱 케어: `cleanliness +30`, `mood +5`
- 휴식 유도: `energy +30`, `hunger -5`
- 원정 보내기: `energy -15`, `mood +5` + 탐험 보상

### 실패/휴양 전환
- 턴 종료 후 상태값 중 하나라도 0이면 `failCount +1`
- `failCount` 3회 누적 시 `휴양 모드` 전환

## 5) 액션 고도화

### 타입 보정 (`pokemon.types`)
- 타입별 보정 적용 (1세대 15타입)
- 예: 물(브러싱 +10), 전기(훈련 에너지 소모 완화), 바위(훈련 소모 증가)

### 성향 보정 (`nature`)
- 예: 공격 성향 훈련 보정 +, 신중 성향 휴식 보정 +

### 단계 보정 (`stage`)
- 알 단계: `휴식 유도`만 가능
- 유체(`juvenile`): 100%
- 진화체(`final`): 85%

### 연속 행동 보정
- 동일 액션 2턴 이상 연속 시 효율 `*0.8`
- 다른 액션 1회 수행 시 리셋

### 실아이템 매핑 (액션 보정)
- 열매 먹이기: `oran-berry`, `sitrus-berry`
- 기술 훈련: `x-attack`, `x-speed`
- 브러싱 케어: `soothe-bell`, `lava-cookie`
- 휴식 유도: `full-heal`, `chesto-berry`

## 6) 원정 시스템

### 실행 방식
- 자동 원정: 즉시 결과 계산
- 직접 원정: 미니게임 완료 후 결과 계산

### 보상 구조
- 기본 보상: 운영 포인트 또는 아이템 1개
- 추가 보상: 타입/성향/테마 일치 시 희귀 보상 확률 증가

### 보정 규칙
- 타입/테마 일치: 보상 가중치 `+20%`
- 성향 보정: 활동 성향은 재화 보상 `+10%`, 안정 성향은 아이템 보상 `+10%`
- `energy < 30`이면 원정 성공 보정 `-15%`
- 원정은 하루 최대 1회로 강제 (`expeditionCountPerDay <= 1`)

## 7) 환경 운영 시스템

### 환경 변수
- `themePrimary`, `themeSecondary`
- `facilityLevelByTheme` (0~3)
- `foodProfile` (`balanced`/`protein`/`sweet`/`fresh`)
- `cleanlinessBand` (`low`/`mid`/`high`)

### 테마 매핑
- 숲: `bug/grass/poison`
- 수변: `water/electric/ice`
- 화산: `fire/rock/ground`
- 동굴: `rock/ground/poison/ghost`
- 도심: `normal/psychic/electric`
- 하늘: `flying/dragon/normal`

### 테마 운영 규칙
- 기본 테마 1개 필수
- 평판 3 이상 시 보조 테마 1개 활성
- 변경 비용: 운영 포인트 1
- 변경 쿨다운: 2턴
- 의뢰 수락 직후 1회 무료 변경

## 8) 의뢰/해금 시스템

### 해금 원칙
- 플레이어 직접 선택 없음
- `의뢰 풀` 확장 방식
- 전설/환상 제외 (`is_legendary`, `is_mythical`)

### 해금 Tier
- Tier 0: 초기 공개
- Tier 1: 도감 15종
- Tier 2: 도감 50종
- Tier 3: 도감 100종 + 최근 10런 평균 실패 카운트 1.5 이하

### 도감 등록/해금 조건
- 도감 종 등록 기준: 해당 `speciesId`로 런 종료 시 1회 등록
- 런 종료 유형: `최종 진화 클리어` 또는 `휴양 전환` 모두 등록 인정
- 중복 처리: 이미 등록된 `speciesId`는 등록 수 증가 없음
- 도감 카운트: 고유 `speciesId` 개수 기준으로 계산
- 진화체 기록: 종 등록과 별도로 `진화 단계 이력`을 저장(수집 화면 표시용)

### 의뢰 가중치 공식
- `finalWeight = baseWeight * themeWeight * facilityWeight * foodWeight * cleanWeight * duplicatePenalty * missingBonus * conditionAdjust`
- 최종 clamp: `0.1 ~ 3.0`

### 배수 요약
- `themeWeight`: 1.0 / 1.25 / 1.40
- `facilityWeight`: `1 + (level * 0.05)` (max 1.15)
- `foodWeight`: 일치 1.10 / 비일치 1.0
- `cleanWeight`: high 1.10 / mid 1.00 / low 0.90
- `duplicatePenalty`: 최근 5회 등장 시 0.60
- `missingBonus`: 미획득 종 1.30
- `conditionAdjust`: 실패 누적 2+ 시 희귀군 0.85, 일반군 1.10

### 의뢰 생성 절차
1. 후보군 필터링(1세대 + 해금 Tier)
2. 가중치 계산/정규화
3. 중복 없는 3건 샘플링
4. 힌트 부착 후 게시

### 의뢰 힌트
- 수락 전 이름 비공개
- 기본: 타입 + 서식(`pokemon-species.habitat`)
- 진행도에 따라 키/무게/진화 단계 힌트 추가

### 의뢰 부담도
- `difficulty = hatch_counter_weight + evolution_depth_weight + rarity_weight`

## 9) 평판/보상/등급

### 평판
- `S +3`, `A +2`, `B +1`, `휴양 전환 +0`

### 의뢰 평점 (`requestRating`)
- 런 종료 시 `S/A/B/Rest` 기록
- 최근 3회 중 `Rest` 2회 이상이면 일반군 가중치 +10%

### 보상
- `reward = baseRewardByTier * gradeMultiplier`
- `S 1.3`, `A 1.1`, `B 1.0`, `휴양 전환 0.6`

### 포켓몬 차등 보상
- `speciesRarityMultiplier`: common 1.0 / uncommon 1.2 / rare 1.5
- `evolutionStageMultiplier`: 최종 진화 +20% / 단일 진화 +10%
- `newDexBonus`: 신규 등록 시 운영 포인트 +2 + 재화 +15%
- `themeSynergyBonus`: 테마-타입 일치 시 재화 +10%
- `finalCurrencyReward = baseCurrencyReward * gradeMultiplier * speciesRarityMultiplier * evolutionStageMultiplier * themeSynergyBonus * newDexCurrencyBonusMultiplier`
- `finalOperationPointReward = baseOperationPointReward + newDexOperationPointBonus`
- 신규 등록 시: `newDexCurrencyBonusMultiplier=1.15`, `newDexOperationPointBonus=2`
- 기존 등록 종: `newDexCurrencyBonusMultiplier=1.0`, `newDexOperationPointBonus=0`

### 등급 기준
- `S`: failCount 0, 요구조건 충족률 100%, 평균 상태 75+
- `A`: failCount 1 이하, 요구조건 충족률 100%, 평균 상태 60+
- `B`: 요구조건 충족률 70%+
- `휴양 전환`: failCount 3 도달

### 요구조건 충족률 계산
- 의뢰별 `requiredConditions[]`를 기준으로 계산
- `conditionCompletionRate = satisfiedConditionCount / totalConditionCount`
- 등급 산정에는 백분율 값(`conditionCompletionRate * 100`) 사용

## 10) PokeAPI 연동

### 사용 엔드포인트
- `GET /pokemon/{id}`
- `GET /pokemon-species/{id}`
- `GET /evolution-chain/{id}`
- `GET /nature/{id}`
- `GET /item/{id}`

### 캐싱 정책
- 로컬 캐시 우선
- 키: `pokemon:{id}`, `species:{id}`, `evolution-chain:{id}`
- TTL: 24시간
- 네트워크 실패 시 마지막 캐시 폴백

### 필드 매핑 핵심
- 기본: `id`, `name`, `types`, `stats`, `species`
- 종: `is_baby`, `is_legendary`, `is_mythical`, `egg_groups`, `hatch_counter`, `evolution_chain`, `habitat`
- 진화: `chain`, `evolution_details`
- 스프라이트: `sprites.*`
- 한글화: `names[]`, `genera[]`, `flavor_text_entries[]`에서 `language.name == "ko"`

### 폴백
- 한글 없으면 영문
- animated 스프라이트 없으면 `front_default`
- `turnsToHatch = hatch_counter * 2`

### PokeAPI 범위 밖 (로컬 구현)
- 상태값/경제/평판/점수/의뢰 평점
- 실아이템 효과 매핑 수치
- VFX/연출

## 11) 데이터 스키마

### 기본 상태
```json
{
  "runId": "string",
  "day": 1,
  "failCount": 0,
  "request": { "requestId": "string", "speciesId": 1 },
  "pet": {
    "pokemonId": 1,
    "speciesId": 1,
    "stage": "egg",
    "isFinalEvolution": false,
    "hunger": 70,
    "cleanliness": 70,
    "mood": 70,
    "energy": 70
  },
  "history": []
}
```

### 추가 저장 키
- `current_run`
- `cleared_runs`
- `rest_runs`
- `inventory`
- `meta_progress`

## 12) UI/아트 가이드

### 레퍼런스
- Pokémon Sleep
- Animal Crossing: Pocket Camp
- Tamagotchi 계열 UI
- Pokédex/박스형 정보 패턴

### 아트 원칙
- 포켓몬 스프라이트: PokeAPI 사용
- 배경/패널/아이콘/UI 스타일: 오리지널 제작

### 화면 범위 (MVP)
1. 의뢰 게시판: 의뢰 3건, 힌트, 예상 케어 수준, 보상
2. 육성 메인: 상태값, 스프라이트, 액션, 주간 케어 포인트, 테마/쿨다운
3. 결과 모달: 진화/휴양 전환/등급(S/A/B), 변화량/원인
4. 기록 화면: 클리어/휴양 기록, 등급 배지, 수집률, 육성 일수

### UI 공통 규칙
- 결과 모달/기록/의뢰 상세에서 동일 등급 배지 사용
- 액션 직후 300~600ms 피드백
- 한 손 조작 가능한 하단 액션 바

## 13) 육성 미니게임 아이디어
1. 열매 리듬 탭 (열매 먹이기)
2. 브러싱 방향 맞추기 (브러싱 케어)
3. 기술 타이밍 트레이닝 (기술 훈련)
4. 휴식 호흡 맞추기 (휴식 유도)
5. 원정 경로 선택 (원정)

### 적용 규칙
- 미니게임은 선택형(강제 아님)
- 실패 패널티 없음, 성공 보너스만 제공
- 하루 2회 액션 제한 동일 적용

## 14) 구현 스택 (고정)
- Frontend: `React + TypeScript + Vite`
- Game Rendering: `PixiJS` (React UI 하이브리드)
- Styling: `CSS Modules` (MVP 권장)
- State: `Zustand`
- Data Fetch: `TanStack Query`
- Storage: `LocalStorage` (MVP)
- Test: `Vitest + Testing Library`

## 15) 타입 명세 (초안)
```ts
type Grade = "S" | "A" | "B" | "Rest";
type Stage = "egg" | "juvenile" | "final";
type Theme = "forest" | "shore" | "volcano" | "cave" | "city" | "sky";

interface RequestCard {
  requestId: string;
  speciesId: number;
  hints: string[];
  estimatedCareLevel: number;
  rewardBase: number;
}

interface PetState {
  pokemonId: number;
  speciesId: number;
  stage: Stage;
  isFinalEvolution: boolean;
  hunger: number;
  cleanliness: number;
  mood: number;
  energy: number;
}

interface RunState {
  runId: string;
  day: number;
  failCount: number;
  weeklyCarePoint: number;
  request: { requestId: string; speciesId: number };
  pet: PetState;
  history: Array<{ day: number; action: string; delta: Record<string, number> }>;
}

interface MetaProgress {
  reputation: number;
  operationPoint: number;
  unlockTier: 0 | 1 | 2 | 3;
}
```

## 16) 구현 순서 (MVP)
1. 프로젝트 골격 + 타입/상태 계약
2. PokeAPI 클라이언트 + 캐시 구현
3. 1세대 시드/해금 Tier 계산기
4. 의뢰 생성 엔진 + 힌트 생성
5. 환경/테마/시설/먹이/청결 로직
6. 육성 루프(액션/감소/실패/진화)
7. 아이템/타입/성향/연속행동 보정
8. UI 4개 화면 구현
9. 저장/복구 + 검증

## 17) MVP 완료 기준
1. 의뢰 수락→부화→진화→종료 1사이클 가능
2. 상태값/실패 카운트 계산 정확
3. 의뢰 가중치 및 환경 보정 의도대로 동작
4. 한글/스프라이트 폴백 정상
5. 저장/복구 정상
6. 결과 등급(`S/A/B/휴양 전환`) 일관 표시
7. 도감/기록 누적 정상
8. 1세대 제한 준수
9. 주간 케어 포인트 UI-로직 일치

## 18) 비영리 운영 원칙
- 비공식 팬프로젝트(공식 제휴/승인 아님)
- 유료 결제/광고/후원 유도 없음
- 권리자 요청 시 즉시 대응 가능 구조 유지

## 19) 수집 이후 콘텐츠 (엔드게임)
1. 마스터 컬렉션 보드
2. 재육성 챌린지 의뢰
3. 육성 스타일 도감
4. 유산 시스템(메타 진행)
5. 비경쟁 시즌 목표

## 20) 실서비스 확장 대비
1. 법적 리스크 대응 체계
2. 서버/DB 아키텍처 전환
3. 인증/계정 복구
4. 캐시 이중화
5. 밸런스 운영 도구
6. 세대 확장용 콘텐츠 파이프라인
7. 자동화 테스트/관측성
8. 보안/무결성
9. 운영 콘솔
10. 지표 기반 개선 루프
