import apiClient, { ApiResponse } from './api';
import { PopupSummary } from '../types/popup';

export interface PopupCreateRequest {
  title: string;
  description?: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  operatingTime?: string;
  zoneCellId: number;
  categoryIds?: number[];
  targetCategoryIds?: number[];
  featureIds?: number[];
  styleIds?: number[];
  thumbnailImageUrl?: string;
  imageUrls?: string[];
}

export interface PopupUpdateRequest extends PopupCreateRequest {}

export interface PopupSearchParams {
  keyword?: string;
  regionId?: number;
  categoryIds?: number[];
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  page?: number;
  size?: number;
}

export interface PopupSearchResponse {
  content: PopupSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const popupService = {
  // 팝업 목록 조회
  async getPopups(): Promise<PopupSummary[]> {
    const response = await apiClient.get<ApiResponse<PopupSummary[]>>('/popups');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '팝업 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 팝업 상세 조회
  async getPopupById(popupId: number): Promise<PopupSummary> {
    const response = await apiClient.get<ApiResponse<PopupSummary>>(`/popups/${popupId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '팝업 정보를 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 팝업 등록
  async createPopup(request: PopupCreateRequest): Promise<PopupSummary> {
    const response = await apiClient.post<ApiResponse<PopupSummary>>('/popups', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '팝업 등록에 실패했습니다.';
    throw new Error(message);
  },

  // 팝업 수정
  async updatePopup(popupId: number, request: PopupUpdateRequest): Promise<PopupSummary> {
    const response = await apiClient.put<ApiResponse<PopupSummary>>(`/popups/${popupId}`, request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '팝업 수정에 실패했습니다.';
    throw new Error(message);
  },

  // 팝업 삭제
  async deletePopup(popupId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/popups/${popupId}`);
    if (!response.data.success) {
      const message = response.data.error?.message ?? '팝업 삭제에 실패했습니다.';
      throw new Error(message);
    }
  },

  // 팝업 검색
  async searchPopups(params: PopupSearchParams): Promise<PopupSearchResponse> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.regionId) queryParams.append('regionId', params.regionId.toString());
    if (params.categoryIds && params.categoryIds.length > 0) {
      params.categoryIds.forEach(id => queryParams.append('categoryIds', id.toString()));
    }
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.approvalStatus) queryParams.append('approvalStatus', params.approvalStatus);
    queryParams.append('page', (params.page ?? 0).toString());
    queryParams.append('size', (params.size ?? 20).toString());

    const response = await apiClient.get<ApiResponse<PopupSearchResponse>>(`/popups/search?${queryParams.toString()}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '팝업 검색에 실패했습니다.';
    throw new Error(message);
  },
};

