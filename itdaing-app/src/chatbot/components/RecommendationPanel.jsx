import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, Map, List, X } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveItemId = (item = {}) =>
  item.market_id || item.metadata?.market_id || item.zone_id || item.name || 'unknown';

/**
 * 추천 결과 패널 - v15
 * - 기본: 접힌 상태 (헤더만)
 * - 펼치기: 카드 리스트 (수평 스크롤)
 * - 지도 버튼: 지도 모달 (선택적)
 * - 입력창이 항상 보이도록 컴팩트하게 설계
 */
const RecommendationPanel = ({ items = [], mode = 'consumer' }) => {
  const [highlightId, setHighlightId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // 새 추천이 오면 접힌 상태로 리셋
  useEffect(() => {
    if (items.length > 0) {
      setHighlightId(resolveItemId(items[0]));
      setIsExpanded(false);
      setShowMap(false);
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
    <>
      <div className="bg-white border-t border-gray-100">
        {/* 헤더 - 항상 표시 */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* 왼쪽: 토글 버튼 */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700"
          >
            📍 추천 {items.length}곳
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            )}
          </button>

          {/* 오른쪽: 지도 버튼 */}
          {hasValidMarkers && (
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Map className="h-3 w-3" />
              지도
            </button>
          )}
        </div>

        {/* 카드 리스트 - 수평 스크롤 */}
        {isExpanded && (
          <div className="pb-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-3" style={{ minWidth: 'min-content' }}>
              {items.map((item, index) => {
                const id = resolveItemId(item);
                const isActive = id === highlightId;
                const detailLink = getDetailLink(item);

                return (
                  <div
                    key={id}
                    className={`flex-shrink-0 w-[140px] p-2 rounded-lg cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-rose-50 ring-1 ring-rose-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setHighlightId(id)}
                  >
                    {/* 순위 + 이름 */}
                    <div className="flex items-start gap-1.5">
                      <span className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold ${
                        index === 0 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">
                        {item.name || '이름 미정'}
                      </p>
                    </div>

                    {/* 상세 버튼 */}
                    {detailLink && (
                      <Link
                        to={detailLink}
                        className="mt-1.5 flex items-center justify-center gap-0.5 w-full py-1 text-[10px] text-rose-500 bg-white rounded border border-rose-200 hover:bg-rose-50 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        상세보기
                        <ChevronRight className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 지도 모달 (오버레이) */}
      {showMap && hasValidMarkers && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-[480px] bg-white rounded-t-2xl overflow-hidden animate-slideUp">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-semibold text-gray-800">
                📍 추천 위치
              </span>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 지도 */}
            <div className="h-[250px]">
              <KakaoMap
                height="100%"
                level={items.length === 1 ? 4 : 6}
                center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
                markers={markers}
              />
            </div>

            {/* 마커 리스트 */}
            <div className="max-h-[150px] overflow-y-auto p-3 space-y-1.5">
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
                    <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                      index === 0 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-800 truncate">
                        {item.name || '이름 미정'}
                      </p>
                      {address && (
                        <p className="text-[10px] text-gray-400 truncate">
                          {address}
                        </p>
                      )}
                    </div>
                    {detailLink && (
                      <Link
                        to={detailLink}
                        className="flex-shrink-0 px-2 py-1 text-[10px] text-rose-500 bg-white rounded border border-rose-200 hover:bg-rose-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        상세
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default RecommendationPanel;

