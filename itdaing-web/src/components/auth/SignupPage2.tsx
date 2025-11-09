import { useState } from "react";

interface SignupPage2Props {
  onComplete: () => void;
  onClose: () => void; // back to login
  userData: any;
  onGoHome?: () => void; // go home by logo click
  onLoginClick?: () => void; // switch to login
}

export function SignupPage2({ onComplete, onClose, userData, onGoHome, onLoginClick }: SignupPage2Props) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedPopups, setSelectedPopups] = useState<string[]>([]);

  const interests = [
    "패션", "뷰티", "음식", "건강", "공연/전시", "스포츠",
    "키즈", "아트", "굿즈", "반려동물"
  ];

  const activities = [
    "혼자여도 좋은", "가족과 함께", "친구와 함께", "연인과 함께",
    "반려동물과 함께", "아기자기한", "감성적인", "활기찬",
    "차분한", "체험하기 좋은", "포토존", "레트로/빈티지",
    "체험가능", "실내", "야외"
  ];

  const events = [
    "무료주차", "무료입장", "예약가능", "굿즈판매"
  ];

  const popups = [
    "남구", "동구", "서구", "북구", "광산구"
  ];

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void,
    maxSelections?: number
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      if (maxSelections && selected.length >= maxSelections) {
        // Don't add if max reached
        return;
      }
      setSelected([...selected, item]);
    }
  };

  const handleComplete = () => {
    console.log("Signup complete", {
      ...userData,
      interests: selectedInterests,
      activities: selectedActivities,
      events: selectedEvents,
      popups: selectedPopups,
    });
    onComplete();
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
              평소에 어떤 분야에 관심이 있으신가요? (최소 1개, 최대 4개 선택)
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(item, selectedInterests, setSelectedInterests, 4)
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
              원하는 팝업 분위기를 선택해주세요 (최소 1개, 최대 4개 선택)
            </h3>
            <div className="flex flex-wrap gap-2">
              {activities.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(item, selectedActivities, setSelectedActivities, 4)
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
              원하는 편의사항을 선택해주세요 (최소 1개, 최대 4개 선택)
            </h3>
            <div className="flex flex-wrap gap-2">
              {events.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(item, selectedEvents, setSelectedEvents, 4)
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
              어떤 지역의 팝업 스토어를 방문하고 싶나요? (최소 1개, 최대 2개 선택)
            </h3>
            <div className="flex flex-wrap gap-2">
              {popups.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    toggleSelection(item, selectedPopups, setSelectedPopups, 2)
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

          {/* Submit Buttons */}
          <div className="pt-8 flex gap-3 flex-wrap">
            <button
              onClick={handleComplete}
              className="flex-1 h-[40px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center"
              aria-label="가입 완료"
            >
              가입 완료
            </button>
            <button
              onClick={onComplete}
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
