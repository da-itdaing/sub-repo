import { Map, MapMarker, Polygon, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useMemo } from 'react';

/**
 * 존 폴리곤 표시 지도 컴포넌트
 * 
 * 챗봇 추천 결과에서 존의 폴리곤 영역을 표시합니다.
 */
const ZonePolygonMap = ({
  center = { lat: 35.14667451156048, lng: 126.92227158987355 },
  zones = [], // { id, name, lat, lng, polygon, isSelected }[]
  markers = [], // { id, lat, lng, polygon?, label, content, onClick }[]
  height = '400px',
  level = 6,
  onZoneClick,
  onMapReady,
  selectedZoneId = null,
  highlightId = null, // markers에서 하이라이트할 ID (selectedZoneId보다 우선)
  zoomable = true,
  draggable = true,
}) => {
  // highlightId가 있으면 selectedZoneId 대신 사용
  const effectiveSelectedId = highlightId ?? selectedZoneId;
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

  // GeoJSON 폴리곤을 카카오맵 폴리곤 형식으로 변환
  const parsePolygon = (polygonData) => {
    if (!polygonData) return null;
    
    try {
      let geoJson = polygonData;
      
      // 문자열이면 JSON 파싱
      if (typeof polygonData === 'string') {
        geoJson = JSON.parse(polygonData);
      }
      
      // GeoJSON Polygon 형식
      if (geoJson.type === 'Polygon' && geoJson.coordinates) {
        // GeoJSON은 [lng, lat] 순서, 카카오맵은 { lat, lng }
        return geoJson.coordinates[0].map(([lng, lat]) => ({
          lat,
          lng,
        }));
      }
      
      // 이미 { lat, lng }[] 형식인 경우
      if (Array.isArray(geoJson) && geoJson[0]?.lat !== undefined) {
        return geoJson;
      }
      
      return null;
    } catch (e) {
      console.warn('Failed to parse polygon:', e);
      return null;
    }
  };

  const validZones = useMemo(
    () =>
      zones
        .map((zone) => ({
          ...zone,
          parsedPolygon: parsePolygon(zone.polygon),
          isSelected: zone.id === effectiveSelectedId || zone.isSelected,
        }))
        .filter((zone) => zone.parsedPolygon),
    [zones, effectiveSelectedId]
  );

  // markers에서 polygon이 있는 것들도 폴리곤으로 변환
  const markersWithPolygons = useMemo(
    () =>
      validMarkers.map((marker) => ({
        ...marker,
        parsedPolygon: parsePolygon(marker.polygon),
        isSelected: marker.id === effectiveSelectedId,
      })),
    [validMarkers, effectiveSelectedId]
  );

  // 선택된 존이 있으면 그 존의 중심으로 이동
  const mapCenter = useMemo(() => {
    const selectedZone = validZones.find((z) => z.isSelected);
    if (selectedZone) {
      return { lat: selectedZone.lat, lng: selectedZone.lng };
    }
    if (validMarkers.length > 0) {
      return { lat: validMarkers[0].lat, lng: validMarkers[0].lng };
    }
    return center;
  }, [validZones, validMarkers, center]);

  return (
    <div className="rounded-lg overflow-hidden" style={{ width: '100%', height, touchAction: 'none' }}>
      <Map
        center={mapCenter}
        style={{ width: '100%', height: '100%' }}
        level={level}
        zoomable={zoomable}
        draggable={draggable}
        onCreate={(map) => onMapReady?.(map)}
        scrollwheel={false}
      >
        {/* 폴리곤 렌더링 */}
        {validZones.map((zone) => (
          <div key={zone.id}>
            <Polygon
              path={zone.parsedPolygon}
              strokeWeight={zone.isSelected ? 3 : 2}
              strokeColor={zone.isSelected ? '#4f46e5' : '#6b7280'}
              strokeOpacity={0.9}
              strokeStyle="solid"
              fillColor={zone.isSelected ? '#4f46e5' : '#9ca3af'}
              fillOpacity={zone.isSelected ? 0.35 : 0.2}
              onClick={() => onZoneClick?.(zone)}
            />
            {/* 중심 마커 */}
            {zone.lat && zone.lng && (
              <>
                <MapMarker
                  position={{ lat: zone.lat, lng: zone.lng }}
                  title={zone.name || ''}
                  onClick={() => onZoneClick?.(zone)}
                  clickable
                />
                {/* 존 이름 오버레이 */}
                {zone.name && (
                  <CustomOverlayMap 
                    position={{ lat: zone.lat, lng: zone.lng }} 
                    yAnchor={1.5}
                  >
                    <div 
                      className={`px-2 py-1 rounded-lg shadow-md text-xs font-semibold border cursor-pointer transition-all ${
                        zone.isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-700' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => onZoneClick?.(zone)}
                    >
                      {zone.name}
                    </div>
                  </CustomOverlayMap>
                )}
              </>
            )}
          </div>
        ))}

        {/* markers에서 폴리곤이 있는 것들 렌더링 */}
        {markersWithPolygons
          .filter((m) => m.parsedPolygon && !validZones.some((z) => z.id === m.id))
          .map((marker, index) => (
            <div key={marker.id || `marker-poly-${index}`}>
              <Polygon
                path={marker.parsedPolygon}
                strokeWeight={marker.isSelected ? 3 : 2}
                strokeColor={marker.isSelected ? '#3b82f6' : '#6b7280'}
                strokeOpacity={0.9}
                strokeStyle="solid"
                fillColor={marker.isSelected ? '#3b82f6' : '#9ca3af'}
                fillOpacity={marker.isSelected ? 0.35 : 0.2}
                onClick={() => marker.onClick?.(marker)}
              />
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
                  <div 
                    className={`px-2 py-1 rounded-lg shadow-md text-xs font-semibold border cursor-pointer transition-all ${
                      marker.isSelected 
                        ? 'bg-blue-500 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => marker.onClick?.(marker)}
                  >
                    {marker.content}
                  </div>
                </CustomOverlayMap>
              )}
            </div>
          ))}

        {/* 폴리곤 없는 마커들 */}
        {markersWithPolygons
          .filter((m) => !m.parsedPolygon && !validZones.some((z) => z.id === m.id))
          .map((marker, index) => (
            <div key={marker.id || `marker-${index}`}>
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
          ))}
      </Map>
    </div>
  );
};

export default ZonePolygonMap;

