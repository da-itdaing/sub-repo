import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // 초기 로드 시 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getMyProfile();
          setUser(profile);
          setIsAuthenticated(true);
        } catch (error) {
          // 토큰이 유효하지 않은 경우
          authService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (loginId: string, password: string) => {
    try {
      // eslint-disable-next-line no-console
      console.log('[AuthContext] login called', { loginId });
      const request = { loginId, password };
      await authService.login(request);
      const profile = await authService.getMyProfile();
      setUser(profile);
      setIsAuthenticated(true);
      // eslint-disable-next-line no-console
      console.log('[AuthContext] login ok, set user', profile);
    } catch (error) {
      console.error('AuthContext.login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const profile = await authService.getMyProfile();
        setUser(profile);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        await logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fallback for development/HMR edge-cases:
    // Return a safe unauthenticated context to avoid hard crashes.
    return {
      isAuthenticated: false,
      user: null,
      login: async () => {
        throw new Error('Auth not initialized yet. Please reload and try again.');
      },
      logout: async () => {},
      refreshUser: async () => {},
      loading: false,
    };
  }
  return context;
}

