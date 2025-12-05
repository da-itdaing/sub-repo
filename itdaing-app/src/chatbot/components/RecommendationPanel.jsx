import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, Map, X, Store, Users, DollarSign, Percent, Search } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';
import apiClient from '@/api/client';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveItemId = (item = {}) =>
  item.market_id || item.metadata?.market_id || item.zone_id || item.name || 'unknown';

/**
 * 아이템의 좌표 정보 추출
 */
const extractCoordinates = (item) => {
  const lat = toNumber(item.lat ?? item.metadata?.lat ?? item.metadata?.latitude);
  const lng = toNumber(item.lon ?? item.lng ?? item.metadata?.lon ?? item.metadata?.lng ?? item.metadata?.longitude);
  return { lat, lng, hasCoords: lat != null && lng != null };
};

/**
 * 문자열 유사도 계산 (간단한 포함 검사 + 정규화)
 */
const normalizeString = (str) => 
  str?.toLowerCase().replace(/[\s\-_]/g, '').replace(/플리마켓|마켓|팝업|스토어/g, '') || '';

const isSimilar = (a, b) => {
  const normA = normalizeString(a);
  const normB = normalizeString(b);
  return normA.includes(normB) || normB.includes(normA) || normA === normB;
};

/**
 * 추천 결과 패널 - v18
 * - 소비자 모드: 팝업 상세 링크 (DB 자동 매칭)
 * - 판매자 모드: 상권 정보 + 셀 가용성 + 팝업 등록 링크
 * - 좌표가 있는 항목만 표시하여 지도와 일관성 유지
 */
const RecommendationPanel = ({ items = [], mode = 'consumer' }) => {
  const navigate = useNavigate();
  const [highlightId, setHighlightId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // 실제 DB popup과 매칭된 ID 맵 { 추천이름: 실제popupId }
  const [popupIdMap, setPopupIdMap] = useState({});
  const [isLoadingPopups, setIsLoadingPopups] = useState(false);

  // 좌표가 있는 항목만 필터링 (지도와 목록 일관성 유지)
  const validItems = useMemo(
    () => items.filter((item) => extractCoordinates(item).hasCoords),
    [items]
  );

  // 추천 결과가 변경되면 실제 DB에서 popup 찾기 (소비자 모드만)
  useEffect(() => {
    if (mode !== 'consumer' || validItems.length === 0) return;
    
    const fetchAndMatchPopups = async () => {
      setIsLoadingPopups(true);
      try {
        // 전체 popup 목록 가져오기 (캐싱 고려 필요)
        const response = await apiClient.get('/popups', { params: { page: 0, size: 200 } });
        const popups = response?.data || response || [];
        
        // 추천 결과와 실제 popup 매칭
        const idMap = {};
        validItems.forEach((item) => {
          const recName = item.name || item.metadata?.name;
          if (!recName) return;
          
          // 이름으로 매칭 시도
          const matched = popups.find((popup) => 
            isSimilar(popup.title, recName) || 
            isSimilar(popup.locationName, recName)
          );
          
          if (matched) {
            idMap[recName] = matched.id;
          }
        });
        
        setPopupIdMap(idMap);
      } catch (error) {
        console.warn('[RecommendationPanel] Failed to fetch popups:', error);
      } finally {
        setIsLoadingPopups(false);
      }
    };
    
    fetchAndMatchPopups();
  }, [validItems, mode]);

  // 새 추천이 오면 펼친 상태로 시작
  useEffect(() => {
    if (validItems.length > 0) {
      setHighlightId(resolveItemId(validItems[0]));
      setIsExpanded(true);
      setShowMap(false);
    }
  }, [validItems]);

  const markers = useMemo(
    () =>
      validItems.map((item) => {
        const { lat, lng } = extractCoordinates(item);
        return {
          id: resolveItemId(item),
          lat,
          lng,
          label: item.name,
          content: item.name,
          onClick: () => setHighlightId(resolveItemId(item)),
        };
      }),
    [validItems],
  );

  // 좌표가 있는 항목이 없으면 패널 숨김
  if (!validItems.length) return null;

  const centerMarker = markers.find((m) => m.id === highlightId) || markers[0];
  const hasValidMarkers = markers.length > 0;

  // 소비자: 팝업 상세 링크 (RAG 결과의 market_id 우선 사용)
  const getConsumerDetailLink = useCallback((item) => {
    // 1. RAG 결과의 market_id가 숫자면 바로 사용 (최우선)
    const marketId = item.market_id || item.metadata?.market_id;
    if (marketId) {
      const numericId = marketId.toString().replace(/^(popup-|M0*)/, '');
      if (numericId && /^\d+$/.test(numericId)) {
        return ROUTES.popupDetail(parseInt(numericId, 10));
      }
      if (/^\d+$/.test(marketId.toString())) {
        return ROUTES.popupDetail(parseInt(marketId, 10));
      }
    }
    
    // 2. DB 매칭된 ID가 있으면 사용 (fallback)
    const recName = item.name || item.metadata?.name;
    if (recName && popupIdMap[recName]) {
      return ROUTES.popupDetail(popupIdMap[recName]);
    }
    
    // 3. 매칭 실패 시 검색 페이지로
    if (recName) {
      return `/search?q=${encodeURIComponent(recName)}`;
    }
    
    return null;
  }, [popupIdMap]);

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
            📍 {mode === 'seller' ? '추천 존' : '추천'} {validItems.length}곳
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

        {/* 카드 리스트 - 세로 리스트 */}
        {isExpanded && (
          <div className="px-3 pb-2 space-y-1.5 max-h-[180px] overflow-y-auto">
            {validItems.map((item, index) => {
              const id = resolveItemId(item);
              const isActive = id === highlightId;
              const consumerLink = mode === 'consumer' ? getConsumerDetailLink(item) : null;
              const sellerLink = mode === 'seller' ? getSellerRegisterLink(item) : null;

              return (
                <div
                  key={id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive ? bgActive : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setHighlightId(id)}
                >
                  {/* 순위 배지 */}
                  <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold ${
                    index === 0 ? badgePrimary : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">
                      {item.name || '이름 미정'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.district && (
                        <span className="text-[10px] text-gray-500">{item.district}</span>
                      )}
                      {mode === 'seller' && item.available_cells !== undefined && (
                        <span className={`text-[10px] font-medium ${
                          item.available_cells > 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          빈 셀 {item.available_cells}개
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 버튼 */}
                  {mode === 'consumer' && consumerLink && (
                    <Link
                      to={consumerLink}
                      className={`flex-shrink-0 flex items-center gap-0.5 px-2.5 py-1.5 text-[10px] font-medium bg-white rounded-lg border ${btnColor} transition-all`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {consumerLink.startsWith('/search') ? (
                        <>
                          검색
                          <Search className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          상세
                          <ChevronRight className="h-3 w-3" />
                        </>
                      )}
                    </Link>
                  )}
                  {mode === 'seller' && sellerLink && item.available_cells > 0 && (
                    <Link
                      to={sellerLink}
                      className={`flex-shrink-0 flex items-center gap-0.5 px-2.5 py-1.5 text-[10px] font-medium bg-white rounded-lg border ${btnColor} transition-all`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      셀 선택
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
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
                level={validItems.length === 1 ? 4 : 6}
                center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
                markers={markers}
                selectedMarkerId={highlightId}
              />
            </div>

            {/* 마커 리스트 */}
            <div className="max-h-[150px] overflow-y-auto p-3 space-y-1.5">
              {validItems.map((item, index) => {
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
                        {consumerLink.startsWith('/search') ? '검색' : '상세'}
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
