import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 카카오맵 DrawingManager Hook
 * 
 * @param {object} map - 카카오맵 인스턴스
 * @param {object} options - 옵션
 * @param {object} options.polygonOptions - 폴리곤 스타일 옵션
 * @param {function} options.onComplete - 그리기 완료 콜백
 * @returns {object} { manager, isReady, currentOverlay, startDrawing, cancel, removeOverlay }
 */
export function useDrawingManager(map, options = {}) {
  const managerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [currentOverlay, setCurrentOverlay] = useState(null);
  
  useEffect(() => {
    if (!map || !window.kakao?.maps?.drawing) {
      setIsReady(false);
      return;
    }
    
    const manager = new window.kakao.maps.drawing.DrawingManager({
      map,
      drawingMode: [],
      polygonOptions: {
        draggable: true,
        editable: true,
        strokeColor: '#000',
        strokeWeight: 2,
        fillColor: '#aaa',
        fillOpacity: 0.4,
        ...options.polygonOptions
      }
    });
    
    // overlaycomplete 이벤트 리스너
    window.kakao.maps.event.addListener(manager, 'overlaycomplete', (e) => {
      setCurrentOverlay(e.overlay);
      options.onComplete?.(e.overlay);
    });
    
    // drawend 이벤트 리스너 (fallback)
    window.kakao.maps.event.addListener(manager, 'drawend', () => {
      // overlaycomplete에서 처리되지 않은 경우 대비
      console.log('Drawing ended');
    });
    
    managerRef.current = manager;
    setIsReady(true);
    
    return () => {
      if (manager) {
        manager.cancel();
      }
      setIsReady(false);
    };
  }, [map]);
  
  /**
   * 그리기 시작
   * @param {string} type - 'POLYGON', 'POLYLINE', 'MARKER' 등
   */
  const startDrawing = useCallback((type = 'POLYGON') => {
    if (!managerRef.current) {
      console.warn('DrawingManager is not ready');
      return;
    }
    
    const kakao = window.kakao;
    if (!kakao?.maps?.drawing?.OverlayType) {
      console.error('Drawing library not loaded');
      return;
    }
    
    managerRef.current.select(kakao.maps.drawing.OverlayType[type]);
  }, []);
  
  /**
   * 그리기 취소
   */
  const cancel = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.cancel();
    }
    setCurrentOverlay(null);
  }, []);
  
  /**
   * 오버레이 제거
   * @param {object} overlay - 제거할 오버레이 객체
   */
  const removeOverlay = useCallback((overlay) => {
    if (overlay && typeof overlay.setMap === 'function') {
      overlay.setMap(null);
    }
    if (overlay === currentOverlay) {
      setCurrentOverlay(null);
    }
  }, [currentOverlay]);
  
  return { 
    manager: managerRef.current, 
    isReady, 
    currentOverlay,
    startDrawing,
    cancel,
    removeOverlay
  };
}


