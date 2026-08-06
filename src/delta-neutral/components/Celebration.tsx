import React from 'react';
import { motion } from 'motion/react';

export function Celebration() {
  // Simple particle explosion
  const particles = Array.from({ length: 12 });
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-50">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 1, 
            scale: 0,
            x: "50%",
            y: "50%"
          }}
          animate={{ 
            opacity: 0, 
            scale: Math.random() * 0.5 + 0.5,
            x: `${50 + (Math.random() - 0.5) * 100}%`,
            y: `${50 + (Math.random() - 0.5) * 100}%`,
          }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            delay: Math.random() * 0.1
          }}
          className="absolute w-2 h-2 rounded-full bg-[#ccb17f] shadow-[0_0_4px_rgba(204,177,127,0.8)]"
          style={{
             left: 0, top: 0,
             // Distribute starting positions slightly if needed, 
             // but strictly sticking to center burst is fine
          }}
        />
      ))}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.4, 0], scale: 1.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 bg-[#ccb17f] mix-blend-overlay"
      />
    </div>
  );
}
