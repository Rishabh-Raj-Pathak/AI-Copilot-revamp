import React from 'react';
import { motion } from 'motion/react';

export interface BronzeStripProps {
  variant?: 'vertical' | 'corner';
}

export function BronzeStrip({ variant = 'vertical' }: BronzeStripProps) {
  if (variant === 'corner') {
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          top: '14px',
          left: '-34px',
          width: '120px',
          height: '24px',
          transform: 'rotate(-45deg)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#785a28',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5), inset 0px 0px 6px 2px rgba(0,0,0,0.4)',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          borderBottom: '1px solid rgba(0,0,0,0.4)',
        }}
        aria-hidden="true"
      >
        {/* Shine sweep */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '60%',
            background:
              'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            filter: 'blur(2px)',
          }}
          animate={{ x: ['-120%', '220%'] }}
          transition={{
            duration: 3,
            ease: 'linear',
            repeat: Infinity,
            repeatDelay: 2.5,
          }}
        />

        {/* Text */}
        <span
          style={{
            position: 'relative',
            zIndex: 10,
            fontFamily: "'Onest', sans-serif",
            fontWeight: 500,
            fontSize: '9px',
            lineHeight: 1,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
          }}
        >
          NO FEE
        </span>
      </div>
    );
  }

  // Default: Vertical left-edge strip
  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-[26px] overflow-hidden z-20 pointer-events-none"
      aria-hidden="true"
    >
      {/* Solid bronze base */}
      <div className="absolute inset-0" style={{ backgroundColor: '#785a28' }} />

      {/* Inner depth shadow */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0px 0px 4px 2px rgba(0,0,0,0.5)' }}
      />

      {/* Bottom-to-top shine sweep */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          height: '52%',
          background:
            'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.12) 55%, transparent 100%)',
          filter: 'blur(1.5px)',
          pointerEvents: 'none',
        }}
        animate={{ top: ['108%', '-62%'] }}
        transition={{
          duration: 4.5,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 1.6,
        }}
      />

      {/* "NO FEE" — white text, rotated CCW */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <span
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: "'Onest', sans-serif",
            fontWeight: 400,
            fontSize: '9px',
            lineHeight: '13px',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          NO FEE
        </span>
      </div>
    </div>
  );
}
