import React from 'react';
import svgPaths from '../../imports/svg-m8k25f45d';

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path clipRule="evenodd" d={svgPaths.p29494600} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path clipRule="evenodd" d={svgPaths.p446c900} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
       <path clipRule="evenodd" d={svgPaths.p16fa400} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage = 1, totalPages = 4, onPageChange, className = '' }: PaginationProps) {
  
  // Helper to render page buttons
  const renderPageButton = (page: number | string, isActive: boolean = false) => {
    if (page === '...') {
      return (
        <div key={`ellipsis-${Math.random()}`} className="bg-[#121212] flex items-center justify-center min-w-[32px] h-[32px] px-[11px] rounded-[6px] shrink-0">
          <span className="font-['Poppins',sans-serif] text-[14px] text-[#313131] leading-none">
            ...
          </span>
        </div>
      );
    }

    return (
      <button
        key={page}
        onClick={() => typeof page === 'number' && onPageChange?.(page)}
        className={`
          flex items-center justify-center min-w-[32px] h-[32px] px-[11px] rounded-[6px] shrink-0 transition-colors
          ${isActive 
            ? 'bg-[#2f2b1d] text-white' 
            : 'bg-[#121212] text-[#454545] hover:bg-[#1a1a1a]'}
        `}
      >
        <span className="font-['Poppins',sans-serif] text-[14px] leading-none">
          {page}
        </span>
      </button>
    );
  };

  return (
    <div className={`flex items-center justify-end gap-[8px] ${className}`}>
      {/* Pagination Controls */}
      <div className="flex items-center gap-[6px]">
        {/* Previous Button */}
        <button 
          className="bg-[#121212] flex items-center justify-center min-w-[32px] h-[32px] px-[7px] rounded-[6px] shrink-0 text-[#313131] hover:text-[#454545] transition-colors"
        >
          <ArrowLeftIcon />
        </button>

        {/* Page Numbers - Hardcoded for visual matching as per request, but logic ready */}
        {renderPageButton(1)}
        {renderPageButton(2)}
        {renderPageButton(3, true)}
        {renderPageButton(4)}
        {renderPageButton('...')}

        {/* Next Button */}
        <button 
          className="bg-[#121212] flex items-center justify-center min-w-[32px] h-[32px] px-[7px] rounded-[6px] shrink-0 text-[#313131] hover:text-[#454545] transition-colors"
        >
          <ArrowRightIcon />
        </button>
      </div>

      {/* Items Per Page Dropdown */}
      <div className="bg-[#121212] flex items-center h-[32px] pl-[12px] pr-[10px] gap-[10px] rounded-[6px] cursor-pointer hover:bg-[#1a1a1a] transition-colors">
        <span className="font-['Poppins',sans-serif] text-[14px] text-[#454545] leading-[22px] whitespace-nowrap">
          20 / Page
        </span>
        <div className="text-[#454545]">
           <ArrowDownIcon />
        </div>
      </div>
    </div>
  );
}
