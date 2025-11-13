import apiClient, { ApiResponse } from './api';

// Backend PopupReviewResponse format (from PopupQueryController)
export interface PopupReviewResponse {
  id: number;
  popupId: number;
  author: {
    id: number;
    name: string;
    nickname?: string;
    avatar?: string;
  };
  rating: number;
  date: string;
  content: string;
  images: string[];
}

// Backend ReviewResponse format (from ReviewCommandController)
export interface ReviewResponse {
  id: number;
  popupId: number;
  consumerId: number;
  consumerName: string;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

// Frontend ReviewItem format (matches what components expect)
export interface ReviewItem {
  id: number;
  popupId: number;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  rating: number;
  date: string;
  content: string;
  images: string[];
}

// Helper to convert PopupReviewResponse to ReviewItem
function toReviewItem(response: PopupReviewResponse): ReviewItem {
  return {
    id: response.id,
    popupId: response.popupId,
    author: {
      id: response.author.id,
      name: response.author.name,
      avatar: response.author.avatar,
    },
    rating: response.rating,
    date: response.date,
    content: response.content,
    images: response.images,
  };
}

export interface ReviewCreateRequest {
  rating: number; // 1-5
  content: string;
  imageUrls?: string[];
}

export interface ReviewUpdateRequest {
  rating: number; // 1-5
  content: string;
  imageUrls?: string[];
}

export const reviewService = {
  // 전체 리뷰 목록 조회
  async getAllReviews(): Promise<ReviewItem[]> {
    const response = await apiClient.get<ApiResponse<PopupReviewResponse[]>>('/popups/reviews');
    if (response.data.success && response.data.data) {
      // data가 배열인지 확인하고, null이나 undefined인 경우 빈 배열 반환
      const data = response.data.data;
      if (Array.isArray(data)) {
        return data.map(toReviewItem);
      }
      return [];
    }
    // success가 false이거나 data가 없는 경우 빈 배열 반환 (에러 대신)
    return [];
  },

  // 팝업별 리뷰 목록 조회
  async getReviewsByPopupId(popupId: number): Promise<ReviewItem[]> {
    const response = await apiClient.get<ApiResponse<PopupReviewResponse[]>>(`/popups/${popupId}/reviews`);
    if (response.data.success && response.data.data) {
      // data가 배열인지 확인하고, null이나 undefined인 경우 빈 배열 반환
      const data = response.data.data;
      if (Array.isArray(data)) {
        return data.map(toReviewItem);
      }
      return [];
    }
    // success가 false이거나 data가 없는 경우 빈 배열 반환 (에러 대신)
    return [];
  },

  // 리뷰 작성
  async createReview(popupId: number, request: ReviewCreateRequest): Promise<ReviewItem> {
    const response = await apiClient.post<ApiResponse<ReviewResponse>>(`/popups/${popupId}/reviews`, request);
    if (response.data.success && response.data.data) {
      // Convert ReviewResponse to ReviewItem format
      const data = response.data.data;
      return {
        id: data.id,
        popupId: data.popupId,
        author: {
          id: data.consumerId,
          name: data.consumerName,
        },
        rating: data.rating,
        date: new Date(data.createdAt).toISOString().split('T')[0],
        content: data.content,
        images: data.imageUrls,
      };
    }
    const message = response.data.error?.message ?? '리뷰 작성에 실패했습니다.';
    throw new Error(message);
  },

  // 리뷰 수정
  async updateReview(reviewId: number, request: ReviewUpdateRequest): Promise<ReviewItem> {
    const response = await apiClient.put<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`, request);
    if (response.data.success && response.data.data) {
      // Convert ReviewResponse to ReviewItem format
      const data = response.data.data;
      return {
        id: data.id,
        popupId: data.popupId,
        author: {
          id: data.consumerId,
          name: data.consumerName,
        },
        rating: data.rating,
        date: new Date(data.createdAt).toISOString().split('T')[0],
        content: data.content,
        images: data.imageUrls,
      };
    }
    const message = response.data.error?.message ?? '리뷰 수정에 실패했습니다.';
    throw new Error(message);
  },

  // 리뷰 삭제
  async deleteReview(reviewId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/reviews/${reviewId}`);
    if (!response.data.success) {
      const message = response.data.error?.message ?? '리뷰 삭제에 실패했습니다.';
      throw new Error(message);
    }
  },
};

