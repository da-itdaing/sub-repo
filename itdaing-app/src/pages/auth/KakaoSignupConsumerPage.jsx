import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { completeKakaoConsumer, getMyProfile } from '@/services/authService';
import { useMasterData } from '@/hooks/useMasterData';
import { ROUTES } from '@/routes/paths';

/**
 * 카카오 소비자 회원가입 완료 페이지
 * 추가 정보 입력: 연령대, 관심 카테고리, 스타일, 선호 지역
 */
const KakaoSignupConsumerPage = () => {
  const navigate = useNavigate();
  const { login: loginStore, setUser } = useAuthStore();
  const { categories, styles, regions, features, isLoading: masterLoading } = useMasterData();

  const [tempData, setTempData] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 데이터
  const [ageGroup, setAgeGroup] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // localStorage에서 임시 데이터 로드
  useEffect(() => {
    const stored = localStorage.getItem('kakaoTempData');
    if (!stored) {
      navigate(ROUTES.login, { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'consumer') {
        navigate('/signup/kakao/seller', { replace: true });
        return;
      }
      setTempData(parsed);
    } catch (e) {
      navigate(ROUTES.login, { replace: true });
    }
  }, [navigate]);

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!ageGroup) {
      setError('연령대를 선택해주세요');
      return;
    }
    if (selectedCategories.length === 0 || selectedCategories.length > 4) {
      setError('관심 카테고리를 1~4개 선택해주세요');
      return;
    }
    if (selectedStyles.length === 0 || selectedStyles.length > 4) {
      setError('스타일을 1~4개 선택해주세요');
      return;
    }
    if (selectedRegions.length === 0 || selectedRegions.length > 2) {
      setError('선호 지역을 1~2개 선택해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await completeKakaoConsumer({
        tempToken: tempData.tempToken,
        ageGroup,
        interestCategoryIds: selectedCategories,
        styleIds: selectedStyles,
        regionIds: selectedRegions,
        featureIds: selectedFeatures.length > 0 ? selectedFeatures : undefined,
      });

      // 로그인 처리
      loginStore(null, response.accessToken, response.refreshToken, response.role);

      try {
        const userProfile = await getMyProfile();
        setUser(userProfile);
      } catch (profileError) {
        console.error('Failed to fetch profile:', profileError);
      }

      // localStorage 정리
      localStorage.removeItem('kakaoTempData');

      // 홈으로 이동
      navigate(ROUTES.home, { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err?.response?.data?.error?.message || err?.message || '회원가입에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다중 선택 토글
  const toggleSelection = (id, selected, setSelected, max) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < max) {
      setSelected([...selected, id]);
    }
  };

  if (!tempData || masterLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const ageGroups = [10, 20, 30, 40, 50, 60];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-[480px] mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">추가 정보 입력</h1>
          <p className="text-gray-600 text-sm">
            {tempData.nickname || tempData.email}님, 환영합니다!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 연령대 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">연령대 *</label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setAgeGroup(age)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    ageGroup === age
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {age}대
                </button>
              ))}
            </div>
          </div>

          {/* 관심 카테고리 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              관심 카테고리 * <span className="text-gray-400">(1~4개)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleSelection(cat.id, selectedCategories, setSelectedCategories, 4)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 스타일 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              스타일 * <span className="text-gray-400">(1~4개)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => toggleSelection(style.id, selectedStyles, setSelectedStyles, 4)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedStyles.includes(style.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* 선호 지역 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              선호 지역 * <span className="text-gray-400">(1~2개)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => toggleSelection(region.id, selectedRegions, setSelectedRegions, 2)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedRegions.includes(region.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '가입 중...' : '가입 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KakaoSignupConsumerPage;

