/**
 * Kakao 내부 좌표 포인트를 표준 { lat, lng } 형태로 정규화
 * - LatLng 인스턴스: getLat(), getLng()
 * - DrawingManager 내부 포인트: { Ma, La }
 * - 일반 포인트: { lat, lng }
 *
 * @param {any} point Kakao path 요소
 * @returns {{lat:number, lng:number} | null}
 */
export const normalizePoint = (point) => {
  if (!point) return null;

  // Case 1: Kakao LatLng 인스턴스
  if (typeof point.getLat === "function" && typeof point.getLng === "function") {
    return {
      lat: point.getLat(),
      lng: point.getLng(),
    };
  }

  // Case 2: DrawingManager editable polygon 포인트 → {Ma, La}
  if (typeof point.Ma === "number" && typeof point.La === "number") {
    return {
      lat: point.Ma,
      lng: point.La,
    };
  }

  // Case 3: 일반 {lat, lng}
  if (typeof point.lat === "number" && typeof point.lng === "number") {
    return {
      lat: point.lat,
      lng: point.lng,
    };
  }

  // 타입을 알 수 없는 경우 무시
  return null;
};

/**
 * Kakao 내부 좌표(path) → { lat, lng } 배열로 변환
 * @param {Array<any>} path Kakao Polygon path (LatLng, {Ma, La}, {lat, lng} 등 혼합 가능)
 * @returns {Array<{lat:number, lng:number}>}
 */
export const convertKakaoPathToLatLng = (path) => {
  if (!Array.isArray(path)) return [];

  return path
    .map(normalizePoint)
    .filter((p) => p && typeof p.lat === "number" && typeof p.lng === "number");
};

/**
 * { lat, lng } 배열 → GeoJSON Polygon 객체로 변환
 * GeoJSON 스펙에 따라 [ [lng, lat], ... ] 구조의 LinearRing 을 생성한다.
 * - 첫/마지막 좌표가 동일하지 않으면 자동으로 닫힌 링으로 만들어준다.
 *
 * @param {Array<{lat:number, lng:number}>} latlngArray
 * @returns {{type:'Polygon', coordinates:number[][][]}}
 */
export const convertLatLngToGeoJSON = (latlngArray) => {
  if (!Array.isArray(latlngArray) || latlngArray.length === 0) {
    return {
      type: "Polygon",
      coordinates: [],
    };
  }

  const ring = latlngArray
    .filter(
      (p) =>
        p &&
        typeof p.lat === "number" &&
        typeof p.lng === "number" &&
        !Number.isNaN(p.lat) &&
        !Number.isNaN(p.lng)
    )
    .map((p) => [p.lng, p.lat]);

  if (ring.length === 0) {
    return {
      type: "Polygon",
      coordinates: [],
    };
  }

  const first = ring[0];
  const last = ring[ring.length - 1];

  // GeoJSON Polygon 은 첫/마지막 좌표가 동일해야 함
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first]);
  }

  return {
    type: "Polygon",
    coordinates: [ring],
  };
};


