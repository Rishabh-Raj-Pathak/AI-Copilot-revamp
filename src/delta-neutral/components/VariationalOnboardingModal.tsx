import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { clsx } from "clsx";
import {
  ArrowDown,
  Check,
  ClipboardPaste,
  Cookie,
  ExternalLink,
  Loader2,
  Play,
  TriangleAlert,
  X,
} from "lucide-react";
import type { ManagedDexId } from "./ActiveVaultCard";
import {
  parseCookieFile,
  uploadVariationalCookies,
  type ParsedCookieFile,
} from "../utils/variational";

/**
 * Drop a real asset or embeddable URL here to replace the placeholder frame.
 * A direct video file (…​.mp4/.webm) renders in a <video>; anything else falls
 * back to the styled placeholder.
 */
const VARIATIONAL_VIDEO_SRC = "";

/** Cookie-Editor on the Chrome Web Store. */
const COOKIE_EDITOR_URL =
  "https://chromewebstore.google.com/detail/cookie-editor/ookdjilphngeeeghgngjabigmpepanpl";
const VARIATIONAL_URL = "https://variational.io/";
/** The live BTC market — where the session must be active to copy it. */
const VARIATIONAL_MARKET_URL = "https://omni.variational.io/perpetual/BTC";

/**
 * The three things the user does on variational.io. Clicking a row (or its
 * link) marks it done — pure React state, deliberately not persisted: a page
 * refresh restarts the whole flow (project convention).
 */
type TaskKey = "extension" | "signin" | "copy";

type UploadState = "idle" | "uploading" | "error";

type VariationalOnboardingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the pasted session is parsed + accepted; the builder marks Variational connected. */
  onConnected: (wallet?: string) => void;
  /** The other leg the user paired Variational with, shown for context. */
  pairedDex?: ManagedDexId;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function VariationalOnboardingModal({
  open,
  onOpenChange,
  onConnected,
  pairedDex,
}: VariationalOnboardingModalProps) {
  const reduced = usePrefersReducedMotion();
  const [tasks, setTasks] = useState<Record<TaskKey, boolean>>({
    extension: false,
    signin: false,
    copy: false,
  });
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedCookieFile | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Set when the user opens the market tab from step 3; on their return we
  // scroll the paste field into view + focus it so they land right on it.
  const [awaitingPaste, setAwaitingPaste] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  // True while the paste field is scrolled out of view below the fold, so we
  // can surface a "paste below" nudge — otherwise the input is easy to miss.
  const [scrollHidden, setScrollHidden] = useState(false);

  // Escape closes (but not mid-activation — the request is in flight).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && uploadState !== "uploading") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange, uploadState]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset the whole flow every time it opens.
  useEffect(() => {
    if (!open) return;
    setTasks({ extension: false, signin: false, copy: false });
    setRaw("");
    setParsed(null);
    setPasteError(null);
    setUploadState("idle");
    setUploadError(null);
    setAwaitingPaste(false);
  }, [open]);

  // When the user returns from the market tab (step 3), bring the paste field
  // into view and focus it so they don't have to hunt for where to paste.
  useEffect(() => {
    if (!open || !awaitingPaste) return;
    const onReturn = () => {
      if (document.visibilityState !== "visible") return;
      setAwaitingPaste(false);
      window.setTimeout(() => {
        fieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        fieldRef.current?.focus({ preventScroll: true });
      }, 180);
    };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [open, awaitingPaste]);

  // Track whether the scroll body has content hidden below the fold. The paste
  // field lives at the bottom, so when it's out of view we show a cue pointing
  // down to it. Recomputes on scroll, viewport resize, and content growth
  // (error rows / parsed state change the body height).
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const overflowing = el.scrollHeight - el.clientHeight > 12;
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 28;
      setScrollHidden(overflowing && !atBottom);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) {
      ro.observe(el);
      if (contentRef.current) ro.observe(contentRef.current);
    }
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [open]);

  const scrollToField = () =>
    fieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  if (!open || typeof document === "undefined") return null;

  const markTask = (key: TaskKey) =>
    setTasks((prev) => ({ ...prev, [key]: true }));
  const toggleTask = (key: TaskKey) =>
    setTasks((prev) => ({ ...prev, [key]: !prev[key] }));

  const onPasteChange = (value: string) => {
    setRaw(value);
    setUploadState("idle");
    setUploadError(null);
    const trimmed = value.trim();
    if (!trimmed) {
      setParsed(null);
      setPasteError(null);
      return;
    }
    const result = parseCookieFile(trimmed);
    if (!result) {
      setParsed(null);
      setPasteError(
        "That doesn't look like a session copy. In Cookie-Editor, hit Copy, then paste the whole thing here.",
      );
      return;
    }
    setParsed(result);
    setPasteError(null);
    markTask("copy");
  };

  const handleActivate = () => {
    if (!parsed) return;
    setUploadState("uploading");
    setUploadError(null);
    uploadVariationalCookies({
      content: JSON.stringify(parsed.cookies),
      cookieCount: parsed.cookies.length,
    })
      .then((res) => {
        onConnected(res.wallet);
      })
      .catch((err: unknown) => {
        setUploadState("error");
        setUploadError(
          err instanceof Error ? err.message : "Activation failed. Try again.",
        );
      });
  };

  const tasksDone = Object.values(tasks).filter(Boolean).length;
  const canActivate = !!parsed && uploadState !== "uploading";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 font-['Onest',sans-serif]">
      <motion.button
        type="button"
        className="absolute inset-0 bg-[#050505]/88 backdrop-blur-md"
        aria-label="Close Variational onboarding"
        onClick={() => uploadState !== "uploading" && onOpenChange(false)}
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Connect Variational"
        className="relative z-[201] flex max-h-[min(94vh,760px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[16px] border border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] text-[#f5f5f5] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        initial={reduced ? undefined : { opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[rgba(214,176,106,0.16)] px-5 pt-4 pb-3.5 max-tablet:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[rgba(214,176,106,0.3)] bg-[rgba(214,176,106,0.1)] text-[#d6b06a]">
              <Cookie className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold text-[#f1dfbf]">
                Connect Variational
              </h2>
              <p className="truncate text-[11px] text-[#8f9098]">
                {pairedDex
                  ? `Paired with ${pairedDex} · about a minute`
                  : "Paste your session · about a minute"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => uploadState !== "uploading" && onOpenChange(false)}
            disabled={uploadState === "uploading"}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.08)] text-[#8f9098] transition-colors hover:border-[rgba(214,176,106,0.4)] hover:text-[#f1dfbf] disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto px-5 py-4 max-tablet:px-4"
          >
            <div ref={contentRef}>
          <p className="text-[13px] leading-relaxed text-[#a9aab2]">
            Variational signs in with your browser session, not a wallet
            signature. Watch the short walkthrough, then follow the steps below.
          </p>

          {/* Walkthrough video — visible up front so the flow is obvious before
              the user heads over to Variational. */}
          <VideoFrame />

          {/* The three things to do on Variational. */}
          <p className="mt-4 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[1px] text-[#8a7550]">
            Follow these steps on Variational
            <span className="ml-1.5 font-medium normal-case tracking-normal text-[#6f7078]">
              · then come back here
            </span>
          </p>
          <div className="flex flex-col gap-1.5">
            {TASK_ROWS.map((row, i) => (
              <TaskRow
                key={row.key}
                index={i}
                row={row}
                done={tasks[row.key]}
                onToggle={() => toggleTask(row.key)}
                onMark={() => {
                  markTask(row.key);
                  // Opening the market means the next thing they do is copy +
                  // come back to paste — arm the auto-scroll for their return.
                  if (row.key === "copy") setAwaitingPaste(true);
                }}
              />
            ))}
          </div>

          {/* Paste + activate. */}
          <p className="mt-5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[1px] text-[#8a7550]">
            Paste your session here
          </p>
          <PasteField
            fieldRef={fieldRef}
            value={raw}
            parsed={parsed}
            error={pasteError}
            uploadState={uploadState}
            uploadError={uploadError}
            /* Copied but nothing pasted yet → draw the eye to the field. */
            highlight={tasks.copy && !parsed && !pasteError}
            onChange={onPasteChange}
            onClear={() => onPasteChange("")}
          />
            </div>
          </div>

          {/* Bottom cue — a soft fade plus a tap-to-jump nudge, shown only while
              the paste field is scrolled out of view so users know an input
              waits below. Hides itself the moment the field is on screen. */}
          <div
            className={clsx(
              "pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-3 transition-opacity duration-200",
              scrollHidden ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(7,7,7,0)_0%,rgba(7,7,7,0.55)_45%,rgba(7,7,7,0.95)_100%)]" />
            <button
              type="button"
              onClick={scrollToField}
              className={clsx(
                "relative inline-flex items-center gap-1.5 rounded-full border border-[rgba(214,176,106,0.5)] bg-[rgba(20,16,11,0.96)] px-3.5 py-1.5 text-[11px] font-semibold text-[#f0ddb9] shadow-[0_8px_22px_rgba(0,0,0,0.55)] backdrop-blur transition-all duration-200 hover:border-[rgba(206,163,95,0.78)]",
                scrollHidden
                  ? "pointer-events-auto translate-y-0"
                  : "pointer-events-none translate-y-1",
              )}
            >
              Paste session below
              <ArrowDown className="h-3.5 w-3.5 motion-safe:animate-bounce" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[rgba(214,176,106,0.16)] px-5 py-3.5 max-tablet:px-4">
          <span className="text-[11px] text-[#6f7078]">
            {parsed
              ? `${parsed.cookies.length} cookies ready`
              : `${tasksDone}/${TASK_ROWS.length} done on Variational`}
          </span>
          <button
            type="button"
            onClick={handleActivate}
            disabled={!canActivate}
            className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(43,34,24,0.98)_0%,rgba(19,15,11,0.99)_100%)] px-5 text-[12px] font-semibold uppercase tracking-[0.6px] text-[#f0ddb9] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-all hover:border-[rgba(206,163,95,0.74)] hover:bg-[linear-gradient(180deg,rgba(49,39,29,1)_0%,rgba(22,18,13,1)_100%)] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50"
          >
            {uploadState === "uploading" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Connecting…
              </>
            ) : (
              "Connect Variational"
            )}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

/* ------------------------------- Video --------------------------------- */

function VideoFrame() {
  const isVideoFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(VARIATIONAL_VIDEO_SRC);
  return (
    <div className="relative mt-3.5 aspect-video max-h-[156px] w-full overflow-hidden rounded-[12px] border border-[rgba(214,176,106,0.22)] bg-[linear-gradient(135deg,rgba(20,18,15,0.98)_0%,rgba(9,9,9,0.99)_100%)]">
      {isVideoFile ? (
        <video
          src={VARIATIONAL_VIDEO_SRC}
          controls
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(214,176,106,0.45)] bg-[rgba(214,176,106,0.12)] text-[#f1dfbf] shadow-[0_0_0_6px_rgba(214,176,106,0.06)]">
            <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
          </span>
          <span className="text-[11.5px] font-medium text-[#a9aab2]">
            Walkthrough · copy your Variational session
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Tasks ---------------------------------- */

type TaskRowDef = {
  key: TaskKey;
  title: string;
  detail: string;
  href?: string;
  cta?: string;
};

const TASK_ROWS: TaskRowDef[] = [
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

type TaskRowProps = {
  index: number;
  row: TaskRowDef;
  done: boolean;
  onToggle: () => void;
  onMark: () => void;
};

function TaskRow({ index, row, done, onToggle, onMark }: TaskRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "flex w-full items-center gap-3 rounded-[11px] border px-3 py-2.5 text-left transition-colors",
        done
          ? "border-[rgba(214,176,106,0.35)] bg-[rgba(214,176,106,0.05)]"
          : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(214,176,106,0.3)]",
      )}
    >
      <span
        className={clsx(
          "inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
          done
            ? "border-[#d6b06a] bg-[rgba(214,176,106,0.9)] text-[#141414]"
            : "border-[rgba(214,176,106,0.35)] bg-[rgba(214,176,106,0.1)] text-[#f1dfbf]",
        )}
      >
        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            "text-[13px] font-medium transition-colors",
            done ? "text-[#b9a887]" : "text-[#e8e9ee]",
          )}
        >
          {row.title}
        </p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-[#8f9098]">
          {row.detail}
        </p>
      </div>
      {row.href && (
        <a
          href={row.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onMark();
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-[rgba(173,134,73,0.5)] bg-[linear-gradient(180deg,rgba(42,34,25,0.95)_0%,rgba(20,16,12,0.98)_100%)] px-2.5 py-1.5 text-[11px] font-semibold text-[#f0ddb9] transition-colors hover:border-[rgba(206,163,95,0.74)]"
        >
          {row.cta}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </button>
  );
}

/* ------------------------------ Paste ---------------------------------- */

type PasteFieldProps = {
  fieldRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  parsed: ParsedCookieFile | null;
  error: string | null;
  uploadState: UploadState;
  uploadError: string | null;
  /** Nudge attention to the empty field (they've copied but not pasted yet). */
  highlight: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
};

function PasteField({
  fieldRef,
  value,
  parsed,
  error,
  uploadState,
  uploadError,
  highlight,
  onChange,
  onClear,
}: PasteFieldProps) {
  const hasValue = value.trim().length > 0;
  const showError = !!error || (uploadState === "error" && !!uploadError);
  return (
    <div>
      <div
        className={clsx(
          "relative rounded-[12px] border-2 transition-colors",
          showError
            ? "border-[rgba(220,90,90,0.5)] bg-[rgba(220,90,90,0.05)]"
            : parsed
              ? "border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.04)]"
              : highlight
                ? "border-[rgba(214,176,106,0.7)] bg-[rgba(214,176,106,0.06)] shadow-[0_0_0_4px_rgba(214,176,106,0.1)]"
                : "border-[rgba(214,176,106,0.4)] bg-[rgba(255,255,255,0.03)] focus-within:border-[rgba(214,176,106,0.7)]",
        )}
      >
        <textarea
          ref={fieldRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          spellCheck={false}
          disabled={uploadState === "uploading"}
          className="relative z-[1] w-full resize-none bg-transparent px-3 py-2.5 pr-9 font-mono text-[11.5px] leading-relaxed text-[#e8e9ee] focus:outline-none disabled:opacity-60"
        />
        {hasValue && uploadState !== "uploading" && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 z-[2] inline-flex h-6 w-6 items-center justify-center rounded-[7px] border border-[rgba(255,255,255,0.08)] text-[#8f9098] transition-colors hover:border-[rgba(214,176,106,0.4)] hover:text-[#f1dfbf]"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Empty-state prompt — centered so the box unmistakably reads as a
            paste target, not a label. Sits behind the textarea (which is
            transparent) and ignores clicks so focus/paste still hit the field. */}
        {!hasValue && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span
              className={clsx(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                highlight
                  ? "border-[rgba(214,176,106,0.6)] bg-[rgba(214,176,106,0.14)] text-[#f1dfbf]"
                  : "border-[rgba(214,176,106,0.35)] bg-[rgba(214,176,106,0.1)] text-[#d6b06a]",
              )}
            >
              <ClipboardPaste className="h-4 w-4" />
            </span>
            <span className="text-[12.5px] font-medium text-[#cfd0d6]">
              Paste your copied session here
            </span>
            <span className="text-[10.5px] text-[#6f7078]">
              Click the box, then paste (⌘V / Ctrl+V)
            </span>
          </div>
        )}
      </div>

      {showError && (
        <div className="mt-2 flex items-start gap-2 rounded-[10px] border border-[rgba(220,90,90,0.35)] bg-[rgba(220,90,90,0.08)] px-3 py-2 text-[11.5px] leading-snug text-[#e8918f]">
          <TriangleAlert className="mt-[1px] h-3.5 w-3.5 shrink-0" />
          <span>{error ?? uploadError}</span>
        </div>
      )}
    </div>
  );
}
