/** Strategy Copilot UI version tokens (v1 = legacy, v2 = mockup refresh). */

export function getCopilotTheme(version) {
  const isV2 = version === "v2";

  return {
    isV2,
    shell: "bg-black text-white",
    panel: isV2
      ? "border-[#1a1a1a] bg-[#0a0a0a]"
      : "border-[#242424] bg-[#0a0a0a]",
    card: isV2
      ? "rounded-xl border border-[#262626] bg-[#141414]"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a]",
    cardInner: isV2
      ? "rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]"
      : "rounded-lg border border-[#242424] bg-[#121212]",
    chartSection: isV2
      ? "overflow-visible rounded-xl border border-[#262626] bg-[#141414]"
      : "",
    controlBar: isV2
      ? "overflow-visible border-t border-[#262626] bg-[#0d0d0d] px-3 pb-2.5 pt-4"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] mt-3 px-3 py-2.5",
    controlChip: "rounded-md border border-[#242424] bg-black",
    input: isV2
      ? "rounded-lg border border-[#252525] bg-[#0a0a0a] text-white placeholder:text-[#585858] focus:border-[#f2b500]/50 focus:outline-none"
      : "rounded-md border border-[#242424] bg-black text-white placeholder:text-[#585858] focus:border-[#454545] focus:outline-none",
    filterActive: isV2
      ? "shrink-0 border-b-2 border-[#f2b500] px-2 pb-2 pt-0.5 text-[10px] font-semibold text-[#f2b500]"
      : "rounded-md bg-[#3e2e00] px-2 py-1 text-[10px] font-medium text-[#f2b500]",
    filterIdle: isV2
      ? "shrink-0 border-b-2 border-transparent px-2 pb-2 pt-0.5 text-[10px] font-medium text-[#757575] transition-colors hover:text-white"
      : "rounded-md px-2 py-1 text-[10px] font-medium text-[#929292] hover:text-white",
    strategyCard: isV2
      ? "rounded-xl border border-[#262626] bg-[#141414] p-3 transition-all hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
      : "rounded-lg border border-[#242424] bg-black p-2.5 hover:border-[#313131] hover:bg-[#0a0a0a]",
    strategyCardActive: isV2
      ? "rounded-xl border border-[#f2b500]/55 bg-[#1a1608] p-3 shadow-[0_0_0_1px_rgba(242,181,0,0.2)]"
      : "rounded-lg border border-[#f2b500]/35 bg-[#121212] p-2.5 shadow-[inset_0_0_0_1px_rgba(242,181,0,0.15)]",
    newStrategyBtn: "mt-2 w-full justify-center gap-1.5",
    headerTitle: isV2
      ? "text-xl font-bold tracking-tight text-white sm:text-[1.35rem]"
      : "text-base font-semibold text-white",
    headerMeta: isV2 ? "text-xs text-[#757575]" : "text-xs text-[#757575]",
    runBacktestBtn: isV2
      ? "gap-1.5 rounded-lg border-[#333] bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] !text-xs"
      : "gap-1 !text-xs",
    optimizeBtn: isV2
      ? "gap-1.5 rounded-lg border border-[#f2b500] bg-[#f2b500] px-3 font-semibold text-black shadow-md hover:border-[#ffd633] hover:bg-[#ffd633] !text-xs"
      : "gap-1.5 rounded-lg bg-[#f2b500] font-semibold text-black hover:bg-[#ffd633] !text-xs",
    outlineBtn: isV2
      ? "rounded-lg border-[#333] bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] !text-xs"
      : "",
    metricCard: isV2
      ? "rounded-xl border border-[#262626] bg-[#141414]"
      : "rounded-md border border-[#242424] bg-[#121212] px-2.5 py-2",
    metricCell: isV2
      ? "border-[#262626] px-4 py-4"
      : "",
    metricLabel: isV2
      ? "text-[10px] font-medium text-[#757575]"
      : "text-[10px] text-[#757575]",
    metricValue: isV2
      ? "mt-1.5 text-lg font-bold tabular-nums"
      : "mt-0.5 text-sm font-semibold tabular-nums",
    tabsList: isV2
      ? "minimal-scrollbar !flex w-full flex-nowrap gap-0 overflow-x-auto border-0 border-b border-[#1c1c1c] bg-transparent p-0"
      : "minimal-scrollbar !flex w-full flex-nowrap gap-1 overflow-x-auto border-[#242424] bg-black p-1",
    tabsTrigger: isV2
      ? "!shrink-0 !min-h-0 !rounded-none !border-0 !border-b-2 !border-transparent !bg-transparent !px-4 !py-2.5 !text-xs !font-medium !shadow-none text-[#757575] hover:text-white aria-selected:!border-[#f2b500] aria-selected:!font-semibold aria-selected:!text-[#f2b500]"
      : "!shrink-0 !text-xs",
    tabsContentWrap: isV2
      ? "mt-0 rounded-xl border border-[#262626] bg-[#141414]"
      : "",
    chatPanel: isV2
      ? "border-white/[0.08] bg-[#070707] shadow-[inset_1px_0_0_rgba(255,255,255,0.04)]"
      : "border-[#242424] bg-black",
    chatScrollArea: isV2 ? "bg-[#090909]" : "",
    chatUserBubble: isV2
      ? "rounded-2xl rounded-br-md border border-white/[0.06] bg-[#23262e] px-3.5 py-2.5 text-[13px] leading-[1.6] text-[#f4f4f4] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
      : "rounded-lg bg-[#171200] px-3 py-2 text-white",
    chatAiBubble: isV2
      ? "rounded-2xl rounded-bl-md border border-white/[0.08] bg-[#141414] px-3.5 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[#bfbfbf]",
    chatExampleBtn: isV2
      ? "rounded-xl border border-white/[0.08] bg-[#141414] px-3.5 py-2.5 text-left text-[12px] leading-snug text-[#a0a0a0] transition-all duration-200 hover:border-white/[0.14] hover:bg-[#171717] hover:text-[#f4f4f4] hover:translate-y-[-1px]"
      : "rounded-md border border-[#242424] bg-[#0a0a0a] px-2.5 py-2 text-left text-[11px] text-[#bfbfbf] hover:border-[#454545] hover:text-white",
    chatQuickChip: isV2
      ? "shrink-0 rounded-full border border-white/[0.08] bg-[#141414] px-3 py-1.5 text-[11px] text-[#8a8a8a] transition-colors hover:border-white/[0.14] hover:bg-[#1a1a1a] hover:text-[#f4f4f4]"
      : "shrink-0 rounded-md border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292] hover:border-[#454545] hover:text-white",
    chatPromptShell: isV2
      ? "group/composer relative z-10 rounded-2xl border border-white/[0.1] bg-[#1b1b1b] p-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5),0_4px_24px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#f5c400]/25 focus-within:shadow-[0_-8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(245,196,0,0.12),0_0_24px_rgba(245,196,0,0.06)]"
      : "relative rounded-xl border border-[#242424] bg-[#0a0a0a] p-2",
    chatSendBtn: isV2
      ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5c400] text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-150 hover:bg-[#ffd21a] hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#585858] disabled:shadow-none disabled:hover:scale-100"
      : "size-8! rounded-full! p-0!",
    chatComposerFooter: isV2
      ? "relative z-20 shrink-0 bg-gradient-to-t from-[#070707] via-[#070707]/98 to-transparent px-3.5 pb-3.5 pt-1"
      : "relative z-20 shrink-0 border-t p-3",
    badge: isV2 ? "rounded-md px-2 py-0.5 text-[10px]" : "rounded px-1.5 py-0.5",
    flowCard: isV2
      ? "rounded-xl border border-[#1c1c1c] bg-[#0a0a0a] p-4"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 sm:p-4",
    flowStepNum: isV2
      ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f2b500] text-xs font-bold text-black"
      : "flex size-5 shrink-0 items-center justify-center rounded-md bg-[#171200] text-[10px] font-semibold text-[#f2b500]",
    versionSelect: isV2
      ? "!min-h-8 !rounded-lg !border-[#252525] !bg-[#0a0a0a] !text-[11px] !font-medium"
      : "!min-h-8 !text-xs",
    overviewPanel: isV2 ? "p-4 sm:p-5" : "",
    statusCard: isV2
      ? "rounded-xl border border-[#262626] bg-[#141414] p-4"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] p-3",
  };
}

