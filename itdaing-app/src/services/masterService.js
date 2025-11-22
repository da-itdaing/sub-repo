import apiClient from '@/api/client';

/**
 * 마스터 데이터 API 서비스
 */

/**
 * 카테고리 목록 조회
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/master/categories');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

/**
 * 지역 목록 조회
 * @returns {Promise<Array>}
 */
export const getRegions = async () => {
  try {
    const response = await apiClient.get('/master/regions');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

/**
 * 스타일 목록 조회
 * @returns {Promise<Array>}
 */
export const getStyles = async () => {
  try {
    const response = await apiClient.get('/master/styles');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch styles:', error);
    return [];
  }
};

/**
 * 특징 목록 조회
 * @returns {Promise<Array>}
 */
export const getFeatures = async () => {
  try {
    const response = await apiClient.get('/master/features');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch features:', error);
    return [];
  }
};

