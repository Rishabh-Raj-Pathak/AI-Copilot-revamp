import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

interface MobileVaultCarouselProps {
  children: React.ReactNode[];
}

// Individual card wrapper to handle scroll-driven animations
const CarouselCard = ({ 
  children, 
  index, 
  scrollX, 
  cardWidth, 
  gap
}: { 
  children: React.ReactNode, 
  index: number, 
  scrollX: MotionValue<number>, 
  cardWidth: number,
  gap: number
}) => {
  // Calculate the scroll position where this card is perfectly centered
  const centerPosition = index * (cardWidth + gap);
  
  // Define the range of scroll positions where this card interacts with the center
  // [Left neighbor centered, This card centered, Right neighbor centered]
  const inputRange = [
    centerPosition - (cardWidth + gap),
    centerPosition,
    centerPosition + (cardWidth + gap)
  ];
  
  // Output ranges for scale and opacity
  // Center: Scale 1, Opacity 1
  // Sides: Scale 0.92, Opacity 0.6
  const scaleOutput = [0.92, 1, 0.92];
  const opacityOutput = [0.5, 1, 0.5];
  
  const scale = useTransform(scrollX, inputRange, scaleOutput);
  const opacity = useTransform(scrollX, inputRange, opacityOutput);
  
  return (
    <motion.div 
      style={{ 
        scale, 
        opacity,
        width: cardWidth,
        minWidth: cardWidth
      }}
      className="snap-center shrink-0 origin-center"
    >
      {children}
    </motion.div>
  );
};

export function MobileVaultCarousel({ children }: MobileVaultCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollX } = useScroll({ container: containerRef });
  const [activeIndex, setActiveIndex] = useState(0);
  const [metrics, setMetrics] = useState({ cardWidth: 0, gap: 16, padding: 0 });

  // Measure container and calculate layout metrics
  useEffect(() => {
    const updateMetrics = () => {
        if(!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        
        // Card width logic: 85% of screen width to allow side peeking + padding
        // On 402px screen: ~340px width
        const cardWidth = Math.floor(containerWidth * 0.85); 
        const gap = 16;
        
        // Calculate padding needed to center the first/last items
        // Container width - Card width = Remaining space
        // Padding = Remaining space / 2
        const padding = Math.floor((containerWidth - cardWidth) / 2);
        
        setMetrics({ cardWidth, gap, padding });
    };

    // Initial measure
    updateMetrics();
    
    // Update on resize
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  // Track active index for dots
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || metrics.cardWidth === 0) return;
      const scrollLeft = containerRef.current.scrollLeft;
      // Calculate index based on scroll position center point
      // Adding half a card width to trigger change closer to the middle
      const newIndex = Math.round(scrollLeft / (metrics.cardWidth + metrics.gap));
      // Clamp index
      const clampedIndex = Math.max(0, Math.min(newIndex, children.length - 1));
      setActiveIndex(clampedIndex);
    };

    const ref = containerRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, [children.length, metrics.cardWidth, metrics.gap]);

  // If metrics aren't ready, render a placeholder or hidden container to avoid layout shift issues if possible,
  // but for now we render with default/0 which effectively hides until measure.
  const isReady = metrics.cardWidth > 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Carousel Container */}
      <div className="relative w-full">
        {/* Premium Gradient Masks (Left/Right) */}
        {/* Left Mask - wider gradient for smoother fade */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%] bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent z-10 pointer-events-none" />
        {/* Right Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-[15%] bg-gradient-to-l from-[#050505] via-[#050505]/90 to-transparent z-10 pointer-events-none" />

        <div 
            ref={containerRef}
            className={`flex overflow-x-auto w-full snap-x snap-mandatory scroll-smooth hide-scrollbar py-2 ${!isReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            style={{ 
                gap: metrics.gap,
                paddingLeft: metrics.padding,
                paddingRight: metrics.padding,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}
        >
            {children.map((child, index) => (
                <CarouselCard 
                   key={index} 
                   index={index} 
                   scrollX={scrollX} 
                   cardWidth={metrics.cardWidth}
                   gap={metrics.gap}
                >
                    {child}
                </CarouselCard>
            ))}
        </div>
      </div>

      {/* Pagination Indicators - Premium Dots */}
      <div className="flex items-center justify-center gap-[8px] h-[10px]">
        {children.map((_, index) => {
           const isActive = index === activeIndex;
           return (
             <div 
                key={index}
                className={`rounded-full transition-all duration-300 ease-out ${
                    isActive 
                    ? 'w-[20px] h-[4px] bg-[#ccb17f] shadow-[0_0_8px_rgba(204,177,127,0.4)]' 
                    : 'w-[4px] h-[4px] bg-[rgba(255,255,255,0.15)]'
                }`}
             />
           );
        })}
      </div>
    </div>
  );
}
