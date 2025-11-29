/**
 * Geo Zone/Area/Cell 관련 API 서비스
 * - 관리자: 존(zone_area) 생성/수정/삭제, 셀(zone_cell) 관리
 * - 판매자: 존 목록 조회, 셀 선택
 */

import { client } from '@/api/client';

const BASE_URL = '/api/geo';

/* ============ Area (존 영역) API ============ */

/**
 * 구역(Area) 목록 조회
 * @param {Object} params - { keyword, page, size }
 * @returns {Promise<{items: Array, totalElements: number, totalPages: number, page: number, size: number}>}
 */
export const listAreas = async ({ keyword = '', page = 0, size = 20 } = {}) => {
  const response = await client.get(`${BASE_URL}/areas`, {
    params: { keyword, page, size },
  });
  return response.data;
};

/**
 * 구역(Area) 상세 조회
 * @param {number} id - 구역 ID
 * @returns {Promise<Object>}
 */
export const getArea = async (id) => {
  const response = await client.get(`${BASE_URL}/areas/${id}`);
  return response.data;
};

/**
 * 구역(Area) 생성 (관리자 전용)
 * @param {Object} data - { name, polygonGeoJson, status, maxCapacity, notice, regionId }
 * @returns {Promise<Object>}
 */
export const createArea = async (data) => {
  const response = await client.post(`${BASE_URL}/areas`, data);
  return response.data;
};

/**
 * 구역(Area) 수정 (관리자 전용)
 * @param {number} id - 구역 ID
 * @param {Object} data - { name, polygonGeoJson, status, maxCapacity, notice, regionId }
 * @returns {Promise<Object>}
 */
export const updateArea = async (id, data) => {
  const response = await client.put(`${BASE_URL}/areas/${id}`, data);
  return response.data;
};

/**
 * 구역(Area) 삭제 (관리자 전용)
 * @param {number} id - 구역 ID
 * @returns {Promise<void>}
 */
export const deleteArea = async (id) => {
  await client.delete(`${BASE_URL}/areas/${id}`);
};

/* ============ Zone (존/셀) API ============ */

/**
 * 존(Zone) 생성 (관리자/판매자)
 * @param {Object} data - { areaId, ownerId, label, detailedAddress, geometryData, maxCapacity, notice }
 * @returns {Promise<Object>}
 */
export const createZone = async (data) => {
  const response = await client.post(`${BASE_URL}/zones`, data);
  return response.data;
};

/**
 * 내가 만든 존 목록 (판매자)
 * @param {Object} params - { page, size }
 * @returns {Promise<{items: Array, totalElements: number, totalPages: number, page: number, size: number}>}
 */
export const listMyZones = async ({ page = 0, size = 20 } = {}) => {
  const response = await client.get(`${BASE_URL}/zones/me`, {
    params: { page, size },
  });
  return response.data;
};

/**
 * 특정 구역의 존 목록 (관리자)
 * @param {number} areaId - 구역 ID
 * @param {Object} params - { page, size }
 * @returns {Promise<{items: Array, totalElements: number, totalPages: number, page: number, size: number}>}
 */
export const listZonesByArea = async (areaId, { page = 0, size = 20 } = {}) => {
  const response = await client.get(`${BASE_URL}/zones`, {
    params: { areaId, page, size },
  });
  return response.data;
};

/**
 * 존 상태 변경 (관리자)
 * @param {number} zoneId - 존 ID
 * @param {string} status - 상태 (PENDING, APPROVED, REJECTED, etc.)
 * @returns {Promise<void>}
 */
export const changeZoneStatus = async (zoneId, status) => {
  await client.patch(`${BASE_URL}/zones/${zoneId}/status`, { status });
};

/* ============ Cell (셀/부스) API ============ */

/**
 * 셀(Cell) 목록 조회
 * @param {Object} params - { areaId, page, size }
 * @returns {Promise<{items: Array, totalElements: number, totalPages: number, page: number, size: number}>}
 */
export const listCells = async ({ areaId, page = 0, size = 50 } = {}) => {
  const response = await client.get(`${BASE_URL}/cells`, {
    params: { areaId, page, size },
  });
  return response.data;
};

/**
 * 셀(Cell) 생성 (관리자 전용)
 * @param {Object} data - { areaId, ownerId, label, detailedAddress, geometryData, status, maxCapacity, notice }
 * @returns {Promise<Object>}
 */
export const createCell = async (data) => {
  const response = await client.post(`${BASE_URL}/cells`, data);
  return response.data;
};

/**
 * 셀(Cell) 수정 (관리자 전용)
 * @param {number} id - 셀 ID
 * @param {Object} data - { areaId, ownerId, label, detailedAddress, geometryData, status, maxCapacity, notice }
 * @returns {Promise<Object>}
 */
export const updateCell = async (id, data) => {
  const response = await client.put(`${BASE_URL}/cells/${id}`, data);
  return response.data;
};

/**
 * 셀(Cell) 삭제 (관리자 전용)
 * @param {number} id - 셀 ID
 * @returns {Promise<void>}
 */
export const deleteCell = async (id) => {
  await client.delete(`${BASE_URL}/cells/${id}`);
};

/* ============ 헬퍼 함수 ============ */

/**
 * GeoJSON Polygon 문자열을 파싱하여 좌표 배열로 변환
 * @param {string} geoJsonStr - GeoJSON Polygon 문자열
 * @returns {Array<{lat: number, lng: number}>} 좌표 배열
 */
export const parseGeoJsonPolygon = (geoJsonStr) => {
  if (!geoJsonStr) return [];
  
  try {
    const geo = JSON.parse(geoJsonStr);
    if (geo.type !== 'Polygon' || !geo.coordinates || !geo.coordinates[0]) {
      return [];
    }
    
    // GeoJSON은 [lng, lat] 순서이므로 변환
    return geo.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return [];
  }
};

/**
 * 좌표 배열을 GeoJSON Polygon 문자열로 변환
 * @param {Array<{lat: number, lng: number}>} coords - 좌표 배열
 * @returns {string} GeoJSON Polygon 문자열
 */
export const toGeoJsonPolygon = (coords) => {
  if (!coords || coords.length === 0) return '';
  
  // GeoJSON은 [lng, lat] 순서
  const ring = coords.map(({ lat, lng }) => [lng, lat]);
  
  // 첫/마지막 좌표가 다르면 닫기
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first]);
  }
  
  return JSON.stringify({
    type: 'Polygon',
    coordinates: [ring],
  });
};

export default {
  listAreas,
  getArea,
  createArea,
  updateArea,
  deleteArea,
  createZone,
  listMyZones,
  listZonesByArea,
  changeZoneStatus,
  listCells,
  createCell,
  updateCell,
  deleteCell,
  parseGeoJsonPolygon,
  toGeoJsonPolygon,
};

