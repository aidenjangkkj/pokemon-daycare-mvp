import type { CareActionType, RunState, Theme } from "../../shared/types/game";
import type { PokemonSummary } from "../../shared/types/pokemon";
import type { DaycareEnvironment } from "../../entities/request/model/request.types";
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
import { PixiPetStage } from "../../widgets/pixi-stage/PixiPetStage";
import { StatusPanel } from "../../widgets/status-panel/StatusPanel";
import { Block } from "@/components/ui/8bit/block";
import { Button as BitButton } from "@/components/ui/8bit/button";
import {
  Card as BitCard,
  CardContent as BitCardContent,
} from "@/components/ui/8bit/card";
import {
  Select as BitSelect,
  SelectContent as BitSelectContent,
  SelectItem as BitSelectItem,
  SelectTrigger as BitSelectTrigger,
  SelectValue as BitSelectValue,
} from "@/components/ui/8bit/select";

interface CareMainPageProps {
  currentRun: RunState;
  actionsToday: number;
  expeditionCountToday: number;
  isRestMode: boolean;
  pokemonSummary: PokemonSummary | undefined;
  isPokemonLoading: boolean;
  isPokemonError: boolean;
  pokemonError: unknown;
  environment: DaycareEnvironment;
  onSetThemePrimary: (theme: Theme) => void;
  onSetThemeSecondary: (theme: Theme | null) => void;
  onSetFoodProfile: (foodProfile: FoodProfile) => void;
  onSetCleanlinessBand: (cleanlinessBand: CleanlinessBand) => void;
  onSetFacilityLevel: (theme: Theme, level: FacilityLevel) => void;
  onPerformAction: (action: CareActionType) => void;
  onEndDay: () => void;
  onFinishRun: () => void;
  onClearRun: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}

function getStageLabel(stage: RunState["pet"]["stage"]): string {
  if (stage === "egg") return "알";
  if (stage === "juvenile") return "유년기";
  return "최종";
}

function parseFacilityLevel(value: string): FacilityLevel {
  const parsed = Number(value);
  if (FACILITY_LEVEL_OPTIONS.some((level) => level === parsed)) {
    return parsed as FacilityLevel;
  }
  return 0;
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
  environment,
  onSetThemePrimary,
  onSetThemeSecondary,
  onSetFoodProfile,
  onSetCleanlinessBand,
  onSetFacilityLevel,
  onPerformAction,
  onEndDay,
  onFinishRun,
  onClearRun,
}: CareMainPageProps) {
  const isFinalEvolution = currentRun.pet.isFinalEvolution;
  const imageSrc = pokemonSummary?.spriteUrl ?? null;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-2">
      <section className="w-full max-w-[1448px] aspect-1448/1086 p-3 grid grid-cols-[320px_1fr_320px] grid-rows-[110px_1fr_110px_90px] gap-3">
        <div className="col-span-3">
          <BitCard font="retro">
            <BitCardContent className="grid grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr] gap-2 p-2">
            <Block className="flex items-center justify-center font-bold text-[clamp(22px,1.8vw,34px)]">
              DAY {currentRun.day}
            </Block>
            <Block className="flex items-center justify-center font-bold text-[clamp(22px,1.8vw,34px)]">
              {"♥".repeat(Math.max(0, 3 - currentRun.failCount))}
            </Block>
            <Block className="flex items-center justify-center font-bold text-[clamp(22px,1.8vw,34px)]">
              {actionsToday} / 2
            </Block>
            <Block className="flex items-center justify-center font-bold text-[clamp(22px,1.8vw,34px)]">
              {expeditionCountToday} / 1
            </Block>
            <Block className="flex items-center justify-center font-bold text-[clamp(22px,1.8vw,34px)]">
              {currentRun.weeklyCarePoint * 15}
            </Block>
            </BitCardContent>
          </BitCard>
        </div>

        <BitCard font="retro">
          <BitCardContent className="p-4 grid gap-2">
            <Block className="font-bold text-[clamp(20px,1.6vw,28px)]">
              이름
            </Block>
            <Block className="bg-muted text-foreground px-3 py-2 font-bold truncate">
              {pokemonSummary?.localizedName ?? "???"}
            </Block>
            <Block className="font-bold text-[clamp(20px,1.6vw,28px)]">
              레벨
            </Block>
            <Block className="bg-muted text-foreground px-3 py-2 font-bold truncate">
              Lv. {Math.min(99, currentRun.day)}
            </Block>
            <Block className="font-bold text-[clamp(20px,1.6vw,28px)]">
              타입
            </Block>
            <Block className="bg-muted text-foreground px-3 py-2 font-bold truncate">
              {pokemonSummary?.types.join(" / ") ?? "???"}
            </Block>
            <Block className="font-bold text-[clamp(20px,1.6vw,28px)]">
              상태
            </Block>
            <Block className="bg-primary text-primary-foreground px-3 py-2 font-bold truncate">
              {getStageLabel(currentRun.pet.stage)}
            </Block>
          </BitCardContent>
        </BitCard>

        <BitCard font="retro">
          <BitCardContent
            className="relative p-0 w-full h-full overflow-hidden bg-center bg-contain bg-no-repeat"
            style={{ backgroundImage: "url('/assets/background.png')" }}
          >
            <Block className="absolute left-[34%] bottom-[12%] w-[32%] h-[24%]">
              {imageSrc && (
                <PixiPetStage
                  imageSrc={imageSrc}
                  alt={pokemonSummary?.localizedName ?? "pokemon"}
                  isPixelArt
                  className="w-full h-full"
                  transparentBackground
                />
              )}
            </Block>
          </BitCardContent>
        </BitCard>

        <BitCard font="retro">
          <BitCardContent className="p-4 flex flex-col justify-around gap-2">
            <StatusPanel
              label="체력"
              value={currentRun.pet.hunger}
              colorClassName="bg-lime-500"
            />
            <StatusPanel
              label="기분"
              value={currentRun.pet.mood}
              colorClassName="bg-amber-400"
            />
            <StatusPanel
              label="에너지"
              value={currentRun.pet.energy}
              colorClassName="bg-yellow-400"
            />
            <StatusPanel
              label="청결"
              value={currentRun.pet.cleanliness}
              colorClassName="bg-sky-500"
            />
            <StatusPanel
              label="휴식"
              value={Math.max(0, 100 - currentRun.failCount * 10)}
              colorClassName="bg-purple-500"
            />
          </BitCardContent>
        </BitCard>

        <section className="col-span-3 grid grid-cols-5 gap-2">
          <BitButton font="retro" onClick={() => onPerformAction("feedBerry")} disabled={isRestMode || isFinalEvolution}>
            먹이 주기
          </BitButton>
          <BitButton font="retro" onClick={() => onPerformAction("trainMove")} disabled={isRestMode || isFinalEvolution}>
            놀아주기
          </BitButton>
          <BitButton font="retro" onClick={() => onPerformAction("brushCare")} disabled={isRestMode || isFinalEvolution}>
            씻기기
          </BitButton>
          <BitButton font="retro" onClick={() => onPerformAction("rest")} disabled={isRestMode || isFinalEvolution}>
            쉬게 하기
          </BitButton>
          <BitButton font="retro" onClick={() => onPerformAction("expedition")} disabled={isRestMode || isFinalEvolution}>
            탐험 보내기
          </BitButton>
        </section>

        <section className="col-span-3 grid grid-cols-[2fr_1fr] gap-2">
          {isFinalEvolution ? (
            <BitButton font="retro" onClick={onFinishRun}>
              결과 확인
            </BitButton>
          ) : (
            <BitButton font="retro" onClick={onEndDay} disabled={isRestMode}>
              하루 종료
            </BitButton>
          )}
          <BitButton font="retro" onClick={onClearRun}>
            런 포기
          </BitButton>
        </section>
      </section>

      <div className="w-full max-w-[1448px] mt-2">
      <BitCard font="retro">
        <BitCardContent>
          <h2 className="font-bold mb-2">메인 운영 블록</h2>
          <section className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <BitSelect
              value={environment.themePrimary}
              onValueChange={(value) => onSetThemePrimary(value as Theme)}
            >
              <BitSelectTrigger>
                <BitSelectValue />
              </BitSelectTrigger>
              <BitSelectContent>
                {THEME_OPTIONS.map((theme) => (
                  <BitSelectItem key={theme} value={theme}>
                    {THEME_LABEL_MAP[theme]}
                  </BitSelectItem>
                ))}
              </BitSelectContent>
            </BitSelect>
            <BitSelect
              value={environment.themeSecondary ?? "__none"}
              onValueChange={(value) =>
                onSetThemeSecondary(
                  value === "__none" ? null : (value as Theme),
                )
              }
            >
              <BitSelectTrigger>
                <BitSelectValue />
              </BitSelectTrigger>
              <BitSelectContent>
                <BitSelectItem value="__none">없음</BitSelectItem>
                {THEME_OPTIONS.filter(
                  (theme) => theme !== environment.themePrimary,
                ).map((theme) => (
                  <BitSelectItem key={theme} value={theme}>
                    {THEME_LABEL_MAP[theme]}
                  </BitSelectItem>
                ))}
              </BitSelectContent>
            </BitSelect>
            <BitSelect
              value={environment.foodProfile}
              onValueChange={(value) => onSetFoodProfile(value as FoodProfile)}
            >
              <BitSelectTrigger>
                <BitSelectValue />
              </BitSelectTrigger>
              <BitSelectContent>
                {FOOD_PROFILE_OPTIONS.map((foodProfile) => (
                  <BitSelectItem key={foodProfile} value={foodProfile}>
                    {FOOD_PROFILE_LABEL_MAP[foodProfile]}
                  </BitSelectItem>
                ))}
              </BitSelectContent>
            </BitSelect>
            <BitSelect
              value={environment.cleanlinessBand}
              onValueChange={(value) =>
                onSetCleanlinessBand(value as CleanlinessBand)
              }
            >
              <BitSelectTrigger>
                <BitSelectValue />
              </BitSelectTrigger>
              <BitSelectContent>
                {CLEANLINESS_BAND_OPTIONS.map((band) => (
                  <BitSelectItem key={band} value={band}>
                    {band}
                  </BitSelectItem>
                ))}
              </BitSelectContent>
            </BitSelect>
            <BitSelect
              value={String(
                environment.facilityLevelByTheme[environment.themePrimary],
              )}
              onValueChange={(value) =>
                onSetFacilityLevel(
                  environment.themePrimary,
                  parseFacilityLevel(value),
                )
              }
            >
              <BitSelectTrigger>
                <BitSelectValue />
              </BitSelectTrigger>
              <BitSelectContent>
                {FACILITY_LEVEL_OPTIONS.map((level) => (
                  <BitSelectItem key={level} value={String(level)}>
                    Lv.{level}
                  </BitSelectItem>
                ))}
              </BitSelectContent>
            </BitSelect>
          </section>
        </BitCardContent>
      </BitCard>
      </div>

      <div className="w-full max-w-[1448px] mt-2">
      <BitCard font="retro">
        <BitCardContent>
          <div className="px-6 py-4 text-[clamp(26px,2vw,42px)] font-bold">
          {isPokemonLoading && <p>로딩 중...</p>}
          {isPokemonError && <p>{getErrorMessage(pokemonError)}</p>}
          {!isPokemonLoading && !isPokemonError && (
            <p>다음 행동을 선택하세요!</p>
          )}
          </div>
        </BitCardContent>
      </BitCard>
      </div>
    </main>
  );
}
