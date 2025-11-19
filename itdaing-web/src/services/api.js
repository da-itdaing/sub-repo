import axios from 'axios';
import { getAccessToken, clearTokens } from '../utils/tokenStorage';

// 개발 환경에서는 Vite proxy를 사용하기 위해 항상 상대 경로 사용
// Vite proxy가 /api 요청을 http://localhost:8080으로 전달
const API_BASE_URL = '/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 요청 인터셉터: JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network Error 처리 (서버 응답이 없는 경우)
    if (!error.response) {
      // 요청이 취소된 경우는 그대로 전달
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        const networkError = new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        networkError.name = 'NetworkError';
        networkError.code = error.code;
        return Promise.reject(networkError);
      }
      // 기타 네트워크 에러
      const networkError = new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
      networkError.name = 'NetworkError';
      networkError.originalError = error;
      return Promise.reject(networkError);
    }
    
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      clearTokens();
      // 로그인 페이지로 리다이렉트 (라우터 사용 시)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * 카카오맵 API 키 가져오기
 * @returns {Promise<string>} Kakao Map API Key
 */
export async function getKakaoMapKey() {
  const response = await apiClient.get('/config/map-key');
  if (response.data?.success && response.data.data) {
    return response.data.data.kakaoMapAppKey;
  }
  throw new Error('Kakao Map API 키를 불러올 수 없습니다.');
}
