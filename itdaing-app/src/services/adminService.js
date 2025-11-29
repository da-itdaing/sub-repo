/**
 * 관리자 전용 API 서비스
 * - 승인 관리 (팝업 승인/거부)
 * - 사용자 관리 (소비자/판매자 조회, 상태 변경)
 * - 대시보드 통계
 * 
 * 주의: apiClient interceptor가 response.data.data를 자동 언래핑하므로
 *       response 자체가 이미 data 객체임
 */

import apiClient from '@/api/client';

const BASE_URL = '/admin';

/* ============ 승인 관리 API ============ */

/**
 * 승인 대기 목록 조회
 * @param {Object} params - { page, size }
 * @returns {Promise<{items: Array, totalElements: number, totalPages: number, page: number, size: number}>}
 */
export const listPendingApprovals = async ({ page = 0, size = 20 } = {}) => {
  // apiClient interceptor가 response.data.data를 반환하므로 그대로 사용
  const data = await apiClient.get(`${BASE_URL}/approvals`, {
    params: { page, size },
  });
  return data;
};

/**
 * 팝업 승인 처리
 * @param {number} id - 승인 대상 ID
 * @param {Object} data - { reason } (선택)
 * @returns {Promise<Object>}
 */
export const approvePopup = async (id, requestData = {}) => {
  const data = await apiClient.post(`${BASE_URL}/approvals/${id}/approve`, requestData);
  return data;
};

/**
 * 팝업 거부 처리
 * @param {number} id - 승인 대상 ID
 * @param {Object} data - { reason } (필수)
 * @returns {Promise<Object>}
 */
export const rejectPopup = async (id, requestData) => {
  const data = await apiClient.post(`${BASE_URL}/approvals/${id}/reject`, requestData);
  return data;
};

/* ============ 사용자 관리 API ============ */

/**
 * 사용자 목록 조회 (관리자)
 * @param {Object} params - { role: 'CONSUMER'|'SELLER', status, page, size }
 * @returns {Promise<{content: Array, totalElements: number, totalPages: number, ...}>}
 */
export const listUsers = async ({ role, status, page = 0, size = 20 } = {}) => {
  const params = { role, page, size };
  if (status) {
    params.status = status;
  }
  const data = await apiClient.get(`${BASE_URL}/users`, { params });
  return data;
};

/**
 * 사용자 상태 변경 (관리자)
 * @param {number} userId - 사용자 ID
 * @param {string} status - 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN'
 * @returns {Promise<Object>}
 */
export const updateUserStatus = async (userId, status) => {
  const data = await apiClient.patch(`${BASE_URL}/users/${userId}/status`, { status });
  return data;
};

/* ============ 대시보드 통계 API ============ */

/**
 * 관리자 대시보드 통계 조회
 * 백엔드에 해당 엔드포인트가 없을 경우 프론트에서 계산
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async () => {
  try {
    // 승인 대기 목록에서 통계 계산
    const approvals = await listPendingApprovals({ page: 0, size: 100 });
    
    // 사용자 수 조회
    const consumers = await listUsers({ role: 'CONSUMER', page: 0, size: 1 });
    const sellers = await listUsers({ role: 'SELLER', page: 0, size: 1 });
    
    return {
      totalUsers: (consumers?.totalElements || 0) + (sellers?.totalElements || 0),
      totalConsumers: consumers?.totalElements || 0,
      totalSellers: sellers?.totalElements || 0,
      pendingApprovals: approvals?.totalElements || 0,
      approvalItems: approvals?.items || [],
    };
  } catch (error) {
    console.error('대시보드 통계 조회 실패:', error);
    return {
      totalUsers: 0,
      totalConsumers: 0,
      totalSellers: 0,
      pendingApprovals: 0,
      approvalItems: [],
    };
  }
};

/* ============ 팝업 관리 API (관리자용) ============ */

/**
 * 전체 팝업 목록 조회 (관리자)
 * @param {Object} params - { keyword, regionId, categoryIds, startDate, endDate, approvalStatus, page, size }
 * @returns {Promise<{content: Array, totalElements: number, totalPages: number, ...}>}
 */
export const listAllPopups = async (params = {}) => {
  const data = await apiClient.get('/popups/search', { params });
  return data;
};

/**
 * 팝업 상세 조회 (관리자)
 * @param {number} popupId - 팝업 ID
 * @returns {Promise<Object>}
 */
export const getPopupDetail = async (popupId) => {
  const data = await apiClient.get(`/popups/${popupId}`);
  return data;
};

export default {
  listPendingApprovals,
  approvePopup,
  rejectPopup,
  listUsers,
  updateUserStatus,
  getDashboardStats,
  listAllPopups,
  getPopupDetail,
};
