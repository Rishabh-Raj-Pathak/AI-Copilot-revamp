import ActivatedVaultRow from "./ActivatedVaultRow.jsx";
import { useAgentLogs } from "./agentLogs/AgentLogsContext.jsx";
import { VAULT_AGENT_LOG_NAMES } from "./agentLogs/agentLogsMockData.js";

function openVaultAgentLogs(openAgentLogs, vault, health) {
  const options = {
    vaultId: vault.id,
    vaultName: VAULT_AGENT_LOG_NAMES[vault.id] ?? vault.name,
  };
  if (health.status === "critical") {
    options.activeFilter = "critical";
  } else if (health.status === "warning") {
    options.activeFilter = "unread";
  }
  openAgentLogs(options);
}

/**
 * Activated allocations — above Featured; uses `vaults-section-hairline` + enter motion.
 */
export default function VaultsActivatedSection({ vaults, rowUi, onPatch }) {
  const { getVaultHealthSync, openAgentLogs } = useAgentLogs();

  return (
    <section
      className="vaults-root flex w-full flex-col gap-4"
      data-tour="vaults-activated-section"
    >
      <div className="flex items-center gap-3 max-tablet:flex tablet:hidden">
        <div className="vaults-section-hairline" />
        <h3 className="shrink-0 text-[10px] font-semibold uppercase leading-[15px] tracking-[2px] text-[#ccb17f]">
          Activated Vaults
        </h3>
        <div className="vaults-section-hairline" />
      </div>
      <div className="hidden items-center gap-3 tablet:flex">
        <h3 className="shrink-0 text-[10px] font-semibold uppercase leading-[15px] tracking-[2px] text-[#ccb17f]">
          Activated Vaults
        </h3>
        <div className="vaults-section-hairline" />
      </div>
      <div className="flex w-full flex-col gap-3 max-tablet:gap-3 tablet:overflow-hidden tablet:rounded-[14px] tablet:border tablet:border-[rgba(120,90,40,0.22)] tablet:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.55)]">
        {vaults.map((v, i) => {
          const health = getVaultHealthSync(v.id);
          return (
            <ActivatedVaultRow
              key={v.id}
              vault={v}
              ui={rowUi[v.id]}
              isFirst={i === 0}
              enterIndex={i}
              onPatch={onPatch}
              agentHealth={health}
              onOpenVaultLogs={() =>
                openVaultAgentLogs(openAgentLogs, v, health)
              }
            />
          );
        })}
      </div>
    </section>
  );
}
