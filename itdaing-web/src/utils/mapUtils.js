/**
 * 카카오맵 유틸리티 함수 모음
 * my-map-test 프로젝트에서 검증된 로직을 가져옴
 */

/**
 * 좌표 배열을 GeoJSON Polygon 형식으로 변환
 * @param {Array<{lat: number, lng: number}>} coords - 좌표 배열
 * @returns {string} GeoJSON 문자열
 */
export const coordsToGeoJSON = (coords) => {
  // GeoJSON은 [lng, lat] 순서
  const coordinates = coords.map(c => [c.lng, c.lat]);
  
  // 폴리곤은 첫 번째와 마지막 좌표가 같아야 함 (닫힌 도형)
  if (coordinates.length > 0) {
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coordinates.push(coordinates[0]);
    }
  }
  
  return JSON.stringify({
    type: "Polygon",
    coordinates: [coordinates]
  });
};

/**
 * GeoJSON Polygon을 좌표 배열로 변환
 * @param {string|object} geoJson - GeoJSON 문자열 또는 객체
 * @returns {Array<{lat: number, lng: number}>} 좌표 배열
 */
export const geoJSONToCoords = (geoJson) => {
  if (!geoJson) return [];
  
  try {
    const parsed = typeof geoJson === 'string' ? JSON.parse(geoJson) : geoJson;
    
    if (parsed.type === 'Polygon' && parsed.coordinates && parsed.coordinates[0]) {
      // GeoJSON은 [lng, lat] 순서이므로 변환
      return parsed.coordinates[0].map(c => ({ lat: c[1], lng: c[0] }));
    }
  } catch (e) {
    console.error('GeoJSON 파싱 실패:', e);
  }
  
  return [];
};

/**
 * 카카오맵 폴리곤 객체에서 경로 추출
 * @param {object} polygon - 카카오맵 Polygon 객체
 * @returns {Array} 경로 배열
 */
export const extractPath = (polygon) => {
  if (!polygon) return [];
  
  try {
    const raw = polygon.getPath?.();
    if (!raw) return [];
    
    // MVCArray.getArray() 메서드가 있는 경우
    if (typeof raw.getArray === 'function') {
      return raw.getArray();
    }
    
    // 이미 배열인 경우
    if (Array.isArray(raw)) {
      return raw;
    }
    
    // length 속성이 있는 유사 배열인 경우
    if (typeof raw.length === 'number') {
      const arr = [];
      for (let i = 0; i < raw.length; i++) {
        arr.push(raw[i]);
      }
      return arr;
    }
  } catch (e) {
    console.error('폴리곤 경로 추출 실패:', e);
  }
  
  return [];
};

/**
 * 점이 선분 위에 있는지 확인 (경계 허용)
 * @param {number} x - 점의 x 좌표 (lng)
 * @param {number} y - 점의 y 좌표 (lat)
 * @param {number} x1 - 선분 시작점 x
 * @param {number} y1 - 선분 시작점 y
 * @param {number} x2 - 선분 끝점 x
 * @param {number} y2 - 선분 끝점 y
 * @param {number} eps - 오차 허용 범위
 * @returns {boolean} 점이 선분 위에 있으면 true
 */
const isPointOnSegment = (x, y, x1, y1, x2, y2, eps = 1e-9) => {
  // 외적으로 일직선 위에 있는지 확인
  const cross = (y - y1) * (x2 - x1) - (x - x1) * (y2 - y1);
  if (Math.abs(cross) > eps) return false;
  
  // 내적으로 선분 범위 내에 있는지 확인
  const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
  if (dot < -eps) return false;
  
  const lenSq = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (dot - lenSq > eps) return false;
  
  return true;
};

/**
 * Point-in-polygon 알고리즘 (경계 포함)
 * @param {{lat: number, lng: number}} pt - 검사할 점
 * @param {Array<{lat: number, lng: number}>} polyCoords - 폴리곤 좌표 배열
 * @returns {boolean} 점이 폴리곤 내부 또는 경계에 있으면 true
 */
export const pointInPolygon = (pt, polyCoords) => {
  const x = pt.lng;
  const y = pt.lat;
  let inside = false;

  for (let i = 0, j = polyCoords.length - 1; i < polyCoords.length; j = i++) {
    const xi = polyCoords[i].lng;
    const yi = polyCoords[i].lat;
    const xj = polyCoords[j].lng;
    const yj = polyCoords[j].lat;

    // 경계(on-edge)는 내부로 인정
    if (isPointOnSegment(x, y, xi, yi, xj, yj)) {
      return true;
    }

    // Ray casting algorithm
    const intersect = (yi > y) !== (yj > y) && 
                     x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
};

/**
 * 좌표 정규화 (다양한 포맷 지원)
 * @param {object} pt - 좌표 객체
 * @param {object} map - 카카오맵 인스턴스
 * @returns {{lat: number, lng: number}} 정규화된 좌표
 */
export const normalizePoint = (pt, map) => {
  if (!pt) {
    throw new Error("Point is null or undefined");
  }
  
  // LatLng 객체인 경우
  if (typeof pt.getLat === 'function' && typeof pt.getLng === 'function') {
    return { lat: pt.getLat(), lng: pt.getLng() };
  }
  
  // {lat, lng} 객체인 경우
  if (typeof pt.lat === 'number' && typeof pt.lng === 'number') {
    return { lat: pt.lat, lng: pt.lng };
  }
  
  // 픽셀 좌표인 경우 (La, Ma 속성)
  if (pt.La !== undefined && pt.Ma !== undefined) {
    const proj = map.getProjection();
    const point = new window.kakao.maps.Point(pt.La, pt.Ma);
    const latlng = proj.coordsFromPoint(point);
    return { lat: latlng.getLat(), lng: latlng.getLng() };
  }

  throw new Error("Unknown point format: " + JSON.stringify(pt));
};

/**
 * 커스텀 마커 이미지 생성 (SVG 기반)
 * @param {string} color - 마커 색상 (기본: #eb0000)
 * @param {{width: number, height: number}} size - 마커 크기
 * @returns {object} 카카오맵 MarkerImage 옵션
 */
export const createMarkerImage = (color = "#eb0000", size = { width: 32, height: 42 }) => {
  const svg = `<svg width="${size.width}" height="${size.height}" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.16344 0 0 7.07494 0 15.8C0 27.65 16 42 16 42C16 42 32 27.65 32 15.8C32 7.07494 24.8366 0 16 0Z" fill="${color}"/></svg>`;
  
  return {
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    size,
    options: { offset: { x: size.width / 2, y: size.height } },
  };
};

/**
 * 두 좌표 간의 거리 계산 (Haversine formula)
 * @param {number} lat1 - 첫 번째 점의 위도
 * @param {number} lng1 - 첫 번째 점의 경도
 * @param {number} lat2 - 두 번째 점의 위도
 * @param {number} lng2 - 두 번째 점의 경도
 * @returns {number} 거리 (km)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if ([lat1, lng1, lat2, lng2].some(v => typeof v !== 'number')) {
    return null;
  }
  
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
};


