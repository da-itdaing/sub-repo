import { useEffect, useRef, useCallback } from 'react';

/**
 * 카카오맵 Geocoder Hook
 * 주소 검색 및 좌표 변환 기능 제공
 * 
 * @returns {object} { addressToCoords, coordsToAddress, isReady }
 */
export function useGeocoder() {
  const geocoderRef = useRef(null);
  const isReadyRef = useRef(false);
  
  useEffect(() => {
    if (window.kakao?.maps?.services) {
      geocoderRef.current = new window.kakao.maps.services.Geocoder();
      isReadyRef.current = true;
    } else {
      isReadyRef.current = false;
    }
  }, []);
  
  /**
   * 주소를 좌표로 변환
   * @param {string} address - 검색할 주소
   * @returns {Promise<{lat: number, lng: number, address: string}>}
   */
  const addressToCoords = useCallback((address) => {
    return new Promise((resolve, reject) => {
      if (!geocoderRef.current) {
        reject(new Error('Geocoder가 초기화되지 않았습니다'));
        return;
      }
      
      if (!address || !address.trim()) {
        reject(new Error('주소를 입력해주세요'));
        return;
      }
      
      geocoderRef.current.addressSearch(address, (result, status) => {
        const kakao = window.kakao;
        
        if (status === kakao.maps.services.Status.OK) {
          const first = result[0];
          resolve({ 
            lat: parseFloat(first.y), 
            lng: parseFloat(first.x),
            address: first.address_name || address
          });
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          reject(new Error('검색 결과가 없습니다'));
        } else {
          reject(new Error('주소 검색에 실패했습니다'));
        }
      });
    });
  }, []);
  
  /**
   * 좌표를 주소로 변환
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @returns {Promise<{address: string, roadAddress: string}>}
   */
  const coordsToAddress = useCallback((lat, lng) => {
    return new Promise((resolve, reject) => {
      if (!geocoderRef.current) {
        reject(new Error('Geocoder가 초기화되지 않았습니다'));
        return;
      }
      
      const kakao = window.kakao;
      const coords = new kakao.maps.LatLng(lat, lng);
      
      geocoderRef.current.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const address = result[0]?.address;
          const roadAddress = result[0]?.road_address;
          
          resolve({
            address: address?.address_name || '',
            roadAddress: roadAddress?.address_name || ''
          });
        } else {
          reject(new Error('주소 변환에 실패했습니다'));
        }
      });
    });
  }, []);
  
  return { 
    addressToCoords, 
    coordsToAddress, 
    isReady: isReadyRef.current 
  };
}


