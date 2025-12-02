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
 * 추천 결과 패널 - v14.2
 * - 세로 리스트 (사용성 우선)
 * - 지도는 별도 모달로 표시
 * - 추천 변경 시 지도 자동 닫힘
 */
const RecommendationPanel = ({ items = [], mode = 'consumer' }) => {
  const [highlightId, setHighlightId] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setHighlightId(resolveItemId(items[0]));
    }
    setShowMapModal(false);
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
    <>
      {/* 패널 */}
      <div className="bg-white border-t border-gray-100">
        {/* 헤더 */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50">
          <span className="text-[12px] font-medium text-gray-600">
            📍 추천 장소 <span className="text-rose-500">{items.length}</span>
          </span>
          {hasValidMarkers && (
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            >
              <Map className="h-3 w-3" />
              지도 보기
            </button>
          )}
        </div>

        {/* 카드 리스트 - 세로, 콤팩트 */}
        <div className="px-3 py-2 space-y-1.5 max-h-[200px] overflow-y-auto">
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

      {/* 지도 모달 */}
      {showMapModal && hasValidMarkers && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-[480px] bg-white rounded-t-2xl overflow-hidden animate-slide-up">
            {/* 모달 헤더 */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <span className="text-[14px] font-semibold text-gray-800">
                📍 추천 장소 위치
              </span>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* 지도 */}
            <div className="h-[300px]">
              <KakaoMap
                height="100%"
                level={items.length === 1 ? 3 : 5}
                center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
                markers={markers}
              />
            </div>

            {/* 장소 목록 (간략) */}
            <div className="px-4 py-3 border-t border-gray-100 max-h-[150px] overflow-y-auto">
              {items.map((item, index) => {
                const id = resolveItemId(item);
                const isActive = id === highlightId;
                const hasCoords = markers.some((m) => m.id === id);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setHighlightId(id)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${
                      isActive ? 'bg-rose-50 text-rose-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[12px] font-medium">
                      {index + 1}. {item.name}
                    </span>
                    {!hasCoords && (
                      <span className="ml-2 text-[10px] text-gray-400">(위치정보 없음)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default RecommendationPanel;
