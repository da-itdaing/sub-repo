import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ChevronRight, Map, Navigation } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveItemId = (item = {}) =>
  item.market_id || item.metadata?.market_id || item.zone_id || item.name || 'unknown';

/**
 * 추천 결과 패널 - 모던 디자인
 */
const RecommendationPanel = ({ items = [], mode = 'consumer' }) => {
  const [highlightId, setHighlightId] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setHighlightId(resolveItemId(items[0]));
    }
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
  const shouldShowMapByDefault = items.length >= 3 && hasValidMarkers;

  const getDetailLink = (item) => {
    if (mode === 'consumer') {
      const popupId = item.market_id || item.metadata?.market_id;
      if (popupId) {
        const numericId = popupId.toString().replace(/^M0*/, '');
        if (numericId && /^\d+$/.test(numericId)) {
          return ROUTES.popupDetail(parseInt(numericId, 10));
        }
        return ROUTES.popupDetail(popupId);
      }
    }
    return null;
  };

  const isMapVisible = shouldShowMapByDefault || showMap;

  return (
    <div className="bg-white border-t border-rose-100/50">
      {/* 헤더 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-rose-500" />
          <span className="text-[13px] font-semibold text-gray-800">
            추천 장소
          </span>
          <span className="text-[11px] font-medium text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!shouldShowMapByDefault && hasValidMarkers && (
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                showMap ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              지도
            </button>
          )}
          <Link
            to={ROUTES.home}
            className="text-[11px] text-gray-400 hover:text-rose-500 transition-colors"
          >
            전체 보기
          </Link>
        </div>
      </div>

      {/* 지도 */}
      {isMapVisible && hasValidMarkers && (
        <div className="h-[140px] mx-4 mb-3 rounded-xl overflow-hidden ring-1 ring-gray-100">
          <KakaoMap
            height="100%"
            level={items.length === 1 ? 3 : 5}
            center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
            markers={markers}
          />
        </div>
      )}

      {/* 카드 리스트 */}
      <div className={`px-4 pb-3 space-y-2 ${items.length > 3 ? 'max-h-[180px] overflow-y-auto' : ''}`}>
        {items.map((item) => {
          const id = resolveItemId(item);
          const isActive = id === highlightId;
          const detailLink = getDetailLink(item);
          const address = item.address || item.metadata?.address || item.metadata?.location;
          const hasCoords = markers.some((m) => m.id === id);

          return (
            <div
              key={id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                isActive 
                  ? 'bg-rose-50 ring-1 ring-rose-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setHighlightId(id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">
                    {item.name || '이름 미정'}
                  </p>
                  {!hasCoords && (
                    <span className="text-[9px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                      위치정보 없음
                    </span>
                  )}
                </div>
                {address && (
                  <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                    {address}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  {typeof item.rating === 'number' && (
                    <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {item.rating.toFixed(1)}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  )}
                  {item.distance_km && (
                    <span className="text-[10px] text-gray-400">
                      {Number(item.distance_km).toFixed(1)}km
                    </span>
                  )}
                </div>
              </div>
              {detailLink && (
                <Link
                  to={detailLink}
                  className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-white ring-1 ring-gray-200 text-gray-400 hover:text-rose-500 hover:ring-rose-200 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* 안내 메시지 */}
      {items.length < 3 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-gray-400 text-center">
            더 구체적인 조건을 말씀해주시면 더 많은 추천을 받을 수 있어요
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationPanel;
