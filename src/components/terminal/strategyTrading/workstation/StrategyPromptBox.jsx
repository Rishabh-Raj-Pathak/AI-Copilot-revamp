import {
  ArrowUp,
  Code2,
  FileText,
  Image,
  Link2,
  Paperclip,
  Plus,
  Send,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../../ui/button.jsx";
import { Textarea } from "../../../ui/textarea.jsx";
import {
  CHAT_LLM_MODELS,
  DEFAULT_CHAT_LLM_MODEL_ID,
  getPromptSuggestions,
} from "../strategyWorkstationMockData.js";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import ChatModelPicker from "./ChatModelPicker.jsx";
import ScrollFade from "./ScrollFade.jsx";

/** @typedef {'document'|'link'|'image'|'code'|'video'} AttachmentType */
/** @typedef {{ id: string, type: AttachmentType, label: string, meta?: string }} PromptAttachment */

const ATTACH_MENU = [
  { type: "document", label: "Document", icon: FileText },
  { type: "image", label: "Image", icon: Image },
  { type: "link", label: "Link", icon: Link2 },
  { type: "code", label: "Code", icon: Code2 },
];

const COMPOSER_ATTACH_MENU = [
  { type: "link", label: "Link", icon: Link2 },
  { type: "document", label: "PDF", icon: FileText },
  { type: "code", label: "Code", icon: Code2 },
];

function AttachmentChip({ attachment, onRemove, isV2 }) {
  const menu = [...ATTACH_MENU, { type: "video", label: "Video", icon: Video }];
  const Icon = menu.find((m) => m.type === attachment.type)?.icon ?? Paperclip;
  return (
    <span
      className={
        isV2
          ? "inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-[#141414] py-0.5 pl-2.5 pr-0.5 text-[10px] text-[#a0a0a0]"
          : "inline-flex max-w-full items-center gap-1 rounded-full border border-[#333] bg-[#161616] py-0.5 pl-2 pr-0.5 text-[10px] text-[#bfbfbf]"
      }
    >
      <Icon className="size-3 shrink-0 text-[#8a8a8a]" aria-hidden />
      <span className="truncate" title={attachment.meta ?? attachment.label}>
        {attachment.label}
      </span>
      <button
        type="button"
        aria-label={`Remove ${attachment.label}`}
        className="rounded-full p-0.5 text-[#585858] transition-colors hover:bg-white/5 hover:text-white"
        onClick={() => onRemove(attachment.id)}
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

function AttachDropdownMenu({ items, onSelect, className = "" }) {
  return (
    <div
      role="menu"
      className={`absolute bottom-full left-0 z-50 mb-1.5 min-w-46 overflow-hidden rounded-xl border border-white/10 bg-[#1c1f21] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)] ${className}`}
    >
      {items.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[rgba(255,255,255,0.88)] transition-colors hover:bg-white/6"
          onClick={() => onSelect(type)}
        >
          <Icon className="size-4 shrink-0 text-[rgba(255,255,255,0.55)]" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function StrategyPromptBox({
  value,
  onChange,
  onSubmit,
  loading = false,
  chatModelId,
  onChatModelChange,
  attachments = [],
  onAttachmentsChange,
  enableSuggestions = true,
  placeholder = "Describe the strategy you want to build…",
  variant = "chat",
  /** @type {'create' | 'chat'} — only when variant is composer */
  composerShell = "create",
  className = "",
}) {
  const isComposer = variant === "composer";
  const isChatComposer = isComposer && composerShell === "chat";
  const theme = useCopilotTheme();

  const [attachOpen, setAttachOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [composerMultiline, setComposerMultiline] = useState(false);

  const rootRef = useRef(null);
  const attachRef = useRef(null);
  const composerTextareaRef = useRef(null);
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const codeId = useId();

  /** Single-line composer row height (16px × 1.5 line-height). */
  const COMPOSER_LINE_PX = 24;

  const activeLlm =
    CHAT_LLM_MODELS.find((m) => m.id === chatModelId) ?? CHAT_LLM_MODELS[0];

  const setAttachments = useCallback(
    (updater) => {
      if (!onAttachmentsChange) return;
      onAttachmentsChange(
        typeof updater === "function" ? updater(attachments) : updater,
      );
    },
    [attachments, onAttachmentsChange],
  );

  const addAttachment = useCallback(
    (item) => {
      setAttachments((prev) => [...prev, item]);
    },
    [setAttachments],
  );

  const removeAttachment = useCallback(
    (id) => {
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    },
    [setAttachments],
  );

  useEffect(() => {
    if (!enableSuggestions) {
      setSuggestions([]);
      return;
    }
    setSuggestions(getPromptSuggestions(value));
    setHighlightIdx(-1);
  }, [value, enableSuggestions]);

  useEffect(() => {
    if (!attachOpen) return undefined;
    const onPointerDown = (e) => {
      if (!attachRef.current?.contains(e.target)) setAttachOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setAttachOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [attachOpen]);

  const handleAttachType = useCallback(
    (type) => {
      if (type === "document") {
        docInputRef.current?.click();
        setAttachOpen(false);
        return;
      }
      if (type === "image") {
        imageInputRef.current?.click();
        setAttachOpen(false);
        return;
      }
      if (type === "code") {
        setCodeOpen(true);
        setAttachOpen(false);
        return;
      }
      if (type === "link") {
        const url = window.prompt("Paste link URL");
        if (url?.trim()) {
          const trimmed = url.trim();
          addAttachment({
            id: `att-${Date.now()}`,
            type: "link",
            label: trimmed.length > 40 ? `${trimmed.slice(0, 37)}…` : trimmed,
            meta: trimmed,
          });
        }
        setAttachOpen(false);
      }
    },
    [addAttachment],
  );

  const insertSuggestion = useCallback(
    (text) => {
      onChange(text);
      setSuggestions([]);
      setHighlightIdx(-1);
      rootRef.current?.querySelector("textarea")?.focus();
    },
    [onChange],
  );

  const handleTextareaKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        return;
      }
      if (
        e.key === "Tab" ||
        (e.key === "Enter" && !e.shiftKey && highlightIdx >= 0)
      ) {
        if (highlightIdx >= 0) {
          e.preventDefault();
          insertSuggestion(suggestions[highlightIdx]);
          return;
        }
      }
      if (e.key === "Escape") {
        setSuggestions([]);
        setHighlightIdx(-1);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSubmit?.();
    }
  };

  const handleFile = (type, file) => {
    if (!file) return;
    addAttachment({
      id: `att-${Date.now()}`,
      type,
      label: file.name,
      meta: `${(file.size / 1024).toFixed(1)} KB`,
    });
  };

  const handleAddCode = () => {
    const code = codeSnippet.trim();
    if (!code) return;
    const firstLine = code.split("\n")[0] ?? "Code snippet";
    addAttachment({
      id: `att-${Date.now()}`,
      type: "code",
      label: firstLine.length > 32 ? `${firstLine.slice(0, 29)}…` : firstLine,
      meta: code.length > 120 ? `${code.slice(0, 117)}…` : code,
    });
    setCodeSnippet("");
    setCodeOpen(false);
    setAttachOpen(false);
  };

  const showSuggestions = enableSuggestions && suggestions.length > 0;

  const resizeTextarea = useCallback(() => {
    const el = isComposer
      ? composerTextareaRef.current
      : rootRef.current?.querySelector("textarea");
    if (!el) return;
    const maxHeight = isComposer ? 176 : 144;
    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    const nextHeight = Math.min(scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    if (isComposer) {
      setComposerMultiline(
        scrollHeight > COMPOSER_LINE_PX + 2 || value.includes("\n"),
      );
    }
  }, [isComposer, value]);

  useEffect(() => {
    resizeTextarea();
  }, [value, isComposer, resizeTextarea]);

  const formFocusReset =
    "focus-within:outline-none focus-within:ring-0 focus-within:ring-offset-0";

  const composerShellClass = isChatComposer
    ? "ds-strategy-composer-shell--chat"
    : "ds-strategy-composer-shell--inline";

  const formShell = isComposer
    ? `ds-strategy-composer-shell ${composerShellClass} ${formFocusReset} ${
        isChatComposer ? "px-3" : "px-3 sm:px-4"
      } ${composerMultiline ? "py-3 sm:py-3.5" : "py-2.5 sm:py-3"}`
    : `${theme.chatPromptShell} ${formFocusReset}`;

  const textareaFocusReset =
    "focus:outline-none focus-visible:outline-none focus-visible:!border-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!shadow-none";

  const textareaScrollClass = theme.isV2 ? "ds-scrollbar-hidden" : "";
  const textareaClass = isComposer
    ? `!min-h-6 !max-h-44 !resize-none !overflow-y-auto !border-0 !bg-transparent !p-0 text-[16px] leading-[1.5] font-normal text-[rgba(255,255,255,0.88)] shadow-none placeholder:text-[#7d8689] ${textareaScrollClass} ${textareaFocusReset}`
    : theme.isV2
      ? `!min-h-[2.75rem] !max-h-36 !resize-none !overflow-y-auto !border-0 !bg-transparent !p-0 text-[13px] leading-relaxed text-[#f4f4f4] shadow-none placeholder:text-[#8a8a8a] ${textareaScrollClass} ${textareaFocusReset}`
      : `!min-h-[2.75rem] !max-h-36 !resize-none !overflow-y-auto !border-0 !bg-transparent !p-0 text-sm shadow-none ${textareaFocusReset}`;

  const iconBtnClass = theme.isV2
    ? "shrink-0 rounded-lg p-2 text-[#8a8a8a] transition-colors hover:bg-white/[0.06] hover:text-[#f4f4f4] disabled:opacity-40"
    : "shrink-0 rounded-md p-1.5 text-[#585858] hover:text-white disabled:opacity-50";

  const composerAttachControl = (
    <div ref={attachRef} className="relative shrink-0">
      <button
        type="button"
        disabled={loading}
        aria-label="Add attachment"
        aria-expanded={attachOpen}
        aria-haspopup="menu"
        className="flex size-8 items-center justify-center rounded-lg text-[rgba(255,255,255,0.55)] transition-colors hover:bg-white/6 hover:text-[rgba(255,255,255,0.88)] disabled:opacity-40 sm:size-9"
        onClick={() => {
          setAttachOpen((v) => !v);
          setCodeOpen(false);
        }}
      >
        <Plus className="size-5" aria-hidden />
      </button>
      {attachOpen ? (
        <AttachDropdownMenu
          items={COMPOSER_ATTACH_MENU}
          onSelect={handleAttachType}
        />
      ) : null}
    </div>
  );

  const composerSendControl = (
    <button
      type="submit"
      disabled={!value.trim() || loading}
      aria-label="Send message"
      className="ds-strategy-composer-send size-8! shrink-0 sm:size-9!"
    >
      <ArrowUp className="size-4" aria-hidden />
    </button>
  );

  const composerModelControl = onChatModelChange ? (
    <ChatModelPicker
      variant="composer"
      value={chatModelId ?? DEFAULT_CHAT_LLM_MODEL_ID}
      onChange={onChatModelChange}
      disabled={loading}
    />
  ) : null;

  const composerActionsEnd = (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      {composerModelControl}
      {composerSendControl}
    </div>
  );

  const composerTextarea = (
    <Textarea
      ref={composerTextareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resizeTextarea();
      }}
      onKeyDown={handleTextareaKeyDown}
      placeholder={placeholder}
      rows={1}
      disabled={loading}
      className={`${composerMultiline ? "w-full" : "min-w-0 flex-1"} ${textareaClass}`}
    />
  );

  return (
    <div ref={rootRef} className={className} data-strategy-chat-input>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSubmit?.();
        }}
        className={formShell}
      >
        {showSuggestions ? (
          <div
            role="listbox"
            aria-label="Prompt suggestions"
            className={`absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)] ${
              theme.isV2
                ? "border-white/10 bg-[#141414]"
                : "border-[#2a2a2a] bg-[#0f0f0f]"
            }`}
          >
            <p
              className={`border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-[#8a8a8a] ${
                theme.isV2 ? "border-white/6" : "border-[#242424]"
              }`}
            >
              Suggestions (prototype)
            </p>
            <ScrollFade
              axis="y"
              fadeColor={
                theme.isV2 ? "var(--ds-copilot-v2-elevated)" : "#141414"
              }
              viewportClassName="max-h-40 py-0.5"
            >
              <ul>
                {suggestions.map((s, idx) => (
                  <li key={s}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={idx === highlightIdx}
                      className={`w-full px-3 py-2 text-left text-[11px] transition-colors hover:bg-white/5 ${
                        idx === highlightIdx
                          ? theme.isV2
                            ? "bg-[#19E6A3]/10 text-white"
                            : "bg-[#171200]/60 text-white"
                          : "text-[#bfbfbf]"
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertSuggestion(s)}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollFade>
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div
            className={`flex flex-wrap gap-1.5 ${isComposer ? "mb-3" : "mb-2"}`}
          >
            {attachments.map((a) => (
              <AttachmentChip
                key={a.id}
                attachment={a}
                onRemove={removeAttachment}
                isV2={theme.isV2}
              />
            ))}
          </div>
        ) : null}

        {isComposer ? (
          composerMultiline ? (
            <div className="flex flex-col gap-1.5">
              {composerTextarea}
              <div className="flex items-center justify-between gap-2">
                {composerAttachControl}
                {composerActionsEnd}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-start gap-2">
              {composerAttachControl}
              {composerTextarea}
              {composerActionsEnd}
            </div>
          )
        ) : (
          <Textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              resizeTextarea();
            }}
            onKeyDown={handleTextareaKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={loading}
            className={textareaClass}
          />
        )}

        <input
          ref={docInputRef}
          type="file"
          className="hidden"
          accept={isComposer ? ".pdf,.doc,.docx,.txt,.md,.csv" : ".pdf,.doc,.docx,.txt,.md,.csv,image/*"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const type = file.type.startsWith("image/") ? "image" : "document";
            handleFile(type, file);
            e.target.value = "";
          }}
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            handleFile("image", e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {!isComposer && (
          <div
            className={`mt-2.5 flex items-center justify-between gap-2 ${
              theme.isV2 ? "border-t border-white/6 pt-2" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-0.5">
              <ChatModelPicker
                value={chatModelId}
                onChange={onChatModelChange}
                disabled={loading}
              />
              <div ref={attachRef} className="relative">
                <button
                  type="button"
                  disabled={loading}
                  aria-label="Add attachment"
                  aria-expanded={attachOpen}
                  aria-haspopup="menu"
                  className={iconBtnClass}
                  onClick={() => {
                    setAttachOpen((v) => !v);
                    setCodeOpen(false);
                  }}
                >
                  <Paperclip className="size-4" aria-hidden />
                </button>
                {attachOpen ? (
                  <AttachDropdownMenu
                    items={ATTACH_MENU}
                    onSelect={handleAttachType}
                    className={
                      theme.isV2
                        ? "border-white/10 bg-[#141414]"
                        : "border-[#242424] bg-[#0a0a0a]"
                    }
                  />
                ) : null}
              </div>
              <button
                type="button"
                disabled={loading}
                aria-label="More options"
                className={iconBtnClass}
                onClick={() => setAttachOpen((v) => !v)}
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            {theme.isV2 ? (
              <button
                type="submit"
                disabled={!value.trim() || loading}
                aria-busy={loading}
                aria-label="Send message"
                className={theme.chatSendBtn}
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a]" />
                ) : (
                  <ArrowUp className="size-4" aria-hidden />
                )}
              </button>
            ) : (
              <Button
                type="submit"
                size="sm"
                variant="default"
                className={theme.chatSendBtn}
                loading={loading}
                disabled={!value.trim()}
                aria-label="Send message"
              >
                <Send className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        )}

        {codeOpen ? (
          <div
            id={codeId}
            className={`mt-2 rounded-xl border p-3 ${
              theme.isV2
                ? "border-white/8 bg-[#141414]"
                : "border-[#2a2a2a] bg-[#121212]"
            }`}
          >
            <label className="text-[10px] text-[#757575]">
              Paste code or rules
            </label>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              rows={3}
              placeholder="// entry logic, Pine script, etc."
              className="mt-1.5 w-full resize-y rounded-lg border border-[#242424] bg-black px-2.5 py-2 font-mono text-[11px] text-white placeholder:text-[#585858] focus:border-[#454545] focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-1.5">
              <button
                type="button"
                className="rounded-md px-2.5 py-1 text-[10px] text-[#929292] hover:text-white"
                onClick={() => {
                  setCodeOpen(false);
                  setCodeSnippet("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  theme.isV2
                    ? "rounded-md border border-[#19E6A3]/20 bg-[#19E6A3]/10 px-2.5 py-1 text-[10px] font-medium text-[#19E6A3]"
                    : "rounded-md bg-[#3e2e00] px-2.5 py-1 text-[10px] font-medium text-[#f2b500]"
                }
                onClick={handleAddCode}
              >
                Add code
              </button>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
