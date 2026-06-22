import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { HyprEarnBacktestPanel } from './HyprEarnBacktestPanel';
import { VaultsStrategyPanel } from './VaultsStrategyPanel';

type StrategyView = 'ai_copilot' | 'vaults_strategy';

type MoreStrategyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown in backtest panel headers when opened from the nav. */
  instrumentTitle?: string;
};

export function MoreStrategyModal({ open, onOpenChange, instrumentTitle = 'BTC/USDC' }: MoreStrategyModalProps) {
  const [strategyView, setStrategyView] = useState<StrategyView>('ai_copilot');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) setStrategyView('ai_copilot');
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-[#050505]/88 backdrop-blur-md"
        aria-label="Close strategy backtest"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-[201] w-full max-w-[940px] max-h-[min(96vh,980px)] overflow-hidden">
        <div className="mb-2 rounded-[12px] border border-[rgba(146,111,56,0.35)] bg-[rgba(10,10,10,0.92)] p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setStrategyView('ai_copilot')}
              className={clsx(
                'h-[34px] rounded-[8px] px-3 text-[12px] font-medium transition-colors',
                strategyView === 'ai_copilot'
                  ? 'bg-[rgba(204,177,127,0.18)] text-[#f5f5f5] ring-1 ring-[rgba(204,177,127,0.45)]'
                  : 'bg-transparent text-[#8f90a1] hover:text-[#d8d9e3]',
              )}
            >
              Ai copilot
            </button>
            <button
              type="button"
              onClick={() => setStrategyView('vaults_strategy')}
              className={clsx(
                'h-[34px] rounded-[8px] px-3 text-[12px] font-medium transition-colors',
                strategyView === 'vaults_strategy'
                  ? 'bg-[rgba(204,177,127,0.18)] text-[#f5f5f5] ring-1 ring-[rgba(204,177,127,0.45)]'
                  : 'bg-transparent text-[#8f90a1] hover:text-[#d8d9e3]',
              )}
            >
              Vaults strategy
            </button>
          </div>
        </div>
        {strategyView === 'ai_copilot' ? (
          <HyprEarnBacktestPanel instrumentTitle={instrumentTitle} onClose={() => onOpenChange(false)} />
        ) : (
          <VaultsStrategyPanel instrumentTitle={instrumentTitle} onClose={() => onOpenChange(false)} />
        )}
      </div>
    </div>,
    document.body,
  );
}
