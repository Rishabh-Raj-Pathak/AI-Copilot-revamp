import React, { useState } from 'react';
import { VaultRow, VaultRowProps } from './VaultRow';
import { ActivatedVaultRow } from './ActivatedVaultRow';
import { VaultsHeader, ViewMode } from './VaultsHeader';
import { TabSwitch, TabItem } from './TabSwitch';
import { Pagination } from './Pagination';
import { VaultCard } from './VaultCard';
import { ActivatedVaultCard } from './ActivatedVaultCard';
import { Layers, Activity, Hexagon, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileVaultCarousel } from './MobileVaultCarousel';
import { TrustBadge } from './TrustBadge';
import { MOCK_DEX_WALLETS, MOCK_PARADEX_WALLET } from '../utils/wallet';

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 w-full mb-4">
      <span className="font-['Onest',sans-serif] font-semibold text-[10px] text-[rgba(113,113,130,0.6)] tracking-[2px] uppercase shrink-0">
        {title}
      </span>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent" />
    </div>
  );
}

function ActivatedSectionTitle() {
    return (
      <div className="h-[31px] w-full flex items-center gap-[16px] pl-[4px] mb-4">
        <span className="font-['Onest',sans-serif] font-semibold text-[10px] leading-[15px] text-[rgba(204,177,127,0.6)] tracking-[2px] uppercase shrink-0">
          activated vaults
        </span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[rgba(204,177,127,0.2)] to-transparent" />
      </div>
    );
  }

interface VaultData extends VaultRowProps {
    source: 'Hyperliquid' | 'Paradex' | 'Nado';
}

const initialFeaturedVaults: VaultData[] = [
  {
    id: "v1",
    title: "BlueChip",
    badge: "popular",
    volume: "$840k",
    apr: "14.2%",
    users: "1,240",
    source: "Hyperliquid"
  },
  {
    id: "v2",
    title: "HIP-3",
    badge: "high_apr",
    volume: "$840k",
    apr: "14.2%",
    users: "1,240",
    source: "Paradex"
  },
  {
    id: "v3",
    title: "Trending",
    badge: "high_risk",
    volume: "$840k",
    apr: "14.2%",
    users: "1,240",
    source: "Nado"
  }
];

const initialAvailableVaults: VaultData[] = [
  {
    id: "v4",
    title: "Dependent",
    volume: "$840k",
    apr: "14.2%",
    users: "1,240",
    source: "Paradex"
  },
  {
    id: "v5",
    title: "HIP-3",
    volume: "$840k",
    apr: "14.2%",
    users: "1,240",
    source: "Hyperliquid"
  },
  {
    id: "v6",
    title: "Hyperliquid",
    volume: "$840k",
    apr: "14.2%",
    users: "1,240",
    source: "Hyperliquid"
  }
];

interface VaultWithSource extends VaultData {
    originalSection: 'featured' | 'available';
    initialAmount: string;
    initialPercent: number;
    walletAddress: string;
}

function walletForVaultSource(source: VaultData['source']): string {
  if (source === 'Paradex') return MOCK_PARADEX_WALLET;
  return MOCK_DEX_WALLETS[source];
}

export function VaultsSection() {
  const tabs: TabItem[] = [
    { id: "All Dexs", label: "All Dexs", icon: <Layers size={16} strokeWidth={1.5} /> },
    { id: "Hyperliquid", label: "Hyperliquid", icon: <Activity size={16} strokeWidth={1.5} /> },
    { id: "Paradex", label: "Paradex", icon: <Hexagon size={16} strokeWidth={1.5} /> },
    { id: "Nado", label: "Nado", icon: <Zap size={16} strokeWidth={1.5} /> }
  ];
  
  const [activeTab, setActiveTab] = useState("All Dexs");
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  const [featuredVaults, setFeaturedVaults] = useState<VaultData[]>(initialFeaturedVaults);
  const [availableVaults, setAvailableVaults] = useState<VaultData[]>(initialAvailableVaults);
  const [activatedVaults, setActivatedVaults] = useState<VaultWithSource[]>([]);
  const [lastActivatedId, setLastActivatedId] = useState<string | null>(null);

  // Helper to get icon based on source
  const getIcon = (source: string) => {
    switch (source) {
        case 'Hyperliquid': return <Activity size={20} strokeWidth={1.5} />;
        case 'Paradex': return <Hexagon size={20} strokeWidth={1.5} />;
        case 'Nado': return <Zap size={20} strokeWidth={1.5} />;
        default: return <Activity size={20} strokeWidth={1.5} />;
    }
  };

  const handleActivate = (vault: VaultData, section: 'featured' | 'available', data: { amount: string, percent: number }) => {
      // Remove from source list
      if (section === 'featured') {
          setFeaturedVaults(prev => prev.filter(v => v.id !== vault.id));
      } else {
          setAvailableVaults(prev => prev.filter(v => v.id !== vault.id));
      }

      // Add to activated list with initial values
      setActivatedVaults(prev => [...prev, { 
        ...vault, 
        originalSection: section,
        initialAmount: data.amount,
        initialPercent: data.percent,
        walletAddress: walletForVaultSource(vault.source),
      }]);
      
      // Track newly activated vault for animation
      setLastActivatedId(vault.id || null);
  };

  const handleStop = (vault: VaultWithSource) => {
      // Remove from activated list
      setActivatedVaults(prev => prev.filter(v => v.id !== vault.id));

      // Add back to original section
      // We strip the extra ActivatedVault props before returning to standard VaultData
      const { originalSection, initialAmount, initialPercent, walletAddress, ...vaultProps } = vault;
      
      if (originalSection === 'featured') {
          setFeaturedVaults(prev => [...prev, vaultProps]);
      } else {
          setAvailableVaults(prev => [...prev, vaultProps]);
      }
      
      if (lastActivatedId === vault.id) {
          setLastActivatedId(null);
      }
  };

  // Filter Logic
  const filterVaults = <T extends VaultData>(vaults: T[]) => {
      if (activeTab === "All Dexs") return vaults;
      return vaults.filter(v => v.source === activeTab);
  };

  const filteredFeatured = filterVaults(featuredVaults);
  const filteredAvailable = filterVaults(availableVaults);
  const filteredActivated = filterVaults(activatedVaults);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Vaults Header */}
      <VaultsHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Controls: Tabs */}
      <div className="flex items-center justify-between w-full">
        <TabSwitch
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {/* Trust Badge — shown only on desktop, sits flush with filter buttons */}
        <div className="hidden md:flex items-center shrink-0 ml-3">
          <TrustBadge />
        </div>
      </div>

      {/* Vaults Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-8 md:gap-5 w-full"
        >
            {/* Activated Vaults Section - List View (Desktop) / Carousel (Mobile) */}
            {filteredActivated.length > 0 && (
                <div className={`w-full ${viewMode === 'list' ? 'block' : 'hidden'}`}>
                    <ActivatedSectionTitle />
                    
                    {/* Desktop List Container */}
                    <div className="hidden md:block relative w-full rounded-[24px] bg-[#0c0a08] border border-[rgba(255,255,255,0.05)] p-4">
                        <div className="flex flex-col gap-[12px] items-start w-full relative z-10">
                            {filteredActivated.map((vault) => (
                                <ActivatedVaultRow 
                                    key={vault.id}
                                    title={vault.title}
                                    volume={vault.volume}
                                    apr={vault.apr}
                                    users={vault.users}
                                    badge={vault.badge} 
                                    icon={getIcon(vault.source)}
                                    source={vault.source}
                                    initialAmount={vault.initialAmount}
                                    initialPercent={vault.initialPercent}
                                    walletAddress={vault.walletAddress}
                                    onStop={() => handleStop(vault)}
                                    isNew={vault.id === lastActivatedId}
                                />
                            ))}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(204,177,127,0.02)] to-transparent rounded-[24px] pointer-events-none" />
                    </div>

                    {/* Mobile Carousel (Replaces vertical list) */}
                    <div className="block md:hidden w-full">
                        <MobileVaultCarousel>
                            {filteredActivated.map((vault) => (
                                <ActivatedVaultCard 
                                    key={vault.id}
                                    title={vault.title}
                                    volume={vault.volume}
                                    apr={vault.apr}
                                    users={vault.users}
                                    badge={vault.badge} 
                                    icon={getIcon(vault.source)}
                                    source={vault.source}
                                    initialAmount={vault.initialAmount}
                                    initialPercent={vault.initialPercent}
                                    walletAddress={vault.walletAddress}
                                    onStop={() => handleStop(vault)}
                                    isNew={vault.id === lastActivatedId}
                                />
                            ))}
                        </MobileVaultCarousel>
                    </div>
                </div>
            )}

            {/* Activated Vaults Section - Cards View (Desktop & Mobile) */}
            {/* Note: The request implies using carousel logic for ALL mobile views, even if desktop is in "Cards" mode. 
                Currently, ViewMode toggle affects both. 
                However, for Mobile, we should prioritize the horizontal swipe UX for cards regardless of the desktop toggle if appropriate,
                OR we just apply the carousel to the 'Cards' view as well on mobile. 
                Given "Horizontal Swipe Cards (Core Mobile Interaction)", let's enforce Carousel on Mobile always. */}
            {filteredActivated.length > 0 && viewMode === 'grid' && (
                <div className="w-full">
                    <ActivatedSectionTitle />
                    {/* Desktop Grid */}
                    <div 
                        className="hidden md:block relative w-full rounded-[30px] p-[16px] md:p-[30px]"
                        style={{ backgroundImage: "linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.4) 100%), linear-gradient(90deg, rgb(12, 12, 12) 0%, rgb(12, 12, 12) 100%)" }}
                    >
                        <div aria-hidden="true" className="absolute border-[0.83px] border-[rgba(204,177,127,0.4)] border-solid inset-0 pointer-events-none rounded-[30px]" />
                        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(0,0,0,0.1)]" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full relative z-10">
                            {filteredActivated.map((vault) => (
                                <ActivatedVaultCard 
                                    key={vault.id}
                                    title={vault.title}
                                    volume={vault.volume}
                                    apr={vault.apr}
                                    users={vault.users}
                                    badge={vault.badge} 
                                    icon={getIcon(vault.source)}
                                    source={vault.source}
                                    initialAmount={vault.initialAmount}
                                    initialPercent={vault.initialPercent}
                                    walletAddress={vault.walletAddress}
                                    onStop={() => handleStop(vault)}
                                    isNew={vault.id === lastActivatedId}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {/* Mobile Carousel (Reuse same logic) */}
                    <div className="block md:hidden w-full">
                        <MobileVaultCarousel>
                            {filteredActivated.map((vault) => (
                                <ActivatedVaultCard 
                                    key={vault.id}
                                    title={vault.title}
                                    volume={vault.volume}
                                    apr={vault.apr}
                                    users={vault.users}
                                    badge={vault.badge} 
                                    icon={getIcon(vault.source)}
                                    source={vault.source}
                                    initialAmount={vault.initialAmount}
                                    initialPercent={vault.initialPercent}
                                    walletAddress={vault.walletAddress}
                                    onStop={() => handleStop(vault)}
                                    isNew={vault.id === lastActivatedId}
                                />
                            ))}
                        </MobileVaultCarousel>
                    </div>
                </div>
            )}

            {/* Featured Opportunities — commented out (disabled via false &&) */}
            {false &&
            filteredFeatured.length > 0 && (
                <div className="w-full">
                    <SectionTitle title="Featured Opportunities" />
                    <div className="hidden md:block w-full">
                       {viewMode === 'list' ? (
                           <div className="relative rounded-[14px] w-full">
                               <div className="flex flex-col gap-[2px] items-start overflow-hidden px-[1px] relative rounded-[14px]">
                                   {filteredFeatured.map((vault) => (
                                       <VaultRow 
                                         key={vault.id} 
                                         {...vault}
                                         icon={getIcon(vault.source)} 
                                         onActivate={(data) => handleActivate(vault, 'featured', data)}
                                       />
                                   ))}
                               </div>
                               <div className="absolute inset-0 border-[0.7px] border-[rgba(120,90,40,0.5)] rounded-[14px] pointer-events-none" />
                           </div>
                       ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] w-full">
                               {filteredFeatured.map((vault) => (
                                   <VaultCard 
                                     key={vault.id} 
                                     {...vault} 
                                     icon={getIcon(vault.source)}
                                     onActivate={(data) => handleActivate(vault, 'featured', data)}
                                   />
                               ))}
                           </div>
                       )}
                    </div>
                    <div className="block md:hidden w-full">
                        <MobileVaultCarousel>
                            {filteredFeatured.map((vault) => (
                                <VaultCard 
                                  key={vault.id} 
                                  {...vault} 
                                  icon={getIcon(vault.source)}
                                  onActivate={(data) => handleActivate(vault, 'featured', data)}
                                />
                            ))}
                        </MobileVaultCarousel>
                    </div>
                </div>
            )}

            {/* Available Vaults */}
            {filteredAvailable.length > 0 && (
                <div className="w-full">
                    <SectionTitle title="Available Vaults" />
                    
                    {/* Desktop List/Grid logic preserved */}
                    <div className="hidden md:block w-full">
                       {viewMode === 'list' ? (
                           <div className="relative rounded-[14px] w-full">
                               <div className="flex flex-col gap-[2px] items-start overflow-hidden px-[1px] relative rounded-[14px]">
                                   {filteredAvailable.map((vault) => (
                                       <VaultRow 
                                         key={vault.id} 
                                         {...vault} 
                                         icon={getIcon(vault.source)}
                                         onActivate={(data) => handleActivate(vault, 'available', data)}
                                       />
                                   ))}
                               </div>
                               <div className="absolute inset-0 border-[0.7px] border-[rgba(120,90,40,0.5)] rounded-[14px] pointer-events-none" />
                           </div>
                       ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] w-full">
                               {filteredAvailable.map((vault) => (
                                   <VaultCard 
                                     key={vault.id} 
                                     {...vault} 
                                     icon={getIcon(vault.source)}
                                     onActivate={(data) => handleActivate(vault, 'available', data)}
                                   />
                               ))}
                           </div>
                       )}
                    </div>

                    {/* Mobile Carousel (Always used on Mobile for Available) */}
                    <div className="block md:hidden w-full">
                        <MobileVaultCarousel>
                            {filteredAvailable.map((vault) => (
                                <VaultCard 
                                  key={vault.id} 
                                  {...vault} 
                                  icon={getIcon(vault.source)}
                                  onActivate={(data) => handleActivate(vault, 'available', data)}
                                />
                            ))}
                        </MobileVaultCarousel>
                    </div>
                </div>
            )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination - Show on Desktop, Hide on Mobile */}
      <div className="hidden md:block mt-2">
         <Pagination />
      </div>
    </div>
  );
}