import apiClient from '@/api/client';

/**
 * 위시리스트 관련 API 서비스
 */

/**
 * 내 위시리스트 목록을 페이지 형태로 조회합니다.
 * @param {{page?: number, size?: number}} params
 * @returns {Promise<{content: Array, totalPages: number, totalElements: number, number: number}>}
 */
export const getMyWishlist = async (params = {}) => {
  const response = await apiClient.get('/wishlist', { params });
  return response;
};

/**
 * 팝업을 위시리스트에 추가합니다.
 * @param {number} popupId
 */
export const addToWishlist = async (popupId) => {
  await apiClient.post('/wishlist', null, { params: { popupId } });
};

/**
 * 위시리스트에서 팝업을 제거합니다.
 * @param {number} popupId
 */
export const removeFromWishlist = async (popupId) => {
  await apiClient.delete(`/wishlist/${popupId}`);
};
