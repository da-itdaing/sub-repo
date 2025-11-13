import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API 기본 URL 설정
// - 기본값: '/api' (Vite dev 프록시 및 동일 오리진 배포 모두 호환)
// - 환경변수 VITE_API_BASE_URL이 설정되면 해당 값을 우선 사용
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 요청 인터셉터: JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // removed debug: login request body logging
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 재시도 로직 헬퍼 함수
async function retryRequest(
  requestFn: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      // 401, 403, 404 등 재시도 불가능한 에러는 즉시 반환
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
        throw error;
      }
      // 마지막 시도가 아니면 대기 후 재시도
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError;
}

// 응답 인터셉터: 에러 처리 및 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 네트워크 에러 또는 타임아웃인 경우 재시도
    if (!error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
      // 재시도는 요청 레벨에서 처리하도록 함
      console.error('Network error detected:', error.message);
    }

    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // 로그인 페이지로 리다이렉트 (라우터 사용 시)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 에러 응답 형식 정규화
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data as any;
      if (errorData.error) {
        // 이미 표준 형식인 경우 그대로 반환
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// 재시도 가능한 요청을 위한 래퍼 함수
export async function apiRequestWithRetry<T>(
  requestFn: () => Promise<{ data: ApiResponse<T> }>,
  maxRetries: number = 3
): Promise<{ data: ApiResponse<T> }> {
  return retryRequest(requestFn, maxRetries);
}

export default apiClient;

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: Array<{
      field: string;
      value: string;
      reason: string;
    }>;
  };
}

