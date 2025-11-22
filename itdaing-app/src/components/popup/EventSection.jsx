import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EventCard from './EventCard';

const EventSection = ({ title, description, popups = [], initialShow = 4, filterType }) => {
  const [visibleCount, setVisibleCount] = useState(initialShow);
  const [expanded, setExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ canLeft: false, canRight: false, current: 1 });
  const MAX_ITEMS = 20; // 최대 표시 개수 제한

  useEffect(() => {
    setVisibleCount(initialShow);
    setExpanded(false);
    setSelectedFilter('전체');
  }, [initialShow, popups.length, filterType]);

  const filterOptions = useMemo(() => {
    if (!filterType || popups.length === 0) return [];
    const raw = popups
      .map((popup) => {
        if (filterType === 'region') {
          return popup.primaryRegion || popup.regionTag || popup.location?.split?.(' ')?.[0];
        }
        if (filterType === 'category') {
          return popup.categoryTag || popup.categories?.[0];
        }
        return null;
      })
      .filter(Boolean);
    const unique = Array.from(new Set(raw));
    return ['전체', ...unique];
  }, [filterType, popups]);

  const filteredPopups = useMemo(() => {
    if (selectedFilter === '전체') return popups;
    if (filterType === 'region') {
      return popups.filter((popup) => {
        const region = popup.primaryRegion || popup.regionTag || popup.location?.split?.(' ')?.[0];
        return region === selectedFilter;
      });
    }
    if (filterType === 'category') {
      return popups.filter((popup) => {
        if (popup.categoryTag) return popup.categoryTag === selectedFilter;
        if (Array.isArray(popup.categories)) {
          return popup.categories.some((cat) => cat === selectedFilter);
        }
        return false;
      });
    }
    return popups;
  }, [filterType, popups, selectedFilter]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (filteredPopups.length === 0) {
      setScrollState({ canLeft: false, canRight: false, current: 0 });
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      const canLeft = scrollLeft > 8;
      const canRight = maxScroll > 8 && scrollLeft < maxScroll - 8;

      const cards = Array.from(container.querySelectorAll('[data-card-index]'));
      let current = 1;
      const containerLeft = container.getBoundingClientRect().left;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const relativeLeft = rect.left - containerLeft;
        if (relativeLeft <= rect.width / 2 + 12) {
          current = index + 1;
        }
      });

      setScrollState({ canLeft, canRight, current });
    };

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [filteredPopups]);

  const displayedPopups = useMemo(() => {
    if (expanded) return filteredPopups.slice(0, MAX_ITEMS);
    return filteredPopups.slice(0, Math.min(visibleCount, MAX_ITEMS));
  }, [expanded, filteredPopups, visibleCount]);

  const hasMore = filteredPopups.length > visibleCount && !expanded && visibleCount < MAX_ITEMS;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, Math.min(filteredPopups.length, MAX_ITEMS)));
  };

  const handleToggleExpand = () => {
    if (expanded) {
      setVisibleCount(initialShow);
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="mb-10">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <span className="text-xs font-semibold text-gray-400">
            {Math.min(displayedPopups.length, filteredPopups.length)} / {filteredPopups.length}
          </span>
        </div>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        {filterOptions.length > 0 && (
          <FilterChips options={filterOptions} value={selectedFilter} onChange={setSelectedFilter} />
        )}
        <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />
      </div>

      {displayedPopups.length > 0 ? (
        <>
          {/* 데스크톱: 4열 그리드 */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            {displayedPopups.map((popup) => (
              <EventCard key={popup.id} popup={popup} />
            ))}
          </div>

          {/* 모바일: 가로 스크롤 */}
          <div className="md:hidden">
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            >
              {filteredPopups.map((popup, index) => (
                <div key={popup.id} data-card-index={index} className="w-[42%] shrink-0 snap-start">
                  <EventCard popup={popup} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">표시할 팝업이 없습니다.</div>
      )}

      {/* 더보기/전체보기 버튼 (데스크톱만) */}
      {filteredPopups.length > 0 && (
        <div className="mt-4 hidden md:flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-center gap-2">
            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-4 py-1.5 rounded-full border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                더보기 <ChevronDown className="w-3 h-3" />
              </button>
            )}
            {filteredPopups.length > initialShow && (
              <button
                type="button"
                onClick={handleToggleExpand}
                className={`px-5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm transition-colors ${
                  expanded ? 'bg-gray-800 hover:bg-gray-700' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {expanded ? '접기' : '전체보기'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default EventSection;

const FilterChips = ({ options, value, onChange }) => {
  // 최대 6개까지만 표시 (전체 + 5개)
  const displayOptions = options.slice(0, 6);
  
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {displayOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all ${
            value === option
              ? 'bg-gray-900 text-white shadow-md scale-105'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

