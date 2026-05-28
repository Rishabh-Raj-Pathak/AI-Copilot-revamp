import { useEffect, useRef, useState } from "react";
import { Activity, CircleDollarSign, Clock3, ShieldCheck } from "lucide-react";
import { CENTER_TEMPLATES } from "../strategyWorkstationMockData.js";
import StrategyInteractiveDotBackground from "./StrategyInteractiveDotBackground.jsx";
import StrategyPromptBox from "./StrategyPromptBox.jsx";
import StrategyTemplateIllustration from "./StrategyTemplateIllustration.jsx";

function StrategyTemplateCard({ template, selected, onSelect }) {
  const primaryBorderBase = "rgb(152 170 156 / 0.24)";
  const primaryBorderHover = "rgb(152 170 156 / 0.34)";
  const primaryBorderSelected = "rgb(152 170 156 / 0.44)";
  const details = [
    { label: "Asset", value: template.cardAsset ?? template.asset },
    { label: "Timeframe", value: template.cardTimeframe ?? template.timeframe },
    {
      label: "Setup Type",
      value: template.cardSetupType ?? template.strategyKind,
    },
    { label: "Risk Profile", value: template.cardRiskProfile ?? template.risk },
  ];
  const [pointerState, setPointerState] = useState({
    x: 80,
    y: 48,
    active: false,
  });
  const handlePatternMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointerState({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[24px] border text-left transition-all duration-150 hover:brightness-[1.03]"
      style={{
        borderColor: selected ? primaryBorderSelected : primaryBorderBase,
        background:
          "linear-gradient(180deg, #0b0e0d 0%, #070909 55%, #060807 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -24px 48px rgba(0,0,0,0.18)",
      }}
      onMouseEnter={(event) => {
        if (!selected) event.currentTarget.style.borderColor = primaryBorderHover;
      }}
      onMouseLeave={(event) => {
        if (!selected) event.currentTarget.style.borderColor = primaryBorderBase;
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{
          background:
            "radial-gradient(130% 85% at 52% 92%, rgba(132,191,77,0.055) 0%, rgba(132,191,77,0) 58%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-5 pb-2.5 pt-4">
        <div className="flex items-center">
          <h3 className="text-[19px] font-medium leading-[1.15] tracking-[-0.012em] text-[#f2f5f3]">
            {template.cardTitle ?? template.title}
          </h3>
        </div>
      </div>

      <div
        className="relative z-10 mx-5 mt-0.5 h-[138px] overflow-hidden"
        onMouseEnter={() =>
          setPointerState((prev) => ({ ...prev, active: true }))
        }
        onMouseMove={handlePatternMove}
        onMouseLeave={() =>
          setPointerState((prev) => ({ ...prev, active: false }))
        }
      >
        <StrategyTemplateIllustration
          type={template.illustration ?? "candles"}
          pointerX={pointerState.x}
          pointerY={pointerState.y}
          hoverActive={pointerState.active}
        />
      </div>

      <div className="relative z-10 mt-auto px-4 pb-3.5">
        <div
          className="w-full rounded-[15px] border px-4 py-2.5 backdrop-blur-[14px]"
          style={{
            borderColor: primaryBorderBase,
            background:
              "linear-gradient(180deg, rgba(20,25,23,0.72) 0%, rgba(12,16,15,0.84) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045)",
          }}
        >
          <div className="space-y-0.5">
            {details.map((item, idx) => {
              const Icon =
                item.label === "Asset"
                  ? CircleDollarSign
                  : item.label === "Timeframe"
                    ? Clock3
                    : item.label === "Setup Type"
                      ? Activity
                      : ShieldCheck;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={15}
                        strokeWidth={1.65}
                        className="text-[#97ab95]/85"
                      />
                      <span className="text-[12px] font-normal text-[#909995]">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-[#eff3ef]">
                      {item.value}
                    </span>
                  </div>
                  {idx < details.length - 1 ? (
                    <div className="h-px w-full bg-[rgba(255,255,255,0.07)]" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function StrategyNewStrategyView({
  activeTemplateId,
  onTemplateChange,
  onTemplateApply,
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  chatModelId,
  onChatModelChange,
  attachments,
  onAttachmentsChange,
}) {
  const containerRef = useRef(null);
  const [bgPointer, setBgPointer] = useState({
    x: 0,
    y: 0,
    active: false,
  });
  const [bgSize, setBgSize] = useState({ width: 1200, height: 900 });
  const bgPointerRafRef = useRef(null);
  const pendingBgPointerRef = useRef(null);

  const handleSelect = (template) => {
    onTemplateChange(template.id);
    onTemplateApply(template);
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setBgSize({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleBgMove = (event) => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    pendingBgPointerRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    };
    if (bgPointerRafRef.current != null) return;
    bgPointerRafRef.current = window.requestAnimationFrame(() => {
      bgPointerRafRef.current = null;
      if (!pendingBgPointerRef.current) return;
      setBgPointer(pendingBgPointerRef.current);
    });
  };

  useEffect(
    () => () => {
      if (bgPointerRafRef.current != null) {
        window.cancelAnimationFrame(bgPointerRafRef.current);
      }
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="minimal-scrollbar relative flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto"
      onMouseMove={handleBgMove}
      onMouseEnter={() => setBgPointer((prev) => ({ ...prev, active: true }))}
      onMouseLeave={() => setBgPointer((prev) => ({ ...prev, active: false }))}
    >
      <StrategyInteractiveDotBackground
        width={bgSize.width}
        height={bgSize.height}
        pointerX={bgPointer.x}
        pointerY={bgPointer.y}
        hoverActive={bgPointer.active}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.55rem]">
            Turn Ideas Into{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--ds-terminal-connect-wallet-gradient)",
                WebkitTextFillColor: "transparent",
              }}
            >
              Strategies
            </span>
          </h1>
        </header>

        <div className="mx-auto w-full max-w-222">
          <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CENTER_TEMPLATES.slice(0, 3).map((t) => (
              <StrategyTemplateCard
                key={t.id}
                template={t}
                selected={t.id === activeTemplateId}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <div
              className="ds-strategy-composer-stage relative z-0"
              style={{ "--ds-strategy-composer-shell-width": "100%" }}
            >
              <div className="ds-strategy-composer-glow" aria-hidden />
              <StrategyPromptBox
                className="w-full"
                variant="composer"
                value={prompt}
                onChange={onPromptChange}
                onSubmit={onSubmit}
                loading={loading}
                chatModelId={chatModelId}
                onChatModelChange={onChatModelChange}
                attachments={attachments}
                onAttachmentsChange={onAttachmentsChange}
                enableSuggestions
                placeholder="Describe your trading idea in plain language, upload an image, a video, or code."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
