import React from 'react';
import svgPaths from '../../imports/svg-zpz8o9mk9q';

export type ViewMode = 'list' | 'grid';

interface VaultsHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function GridIcon({ active }: { active: boolean }) {
  const strokeColor = active ? "#CCB17F" : "white";
  const strokeOpacity = active ? "1" : "0.2";

  return (
    <div className="w-[16px] h-[16px] relative shrink-0">
      <svg className="block w-full h-full" viewBox="0 0 16 16" fill="none">
        <path d={svgPaths.p33b248c0} stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p9e08a00} stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p36ea4b00} stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p2b882f00} stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ListIcon({ active }: { active: boolean }) {
  const strokeColor = active ? "#CCB17F" : "white";
  const strokeOpacity = active ? "1" : "0.2";
  
  return (
    <div className="w-[16px] h-[16px] relative shrink-0">
      <svg className="block w-full h-full" viewBox="0 0 16 16" fill="none">
        {/* Recreating the 3 dots and 3 lines layout */}
        {/* Top Row */}
        <path d="M2 4.5H3" stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 4.5H14" stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Middle Row */}
        <path d="M2 8H3" stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 8H14" stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Bottom Row */}
        <path d="M2 11.5H3" stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 11.5H14" stroke={strokeColor} strokeOpacity={strokeOpacity} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ViewToggle({ viewMode, onViewModeChange }: VaultsHeaderProps) {
  return (
    <div className="hidden md:flex relative w-[74px] h-[42px] bg-[#0c0a08] rounded-full shrink-0 items-center p-[5px]">
      {/* Border */}
      <div className="absolute inset-0 border border-[rgba(255,255,255,0.05)] rounded-full pointer-events-none" />
      {/* Inner Shadow */}
      <div className="absolute inset-0 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)] rounded-full pointer-events-none" />
      
      {/* Background Slider - Moving based on state */}
      <div 
        className={`absolute top-[5px] w-[32px] h-[32px] bg-[#1e1b18] rounded-full shadow-sm border border-[rgba(255,255,255,0.05)] transition-all duration-300 ease-in-out ${
          viewMode === 'grid' ? 'left-[5px]' : 'left-[37px]'
        }`}
      />

      {/* Grid Button */}
      <div 
        className="relative z-10 w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
        onClick={() => onViewModeChange('grid')}
      >
        <GridIcon active={viewMode === 'grid'} />
      </div>
      
      {/* List Button */}
      <div 
        className="relative z-10 w-[32px] h-[32px] flex items-center justify-center cursor-pointer ml-auto"
        onClick={() => onViewModeChange('list')}
      >
         <ListIcon active={viewMode === 'list'} />
      </div>
    </div>
  );
}

export function VaultsHeader({ viewMode, onViewModeChange }: VaultsHeaderProps) {
  return (
    <div className="w-full flex items-center gap-[10px] h-[50px] shrink-0">
      <div className="flex items-center justify-center">
        <span className="font-['Onest',sans-serif] font-medium text-[20px] text-[#e8d5b5] leading-[30px]">
          Vaults
        </span>
      </div>
      
      <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.06)] min-w-[1px] min-h-[1px]" />
      
      <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
    </div>
  );
}
