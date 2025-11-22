import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { signupConsumer } from '@/services/authService';
import { useMasterData } from '@/hooks/useMasterData';
import { ROUTES } from '@/routes/paths';

const SignupStep2 = () => {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 마스터 데이터 조회
  const { categories, regions, styles, features, isLoading: masterLoading } = useMasterData();

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
    if (selectedCategories.length === 0 || selectedStyles.length === 0 || 
        selectedRegions.length === 0 || selectedFeatures.length === 0) {
      alert('모든 선호 정보를 선택해주세요 (각 1~4개)');
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        ...signupData,
        ageGroup: 20, // 기본값
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

  if (!signupData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header hideSearchBar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-[640px] mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-4">선호 정보 입력</h2>
            <p className="text-center text-gray-600 mb-8">각 항목에서 1~4개를 선택해주세요</p>

            {/* 마스터 데이터 로딩 중 */}
            {masterLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">선택 항목을 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 관심 카테고리 */}
                <div>
                  <h3 className="font-semibold mb-2">관심 카테고리</h3>
                  <p className="text-sm text-gray-500">선택된 카테고리: {selectedCategories.length}/4</p>
                  <div className="flex flex-wrap gap-2 mt-2">
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
                          className={`px-4 py-2 rounded-lg border transition-colors ${
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
                  <h3 className="font-semibold mb-2">선호 스타일</h3>
                  <p className="text-sm text-gray-500">선택된 스타일: {selectedStyles.length}/4</p>
                  <div className="flex flex-wrap gap-2 mt-2">
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
                        className={`px-4 py-2 rounded-lg border transition-colors ${
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
                  <h3 className="font-semibold mb-2">선호 지역</h3>
                  <p className="text-sm text-gray-500">선택된 지역: {selectedRegions.length}/4</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {regions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => {
                          if (selectedRegions.includes(region.id)) {
                            setSelectedRegions(selectedRegions.filter((r) => r !== region.id));
                          } else if (selectedRegions.length < 4) {
                            setSelectedRegions([...selectedRegions, region.id]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
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

                {/* 선호 특징 */}
                <div>
                  <h3 className="font-semibold mb-2">선호 특징</h3>
                  <p className="text-sm text-gray-500">선택된 특징: {selectedFeatures.length}/4</p>
                  <div className="flex flex-wrap gap-2 mt-2">
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
                        className={`px-4 py-2 rounded-lg border transition-colors ${
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

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-[52px] rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-lg transition-colors disabled:opacity-50 mt-8"
            >
              {isLoading ? '가입 중...' : '회원가입 완료'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupStep2;

