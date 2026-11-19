import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Loader2, TriangleAlert } from "lucide-react";
import { dexDialogCopy } from "./dexTrading.js";

const DIALOG_SHAPE =
  "flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors";
const DIALOG_SECONDARY = `${DIALOG_SHAPE} border border-[#2e2e2e] bg-[#161616] text-white hover:border-[#454545] hover:bg-[#1c1c1c] disabled:cursor-not-allowed disabled:opacity-50`;
const DIALOG_DANGER = `${DIALOG_SHAPE} bg-[#d53d3d] text-white hover:bg-[#e04848] disabled:cursor-wait`;

/**
 * Desktop dialog for a DEX row: confirm Disconnect, confirm Revoke API key, or
 * explain that open positions block the disconnect.
 *
 * Built on the profile card's surface (#0f0f0f, #242424 hairline, 12px radius)
 * over the app's one scrim. It opens on the DEX's own logo (or an amber
 * warning when it's blocked), so it's clear which venue it acts on before the
 * title is read. Buttons split the width, like the phone sheet's stack.
 *
 * While the confirm is in flight its button carries the loader and the dialog
 * can't be dismissed; it closes when the action lands (`useDexConnection`
 * clears `kind`).
 *
 * @param {object} props
 * @param {'blocked'|'disconnect'|'revoke'|null} props.kind  null renders nothing
 * @param {{ label: string, logo: string }} props.venue
 * @param {Array<{ market: string, side: string, size: string }>} props.positions
 * @param {boolean} props.busy
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onClose
 */
export default function DexConnectionDialog({ kind, venue, positions, busy, onConfirm, onClose }) {
  const titleId = useId();
  const bodyId = useId();
  const panelRef = useRef(null);
  const initialFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const open = Boolean(kind);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    // The safe choice gets focus: Cancel, or Got it when that's the only button.
    initialFocusRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep Tab inside the dialog.
      const items = [...panelRef.current.querySelectorAll("button:not([disabled])")];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const copy = dexDialogCopy(kind, venue, positions);
  const blocked = kind === "blocked";

  return createPortal(
    <div className="ds-scrim fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto px-4 py-8">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default border-0 bg-transparent"
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="relative my-auto w-full max-w-[400px] rounded-xl border border-[#242424] bg-[#0f0f0f] p-6"
      >
        {blocked ? (
          <span
            className="flex size-10 items-center justify-center rounded-full border border-[#f2b500]/30 bg-[#f2b500]/10"
            aria-hidden
          >
            <TriangleAlert className="size-[18px] text-[#f2b500]" />
          </span>
        ) : (
          <span
            className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-[#242424] bg-black"
            aria-hidden
          >
            <img alt="" src={venue.logo} className="max-h-[22px] max-w-[22px] object-contain" />
          </span>
        )}

        <h2 id={titleId} className="mt-4 text-base font-semibold text-white">
          {copy.title}
        </h2>
        <p id={bodyId} className="mt-1.5 text-sm leading-5 text-[#929292]">
          {copy.body}
        </p>

        {blocked && positions.length ? (
          <ul className="mt-4 overflow-hidden rounded-lg border border-[#242424] bg-black">
            {positions.map((p) => {
              const long = p.side === "Long";
              return (
                <li
                  key={p.market}
                  className="flex items-center gap-2 border-t border-[#242424] px-3 py-2.5 first:border-t-0"
                >
                  <span className="text-sm font-medium text-white">{p.market}</span>
                  <span
                    className={`rounded px-1.5 py-px text-[11px] font-medium ${
                      long ? "bg-[#0d2019] text-[#00f3b6]" : "bg-[#2a0f0f] text-[#e0484a]"
                    }`}
                  >
                    {p.side}
                  </span>
                  <span className="ml-auto text-sm font-medium text-white">{p.size}</span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className={`mt-6 grid gap-2 ${blocked ? "grid-cols-1" : "grid-cols-2"}`}>
          {blocked ? (
            <button
              ref={initialFocusRef}
              type="button"
              onClick={onConfirm}
              className={DIALOG_SECONDARY}
            >
              {copy.confirm}
            </button>
          ) : (
            <>
              <button
                ref={initialFocusRef}
                type="button"
                onClick={onClose}
                disabled={busy}
                className={DIALOG_SECONDARY}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                aria-busy={busy || undefined}
                className={DIALOG_DANGER}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    {copy.pendingLabel}
                  </>
                ) : (
                  copy.confirm
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
