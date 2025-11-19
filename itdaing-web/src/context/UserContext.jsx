import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import apiClient from "../services/api";

const DEFAULT_PROFILE = {
  userId: null,
  loginId: "consumer1",
  name: "소비자1",
  nickname: "소비왕",
  email: "consumer1@example.com",
  role: "CONSUMER",
  profileImageUrl: null,
  mbti: "INFP",
  interests: ["패션", "문화", "라이프"],
  styles: ["모던", "미니멀", "빈티지"],
  features: ["주차 가능", "화장실", "Wi-Fi"],
  regions: ["광주"],
  favorites: [1, 2, 3, 4],
  recommendations: [1, 2, 3, 4, 5],
  recentViewed: [1, 2, 3],
};

const Ctx = createContext(null);

function normalizeRole(role) {
  if (!role) return "CONSUMER";
  return typeof role === "string" ? role.toUpperCase() : String(role);
}

function enrichProfile(raw, fallbackRole) {
  if (!raw) return null;

  const normalizedRole = normalizeRole(raw.role ?? fallbackRole);
  const styles = raw.styles ?? [];
  const features = raw.features ?? [];

  return {
    ...raw,
    role: normalizedRole,
    userType: normalizedRole.toLowerCase(),
    moods: raw.moods ?? styles,
    conveniences: raw.conveniences ?? features,
  };
}

export function UserProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildFallbackProfile = useCallback(() => {
    const normalizedRole = normalizeRole(user?.role ?? DEFAULT_PROFILE.role);
    return enrichProfile(
      {
        ...DEFAULT_PROFILE,
        userId: user?.id ?? DEFAULT_PROFILE.userId,
        loginId: user?.loginId ?? DEFAULT_PROFILE.loginId,
        name: user?.name ?? DEFAULT_PROFILE.name,
        nickname: user?.nickname ?? DEFAULT_PROFILE.nickname,
        email: user?.email ?? DEFAULT_PROFILE.email,
        role: normalizedRole,
      },
      normalizedRole
    );
  }, [user]);

  const applyProfile = useCallback(
    (data) => {
      const normalized = enrichProfile(data, user?.role);
      setProfile(normalized);
      return normalized;
    },
    [user?.role]
  );

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/users/me/dashboard');

      if (response.data?.success && response.data.data) {
        return applyProfile(response.data.data);
      }

      throw new Error(response.data?.error?.message ?? "대시보드 응답 형식이 올바르지 않습니다.");
    } catch (err) {
      // 401 에러는 apiClient 인터셉터에서 처리되므로 여기서는 fallback만 설정
      console.warn('대시보드 정보 로드 실패, fallback 사용:', err.message);
      const fallback = buildFallbackProfile();
      setProfile(fallback);
      setError(err instanceof Error ? err : new Error(String(err)));
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [applyProfile, buildFallbackProfile, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated, refreshProfile]);

  const value = useMemo(
    () => ({
      profile,
      setProfile: applyProfile,
      refreshProfile,
      loading,
      error,
    }),
    [applyProfile, error, loading, profile, refreshProfile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
