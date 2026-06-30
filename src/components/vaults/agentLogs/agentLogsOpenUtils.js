import { VAULT_AGENT_LOG_NAMES } from "./agentLogsMockData.js";

export function openVaultAgentLogs(openAgentLogs, vault, health) {
  const options = {
    vaultId: vault.id,
    vaultName: VAULT_AGENT_LOG_NAMES[vault.id] ?? vault.name,
    vaultVenues: vault.venues ?? [],
  };

  if (health.topIssue?.id) {
    options.highlightLogId = health.topIssue.id;
    options.activeFilter = "all";
  } else if (health.status === "critical") {
    options.activeFilter = "critical";
  } else if (health.status === "warning") {
    options.activeFilter = "unread";
  }

  openAgentLogs(options);
}
