import { Check, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import {
  CHAT_LLM_MODELS,
  COMPOSER_CHAT_LLM_MODELS,
} from "../strategyWorkstationMockData.js";

const MENU_WIDTH_PX = 200;
const MENU_GAP_PX = 6;

export default function ChatModelPicker({
  value,
  onChange,
  disabled,
  variant = "default",
}) {
  const isComposer = variant === "composer";
  const theme = useCopilotTheme();
  const models = isComposer ? COMPOSER_CHAT_LLM_MODELS : CHAT_LLM_MODELS;
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const selected = models.find((m) => m.id === value) ?? models[0];

  const updateMenuPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH_PX),
      window.innerWidth - MENU_WIDTH_PX - 8,
    );
    const spaceAbove = rect.top;
    const openAbove = spaceAbove > 140;
    if (openAbove) {
      setMenuPos({
        left,
        bottom: window.innerHeight - rect.top + MENU_GAP_PX,
      });
    } else {
      setMenuPos({
        left,
        top: rect.bottom + MENU_GAP_PX,
      });
    }
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return undefined;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (
        rootRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
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

  const menuShellClass = `overflow-hidden rounded-xl border py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)] ${
    theme.isV2
      ? "border-white/10 bg-[#141414]"
      : "border-[#242424] bg-[#0a0a0a]"
  }`;

  const menuList = (
    <ul className="max-h-56 overflow-y-auto py-1">
      {models.map((model) => {
        const active = model.id === value;
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
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-white"
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {active ? (
                  <Check className="size-3.5 text-white" aria-hidden />
                ) : (
                  <span className="size-3.5" aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px]">{model.name}</span>
                {model.tag ? (
                  <span className="mt-0.5 block truncate text-[11px] text-white/55">
                    {model.tag}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const menuDropdown =
    open && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Select AI model"
            className={menuShellClass}
            style={{
              position: "fixed",
              zIndex: 9999,
              width: MENU_WIDTH_PX,
              ...menuPos,
            }}
          >
            {menuList}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`AI model: ${selected.name}`}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-left transition-all duration-150 disabled:opacity-50 ${
          isComposer
            ? "max-w-36 rounded-lg px-2 py-1.5 text-[13px] text-white sm:max-w-40"
            : `max-w-42 gap-1.5 sm:max-w-48 ${
                theme.isV2
                  ? "rounded-full border border-white/10 bg-[#141414] px-2.5 py-1.5 hover:border-white/16 hover:bg-[#1f1f1f]"
                  : "rounded-lg border border-[#242424] bg-[#121212] px-2 py-1 hover:border-[#454545]"
              }`
        }`}
      >
        {!isComposer ? (
          <Sparkles
            className={`size-3 shrink-0 ${theme.isV2 ? "text-[#00F3B6]" : "text-[#f2b500]"}`}
            aria-hidden
          />
        ) : null}
        <span
          className={`min-w-0 truncate font-medium ${
            isComposer ? "text-[13px] text-white" : "text-[11px] text-white"
          }`}
        >
          {selected.name}
        </span>
        <ChevronDown
          className={`size-3 shrink-0 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {menuDropdown}
    </div>
  );
}
