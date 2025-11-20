/**
 * API 클라이언트 유틸리티
 * 백엔드 API와 통신하는 공통 함수들
 */

// 개발 환경에서는 Vite proxy를 사용하기 위해 항상 상대 경로 사용
const API_BASE_URL = '/api';
const API_DISABLED = import.meta.env.VITE_API_DISABLED === 'true';

import { getAccessToken, setAccessToken, clearTokens } from './tokenStorage';

/**
 * JWT 토큰을 가져옵니다
 * @deprecated tokenStorage.getAccessToken()을 사용하세요
 */
export function getAuthToken() {
  return getAccessToken();
}

/**
 * JWT 토큰을 저장합니다
 * @deprecated tokenStorage.setAccessToken()을 사용하세요
 */
export function setAuthToken(token) {
  setAccessToken(token);
}

/**
 * JWT 토큰을 제거합니다
 * @deprecated tokenStorage.clearTokens()을 사용하세요
 */
export function removeAuthToken() {
  clearTokens();
}

/**
 * API 요청을 보냅니다
 */
async function request(endpoint, options = {}) {
  const { requireAuth = false, ...fetchOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (API_DISABLED) {
    console.warn('[API disabled] 요청을 무시하고 mock 응답을 반환합니다.', endpoint);
    return {
      success: true,
      mock: true,
      endpoint,
      data: null,
      message: '백엔드 비활성화 상태, UI 디벨롭 용 mock 응답입니다.',
    };
  }

  // 인증이 필요한 경우 토큰 추가
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    // 401 Unauthorized인 경우 토큰 제거
    if (response.status === 401) {
      removeAuthToken();
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: {
        status: 0,
        code: 'NETWORK_ERROR',
        message: '네트워크 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * GET 요청
 */
export async function get(endpoint, requireAuth = false) {
  return request(endpoint, {
    method: 'GET',
    requireAuth,
  });
}

/**
 * POST 요청
 */
export async function post(endpoint, body, requireAuth = false) {
  return request(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    requireAuth,
  });
}

/**
 * PUT 요청
 */
export async function put(endpoint, body, requireAuth = false) {
  return request(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    requireAuth,
  });
}

/**
 * PATCH 요청
 */
export async function patch(endpoint, body, requireAuth = false) {
  return request(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    requireAuth,
  });
}

/**
 * DELETE 요청
 */
export async function del(endpoint, requireAuth = false) {
  return request(endpoint, {
    method: 'DELETE',
    requireAuth,
  });
}

