import { Map, MapMarker, CustomOverlayMap, MarkerClusterer } from 'react-kakao-maps-sdk';
import { useMemo } from 'react';

/**
 * Kakao Map 컴포넌트 (react-kakao-maps-sdk 기반)
 * - 통일된 숫자 마커 디자인 적용
 */
const KakaoMap = ({
  center = { lat: 35.14667451156048, lng: 126.92227158987355 },
  markers = [],
  height = '400px',
  level = 4,
  onMapReady,
  enableClustering = false,
  zoomable = true,
  draggable = true,
  selectedMarkerId = null, // 선택된 마커 ID
}) => {
  const validMarkers = useMemo(
    () =>
      markers.filter(
        (marker) =>
          marker &&
          typeof marker.lat === 'number' &&
          typeof marker.lng === 'number' &&
          !Number.isNaN(marker.lat) &&
          !Number.isNaN(marker.lng)
      ),
    [markers]
  );

  // 숫자 마커 이미지 생성 함수
  const getMarkerImage = (index, isSelected) => ({
    src: isSelected 
      ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png'
      : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
    size: { width: 36, height: 37 },
    options: {
      spriteSize: { width: 36, height: 691 },
      spriteOrigin: { x: 0, y: ((index % 10) * 46) + 10 },
      offset: { x: 13, y: 37 },
    },
  });

  const mapContent = (
    <Map
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={level}
      zoomable={zoomable}
      draggable={draggable}
      onCreate={(map) => onMapReady?.(map)}
      scrollwheel={false}
    >
      {enableClustering && validMarkers.length > 0 ? (
        <MarkerClusterer averageCenter minLevel={5}>
          {validMarkers.map((marker, index) => (
            <MapMarker
              key={marker.id || `${marker.lat}-${marker.lng}`}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.label || ''}
              onClick={() => marker.onClick?.(marker)}
              clickable={!!marker.onClick}
              image={getMarkerImage(index, marker.id === selectedMarkerId)}
            />
          ))}
        </MarkerClusterer>
      ) : (
        validMarkers.map((marker, index) => {
          const isSelected = marker.id === selectedMarkerId;
          return (
            <div key={marker.id || `${marker.lat}-${marker.lng}`}>
              {/* 숫자 마커 */}
              <MapMarker
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.label || ''}
                onClick={() => marker.onClick?.(marker)}
                clickable={!!marker.onClick}
                image={getMarkerImage(index, isSelected)}
              />
              {/* 라벨 오버레이 */}
              {marker.content && (
                <CustomOverlayMap position={{ lat: marker.lat, lng: marker.lng }} yAnchor={2.5}>
                  <div 
                    onClick={() => marker.onClick?.(marker)}
                    className={`cursor-pointer px-2 py-1 rounded-lg shadow-md text-xs font-semibold border transition-all ${
                      isSelected 
                        ? 'bg-[#EB0000] text-white border-[#EB0000] scale-110' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#EB0000] hover:shadow-lg'
                    }`}
                  >
                    {marker.content}
                  </div>
                </CustomOverlayMap>
              )}
            </div>
          );
        })
      )}
    </Map>
  );

  return (
    <div className="rounded-lg overflow-hidden" style={{ width: '100%', height, touchAction: 'none' }}>
      {mapContent}
    </div>
  );
};

export default KakaoMap;

