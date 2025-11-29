import { useRef } from "react";

/**
 * Kakao DrawingManager 기반 존/폴리곤 그리기 전용 훅
 * - DrawingManager 초기화 및 수명 관리를 담당한다.
 * - startDrawing / resetDrawing 메서드를 노출한다.
 * - drawend/overlaycomplete 시 폴리곤 path를 상위로 전달한다.
 */
const useZoneDrawing = ({ onPolygonComplete } = {}) => {
  // DrawingManager 인스턴스 저장
  const managerRef = useRef(null);

  // 현재 활성 폴리곤(overlay) 저장
  const currentPolygonRef = useRef(null);

  // 내부에서 사용하는 폴리곤 완료 콜백 래퍼
  const handlePolygonComplete = (rawPathArray) => {
    if (typeof onPolygonComplete === "function") {
      onPolygonComplete(rawPathArray);
    }
  };

  /**
   * 지도 인스턴스를 전달받아 DrawingManager를 초기화한다.
   */
  const initializeDrawingManager = (map) => {
    if (!map) return;
    if (managerRef.current) return;
    if (!(window && window.kakao && window.kakao.maps && window.kakao.maps.drawing)) {
      // Kakao Drawing 라이브러리가 로드되지 않은 경우
      return;
    }

    const { kakao } = window;

    // DrawingManager 생성
    const manager = new kakao.maps.drawing.DrawingManager({
      map,
      drawingMode: [],
      polygonOptions: {
        draggable: true,
        removable: true,
        editable: true,
        strokeWeight: 2,
        strokeColor: "#eb0000",
        fillColor: "#eb0000",
        fillOpacity: 0.2,
      },
    });

    managerRef.current = manager;

    // 도형 그리기 완료 이벤트 리스너
    kakao.maps.event.addListener(manager, "drawend", (data) => {
      const polygon = data?.target;
      if (!polygon) return;

      // 이전 폴리곤 제거
      if (currentPolygonRef.current) {
        currentPolygonRef.current.setMap(null);
      }

      currentPolygonRef.current = polygon;

      // Kakao Polygon path (MVCArray 또는 Array)
      const path = polygon.getPath && polygon.getPath();
      const rawPathArray =
        path && typeof path.getArray === "function" ? path.getArray() : path || [];

      // Step 2: raw Kakao path 배열만 상위로 전달 (lat/lng 변환, GeoJSON 변환 금지)
      handlePolygonComplete(rawPathArray);
    });
  };

  /**
   * 폴리곤 그리기를 시작한다.
   */
  const startDrawing = () => {
    if (!managerRef.current) return;
    if (!(window && window.kakao && window.kakao.maps && window.kakao.maps.drawing)) {
      return;
    }

    const { kakao } = window;

    // 기존 임시 폴리곤 제거
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
      currentPolygonRef.current = null;
    }

    managerRef.current.select(kakao.maps.drawing.OverlayType.POLYGON);
  };

  /**
   * 현재 그려진 폴리곤을 초기화/삭제한다.
   */
  const resetDrawing = () => {
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
      currentPolygonRef.current = null;
    }

    if (managerRef.current && managerRef.current.cancel) {
      managerRef.current.cancel();
    }
  };

  return {
    initializeDrawingManager,
    startDrawing,
    resetDrawing,
    // 외부에서 재사용 가능하도록 콜백도 노출
    onPolygonComplete: handlePolygonComplete,
    managerRef,
    currentPolygonRef,
  };
};

export default useZoneDrawing;


