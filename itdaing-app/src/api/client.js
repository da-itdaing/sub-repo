import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/tokenStorage';

// Vite proxy를 사용하기 위해 상대 경로 사용
// Vite proxy가 /api 요청을 http://localhost:8080으로 전달
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 응답 언래핑 및 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // response.data.data 언래핑
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 처리: Silent Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Refresh Token으로 새 토큰 발급
        const response = await axios.post(
          '/api/auth/refresh',
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (response.data?.success && response.data?.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          setTokens(accessToken, newRefreshToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh 실패 시 로그아웃 처리
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 에러 응답 처리
    if (error.response?.data) {
      const { success, error: errorData } = error.response.data;
      if (!success && errorData) {
        const customError = new Error(errorData.message || 'API 요청 실패');
        customError.code = errorData.code;
        customError.status = errorData.status;
        customError.fieldErrors = errorData.fieldErrors;
        return Promise.reject(customError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

