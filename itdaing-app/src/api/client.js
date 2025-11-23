import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/tokenStorage';

// 공개 API와 보호 API를 명확히 구분하기 위한 경로 목록
// 공개 API에는 Authorization 헤더를 붙이지 않도록 한다.
const PUBLIC_GET_PATHS = [
  '/popups',
  '/popups/',
  '/popups/search',
  '/master',
  '/zones',
  '/config',
  '/inquiries',
  '/dev',
  '/uploads',
];

// 401 처리 시 Refresh / 리디렉션을 수행하지 않을 공개/인증 관련 경로
const PUBLIC_OR_AUTH_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/refresh',
  '/config/map-key',
  '/popups',
  '/popups/',
  '/popups/search',
  '/master',
  '/zones',
  '/inquiries',
  '/dev',
  '/uploads',
];

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
    const method = (config.method || 'get').toLowerCase();
    const url = typeof config.url === 'string' ? config.url : '';

    // 공개 GET API에는 토큰을 붙이지 않는다.
    const isPublicGet =
      method === 'get' && PUBLIC_GET_PATHS.some((path) => url.startsWith(path));

    if (!isPublicGet) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    // 401 에러 처리: 공개 API와 보호 API를 구분하여 동작
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = typeof originalRequest.url === 'string' ? originalRequest.url : '';

      // 공개 API 및 인증 관련 엔드포인트는 Refresh / 리다이렉션을 하지 않는다.
      const isPublicOrAuthPath = PUBLIC_OR_AUTH_PATHS.some((path) => url.startsWith(path));
      if (isPublicOrAuthPath) {
        return Promise.reject(error);
      }

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
        // Refresh 실패 시 토큰 정리
        clearTokens();
        
        // 현재 페이지가 인증 필요한 페이지인지 확인
        const protectedPaths = ['/mypage', '/seller', '/admin'];
        const isProtectedPath = protectedPaths.some((path) =>
          window.location.pathname.startsWith(path)
        );
        
        // 인증 필요한 페이지에서만 로그인으로 리디렉션
        if (isProtectedPath) {
          window.location.href = '/login';
        }
        
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

