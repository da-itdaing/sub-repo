import { create } from 'zustand';
import { getAccessToken, setTokens as saveTokens, clearTokens } from '@/utils/tokenStorage';

/**
 * 인증 상태 관리 Zustand Store
 */
export const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,

  // Actions
  /**
   * 로그인 처리
   * @param {Object} user - 사용자 정보
   * @param {string} accessToken - Access Token
   * @param {string} refreshToken - Refresh Token
   */
  login: (user, accessToken, refreshToken) => {
    saveTokens(accessToken, refreshToken);
    set({
      user,
      isAuthenticated: true,
      accessToken,
      refreshToken,
    });
  },

  /**
   * 로그아웃 처리
   */
  logout: () => {
    clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  },

  /**
   * 토큰 설정
   * @param {string} accessToken 
   * @param {string} refreshToken 
   */
  setTokens: (accessToken, refreshToken) => {
    saveTokens(accessToken, refreshToken);
    set({
      accessToken,
      refreshToken,
    });
  },

  /**
   * 사용자 정보 설정
   * @param {Object} user 
   */
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  /**
   * 초기화: localStorage에서 토큰 복원
   */
  initialize: () => {
    const token = getAccessToken();
    if (token) {
      set({
        isAuthenticated: true,
        accessToken: token,
      });
    }
  },
}));


