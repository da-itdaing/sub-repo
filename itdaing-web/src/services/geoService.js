import apiClient from './api';

/**
 * 지리 정보(존/셀) 관련 API 서비스
 */
export const geoService = {
  /**
   * 존(ZoneArea) 목록 조회
   */
  async getAreas(keyword = null, page = 0, size = 20) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get(`/geo/areas?${params.toString()}`);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    return { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  },

  /**
   * 존(ZoneArea) 상세 조회
   */
  async getArea(areaId) {
    const response = await apiClient.get(`/geo/areas/${areaId}`);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    return null;
  },

  /**
   * 존(ZoneArea) 생성 (관리자 전용)
   */
  async createArea(areaData) {
    const response = await apiClient.post('/geo/areas', areaData);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || '존 생성에 실패했습니다.');
  },

  /**
   * 존(ZoneArea) 수정 (관리자 전용)
   */
  async updateArea(areaId, areaData) {
    const response = await apiClient.put(`/geo/areas/${areaId}`, areaData);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || '존 수정에 실패했습니다.');
  },

  /**
   * 존(ZoneArea) 삭제 (관리자 전용)
   */
  async deleteArea(areaId) {
    const response = await apiClient.delete(`/geo/areas/${areaId}`);
    if (response.data?.success) {
      return true;
    }
    throw new Error(response.data?.error?.message || '존 삭제에 실패했습니다.');
  },

  /**
   * 셀(ZoneCell) 목록 조회
   */
  async getCells(areaId = null, ownerId = null, status = null, page = 0, size = 20) {
    const params = new URLSearchParams();
    if (areaId) params.append('areaId', areaId.toString());
    if (ownerId) params.append('ownerId', ownerId.toString());
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get(`/geo/cells?${params.toString()}`);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    return { items: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  },

  /**
   * 셀(ZoneCell) 상세 조회
   */
  async getCell(cellId) {
    const response = await apiClient.get(`/geo/cells/${cellId}`);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    return null;
  },

  /**
   * 셀(ZoneCell) 생성 (관리자 전용)
   */
  async createCell(cellData) {
    const response = await apiClient.post('/geo/cells', cellData);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || '셀 생성에 실패했습니다.');
  },

  /**
   * 셀(ZoneCell) 수정 (관리자 전용)
   */
  async updateCell(cellId, cellData) {
    const response = await apiClient.put(`/geo/cells/${cellId}`, cellData);
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || '셀 수정에 실패했습니다.');
  },

  /**
   * 셀(ZoneCell) 삭제 (관리자 전용)
   */
  async deleteCell(cellId) {
    const response = await apiClient.delete(`/geo/cells/${cellId}`);
    if (response.data?.success) {
      return true;
    }
    throw new Error(response.data?.error?.message || '셀 삭제에 실패했습니다.');
  },

  /**
   * 존/셀 통합 조회 (ZoneQueryService 사용)
   */
  async getZones() {
    const response = await apiClient.get('/zones');
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },
};

