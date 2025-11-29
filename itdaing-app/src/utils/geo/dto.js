/**
 * Zone Area 생성/수정 요청 DTO 빌더
 * @param {string} name 존 이름
 * @param {number} regionId 리전 ID
 * @param {Object} geoJSON GeoJSON Polygon 객체
 * @returns {Object}
 */
export const buildZoneAreaRequest = (name, regionId, geoJSON) => {
  // TODO: 백엔드 스키마에 맞추어 필드 구성
  return {
    name,
    regionId,
    geometry: geoJSON,
  };
};

/**
 * Zone Cell 생성/수정 요청 DTO 빌더
 * @param {number} zoneId 상위 존 ID
 * @param {string} label 셀 라벨/이름
 * @param {Object} geoJSON GeoJSON Polygon 객체
 * @returns {Object}
 */
export const buildZoneCellRequest = (zoneId, label, geoJSON) => {
  return {
    zoneId,
    label,
    geometry: geoJSON,
  };
};


