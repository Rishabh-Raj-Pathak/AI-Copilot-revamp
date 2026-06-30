import { useCallback, useMemo, useState } from "react";
import {
  AGENT_LOG_CATEGORIES,
  INITIAL_AGENT_LOGS,
  MORE_AGENT_LOGS,
} from "./agentLogsMockData.js";
import { isLogUnread } from "./agentLogsUtils.js";

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

export default function useAgentLogsProto() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logs, setLogs] = useState(INITIAL_AGENT_LOGS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [disabledCategories, setDisabledCategories] = useState(
    buildDefaultDisabledCategories,
  );
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSettingsOpen(false);
  }, []);

  const toggleSettings = useCallback(() => setSettingsOpen((o) => !o), []);

  const isCategoryVisible = useCallback(
    (log) => {
      if (log.severity === "critical") return true;
      return !disabledCategories.includes(log.category);
    },
    [disabledCategories],
  );

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs
      .filter(isCategoryVisible)
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
  }, [logs, activeFilter, searchQuery, isCategoryVisible]);

  const filterCounts = useMemo(() => {
    const visible = logs.filter(isCategoryVisible);
    return {
      all: visible.length,
      critical: visible.filter((l) => l.severity === "critical").length,
      action_required: visible.filter((l) => l.severity === "action_required")
        .length,
      success: visible.filter((l) => l.severity === "success").length,
      unread: visible.filter(isLogUnread).length,
    };
  }, [logs, isCategoryVisible]);

  const unreadCount = useMemo(
    () => logs.filter(isCategoryVisible).filter(isLogUnread).length,
    [logs, isCategoryVisible],
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
    setLogs((prev) =>
      prev.map((log) => (log.readAt ? log : { ...log, readAt: now })),
    );
  }, []);

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

  const hasMore = !hasLoadedMore;

  return {
    drawerOpen,
    settingsOpen,
    logs: filteredLogs,
    allLogs: logs,
    activeFilter,
    searchQuery,
    disabledCategories,
    filterTabs: FILTER_TABS,
    filterCounts,
    unreadCount,
    categories: AGENT_LOG_CATEGORIES,
    hasMore,
    openDrawer,
    closeDrawer,
    toggleSettings,
    setActiveFilter,
    setSearchQuery,
    markRead,
    markAllRead,
    toggleCategory,
    loadMore,
  };
}
