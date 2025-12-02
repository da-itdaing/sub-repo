import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, Map } from 'lucide-react';
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

      {/* 펼쳐진 내용 - 모바일 최적화 */}
      {isExpanded && (
        <div className="animate-expand max-h-[280px] overflow-y-auto">
          {/* 지도 - 모바일에서 컴팩트하게 */}
          {hasValidMarkers && (
            <div className="h-[120px] mx-3 mb-2 rounded-xl overflow-hidden ring-1 ring-gray-100">
              <KakaoMap
                height="100%"
                level={items.length === 1 ? 4 : 6}
                center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
                markers={markers}
              />
            </div>
          )}

          {/* 카드 리스트 - 컴팩트 */}
          <div className="px-3 pb-2 space-y-1">
            {items.map((item, index) => {
              const id = resolveItemId(item);
              const isActive = id === highlightId;
              const detailLink = getDetailLink(item);
              const address = item.address || item.metadata?.address || item.metadata?.location;

              return (
                <div
                  key={id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-rose-50 ring-1 ring-rose-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setHighlightId(id)}
                >
                  {/* 순위 */}
                  <span className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold ${
                    index === 0 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>

                  {/* 정보 - 한 줄로 압축 */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">
                      {item.name || '이름 미정'}
                    </p>
                    {address && (
                      <span className="text-[10px] text-gray-400 truncate hidden sm:inline">
                        · {address.split(' ').slice(1, 2).join(' ')}
                      </span>
                    )}
                  </div>

                  {/* 상세 버튼 */}
                  {detailLink && (
                    <Link
                      to={detailLink}
                      className="flex-shrink-0 p-1 rounded-md bg-white ring-1 ring-gray-200 text-gray-400 hover:text-rose-500 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronRight className="h-3 w-3" />
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
