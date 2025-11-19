import { useState } from "react";

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
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedPopups, setSelectedPopups] = useState([]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const interests = categories.map((category) => category.name);
  const activities = styles.map((style) => style.name);
  const events = features.map((feature) => feature.name);
  const popupRegions = regions.map((region) => region.name);
  const MAX_SELECTIONS = {
    interests: 4,
    activities: 4,
    events: 4,
    popups: 2,
  };

  const toggleSelection = (item, selected, setSelected, maxSelections, label) => {
    setFormError("");
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      if (maxSelections && selected.length >= maxSelections) {
        setFormError(`${label}은 최대 ${maxSelections}개까지 선택 가능합니다.`);
        return;
      }
      setSelected([...selected, item]);
    }
  };

  const validateSelections = () => {
    if (selectedInterests.length === 0) {
      return "관심 분야를 최소 1개 이상 선택해주세요.";
    }
    if (selectedActivities.length === 0) {
      return "팝업 분위기를 최소 1개 이상 선택해주세요.";
    }
    if (selectedEvents.length === 0) {
      return "편의사항을 최소 1개 이상 선택해주세요.";
    }
    if (selectedPopups.length === 0) {
      return "관심 지역을 최소 1개 이상 선택해주세요.";
    }
    return "";
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    const validationMessage = validateSelections();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const preferences = {
      interests: selectedInterests,
      activities: selectedActivities,
      events: selectedEvents,
      popups: selectedPopups,
    };
    try {
      setIsSubmitting(true);
      await onComplete(preferences);
    } catch (error) {
      setFormError(error?.message || "요청을 처리하는 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // 선호도 조사 건너뛰기 - 빈 배열로 전달
    onComplete({
      interests: [],
      activities: [],
      events: [],
      popups: [],
    });
  };

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[800px] mx-auto py-16 px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <button onClick={onGoHome} className="group" aria-label="홈으로 이동">
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[64px] md:text-[72px] text-[#eb0000] leading-none uppercase tracking-tight group-hover:scale-105 transition-transform">
              DA - IT DAING
            </h1>
          </button>
        </div>

        {/* User Type Indicator */}
        <div className="flex justify-center mb-12">
          <div className="w-[200px] h-[44px] font-['Luckiest_Guy:Regular','Noto_Sans_KR:Regular',sans-serif] text-[20px] text-[#eb0000] border-b-[2px] border-[#eb0000] flex items-center justify-center">
            {userData.userType === "consumer" ? "소비자" : "판매자"}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-[720px] mx-auto space-y-10">
          {/* Title */}
          <div className="mb-8">
            <h2 className="font-['Pretendard:Bold',sans-serif] text-[20px] text-black mb-2">
              사용자님의 취향을 알려주세요!
            </h2>
            <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#4b4b4b] text-left">
              카테고리별로 원하는 내용을 선택하면 정보를 모아 사용자님의 취향에 맞게 추천해드립니다!
            </p>
          </div>

          {/* Section 1: Interests */}
          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              평소에 어떤 분야에 관심이 있으신가요? (최소 1개, 최대 {MAX_SELECTIONS.interests}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedInterests.length}/{MAX_SELECTIONS.interests}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(
                      item,
                      selectedInterests,
                      setSelectedInterests,
                      MAX_SELECTIONS.interests,
                      "관심 분야",
                    )
                  }
                  className={`px-4 py-2 rounded-full font-['Pretendard:Regular',sans-serif] text-[12px] transition-colors ${
                    selectedInterests.includes(item)
                      ? "bg-[#eb0000] text-white"
                      : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Activities */}
          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              원하는 팝업 분위기를 선택해주세요 (최소 1개, 최대 {MAX_SELECTIONS.activities}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedActivities.length}/{MAX_SELECTIONS.activities}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {activities.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(
                      item,
                      selectedActivities,
                      setSelectedActivities,
                      MAX_SELECTIONS.activities,
                      "팝업 분위기",
                    )
                  }
                  className={`px-4 py-2 rounded-full font-['Pretendard:Regular',sans-serif] text-[12px] transition-colors ${
                    selectedActivities.includes(item)
                      ? "bg-[#eb0000] text-white"
                      : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Events */}
          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              원하는 편의사항을 선택해주세요 (최소 1개, 최대 {MAX_SELECTIONS.events}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedEvents.length}/{MAX_SELECTIONS.events}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {events.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(
                      item,
                      selectedEvents,
                      setSelectedEvents,
                      MAX_SELECTIONS.events,
                      "편의사항",
                    )
                  }
                  className={`px-4 py-2 rounded-full font-['Pretendard:Regular',sans-serif] text-[12px] transition-colors ${
                    selectedEvents.includes(item)
                      ? "bg-[#eb0000] text-white"
                      : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Popups */}
          <div>
            <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black mb-3">
              어떤 지역의 팝업 스토어를 방문하고 싶나요? (최소 1개, 최대 {MAX_SELECTIONS.popups}개 선택)
              <span className="ml-2 text-xs text-[#eb0000]">
                {selectedPopups.length}/{MAX_SELECTIONS.popups}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {popupRegions.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(
                      item,
                      selectedPopups,
                      setSelectedPopups,
                      MAX_SELECTIONS.popups,
                      "관심 지역",
                    )
                  }
                  className={`px-4 py-2 rounded-full font-['Pretendard:Regular',sans-serif] text-[12px] transition-colors ${
                    selectedPopups.includes(item)
                      ? "bg-[#eb0000] text-white"
                      : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {formError && (
            <div
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
              aria-live="assertive"
            >
              {formError}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-8 flex gap-3 flex-wrap">
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex-1 h-[40px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="가입 완료"
            >
              {isSubmitting ? "처리 중..." : "가입 완료"}
            </button>
            <button
              onClick={handleSkip}
              className="flex-1 h-[40px] bg-[#5a5a5a] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#4a4a4a] transition-colors flex items-center justify-center"
              aria-label="선호도 조사 건너뛰기"
            >
              건너뛰기
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-[40px] bg-[#9a9a9a] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#7a7a7a] transition-colors flex items-center justify-center"
              aria-label="뒤로가기"
            >
              뒤로가기
            </button>
            <button
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
