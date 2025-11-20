// 직접 Kakao SDK를 사용하는 지도 컴포넌트 (폴백용)
// my-map-test 방식 참고
import { useEffect, useRef, useState } from 'react';

/**
 * 직접 Kakao SDK를 사용하는 지도 컴포넌트
 * react-kakao-maps-sdk에서 문제가 있을 때 사용하는 폴백
 * 
 * @param {object} center - {lat, lng}
 * @param {array} markers - [{id, lat, lng, label, color, onClick}]
 * @param {string} height - CSS height 값
 * @param {number} level - 지도 레벨
 * @param {function} onMapReady - 지도 준비 완료 콜백
 */
export default function KakaoMapDirect({
  center = { lat: 35.14667451156048, lng: 126.92227158987355 },
  markers = [],
  height = '400px',
  level = 4,
  onMapReady,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);


  // 지도 초기화
  useEffect(() => {
    if (!window.kakao?.maps) {
      console.error('Kakao SDK not loaded');
      return;
    }

    if (!mapContainerRef.current) {
      console.warn('Map container ref is null, waiting...');
      return;
    }


    let isMounted = true;

    window.kakao.maps.load(() => {
      if (!isMounted || !mapContainerRef.current) {
        console.log('Mount cancelled or ref lost');
        return;
      }

      try {
        const kakao = window.kakao;
        const mapInstance = new kakao.maps.Map(mapContainerRef.current, {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level,
        });

        mapInstanceRef.current = mapInstance;
        // 여러 타이밍에 relayout 호출 (DOM 준비 대기)
        [50, 100, 200, 500].forEach(delay => {
          setTimeout(() => {
            if (isMounted && mapInstance) {
              mapInstance.relayout();
            }
          }, delay);
        });

        setMapReady(true);
        onMapReady?.(mapInstance);
      } catch (err) {
        console.error('Failed to create map:', err);
        if (isMounted) {
          setError('지도 생성 실패: ' + err.message);
        }
      }
    });

    return () => {
      console.log('KakaoMapDirect cleanup');
      isMounted = false;
      setMapReady(false);
      
      // 마커 정리
      markersRef.current.forEach(marker => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
      
      // 지도 인스턴스 정리
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []); // 빈 배열: 컴포넌트 마운트/언마운트 시에만 실행

  // 마커 업데이트
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.kakao?.maps) {
      return;
    }

    const kakao = window.kakao;

    // 기존 마커 제거
    markersRef.current.forEach(marker => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // 새 마커 추가
    markers.forEach((markerData) => {
      if (markerData.lat == null || markerData.lng == null) {
        return;
      }

      // 커스텀 마커 이미지 생성
      const color = markerData.color || '#eb0000';
      const svg = `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.16344 0 0 7.07494 0 15.8C0 27.65 16 42 16 42C16 42 32 27.65 32 15.8C32 7.07494 24.8366 0 16 0Z" fill="${color}"/></svg>`;
      
      const markerImage = new kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        new kakao.maps.Size(32, 42),
        { offset: new kakao.maps.Point(16, 42) }
      );

      const marker = new kakao.maps.Marker({
        map: mapInstanceRef.current,
        position: new kakao.maps.LatLng(markerData.lat, markerData.lng),
        title: markerData.label,
        image: markerImage,
      });

      if (markerData.onClick) {
        kakao.maps.event.addListener(marker, 'click', () => {
          markerData.onClick(markerData.id);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, mapReady]);

  // 중심 좌표 변경
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && window.kakao?.maps) {
      const kakao = window.kakao;
      mapInstanceRef.current.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    }
  }, [center.lat, center.lng, mapReady]);

  // 레벨 변경
  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      mapInstanceRef.current.setLevel(level);
    }
  }, [level, mapReady]);

  if (error) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-red-50 text-red-600 gap-2 rounded-2xl border border-red-200"
        style={{ height }}
      >
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 text-xs bg-red-100 rounded-full hover:bg-red-200"
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef}
      className="w-full rounded-2xl"
      style={{ 
        width: '100%',
        height: typeof height === 'string' ? height : `${height}px`, 
        minHeight: typeof height === 'string' ? height : `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        display: 'block',
        visibility: 'visible',
        zIndex: 1
      }} 
    />
  );
}

