import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabSwitchProps {
  tabs: (string | TabItem)[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabSwitch({ tabs, activeTab, onTabChange, className = '' }: TabSwitchProps) {
  return (
    <div className={`inline-flex items-center bg-[#121212] rounded-full p-[4px] px-[5px] gap-[4px] border border-[rgba(255,255,255,0.05)] h-[49px] ${className}`}>
      {tabs.map((tab) => {
        const isString = typeof tab === 'string';
        const id = isString ? tab : tab.id;
        const label = isString ? tab : tab.label;
        const icon = !isString ? tab.icon : null;
        const isActive = id === activeTab;
        
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              relative px-[20px] py-[10px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200 outline-none
              ${isActive ? 'bg-gradient-to-b from-[#1a140b] to-[#0f0e0c]' : 'hover:bg-white/5'}
            `}
          >
            {/* Active State Decorations */}
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-full border-[0.8px] border-[#785a28] pointer-events-none" />
                <div className="absolute inset-0 rounded-full shadow-[inset_0px_0px_4px_1px_rgba(0,0,0,0.5)] pointer-events-none" />
              </>
            )}

            {/* Inactive Shadow (subtle depth) */}
            {!isActive && (
                 <div className="absolute inset-0 rounded-full shadow-[inset_0px_0px_4px_1px_rgba(0,0,0,0.5)] pointer-events-none opacity-100" />
            )}
            <div className="flex items-center gap-2 relative z-10">
              {icon && (
                <span className={isActive ? 'text-[#ccb17f]' : 'text-[#717182]'}>
                  {icon}
                </span>
              )}
              <span className={`
                font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] tracking-[0.35px] uppercase whitespace-nowrap
                ${isActive ? 'text-[#e8d5b5]' : 'text-[#717182]'}
              `}>
                {label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}