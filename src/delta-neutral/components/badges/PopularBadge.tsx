import React from 'react';

export function PopularBadge() {
  return (
    <div className="bg-[rgba(43,127,255,0.1)] relative rounded-[100px] shrink-0 inline-flex items-center justify-center px-[9px] py-[2px] border-[0.83px] border-[rgba(43,127,255,0.2)] shadow-[inset_0px_0px_4px_2px_#002e74]">
      <span className="font-['Onest',sans-serif] font-semibold text-[9px] leading-[13.5px] text-[#51a2ff] tracking-[0.45px] uppercase relative z-10">
        POPULAR
      </span>
    </div>
  );
}
