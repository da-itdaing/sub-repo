import apiClient, { ApiResponse } from './api';

// 인증 관련 타입 정의
export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface SignupConsumerRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  loginId: string;
  name: string;
  nickname: string;
  ageGroup: number;
  interestCategoryIds: number[];
  styleIds: number[];
  featureIds: number[];
  regionIds: number[];
}

export interface SignupSellerRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  loginId: string;
  name: string;
  nickname: string;
  activityRegion: string;
  snsUrl?: string;
  profileImageUrl?: string;
  introduction?: string;
}

export interface SignupResponse {
  userId: number;
  email: string;
  role: 'CONSUMER' | 'SELLER';
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  nickname: string;
  role: 'CONSUMER' | 'SELLER' | 'ADMIN';
}

// 인증 서비스
export const authService = {
  // 로그인
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', request);
    if (response.data.success && response.data.data) {
      // 토큰 저장
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      return response.data.data;
    }
    throw new Error(response.data.error?.message || '로그인에 실패했습니다.');
  },

  // 소비자 회원가입
  async signupConsumer(request: SignupConsumerRequest): Promise<SignupResponse> {
    const response = await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup/consumer', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || '회원가입에 실패했습니다.');
  },

  // 판매자 회원가입
  async signupSeller(request: SignupSellerRequest): Promise<SignupResponse> {
    const response = await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup/seller', request);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || '회원가입에 실패했습니다.');
  },

  // 내 프로필 조회
  async getMyProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || '프로필 조회에 실패했습니다.');
  },

  // 로그아웃
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch (error) {
      // 에러가 발생해도 로컬 스토리지는 정리
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // 토큰 재발급
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token이 없습니다.');
    }
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken });
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      return response.data.data;
    }
    throw new Error(response.data.error?.message || '토큰 재발급에 실패했습니다.');
  },

  // 로그인 상태 확인
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  // 토큰 가져오기
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },
};

