import { useRef, useState } from "react";
import { Check, ClipboardPaste, Cookie, ExternalLink, Link, Monitor, Play, TriangleAlert, X } from "lucide-react";
import { parseCookieFile, uploadVariationalCookies } from "../../../delta-neutral/utils/variational.ts";
import {
  COOKIE_EDITOR_URL,
  VARIATIONAL_MARKET_URL,
  VARIATIONAL_URL,
  VARIATIONAL_VIDEO_SRC,
} from "../../../delta-neutral/components/VariationalOnboardingModal.tsx";
import { useAppToast } from "../appToastContext.js";
import { Dn2Button, Dn2Sheet, SheetCloseButton } from "./Dn2Ui.jsx";
import { BRONZE_SMALL_FILL, FIELD, TILE } from "./dn2Theme.js";

/**
 * Figma E1–E3 "Connect Variational" (4498:2 / 304 / 590) — the phone version
 * of the web `VariationalOnboardingModal`, on the same parser, upload stub and
 * links. Cookie-Editor is a desktop extension, so the sheet leads with a
 * hand-off: copy a link to finish steps 1–3 on a computer, then paste here.
 */

const STEPS = [
  {
    key: "extension",
    title: "Add Cookie-Editor",
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
    detail: "On the market page, open Cookie-Editor, switch to JSON, and hit Copy.",
    href: VARIATIONAL_MARKET_URL,
    cta: "Market",
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
  const toast = useAppToast();
  const fieldRef = useRef(null);
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

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPasteChange(text);
    } catch {
      // Clipboard read needs a permission some browsers never grant — fall back to the field.
      fieldRef.current?.focus();
    }
  };

  const copyDesktopLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.show({ title: "Link copied", message: "Open it on a computer to finish steps 1–3.", tone: "success", theme: "gold" });
    } catch {
      toast.show({ title: "Couldn’t copy the link", message: window.location.href, tone: "error", theme: "gold" });
    }
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
          Variational signs in with your browser session, not a wallet signature.
        </p>

        <section className="flex flex-col gap-2.5 rounded-[12px] border border-[rgba(120,90,40,0.5)] bg-[rgba(204,177,127,0.06)] p-3">
          <div className="flex items-start gap-2.5">
            <Monitor size={18} className="shrink-0 text-[#ccb17f]" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[13px] font-medium leading-[18px] text-[#e8d5b5]">Copying the session needs a computer</p>
              <p className="text-[12px] leading-4 text-[#8f90a1]">
                Cookie-Editor is a desktop Chrome extension. Do steps 1–3 on a computer, then paste the session here.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dn2Button variant="quiet" size="sm" className="flex-1 gap-[5px]" onClick={copyDesktopLink}>
              <Link size={12} aria-hidden />
              Copy desktop link
            </Dn2Button>
            <Dn2Button
              variant="quiet"
              size="sm"
              className="flex-1 gap-[5px]"
              aria-expanded={walkthrough}
              onClick={() => patch({ walkthrough: !walkthrough })}
            >
              <Play size={10} aria-hidden />
              Walkthrough
            </Dn2Button>
          </div>
          {walkthrough ? <Walkthrough /> : null}
        </section>

        <p className={SECTION_LABEL}>Follow these steps on Variational</p>
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
            ref={fieldRef}
            value={raw}
            onChange={(e) => onPasteChange(e.target.value)}
            placeholder="Paste the JSON from Cookie-Editor"
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
          ) : (
            <Dn2Button variant="quiet" size="xs" className="gap-[5px]" onClick={pasteFromClipboard}>
              <ClipboardPaste size={12} aria-hidden />
              Paste
            </Dn2Button>
          )}
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
            Session ready
          </p>
        ) : null}
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
