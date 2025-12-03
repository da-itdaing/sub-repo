import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, Map, X, Building, Users, TrendingUp, Calendar } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveZoneId = (item = {}) =>
  item.zone_id || item.metadata?.zone_id || item.name || 'unknown';

const formatNumber = (num) => {
  if (num == null) return '-';
  return num.toLocaleString();
};

const getGradeColor = (grade) => {
  switch (grade) {
    case 'S': return 'bg-rose-500 text-white';
    case 'A': return 'bg-orange-500 text-white';
    case 'B+': return 'bg-yellow-500 text-white';
    case 'B': return 'bg-green-500 text-white';
    case 'C': return 'bg-gray-500 text-white';
    default: return 'bg-gray-200 text-gray-600';
  }
};

/**
 * 판매자용 추천 결과 패널
 * - 존 정보 (임대료, 유동인구, 상권 등급, 빈 셀 수) 표시
 * - "이 존 선택하기" 버튼 → 팝업 등록 페이지로 이동
 * - 폴리곤 지도 표시
 */
const SellerRecommendationPanel = ({ items = [] }) => {
  const navigate = useNavigate();
  const [highlightId, setHighlightId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // 새 추천이 오면 펼친 상태로 시작
  useEffect(() => {
    if (items.length > 0) {
      setHighlightId(resolveZoneId(items[0]));
      setIsExpanded(true);
    }
  }, [items]);

  const markers = useMemo(
    () =>
      items
        .map((item, index) => {
          const lat = toNumber(item.lat ?? item.metadata?.lat);
          const lng = toNumber(item.lng ?? item.lon ?? item.metadata?.lng ?? item.metadata?.lon);
          if (lat == null || lng == null) return null;
          return {
            id: resolveZoneId(item),
            lat,
            lng,
            label: `${index + 1}`,
            content: item.name,
            onClick: () => setHighlightId(resolveZoneId(item)),
          };
        })
        .filter(Boolean),
    [items],
  );

  if (!items.length) return null;

  const centerMarker = markers.find((m) => m.id === highlightId) || markers[0];
  const hasValidMarkers = markers.length > 0;

  const handleSelectZone = (item) => {
    const zoneId = item.zone_id || item.metadata?.zone_id;
    if (zoneId) {
      // 팝업 등록 페이지로 이동 (zoneId 쿼리 파라미터 포함)
      navigate(`/seller/popups/create?zoneId=${zoneId}`);
    }
  };

  return (
    <>
      <div className="bg-white border-t border-indigo-100">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-700"
          >
            <Building className="h-4 w-4" />
            추천 존 {items.length}곳
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-indigo-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-indigo-400" />
            )}
          </button>

          {hasValidMarkers && (
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-indigo-600 bg-white rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <Map className="h-3.5 w-3.5" />
              지도 보기
            </button>
          )}
        </div>

        {/* 존 카드 리스트 */}
        {isExpanded && (
          <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
            {items.map((item, index) => {
              const id = resolveZoneId(item);
              const isActive = id === highlightId;
              const availableCells = item.available_cells ?? item.metadata?.available_cells;
              const totalCells = item.total_cells ?? item.metadata?.total_cells;
              const commercialGrade = item.commercial_grade ?? item.metadata?.commercial_grade;
              const trafficScore = item.traffic_score ?? item.metadata?.traffic_score;
              const rentPerDay = item.rent_per_day ?? item.metadata?.rent_per_day;
              const weekdayTraffic = item.weekday_traffic ?? item.metadata?.weekday_traffic;
              const weekendTraffic = item.weekend_traffic ?? item.metadata?.weekend_traffic;
              const bestProducts = item.best_products ?? item.metadata?.best_products;
              const district = item.district ?? item.metadata?.district;
              const address = item.address ?? item.metadata?.address;

              return (
                <div
                  key={id}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-indigo-50 ring-2 ring-indigo-300 shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                  }`}
                  onClick={() => setHighlightId(id)}
                >
                  {/* 순위 + 이름 + 등급 */}
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 
                        ? 'bg-indigo-600 text-white' 
                        : index === 1
                          ? 'bg-indigo-400 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {item.name || '이름 미정'}
                      </p>
                      {district && (
                        <p className="text-xs text-gray-500">{district}</p>
                      )}
                    </div>
                    {commercialGrade && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getGradeColor(commercialGrade)}`}>
                        {commercialGrade}등급
                      </span>
                    )}
                  </div>

                  {/* 상세 정보 그리드 */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    {rentPerDay != null && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-indigo-500">💰</span>
                        <span className="font-medium">{formatNumber(rentPerDay)}원/일</span>
                      </div>
                    )}
                    {trafficScore != null && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="font-medium">유동인구 {trafficScore}점</span>
                      </div>
                    )}
                    {weekdayTraffic != null && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="h-3.5 w-3.5 text-green-500" />
                        <span>평일 {formatNumber(weekdayTraffic)}명</span>
                      </div>
                    )}
                    {weekendTraffic != null && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                        <span>주말 {formatNumber(weekendTraffic)}명</span>
                      </div>
                    )}
                  </div>

                  {/* 추천 상품 */}
                  {bestProducts && bestProducts.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 mb-1">추천 상품</p>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(bestProducts) ? bestProducts : [bestProducts]).slice(0, 3).map((product, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] bg-white rounded-full border border-gray-200 text-gray-600">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 빈 셀 정보 + 선택 버튼 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    {totalCells != null && (
                      <div className="text-xs">
                        <span className="text-gray-500">빈 셀: </span>
                        <span className={`font-bold ${availableCells > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {availableCells ?? 0}/{totalCells}개
                        </span>
                        {availableCells > 0 && (
                          <span className="ml-1 text-green-500">예약 가능</span>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectZone(item);
                      }}
                      disabled={availableCells === 0}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        availableCells > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {availableCells > 0 ? '이 존 선택하기' : '예약 불가'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 지도 모달 */}
      {showMap && hasValidMarkers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Map className="h-4 w-4" />
                추천 존 위치
              </span>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 지도 */}
            <div className="h-[300px]">
              <KakaoMap
                height="100%"
                level={items.length === 1 ? 4 : 7}
                center={centerMarker ? { lat: centerMarker.lat, lng: centerMarker.lng } : undefined}
                markers={markers}
              />
            </div>

            {/* 존 리스트 */}
            <div className="max-h-[200px] overflow-y-auto p-3 space-y-2 bg-gray-50">
              {items.map((item, index) => {
                const id = resolveZoneId(item);
                const isActive = id === highlightId;
                const district = item.district ?? item.metadata?.district;
                const commercialGrade = item.commercial_grade ?? item.metadata?.commercial_grade;
                const availableCells = item.available_cells ?? item.metadata?.available_cells;

                return (
                  <div
                    key={id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-indigo-100 ring-1 ring-indigo-300' 
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    onClick={() => setHighlightId(id)}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {item.name || '이름 미정'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {district} {commercialGrade && `· ${commercialGrade}등급`}
                      </p>
                    </div>
                    {availableCells != null && availableCells > 0 && (
                      <span className="px-2 py-0.5 text-[10px] bg-green-100 text-green-600 rounded-full font-medium">
                        빈 셀 {availableCells}개
                      </span>
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
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default SellerRecommendationPanel;

