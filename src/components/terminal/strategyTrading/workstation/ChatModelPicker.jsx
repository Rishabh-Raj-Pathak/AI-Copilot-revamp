import { Check, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { CHAT_LLM_MODELS } from "../strategyWorkstationMockData.js";

const PROVIDER_COLORS = {
  Anthropic: "text-[#d4a574]",
  OpenAI: "text-[#00a67e]",
  Google: "text-[#4285f4]",
  xAI: "text-[#e5e5e5]",
  DeepSeek: "text-[#4d9fff]",
  Meta: "text-[#0866ff]",
};

export default function ChatModelPicker({ value, onChange, disabled }) {
  const theme = useCopilotTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = CHAT_LLM_MODELS.find((m) => m.id === value) ?? CHAT_LLM_MODELS[1];

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`AI model: ${selected.name}`}
        onClick={() => setOpen((v) => !v)}
        className={`flex max-w-[11rem] items-center gap-1.5 rounded-lg border px-2 py-1 text-left transition-colors disabled:opacity-50 sm:max-w-[13rem] ${
          theme.isV2
            ? "border-[#333] bg-transparent hover:border-[#454545]"
            : "border-[#242424] bg-[#121212] hover:border-[#454545]"
        }`}
      >
        <Sparkles className="size-3 shrink-0 text-[#f2b500]" aria-hidden />
        <span className="min-w-0 truncate text-[11px] font-medium text-white">
          {selected.name}
        </span>
        <ChevronDown
          className={`size-3 shrink-0 text-[#585858] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select AI model"
          className="absolute bottom-full left-0 z-50 mb-1.5 w-[min(16.5rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
        >
          <p className="border-b border-[#242424] px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[#585858]">
            Model
          </p>
          <ul className="minimal-scrollbar max-h-[14rem] overflow-y-auto py-0.5">
            {CHAT_LLM_MODELS.map((model) => {
              const active = model.id === value;
              const providerColor =
                PROVIDER_COLORS[model.provider] ?? "text-[#929292]";
              return (
                <li key={model.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-white/5 ${
                      active ? "bg-[#171200]/60" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                      {active ? (
                        <Check className="size-3.5 text-[#f2b500]" aria-hidden />
                      ) : (
                        <span className="size-3.5" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-white">
                        {model.name}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className={providerColor}>{model.provider}</span>
                        <span className="text-[#585858]">·</span>
                        <span className="text-[#757575]">{model.tag}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
