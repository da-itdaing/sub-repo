import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ChevronRight, Map, X } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveItemId = (item = {}) =>
  item.market_id || item.metadata?.market_id || item.zone_id || item.name || 'unknown';

/**
 * 추천 결과 패널 - v14.1 콤팩트 디자인
 * - 지도 기본 숨김, 토글로 표시
 * - 가로 스크롤 카드 레이아웃
 * - 모바일 친화적 터치 영역
 */
const RecommendationPanel = ({ items = [], mode = 'consumer' }) => {
  const [highlightId, setHighlightId] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setHighlightId(resolveItemId(items[0]));
    }
    setShowMap(false);
  }, [items]);

  const markers = useMemo(
    () =>
      items
        .map((item) => {
          const lat = toNumber(item.lat ?? item.metadata?.lat ?? item.metadata?.latitude);
          const lng = toNumber(item.lon ?? item.lng ?? item.metadata?.lon ?? item.metadata?.lng ?? item.metadata?.longitude);
          if (lat == null || lng == null) return null;
          return {
            id: resolveItemId(item),
            lat,
            lng,
            label: item.name,
            content: item.name,
            onClick: () => setHighlightId(resolveItemId(item)),
          };
        })
        .filter(Boolean),
    [items],
  );

  if (!items.length) return null;

  const centerMarker = markers.find((m) => m.id === highlightId) || markers[0];
  const hasValidMarkers = markers.length > 0;

  const getDetailLink = (item) => {
    if (mode === 'consumer') {
      const popupId = item.market_id || item.metadata?.market_id;
      if (popupId) {
        const numericId = popupId.toString().replace(/^(popup-|M0*)/, '');
        if (numericId && /^\d+$/.test(numericId)) {
          return ROUTES.popupDetail(parseInt(numericId, 10));
        }
        if (/^\d+$/.test(popupId.toString())) {
          return ROUTES.popupDetail(parseInt(popupId, 10));
        }
        return ROUTES.popupDetail(popupId);
      }
    }
    return null;
  };

  return (
    <div className="bg-white border-t border-rose-100/50">
      {/* 헤더 - 더 콤팩트하게 */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-gray-700">
            📍 추천 {items.length}곳
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasValidMarkers && (
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all ${
                showMap 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Map className="h-3 w-3" />
              지도
            </button>
          )}
        </div>
      </div>

      {/* 지도 - 토글 시에만 표시 */}
      {showMap && hasValidMarkers && (
        <div className="relative mx-4 mb-2 rounded-xl overflow-hidden ring-1 ring-gray-100">
          <div className="h-[160px]">
            <KakaoMap
              height="100%"
              level={items.length === 1 ? 3 : 5}
              center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
              markers={markers}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      )}

      {/* 카드 리스트 - 가로 스크롤 */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {items.map((item, index) => {
            const id = resolveItemId(item);
            const isActive = id === highlightId;
            const detailLink = getDetailLink(item);
            const address = item.address || item.metadata?.address || item.metadata?.location;
            const hasCoords = markers.some((m) => m.id === id);

            return (
              <div
                key={id}
                className={`flex-shrink-0 w-[200px] p-3 rounded-xl cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-rose-50 ring-2 ring-rose-300' 
                    : 'bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-100'
                }`}
                onClick={() => {
                  setHighlightId(id);
                  if (showMap && hasCoords) {
                    // 지도가 열려있으면 해당 마커로 포커스
                  }
                }}
              >
                {/* 순위 배지 */}
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    index === 0 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  {detailLink && (
                    <Link
                      to={detailLink}
                      className="p-1 rounded-md bg-white ring-1 ring-gray-200 text-gray-400 hover:text-rose-500 hover:ring-rose-200 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                {/* 이름 */}
                <p className="text-[13px] font-semibold text-gray-800 truncate mb-1">
                  {item.name || '이름 미정'}
                </p>

                {/* 주소 */}
                {address && (
                  <p className="text-[10px] text-gray-500 truncate flex items-center gap-1 mb-1.5">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {address}
                  </p>
                )}

                {/* 메타 정보 */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {typeof item.rating === 'number' && (
                    <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                      {item.rating.toFixed(1)}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-[9px] text-gray-400 bg-white px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  )}
                  {!hasCoords && (
                    <span className="text-[8px] text-gray-400">
                      📍없음
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 팁 메시지 - 더 작게 */}
      <div className="px-4 pb-2">
        <p className="text-[10px] text-gray-400 text-center">
          💡 "야시장" 이나 "저녁에 열리는 곳" 도 있어요
        </p>
      </div>
    </div>
  );
};

export default RecommendationPanel;
