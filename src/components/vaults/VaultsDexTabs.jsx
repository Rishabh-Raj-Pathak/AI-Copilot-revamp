import { Activity, ChevronDown, Hexagon, Layers, Zap } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const VAULT_DEX_ICONS = {
  all: Layers,
  hyperliquid: Activity,
  paradex: Hexagon,
  nado: Zap,
};

export const VAULT_ACTIVE_TAB_GRADIENT =
  "linear-gradient(180deg, #1a140b 0%, #18130b 16.67%, #16120b 33.33%, #14110c 50%, #13100c 66.67%, #110f0c 83.33%, #0f0e0c 100%)";

const MENU_GAP_PX = 6;

/**
 * Centered venue dropdown — mobile vaults + positions table.
 */
export function VaultsVenueDropdown({
  tabs,
  activeId,
  onChange,
  dataTour,
  ariaLabel = "Venue filters",
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const ActiveIcon = VAULT_DEX_ICONS[activeTab?.id] ?? Layers;

  const updateMenuPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(280, window.innerWidth - 24);
    setMenuPos({
      left: Math.max(12, rect.left + rect.width / 2 - width / 2),
      top: rect.bottom + MENU_GAP_PX,
      width,
    });
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

  return (
    <div
      ref={rootRef}
      className="vaults-root flex w-full justify-center"
      {...(dataTour ? { "data-tour": dataTour } : {})}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-[41px] min-w-[200px] items-center justify-center gap-2 rounded-full border border-[#785a28] px-5 text-[14px] font-medium uppercase leading-[21px] tracking-[0.35px] text-[#e8d5b5] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: VAULT_ACTIVE_TAB_GRADIENT }}
      >
        <ActiveIcon className="size-4 shrink-0 text-[#e8d5b5]" aria-hidden />
        <span>{activeTab?.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-[#717182] transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              className="vaults-root fixed overflow-hidden rounded-[14px] border border-[rgba(120,90,40,0.28)] bg-[#0c0a08] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
              style={{
                left: menuPos.left,
                top: menuPos.top,
                width: menuPos.width,
                zIndex: 240,
              }}
            >
              {tabs.map((tab) => {
                const Icon = VAULT_DEX_ICONS[tab.id] ?? Layers;
                const selected = tab.id === activeId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(tab.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-medium uppercase tracking-[0.35px] transition-colors ${
                      selected
                        ? "bg-[rgba(204,177,127,0.1)] text-[#e8d5b5]"
                        : "text-[#717182] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e8d5b5]"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {tab.label}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/**
 * Figma: `4421:6210` `TabSwitch` inside `4421:6209` — venue filters in one pill track.
 */
export default function VaultsDexTabs({ activeId, onChange, tabs }) {
  return (
    <>
      <div className="max-tablet:block tablet:hidden">
        <VaultsVenueDropdown
          tabs={tabs}
          activeId={activeId}
          onChange={onChange}
          dataTour="vaults-dex-tabs"
        />
      </div>

      <div
        className="vaults-root hidden min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin] tablet:block"
        data-tour="vaults-dex-tabs"
      >
        <div
          className="inline-flex h-[49px] shrink-0 items-center gap-1 rounded-full border border-[rgba(255,255,255,0.05)] bg-[#0f0f0f] p-1"
          role="tablist"
          aria-label="Venue filters"
        >
          {tabs.map((tab) => {
            const Icon = VAULT_DEX_ICONS[tab.id] ?? Layers;
            const active = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(tab.id)}
                className={`relative inline-flex h-[41px] shrink-0 items-center gap-2 rounded-full border px-5 text-[14px] font-medium uppercase leading-[21px] tracking-[0.35px] transition-colors ${
                  active
                    ? "border-[#785a28] text-[#e8d5b5] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)]"
                    : "border-transparent text-[#717182] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)] hover:text-[#e8d5b5]/80"
                }`}
                style={
                  active ? { backgroundImage: VAULT_ACTIVE_TAB_GRADIENT } : undefined
                }
              >
                <Icon
                  className={`size-4 shrink-0 ${active ? "text-[#e8d5b5]" : "text-[#717182]"}`}
                  aria-hidden
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
