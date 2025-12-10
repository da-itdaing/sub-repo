import apiClient from '@/api/client';

/**
 * 인증 관련 API 서비스
 */

/**
 * 로그인
 * POST /api/auth/login
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
 * POST /api/auth/signup/consumer
 * @param {Object} data - SignupConsumerRequest
 * @returns {Promise<{userId: number, email: string, role: string}>}
 */
export const signupConsumer = async (data) => {
  const response = await apiClient.post('/auth/signup/consumer', data);
  return response;
};

/**
 * 판매자 회원가입
 * POST /api/auth/signup/seller
 * @param {Object} data - SignupSellerRequest
 * @returns {Promise<{userId: number, email: string, role: string}>}
 */
export const signupSeller = async (data) => {
  const response = await apiClient.post('/auth/signup/seller', data);
  return response;
};

/**
 * 로그아웃
 * POST /api/auth/logout
 * @param {string} refreshToken 
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken) => {
  await apiClient.post('/auth/logout', { refreshToken });
};

/**
 * 토큰 갱신
 * POST /api/auth/refresh
 * @param {string} refreshToken 
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response;
};

/**
 * 내 프로필 조회
 * GET /api/users/me
 * @returns {Promise<{id: number, email: string, name: string, nickname: string, role: string}>}
 */
export const getMyProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response;
};

/**
 * 내 프로필 수정 (소비자용 - 임시)
 * 현재 백엔드에 소비자용 프로필 수정 API(/api/users/me PUT 등)가 명세되어 있지 않음.
 * 판매자는 sellerService의 updateSellerProfile을 사용해야 함.
 */
export const updateMyProfile = async (payload) => {
  // TODO: 백엔드 API 확인 필요 (현재 /api/users/me PUT 없음)
  // 소비자 프로필 수정 기능 구현 시 백엔드 엔드포인트 요청 필요.
  try {
    // 혹시라도 있을지 모를 엔드포인트 시도 (404 예상)
    const response = await apiClient.put('/users/me', payload);
    return response;
  } catch (error) {
    console.warn('updateMyProfile failed: API endpoint might be missing.');
    throw error; 
  }
};

export const deleteMyAccount = async () => {
  // openapi.json에 DELETE /users/me 없음. 확인 필요.
  await apiClient.delete('/users/me');
};

/**
 * 소비자 선호 정보 조회 (openapi.json에 없음 - 확인 필요)
 */
export const getMyPreferences = async () => {
  const response = await apiClient.get('/consumers/me/preferences');
  return response;
};

/**
 * 소비자 선호 정보 수정 (openapi.json에 없음 - 확인 필요)
 */
export const updateMyPreferences = async (payload) => {
  await apiClient.put('/consumers/me/preferences', payload);
};

/**
 * 비밀번호 변경 (추정 엔드포인트)
 * @param {{currentPassword: string, newPassword: string}} payload
 */
export const changePassword = async (payload) => {
  const response = await apiClient.post('/auth/password/change', payload);
  return response;
};

// ============ 카카오 OAuth ============

/**
 * 카카오 로그인 URL 조회
 * GET /api/auth/kakao/login-url
 * @param {string} role - consumer 또는 seller
 * @returns {Promise<{data: {authUrl: string}}>}
 */
export const getKakaoLoginUrl = async (role = 'consumer') => {
  const response = await apiClient.get(`/auth/kakao/login-url?role=${role}`);
  return response.data;
};

/**
 * 카카오 로그인 처리
 * POST /api/auth/kakao/login
 * @param {string} code - 카카오 인가 코드
 * @param {string} role - consumer 또는 seller
 * @returns {Promise<{isNewUser: boolean, tempToken?: string, accessToken?: string, ...}>}
 */
export const kakaoLogin = async (code, role) => {
  const response = await apiClient.post('/auth/kakao/login', { code, role });
  return response.data || response;
};

/**
 * 카카오 소비자 회원가입 완료
 * POST /api/auth/kakao/complete/consumer
 * @param {Object} data - tempToken, ageGroup, interestCategoryIds, styleIds, regionIds, featureIds
 * @returns {Promise<{accessToken: string, refreshToken: string, ...}>}
 */
export const completeKakaoConsumer = async (data) => {
  const response = await apiClient.post('/auth/kakao/complete/consumer', data);
  return response.data || response;
};

/**
 * 카카오 판매자 회원가입 완료
 * POST /api/auth/kakao/complete/seller
 * @param {Object} data - tempToken, activityRegion, snsUrl?, introduction?
 * @returns {Promise<{accessToken: string, refreshToken: string, ...}>}
 */
export const completeKakaoSeller = async (data) => {
  const response = await apiClient.post('/auth/kakao/complete/seller', data);
  return response.data || response;
};
