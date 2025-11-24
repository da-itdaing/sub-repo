import { useState, useMemo, useCallback } from 'react';
import { MapPin, Search, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import KakaoMap from '@/components/map/KakaoMap';
import EventCard from '@/components/popup/EventCard';
import { usePopups } from '@/hooks/usePopups';
import { useMasterData } from '@/hooks/useMasterData';
import { isPopupActive } from '@/utils/popupUtils';

// 광주광역시 중심 좌표
const GWANGJU_CENTER = { lat: 35.14667451156048, lng: 126.92227158987355 };

const NearbyExplorePage = () => {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [expanded, setExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState(GWANGJU_CENTER);
  const MAX_ITEMS = 20;

  // 팝업 데이터 조회
  const { data: popups = [], isLoading } = usePopups();
  const { regions: masterRegions } = useMasterData();

  const gwangjuRegions = useMemo(() => {
    const DISTRICTS = ['동구', '서구', '남구', '북구', '광산구'];
    const matched = masterRegions
      ?.filter((region) => DISTRICTS.includes(region.name))
      .map((region) => region.name);
    return matched?.length === DISTRICTS.length ? matched : DISTRICTS;
  }, [masterRegions]);

  const regionFilters = useMemo(() => ['ALL', ...gwangjuRegions], [gwangjuRegions]);

  const getPopupRegion = useCallback((popup) => {
    const address = `${popup.address || ''} ${popup.locationName || ''}`;
    return gwangjuRegions.find((region) => address.includes(region)) || null;
  }, [gwangjuRegions]);

  const handleSelectPopup = (popup) => {
    setSelectedPopupId(popup.id);
    if (popup.latitude && popup.longitude) {
      setMapCenter({ lat: popup.latitude, lng: popup.longitude });
    }
  };

  // 지도 마커 데이터
  const mapMarkers = useMemo(() => {
    return popups
      .filter((popup) => popup.latitude && popup.longitude)
      .map((popup) => ({
        id: popup.id,
        lat: popup.latitude,
        lng: popup.longitude,
        label: popup.title,
        content: selectedPopupId === popup.id ? popup.title : null,
        onClick: (marker) => {
          setSelectedPopupId(marker.id);
          if (marker.lat && marker.lng) {
            setMapCenter({ lat: marker.lat, lng: marker.lng });
          }
          const target = document.getElementById(`popup-card-${marker.id}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        },
      }));
  }, [popups, selectedPopupId]);

  // 필터링된 팝업 목록
  const filteredPopups = useMemo(() => {
    return popups
      .filter((popup) => {
        if (!isPopupActive(popup)) {
          return false;
        }
        // 지역 필터
        if (selectedRegion !== 'ALL') {
          const popupRegion = getPopupRegion(popup);
          if (popupRegion !== selectedRegion) {
            return false;
          }
        }

        // 검색어 필터
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase();
          const titleMatch = popup.title?.toLowerCase().includes(term);
          const descMatch = popup.description?.toLowerCase().includes(term);
          return titleMatch || descMatch;
        }

        return true;
      });
  }, [getPopupRegion, popups, searchTerm, selectedRegion]);

  // 표시할 팝업 목록
  const displayedPopups = useMemo(() => {
    if (expanded) return filteredPopups.slice(0, MAX_ITEMS);
    return filteredPopups.slice(0, visibleCount);
  }, [expanded, filteredPopups, visibleCount]);

  const hasMore = filteredPopups.length > visibleCount && !expanded && visibleCount < MAX_ITEMS;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, Math.min(filteredPopups.length, MAX_ITEMS)));
  };

  const handleToggleExpand = () => {
    if (expanded) {
      setVisibleCount(4);
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 w-full max-w-[540px] md:max-w-[1200px] mx-auto bg-white pb-8">
        {/* 지도 영역 */}
        <div className="w-full">
          <div className="bg-white p-5 md:p-8 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              주변 팝업 지도
            </h2>
            
            <KakaoMap
              center={mapCenter}
              markers={mapMarkers}
              height={typeof window !== 'undefined' && window.innerWidth >= 768 ? '500px' : '300px'}
              level={5}
            />
          </div>
          </div>

        {/* 검색 및 필터 영역 */}
        <div className="px-5 md:px-8 mt-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="팝업 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* 지역 필터 */}
              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {regionFilters.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      selectedRegion === region
                        ? 'bg-primary text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {region === 'ALL' ? '전체' : region}
                  </button>
                ))}
              </div>
              </div>
            </div>

        {/* 팝업 카드 그리드 */}
        <div className="px-5 md:px-8 mt-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600 text-sm">로딩 중...</p>
                </div>
              ) : filteredPopups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
              <p className="text-sm">표시할 팝업이 없습니다.</p>
                </div>
              ) : (
            <>
              {/* 데스크톱: 4열 그리드 */}
              <div className="hidden md:grid grid-cols-4 gap-4">
                {displayedPopups.map((popup) => (
                  <div
                    key={popup.id}
                    id={`popup-card-${popup.id}`}
                    className={`${
                      selectedPopupId === popup.id ? 'ring-2 ring-primary rounded-2xl' : ''
                    }`}
                    onClick={() => handleSelectPopup(popup)}
                  >
                    <EventCard popup={popup} />
                  </div>
                ))}
              </div>

              {/* 모바일: 가로 스크롤 */}
              <div className="md:hidden flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {filteredPopups.map((popup) => (
                  <div
                    key={popup.id}
                    className={`w-[42%] shrink-0 snap-start ${
                      selectedPopupId === popup.id ? 'ring-2 ring-primary rounded-2xl' : ''
                    }`}
                    onClick={() => handleSelectPopup(popup)}
                  >
                    <EventCard popup={popup} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 더보기/전체보기 버튼 (데스크톱만) */}
          {filteredPopups.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col gap-2 md:flex-row md:items-center md:justify-center">
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="w-full md:w-auto px-4 py-1.5 rounded-full border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    더보기 <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                {filteredPopups.length > 4 && (
                  <button
                    type="button"
                    onClick={handleToggleExpand}
                    className={`w-full md:w-auto px-5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm transition-colors ${
                      expanded ? 'bg-gray-800 hover:bg-gray-700' : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {expanded ? '접기' : '전체보기'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default NearbyExplorePage;

