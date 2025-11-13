import apiClient, { ApiResponse } from './api';

// 마스터 데이터 타입 정의
export interface Region {
  id: number;
  name: string;
}

export interface Style {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Feature {
  id: number;
  name: string;
}

// 마스터 데이터 서비스
export const masterService = {
  // 지역 목록 조회
  async getRegions(): Promise<Region[]> {
    const response = await apiClient.get<ApiResponse<Region[]>>('/master/regions');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  // 스타일 목록 조회
  async getStyles(): Promise<Style[]> {
    const response = await apiClient.get<ApiResponse<Style[]>>('/master/styles');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  // 카테고리 목록 조회
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/master/categories');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  // 특징(편의사항) 목록 조회
  async getFeatures(): Promise<Feature[]> {
    const response = await apiClient.get<ApiResponse<Feature[]>>('/master/features');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },
};

