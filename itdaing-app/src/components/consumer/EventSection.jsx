import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from './SectionTitle';
import FilterButtons from './FilterButtons';
import CommunityFilterButtons from './CommunityFilterButtons';
import EventCard from './EventCard';

const EventSection = ({
  title,
  highlight,
  description,
  type,
  items = [],
  showAll,
  onToggleShowAll,
  onPopupClick,
  isLoggedIn,
  onLoginClick,
}) => {
  const scrollRef = useRef(null);
  const [locationFilter, setLocationFilter] = useState('전체');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [visibleCount, setVisibleCount] = useState(4);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1);

  const filteredEvents = useMemo(() => {
    if (type === 'local') {
      if (locationFilter === '전체') return items;
      return items.filter(({ regionTag, location }) =>
        (regionTag || location || '').includes(locationFilter)
      );
    }

    if (type === 'community') {
      if (categoryFilter === '전체') return items;
      return items.filter(({ categoryTag, categories }) => {
        if (categoryTag) return categoryTag.includes(categoryFilter);
        if (!categories || categories.length === 0) return false;
        return categories.some((cat) => cat?.includes(categoryFilter));
      });
    }

    return items;
  }, [items, type, locationFilter, categoryFilter]);

  const displayedEvents = showAll ? filteredEvents : filteredEvents.slice(0, visibleCount);
  const totalCount = filteredEvents.length;

  useEffect(() => {
    setVisibleCount(4);
  }, [locationFilter, categoryFilter, filteredEvents.length]);

  // 스크롤 상태 업데이트
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(maxScroll > 10 && scrollLeft < maxScroll - 10);

      const cards = container.querySelectorAll('[data-card-index]');
      if (cards.length > 0) {
        const containerRect = container.getBoundingClientRect();
        const containerRight = containerRect.right;
        let lastVisible = 1;
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          if (center <= containerRight - 24) {
            lastVisible = index + 1;
          }
        });
        setCurrentIndex(lastVisible);
      }
    };

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [filteredEvents]);

  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, totalCount));
  };

  const handleViewAllToggle = () => {
    onToggleShowAll?.();
  };

  return (
    <section className="mb-12">
      <div className="flex flex-col gap-2 mb-6">
        <SectionTitle title={title} highlight={highlight} />
        {description && (
           // 구분선 스타일 적용 (레퍼런스 느낌)
          <div className="w-full h-px bg-gray-200 mt-2 mb-1" />
        )}
      </div>

      {type === 'local' && (
        <FilterButtons activeFilter={locationFilter} onFilterChange={setLocationFilter} />
      )}
      {type === 'community' && (
        <CommunityFilterButtons activeFilter={categoryFilter} onFilterChange={setCategoryFilter} />
      )}

      {/* 데스크톱 그리드 */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-x-4 gap-y-8">
        {displayedEvents.map((event) => (
          <EventCard
            key={event.id}
            {...event}
            onClick={() => onPopupClick?.(event.id)}
            isLoggedIn={isLoggedIn}
            onLoginClick={onLoginClick}
          />
        ))}
      </div>

      {/* 모바일 스크롤 */}
      <div className="sm:hidden relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center border border-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center border border-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
        >
          {filteredEvents.map((event, index) => (
            <div key={event.id} data-card-index={index} className="w-[160px] shrink-0 snap-start">
              <EventCard
                {...event}
                onClick={() => onPopupClick?.(event.id)}
                isLoggedIn={isLoggedIn}
                onLoginClick={onLoginClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 페이지네이션 및 더보기 버튼 (공통) */}
      <div className="mt-6 flex flex-col items-center justify-center gap-3">
        <span className="text-xs font-medium text-gray-400 tracking-widest">
          {type === 'opening' ? '4 / 8' : `${Math.min(visibleCount, totalCount)} / ${totalCount}`}
        </span>
        
        {totalCount > 4 && (
          <div className="flex items-center gap-2">
             {/* 더보기 버튼 (회색) */}
            <button
              type="button"
              onClick={handleViewMore}
              disabled={visibleCount >= totalCount}
              className="px-5 py-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              더보기 <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* 전체보기 버튼 (빨간색 포인트) */}
            <button
              type="button"
              onClick={handleViewAllToggle}
              className="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
            >
              전체보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventSection;
