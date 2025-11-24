import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { signupConsumer } from '@/services/authService';
import { useMasterData } from '@/hooks/useMasterData';
import { ROUTES } from '@/routes/paths';
import SignupStepHeader from '@/components/signup/SignupStepHeader';

const SignupStep2 = () => {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);

  // 마스터 데이터 조회
  const { categories, regions, styles, features, isLoading: masterLoading } = useMasterData();

  // 광주 5개구 필터링 (DB 중복/불필요 데이터 제거)
  const filteredRegions = regions.filter(r => 
    ['동구', '서구', '남구', '북구', '광산구'].includes(r.name)
  );

  useEffect(() => {
    // localStorage에서 1단계 데이터 가져오기
    const data = localStorage.getItem('signupData');
    if (!data) {
      navigate(ROUTES.signupStep1);
      return;
    }
    setSignupData(JSON.parse(data));
  }, [navigate]);

  const handleSubmit = async () => {
    if (
      selectedCategories.length === 0 ||
      selectedStyles.length === 0 ||
      selectedRegions.length === 0 ||
      selectedFeatures.length === 0 ||
      !selectedAgeGroup
    ) {
      alert('모든 선호 항목과 나이대를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        ...signupData,
        ageGroup: selectedAgeGroup,
        interestCategoryIds: selectedCategories,
        styleIds: selectedStyles,
        regionIds: selectedRegions,
        featureIds: selectedFeatures,
      };

      await signupConsumer(requestData);
      
      // 회원가입 성공
      localStorage.removeItem('signupData');
      alert('회원가입이 완료되었습니다!');
      navigate(ROUTES.login);
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const maxRegionSelection = 2;

  if (!signupData) {
    return null;
  }

  const canSubmit =
    selectedCategories.length >= 1 &&
    selectedStyles.length >= 1 &&
    selectedRegions.length >= 1 &&
    selectedFeatures.length >= 1 &&
    !!selectedAgeGroup;

  const AGE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideSearchBar />
      
      <main className="flex-1 py-10">
        <div className="w-full max-w-[520px] md:max-w-[860px] mx-auto px-5">
          <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100 md:p-8">
            <SignupStepHeader
              currentStep={2}
              onBack={() => navigate(ROUTES.signupStep1)}
              onExit={() => navigate(ROUTES.home)}
            />

            <div className="mt-6 space-y-2 text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">STEP 2 · 선호 정보</p>
              <h2 className="text-2xl font-bold text-gray-900">어떤 팝업에 관심이 있으신가요?</h2>
              <p className="text-sm text-gray-500">
                관심 항목은 1~4개, 지역은 1~2개, 나이대를 선택해주세요. 선택한 정보는 맞춤 추천에 사용됩니다.
              </p>
            </div>

            {masterLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-600">선택 항목을 불러오는 중입니다...</p>
              </div>
            ) : (
              <div className="space-y-8 mt-8">
                {/* 관심 카테고리 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">관심 카테고리</h3>
                    <p className="text-xs text-gray-500">선택 {selectedCategories.length} / 4</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {categories
                      .filter((cat) => cat.type === 'CONSUMER')
                      .map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            if (selectedCategories.includes(category.id)) {
                              setSelectedCategories(selectedCategories.filter((c) => c !== category.id));
                            } else if (selectedCategories.length < 4) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            }
                          }}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                            selectedCategories.includes(category.id)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* 선호 스타일 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">선호 스타일</h3>
                    <p className="text-xs text-gray-500">선택 {selectedStyles.length} / 4</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          if (selectedStyles.includes(style.id)) {
                            setSelectedStyles(selectedStyles.filter((s) => s !== style.id));
                          } else if (selectedStyles.length < 4) {
                            setSelectedStyles([...selectedStyles, style.id]);
                          }
                        }}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selectedStyles.includes(style.id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선호 지역 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">선호 지역 (광주)</h3>
                    <p className="text-xs text-gray-500">
                      선택 {selectedRegions.length} / {maxRegionSelection}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {filteredRegions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => {
                          if (selectedRegions.includes(region.id)) {
                            setSelectedRegions(selectedRegions.filter((r) => r !== region.id));
                          } else if (selectedRegions.length < maxRegionSelection) {
                            setSelectedRegions([...selectedRegions, region.id]);
                          }
                        }}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selectedRegions.includes(region.id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {region.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 나이대 선택 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">나이대</h3>
                    <p className="text-xs text-gray-500">
                      {selectedAgeGroup ? `${selectedAgeGroup}대 선택됨` : '미선택'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {AGE_OPTIONS.map((age) => (
                      <button
                        key={age}
                        onClick={() => setSelectedAgeGroup(age)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selectedAgeGroup === age
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {age}대
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선호 특징 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">선호 특징</h3>
                    <p className="text-xs text-gray-500">선택 {selectedFeatures.length} / 4</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {features.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => {
                          if (selectedFeatures.includes(feature.id)) {
                            setSelectedFeatures(selectedFeatures.filter((f) => f !== feature.id));
                          } else if (selectedFeatures.length < 4) {
                            setSelectedFeatures([...selectedFeatures, feature.id]);
                          }
                        }}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selectedFeatures.includes(feature.id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {feature.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
            <button
              onClick={handleSubmit}
                disabled={isLoading || !canSubmit}
                className="w-full rounded-2xl bg-primary py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? '가입 중...' : '회원가입 완료'}
            </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.signupStep1)}
                className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                이전 단계로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupStep2;

