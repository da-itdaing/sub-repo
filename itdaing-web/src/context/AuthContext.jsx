import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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

  const login = async ({ loginId, password, userType } = {}) => {
    const trimmedLoginId = loginId?.trim();
    if (!trimmedLoginId || !password) {
      throw new Error('아이디와 비밀번호를 입력해주세요.');
    }

    const normalizedLoginId = trimmedLoginId.toLowerCase();

    const payload = {
      loginId: normalizedLoginId,
      password,
    };

    if (userType) {
      payload.userType = userType;
    }

    await authService.login(payload);
    const profile = await authService.getMyProfile();
    setUser(profile);
    setIsAuthenticated(true);
    return profile;
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

