import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ChevronRight, ChevronDown, ChevronUp, Map } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveItemId = (item = {}) =>
  item.market_id || item.metadata?.market_id || item.zone_id || item.name || 'unknown';

/**
 * 추천 결과 패널 - v14.5
 * - 접기/펼치기로 지도+카드 함께 토글
 * - 기본은 접힌 상태 (헤더만 표시)
 * - 펼치면 지도 + 카드 리스트 표시
 */
const RecommendationPanel = ({ items = [], mode = 'consumer' }) => {
  const [highlightId, setHighlightId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 새 추천이 오면 접힌 상태로 리셋
  useEffect(() => {
    if (items.length > 0) {
      setHighlightId(resolveItemId(items[0]));
      setIsExpanded(false);
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
    <div className="bg-white border-t border-gray-100">
      {/* 헤더 - 항상 표시 (클릭하면 토글) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-700">
            📍 추천 {items.length}곳
          </span>
          {hasValidMarkers && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Map className="h-3 w-3" />
              지도
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">
            {isExpanded ? '접기' : '펼치기'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* 펼쳐진 내용 */}
      {isExpanded && (
        <div className="animate-expand">
          {/* 지도 */}
          {hasValidMarkers && (
            <div className="h-[180px] mx-3 mb-2 rounded-xl overflow-hidden ring-1 ring-gray-100">
              <KakaoMap
                height="100%"
                level={items.length === 1 ? 3 : 5}
                center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
                markers={markers}
              />
            </div>
          )}

          {/* 카드 리스트 */}
          <div className="px-3 pb-3 space-y-1.5">
            {items.map((item, index) => {
              const id = resolveItemId(item);
              const isActive = id === highlightId;
              const detailLink = getDetailLink(item);
              const address = item.address || item.metadata?.address || item.metadata?.location;

              return (
                <div
                  key={id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-rose-50 ring-1 ring-rose-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setHighlightId(id)}
                >
                  {/* 순위 */}
                  <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                    index === 0 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">
                      {item.name || '이름 미정'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {address && (
                        <span className="text-[10px] text-gray-400 truncate flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {address.split(' ').slice(0, 2).join(' ')}
                        </span>
                      )}
                      {typeof item.rating === 'number' && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-[9px] text-gray-400 bg-white px-1 py-0.5 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 상세 버튼 */}
                  {detailLink && (
                    <Link
                      to={detailLink}
                      className="flex-shrink-0 p-1.5 rounded-lg bg-white ring-1 ring-gray-200 text-gray-400 hover:text-rose-500 hover:ring-rose-200 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes expand {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        .animate-expand {
          animation: expand 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecommendationPanel;
