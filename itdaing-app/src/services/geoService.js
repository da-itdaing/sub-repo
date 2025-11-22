import apiClient from '@/api/client';

/**
 * 지리 정보(Zone/Cell) 관련 API 서비스
 */

/**
 * Zone 목록 조회 (셀 정보 포함)
 * @returns {Promise<Array>}
 */
export const getZones = async () => {
  try {
    const data = await apiClient.get('/zones');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    return [];
  }
};

/**
 * Area 목록 조회
 * @param {string} keyword 
 * @param {number} page 
 * @param {number} size 
 * @returns {Promise<Object>}
 */
export const getAreas = async (keyword = null, page = 0, size = 20) => {
  try {
    const params = { page, size };
    if (keyword) params.keyword = keyword;
    
    const data = await apiClient.get('/geo/areas', { params });
    return data || { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  } catch (error) {
    console.error('Failed to fetch areas:', error);
    return { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  }
};

/**
 * Cell 목록 조회
 * @param {number} areaId 
 * @param {number} ownerId 
 * @param {string} status 
 * @param {number} page 
 * @param {number} size 
 * @returns {Promise<Object>}
 */
export const getCells = async (areaId = null, ownerId = null, status = null, page = 0, size = 20) => {
  try {
    const params = { page, size };
    if (areaId) params.areaId = areaId;
    if (ownerId) params.ownerId = ownerId;
    if (status) params.status = status;
    
    const data = await apiClient.get('/geo/cells', { params });
    return data || { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  } catch (error) {
    console.error('Failed to fetch cells:', error);
    return { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  }
};

