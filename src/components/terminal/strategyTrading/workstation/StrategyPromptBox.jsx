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
  getPromptSuggestions,
} from "../strategyWorkstationMockData.js";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import ChatModelPicker from "./ChatModelPicker.jsx";

/** @typedef {'document'|'link'|'image'|'code'|'video'} AttachmentType */
/** @typedef {{ id: string, type: AttachmentType, label: string, meta?: string }} PromptAttachment */

const ATTACH_MENU = [
  { type: "document", label: "Document", icon: FileText },
  { type: "image", label: "Image", icon: Image },
  { type: "link", label: "Link", icon: Link2 },
  { type: "code", label: "Code", icon: Code2 },
];

const COMPOSER_ATTACH = [
  { type: "document", label: "Form", icon: FileText },
  { type: "video", label: "Video", icon: Video },
  { type: "code", label: "Code", icon: Code2 },
];

function AttachmentChip({ attachment, onRemove, isV2 }) {
  const menu = [...ATTACH_MENU, { type: "video", label: "Video", icon: Video }];
  const Icon = menu.find((m) => m.type === attachment.type)?.icon ?? Paperclip;
  return (
    <span
      className={
        isV2
          ? "inline-flex max-w-full items-center gap-1 rounded-full border border-white/[0.1] bg-[#141414] py-0.5 pl-2.5 pr-0.5 text-[10px] text-[#a0a0a0]"
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

function AttachPill({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#333] bg-[#141414] px-3 py-1.5 text-xs text-[#929292] transition-colors hover:border-[#454545] hover:text-white disabled:opacity-50"
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </button>
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
  className = "",
}) {
  const isComposer = variant === "composer";
  const theme = useCopilotTheme();

  const [attachOpen, setAttachOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const rootRef = useRef(null);
  const attachRef = useRef(null);
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const codeId = useId();

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
    if (!attachOpen || isComposer) return undefined;
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
  }, [attachOpen, isComposer]);

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
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey && highlightIdx >= 0)) {
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

  const formFocusReset =
    "focus-within:outline-none focus-within:ring-0 focus-within:ring-offset-0";

  const formShell = isComposer
    ? `relative rounded-2xl border border-[#2e2e2e] bg-[#0f0f0f] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.45)] ${formFocusReset}`
    : `${theme.chatPromptShell} ${formFocusReset}`;

  const textareaFocusReset =
    "focus:outline-none focus-visible:outline-none focus-visible:!border-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!shadow-none";

  const textareaClass = isComposer
    ? `!min-h-[7rem] !max-h-[12rem] !resize-none !border-0 !bg-transparent !p-0 text-[15px] leading-relaxed text-white shadow-none placeholder:text-[#585858] ${textareaFocusReset} sm:!min-h-[8rem]`
    : theme.isV2
      ? `!min-h-[2.75rem] !max-h-[9rem] !resize-none !border-0 !bg-transparent !p-0 text-[13px] leading-relaxed text-[#f4f4f4] shadow-none placeholder:text-[#8a8a8a] ${textareaFocusReset}`
      : `!min-h-[3.5rem] !max-h-[9rem] !resize-none !border-0 !bg-transparent !p-0 text-sm shadow-none ${textareaFocusReset}`;

  const iconBtnClass = theme.isV2
    ? "shrink-0 rounded-lg p-2 text-[#8a8a8a] transition-colors hover:bg-white/[0.06] hover:text-[#f4f4f4] disabled:opacity-40"
    : "shrink-0 rounded-md p-1.5 text-[#585858] hover:text-white disabled:opacity-50";

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
                ? "border-white/[0.1] bg-[#141414]"
                : "border-[#2a2a2a] bg-[#0f0f0f]"
            }`}
          >
            <p
              className={`border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-[#8a8a8a] ${
                theme.isV2 ? "border-white/[0.06]" : "border-[#242424]"
              }`}
            >
              Suggestions (prototype)
            </p>
            <ul className="minimal-scrollbar max-h-40 overflow-y-auto py-0.5">
              {suggestions.map((s, idx) => (
                <li key={s}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={idx === highlightIdx}
                    className={`w-full px-3 py-2 text-left text-[11px] transition-colors hover:bg-white/5 ${
                      idx === highlightIdx ? "bg-[#171200]/60 text-white" : "text-[#bfbfbf]"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertSuggestion(s)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className={`flex flex-wrap gap-1.5 ${isComposer ? "mb-3" : "mb-2"}`}>
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

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder={placeholder}
          rows={isComposer ? 4 : theme.isV2 ? 2 : 3}
          disabled={loading}
          className={textareaClass}
        />

        <input
          ref={docInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.csv,image/*"
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
        <input
          ref={videoInputRef}
          type="file"
          className="hidden"
          accept="video/*"
          onChange={(e) => {
            handleFile("video", e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {isComposer ? (
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#1f1f1f] pt-3">
            <div className="flex flex-wrap items-center gap-2">
              {COMPOSER_ATTACH.map(({ type, label, icon }) => (
                <AttachPill
                  key={type}
                  icon={icon}
                  label={label}
                  disabled={loading}
                  onClick={() => {
                    if (type === "document") docInputRef.current?.click();
                    else if (type === "video") videoInputRef.current?.click();
                    else if (type === "code") setCodeOpen((v) => !v);
                  }}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={!value.trim() || loading}
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3a3a3a] text-white transition-colors hover:bg-[#4a4a4a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div
            className={`mt-2.5 flex items-center justify-between gap-2 ${
              theme.isV2 ? "border-t border-white/[0.06] pt-2" : ""
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
                  <div
                    role="menu"
                    className={`absolute bottom-full left-0 z-50 mb-1.5 min-w-38 overflow-hidden rounded-xl border py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)] ${
                      theme.isV2
                        ? "border-white/[0.1] bg-[#141414]"
                        : "border-[#242424] bg-[#0a0a0a]"
                    }`}
                  >
                    {ATTACH_MENU.map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#a0a0a0] transition-colors hover:bg-white/[0.05] hover:text-[#f4f4f4]"
                        onClick={() => {
                          if (type === "document") docInputRef.current?.click();
                          else if (type === "image") imageInputRef.current?.click();
                          else if (type === "code") {
                            setCodeOpen(true);
                            setAttachOpen(false);
                          }
                          if (type !== "code") setAttachOpen(false);
                        }}
                      >
                        <Icon className="size-3.5 text-[#8a8a8a]" aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
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
            className={`rounded-xl border p-3 ${isComposer ? "mt-3" : "mt-2"} ${
              theme.isV2
                ? "border-white/[0.08] bg-[#141414]"
                : "border-[#2a2a2a] bg-[#121212]"
            }`}
          >
            <label className="text-[10px] text-[#757575]">Paste code or rules</label>
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
                className="rounded-md bg-[#3e2e00] px-2.5 py-1 text-[10px] font-medium text-[#f2b500]"
                onClick={handleAddCode}
              >
                Add code
              </button>
            </div>
          </div>
        ) : null}

        {isComposer ? (
          <p className="mt-2 text-center text-[10px] text-[#454545]">
            Prototype — attachments stored locally · {activeLlm.name}
          </p>
        ) : null}
      </form>
    </div>
  );
}
