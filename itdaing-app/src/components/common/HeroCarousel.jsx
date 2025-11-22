import { useEffect, useMemo, useState } from 'react';
import { MapPin, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { getImageUrl } from '@/utils/imageUtils';

/**
 * HeroCarousel Component (반응형 최적화)
 * 중앙이 크고 양옆으로 갈수록 작아지는 디자인
 */
const HeroCarousel = ({ items = [], isLoading = false, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [favoriteMap, setFavoriteMap] = useState({});
  const [dimensions, setDimensions] = useState({ width: 0, isMobile: true });

  // 화면 크기 감지
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      setDimensions({
        width,
        isMobile: width < 768,
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 팝업 데이터 정규화
  const normalizedItems = useMemo(() => {
    return (items ?? []).map((popup, index) => {
      const fallback = '/placeholder-popup.png';
      const heroImage = getImageUrl(
        popup.heroImageUrl || popup.thumbnail || popup.thumbnailImageUrl,
        fallback
      );
      const start = popup.startDate ? new Date(popup.startDate) : null;
      const end = popup.endDate ? new Date(popup.endDate) : null;
      const dateLabel = start && end
        ? `${start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} - ${end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
        : popup.startDate || '일정 미정';

      return {
        id: popup.id ?? `popup-${index}`,
        rank: popup.rank ?? index + 1,
        title: popup.title ?? '제목 없는 팝업',
        location: popup.address || popup.locationName || '위치 미정',
        date: dateLabel,
        image: heroImage,
      };
    });
  }, [items]);

  const hasItems = normalizedItems.length > 0;

  // 자동 슬라이드
  useEffect(() => {
    if (!hasItems || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % normalizedItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, normalizedItems.length, hasItems]);

  const handlePrev = () => {
    if (!hasItems) return;
    setCurrentIndex((prev) => (prev - 1 + normalizedItems.length) % normalizedItems.length);
  };

  const handleNext = () => {
    if (!hasItems) return;
    setCurrentIndex((prev) => (prev + 1) % normalizedItems.length);
  };

  const handleFavoriteToggle = (event, popupId) => {
    event.stopPropagation();
    setFavoriteMap((prev) => ({ ...prev, [popupId]: !prev[popupId] }));
  };

  if (isLoading && !hasItems) {
    return <div className="w-full h-[300px] md:h-[400px] rounded-2xl bg-gray-100 animate-pulse" />;
  }

  if (!hasItems) return null;

  // 반응형 카드 설정 (컨테이너 안에 모두 수용)
  const { isMobile } = dimensions;
  const centerCardWidth = isMobile ? 150 : 280;
  const centerCardHeight = isMobile ? 225 : 420;
  const containerHeight = isMobile ? 260 : 460;

  return (
    <section
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative mx-auto rounded-2xl bg-linear-to-b from-[#fff6f2] via-white to-[#fff6f2] p-4 md:p-6 overflow-hidden">
        {/* 캐러셀 컨테이너 (5개 카드 겹쳐서 표시) */}
        <div 
          className="relative w-full overflow-hidden" 
          style={{ height: containerHeight }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {normalizedItems.map((item, idx) => {
              let position = (idx - currentIndex + normalizedItems.length) % normalizedItems.length;
              
              // 5개 카드 표시: -2, -1, 0(중앙), 1, 2
              if (position > normalizedItems.length / 2) {
                position -= normalizedItems.length;
              }
              
              if (Math.abs(position) > 2) return null;

              let translateX = 0;
              let scale = 1;
              let zIndex = 10;
              let opacity = 1;
              let cardWidth = centerCardWidth;
              let cardHeight = centerCardHeight;

              // 위치별 스타일 (컨테이너 안에 수용하면서 겹침 효과)
              if (position === -2) {
                translateX = isMobile ? -centerCardWidth * 1.35 : -centerCardWidth * 1.25;
                scale = 0.62;
                zIndex = 1;
                opacity = 0.35;
                cardWidth = centerCardWidth * 0.62;
                cardHeight = centerCardHeight * 0.62;
              } else if (position === -1) {
                translateX = isMobile ? -centerCardWidth * 0.8 : -centerCardWidth * 0.72;
                scale = 0.8;
                zIndex = 5;
                opacity = 0.6;
                cardWidth = centerCardWidth * 0.8;
                cardHeight = centerCardHeight * 0.8;
              } else if (position === 0) {
                translateX = 0;
                scale = 1;
                zIndex = 10;
                opacity = 1;
              } else if (position === 1) {
                translateX = isMobile ? centerCardWidth * 0.8 : centerCardWidth * 0.72;
                scale = 0.8;
                zIndex = 5;
                opacity = 0.6;
                cardWidth = centerCardWidth * 0.8;
                cardHeight = centerCardHeight * 0.8;
              } else if (position === 2) {
                translateX = isMobile ? centerCardWidth * 1.35 : centerCardWidth * 1.25;
                scale = 0.62;
                zIndex = 1;
                opacity = 0.35;
                cardWidth = centerCardWidth * 0.62;
                cardHeight = centerCardHeight * 0.62;
              }

              const isActive = position === 0;
              const isFavorite = Boolean(favoriteMap[item.id]);

              return (
                <motion.div
                  key={item.id}
                  initial={false}
                  animate={{ 
                    x: translateX,
                    scale,
                    opacity,
                  }}
                  transition={{ 
                    duration: 0.55,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                  style={{ 
                    zIndex,
                    width: centerCardWidth,
                    height: centerCardHeight,
                  }}
                  onClick={() => {
                    if (position < 0) handlePrev();
                    else if (position > 0) handleNext();
                    else onSelect?.(item.id);
                  }}
                >
                  <div className="relative w-full h-full">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {isActive && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleFavoriteToggle(e, item.id)}
                          className="absolute top-3 md:top-4 right-3 md:right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                          aria-label="관심 팝업"
                        >
                          <Heart
                            className="w-4 h-4 md:w-5 md:h-5"
                            fill={isFavorite ? '#eb0000' : 'none'}
                            color={isFavorite ? '#eb0000' : '#414141'}
                          />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 space-y-1 md:space-y-2">
                          <div className="inline-flex items-center bg-white/90 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold text-gray-900">
                            #{item.rank.toString().padStart(2, '0')}
                          </div>
                          <h3 className="text-base md:text-2xl font-bold text-white leading-tight line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs md:text-sm text-white/90">{item.date}</p>
                          <p className="flex items-center gap-1 text-xs md:text-sm text-white/85">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="line-clamp-1">{item.location}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-4 md:mt-6 flex items-center justify-center gap-1.5 md:gap-2">
          {normalizedItems.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all ${
                idx === currentIndex 
                  ? 'w-6 md:w-8 h-1.5 md:h-2 bg-slate-800' 
                  : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-slate-300'
              }`}
              aria-label={`슬라이드 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
