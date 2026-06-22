import React from 'react';
import { motion } from 'motion/react';
import { playSound } from '../utils/sound';

export function SaveButton({ onClick }: { onClick: () => void }) {
  const handleClick = () => {
    playSound('success');
    onClick();
  };

  return (
    <motion.button 
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className="relative flex items-center justify-center h-[36px] px-[20px] rounded-[10px] cursor-pointer group"
      style={{ 
        backgroundImage: "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(rgb(53, 42, 26) 0%, rgb(20, 16, 11) 100%)" 
      }}
    >
      {/* Border */}
      <div className="absolute inset-0 border-[0.83px] border-[rgba(120,90,40,0.5)] rounded-[10px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.5)] pointer-events-none" />
      
      {/* Inner Shadow */}
      <div className="absolute inset-0 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.05)] rounded-[10px] pointer-events-none" />
      
      {/* Text */}
      <span className="font-['Onest',sans-serif] font-medium text-[13px] leading-[21px] text-[#bfbfbf] tracking-[0.35px] uppercase group-hover:text-white transition-colors">
        Save
      </span>
    </motion.button>
  );
}
