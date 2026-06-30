import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import AgentLogsDrawer from "./AgentLogsDrawer.jsx";
import {
  AGENT_LOG_CATEGORIES,
  INITIAL_AGENT_LOGS,
  MORE_AGENT_LOGS,
  VAULT_AGENT_LOG_NAMES,
} from "./agentLogsMockData.js";
import {
  getAccountAgentBlocker,
  getVaultAgentHealth,
  isLogUnread,
} from "./agentLogsUtils.js";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "action_required", label: "Action" },
  { id: "success", label: "Success" },
  { id: "unread", label: "Unread" },
];

function buildDefaultDisabledCategories() {
  return AGENT_LOG_CATEGORIES.filter((c) => !c.defaultEnabled).map((c) => c.id);
}

const AgentLogsContext = createContext(null);

export function AgentLogsProvider({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logs, setLogs] = useState(INITIAL_AGENT_LOGS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [disabledCategories, setDisabledCategories] = useState(
    buildDefaultDisabledCategories,
  );
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [vaultFilterId, setVaultFilterId] = useState(null);
  const [vaultFilterName, setVaultFilterName] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

  const isCategoryVisible = useCallback(
    (log) => {
      if (log.severity === "critical") return true;
      return !disabledCategories.includes(log.category);
    },
    [disabledCategories],
  );

  const openAgentLogs = useCallback((options = {}) => {
    const {
      vaultId = null,
      vaultName = null,
      severityFilter = null,
      categoryFilter: nextCategoryFilter = null,
      activeFilter: nextActiveFilter = null,
    } = options;

    setVaultFilterId(vaultId);
    setVaultFilterName(
      vaultName ?? (vaultId ? VAULT_AGENT_LOG_NAMES[vaultId] : null) ?? null,
    );
    setCategoryFilter(nextCategoryFilter);

    if (severityFilter) {
      setActiveFilter(severityFilter);
    } else if (nextActiveFilter) {
      setActiveFilter(nextActiveFilter);
    } else {
      setActiveFilter("all");
    }

    setSettingsOpen(false);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSettingsOpen(false);
  }, []);

  const clearVaultFilter = useCallback(() => {
    setVaultFilterId(null);
    setVaultFilterName(null);
    setCategoryFilter(null);
    setActiveFilter("all");
  }, []);

  const toggleSettings = useCallback(() => setSettingsOpen((o) => !o), []);

  const baseVisibleLogs = useMemo(
    () => logs.filter(isCategoryVisible),
    [logs, isCategoryVisible],
  );

  const scopedLogs = useMemo(() => {
    let list = baseVisibleLogs;
    if (vaultFilterId) {
      list = list.filter((log) => log.vaultId === vaultFilterId);
    }
    if (categoryFilter) {
      list = list.filter((log) => log.category === categoryFilter);
    }
    return list;
  }, [baseVisibleLogs, vaultFilterId, categoryFilter]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedLogs
      .filter((log) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "unread") return isLogUnread(log);
        return log.severity === activeFilter;
      })
      .filter((log) => {
        if (!q) return true;
        return (
          log.title.toLowerCase().includes(q) ||
          log.body.toLowerCase().includes(q) ||
          (log.symbol?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.lastOccurredAt).getTime() -
          new Date(a.lastOccurredAt).getTime(),
      );
  }, [scopedLogs, activeFilter, searchQuery]);

  const filterCounts = useMemo(
    () => ({
      all: scopedLogs.length,
      critical: scopedLogs.filter((l) => l.severity === "critical").length,
      action_required: scopedLogs.filter((l) => l.severity === "action_required")
        .length,
      success: scopedLogs.filter((l) => l.severity === "success").length,
      unread: scopedLogs.filter(isLogUnread).length,
    }),
    [scopedLogs],
  );

  const unreadCount = useMemo(
    () => baseVisibleLogs.filter(isLogUnread).length,
    [baseVisibleLogs],
  );

  const markRead = useCallback((logId) => {
    const now = new Date().toISOString();
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId && !log.readAt ? { ...log, readAt: now } : log,
      ),
    );
  }, []);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    const visibleIds = new Set(filteredLogs.map((log) => log.id));
    setLogs((prev) =>
      prev.map((log) =>
        visibleIds.has(log.id) && !log.readAt ? { ...log, readAt: now } : log,
      ),
    );
  }, [filteredLogs]);

  const toggleCategory = useCallback((categoryId) => {
    setDisabledCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }, []);

  const loadMore = useCallback(() => {
    if (hasLoadedMore) return;
    setLogs((prev) => [...prev, ...MORE_AGENT_LOGS]);
    setHasLoadedMore(true);
  }, [hasLoadedMore]);

  const getVaultHealthSync = useCallback(
    (vaultId) => getVaultAgentHealth(logs, vaultId, isCategoryVisible),
    [logs, isCategoryVisible],
  );

  const getAccountBlockerSync = useCallback(
    () => getAccountAgentBlocker(logs, isCategoryVisible),
    [logs, isCategoryVisible],
  );

  const value = useMemo(
    () => ({
      allLogs: logs,
      unreadCount,
      openAgentLogs,
      closeDrawer,
      getVaultHealthSync,
      getAccountBlockerSync,
      isCategoryVisible,
    }),
    [
      logs,
      unreadCount,
      openAgentLogs,
      closeDrawer,
      getVaultHealthSync,
      getAccountBlockerSync,
      isCategoryVisible,
    ],
  );

  return (
    <AgentLogsContext.Provider value={value}>
      {children}
      <AgentLogsDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        logs={filteredLogs}
        unreadCount={vaultFilterId ? filterCounts.unread : unreadCount}
        settingsOpen={settingsOpen}
        onToggleSettings={toggleSettings}
        filterTabs={FILTER_TABS}
        activeFilter={activeFilter}
        filterCounts={filterCounts}
        searchQuery={searchQuery}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchQuery}
        onMarkAllRead={markAllRead}
        onMarkRead={markRead}
        categories={AGENT_LOG_CATEGORIES}
        disabledCategories={disabledCategories}
        onToggleCategory={toggleCategory}
        hasMore={!hasLoadedMore}
        onLoadMore={loadMore}
        vaultFilterName={vaultFilterName}
        onClearVaultFilter={clearVaultFilter}
        isVaultScoped={Boolean(vaultFilterId)}
      />
    </AgentLogsContext.Provider>
  );
}

export function useAgentLogs() {
  const ctx = useContext(AgentLogsContext);
  if (!ctx) {
    throw new Error("useAgentLogs must be used within AgentLogsProvider");
  }
  return ctx;
}
