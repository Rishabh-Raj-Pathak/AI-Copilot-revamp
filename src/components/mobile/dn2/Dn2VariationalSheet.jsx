import { useState } from "react";
import { Check, Cookie, ExternalLink, Play, TriangleAlert, X } from "lucide-react";
import { parseCookieFile, uploadVariationalCookies } from "../../../delta-neutral/utils/variational.ts";
import {
  COOKIE_EDITOR_URL,
  VARIATIONAL_MARKET_URL,
  VARIATIONAL_URL,
  VARIATIONAL_VIDEO_SRC,
} from "../../../delta-neutral/components/VariationalOnboardingModal.tsx";
import { Dn2Button, Dn2Sheet, SheetCloseButton } from "./Dn2Ui.jsx";
import { BRONZE_SMALL_FILL, FIELD, TILE } from "./dn2Theme.js";

/**
 * Figma E1–E3 "Connect Variational" (4498:2 / 304 / 590) — the web
 * `VariationalOnboardingModal` as a sheet, with its copy and fields: intro,
 * walkthrough, the three steps, the paste box and the step count. Same parser,
 * upload stub and links. Only the paste hint is reworded for touch.
 */

const STEPS = [
  {
    key: "extension",
    title: "Add Cookie-Editor to your browser",
    detail: "A free Chrome extension that copies your session in one click.",
    href: COOKIE_EDITOR_URL,
    cta: "Add",
  },
  {
    key: "signin",
    title: "Sign in to Variational",
    detail: "Connect your wallet as you normally would.",
    href: VARIATIONAL_URL,
    cta: "Open",
  },
  {
    key: "copy",
    title: "Copy your session",
    detail: "On the market page, open the Cookie-Editor extension, switch to JSON, and hit Copy. Then paste it below.",
    href: VARIATIONAL_MARKET_URL,
    cta: "Open market",
  },
];

const NOT_A_SESSION =
  "That doesn’t look like a session copy. In Cookie-Editor, hit Copy, then paste the whole thing here.";

const SECTION_LABEL = "text-[11px] font-medium uppercase leading-[14px] tracking-[0.5px] text-[#ccb17f]";

const FRESH = {
  tasks: { extension: false, signin: false, copy: false },
  raw: "",
  parsed: null,
  pasteError: null,
  upload: "idle",
  uploadError: null,
  walkthrough: false,
};

export default function Dn2VariationalSheet({ open, onOpenChange, onConnected, pairedDex }) {
  const [state, setState] = useState(FRESH);
  // The flow restarts every time the sheet opens (web modal parity).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setState(FRESH);
  }

  const { tasks, raw, parsed, pasteError, upload, uploadError, walkthrough } = state;
  const patch = (next) => setState((prev) => ({ ...prev, ...next }));
  /** Functional, so two taps landing in one render both count. */
  const setTask = (key, done) =>
    setState((prev) => ({ ...prev, tasks: { ...prev.tasks, [key]: done ?? !prev.tasks[key] } }));
  const uploading = upload === "uploading";
  const close = () => {
    if (!uploading) onOpenChange(false);
  };

  const onPasteChange = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      patch({ raw: value, parsed: null, pasteError: null, upload: "idle", uploadError: null });
      return;
    }
    const result = parseCookieFile(trimmed);
    setState((prev) => ({
      ...prev,
      raw: value,
      upload: "idle",
      uploadError: null,
      parsed: result,
      pasteError: result ? null : NOT_A_SESSION,
      tasks: result ? { ...prev.tasks, copy: true } : prev.tasks,
    }));
  };

  const connect = () => {
    if (!parsed || uploading) return;
    patch({ upload: "uploading", uploadError: null });
    uploadVariationalCookies({ content: JSON.stringify(parsed.cookies), cookieCount: parsed.cookies.length })
      .then((res) => onConnected(res.wallet))
      .catch((err) =>
        patch({ upload: "error", uploadError: err instanceof Error ? err.message : "Activation failed. Try again." }),
      );
  };

  const done = Object.values(tasks).filter(Boolean).length;
  const fieldTone = parsed
    ? `${FIELD} border-[rgba(0,212,146,0.5)]!`
    : pasteError
      ? "rounded-[12px] border border-[rgba(229,72,77,0.6)] bg-[rgba(229,72,77,0.06)]"
      : FIELD;

  return (
    <Dn2Sheet
      open={open}
      onClose={close}
      title="Connect Variational"
      fullHeight
      header={({ dragHandleProps, titleId }) => (
        <div
          className="flex shrink-0 touch-none select-none flex-col items-center gap-3 border-b border-white/[0.06] px-4 pb-3 pt-2"
          {...dragHandleProps}
        >
          <span className="h-1 w-10 shrink-0 rounded-full bg-[#3a3026]" aria-hidden />
          <div className="flex h-10 w-full items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(120,90,40,0.6)] text-[#ccb17f]"
              style={BRONZE_SMALL_FILL}
              aria-hidden
            >
              <Cookie size={18} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 id={titleId} className="truncate text-[16px] font-semibold leading-[22px] text-[#e8d5b5]">
                Connect Variational
              </h2>
              <p className="truncate text-[12px] leading-4 text-[#8f90a1]">
                {pairedDex ? `Paired with ${pairedDex} · about a minute` : "About a minute"}
              </p>
            </div>
            <SheetCloseButton onPress={close} />
          </div>
        </div>
      )}
      footer={
        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] leading-[14px] text-[#717182]">{done}/3 done on Variational</p>
          <Dn2Button variant="primary" size="lg" className="w-full" disabled={!parsed || uploading} onClick={connect}>
            {uploading ? "Connecting…" : "Connect Variational"}
          </Dn2Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5 p-4">
        <p className="text-[13px] leading-[18px] text-[#b4b5c2]">
          Variational signs in with your browser session, not a wallet signature. Watch the short walkthrough, then
          follow the steps below.
        </p>

        {/* The web shows the video up front; on a phone it opens from this row so the steps stay in view. */}
        <Dn2Button
          variant="quiet"
          size="sm"
          className="w-full gap-[5px]"
          aria-expanded={walkthrough}
          onClick={() => patch({ walkthrough: !walkthrough })}
        >
          <Play size={10} aria-hidden />
          <span className="truncate">Walkthrough · copy your Variational session</span>
        </Dn2Button>
        {walkthrough ? <Walkthrough /> : null}

        <p className={SECTION_LABEL}>
          Follow these steps on Variational
          {/* Wraps whole, never leaving "here" alone on a line. */}
          <span className="ml-1.5 inline-block whitespace-nowrap font-normal normal-case tracking-normal text-[#717182]">
            · then come back here
          </span>
        </p>
        <ol className={`${TILE} flex flex-col`}>
          {STEPS.map((step, index) => {
            const isDone = tasks[step.key];
            return (
              <li
                key={step.key}
                className={`flex items-start gap-3 p-3 ${index > 0 ? "border-t border-white/[0.05]" : ""}`}
              >
                <button
                  type="button"
                  aria-pressed={isDone}
                  onClick={() => setTask(step.key)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  {isDone ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f2ddb5_0%,#ba8f52_100%)] text-[#1a140c]">
                      <Check size={13} strokeWidth={2.5} aria-hidden />
                    </span>
                  ) : (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[rgba(120,90,40,0.6)] text-[11px] font-semibold leading-[14px] text-[#f0ddb9]">
                      {index + 1}
                    </span>
                  )}
                  <span className={`flex min-w-0 flex-1 flex-col gap-0.5 ${isDone ? "text-[#8f90a1]" : ""}`}>
                    <span className={`text-[13px] font-medium leading-[18px] ${isDone ? "" : "text-[#e8d5b5]"}`}>
                      {step.title}
                    </span>
                    <span className="text-[11px] leading-[15px] text-[#8f90a1]">{step.detail}</span>
                  </span>
                </button>
                <Dn2Button
                  variant="quiet"
                  size="sm"
                  className="gap-[5px]"
                  onClick={() => {
                    window.open(step.href, "_blank", "noopener,noreferrer");
                    setTask(step.key, true);
                  }}
                >
                  {step.cta}
                  <ExternalLink size={11} aria-hidden />
                </Dn2Button>
              </li>
            );
          })}
        </ol>

        <p className={SECTION_LABEL}>Paste your session here</p>
        <div className={`flex h-[84px] items-start gap-2 p-3 ${fieldTone}`}>
          <textarea
            value={raw}
            onChange={(e) => onPasteChange(e.target.value)}
            placeholder="Paste your copied session here"
            aria-label="Variational session JSON"
            aria-invalid={Boolean(pasteError)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={`h-full min-w-0 flex-1 resize-none bg-transparent outline-none placeholder:font-sans placeholder:text-[13px] placeholder:text-[#717182] ${
              // Empty it is 16px so focusing it never zooms iOS; once a session is in, it
              // reads as Figma's 12px JSON preview (the zoom decision was made on focus).
              raw ? "font-app-mono text-[12px] leading-[17px]" : "text-[16px] leading-[18px]"
            } ${parsed ? "text-[#b0b0be]" : "text-[#dcdce8]"}`}
          />
          {raw ? (
            <button
              type="button"
              onClick={() => onPasteChange("")}
              aria-label="Clear session"
              className="app-pressable relative flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-[#8f90a1] after:absolute after:-inset-2"
            >
              <X size={14} aria-hidden />
            </button>
          ) : null}
        </div>

        {pasteError || uploadError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[12px] border border-[rgba(229,72,77,0.35)] bg-[rgba(229,72,77,0.08)] px-3 py-2.5"
          >
            <TriangleAlert size={14} className="mt-px shrink-0 text-[#f87171]" aria-hidden />
            <p className="min-w-0 flex-1 text-[12px] leading-4 text-[#f87171]">{pasteError ?? uploadError}</p>
          </div>
        ) : parsed ? (
          <p className="flex items-center gap-1.5 text-[12px] font-medium leading-4 text-[#00d492]">
            <Check size={14} aria-hidden />
            {parsed.cookies.length} {parsed.cookies.length === 1 ? "cookie" : "cookies"} ready
          </p>
        ) : (
          // The web hint ("Click the box, then paste (⌘V / Ctrl+V)"), worded for touch.
          <p className="text-[11px] leading-[14px] text-[#717182]">Tap the box, then paste</p>
        )}
      </div>
    </Dn2Sheet>
  );
}

/** The web modal's walkthrough frame: the video once one is set, a placeholder until then. */
function Walkthrough() {
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(VARIATIONAL_VIDEO_SRC);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[12px] border border-[rgba(214,176,106,0.22)] bg-[linear-gradient(135deg,rgba(20,18,15,0.98)_0%,rgba(9,9,9,0.99)_100%)]">
      {isVideo ? (
        <video src={VARIATIONAL_VIDEO_SRC} controls playsInline className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
          <span className="flex size-12 items-center justify-center rounded-full border border-[rgba(214,176,106,0.45)] bg-[rgba(214,176,106,0.12)] text-[#f1dfbf]">
            <Play size={20} fill="currentColor" className="translate-x-px" aria-hidden />
          </span>
          <span className="text-[12px] font-medium text-[#a9aab2]">Walkthrough · copy your Variational session</span>
        </div>
      )}
    </div>
  );
}
