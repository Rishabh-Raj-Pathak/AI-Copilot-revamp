/** Severity badges — same inset-border language as `VaultRow` status pills. */
export const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    badgeClass:
      "border-[rgba(229,72,77,0.22)] bg-[rgba(229,72,77,0.08)] text-[#e5484d] shadow-[inset_0_0_4px_rgba(72,18,20,0.45)]",
  },
  action_required: {
    label: "Action",
    badgeClass:
      "border-[rgba(120,90,40,0.35)] bg-[rgba(120,90,40,0.12)] text-[#ccb17f] shadow-[inset_0_0_4px_rgba(40,30,12,0.45)]",
  },
  warning: {
    label: "Warning",
    badgeClass:
      "border-[rgba(255,105,0,0.22)] bg-[rgba(255,105,0,0.08)] text-[#ff8904] shadow-[inset_0_0_4px_rgba(92,49,0,0.45)]",
  },
  info: {
    label: "Info",
    badgeClass:
      "border-[rgba(43,127,255,0.22)] bg-[rgba(43,127,255,0.08)] text-[#51a2ff] shadow-[inset_0_0_4px_rgba(0,46,116,0.45)]",
  },
  success: {
    label: "Success",
    badgeClass:
      "border-[rgba(0,188,125,0.22)] bg-[rgba(0,188,125,0.08)] text-[#00d492] shadow-[inset_0_0_4px_rgba(0,108,74,0.45)]",
  },
};

export const VAULT_LOG_PANEL_GRADIENT =
  "linear-gradient(168deg, rgba(22, 20, 18, 0.95) 0%, rgba(12, 10, 8, 0.98) 48%, rgba(14, 12, 10, 0.96) 100%)";

export const VAULT_LOG_ROW_GRADIENT =
  "linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.4) 100%), linear-gradient(90deg, rgb(12, 10, 8) 0%, rgb(12, 10, 8) 100%)";

export function formatRelativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isYesterday(iso) {
  const d = new Date(iso);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate()
  );
}

export function groupLogsByDay(logs) {
  const groups = [];
  let current = null;

  for (const log of logs) {
    let label;
    if (isToday(log.lastOccurredAt)) label = "Today";
    else if (isYesterday(log.lastOccurredAt)) label = "Yesterday";
    else label = new Date(log.lastOccurredAt).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    if (!current || current.label !== label) {
      current = { label, logs: [] };
      groups.push(current);
    }
    current.logs.push(log);
  }

  return groups;
}

export function isLogUnread(log) {
  return !log.readAt;
}

const ISSUE_SEVERITIES = new Set(["critical", "action_required", "warning"]);

/**
 * Vault health for status chip on activated rows (proto: derived from mock logs).
 */
export function getVaultAgentHealth(logs, vaultId, isCategoryVisible = () => true) {
  const vaultLogs = logs.filter(
    (log) => log.vaultId === vaultId && isCategoryVisible(log),
  );

  const openIssues = vaultLogs.filter(
    (log) => isLogUnread(log) && ISSUE_SEVERITIES.has(log.severity),
  );

  const critical = openIssues.filter((log) => log.severity === "critical");
  if (critical.length > 0) {
    return {
      status: "critical",
      issueCount: critical.length,
      statusLabel: "Action needed",
      actionLabel: "View issue",
    };
  }

  const warnings = openIssues.filter(
    (log) => log.severity === "warning" || log.severity === "action_required",
  );
  if (warnings.length > 0) {
    return {
      status: "warning",
      issueCount: warnings.length,
      statusLabel:
        warnings.length === 1 ? "1 warning" : `${warnings.length} warnings`,
      actionLabel: "View logs",
    };
  }

  return {
    status: "healthy",
    issueCount: 0,
    statusLabel: "No issues",
    actionLabel: "View activity",
  };
}

/** Latest account-level blocker for vault page banner (proto). */
export function getAccountAgentBlocker(logs, isCategoryVisible = () => true) {
  const blockers = logs
    .filter(
      (log) =>
        !log.vaultId &&
        isCategoryVisible(log) &&
        isLogUnread(log) &&
        (log.severity === "critical" || log.severity === "action_required"),
    )
    .sort(
      (a, b) =>
        new Date(b.lastOccurredAt).getTime() -
        new Date(a.lastOccurredAt).getTime(),
    );

  return blockers[0] ?? null;
}
