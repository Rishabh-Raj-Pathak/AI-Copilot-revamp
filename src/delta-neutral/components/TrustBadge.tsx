import React from 'react';
import { motion } from 'motion/react';

interface TrustBadgeProps {
  className?: string;
}

/**
 * A non-interactive "Safe & Fully Non-custodial" trust pill badge.
 * Uses a dark glassmorphism background, champagne gold gradient border,
 * and a subtle golden outer glow — designed for premium DeFi UIs.
 */
export function TrustBadge({ className = '' }: TrustBadgeProps) {
  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Outer glow layer — golden haze emanating outward */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: '9999px',
          background: 'transparent',
          boxShadow:
            '0 0 18px 3px rgba(204, 177, 127, 0.12), 0 0 36px 6px rgba(204, 177, 127, 0.06)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Gradient border shell — painted via a pseudo-background + mask technique */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '9999px',
          padding: '1px',
          background:
            'linear-gradient(135deg, rgba(204,177,127,0.55) 0%, rgba(168,141,95,0.25) 40%, rgba(100,82,45,0.15) 70%, rgba(204,177,127,0.4) 100%)',
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Pill body */}
      <div
        className="relative flex items-center gap-[7px] px-[14px] py-[7px]"
        style={{
          borderRadius: '9999px',
          background: 'rgba(18, 18, 18, 0.62)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 2,
        }}
      >
        {/* Shield icon — thin-line, SVG inline */}
        <motion.svg
          width="13"
          height="15"
          viewBox="0 0 13 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity }}
        >
          {/* Shield outline */}
          <path
            d="M6.5 1L1 3.2V7C1 10.15 3.4 13.1 6.5 14C9.6 13.1 12 10.15 12 7V3.2L6.5 1Z"
            stroke="url(#shield-gradient)"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Checkmark inside shield */}
          <path
            d="M4.2 7.4L5.8 9L8.8 5.8"
            stroke="url(#check-gradient)"
            strokeWidth="0.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="shield-gradient" x1="1" y1="1" x2="12" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e8d5b5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ccb17f" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="check-gradient" x1="4.2" y1="5.8" x2="8.8" y2="9" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f0e4c8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ccb17f" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Label */}
        <span
          style={{
            fontFamily: "'Onest', sans-serif",
            fontSize: '10.5px',
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: '0.55px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            background:
              'linear-gradient(90deg, #e8d5b5 0%, #ccb17f 55%, #e8d5b5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Safe &amp; Fully Non-custodial
        </span>
      </div>
    </div>
  );
}
