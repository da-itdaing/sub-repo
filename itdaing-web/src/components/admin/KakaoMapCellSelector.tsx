import React, { useEffect, useState, useRef } from 'react';

interface KakaoMapCellSelectorProps {
  areas: Array<{ id: number; name: string; polygonGeoJson?: string }>;
  cells?: Array<{ id: number; lat: number; lng: number; label?: string; status: string }>;
  selectedAreaId?: number;
  onAreaSelect?: (areaId: number) => void;
  onCellClick?: (cellId: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: { lat: number; lng: number };
  height?: string;
}

export function KakaoMapCellSelector({
  areas,
  cells = [],
  selectedAreaId,
  onAreaSelect,
  onCellClick,
  onMapClick,
  center = { lat: 35.1595, lng: 126.8526 },
  height = '500px',
}: KakaoMapCellSelectorProps) {
  const [map, setMap] = useState<any>(null);
  const [areaPolygons, setAreaPolygons] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Kakao Maps SDK가 로드될 때까지 대기
    if (typeof window === 'undefined' || !(window as any).kakao) {
      const checkKakao = setInterval(() => {
        if ((window as any).kakao && (window as any).kakao.maps) {
          clearInterval(checkKakao);
          initializeMap();
        }
      }, 100);
      return () => clearInterval(checkKakao);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapContainerRef.current) return;
      const kakao = (window as any).kakao;

      // 지도 생성
      const mapOption = {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 3,
      };
      const newMap = new kakao.maps.Map(mapContainerRef.current, mapOption);
      setMap(newMap);

      // 지도 클릭 이벤트
      if (onMapClick) {
        kakao.maps.event.addListener(newMap, 'click', (mouseEvent: any) => {
          const latlng = mouseEvent.latLng;
          onMapClick(latlng.getLat(), latlng.getLng());
        });
      }
    }
  }, [center, onMapClick]);

  useEffect(() => {
    if (!map || !(window as any).kakao) return;
    const kakao = (window as any).kakao;

    // 기존 폴리곤 및 마커 제거
    areaPolygons.forEach((polygon) => polygon.setMap(null));
    markers.forEach((marker) => marker.setMap(null));
    const newPolygons: any[] = [];
    const newMarkers: any[] = [];

    // 선택된 구역의 폴리곤 표시
    if (selectedAreaId) {
      const selectedArea = areas.find((a) => a.id === selectedAreaId);
      if (selectedArea?.polygonGeoJson) {
        try {
          const geo = JSON.parse(selectedArea.polygonGeoJson);
          if (geo.type === 'Polygon' && geo.coordinates && geo.coordinates[0]) {
            const path = geo.coordinates[0].map((coord: number[]) => 
              new kakao.maps.LatLng(coord[1], coord[0])
            );
            
            const polygon = new kakao.maps.Polygon({
              map: map,
              path: path,
              fillColor: '#00a0e9',
              fillOpacity: 0.2,
              strokeColor: '#00a0e9',
              strokeWeight: 3,
              strokeOpacity: 0.8,
              strokeStyle: 'solid',
            });

            newPolygons.push(polygon);

            // 폴리곤 영역으로 지도 범위 조정
            const bounds = new kakao.maps.LatLngBounds();
            path.forEach((point: any) => bounds.extend(point));
            map.setBounds(bounds);
          }
        } catch (e) {
          console.error('Failed to parse polygon:', e);
        }
      }
    }

    // 셀 마커 표시
    cells.forEach((cell) => {
      const markerColor = 
        cell.status === 'APPROVED' ? '#16a34a' :
        cell.status === 'PENDING' ? '#f97316' :
        cell.status === 'REJECTED' ? '#ef4444' : '#6b7280';

      const marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(cell.lat, cell.lng),
      });

      // 커스텀 오버레이로 라벨 표시
      const overlay = new kakao.maps.CustomOverlay({
        map: map,
        position: new kakao.maps.LatLng(cell.lat, cell.lng),
        content: `<div style="
          color: ${markerColor};
          padding: 4px 8px;
          background-color: white;
          border: 2px solid ${markerColor};
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
        ">${cell.label || `셀 #${cell.id}`}</div>`,
        yAnchor: 1,
      });

      if (onCellClick) {
        kakao.maps.event.addListener(marker, 'click', () => {
          onCellClick(cell.id);
        });
      }

      newMarkers.push(marker, overlay);
    });

    setAreaPolygons(newPolygons);
    setMarkers(newMarkers);

    return () => {
      newPolygons.forEach((polygon) => polygon.setMap(null));
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, selectedAreaId, areas, cells, onCellClick]);

  return (
    <div className="relative" style={{ height }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* 구역 선택 드롭다운 */}
      {areas.length > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <select
            value={selectedAreaId || ''}
            onChange={(e) => onAreaSelect?.(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">구역 선택</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

