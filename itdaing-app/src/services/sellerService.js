import apiClient from '@/api/client';

/**
 * 판매자 대시보드 통계 조회
 * - 현재 openapi.json에 명시적인 /dashboard 엔드포인트가 없지만
 * - 프론트엔드 요구사항에 따라 추가. 백엔드 미구현 시 404 가능성 있음.
 */
export const getSellerDashboard = async () => {
  // TODO: 백엔드에 /api/sellers/me/dashboard 엔드포인트가 없는 경우
  // /api/sellers/me/popups 등을 호출하여 프론트에서 계산하거나 백엔드에 추가 요청 필요
  // 우선 기존 코드대로 유지하되, 추후 API 명세 확인 필요
  // (openapi.json에는 /sellers/me/popups, /sellers/me/profile만 존재)
  // 임시로 popups를 호출하여 리턴하거나, 실제 엔드포인트가 생기길 기대함.
  // 여기서는 기존과 동일하게 유지.
  return apiClient.get('/sellers/me/dashboard');
};

/**
 * 내 프로필 조회
 * GET /api/sellers/me/profile
 */
export const getSellerProfile = async () => {
  return apiClient.get('/sellers/me/profile');
};

/**
 * 내 프로필 수정
 * PUT /api/sellers/me/profile
 * @param {Object} data - { profileImageUrl, introduction, activityRegion, snsUrl }
 */
export const updateSellerProfile = async (data) => {
  return apiClient.put('/sellers/me/profile', data);
};

/**
 * 내 팝업 목록 조회
 * GET /api/sellers/me/popups
 */
export const getMyPopups = async () => {
  return apiClient.get('/sellers/me/popups');
};

/**
 * 팝업 등록 (판매자)
 * POST /api/popups
 * @param {Object} data - PopupCreateRequest
 */
export const createPopup = async (data) => {
  return apiClient.post('/popups', data);
};

/**
 * 팝업 수정 (판매자)
 * PUT /api/popups/{popupId}
 * @param {number} popupId
 * @param {Object} data - PopupCreateRequest
 */
export const updatePopup = async (popupId, data) => {
  return apiClient.put(`/popups/${popupId}`, data);
};

/**
 * 팝업 삭제 (판매자)
 * DELETE /api/popups/{popupId}
 * @param {number} popupId
 */
export const deletePopup = async (popupId) => {
  return apiClient.delete(`/popups/${popupId}`);
};

/**
 * 내가 생성한 Zone 목록 조회
 * GET /api/geo/zones/me
 * @param {number} page
 * @param {number} size
 */
export const getMyZones = async (page = 0, size = 20) => {
  return apiClient.get('/geo/zones/me', {
    params: { page, size },
  });
};

/**
 * 판매자 대시보드 데이터 조회
 * GET /api/sellers/me/dashboard
 * 백엔드에서 통계 및 팝업 요약 정보를 계산하여 반환
 */
export const getSellerDashboard = async () => {
  return apiClient.get('/sellers/me/dashboard');
};

/**
 * 내 팝업들의 리뷰 목록 조회 (판매자용)
 * GET /api/sellers/me/reviews
 * @param {number} page
 * @param {number} size
 */
export const getMyPopupReviews = async (page = 0, size = 20) => {
  return apiClient.get('/sellers/me/reviews', {
    params: { page, size },
  });
};

/**
 * 특정 팝업의 리뷰 목록 조회
 * GET /api/popups/{popupId}/reviews
 * @param {number} popupId
 */
export const getPopupReviews = async (popupId) => {
  return apiClient.get(`/popups/${popupId}/reviews`);
};

/* ======================== 공지사항 API ======================== */

/**
 * 내 공지사항 목록 조회
 * GET /api/sellers/me/notices
 * @param {number} page
 * @param {number} size
 */
export const getMyNotices = async (page = 0, size = 20) => {
  return apiClient.get('/sellers/me/notices', {
    params: { page, size },
  });
};

/**
 * 공지사항 상세 조회
 * GET /api/sellers/notices/{noticeId}
 * @param {string|number} noticeId
 */
export const getNoticeById = async (noticeId) => {
  return apiClient.get(`/sellers/notices/${noticeId}`);
};

/**
 * 공지사항 등록
 * POST /api/sellers/notices
 * @param {Object} data - { popupId, title, content, isImportant }
 */
export const createNotice = async (data) => {
  return apiClient.post('/sellers/notices', data);
};

/**
 * 공지사항 수정
 * PUT /api/sellers/notices/{noticeId}
 * @param {string|number} noticeId
 * @param {Object} data - { title, content, isImportant }
 */
export const updateNotice = async (noticeId, data) => {
  return apiClient.put(`/sellers/notices/${noticeId}`, data);
};

/**
 * 공지사항 삭제
 * DELETE /api/sellers/notices/{noticeId}
 * @param {string|number} noticeId
 */
export const deleteNotice = async (noticeId) => {
  return apiClient.delete(`/sellers/notices/${noticeId}`);
};

/**
 * 공지사항 다중 삭제
 * DELETE /api/sellers/notices
 * @param {Array<string|number>} ids
 */
export const deleteNotices = async (ids) => {
  return apiClient.delete('/sellers/notices', {
    data: { ids },
  });
};
