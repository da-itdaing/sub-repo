import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, Map, X, Store, Users, DollarSign, Percent } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveItemId = (item = {}) =>
  item.market_id || item.metadata?.market_id || item.zone_id || item.name || 'unknown';

/**
 * 추천 결과 패널 - v16
 * - 소비자 모드: 팝업 상세 링크
 * - 판매자 모드: 상권 정보 + 셀 가용성 + 팝업 등록 링크
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

  // 소비자: 팝업 상세 링크
  const getConsumerDetailLink = (item) => {
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
    return null;
  };

  // 판매자: 팝업 등록 링크
  const getSellerRegisterLink = (item) => {
    const zoneId = item.zone_id;
    if (zoneId) {
      return item.popup_register_url || `/seller/popups/create?zoneId=${zoneId}`;
    }
    return null;
  };

  // 테마 색상 (모드별)
  const themeColor = mode === 'seller' ? 'blue' : 'rose';
  const bgActive = mode === 'seller' ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-rose-50 ring-1 ring-rose-200';
  const badgePrimary = mode === 'seller' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white';
  const btnColor = mode === 'seller' 
    ? 'text-blue-500 border-blue-200 hover:bg-blue-50' 
    : 'text-rose-500 border-rose-200 hover:bg-rose-50';

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
            📍 {mode === 'seller' ? '추천 존' : '추천'} {items.length}곳
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
                const consumerLink = mode === 'consumer' ? getConsumerDetailLink(item) : null;
                const sellerLink = mode === 'seller' ? getSellerRegisterLink(item) : null;

                return (
                  <div
                    key={id}
                    className={`flex-shrink-0 ${mode === 'seller' ? 'w-[160px]' : 'w-[140px]'} p-2 rounded-lg cursor-pointer transition-all ${
                      isActive ? bgActive : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setHighlightId(id)}
                  >
                    {/* 순위 + 이름 */}
                    <div className="flex items-start gap-1.5 mb-1">
                      <span className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold ${
                        index === 0 ? badgePrimary : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">
                        {item.name || '이름 미정'}
                      </p>
                    </div>

                    {/* 판매자 모드: 상권 정보 표시 */}
                    {mode === 'seller' && (
                      <div className="space-y-0.5 mb-1.5">
                        {item.district && (
                          <p className="text-[9px] text-gray-500">{item.district}</p>
                        )}
                        {item.rent_per_day && (
                          <p className="text-[9px] text-gray-500 flex items-center gap-0.5">
                            <DollarSign className="h-2.5 w-2.5" />
                            {item.rent_per_day.toLocaleString()}원/일
                          </p>
                        )}
                        {item.traffic_score && (
                          <p className="text-[9px] text-gray-500 flex items-center gap-0.5">
                            <Users className="h-2.5 w-2.5" />
                            유동인구 {item.traffic_score}점
                          </p>
                        )}
                        {item.commercial_grade && (
                          <p className="text-[9px] text-gray-500 flex items-center gap-0.5">
                            <Store className="h-2.5 w-2.5" />
                            상권 {item.commercial_grade}
                          </p>
                        )}
                        {item.available_cells !== undefined && item.total_cells !== undefined && (
                          <p className={`text-[9px] flex items-center gap-0.5 ${
                            item.available_cells > 0 ? 'text-green-600 font-medium' : 'text-gray-400'
                          }`}>
                            <Percent className="h-2.5 w-2.5" />
                            빈 셀 {item.available_cells}/{item.total_cells}개
                          </p>
                        )}
                      </div>
                    )}

                    {/* 버튼 */}
                    {mode === 'consumer' && consumerLink && (
                      <Link
                        to={consumerLink}
                        className={`mt-1.5 flex items-center justify-center gap-0.5 w-full py-1 text-[10px] bg-white rounded border ${btnColor} transition-all`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        상세보기
                        <ChevronRight className="h-2.5 w-2.5" />
                      </Link>
                    )}
                    {mode === 'seller' && sellerLink && item.available_cells > 0 && (
                      <Link
                        to={sellerLink}
                        className={`flex items-center justify-center gap-0.5 w-full py-1 text-[10px] bg-white rounded border ${btnColor} transition-all`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        셀 선택
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
                📍 {mode === 'seller' ? '추천 존 위치' : '추천 위치'}
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
                const consumerLink = mode === 'consumer' ? getConsumerDetailLink(item) : null;
                const sellerLink = mode === 'seller' ? getSellerRegisterLink(item) : null;
                const address = item.address || item.metadata?.address || item.metadata?.location;

                return (
                  <div
                    key={id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      isActive ? bgActive : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setHighlightId(id)}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                      index === 0 ? badgePrimary : 'bg-gray-200 text-gray-500'
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
                      {mode === 'seller' && item.available_cells !== undefined && (
                        <p className={`text-[10px] ${item.available_cells > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          빈 셀 {item.available_cells}/{item.total_cells}개
                        </p>
                      )}
                    </div>
                    {mode === 'consumer' && consumerLink && (
                      <Link
                        to={consumerLink}
                        className={`flex-shrink-0 px-2 py-1 text-[10px] bg-white rounded border ${btnColor}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        상세
                      </Link>
                    )}
                    {mode === 'seller' && sellerLink && item.available_cells > 0 && (
                      <Link
                        to={sellerLink}
                        className={`flex-shrink-0 px-2 py-1 text-[10px] bg-white rounded border ${btnColor}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        셀 선택
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
