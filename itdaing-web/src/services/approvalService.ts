import apiClient, { ApiResponse } from './api';

// ============ Approval Types ============

export interface ApprovalItemResponse {
  id: number;
  targetType: 'POPUP';
  targetId: number;
  targetName: string;
  currentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  requesterLoginId: string;
  requesterId: number;
  requestedAt: string;
  description?: string;
}

export interface ApprovalListResponse {
  items: ApprovalItemResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ApprovalDecisionRequest {
  reason?: string;
}

export interface ApprovalDecisionResponse {
  approvalRecordId: number;
  targetType: 'POPUP';
  targetId: number;
  decision: 'APPROVE' | 'REJECT';
  reason?: string;
  processedAt: string;
}

// ============ Approval Service ============

export const approvalService = {
  // 승인 대기 목록 조회
  async getPendingApprovals(page = 0, size = 20): Promise<ApprovalListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get<ApiResponse<ApprovalListResponse>>(
      `/admin/approvals?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '승인 대기 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 승인 처리
  async approve(approvalId: number, reason?: string): Promise<ApprovalDecisionResponse> {
    const response = await apiClient.post<ApiResponse<ApprovalDecisionResponse>>(
      `/admin/approvals/${approvalId}/approve`,
      reason ? { reason } : {}
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '승인 처리에 실패했습니다.';
    throw new Error(message);
  },

  // 거부 처리
  async reject(approvalId: number, reason: string): Promise<ApprovalDecisionResponse> {
    const response = await apiClient.post<ApiResponse<ApprovalDecisionResponse>>(
      `/admin/approvals/${approvalId}/reject`,
      { reason }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '거부 처리에 실패했습니다.';
    throw new Error(message);
  },
};

