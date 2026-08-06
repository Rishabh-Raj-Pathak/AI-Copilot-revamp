import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import svgPaths from '../../imports/svg-a0v4ni3t7t';
import { ChevronDown } from 'lucide-react';
import { MoreStrategyModal } from './MoreStrategyModal';

function Logo() {
  return (
    <div className="h-[20px] w-[15px] relative shrink-0">
      <svg className="block w-full h-full" viewBox="0 0 15 20" fill="none" preserveAspectRatio="none">
        <g>
          <path clipRule="evenodd" d={svgPaths.p37b14500} fill="url(#paint0_linear_logo)" fillRule="evenodd" />
          <path d={svgPaths.pd6f90b0} fill="url(#paint1_linear_logo)" />
        </g>
        <defs>
          <linearGradient id="paint0_linear_logo" x1="0" y1="19.58" x2="19.9" y2="10.95" gradientUnits="userSpaceOnUse">
            <stop offset="0.25" stopColor="#F7BB08" />
            <stop offset="1" stopColor="#2FFFCE" />
          </linearGradient>
          <linearGradient id="paint1_linear_logo" x1="0" y1="19.58" x2="19.9" y2="10.95" gradientUnits="userSpaceOnUse">
            <stop offset="0.25" stopColor="#F7BB08" />
            <stop offset="1" stopColor="#2FFFCE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function NavItem({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/5 transition-colors ${active ? 'bg-white/10' : ''}`}>
      <span className={`font-['Onest',sans-serif] font-medium text-[14px] leading-[1.2] ${active ? 'text-white' : 'text-white/80'}`}>
        {children}
      </span>
    </div>
  );
}

export function Header() {
  const [vaultsDropdownOpen, setVaultsDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setVaultsDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(target)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <div className="w-full h-[62px] bg-black border-b border-[#242424] flex items-center justify-center shrink-0 z-50 relative">
      <div className="w-full max-w-[1280px] px-5 flex items-center justify-between h-full">
        {/* Left Side */}
        <div className="flex items-center gap-5">
          {/* Branding */}
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <div className="font-['Onest',sans-serif] font-semibold text-[18px] leading-none">
              <span className="text-white">Hypr</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f7bb08] via-[#f7bb08] to-[#2fffce]">
                Earn
              </span>
            </div>
          </Link>

          {/* Nav List */}
          <div className="flex items-center gap-1">
            <NavItem>AI Copilot</NavItem>
            <NavItem>Trade</NavItem>
            <NavItem>Portfolio</NavItem>
            <NavItem>PnL Calendar</NavItem>
            <NavItem>Rewards</NavItem>
            <NavItem>Points</NavItem>

            {/* Vaults Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center justify-center px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setVaultsDropdownOpen(!vaultsDropdownOpen)}
              >
                <span className="font-['Onest',sans-serif] font-medium text-[14px] text-white/80 mr-1.5">Vaults</span>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${vaultsDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {vaultsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[240px] bg-[#0a0a0a] border border-[#242424] rounded-md shadow-lg overflow-hidden z-50">
                  {/* <Link
                    to="/vaults"
                    className="block px-4 py-2.5 font-['Onest',sans-serif] font-medium text-[14px] text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setVaultsDropdownOpen(false)}
                  >
                    Featured Vaults
                  </Link> */}
                  <Link
                    to="/delta-neutral-vaults-3"
                    className="block px-4 py-2.5 font-['Onest',sans-serif] font-medium text-[14px] text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setVaultsDropdownOpen(false)}
                  >
                    Delta Neutral
                  </Link>
                </div>
              )}
            </div>

            {/* More — Strategy tools */}
            <div className="relative" ref={moreDropdownRef}>
              <div
                className="flex items-center justify-center px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              >
                <span className="font-['Onest',sans-serif] font-medium text-[14px] text-white/80 mr-1.5">More</span>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {moreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[260px] bg-[#0a0a0a] border border-[#242424] rounded-md shadow-lg overflow-hidden z-50 p-2">
                  <p className="mb-2 px-1 font-['Onest',sans-serif] text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                    Tools
                  </p>
                  <div
                    className="rounded-[8px] border border-[#2a2a2a] bg-[#111111] p-1"
                    role="tablist"
                    aria-label="More menu"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected
                      className="w-full rounded-[6px] bg-white/10 px-3 py-2 text-left font-['Onest',sans-serif] text-[13px] font-medium text-white transition-colors hover:bg-white/[0.14]"
                      onClick={() => {
                        setStrategyModalOpen(true);
                        setMoreDropdownOpen(false);
                      }}
                    >
                      Strategy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Points / Bronze */}
          <div className="h-[28px] bg-[#18130b] rounded-[55px] border border-[#3a2a10] flex items-center pl-1 pr-3 py-1 gap-1">
             <div className="w-[23px] h-[23px] rounded-full bg-gradient-to-br from-[#cd7f32] to-[#8b4513] flex items-center justify-center overflow-hidden">
                {/* Placeholder for video/image of bronze coin */}
                <div className="w-[12px] h-[12px] rounded-full bg-[#cd7f32] border border-[#f0c080]"></div>
             </div>
             <span className="font-['Poppins',sans-serif] font-medium text-[14px] text-white">1800</span>
          </div>

          {/* Deposit Button */}
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 border border-[#242424] rounded-md pointer-events-none group-hover:border-[#3a3a3a] transition-colors"></div>
            <div className="px-3 py-1.5 rounded-md flex items-center justify-center bg-transparent">
              <span className="font-['Onest',sans-serif] font-medium text-[14px] text-white">Deposit</span>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="relative group cursor-pointer">
             <div className="absolute inset-0 border border-[#242424] rounded-md pointer-events-none group-hover:border-[#3a3a3a] transition-colors"></div>
             <div className="px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 bg-transparent">
               {/* Leading Icon (Wallet) */}
               <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                 <path d={svgPaths.p123bb4a0} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
               <span className="font-['Onest',sans-serif] font-medium text-[14px] text-white">0x98...3ee8</span>
               <ChevronDown className="w-4 h-4 text-white" />
             </div>
          </div>
        </div>
      </div>
    </div>
    <MoreStrategyModal open={strategyModalOpen} onOpenChange={setStrategyModalOpen} />
    </>
  );
}
