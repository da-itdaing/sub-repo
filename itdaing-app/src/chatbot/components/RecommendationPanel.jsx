import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import KakaoMap from '@/components/map/KakaoMap';
import { ROUTES } from '@/routes/paths';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveItemId = (item = {}) =>
  item.market_id || item.metadata?.market_id || item.zone_id || item.name;

const RecommendationPanel = ({ items = [], mode = 'consumer' }) => {
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (items.length > 0) {
      setHighlightId(resolveItemId(items[0]));
      // 디버깅: recommendations 데이터 확인
      console.log('[RecommendationPanel] Received items:', items);
      console.log('[RecommendationPanel] Sample market_id:', items[0]?.market_id);
      console.log('[RecommendationPanel] Sample lat/lon:', items[0]?.lat, items[0]?.lon);
    } else {
      setHighlightId(null);
    }
  }, [items]);

  const markers = useMemo(
    () =>
      items
        .map((item) => {
          const lat = toNumber(item.lat ?? item.metadata?.lat ?? item.metadata?.latitude);
          const lng = toNumber(
            item.lon ?? item.lng ?? item.metadata?.lon ?? item.metadata?.lng ?? item.metadata?.longitude,
          );
          if (lat == null || lng == null) {
            return null;
          }
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

  // 추천이 없을 때는 null 반환 (메시지는 useChatSession에서 처리)
  if (!items.length) {
    return null;
  }

  const centerMarker = markers.find((marker) => marker.id === highlightId) || markers[0];

  const detailLinkFor = (item) => {
    if (mode === 'consumer') {
      const popupId = item.market_id || item.metadata?.market_id;
      if (popupId) {
        // market_id가 "M001" 형식이면 숫자로 변환 필요 (Spring Boot DB는 숫자 ID 사용)
        const numericId = popupId.toString().replace(/^M0*/, '');
        if (numericId && /^\d+$/.test(numericId)) {
          return ROUTES.popupDetail(parseInt(numericId, 10));
        }
        return ROUTES.popupDetail(popupId);
      }
    }
    return null;
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase text-[#EB0000] tracking-wide">추천 요약</p>
          <h3 className="text-sm font-bold text-gray-900 mt-0.5">지도에서 위치를 바로 확인하세요</h3>
        </div>
        <Link
          to={ROUTES.home}
          className="text-xs font-medium text-gray-600 hover:text-[#EB0000] underline"
        >
          홈에서 전체 보기
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="space-y-3">
          {items.map((item) => {
            const id = resolveItemId(item);
            const isActive = id === highlightId;
            const detailLink = detailLinkFor(item);
            const address = item.address || item.metadata?.address || item.metadata?.location;

            return (
              <div
                key={id}
                className={`rounded-2xl border p-4 text-left transition-all cursor-pointer hover:shadow-md ${
                  isActive ? 'border-[#EB0000] bg-red-50/30 shadow-sm' : 'border-gray-200 bg-white'
                }`}
                onClick={() => setHighlightId(id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase bg-gray-100 text-gray-600 rounded">
                    {item.category || item.zone_type || '추천'}
                  </span>
                  {item.distance_km && (
                    <span className="text-[10px] text-gray-500 font-medium">
                      {Number(item.distance_km).toFixed(1)}km
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">{item.name || '이름 미정'}</h4>
                {address && <p className="text-xs text-gray-600 mb-2">{address}</p>}
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 mb-3">
                  {typeof item.rating === 'number' && (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      {item.rating.toFixed(1)}
                    </span>
                  )}
                  {Array.isArray(item.attributes) && item.attributes.length > 0 && (
                    <span className="text-gray-500">• {item.attributes.slice(0, 2).join(', ')}</span>
                  )}
                </div>
                {detailLink && (
                  <Link
                    to={detailLink}
                    className="inline-block text-xs font-semibold text-[#EB0000] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    상세 정보 보기 →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <KakaoMap
            height="280px"
            level={4}
            center={
              centerMarker
                ? { lat: centerMarker.lat, lng: centerMarker.lng }
                : undefined
            }
            markers={markers}
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendationPanel;


