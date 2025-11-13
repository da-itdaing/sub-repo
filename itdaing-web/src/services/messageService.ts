import apiClient, { ApiResponse } from './api';
import {
  CreateInquiryRequest,
  CreateInquiryResponse,
  ReplyRequest,
  ThreadListResponse,
  ThreadDetailResponse,
  IdResponse,
} from '../types/message';

export const messageService = {
  // 스레드 생성 및 첫 메시지 전송
  async createThread(request: CreateInquiryRequest): Promise<CreateInquiryResponse> {
    const response = await apiClient.post<ApiResponse<CreateInquiryResponse>>('/inquiries', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '메시지 전송에 실패했습니다.';
    throw new Error(message);
  },

  // 스레드 목록 조회
  async listThreads(
    role: 'SELLER' | 'ADMIN',
    box?: 'inbox' | 'sent',
    page: number = 0,
    size: number = 20
  ): Promise<ThreadListResponse> {
    const params = new URLSearchParams();
    params.append('role', role);
    if (box) {
      params.append('box', box);
    }
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await apiClient.get<ApiResponse<ThreadListResponse>>(`/inquiries?${params.toString()}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '메시지 목록을 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 스레드 상세 조회
  async getThreadDetail(
    threadId: number,
    role: 'SELLER' | 'ADMIN',
    page: number = 0,
    size: number = 50
  ): Promise<ThreadDetailResponse> {
    const params = new URLSearchParams();
    params.append('role', role);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await apiClient.get<ApiResponse<ThreadDetailResponse>>(
      `/inquiries/${threadId}?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '메시지 상세를 불러오지 못했습니다.';
    throw new Error(message);
  },

  // 답장 전송
  async reply(threadId: number, request: ReplyRequest): Promise<IdResponse> {
    const response = await apiClient.post<ApiResponse<IdResponse>>(`/inquiries/${threadId}/reply`, request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    const message = response.data.error?.message ?? '답장 전송에 실패했습니다.';
    throw new Error(message);
  },

  // 메시지 삭제
  async deleteMessage(messageId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/inquiries/messages/${messageId}`);
    if (!response.data.success) {
      const message = response.data.error?.message ?? '메시지 삭제에 실패했습니다.';
      throw new Error(message);
    }
  },
};

