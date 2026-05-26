import { useCopilotTheme } from "../StrategyCopilotContext.jsx";

const STATUS_STYLES_V1 = {
  Draft: "bg-[#242424] text-[#bfbfbf]",
  Backtested: "bg-[#171200] text-[#f2b500]",
  "Paper Trading": "bg-[#001610] text-[#00f3b6]",
  Ready: "bg-[#1a2a1a] text-[#269755]",
  Paused: "bg-[#242424] text-[#929292]",
  Completed: "bg-[#242424] text-[#757575]",
};

const STATUS_STYLES_V2 = {
  Draft: "bg-[#2a2a2a] text-[#a3a3a3]",
  Backtested: "bg-[#f2b500]/15 text-[#f2b500]",
  "Paper Trading": "bg-[#00f3b6]/12 text-[#00f3b6]",
  Ready: "bg-[#269755]/15 text-[#4ade80]",
  Paused: "bg-[#2a2a2a] text-[#929292]",
  Completed: "bg-[#2a2a2a] text-[#757575]",
};

export function StatusBadge({ status, className = "", uiVersion }) {
  const theme = useCopilotTheme();
  const isV2 = uiVersion ? uiVersion === "v2" : theme.isV2;
  const styles = isV2 ? STATUS_STYLES_V2 : STATUS_STYLES_V1;
  const badgeClass = isV2 ? theme.badge : "rounded px-1.5 py-0.5";
  return (
    <span
      className={`inline-flex shrink-0 text-[10px] font-medium ${badgeClass} ${styles[status] ?? styles.Draft} ${className}`}
    >
      {status}
    </span>
  );
}
