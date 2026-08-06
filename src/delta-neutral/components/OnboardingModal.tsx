import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Shield, TrendingUp } from 'lucide-react';

interface OnboardingModalProps {
  onConnectWallet?: () => void;
}

export function OnboardingModal({ onConnectWallet }: OnboardingModalProps) {
  return (
    <div className="relative w-full flex items-center justify-center min-h-[500px]">
      {/* Blurred Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,5,5,0.95)] to-[rgba(5,5,5,0.98)] backdrop-blur-sm z-0" />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-[600px] w-full mx-auto px-5"
      >
        <div
          className="relative rounded-[24px] px-[40px] py-[48px] overflow-hidden"
          style={{
            background: 'linear-gradient(226.746deg, rgba(22, 20, 18, 0.95) 1.9797%, rgba(14, 12, 10, 0.95) 87.36%)',
            boxShadow: '0px 20px 60px -10px rgba(0,0,0,0.8)'
          }}
        >
          {/* Border Glow */}
          <div className="absolute inset-0 border-[0.7px] border-[rgba(204,177,127,0.4)] rounded-[24px] pointer-events-none shadow-[0px_0px_30px_-5px_rgba(204,177,127,0.3)]" />

          <div className="relative z-10 flex flex-col items-center gap-[32px] text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[rgba(204,177,127,0.2)] to-[rgba(120,90,40,0.1)] border border-[rgba(204,177,127,0.3)] flex items-center justify-center"
            >
              <Wallet size={40} className="text-[#ccb17f]" strokeWidth={1.5} />
            </motion.div>

            {/* Headline */}
            <div className="flex flex-col gap-[12px]">
              <h2
                className="font-bold tracking-[-1px] text-transparent bg-clip-text text-[40px] leading-[48px]"
                style={{
                  backgroundImage: 'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(232, 213, 181) 50%, rgb(120, 90, 40) 100%)'
                }}
              >
                Welcome to Delta Neutral Vaults
              </h2>

              <p className="text-[#717182] text-[16px] font-light leading-[24px] max-w-[480px] mx-auto">
                Earn market-neutral yield by capturing funding rate arbitrage across decentralized exchanges.
                To get started, connect a wallet that has USDC or supported assets on the Hyperliquid ecosystem.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex items-start gap-[12px] text-left">
                <div className="w-[40px] h-[40px] rounded-full bg-[rgba(204,177,127,0.1)] border border-[rgba(204,177,127,0.2)] flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-[#ccb17f]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="font-['Onest',sans-serif] font-semibold text-[14px] text-[#e8d5b5]">
                    Fully Non-Custodial
                  </span>
                  <span className="font-['Onest',sans-serif] text-[13px] text-[#717182]">
                    Your assets remain in your wallet at all times
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-[12px] text-left">
                <div className="w-[40px] h-[40px] rounded-full bg-[rgba(204,177,127,0.1)] border border-[rgba(204,177,127,0.2)] flex items-center justify-center shrink-0">
                  <TrendingUp size={20} className="text-[#ccb17f]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="font-['Onest',sans-serif] font-semibold text-[14px] text-[#e8d5b5]">
                    Market-Neutral Yield
                  </span>
                  <span className="font-['Onest',sans-serif] text-[13px] text-[#717182]">
                    Capture funding rates without directional exposure
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={onConnectWallet}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[56px] rounded-[12px] relative flex items-center justify-center cursor-pointer group overflow-hidden mt-[8px]"
              style={{
                background: 'linear-gradient(90deg, rgba(204,177,127,0.15) 0%, rgba(120,90,40,0.15) 100%)',
              }}
            >
              <div className="absolute inset-0 border-[1px] border-[rgba(204,177,127,0.4)] rounded-[12px] pointer-events-none group-hover:border-[rgba(204,177,127,0.6)] transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(204,177,127,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-['Onest',sans-serif] font-semibold text-[16px] text-[#e8d5b5] uppercase tracking-[0.5px] z-10 group-hover:text-white transition-colors">
                Connect Wallet
              </span>
            </motion.button>

            <p className="text-[#717182] text-[12px] font-light">
              Don't have a wallet?{' '}
              <a href="#" className="text-[#ccb17f] hover:text-[#e8d5b5] transition-colors underline">
                Learn how to get started
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
