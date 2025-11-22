import apiClient from '@/api/client';

/**
 * 인증 관련 API 서비스
 */

/**
 * 로그인
 * @param {string} loginId 
 * @param {string} password 
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const login = async (loginId, password) => {
  const response = await apiClient.post('/auth/login', {
    loginId,
    password,
  });
  return response;
};

/**
 * 소비자 회원가입
 * @param {Object} data - 회원가입 데이터
 * @returns {Promise<{userId: number, email: string, role: string}>}
 */
export const signupConsumer = async (data) => {
  const response = await apiClient.post('/auth/signup/consumer', data);
  return response;
};

/**
 * 판매자 회원가입
 * @param {Object} data - 회원가입 데이터
 * @returns {Promise<{userId: number, email: string, role: string}>}
 */
export const signupSeller = async (data) => {
  const response = await apiClient.post('/auth/signup/seller', data);
  return response;
};

/**
 * 로그아웃
 * @param {string} refreshToken 
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken) => {
  await apiClient.post('/auth/logout', { refreshToken });
};

/**
 * 토큰 갱신
 * @param {string} refreshToken 
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response;
};

/**
 * 내 프로필 조회
 * @returns {Promise<{id: number, email: string, name: string, nickname: string, role: string}>}
 */
export const getMyProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response;
};

