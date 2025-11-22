import apiClient from './api';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated as checkAuthenticated,
} from '../utils/tokenStorage';

const ERROR_MESSAGES = {
  loginFailed: '로그인에 실패했습니다.',
  signupFailed: '회원가입에 실패했습니다.',
  profileFailed: '프로필 조회에 실패했습니다.',
  logoutFailed: '로그아웃에 실패했습니다.',
  refreshFailed: '토큰 재발급에 실패했습니다.',
  missingRefresh: 'Refresh token이 없습니다.',
};

function ensureSuccess(response, fallbackMessage) {
  if (response?.data?.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response?.data?.error?.message || fallbackMessage);
}

function formatError(error, fallbackMessage) {
  // Network Error 처리
  if (error?.name === 'NetworkError' || error?.message === 'Network Error' || !error?.response) {
    const networkError = new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    networkError.fieldErrors = null;
    return networkError;
  }
  
  const errorData = error?.response?.data?.error;
  const serverMessage = errorData?.message || fallbackMessage;
  const fieldErrors = errorData?.fieldErrors || null;
  
  const formattedError = new Error(serverMessage);
  formattedError.fieldErrors = fieldErrors;
  formattedError.status = error?.response?.status;
  formattedError.code = errorData?.code;
  
  return formattedError;
}

export const authService = {
  async login(request) {
    try {
      const response = await apiClient.post('/auth/login', request);
      const data = ensureSuccess(response, ERROR_MESSAGES.loginFailed);
      setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.loginFailed);
    }
  },

  async signupConsumer(request) {
    try {
      const response = await apiClient.post('/auth/signup/consumer', request);
      return ensureSuccess(response, ERROR_MESSAGES.signupFailed);
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.signupFailed);
    }
  },

  async signupSeller(request) {
    try {
      const response = await apiClient.post('/auth/signup/seller', request);
      return ensureSuccess(response, ERROR_MESSAGES.signupFailed);
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.signupFailed);
    }
  },

  async getMyProfile() {
    try {
      const response = await apiClient.get('/users/me');
      return ensureSuccess(response, ERROR_MESSAGES.profileFailed);
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.profileFailed);
    }
  },

  async logout() {
    const refreshToken = getRefreshToken();
    try {
      await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch (error) {
      // 로그아웃 실패해도 토큰은 제거
    } finally {
      clearTokens();
    }
  },

  async refreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error(ERROR_MESSAGES.missingRefresh);
    }

    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      const data = ensureSuccess(response, ERROR_MESSAGES.refreshFailed);
      setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      throw formatError(error, ERROR_MESSAGES.refreshFailed);
    }
  },

  isAuthenticated() {
    return checkAuthenticated();
  },

  getAccessToken() {
    return getAccessToken();
  },
};

export const signupConsumer = (request) => authService.signupConsumer(request);
export const signupSeller = (request) => authService.signupSeller(request);
