import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";

export default function StrategySidebarSection({
  label,
  count,
  selectedId,
  itemIds = [],
  children,
}) {
  const theme = useCopilotTheme();
  const hasSelected =
    selectedId != null && itemIds.some((itemId) => itemId === selectedId);
  const [isOpen, setIsOpen] = useState(hasSelected || true);

  return (
    <section className="min-w-0">
      <div className="flex items-center gap-1 px-1 py-1.5">
        <button
          type="button"
          className={`flex min-w-0 flex-1 items-center gap-1.5 text-left ${theme.sidebarSectionTitle}`}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          <ChevronDown
            className={`size-3.5 shrink-0 text-[rgba(255,255,255,0.45)] transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
            aria-hidden
          />
          <span className="truncate uppercase tracking-wide">{label}</span>
          {count != null ? (
            <span className="ml-auto shrink-0 tabular-nums text-[rgba(255,255,255,0.45)]">
              {count}
            </span>
          ) : null}
        </button>
      </div>
      {isOpen ? <div className="min-w-0">{children}</div> : null}
    </section>
  );
}
