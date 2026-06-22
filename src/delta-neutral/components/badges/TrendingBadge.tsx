import React from 'react';

export function TrendingBadge() {
  return (
    <div className="bg-[rgba(229,72,77,0.1)] relative rounded-[100px] inline-flex items-center justify-center">
      <div className="flex items-center justify-center overflow-clip px-[9px] py-[2px] relative rounded-[inherit]">
        <p className="font-['Onest',sans-serif] font-semibold leading-[13.5px] relative shrink-0 text-[#e5484d] text-[9px] tracking-[0.45px] uppercase">
          TRENDING
        </p>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_4px_2px_rgba(229,72,77,0.2)]" />
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(229,72,77,0.2)] border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}
