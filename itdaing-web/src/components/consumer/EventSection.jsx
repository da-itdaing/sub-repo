import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "../custom-ui/EventCard.jsx";
import { FilterButtons } from "../custom-ui/FilterButtons.jsx";
import { CommunityFilterButtons } from "../custom-ui/CommunityFilterButtons.jsx";
import { SectionTitle } from "../custom-ui/SectionTitle.jsx";

export function EventSection({
  title,
  highlight,
  showAll,
  onToggleShowAll,
  type,
  onPopupClick,
  isLoggedIn,
  onLoginClick,
  items,
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const prevLengthRef = useRef(0);
  const [locationFilter, setLocationFilter] = useState("동구");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [visibleCount, setVisibleCount] = useState(4);

  const events = items ?? [];

  const filteredEvents =
    type === "local"
      ? locationFilter === "전체"
        ? events
        : events.filter((e) =>
            (e.address ?? e.location).includes(locationFilter)
          )
      : type === "community" && categoryFilter !== "전체"
      ? events.filter((e) => {
          if (!e.categories || e.categories.length === 0) return true;
          return e.categories.some(cat => cat.includes(categoryFilter));
        })
      : events;

  const displayedEvents = showAll
    ? filteredEvents
    : filteredEvents.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(4);
  }, [locationFilter, categoryFilter]);

  // 모바일 무한 스크롤 (IntersectionObserver)
  useEffect(() => {
    // 모바일에서만 작동 (640px 미만)
    const isMobile = window.innerWidth < 640;
    if (!isMobile) return;

    const container = scrollContainerRef.current;
    const sentinel = container?.querySelector('[data-scroll-sentinel]');
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredEvents.length) {
          setVisibleCount(prev => Math.min(prev + 4, filteredEvents.length));
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredEvents, visibleCount]);

  useEffect(() => {
    const c = scrollContainerRef.current;
    if (!c) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = c;
      const max = scrollWidth - clientWidth;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(max > 10 && scrollLeft < max - 10);

      const cards = c.querySelectorAll("[data-card-index]");
      if (cards.length > 0) {
        const containerRect = c.getBoundingClientRect();
        const containerRight = containerRect.right;
        let last = 1;
        cards.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const center = cardRect.left + cardRect.width / 2;
          if (center <= containerRight - 20) last = index + 1;
        });
        setCurrentCardIndex(last);
      }
    };

    const currentLength = filteredEvents.length;
    if (prevLengthRef.current !== currentLength) {
      c.scrollLeft = 0;
      prevLengthRef.current = currentLength;
      setCurrentCardIndex(1);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(update);
    });

    c.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      c.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [filteredEvents]);

  const scroll = (dir) => {
    const c = scrollContainerRef.current;
    if (!c) return;
    c.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <section className="mb-4 sm:mb-6 lg:mb-8">
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <SectionTitle title={title} highlight={highlight} />
      </div>

      {type === "local" && (
        <FilterButtons
          activeFilter={locationFilter}
          onFilterChange={setLocationFilter}
        />
      )}

      {type === "community" && (
        <CommunityFilterButtons
          activeFilter={categoryFilter}
          onFilterChange={setCategoryFilter}
        />
      )}

      <div className="hidden sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4 lg:gap-4">
        {displayedEvents.map((e) => (
          <div key={e.id} className="w-[151px] md:w-[190px] lg:w-[244px] xl:w-[276px]">
            <EventCard
              {...e}
              onClick={() => onPopupClick(e.id)}
              isLoggedIn={isLoggedIn}
              onLoginClick={onLoginClick}
            />
          </div>
        ))}
      </div>

      {filteredEvents.length > 4 && (
        <div className="hidden sm:flex flex-col items-center gap-3 mt-3 md:mt-4">
          <p className="text-sm md:text-base text-[#4d4d4d] font-[\x27Pretendard:Medium\x27,sans-serif]">
            {displayedEvents.length} / {filteredEvents.length}
          </p>
          {showAll || visibleCount >= filteredEvents.length ? (
            <button
              onClick={() => {
                if (showAll) onToggleShowAll();
                setVisibleCount(4);
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#eb0000] text-white rounded-full hover:bg-[#cc0000] transition-colors font-[\x27Pretendard:Medium\x27,sans-serif] text-sm md:text-base"
            >
              접기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
            </button>
          ) : visibleCount > 4 ? (
            <div className="flex items-center gap-3">
              {visibleCount < filteredEvents.length && (
                <button
                  onClick={() =>
                    setVisibleCount((prev) =>
                      Math.min(prev + 4, filteredEvents.length)
                    )
                  }
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-200 text-[#4d4d4d] rounded-full hover:bg-gray-300 transition-colors font-[\x27Pretendard:Medium\x27,sans-serif] text-sm md:text-base"
                >
                  더보기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              <button
                onClick={() => setVisibleCount(4)}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#eb0000] text-white rounded-full hover:bg-[#cc0000] transition-colors font-[\x27Pretendard:Medium\x27,sans-serif] text-sm md:text-base"
              >
                접기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + 4, filteredEvents.length)
                  )
                }
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-200 text-[#4d4d4d] rounded-full hover:bg-gray-300 transition-colors font-[\x27Pretendard:Medium\x27,sans-serif] text-sm md:text-base"
              >
                더보기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={onToggleShowAll}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#eb0000] text-white rounded-full hover:bg-[#cc0000] transition-colors font-[\x27Pretendard:Medium\x27,sans-serif] text-sm md:text-base"
              >
                전체보기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="block sm:hidden">
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
          >
            {filteredEvents.map((e, index) => (
              <div
                key={e.id}
                data-card-index={index}
                className="flex-shrink-0 w-[160px] snap-start"
              >
                <EventCard
                  {...e}
                  onClick={() => onPopupClick(e.id)}
                  isLoggedIn={isLoggedIn}
                  onLoginClick={onLoginClick}
                />
              </div>
            ))}
            <div data-scroll-sentinel className="h-1 w-1 shrink-0"></div>
          </div>
          <div className="mt-3 flex items-center justify-center px-1">
            <p className="text-xs text-[#4d4d4d] font-[\x27Pretendard:Medium\x27,sans-serif]">
              {currentCardIndex} / {filteredEvents.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
