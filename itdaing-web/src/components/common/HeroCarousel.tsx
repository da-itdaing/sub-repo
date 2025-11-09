import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion, PanInfo } from "motion/react";
import { popups } from "../../data/popups";

interface HeroCarouselProps { onPopupClick?: (popupId: number) => void; }
const carouselItems = popups.sort((a,b)=> (b.likes + b.views) - (a.likes + a.views)).slice(0,7).map((p,i)=>({id:p.id,rank:i+1,image:p.images[0],title:p.title,date:p.date,location:p.location}));
export function HeroCarousel({ onPopupClick }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Unified responsive config for desktop + mobile
  const config = useResponsiveCarouselConfig();

  useEffect(()=>{ if(isPaused) return; const interval=setInterval(()=> setCurrentIndex(prev => (prev+1)%carouselItems.length), config.isMobile?3000:4000); return ()=> clearInterval(interval); },[isPaused,config.isMobile]);
  const handlePrev=()=> setCurrentIndex(prev=> (prev-1+carouselItems.length)%carouselItems.length);
  const handleNext=()=> setCurrentIndex(prev=> (prev+1)%carouselItems.length);
  const handleDragEnd=(e:MouseEvent|TouchEvent|PointerEvent, info:PanInfo)=>{ const t=50; if(info.offset.x>t) handlePrev(); else if(info.offset.x<-t) handleNext(); };
  return (
    <div className="relative mt-0 mb-3 md:mb-12">
  <div ref={containerRef} className="relative rounded-lg bg-white md:bg-transparent overflow-hidden md:overflow-x-visible md:overflow-y-hidden" onMouseEnter={()=>setIsPaused(true)} onMouseLeave={()=>setIsPaused(false)}>
    {/* Mobile version */}
    <div className="block md:hidden py-8" style={{minHeight: Math.max(300, Math.round(config.mobile.cardH + 80))}}>
      <div className="relative mx-auto px-4" style={{height: config.mobile.trackH, maxWidth: '100%'}}>
        {/* Drag layer */}
        <motion.div
          className="relative h-full overflow-visible"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <div className="relative w-full h-full" style={{ perspective: 1000 }}>
            {carouselItems.map((item, idx) => {
              let position = idx - currentIndex;
              if (position < -3) position += carouselItems.length;
              if (position > 3) position -= carouselItems.length;
              const isCentered = position === 0;
              const isVisible = Math.abs(position) <= 3;
              if (!isVisible) return null;
              const s = config.mobile;
              const distance = Math.abs(position);
              const scale = s.scale[distance] ?? 0.7;
              const w = Math.round(s.cardW * scale);
              const h = Math.round(s.cardH * scale);
              const verticalOffset = distance * 12; // pushes smaller cards down slightly
              // Horizontal translation: center at 50%, offset by position * step while keeping inside viewport
              const step = s.step;
              const x = position * step;
              const opacity = s.opacity[distance] ?? 0.4;
              // We anchor cards at center using left:50% then translate
              return (
                <motion.div
                  key={item.id}
                  initial={false}
                  animate={{
                    x,
                    y: verticalOffset,
                    scale,
                    opacity,
                  }}
                  transition={{ duration: 0.55, ease: 'easeInOut' }}
                  className="absolute left-1/2 -translate-x-1/2 rounded-xl overflow-hidden cursor-pointer shadow-lg will-change-transform"
                  style={{ width: w, height: h, zIndex: 40 - distance }}
                  onClick={() => {
                    if (!isCentered) {
                      if (position < 0) handlePrev(); else handleNext();
                    } else if (onPopupClick && item.rank) {
                      onPopupClick(item.id);
                    }
                  }}
                >
                  <div className="relative w-full h-full">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                      {item.rank && position === 0 && (
                        <div className="mb-1">
                          <span className="text-lg font-['Black_Han_Sans:Regular',sans-serif]">- {item.rank} -</span>
                        </div>
                      )}
                      <h3 className={`font-['Black_Han_Sans:Regular',sans-serif] mb-1 line-clamp-2 ${position === 0 ? 'text-[13px]' : 'text-[9px]'}`}>{item.title}</h3>
                      {position === 0 && (
                        <>
                          <p className="text-[9px] font-['Black_Han_Sans:Regular',sans-serif] mb-0.5">{item.date}</p>
                          <div className="flex items-center gap-0.5 text-[9px] font-['Black_Han_Sans:Regular',sans-serif]">
                            <MapPin className="w-2.5 h-2.5" color="white" />
                            <span className="line-clamp-1">{item.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {carouselItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all rounded-full ${currentIndex === idx ? 'w-6 h-2 bg-[#eb0000]' : 'w-2 h-2 bg-gray-400'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
    {/* Desktop version */}
    <div className="hidden md:block py-12" style={{minHeight: Math.max(520, config.desktop.cardH + 160)}}>
      <div className="w-full mx-auto relative px-16" style={{maxWidth: config.desktop.containerMaxW, height: config.desktop.trackH}}>
        {/* Slides */}
        <div className="absolute inset-0 flex items-center justify-center">
          {carouselItems.map((item, idx) => {
            // Base circular delta
            let pos = idx - currentIndex;
            const total = carouselItems.length;
            // Normalize to minimal distance representation
            if(pos > total/2) pos -= total;
            if(pos < -total/2) pos += total;
            // Skip if outside visible range for current viewport size
            if(Math.abs(pos) > config.desktop.maxDistance) return null;
            // Dynamic spacing derived from card width
            const step = config.desktop.step;
            const translateX = pos * step;
            // Scale & opacity tiers based on relative distance
            const distance = Math.abs(pos);
            const scaleMap: Record<number, number> = config.desktop.scaleMap;
            const opacityMap: Record<number, number> = config.desktop.opacityMap;
            const scale = scaleMap[distance] ?? 0.7;
            const opacity = opacityMap[distance] ?? 0.4;
            const zIndex = 100 - distance; // center above others
            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={{ scale, opacity, x: translateX }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={`absolute rounded-2xl overflow-hidden shadow-xl border cursor-pointer bg-black/10 backdrop-blur-sm ${pos===0? 'ring-2 ring-[#eb0000]': 'ring-0'}`}
                style={{ zIndex, width: config.desktop.cardW, height: config.desktop.cardH }}
                onClick={() => {
                  if(pos !== 0){ if(pos < 0) handlePrev(); else handleNext(); }
                  else onPopupClick?.(item.id);
                }}
              >
                <div className="relative w-full h-full">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold tracking-wide bg-[#eb0000] px-2 py-0.5 rounded-full shadow">{item.rank}위</span>
                      {pos===0 && (
                        <button aria-label="다음" onClick={(e)=>{e.stopPropagation(); handleNext();}} className="p-1 rounded-full hover:bg-white/20">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <h3 className="font-['Black_Han_Sans:Regular',sans-serif] text-lg leading-tight line-clamp-2 mb-2 drop-shadow">{item.title}</h3>
                    {pos===0 && (
                      <>
                        <p className="text-xs mb-1 opacity-90 font-['Pretendard:Regular',sans-serif]">{item.date}</p>
                        <p className="flex items-center gap-1 text-xs opacity-90 font-['Pretendard:Regular',sans-serif]"><MapPin className="w-3 h-3" />{item.location}</p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {/* Navigation arrows */}
  <button aria-label="Previous" onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow p-3 backdrop-blur-sm z-20"><ChevronLeft className="w-6 h-6" /></button>
  <button aria-label="Next" onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow p-3 backdrop-blur-sm z-20"><ChevronRight className="w-6 h-6" /></button>
        {/* Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {carouselItems.map((_, idx) => (
            <button
              key={idx}
              onClick={()=>setCurrentIndex(idx)}
              aria-label={`슬라이드 ${idx+1}`}
              className={`rounded-full transition-all ${currentIndex===idx? 'w-6 h-2 bg-[#eb0000]':'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  </div></div>
  );
}

// Hook: returns responsive parameters for common app/web sizes
function useResponsiveCarouselConfig(){
  type DesktopCfg = {
    breakpoint: number; // min width
    cardW: number;
    cardH: number;
    maxDistance: 1|2|3;
    gapFactor: number; // step = cardW * gapFactor
    containerMaxW: number;
  };
  const calculate = () => {
    const w = typeof window === 'undefined' ? 1440 : window.innerWidth;
    const isMobile = w < 768; // app-like sizes (360, 375, 390, 414, 430)

    // Desktop presets for typical web sizes: 1024, 1280, 1440, 1536+
    const presets: DesktopCfg[] = [
      { breakpoint: 1536, cardW: 320, cardH: 480, maxDistance: 3, gapFactor: 0.78, containerMaxW: 1680 },
      { breakpoint: 1440, cardW: 300, cardH: 450, maxDistance: 3, gapFactor: 0.76, containerMaxW: 1600 },
      { breakpoint: 1280, cardW: 280, cardH: 420, maxDistance: 2, gapFactor: 0.74, containerMaxW: 1480 },
      { breakpoint: 1024, cardW: 260, cardH: 400, maxDistance: 2, gapFactor: 0.72, containerMaxW: 1360 },
      { breakpoint: 768,  cardW: 240, cardH: 380, maxDistance: 1, gapFactor: 0.70, containerMaxW: 1200 },
    ];

    // Mobile center card scales by viewport; clamp to [160, 210]
    const mCenterW = Math.min(210, Math.max(160, Math.round(w * 0.45)));
    const mCenterH = Math.round(mCenterW * 1.38);
    // choose a step that keeps side cards inside safe padding without clipping
    const sideSpace = Math.max(0, (w - mCenterW) / 2 - 24);
    const step = Math.round(Math.min(Math.max(56, mCenterW * 0.68), sideSpace));
    const mobile = {
      containerW: w,
      cardW: mCenterW,
      cardH: mCenterH,
      trackH: Math.round(mCenterH + 40),
      step,
      scale: {0:1, 1:0.89, 2:0.81, 3:0.75} as Record<number, number>,
      opacity: {0:1, 1:0.7, 2:0.5, 3:0.3} as Record<number, number>,
    } as const;

    const desktopPreset = presets.find(p => w >= p.breakpoint) ?? presets[presets.length-1];
    const desktop = {
      cardW: desktopPreset.cardW,
      cardH: desktopPreset.cardH,
      step: Math.round(desktopPreset.cardW * desktopPreset.gapFactor),
      maxDistance: desktopPreset.maxDistance,
      containerMaxW: desktopPreset.containerMaxW,
      trackH: desktopPreset.cardH + 40,
      scaleMap: {0:1, 1:0.88, 2:0.78, 3:0.7} as Record<number, number>,
      opacityMap: {0:1, 1:0.85, 2:0.55, 3:0.4} as Record<number, number>,
    };

    return { isMobile, mobile, desktop };
  };

  const [state, setState] = useState(calculate);
  useEffect(()=>{
    const onResize = () => setState(calculate());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  },[]);
  return state;
}
