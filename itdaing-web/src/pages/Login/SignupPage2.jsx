import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignupPage2 as SignupPage2Component } from '../../components/auth/SignupPage2.jsx';
import { authService } from '../../services/authService.js';
import { masterService } from '../../services/masterService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SignupPage2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshUser } = useAuth();
  const [masterData, setMasterData] = useState({
    categories: [],
    styles: [],
    regions: [],
    features: [],
  });
  const [loading, setLoading] = useState(true);

  const userData = location.state?.formData;

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

  const handleComplete = async preferences => {
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
      const mapToIds = (source, names, max) =>
        names
          .map(name => source.find(item => item.name === name)?.id)
          .filter(id => id !== undefined)
          .slice(0, max);

      const ensureMinimum = (ids, candidates, max) => {
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
        const parseAgeGroup = (value) => {
          if (!value) return 20;
          if (value.includes('이상')) {
            const match = value.match(/\d+/);
            return match ? Math.min(parseInt(match[0], 10), 90) : 50;
          }
          const match = value.match(/\d+/);
          if (!match) return 20;
          const parsed = parseInt(match[0], 10);
          if (Number.isNaN(parsed)) return 20;
          return Math.min(Math.max(parsed, 10), 90);
        };

        const ageGroupNum = parseAgeGroup(userData.ageGroup);

        await authService.signupConsumer({
          email: userData.email,
          password: userData.password,
          passwordConfirm: userData.passwordConfirm,
          loginId: userData.loginId || userData.username,
          name: userData.name,
          nickname: userData.nickname,
          ageGroup: ageGroupNum,
          interestCategoryIds,
          styleIds,
          featureIds,
          regionIds,
          mbti: userData.mbti ? userData.mbti.toUpperCase() : undefined,
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
      await login({
        loginId: autoLoginId,
        password: userData.password,
        userType: userData.userType === 'seller' ? 'SELLER' : 'CONSUMER',
      });
      await refreshUser();

      // 메인 페이지로 이동
      navigate('/');
    } catch (error) {
      // fieldErrors가 있으면 필드별 에러 메시지 표시
      if (error?.fieldErrors && Array.isArray(error.fieldErrors) && error.fieldErrors.length > 0) {
        const fieldErrorMessages = error.fieldErrors
          .map(fe => `${fe.field}: ${fe.reason}`)
          .join('\n');
        alert(`입력값 오류:\n${fieldErrorMessages}\n\n${error.message || '회원가입에 실패했습니다.'}`);
      } else {
        alert(error?.message || '회원가입에 실패했습니다.');
      }
      // 에러 발생 시 첫 페이지로 돌아가기
      navigate('/signup');
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

