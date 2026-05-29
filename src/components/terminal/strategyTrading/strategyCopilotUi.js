/** Strategy Copilot UI version tokens (v1 = legacy, v2 = HyprEarn lime-mint refresh). */

export const COPILOT_V2_GRADIENT_CTA = "ds-copilot-v2-gradient-cta";

/** Matches Deploy / New Strategy CTA corner radius (`--ds-terminal-connect-wallet-radius`). */
const V2_ACTION_RADIUS = "rounded-[var(--ds-terminal-connect-wallet-radius)]";

export function getCopilotTheme(version) {
  const isV2 = version === "v2";

  return {
    isV2,
    gradientCta: isV2 ? COPILOT_V2_GRADIENT_CTA : "ds-terminal-gradient-cta",
    shell: isV2 ? "bg-[#050706] text-[rgba(255,255,255,0.92)]" : "bg-black text-white",
    panel: isV2
      ? "border-white/6 bg-[#0D100F]"
      : "border-[#242424] bg-[#0a0a0a]",
    card: isV2
      ? "rounded-xl border border-white/6 bg-[#141716]"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a]",
    cardInner: isV2
      ? "rounded-xl border border-white/[0.05] bg-[#101312]"
      : "rounded-lg border border-[#242424] bg-[#121212]",
    chartSection: isV2
      ? "overflow-visible rounded-xl border border-white/6 bg-[#141716]"
      : "",
    controlBar: isV2
      ? "overflow-visible border-t border-white/[0.04] bg-[#101312] px-3 pb-3 pt-3"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] mt-3 px-3 py-2.5",
    controlChip: isV2
      ? "rounded-md border border-white/[0.05] bg-[rgba(255,255,255,0.03)]"
      : "rounded-md border border-[#242424] bg-black",
    input: isV2
      ? "rounded-lg border border-white/6 bg-[#0D100F] text-[rgba(255,255,255,0.92)] placeholder:text-[rgba(255,255,255,0.36)] focus:border-[#19E6A3]/30 focus:outline-none"
      : "rounded-md border border-[#242424] bg-black text-white placeholder:text-[#585858] focus:border-[#454545] focus:outline-none",
    filterActive: isV2
      ? "shrink-0 rounded-full border border-[#19E6A3]/22 bg-[#19E6A3]/10 px-2.5 py-1 text-[10px] font-medium text-[#19E6A3]"
      : "rounded-md bg-[#3e2e00] px-2 py-1 text-[10px] font-medium text-[#f2b500]",
    filterIdle: isV2
      ? "shrink-0 rounded-full border border-white/[0.05] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-[10px] font-medium text-[rgba(255,255,255,0.36)] transition-colors hover:border-white/10 hover:text-[rgba(255,255,255,0.58)]"
      : "rounded-md px-2 py-1 text-[10px] font-medium text-[#929292] hover:text-white",
    strategyCard: isV2
      ? "relative rounded-xl border border-white/6 bg-[#101312] p-3 transition-colors hover:border-white/10 hover:bg-[#141716]"
      : "rounded-lg border border-[#242424] bg-black p-2.5 hover:border-[#313131] hover:bg-[#0a0a0a]",
    strategyCardActive: isV2
      ? "relative rounded-xl border border-white/6 bg-[#171a18] p-3 pl-4 before:absolute before:inset-y-2 before:left-0 before:w-[2px] before:rounded-full before:bg-[#19E6A3]"
      : "rounded-lg border border-[#f2b500]/35 bg-[#121212] p-2.5 shadow-[inset_0_0_0_1px_rgba(242,181,0,0.15)]",
    newStrategyBtn:
      "mt-2 w-full justify-center gap-1.5 shadow-none transition-[filter,opacity] hover:brightness-[1.04] active:brightness-[0.96]",
    headerTitle: isV2
      ? "text-xl font-bold tracking-tight text-[rgba(255,255,255,0.92)] sm:text-[1.35rem]"
      : "text-base font-semibold text-white",
    headerMeta: isV2
      ? "text-xs text-[rgba(255,255,255,0.58)]"
      : "text-xs text-[#757575]",
    primaryActionBtn: isV2
      ? `${COPILOT_V2_GRADIENT_CTA} gap-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50`
      : `inline-flex min-h-8 items-center justify-center gap-1.5 ${V2_ACTION_RADIUS} bg-[#f2b500] px-3 text-xs font-semibold text-black transition-colors hover:bg-[#ffd633] disabled:cursor-not-allowed disabled:opacity-50`,
    secondaryActionBtn: isV2
      ? `inline-flex min-h-8 items-center justify-center gap-1.5 ${V2_ACTION_RADIUS} border border-white/8 bg-[rgba(255,255,255,0.03)] px-3 text-xs font-medium text-[rgba(255,255,255,0.88)] transition-colors hover:bg-[rgba(255,255,255,0.06)] disabled:cursor-not-allowed disabled:opacity-50`
      : "gap-1 !text-xs",
    runBacktestBtn: isV2
      ? `gap-1.5 ${V2_ACTION_RADIUS} border border-white/8 bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.88)] hover:bg-[rgba(255,255,255,0.07)] !text-xs`
      : "gap-1 !text-xs",
    optimizeBtn: isV2
      ? `gap-1.5 ${V2_ACTION_RADIUS} border border-[#19E6A3]/16 bg-[rgba(255,255,255,0.04)] px-3 font-medium text-[rgba(255,255,255,0.88)] hover:border-[#19E6A3]/28 hover:bg-[rgba(255,255,255,0.06)] !text-xs`
      : "gap-1.5 rounded-lg bg-[#f2b500] font-semibold text-black hover:bg-[#ffd633] !text-xs",
    outlineBtn: isV2
      ? `${V2_ACTION_RADIUS} border border-white/8 bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.88)] hover:bg-[rgba(255,255,255,0.06)] !text-xs`
      : "",
    metricCard: isV2
      ? "rounded-xl border border-white/6 bg-[#141716]"
      : "rounded-md border border-[#242424] bg-[#121212] px-2.5 py-2",
    metricCell: isV2 ? "border-white/[0.04] px-4 py-4" : "",
    metricLabel: isV2
      ? "text-[10px] font-medium text-[rgba(255,255,255,0.36)]"
      : "text-[10px] text-[#757575]",
    metricValue: isV2
      ? "mt-1.5 text-lg font-bold tabular-nums"
      : "mt-0.5 text-sm font-semibold tabular-nums",
    tabsList: isV2
      ? "ds-scrollbar-hidden !flex w-full flex-nowrap gap-1 overflow-x-auto border-0 border-b border-white/[0.04] bg-transparent p-0"
      : "minimal-scrollbar !flex w-full flex-nowrap gap-1 overflow-x-auto border-[#242424] bg-black p-1",
    scrollViewportY: isV2
      ? "ds-scrollbar-hidden overflow-y-auto"
      : "minimal-scrollbar overflow-y-auto",
    scrollViewportX: isV2
      ? "ds-scrollbar-hidden overflow-x-auto"
      : "minimal-scrollbar overflow-x-auto",
    tabsTrigger: isV2
      ? "!shrink-0 !min-h-0 !rounded-none !border-0 !border-b-2 !border-transparent !bg-transparent !px-4 !py-2.5 !text-xs !font-medium !shadow-none text-[rgba(255,255,255,0.36)] hover:text-[rgba(255,255,255,0.72)] aria-selected:!border-[#19E6A3] aria-selected:!font-semibold aria-selected:!text-[rgba(255,255,255,0.92)]"
      : "!shrink-0 !text-xs",
    tabsContentWrap: isV2
      ? "mt-0 rounded-xl border border-white/6 bg-[#141716]"
      : "",
    chatPanel: isV2
      ? "border-white/6 bg-[#050706] shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]"
      : "border-[#242424] bg-black",
    chatScrollArea: isV2 ? "bg-[#050706]" : "",
    chatUserBubble: isV2
      ? "rounded-2xl rounded-br-md border border-white/[0.05] bg-[#1a1e1c] px-3.5 py-2.5 text-[13px] leading-[1.6] text-[rgba(255,255,255,0.92)]"
      : "rounded-lg bg-[#171200] px-3 py-2 text-white",
    chatAiBubble: isV2
      ? "rounded-2xl rounded-bl-md border border-white/[0.05] bg-[#141716] px-3.5 py-2.5"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[#bfbfbf]",
    chatExampleBtn: isV2
      ? "rounded-xl border border-white/6 bg-[#141716] px-3.5 py-2.5 text-left text-[12px] leading-snug text-[rgba(255,255,255,0.58)] transition-all duration-200 hover:border-white/10 hover:bg-[#171a18] hover:text-[rgba(255,255,255,0.88)]"
      : "rounded-md border border-[#242424] bg-[#0a0a0a] px-2.5 py-2 text-left text-[11px] text-[#bfbfbf] hover:border-[#454545] hover:text-white",
    chatQuickChip: isV2
      ? "shrink-0 rounded-full border border-white/6 bg-[#141716] px-3 py-1.5 text-[11px] text-[rgba(255,255,255,0.36)] transition-colors hover:border-white/10 hover:bg-[#171a18] hover:text-[rgba(255,255,255,0.58)]"
      : "shrink-0 rounded-md border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292] hover:border-[#454545] hover:text-white",
    chatPromptShell: isV2
      ? "group/composer relative z-10 rounded-2xl border border-white/6 bg-[#141716] p-3 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#19E6A3]/22 focus-within:shadow-[0_-8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(25,230,163,0.08)]"
      : "relative rounded-xl border border-[#242424] bg-[#0a0a0a] p-2",
    chatSendBtn: isV2
      ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#D7F70B] to-[#16E6A3] text-[#030504] shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-all duration-150 hover:brightness-[1.05] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[#1a1e1c] disabled:text-[rgba(255,255,255,0.36)] disabled:shadow-none disabled:hover:scale-100"
      : "size-8! rounded-full! p-0!",
    chatComposerFooter: isV2
      ? "relative z-20 shrink-0 bg-gradient-to-t from-[#050706] via-[#050706]/98 to-transparent px-3.5 pb-3.5 pt-1"
      : "relative z-20 shrink-0 border-t p-3",
    badge: isV2 ? "rounded-md px-2 py-0.5 text-[10px]" : "rounded px-1.5 py-0.5",
    flowCard: isV2
      ? "rounded-xl border border-white/6 bg-[#101312] p-4"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 sm:p-4",
    flowStepNum: isV2
      ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#D7F70B] to-[#16E6A3] text-xs font-bold text-[#030504]"
      : "flex size-5 shrink-0 items-center justify-center rounded-md bg-[#171200] text-[10px] font-semibold text-[#f2b500]",
    versionSelect: isV2
      ? "!min-h-8 !rounded-lg !border-white/6 !bg-[#0D100F] !text-[11px] !font-medium"
      : "!min-h-8 !text-xs",
    overviewPanel: isV2 ? "p-4 sm:p-5" : "",
    statusCard: isV2
      ? "rounded-xl border border-white/6 bg-[#141716] p-4"
      : "rounded-lg border border-[#242424] bg-[#0a0a0a] p-3",
  };
}
