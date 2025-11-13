import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignupPage2 as SignupPage2Component } from '../components/auth/SignupPage2';
import { authService } from '../services/authService';
import { masterService } from '../services/masterService';
import { useAuth } from '../context/AuthContext';

export default function SignupPage2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshUser } = useAuth();
  const [masterData, setMasterData] = useState({
    categories: [] as Array<{ id: number; name: string }>,
    styles: [] as Array<{ id: number; name: string }>,
    regions: [] as Array<{ id: number; name: string }>,
    features: [] as Array<{ id: number; name: string }>,
  });
  const [loading, setLoading] = useState(true);

  const userData = (location.state as { formData?: any })?.formData;

  useEffect(() => {
    // 마스터 데이터 로드
    const loadMasterData = async () => {
      try {
        const [categories, styles, regions, features] = await Promise.all([
          masterService.getCategories(),
          masterService.getStyles(),
          masterService.getRegions(),
          masterService.getFeatures(),
        ]);
        setMasterData({ categories, styles, regions, features });
      } catch (error) {
        console.error('Failed to load master data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMasterData();
  }, []);

  const handleComplete = async (preferences?: {
    interests: string[];
    activities: string[];
    events: string[];
    popups: string[];
  }) => {
    // preferences가 없으면 빈 배열로 처리
    const prefs = preferences || {
      interests: [],
      activities: [],
      events: [],
      popups: [],
    };
    if (!userData) {
      navigate('/signup');
      return;
    }

    try {
      // 선택된 항목을 ID로 변환
      const mapToIds = <T extends { id: number; name: string }>(
        source: T[],
        names: string[],
        max: number,
      ) =>
        names
          .map((name) => source.find((item) => item.name === name)?.id)
          .filter((id): id is number => id !== undefined)
          .slice(0, max);

      const ensureMinimum = (ids: number[], candidates: number[], max: number) => {
        if (ids.length > 0) {
          return ids;
        }
        return candidates.slice(0, Math.min(max, candidates.length));
      };

      const allCategoryIds = masterData.categories.map((c) => c.id);
      const allStyleIds = masterData.styles.map((s) => s.id);
      const allFeatureIds = masterData.features.map((f) => f.id);
      const allRegionIds = masterData.regions.map((r) => r.id);

      const interestCategoryIds = ensureMinimum(
        mapToIds(masterData.categories, prefs.interests, 4),
        allCategoryIds,
        4,
      );

      const styleIds = ensureMinimum(
        mapToIds(masterData.styles, prefs.activities, 4),
        allStyleIds,
        4,
      );

      const featureIds = ensureMinimum(
        mapToIds(masterData.features, prefs.events, 4),
        allFeatureIds,
        4,
      );

      const regionIds = ensureMinimum(
        mapToIds(masterData.regions, prefs.popups, 2),
        allRegionIds,
        2,
      );

      if (userData.userType === 'consumer') {
        // 소비자 회원가입
        const ageGroupNum = parseInt(userData.ageGroup?.replace('대', '') || '20');
        await authService.signupConsumer({
          email: userData.email,
          password: userData.password,
          passwordConfirm: userData.passwordConfirm,
          loginId: userData.loginId || userData.username,
          name: userData.name,
          nickname: userData.nickname,
          ageGroup: ageGroupNum * 10,
          interestCategoryIds,
          styleIds,
          featureIds,
          regionIds,
        });
      } else {
        // 판매자 회원가입
        await authService.signupSeller({
          email: userData.email,
          password: userData.password,
          passwordConfirm: userData.passwordConfirm,
          loginId: userData.loginId || userData.username,
          name: userData.name,
          nickname: userData.nickname,
          activityRegion: prefs.popups[0] || '',
        });
      }

      // 회원가입 후 자동 로그인
      const autoLoginId = userData.loginId || userData.username || userData.email;
      await login(autoLoginId, userData.password);
      await refreshUser();

      // 메인 페이지로 이동
      navigate('/');
    } catch (error: any) {
      alert(error.message || '회원가입에 실패했습니다.');
    }
  };

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb0000] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <SignupPage2Component
      onComplete={handleComplete}
      onClose={() => navigate('/login')}
      userData={userData}
      onGoHome={() => navigate('/')}
      onLoginClick={() => navigate('/login')}
      categories={masterData.categories}
      styles={masterData.styles}
      features={masterData.features}
      regions={masterData.regions}
    />
  );
}

