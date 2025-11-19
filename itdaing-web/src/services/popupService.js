import apiClient from './api';

/**
 * 팝업 관련 API 서비스
 */
export const popupService = {
  /**
   * 공개 팝업 목록 조회 (전체 사용자)
   */
  async getPublicPopups() {
    try {
      const response = await apiClient.get('/popups');
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch public popups:', error);
      throw error;
    }
  },

  /**
   * 팝업 상세 조회
   */
  async getPopup(popupId) {
    try {
      const response = await apiClient.get(`/popups/${popupId}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch popup ${popupId}:`, error);
      throw error;
    }
  },

  /**
   * 판매자 본인의 팝업 목록 조회 (인증 필요)
   */
  async getMyPopups() {
    try {
      const response = await apiClient.get('/sellers/me/popups');
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch my popups:', error);
      throw error;
    }
  },

  /**
   * 팝업 생성 (판매자 전용)
   */
  async createPopup(popupData) {
    try {
      const response = await apiClient.post('/popups', popupData);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.error?.message || '팝업 생성에 실패했습니다.');
    } catch (error) {
      console.error('Failed to create popup:', error);
      throw error;
    }
  },

  /**
   * 팝업 수정 (판매자 전용)
   */
  async updatePopup(popupId, popupData) {
    try {
      const response = await apiClient.put(`/popups/${popupId}`, popupData);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.error?.message || '팝업 수정에 실패했습니다.');
    } catch (error) {
      console.error(`Failed to update popup ${popupId}:`, error);
      throw error;
    }
  },

  /**
   * 팝업 삭제 (판매자 전용)
   */
  async deletePopup(popupId) {
    try {
      const response = await apiClient.delete(`/popups/${popupId}`);
      if (response.data?.success) {
        return true;
      }
      throw new Error(response.data?.error?.message || '팝업 삭제에 실패했습니다.');
    } catch (error) {
      console.error(`Failed to delete popup ${popupId}:`, error);
      throw error;
    }
  },
};
