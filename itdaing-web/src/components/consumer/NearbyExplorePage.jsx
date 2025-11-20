import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapPin, LogIn, LogOut, Navigation, RefreshCw, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { popupService } from "../../services/popupService";
import { getImageUrl } from "../../utils/imageUtils";
import { EventCard } from "../custom-ui/EventCard";
import KakaoMapDirect from "../map/KakaoMapDirect";

// 광주광역시 중심 및 각 구별 중심 좌표
const GWANGJU_CENTER = { lat: 35.14667451156048, lng: 126.92227158987355 };
const REGION_CENTERS = {
  ALL: GWANGJU_CENTER,
  "남구": { lat: 35.140, lng: 126.910 },
  "동구": { lat: 35.150, lng: 126.940 },
  "서구": { lat: 35.150, lng: 126.860 },
  "북구": { lat: 35.180, lng: 126.890 },
  "광산구": { lat: 35.130, lng: 126.810 },
};
const MAX_DISTANCE_KM = 7;
const REGION_FILTERS = [
  { id: "ALL", label: "전체" },
  { id: "남구", label: "남구" },
  { id: "동구", label: "동구" },
  { id: "서구", label: "서구" },
  { id: "북구", label: "북구" },
  { id: "광산구", label: "광산구" },
];

const STATUS_BADGES = {
  ongoing: { label: "진행중", className: "bg-red-500 text-white" },
  upcoming: { label: "예정", className: "bg-yellow-400 text-gray-900" },
  ended: { label: "종료", className: "bg-gray-300 text-gray-700" },
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop";

const markerImageCache = {};

function calcDistanceKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some(v => typeof v !== "number")) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

function getPhase(startDate, endDate) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now < start) return "upcoming";
  if (start && end && now >= start && now <= end) return "ongoing";
  if (end && now > end) return "ended";
  return "upcoming";
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "상시 운영";
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const options = { month: "2-digit", day: "2-digit" };
  if (start && end) {
    return `${start.toLocaleDateString("ko-KR", options)} - ${end.toLocaleDateString("ko-KR", options)}`;
  }
  if (start) {
    return `${start.toLocaleDateString("ko-KR", options)} 시작`;
  }
  if (end) {
    return `${end.toLocaleDateString("ko-KR", options)} 종료`;
  }
  return "일정 미정";
}

function resolveRegion(popup) {
  if (!popup) return "";
  const text = `${popup.locationName ?? ""} ${popup.address ?? ""}`;
  for (const region of REGION_FILTERS.filter(r => r.id !== "ALL")) {
    if (text.includes(region.label)) return region.id;
  }
  return "ALL";
}

export function NearbyExplorePage({
  onMainClick,
  onMyPageClick,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
  onPopupClick,
}) {
  const mapInstanceRef = useRef(null);
  const [popups, setPopups] = useState([]);
  const [loadingPopups, setLoadingPopups] = useState(true);
  const [popupError, setPopupError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    let cancelled = false;
    setLoadingPopups(true);
    popupService
      .getPublicPopups()
      .then((list) => {
        if (cancelled) return;
        setPopups(list ?? []);
        setPopupError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setPopupError(error?.message || "팝업 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoadingPopups(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedPopups = useMemo(() => {
    const center = REGION_CENTERS[selectedRegion] || GWANGJU_CENTER;
    return (popups ?? []).map((popup) => {
      const latitude = typeof popup.latitude === "number" ? popup.latitude : null;
      const longitude = typeof popup.longitude === "number" ? popup.longitude : null;
      const distanceKm =
        latitude !== null && longitude !== null
          ? calcDistanceKm(center.lat, center.lng, latitude, longitude)
          : null;
      const phase = getPhase(popup.startDate, popup.endDate);
      return {
        ...popup,
        displayImage: getImageUrl(popup.thumbnail, FALLBACK_IMAGE),
        dateLabel: formatDateRange(popup.startDate, popup.endDate),
        distanceKm,
        phase,
        regionKey: resolveRegion(popup),
      };
    });
  }, [popups, selectedRegion]);

  const filteredPopups = useMemo(() => {
    const filtered = normalizedPopups
      .filter((popup) => selectedRegion === "ALL" || popup.regionKey === selectedRegion)
      .filter((popup) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.trim().toLowerCase();
        return popup.title?.toLowerCase().includes(term) || popup.description?.toLowerCase().includes(term);
      })
      .filter((popup) => {
        // ⭐ 좌표가 없는 팝업도 표시 (거리 필터만 적용)
        if (popup.latitude == null || popup.longitude == null) return true;
        if (popup.distanceKm == null) return true;
        return popup.distanceKm <= MAX_DISTANCE_KM;
      })
      .sort((a, b) => {
        const phaseOrder = { ongoing: 0, upcoming: 1, ended: 2 };
        const phaseDiff = phaseOrder[a.phase] - phaseOrder[b.phase];
        if (phaseDiff !== 0) return phaseDiff;
        if (a.distanceKm != null && b.distanceKm != null) {
          return a.distanceKm - b.distanceKm;
        }
        return (a.startDate || "").localeCompare(b.startDate || "");
      });
    
    return filtered;
  }, [normalizedPopups, selectedRegion, searchTerm]);

  // 마커 데이터 생성
  const mapMarkers = useMemo(() => {
    return filteredPopups
      .filter(popup => popup.latitude != null && popup.longitude != null)
      .map(popup => ({
        id: popup.id,
        lat: popup.latitude,
        lng: popup.longitude,
        phase: popup.phase,
        label: popup.title,
      }));
  }, [filteredPopups]);

  // 마커 클릭 핸들러 (useCallback으로 메모이제이션)
  const handleMarkerClick = useCallback((id) => {
    setSelectedPopupId(id);
    const marker = mapMarkers.find(mk => mk.id === id);
    if (marker) {
      setMapCenter({ lat: marker.lat, lng: marker.lng });
      setMapLevel(3);
    }
    onPopupClick?.(id);
  }, [mapMarkers, onPopupClick]);

  // 마커 with 색상 및 클릭 핸들러 (useMemo로 메모이제이션)
  const enrichedMarkers = useMemo(() => {
    return mapMarkers.map(m => ({
      ...m,
      color: m.phase === 'ongoing' ? '#ef4444' : m.phase === 'upcoming' ? '#f59e0b' : '#9ca3af',
      onClick: handleMarkerClick,
    }));
  }, [mapMarkers, handleMarkerClick]);

  const [mapCenter, setMapCenter] = useState(GWANGJU_CENTER);
  const [mapLevel, setMapLevel] = useState(5);

  const handleSelectRegion = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedPopupId(null);
    
    // 지역 선택 시 지도 중심 및 레벨 변경
    const center = REGION_CENTERS[regionId] || GWANGJU_CENTER;
    setMapCenter(center);
    setMapLevel(regionId === "ALL" ? 5 : 4);
  };

  const handleCardClick = (popup) => {
    setSelectedPopupId(popup.id);
    if (popup.latitude != null && popup.longitude != null) {
      setMapCenter({ lat: popup.latitude, lng: popup.longitude });
      setMapLevel(3); // 선택된 팝업으로 줌인
    }
    onPopupClick?.(popup.id);
  };

  const activeCounts = useMemo(() => {
    return filteredPopups.reduce(
      (acc, popup) => {
        acc[popup.phase] = (acc[popup.phase] || 0) + 1;
        return acc;
      },
      { ongoing: 0, upcoming: 0, ended: 0 }
    );
  }, [filteredPopups]);

  const displayedPopups = useMemo(() => {
    return showAll ? filteredPopups : filteredPopups.slice(0, visibleCount);
  }, [filteredPopups, showAll, visibleCount]);

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(1);

  useEffect(() => {
    setVisibleCount(4);
    setShowAll(false);
  }, [selectedRegion, searchTerm]);

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

    requestAnimationFrame(() => {
      requestAnimationFrame(update);
    });

    c.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      c.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [filteredPopups]);

  const scroll = (dir) => {
    const c = scrollContainerRef.current;
    if (!c) return;
    c.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto w-full px-4">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold leading-tight">주변 팝업</h1>
          <p className="text-sm text-gray-500 mt-1">내 주변 팝업을 확인하세요</p>
        </div>
        <section className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="팝업명 또는 판매자명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-200 pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-[#eb0000]"
            />
            <Navigation className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="w-full rounded-3xl border border-gray-100 overflow-hidden">
            <KakaoMapDirect
              center={mapCenter}
              markers={enrichedMarkers}
              height="400px"
              level={mapLevel}
              showControls={true}
              onMapReady={(map) => {
                mapInstanceRef.current = map;
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {REGION_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleSelectRegion(filter.id)}
                className={`px-4 py-1.5 rounded-full text-sm border ${
                  selectedRegion === filter.id
                    ? "bg-[#eb0000] text-white border-[#eb0000]"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <span>진행중 {activeCounts.ongoing ?? 0}</span>
            <span>예정 {activeCounts.upcoming ?? 0}</span>
            <span>종료 {activeCounts.ended ?? 0}</span>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">주변 팝업</h2>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedRegion("ALL");
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              초기화
            </button>
          </div>

          {popupError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {popupError}
            </div>
          )}

          {loadingPopups && (
            <div className="rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-500">
              추천 팝업을 불러오는 중입니다...
            </div>
          )}

          {!loadingPopups && !popupError && filteredPopups.length === 0 && (
            <div className="rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-500">
              선택한 조건의 팝업이 없습니다. 범위를 넓혀보세요.
            </div>
          )}

          {/* 모바일: 가로 스크롤 */}
          <div className="block sm:hidden">
            <div className="relative">
              {canScrollLeft && (
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
                  aria-label="왼쪽으로"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
                  aria-label="오른쪽으로"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
              >
                {filteredPopups.map((popup, index) => (
                  <div
                    key={popup.id}
                    data-card-index={index}
                    className="flex-shrink-0 w-[160px] snap-start"
                  >
                    <EventCard
                      image={popup.displayImage}
                      title={popup.title}
                      date={popup.dateLabel}
                      location={popup.locationName || popup.address || "위치 정보 없음"}
                      isFavorite={false}
                      onClick={() => handleCardClick(popup)}
                      isLoggedIn={isLoggedIn}
                      onLoginClick={onLoginClick}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-center px-1">
                <p className="text-xs text-[#4d4d4d] font-['Pretendard:Medium',sans-serif]">
                  {currentCardIndex} / {filteredPopups.length}
                </p>
              </div>
            </div>
          </div>
          
          {/* 데스크톱: 그리드 + 더보기/전체보기 */}
          <div className="hidden sm:block">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-4">
              {displayedPopups.map((popup) => (
                <div key={popup.id} className="w-[151px] md:w-[190px] lg:w-[244px] xl:w-[276px]">
                  <EventCard
                    image={popup.displayImage}
                    title={popup.title}
                    date={popup.dateLabel}
                    location={popup.locationName || popup.address || "위치 정보 없음"}
                    isFavorite={false}
                    onClick={() => handleCardClick(popup)}
                    isLoggedIn={isLoggedIn}
                    onLoginClick={onLoginClick}
                  />
                </div>
              ))}
            </div>

            {filteredPopups.length > 4 && (
              <div className="flex flex-col items-center gap-3 mt-6">
                <p className="text-sm md:text-base text-[#4d4d4d] font-['Pretendard:Medium',sans-serif]">
                  {displayedPopups.length} / {filteredPopups.length}
                </p>
                {showAll || visibleCount >= filteredPopups.length ? (
                  <button
                    onClick={() => {
                      setShowAll(false);
                      setVisibleCount(4);
                    }}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-[#eb0000] text-white rounded-full hover:bg-[#cc0000] transition-colors font-['Pretendard:Medium',sans-serif] text-sm md:text-base"
                  >
                    접기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                  </button>
                ) : visibleCount > 4 ? (
                  <div className="flex items-center gap-3">
                    {visibleCount < filteredPopups.length && (
                      <button
                        onClick={() =>
                          setVisibleCount((prev) =>
                            Math.min(prev + 4, filteredPopups.length)
                          )
                        }
                        className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-200 text-[#4d4d4d] rounded-full hover:bg-gray-300 transition-colors font-['Pretendard:Medium',sans-serif] text-sm md:text-base"
                      >
                        더보기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setVisibleCount(4)}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-[#eb0000] text-white rounded-full hover:bg-[#cc0000] transition-colors font-['Pretendard:Medium',sans-serif] text-sm md:text-base"
                    >
                      접기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setVisibleCount((prev) =>
                          Math.min(prev + 4, filteredPopups.length)
                        )
                      }
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-200 text-[#4d4d4d] rounded-full hover:bg-gray-300 transition-colors font-['Pretendard:Medium',sans-serif] text-sm md:text-base"
                    >
                      더보기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => setShowAll(true)}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-[#eb0000] text-white rounded-full hover:bg-[#cc0000] transition-colors font-['Pretendard:Medium',sans-serif] text-sm md:text-base"
                    >
                      전체보기 <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default NearbyExplorePage;
