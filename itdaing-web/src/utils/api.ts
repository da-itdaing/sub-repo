/**
 * API 클라이언트 유틸리티
 * 백엔드 API와 통신하는 공통 함수들
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

/**
 * API 요청 옵션
 */
interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * JWT 토큰을 가져옵니다
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * JWT 토큰을 저장합니다
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

/**
 * JWT 토큰을 제거합니다
 */
export function removeAuthToken(): void {
  localStorage.removeItem('accessToken');
}

/**
 * API 요청을 보냅니다
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = false, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

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

    const data: ApiResponse<T> = await response.json();

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
export async function get<T>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'GET',
    requireAuth,
  });
}

/**
 * POST 요청
 */
export async function post<T>(
  endpoint: string,
  body?: unknown,
  requireAuth = false
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    requireAuth,
  });
}

/**
 * PUT 요청
 */
export async function put<T>(
  endpoint: string,
  body?: unknown,
  requireAuth = false
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    requireAuth,
  });
}

/**
 * PATCH 요청
 */
export async function patch<T>(
  endpoint: string,
  body?: unknown,
  requireAuth = false
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    requireAuth,
  });
}

/**
 * DELETE 요청
 */
export async function del<T>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'DELETE',
    requireAuth,
  });
}

