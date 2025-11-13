import apiClient, { ApiResponse } from './api';
import { PopupSummary } from '../types/popup';
import { SellerProfile } from '../types/seller';
import { Seller } from './mockDataService';

export const sellerService = {
  async getMyProfile(): Promise<SellerProfile> {
    const response = await apiClient.get<ApiResponse<SellerProfile>>('/sellers/me/profile');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '판매자 프로필을 불러오지 못했습니다.';
    throw new Error(message);
  },

  async getMyPopups(): Promise<PopupSummary[]> {
    const response = await apiClient.get<ApiResponse<PopupSummary[]>>('/sellers/me/popups');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '판매자 팝업 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 판매자 목록 조회
  async getSellers(): Promise<Seller[]> {
    const response = await apiClient.get<ApiResponse<Seller[]>>('/sellers');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '판매자 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 판매자 상세 조회
  async getSellerById(sellerId: number): Promise<Seller> {
    const response = await apiClient.get<ApiResponse<Seller>>(`/sellers/${sellerId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '판매자 정보를 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 판매자 프로필 수정
  async updateProfile(request: {
    profileImageUrl?: string;
    introduction?: string;
    activityRegion?: string;
    snsUrl?: string;
  }): Promise<SellerProfile> {
    const response = await apiClient.put<ApiResponse<SellerProfile>>('/sellers/me/profile', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '판매자 프로필 수정에 실패했습니다.';
    throw new Error(message);
  },
};
