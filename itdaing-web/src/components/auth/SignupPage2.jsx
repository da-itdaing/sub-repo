import { useState } from 'react';
import PropTypes from 'prop-types';

const LIMITS = {
  interests: 4,
  activities: 4,
  events: 4,
  popups: 2,
};

export function SignupPage2({
  onComplete,
  onClose,
  userData,
  onGoHome,
  onLoginClick,
  categories,
  styles,
  features,
  regions,
}) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleValue = (value, list, setList, limit, label) => {
    setSubmitMessage('');
    const exists = list.includes(value);
    if (exists) {
      setList(list.filter(item => item !== value));
      return;
    }
    if (limit && list.length >= limit) {
      setSubmitMessage(`${label}은 최대 ${limit}개까지 선택 가능합니다.`);
      return;
    }
    setList([...list, value]);
  };

  const validate = () => {
    if (selectedInterests.length === 0) return '관심 분야를 최소 1개 이상 선택해주세요.';
    if (selectedActivities.length === 0) return '팝업 분위기를 최소 1개 이상 선택해주세요.';
    if (selectedFeatures.length === 0) return '편의사항을 최소 1개 이상 선택해주세요.';
    if (selectedRegions.length === 0) return '관심 지역을 최소 1개 이상 선택해주세요.';
    return '';
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const message = validate();
    if (message) {
      setSubmitMessage(message);
      return;
    }

    const preferences = {
      interests: selectedInterests,
      activities: selectedActivities,
      events: selectedFeatures,
      popups: selectedRegions,
    };

    try {
      setIsSubmitting(true);
      await onComplete?.(preferences);
    } catch (error) {
      setSubmitMessage(error?.message || '요청을 처리하는 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete?.({
      interests: [],
      activities: [],
      events: [],
      popups: [],
    });
  };

  const renderOptionButton = (value, list, setList, limit, label) => (
    <button
      type="button"
      key={value}
      onClick={() => toggleValue(value, list, setList, limit, label)}
      className={`px-4 py-2 rounded-full font-['Pretendard:Regular',sans-serif] text-[12px] transition-colors ${
        list.includes(value)
          ? 'bg-[#eb0000] text-white'
          : 'bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]'
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[800px] mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <button
            type="button"
            onClick={onGoHome}
            className="group"
            aria-label="홈으로 이동"
          >
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[64px] md:text-[72px] text-[#eb0000] leading-none uppercase tracking-tight group-hover:scale-105 transition-transform">
              Da - It daing
            </h1>
          </button>
        </div>

        <div className="flex justify-center mb-12">
          <div className="w-[200px] h-[44px] font-['Luckiest_Guy:Regular','Noto_Sans_KR:Regular',sans-serif] text-[20px] text-[#eb0000] border-b-[2px] border-[#eb0000] flex items-center justify-center">
            {userData?.userType === 'consumer' ? '소비자' : '판매자'}
          </div>
        </div>

        <div className="max-w-[720px] mx-auto space-y-10">
          <div className="mb-8">
            <h2 className="font-['Pretendard:Bold',sans-serif] text-[20px] text-black mb-2">
              사용자님의 취향을 알려주세요!
            </h2>
            <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#4b4b4b] text-left">
              카테고리별로 원하는 내용을 선택하면 정보를 모아 사용자님의 취향에 맞게 추천해드립니다!
            </p>
          </div>

          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              평소에 어떤 분야에 관심이 있으신가요? (최소 1개, 최대 {LIMITS.interests}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedInterests.length}/{LIMITS.interests}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(item =>
                renderOptionButton(item.name, selectedInterests, setSelectedInterests, LIMITS.interests, '관심 분야'),
              )}
            </div>
          </div>

          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              원하는 팝업 분위기를 선택해주세요 (최소 1개, 최대 {LIMITS.activities}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedActivities.length}/{LIMITS.activities}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {styles.map(item =>
                renderOptionButton(item.name, selectedActivities, setSelectedActivities, LIMITS.activities, '팝업 분위기'),
              )}
            </div>
          </div>

          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              원하는 편의사항을 선택해주세요 (최소 1개, 최대 {LIMITS.events}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedFeatures.length}/{LIMITS.events}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {features.map(item =>
                renderOptionButton(item.name, selectedFeatures, setSelectedFeatures, LIMITS.events, '편의사항'),
              )}
            </div>
          </div>

          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              어떤 지역의 팝업 스토어를 방문하고 싶나요? (최소 1개, 최대 {LIMITS.popups}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedRegions.length}/{LIMITS.popups}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {regions.map(item =>
                renderOptionButton(item.name, selectedRegions, setSelectedRegions, LIMITS.popups, '관심 지역'),
              )}
            </div>
          </div>

          {submitMessage && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert" aria-live="assertive">
              {submitMessage}
            </div>
          )}

          <div className="pt-8 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-[40px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="가입 완료"
            >
              {isSubmitting ? '처리 중...' : '가입 완료'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 h-[40px] bg-[#5a5a5a] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#4a4a4a] transition-colors flex items-center justify-center"
              aria-label="선호도 조사 건너뛰기"
            >
              건너뛰기
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[40px] bg-[#9a9a9a] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#7a7a7a] transition-colors flex items-center justify-center"
              aria-label="뒤로가기"
            >
              뒤로가기
            </button>
            <button
              type="button"
              onClick={onLoginClick}
              className="flex-1 h-[40px] bg-gray-200 rounded-[30px] font-['Pretendard:Medium',sans-serif] text-[15px] text-gray-700 hover:bg-gray-300 transition-colors flex items-center justify-center"
              aria-label="로그인으로 이동"
            >
              이미 계정이 있으신가요? 로그인 하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

SignupPage2.propTypes = {
  onComplete: PropTypes.func,
  onClose: PropTypes.func,
  userData: PropTypes.object,
  onGoHome: PropTypes.func,
  onLoginClick: PropTypes.func,
  categories: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  ),
  styles: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  ),
  features: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  ),
  regions: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  ),
};

SignupPage2.defaultProps = {
  onComplete: undefined,
  onClose: undefined,
  userData: undefined,
  onGoHome: undefined,
  onLoginClick: undefined,
  categories: [],
  styles: [],
  features: [],
  regions: [],
};

export default SignupPage2;
