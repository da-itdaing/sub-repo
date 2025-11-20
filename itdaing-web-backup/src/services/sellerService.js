import apiClient from './api';

const ERROR_MESSAGES = {
  profileLoadFailed: '프로필 조회에 실패했습니다.',
  profileUpdateFailed: '프로필 수정에 실패했습니다.',
};

function ensureSuccess(response, fallbackMessage) {
  if (response?.data?.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response?.data?.error?.message || fallbackMessage);
}

function formatError(error, fallbackMessage) {
  const serverMessage = error?.response?.data?.error?.message;
  if (serverMessage) {
    return new Error(serverMessage);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
}

export const sellerService = {
  /**
   * 내 판매자 프로필 조회
   */
  async getMyProfile() {
    try {
      const response = await apiClient.get('/sellers/me/profile');
      return ensureSuccess(response, ERROR_MESSAGES.profileLoadFailed);
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.profileLoadFailed);
    }
  },

  async getMyDashboard() {
    try {
      const response = await apiClient.get('/sellers/me/dashboard');
      return ensureSuccess(response, ERROR_MESSAGES.profileLoadFailed);
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.profileLoadFailed);
    }
  },

  /**
   * 내 판매자 프로필 수정
   * @param {Object} request - 프로필 수정 요청
   * @param {Object} request.profileImage - ImagePayload (url, key)
   * @param {string} request.introduction - 소개
   * @param {string} request.activityRegion - 활동 지역
   * @param {string} request.snsUrl - SNS URL
   */
  async updateMyProfile(request) {
    try {
      const response = await apiClient.put('/sellers/me/profile', request);
      return ensureSuccess(response, ERROR_MESSAGES.profileUpdateFailed);
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.profileUpdateFailed);
    }
  },
};

