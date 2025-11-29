import { useEffect, useMemo, useRef, useState } from 'react';
import EventCard from './EventCard';
import { isPopupActive } from '@/utils/popupUtils';

const EventSection = ({
  title,
  description,
  popups = [],
  initialShow = 4,
  filterType,
  customFilterOptions,
  hideEnded = true, // 종료된 팝업 기본적으로 숨김
  maxItems = 20,    // 최대 표시 개수 (무한 로딩 아님)
}) => {
  const [visibleCount, setVisibleCount] = useState(initialShow);
  const [expanded, setExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const scrollRef = useRef(null);

  // 필터 초기화
  useEffect(() => {
    setVisibleCount(initialShow);
    setExpanded(false);
    setSelectedFilter('전체');
  }, [initialShow, popups.length, filterType]);

  // 필터 옵션 생성
  const filterOptions = useMemo(() => {
    if (Array.isArray(customFilterOptions) && customFilterOptions.length > 0) {
      return customFilterOptions;
    }
    if (!filterType || popups.length === 0) return [];
    
    const raw = popups.map((popup) => {
        if (filterType === 'region') {
        // 광주 5개구 필터링
        const region = popup.primaryRegion || popup.regionTag || popup.location?.split?.(' ')?.[0];
        if (['동구', '서구', '남구', '북구', '광산구', '광주'].some(r => region?.includes(r))) {
          return region;
        }
        return null;
        }
        if (filterType === 'category') {
          return popup.categoryTag || popup.categories?.[0];
        }
        return null;
    }).filter(Boolean);

    const unique = Array.from(new Set(raw));
    return ['전체', ...unique];
  }, [customFilterOptions, filterType, popups]);

  // 필터링 + 종료 팝업 제거 로직
  const filteredPopups = useMemo(() => {
    let result = popups;

    // 1. 종료된 팝업 필터링
    if (hideEnded) {
      result = result.filter(isPopupActive);
    }

    // 2. 선택된 필터 적용
    if (selectedFilter !== '전체') {
    if (filterType === 'region') {
        result = result.filter((popup) => {
        const region = popup.primaryRegion || popup.regionTag || popup.location?.split?.(' ')?.[0];
        return region === selectedFilter;
      });
      } else if (filterType === 'category') {
        result = result.filter((popup) => {
        if (popup.categoryTag) return popup.categoryTag === selectedFilter;
        if (Array.isArray(popup.categories)) {
          return popup.categories.some((cat) => cat === selectedFilter);
        }
        return false;
      });
    }
    }

    return result;
  }, [filterType, popups, selectedFilter, hideEnded]);

  // 보여줄 팝업 리스트 계산
  const displayedPopups = useMemo(() => {
    // 모바일에서는 전체(가로 스크롤), 데스크톱에서는 visibleCount만큼만
    // 하지만 여기서는 displayedPopups를 렌더링에 사용하므로,
    // 모바일용 리스트는 별도로 처리하거나 CSS로 제어함.
    // 현재 구조상 displayedPopups는 데스크톱 그리드용.
    
    if (expanded) return filteredPopups.slice(0, maxItems);
    return filteredPopups.slice(0, Math.min(visibleCount, maxItems));
  }, [expanded, filteredPopups, visibleCount, maxItems]);

  const hasMore = filteredPopups.length > visibleCount && !expanded && visibleCount < maxItems;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, Math.min(filteredPopups.length, maxItems)));
  };

  const handleToggleExpand = () => {
    if (expanded) {
      setVisibleCount(initialShow);
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  return (
    <section className="mb-10">
      {/* 헤더 영역 */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
          {/* <span className="text-xs font-semibold text-gray-400">
            {Math.min(displayedPopups.length, filteredPopups.length)} / {filteredPopups.length}
          </span> */}
        </div>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        
        {filterOptions.length > 0 && (
          <FilterChips options={filterOptions} value={selectedFilter} onChange={setSelectedFilter} />
        )}
        
        {/* 구분선 */}
        <div className="w-full h-px bg-linear-to-r from-gray-200 via-gray-100 to-transparent mt-2" />
      </div>

      {filteredPopups.length > 0 ? (
        <>
          {/* 데스크톱: 그리드 뷰 */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedPopups.map((popup) => (
              <EventCard key={popup.id} popup={popup} />
            ))}
          </div>

          {/* 모바일: 슬라이더 (가로 스크롤) */}
          {/* 모바일에서는 전체 리스트를 스크롤로 보여줌 (최대 maxItems) */}
          <div className="md:hidden">
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
            >
              {filteredPopups.slice(0, maxItems).map((popup, index) => (
                <div key={popup.id} data-card-index={index} className="w-[42%] min-w-[160px] shrink-0 snap-start">
                  <EventCard popup={popup} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">진행 중인 팝업이 없습니다.</p>
        </div>
      )}

      {/* 더보기 버튼 (데스크톱 전용) */}
      {filteredPopups.length > 0 && (
        <div className="mt-6 hidden md:flex md:flex-row md:items-center md:justify-center gap-2">
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              className="w-full md:w-auto px-5 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
            >
              더보기
            </button>
          )}
          {filteredPopups.length > initialShow && (
            <button
              type="button"
              onClick={handleToggleExpand}
              className={`w-full md:w-auto px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-all ${
                expanded
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {expanded ? '접기' : '전체보기'}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default EventSection;

const FilterChips = ({ options, value, onChange }) => {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              shrink-0
              px-4 py-2                      /* 버튼 가로/세로 */
              rounded-full                   /* ➜ 더 둥글게! */
              text-sm font-semibold          
              border transition-all duration-200
              ${
                isActive
                  ? 'bg-[#EB0000] text-white border-[#EB0000] shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

