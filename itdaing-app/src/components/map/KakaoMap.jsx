import { Map, MapMarker, CustomOverlayMap, MarkerClusterer } from 'react-kakao-maps-sdk';
import { useMemo } from 'react';

/**
 * Kakao Map 컴포넌트 (react-kakao-maps-sdk 기반)
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

  const mapContent = (
    <Map
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={level}
      zoomable={zoomable}
      draggable={draggable}
      onCreate={(map) => onMapReady?.(map)}
    >
      {enableClustering && validMarkers.length > 0 ? (
        <MarkerClusterer averageCenter minLevel={5}>
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
        validMarkers.map((marker) => (
          <div key={marker.id || `${marker.lat}-${marker.lng}`}>
            <MapMarker
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.label || ''}
              onClick={() => marker.onClick?.(marker)}
              clickable={!!marker.onClick}
            />
            {marker.content && (
              <CustomOverlayMap position={{ lat: marker.lat, lng: marker.lng }} yAnchor={1.5}>
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

  return (
    <div className="rounded-lg overflow-hidden" style={{ width: '100%', height }}>
      {mapContent}
    </div>
  );
};

export default KakaoMap;

