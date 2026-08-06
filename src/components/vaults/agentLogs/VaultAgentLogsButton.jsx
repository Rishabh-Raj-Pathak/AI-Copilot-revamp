import { Bell } from "lucide-react";
import { useAgentLogs } from "./AgentLogsContext.jsx";

/** Vaults-page entry point — opens the global Agent Logs drawer (all logs). */
export default function VaultAgentLogsButton() {
  const { unreadCount, openAgentLogs } = useAgentLogs();

  return (
    <button
      type="button"
      onClick={() => openAgentLogs()}
      aria-label={
        unreadCount > 0
          ? `Agent logs, ${unreadCount} unread`
          : "Agent logs"
      }
      className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#785a28] text-[#e8d5b5] shadow-[inset_0_0_4px_rgba(0,0,0,0.5),0_4px_16px_-4px_rgba(0,0,0,0.45)] transition-[border-color,filter] hover:border-[#ccb17f] hover:brightness-105 max-tablet:size-9"
      style={{
        backgroundImage:
          "linear-gradient(180deg, #1a140b 0%, #18130b 16.667%, #16120b 33.333%, #14110c 50%, #13100c 66.667%, #110f0c 83.333%, #0f0e0c 100%)",
      }}
    >
      <Bell className="size-4 max-tablet:size-3.5" strokeWidth={1.75} />
      {unreadCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[rgba(120,90,40,0.45)] bg-[#14110c] px-1 text-[10px] font-semibold leading-none text-[#ccb17f] ring-2 ring-black">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}
