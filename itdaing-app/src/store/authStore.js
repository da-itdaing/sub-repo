import { create } from 'zustand';
import {
  getAccessToken,
  setTokens as saveTokens,
  clearTokens,
  getUserRole,
  setUserRole,
  clearUserRole,
} from '@/utils/tokenStorage';

/**
 * 인증 상태 관리 Zustand Store
 */
export const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  role: null,

  // Actions
  /**
   * 로그인 처리
   * @param {Object} user - 사용자 정보
   * @param {string} accessToken - Access Token
   * @param {string} refreshToken - Refresh Token
   */
  login: (user, accessToken, refreshToken, roleOverride = null) => {
    saveTokens(accessToken, refreshToken);
    const resolvedRole = roleOverride ?? user?.role ?? getUserRole();
    if (resolvedRole) {
      setUserRole(resolvedRole);
    }
    set({
      user,
      isAuthenticated: true,
      accessToken,
      refreshToken,
      role: resolvedRole ?? null,
    });
  },

  /**
   * 로그아웃 처리
   */
  logout: () => {
    clearTokens();
    clearUserRole();
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      role: null,
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
    if (user?.role) {
      setUserRole(user.role);
    }
    set({
      user,
      role: user?.role ?? null,
    });
  },

  /**
   * 초기화: localStorage에서 토큰 복원
   */
  initialize: () => {
    const token = getAccessToken();
    const storedRole = getUserRole();
    if (token) {
      set({
        isAuthenticated: true,
        accessToken: token,
        role: storedRole,
      });
    }
  },
}));
