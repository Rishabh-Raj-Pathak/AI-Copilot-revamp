import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../design-system/vaults/index.css";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import VaultsDexTabs from "./VaultsDexTabs.jsx";
import VaultsHero from "./VaultsHero.jsx";
import VaultGridCard from "./VaultGridCard.jsx";
import VaultsActivatedSection from "./VaultsActivatedSection.jsx";
import VaultsListSection from "./VaultsListSection.jsx";
import VaultsSectionHeader from "./VaultsSectionHeader.jsx";
import VaultsPositionsHistoryTable from "./VaultsPositionsHistoryTable.jsx";
import VaultsStatsRow from "./VaultsStatsRow.jsx";
import { DEFAULT_SHARE_PCT } from "./vaultUiUtils.js";
import {
  advanceVaultsTourAfterFeaturedActivateClick,
  isVaultsTourCompleted,
  notifyVaultsTourDexChanged,
  refreshVaultsTourIfActive,
  startVaultsProductTour,
} from "../../copilot/vaultsTour.js";
import {
  availableVaults,
  dexTabs,
  featuredVaults,
} from "./vaultsMockData.js";

function buildInitialRowUi() {
  const all = [...featuredVaults, ...availableVaults];
  return Object.fromEntries(
    all.map((v) => [
      v.id,
      {
        sharePct: DEFAULT_SHARE_PCT,
        amountStr: "5",
        activated: false,
        activatedAt: null,
      },
    ]),
  );
}

function filterByDex(list, dexId) {
  if (dexId === "all") return list;
  return list.filter((v) => v.venues?.includes(dexId));
}

/**
 * Figma `4421:6149` `App` → `Main Content` — Vaults homepage surface.
 */
export default function VaultsPage({
  walletConnected,
  onWalletConnected,
  terminalPlatform,
  onTerminalPlatformChange,
  onOpenCopilot,
}) {
  const [viewMode, setViewMode] = useState("list");
  const [dexId, setDexId] = useState("all");
  const [rowUi, setRowUi] = useState(buildInitialRowUi);

  const dexIdRef = useRef(dexId);
  dexIdRef.current = dexId;

  const pendingVaultTourAdvanceRef = useRef(false);

  const vaultsTourHandlers = useMemo(
    () => ({
      getVaultsDexId: () => dexIdRef.current,
    }),
    [],
  );

  const runVaultsProductTour = useCallback(() => {
    setViewMode("list");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startVaultsProductTour(vaultsTourHandlers);
      });
    });
  }, [vaultsTourHandlers]);

  useEffect(() => {
    if (isVaultsTourCompleted()) return;
    let cancelled = false;
    setViewMode("list");
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        startVaultsProductTour(vaultsTourHandlers);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [vaultsTourHandlers]);

  const patchRow = useCallback((id, partial) => {
    setRowUi((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      if (partial?.activated) {
        const firstInactiveFeaturedId = featuredVaults.find(
          (v) => !prev[v.id]?.activated,
        )?.id;
        if (firstInactiveFeaturedId === id) {
          pendingVaultTourAdvanceRef.current = true;
        }
      }
      return { ...prev, [id]: { ...cur, ...partial } };
    });
  }, []);

  useLayoutEffect(() => {
    if (!pendingVaultTourAdvanceRef.current) return;
    pendingVaultTourAdvanceRef.current = false;
    advanceVaultsTourAfterFeaturedActivateClick();
  }, [rowUi]);

  const handleDexChange = useCallback((nextId) => {
    setDexId(nextId);
    notifyVaultsTourDexChanged(nextId);
    refreshVaultsTourIfActive();
  }, []);

  const filteredFeatured = useMemo(
    () => filterByDex(featuredVaults, dexId),
    [dexId],
  );
  const filteredAvailable = useMemo(
    () => filterByDex(availableVaults, dexId),
    [dexId],
  );

  const gridVaults = useMemo(
    () => [...filteredFeatured, ...filteredAvailable],
    [filteredFeatured, filteredAvailable],
  );

  const allVaults = useMemo(
    () => [...featuredVaults, ...availableVaults],
    [],
  );

  const activatedVaultsOrdered = useMemo(() => {
    return allVaults
      .filter((v) => rowUi[v.id]?.activated)
      .sort(
        (a, b) =>
          (rowUi[a.id]?.activatedAt ?? 0) - (rowUi[b.id]?.activatedAt ?? 0),
      );
  }, [allVaults, rowUi]);

  const inactiveFeatured = useMemo(
    () => filteredFeatured.filter((v) => !rowUi[v.id]?.activated),
    [filteredFeatured, rowUi],
  );
  const inactiveAvailable = useMemo(
    () => filteredAvailable.filter((v) => !rowUi[v.id]?.activated),
    [filteredAvailable, rowUi],
  );

  return (
    <div className="vaults-root flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white">
      <HeaderTerminal
        activeNavItem="Vaults"
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
        }}
        showProductTour
        onProductTour={runVaultsProductTour}
        walletConnected={walletConnected}
        onWalletConnected={onWalletConnected}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={onTerminalPlatformChange}
      />

      <div className="vaults-minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="mx-auto flex w-full max-w-[1190px] flex-col gap-10 px-5 py-8 pb-16">
          <VaultsHero />
          <VaultsStatsRow />

          <div className="flex w-full flex-col gap-6">
            <VaultsSectionHeader
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <VaultsDexTabs
              tabs={dexTabs}
              activeId={dexId}
              onChange={handleDexChange}
            />

            {viewMode === "list" ? (
              <div className="flex flex-col gap-10">
                {activatedVaultsOrdered.length > 0 ? (
                  <VaultsActivatedSection
                    vaults={activatedVaultsOrdered}
                    rowUi={rowUi}
                    onPatch={patchRow}
                  />
                ) : null}
                <div
                  data-tour="vaults-opportunities"
                  className="flex flex-col gap-10"
                >
                  <VaultsListSection
                    title="Featured Opportunities"
                    vaults={inactiveFeatured}
                    rowUi={rowUi}
                    onPatch={patchRow}
                    tourFeaturedFirstControls
                  />
                  <VaultsListSection
                    title="Available Vaults"
                    vaults={inactiveAvailable}
                    rowUi={rowUi}
                    onPatch={patchRow}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {gridVaults.map((v) => (
                  <VaultGridCard
                    key={`grid-${v.id}`}
                    vault={v}
                    ui={rowUi[v.id]}
                    onPatch={patchRow}
                  />
                ))}
              </div>
            )}

            {viewMode === "grid" && gridVaults.length === 0 ? (
              <p className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#0c0c0c] px-4 py-6 text-sm text-[#717182]">
                No vaults match this venue filter.
              </p>
            ) : null}
          </div>

          <VaultsPositionsHistoryTable />
        </div>
      </div>
    </div>
  );
}
