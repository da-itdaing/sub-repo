import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "./EventCard";
import { FilterButtons } from "./FilterButtons";
import { CommunityFilterButtons } from "./CommunityFilterButtons";
import { SectionTitle } from "./SectionTitle";
import { useRef, useState, useEffect } from "react";
import { popups } from "../../data/popups";

interface ExternalEventItem {
  id: number;
  image: string;
  title: string;
  date: string;
  location: string;
  isFavorite?: boolean;
}

interface EventSectionProps {
  title: React.ReactNode;
  highlight?: string;
  showAll: boolean;
  onToggleShowAll: () => void;
  type: "opening" | "local" | "community";
  onPopupClick: (id: number) => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  items?: ExternalEventItem[];
}

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
}: EventSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const prevLengthRef = useRef<number>(0);
  const [locationFilter, setLocationFilter] = useState("동구");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [visibleCount, setVisibleCount] = useState(4);

  const openingEvents = popups
    .filter((p) => p.status === "upcoming")
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      image: p.images[0],
      title: p.title,
      date: p.date,
      location: p.location,
      isFavorite: false,
    }));

  const localEvents = popups
    .filter((p) => p.status === "upcoming" || p.status === "ongoing")
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      image: p.images[0],
      title: p.title,
      date: p.date,
      location: p.location,
      isFavorite: false,
    }));

  const communityEvents = popups
    .filter((p) => p.status === "upcoming" || p.status === "ongoing")
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      image: p.images[0],
      title: p.title,
      date: p.date,
      location: p.location,
      isFavorite: false,
    }));

  const baseEvents =
    type === "opening"
      ? openingEvents
      : type === "local"
      ? localEvents
      : communityEvents;

  const events = items && items.length > 0 ? items : baseEvents;

  const filteredEvents =
    type === "local"
      ? locationFilter === "전체"
        ? events
        : events.filter((e) =>
            popups.find((p) => p.id === e.id)?.address.includes(locationFilter)
          )
      : type === "community" && categoryFilter !== "전체"
      ? events.filter((e) => {
          const popup = popups.find((p) => p.id === e.id);
          const catMap: { [k: string]: string[] } = {
            패션: ["플리마켓", "빈티지마켓", "패션마켓"],
            뷰티: ["아로마페어", "뷰티마켓"],
            음식: ["디저트마켓", "푸드마켓"],
            건강: ["아로마페어", "헬스마켓", "요가페어"],
            "공연/전시": ["크래프트페어", "아트마켓", "유리공예전", "공연마켓"],
            스포츠: ["스포츠마켓"],
            키즈: ["키즈마켓", "키즈페스티벌"],
            아트: [
              "크래프트페어",
              "아트마켓",
              "액세서리페어",
              "목공예마켓",
              "문구페어",
              "플라워마켓",
              "유리공예전",
              "크리에이터마켓",
            ],
            굿즈: ["문구페어", "캔들마켓", "굿즈페어"],
            반려동물: ["식물마켓", "펫페어"],
          };
          const match = catMap[categoryFilter] || [];
          return popup && match.includes(popup.category);
        })
      : events;

  const displayedEvents = showAll
    ? filteredEvents
    : filteredEvents.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(4);
  }, [locationFilter, categoryFilter]);

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
          const cardRect = (card as HTMLElement).getBoundingClientRect();
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

  const scroll = (dir: "left" | "right") => {
    const c = scrollContainerRef.current;
    if (!c) return;
    c.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <section className="mb-6 md:mb-12 lg:mb-16">
      <div className="flex items-center justify-between mb-3 md:mb-6">
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

      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {displayedEvents.map((e) => (
          <EventCard
            key={e.id}
            {...e}
            onClick={() => onPopupClick(e.id)}
            isLoggedIn={isLoggedIn}
            onLoginClick={onLoginClick}
          />
        ))}
      </div>

      {filteredEvents.length > 4 && (
        <div className="hidden sm:flex flex-col items-center gap-3 mt-4 md:mt-6">
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
