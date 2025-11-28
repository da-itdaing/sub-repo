import apiClient from '@/api/client';

/**
 * 팝업 관련 API 서비스
 */

/**
 * 팝업 목록 조회 (전체 목록)
 * GET /api/popups
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
 * GET /api/popups/search
 * @param {Object} params
 * @param {string} [params.keyword]
 * @param {number} [params.regionId]
 * @param {Array<number>} [params.categoryIds]
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @param {string} [params.approvalStatus]
 * @param {number} [params.page=0]
 * @param {number} [params.size=20]
 * @returns {Promise<Object>} { content: [], totalPages: 0, totalElements: 0, ... }
 */
export const searchPopups = async (params = {}) => {
  try {
    // 배열 파라미터 처리 (예: categoryIds)를 위해 paramsSerializer 등을 사용할 수도 있지만
    // axios는 기본적으로 배열을 categoryIds[]=1&categoryIds[]=2 형태로 보냄
    // Spring Boot는 이를 잘 처리함.
    // 만약 categoryIds=1,2 형태로 보내야 한다면 qs 라이브러리 필요.
    // 여기서는 기본 동작 사용.
    const response = await apiClient.get('/popups/search', { params });
    return response || { content: [], totalPages: 0, totalElements: 0 };
  } catch (error) {
    console.error('Failed to search popups:', error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
};

/**
 * 팝업 상세 조회
 * GET /api/popups/{popupId}
 * @param {number} popupId 
 * @returns {Promise<Object>}
 */
export const getPopupById = async (popupId) => {
  const response = await apiClient.get(`/popups/${popupId}`);
  return response;
};

/**
 * 팝업 리뷰 목록 조회
 * GET /api/popups/{popupId}/reviews
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
 * POST /api/popups/{popupId}/reviews
 * @param {number} popupId 
 * @param {Object} reviewData - { rating, content, imageUrls }
 * @returns {Promise<Object>}
 */
export const createReview = async (popupId, reviewData) => {
  const response = await apiClient.post(`/popups/${popupId}/reviews`, reviewData);
  return response;
};
