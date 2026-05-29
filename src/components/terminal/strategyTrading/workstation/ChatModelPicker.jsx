import { Check, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { CHAT_LLM_MODELS } from "../strategyWorkstationMockData.js";
import ScrollFade from "./ScrollFade.jsx";

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
  const selected = CHAT_LLM_MODELS.find((m) => m.id === value) ?? CHAT_LLM_MODELS[0];

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
        className={`flex max-w-[10.5rem] items-center gap-1.5 text-left transition-all duration-150 disabled:opacity-50 sm:max-w-[12rem] ${
          theme.isV2
            ? "rounded-full border border-white/[0.1] bg-[#141414] px-2.5 py-1.5 hover:border-white/[0.16] hover:bg-[#1f1f1f]"
            : "rounded-lg border border-[#242424] bg-[#121212] px-2 py-1 hover:border-[#454545]"
        }`}
      >
        <Sparkles
          className={`size-3 shrink-0 ${theme.isV2 ? "text-[#19E6A3]" : "text-[#f2b500]"}`}
          aria-hidden
        />
        <span
          className={`min-w-0 truncate font-medium ${
            theme.isV2 ? "text-[11px] text-[#d4d4d4]" : "text-[11px] text-white"
          }`}
        >
          {selected.name}
        </span>
        <ChevronDown
          className={`size-3 shrink-0 text-[#8a8a8a] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select AI model"
          className={`absolute bottom-full left-0 z-50 mb-1.5 w-[min(16.5rem,calc(100vw-2rem))] overflow-hidden rounded-xl border py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)] ${
            theme.isV2
              ? "border-white/[0.1] bg-[#141414]"
              : "border-[#242424] bg-[#0a0a0a]"
          }`}
        >
          <p
            className={`border-b px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[#8a8a8a] ${
              theme.isV2 ? "border-white/[0.06]" : "border-[#242424]"
            }`}
          >
            Model
          </p>
          <ScrollFade
            axis="y"
            fadeColor={theme.isV2 ? "var(--ds-copilot-v2-elevated)" : "#0a0a0a"}
            viewportClassName="max-h-[14rem] py-0.5"
          >
            <ul>
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
                    className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.05] ${
                      active
                        ? theme.isV2
                          ? "bg-[#19E6A3]/10"
                          : "bg-[#171200]/60"
                        : ""
                    }`}
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                      {active ? (
                        <Check
                          className={`size-3.5 ${theme.isV2 ? "text-[#19E6A3]" : "text-[#f2b500]"}`}
                          aria-hidden
                        />
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
          </ScrollFade>
        </div>
      ) : null}
    </div>
  );
}
