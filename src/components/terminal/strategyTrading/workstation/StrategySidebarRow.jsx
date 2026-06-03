import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import {
  formatStrategyRowMeta,
  getMarketTokenIcon,
} from "./strategySidebarUtils.js";

export default function StrategySidebarRow({ strategy, active, onSelect }) {
  const theme = useCopilotTheme();
  const meta = formatStrategyRowMeta(strategy);
  const tokenIcon = getMarketTokenIcon(strategy.marketId);

  return (
    <button
      type="button"
      onClick={() => onSelect(strategy.id)}
      className={active ? theme.sidebarRowActive : theme.sidebarRow}
    >
      <img
        src={tokenIcon}
        alt=""
        className="size-5 shrink-0 rounded-full object-cover"
        width={20}
        height={20}
        draggable={false}
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[13px] font-medium text-white">
          {strategy.name}
        </span>
        {meta ? (
          <span
            className={`mt-0.5 block truncate text-[11px] ${theme.sidebarRowMeta}`}
          >
            {meta}
          </span>
        ) : null}
      </span>
      <span
        className={`shrink-0 whitespace-nowrap text-[11px] ${theme.sidebarRowTime}`}
      >
        {strategy.lastUpdated ?? "—"}
      </span>
    </button>
  );
}
