import apiClient from '@/api/client';

/**
 * 팝업 관련 API 서비스
 */

/**
 * 팝업 목록 조회
 * @returns {Promise<Array>}
 */
export const getPopups = async () => {
  try {
    const response = await apiClient.get('/popups');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch popups:', error);
    return [];
  }
};

/**
 * 팝업 검색
 * @param {Object} params - 검색 파라미터
 * @returns {Promise<Object>} 페이지네이션된 팝업 목록
 */
export const searchPopups = async (params = {}) => {
  try {
    const response = await apiClient.get('/popups/search', { params });
    return response || { content: [], totalPages: 0, totalElements: 0 };
  } catch (error) {
    console.error('Failed to search popups:', error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
};

/**
 * 팝업 상세 조회
 * @param {number} popupId 
 * @returns {Promise<Object>}
 */
export const getPopupById = async (popupId) => {
  const response = await apiClient.get(`/popups/${popupId}`);
  return response;
};

/**
 * 팝업 리뷰 목록 조회
 * @param {number} popupId 
 * @returns {Promise<Array>}
 */
export const getPopupReviews = async (popupId) => {
  try {
    const response = await apiClient.get(`/popups/${popupId}/reviews`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
};

/**
 * 리뷰 작성
 * @param {number} popupId 
 * @param {Object} reviewData 
 * @returns {Promise<Object>}
 */
export const createReview = async (popupId, reviewData) => {
  const response = await apiClient.post(`/popups/${popupId}/reviews`, reviewData);
  return response;
};

