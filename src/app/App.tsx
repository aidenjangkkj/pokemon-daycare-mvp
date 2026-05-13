import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEnvironmentStore } from "../entities/meta/model/meta.store";
import {
  getGen1PokemonCandidates,
  getPokemonSummary,
} from "../entities/pokemon/api/pokemonApi";
import { generateRequestCards } from "../entities/request/model/request.generator";
import { filterPokemonByUnlockTier } from "../entities/request/model/request.unlock";
import { useRunStore } from "../entities/run/model/run.store";
import { CareMainPage } from "../pages/care-main/CareMainPage";
import { RequestBoardPage } from "../pages/request-board/RequestBoardPage";
import { BottomActionBar } from "../widgets/bottom-action-bar/BottomActionBar";
import { ResultModal } from "../widgets/result-modal/ResultModal";

function App() {
  const [isBoardView, setIsBoardView] = useState(false);

  const {
    environment,
    progress,
    hydrateEnvironmentFromStorage,
    syncProgressFromRecords,
    grantFreeThemeChange,
    tickThemeChangeCooldown,
    setThemePrimary,
    setThemeSecondary,
    setFoodProfile,
    setCleanlinessBand,
    setFacilityLevel,
    resetEnvironment,
  } = useEnvironmentStore();

  const {
    currentRun,
    actionsToday,
    expeditionCountToday,
    isRestMode,
    clearedRuns,
    restRuns,
    latestResult,
    hydrateFromStorage,
    startRun,
    performAction,
    endDay,
    finishCurrentRun,
    clearRun,
    resetRecords,
    dismissLatestResult,
  } = useRunStore();

  useEffect(() => {
    hydrateEnvironmentFromStorage();
    hydrateFromStorage();
  }, [hydrateEnvironmentFromStorage, hydrateFromStorage]);

  useEffect(() => {
    syncProgressFromRecords(clearedRuns, restRuns);
  }, [clearedRuns, restRuns, syncProgressFromRecords]);

  const requestCandidatesQuery = useQuery({
    queryKey: ["gen1-pokemon-candidates"],
    queryFn: getGen1PokemonCandidates,
    enabled: !currentRun || isBoardView,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const requestCards = useMemo(() => {
    if (!requestCandidatesQuery.data) {
      return [];
    }

    const unlockedCandidates = filterPokemonByUnlockTier(
      requestCandidatesQuery.data,
      progress?.unlockTier ?? 0,
    );

    return generateRequestCards(unlockedCandidates, environment, 3);
  }, [environment, progress?.unlockTier, requestCandidatesQuery.data]);

  const selectedSpeciesId = currentRun?.pet.speciesId ?? 1;

  const pokemonSummaryQuery = useQuery({
    queryKey: ["pokemon-summary", selectedSpeciesId],
    queryFn: () => getPokemonSummary(selectedSpeciesId),
    enabled: Boolean(currentRun),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const showBoard = !currentRun || isBoardView;

  return (
    <>
      {latestResult && <ResultModal record={latestResult} onClose={dismissLatestResult} />}

      {showBoard ? (
        <RequestBoardPage
          environment={environment}
          progress={progress}
          requestCards={requestCards}
          isLoading={requestCandidatesQuery.isLoading}
          isError={requestCandidatesQuery.isError}
          error={requestCandidatesQuery.error}
          clearedRuns={clearedRuns}
          restRuns={restRuns}
          onRetry={() => {
            void requestCandidatesQuery.refetch();
          }}
          onStartRun={(speciesId) => {
            grantFreeThemeChange();
            setIsBoardView(false);
            void startRun(speciesId);
          }}
          onResetRecords={resetRecords}
          onSetThemePrimary={setThemePrimary}
          onSetThemeSecondary={setThemeSecondary}
          onSetFoodProfile={setFoodProfile}
          onSetCleanlinessBand={setCleanlinessBand}
          onSetFacilityLevel={setFacilityLevel}
          onResetEnvironment={resetEnvironment}
        />
      ) : (
        <CareMainPage
          currentRun={currentRun}
          actionsToday={actionsToday}
          expeditionCountToday={expeditionCountToday}
          isRestMode={isRestMode}
          pokemonSummary={pokemonSummaryQuery.data}
          isPokemonLoading={pokemonSummaryQuery.isLoading}
          isPokemonError={pokemonSummaryQuery.isError}
          pokemonError={pokemonSummaryQuery.error}
          environment={environment}
          onSetThemePrimary={setThemePrimary}
          onSetThemeSecondary={setThemeSecondary}
          onSetFoodProfile={setFoodProfile}
          onSetCleanlinessBand={setCleanlinessBand}
          onSetFacilityLevel={setFacilityLevel}
          onPerformAction={performAction}
          onEndDay={() => {
            tickThemeChangeCooldown();
            endDay();
          }}
          onFinishRun={finishCurrentRun}
          onClearRun={clearRun}
        />
      )}

      {currentRun && (
        <section className="px-2 pb-2 bg-[#040914]">
          <BottomActionBar
            isBoard={showBoard}
            onOpenBoard={() => setIsBoardView(true)}
            onOpenMain={() => setIsBoardView(false)}
          />
        </section>
      )}
    </>
  );
}

export default App;
