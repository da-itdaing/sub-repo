import apiClient, { ApiResponse } from './api';

// ============ Area Types ============

export interface AreaResponse {
  id: number;
  name: string;
  polygonGeoJson: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'HIDDEN';
  maxCapacity?: number;
  notice?: string;
  regionId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AreaListResponse {
  items: AreaResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface CreateAreaRequest {
  name: string;
  polygonGeoJson: string;
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'HIDDEN';
  maxCapacity?: number;
  notice?: string;
  regionId?: number;
}

export interface UpdateAreaRequest {
  name?: string;
  polygonGeoJson?: string;
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'HIDDEN';
  maxCapacity?: number;
  notice?: string;
  regionId?: number;
}

// ============ Zone Types ============

export interface ZoneResponse {
  id: number;
  areaId: number;
  ownerId: number;
  label?: string;
  detailedAddress?: string;
  lat: number;
  lng: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  maxCapacity?: number;
  notice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ZoneListResponse {
  items: ZoneResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface CreateZoneRequest {
  areaId: number;
  ownerId: number;  // 필수: 소유자(판매자) ID (관리자가 지정)
  label?: string;
  detailedAddress?: string;
  lat: number;
  lng: number;
  maxCapacity?: number;
  notice?: string;
}

// ============ Cell Types ============

export interface CellResponse {
  id: number;
  areaId: number;
  areaName: string;
  ownerId: number;
  ownerLoginId: string;
  label?: string;
  detailedAddress?: string;
  lat: number;
  lng: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  maxCapacity?: number;
  notice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CellListResponse {
  items: CellResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface CreateCellRequest {
  areaId: number;
  ownerId: number;
  label?: string;
  detailedAddress?: string;
  lat: number;
  lng: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  maxCapacity?: number;
  notice?: string;
}

export interface UpdateCellRequest {
  areaId?: number;
  ownerId?: number;
  label?: string;
  detailedAddress?: string;
  lat?: number;
  lng?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  maxCapacity?: number;
  notice?: string;
}

// ============ Geo Service ============

export const geoService = {
  // ============ Area APIs ============
  
  async getAreas(keyword?: string, page = 0, size = 20): Promise<AreaListResponse> {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get<ApiResponse<AreaListResponse>>(
      `/geo/areas?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '구역 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  async getAreaById(areaId: number): Promise<AreaResponse> {
    const response = await apiClient.get<ApiResponse<AreaResponse>>(`/geo/areas/${areaId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '구역 정보를 불러오지 못했습니다.';
    throw new Error(message);
  },

  async createArea(request: CreateAreaRequest): Promise<AreaResponse> {
    const response = await apiClient.post<ApiResponse<AreaResponse>>('/geo/areas', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '구역 생성에 실패했습니다.';
    throw new Error(message);
  },

  async updateArea(areaId: number, request: UpdateAreaRequest): Promise<AreaResponse> {
    const response = await apiClient.put<ApiResponse<AreaResponse>>(
      `/geo/areas/${areaId}`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '구역 수정에 실패했습니다.';
    throw new Error(message);
  },

  async deleteArea(areaId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/geo/areas/${areaId}`);
    if (!response.data.success) {
      const message = response.data.error?.message ?? '구역 삭제에 실패했습니다.';
      throw new Error(message);
    }
  },

  // ============ Zone APIs ============

  async getZones(areaId?: number, page = 0, size = 20): Promise<ZoneListResponse> {
    const params = new URLSearchParams();
    if (areaId) params.append('areaId', areaId.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get<ApiResponse<ZoneListResponse>>(
      `/geo/zones?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '존 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  async getMyZones(page = 0, size = 20): Promise<ZoneListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get<ApiResponse<ZoneListResponse>>(
      `/geo/zones/me?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '내 존 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  async createZone(request: CreateZoneRequest): Promise<ZoneResponse> {
    const response = await apiClient.post<ApiResponse<ZoneResponse>>('/geo/zones', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '존 생성에 실패했습니다.';
    throw new Error(message);
  },

  async updateZoneStatus(zoneId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'): Promise<void> {
    const response = await apiClient.patch<ApiResponse<void>>(
      `/geo/zones/${zoneId}/status`,
      { status }
    );
    if (!response.data.success) {
      const message = response.data.error?.message ?? '존 상태 변경에 실패했습니다.';
      throw new Error(message);
    }
  },

  // ============ Cell APIs ============

  async getCells(
    areaId?: number,
    ownerId?: number,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN',
    page = 0,
    size = 20
  ): Promise<CellListResponse> {
    const params = new URLSearchParams();
    if (areaId) params.append('areaId', areaId.toString());
    if (ownerId) params.append('ownerId', ownerId.toString());
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get<ApiResponse<CellListResponse>>(
      `/geo/cells?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '셀 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  async getCellById(cellId: number): Promise<CellResponse> {
    const response = await apiClient.get<ApiResponse<CellResponse>>(`/geo/cells/${cellId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '셀 정보를 불러오지 못했습니다.';
    throw new Error(message);
  },

  async createCell(request: CreateCellRequest): Promise<CellResponse> {
    const response = await apiClient.post<ApiResponse<CellResponse>>('/geo/cells', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '셀 생성에 실패했습니다.';
    throw new Error(message);
  },

  async updateCell(cellId: number, request: UpdateCellRequest): Promise<CellResponse> {
    const response = await apiClient.put<ApiResponse<CellResponse>>(
      `/geo/cells/${cellId}`,
      request
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '셀 수정에 실패했습니다.';
    throw new Error(message);
  },

  async deleteCell(cellId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/geo/cells/${cellId}`);
    if (!response.data.success) {
      const message = response.data.error?.message ?? '셀 삭제에 실패했습니다.';
      throw new Error(message);
    }
  },
};

