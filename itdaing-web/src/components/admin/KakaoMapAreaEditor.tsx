import React, { useEffect, useRef, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface KakaoMapAreaEditorProps {
  initialPolygon?: string; // GeoJSON string
  onPolygonComplete?: (geojson: string) => void;
  center?: { lat: number; lng: number };
  height?: string;
}

export function KakaoMapAreaEditor({
  initialPolygon,
  onPolygonComplete,
  center = { lat: 35.1595, lng: 126.8526 }, // 광주 기본 좌표
  height = '500px',
}: KakaoMapAreaEditorProps) {
  const [map, setMap] = useState<any>(null);
  const [drawingManager, setDrawingManager] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const polygonOverlayRef = useRef<any>(null);
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

      // DrawingManager 초기화
      const manager = new kakao.maps.drawing.DrawingManager({
        drawingMode: [kakao.maps.drawing.OverlayType.POLYGON],
        guideTooltip: 'click',
        markerOptions: {
          draggable: true,
          removable: true,
        },
        polygonOptions: {
          draggable: true,
          removable: true,
          editable: true,
          fillColor: '#00a0e9',
          fillOpacity: 0.3,
          strokeColor: '#00a0e9',
          strokeWeight: 3,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
        },
      });

      manager.setMap(newMap);
      setDrawingManager(manager);

      // 폴리곤 그리기 완료 이벤트
      kakao.maps.event.addListener(manager, 'drawend', (overlay: any) => {
        const path = overlay.getPath();
        const coordinates = path.getArray().map((point: any) => [point.getLng(), point.getLat()]);
        
        // GeoJSON 형식으로 변환
        const geojson = JSON.stringify({
          type: 'Polygon',
          coordinates: [coordinates],
        });

        if (onPolygonComplete) {
          onPolygonComplete(geojson);
        }

        polygonOverlayRef.current = overlay;
        setIsDrawing(false);
      });

      // 기존 폴리곤이 있으면 표시
      if (initialPolygon) {
        try {
          const geo = JSON.parse(initialPolygon);
          if (geo.type === 'Polygon' && geo.coordinates && geo.coordinates[0]) {
            const path = geo.coordinates[0].map((coord: number[]) => 
              new kakao.maps.LatLng(coord[1], coord[0])
            );
            
            const polygon = new kakao.maps.Polygon({
              map: newMap,
              path: path,
              fillColor: '#00a0e9',
              fillOpacity: 0.3,
              strokeColor: '#00a0e9',
              strokeWeight: 3,
              strokeOpacity: 0.8,
              strokeStyle: 'solid',
            });

            polygonOverlayRef.current = polygon;
            
            // 폴리곤 영역으로 지도 범위 조정
            const bounds = new kakao.maps.LatLngBounds();
            path.forEach((point: any) => bounds.extend(point));
            newMap.setBounds(bounds);
          }
        } catch (e) {
          console.error('Failed to parse initial polygon:', e);
        }
      }

      return () => {
        if (polygonOverlayRef.current) {
          polygonOverlayRef.current.setMap(null);
        }
        manager.setMap(null);
      };
    }
  }, [initialPolygon, onPolygonComplete, center]);

  const startDrawing = () => {
    if (drawingManager && (window as any).kakao) {
      const kakao = (window as any).kakao;
      // 기존 폴리곤 제거
      if (polygonOverlayRef.current) {
        polygonOverlayRef.current.setMap(null);
        polygonOverlayRef.current = null;
      }
      drawingManager.select(kakao.maps.drawing.OverlayType.POLYGON);
      setIsDrawing(true);
    }
  };

  const clearDrawing = () => {
    if (polygonOverlayRef.current) {
      polygonOverlayRef.current.setMap(null);
      polygonOverlayRef.current = null;
    }
    if (onPolygonComplete) {
      onPolygonComplete('');
    }
    setIsDrawing(false);
  };

  return (
    <div className="relative" style={{ height }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={startDrawing}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition"
        >
          {isDrawing ? '그리기 중...' : '폴리곤 그리기'}
        </button>
        <button
          onClick={clearDrawing}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition"
        >
          지우기
        </button>
      </div>
    </div>
  );
}

