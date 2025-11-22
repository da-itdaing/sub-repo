import { useEffect, useState } from 'react';
import { Map, MapMarker, CustomOverlayMap, MarkerClusterer } from 'react-kakao-maps-sdk';

/**
 * KakaoMapSDK 컴포넌트
 * react-kakao-maps-sdk를 사용한 카카오맵 컴포넌트
 * App.jsx에서 SDK가 사전 로드되므로 API 키 로딩 불필요
 * 
 * @param {Object} center - {lat, lng} 지도 중심 좌표
 * @param {Array} markers - 마커 배열 [{id, lat, lng, label, onClick, content}]
 * @param {string} height - 지도 높이
 * @param {number} level - 지도 확대 레벨 (1-14)
 * @param {boolean} enableClustering - 마커 클러스터링 활성화
 * @param {Function} onMapReady - 지도 준비 완료 콜백
 */
const KakaoMapSDK = ({
  center = { lat: 35.14667451156048, lng: 126.92227158987355 },
  markers = [],
  height = '400px',
  level = 4,
  enableClustering = false,
  onMapReady,
  zoomable = true,
  draggable = true,
}) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // SDK 로드 확인 (App.jsx에서 사전 로드됨)
  useEffect(() => {
    const checkSDK = () => {
      if (window.kakao && window.kakao.maps) {
        setIsReady(true);
        console.log('[KakaoMapSDK] SDK is ready');
      } else {
        // SDK가 아직 로드 중이면 잠시 후 다시 확인
        setTimeout(checkSDK, 100);
      }
    };
    
    checkSDK();
  }, []);

  // 지도 인스턴스 생성 시 콜백
  const handleMapCreate = (map) => {
    console.log('[KakaoMapSDK] Map instance created');
    setMapInstance(map);
    onMapReady?.(map);
  };

  if (!isReady) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 유효한 마커만 필터링
  const validMarkers = markers.filter(
    (marker) => 
      marker && 
      typeof marker.lat === 'number' && 
      typeof marker.lng === 'number' &&
      !isNaN(marker.lat) &&
      !isNaN(marker.lng)
  );

  return (
    <Map
      center={center}
      style={{ width: '100%', height }}
      level={level}
      onCreate={handleMapCreate}
      zoomable={zoomable}
      draggable={draggable}
    >
      {enableClustering && validMarkers.length > 0 ? (
        // 마커 클러스터링 사용
        <MarkerClusterer
          averageCenter={true}
          minLevel={5}
        >
          {validMarkers.map((marker) => (
            <MapMarker
              key={marker.id || `${marker.lat}-${marker.lng}`}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.label || ''}
              onClick={() => marker.onClick?.(marker)}
              clickable={!!marker.onClick}
            />
          ))}
        </MarkerClusterer>
      ) : (
        // 일반 마커
        validMarkers.map((marker) => (
          <div key={marker.id || `${marker.lat}-${marker.lng}`}>
            <MapMarker
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.label || ''}
              onClick={() => marker.onClick?.(marker)}
              clickable={!!marker.onClick}
            />
            {marker.content && (
              <CustomOverlayMap
                position={{ lat: marker.lat, lng: marker.lng }}
                yAnchor={1.5}
              >
                <div className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-semibold border border-gray-200">
                  {marker.content}
                </div>
              </CustomOverlayMap>
            )}
          </div>
        ))
      )}
    </Map>
  );
};

export default KakaoMapSDK;

