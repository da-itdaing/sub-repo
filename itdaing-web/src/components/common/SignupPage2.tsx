import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FALLBACK_IMAGES } from "../../constants/fallbackImages";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface SignupPage2Props {
  onComplete: (preferences: { interests: string[]; activities: string[]; events: string[]; popups: string[] }) => void;
  onBackToLogin?: () => void;
  userData: any;
  onHomeClick?: () => void;
}

export function SignupPage2({ onComplete, onBackToLogin, userData, onHomeClick }: SignupPage2Props) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedPopups, setSelectedPopups] = useState<string[]>([]);
  const [openInterests, setOpenInterests] = useState(true);
  const [openActivities, setOpenActivities] = useState(false);
  const [openEvents, setOpenEvents] = useState(false);
  const [openPopups, setOpenPopups] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

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

  // 광주광역시 5개 구 이미지 선택 카드 (요청: 북구/광산구 분리)
  const regionCards: { name: string; image: string }[] = [
    { name: "남구", image: FALLBACK_IMAGES[0] },
    { name: "동구", image: FALLBACK_IMAGES[1] },
    { name: "서구", image: FALLBACK_IMAGES[2] },
    { name: "북구", image: FALLBACK_IMAGES[3] },
    { name: "광산구", image: FALLBACK_IMAGES[4] },
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
    // Validate selections: at least 1 per section, max 4 (region max 2)
    if (selectedInterests.length < 1 || selectedInterests.length > 4) {
      setErrorMsg("관심 분야를 1~4개 선택해 주세요.");
      return;
    }
    if (selectedActivities.length < 1 || selectedActivities.length > 4) {
      setErrorMsg("팝업 분위기를 1~4개 선택해 주세요.");
      return;
    }
    if (selectedEvents.length < 1 || selectedEvents.length > 4) {
      setErrorMsg("편의사항을 1~4개 선택해 주세요.");
      return;
    }
    if (selectedPopups.length < 1 || selectedPopups.length > 2) {
      setErrorMsg("지역은 1~2개 선택해 주세요.");
      return;
    }
    setErrorMsg("");
    onComplete({
      interests: selectedInterests,
      activities: selectedActivities,
      events: selectedEvents,
      popups: selectedPopups,
    });
  };

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[800px] mx-auto py-16 px-6">
        {/* Back button */}
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            aria-label="뒤로가기"
            className="absolute left-4 top-6 inline-flex items-center gap-1 text-[#eb0000] hover:opacity-80 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-['Pretendard:Medium',sans-serif] text-sm">뒤로가기</span>
          </button>
        )}
        {/* Logo (clickable to Home) */}
        <div className="text-center mb-12">
          <button
            type="button"
            aria-label="메인으로 이동"
            onClick={onHomeClick}
            className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#eb0000] rounded-md"
          >
            <h1 className="font-display text-[72px] sm:text-[88px] text-[#eb0000] leading-none uppercase tracking-wide">
              DA - IT DAING
            </h1>
          </button>
        </div>

        {/* User Type Indicator - 선택한 유형만 가운데에 표시 */}
        <div className="flex justify-center mb-12">
          <div className="w-[200px] h-[44px] font-display text-[20px] text-[#eb0000] border-b-[2px] border-[#eb0000] flex items-center justify-center">
            {userData.userType === "consumer" ? "소비자" : "판매자"}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-[720px] mx-auto space-y-10">
          {errorMsg && (
            <div className="mb-2 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {errorMsg}
            </div>
          )}
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
          <div className="border rounded-xl p-4">
            <button
              type="button"
              onClick={()=>setOpenInterests(!openInterests)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black">
                평소 관심 (선택 {selectedInterests.length}/4)
              </h3>
              <span className="text-xs text-[#4d4d4d]">{openInterests ? "접기" : "펼치기"}</span>
            </button>
            {openInterests && (<div className="mt-3 flex flex-wrap gap-2">
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
            </div>)}
          </div>

          {/* Section 2: Activities */}
          <div className="border rounded-xl p-4">
            <button
              type="button"
              onClick={()=>setOpenActivities(!openActivities)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black">
                팝업 분위기 (선택 {selectedActivities.length}/4)
              </h3>
              <span className="text-xs text-[#4d4d4d]">{openActivities ? "접기" : "펼치기"}</span>
            </button>
            {openActivities && (<div className="mt-3 flex flex-wrap gap-2">
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
            </div>)}
          </div>

          {/* Section 3: Events */}
          <div className="border rounded-xl p-4">
            <button
              type="button"
              onClick={()=>setOpenEvents(!openEvents)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black">
                편의사항 (선택 {selectedEvents.length}/4)
              </h3>
              <span className="text-xs text-[#4d4d4d]">{openEvents ? "접기" : "펼치기"}</span>
            </button>
            {openEvents && (<div className="mt-3 flex flex-wrap gap-2">
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
            </div>)}
          </div>

          {/* Section 4: Popups */}
          <div className="border rounded-xl p-4">
            <button
              type="button"
              onClick={()=>setOpenPopups(!openPopups)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-['Pretendard:Bold',sans-serif] text-[14px] text-black">
                지역 선택 (선택 {selectedPopups.length}/2)
              </h3>
              <span className="text-xs text-[#4d4d4d]">{openPopups ? "접기" : "펼치기"}</span>
            </button>
            {openPopups && (<div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {regionCards.map(({ name, image }) => {
                const selected = selectedPopups.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleSelection(name, selectedPopups, setSelectedPopups, 2)}
                    className={`relative rounded-[12px] overflow-hidden transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#eb0000] ${
                      selected ? "ring-2 ring-[#eb0000]" : "ring-1 ring-[#e6e6e6]"
                    }`}
                    aria-pressed={selected}
                    aria-label={`${name} 선택`}
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-28 sm:h-32 object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/30 ${selected ? "opacity-60" : "opacity-30"} group-hover:opacity-40 transition-opacity`} />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm ${
                        selected ? "bg-[#eb0000] text-white" : "bg-white/90 text-black"
                      }`}>
                        {name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>)}
          </div>

          {/* Submit Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-3">
              <button
              onClick={handleComplete}
              className="flex-1 h-[44px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center shadow-sm"
                aria-label="가입 완료"
            >
              가입 완료
            </button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      onComplete({
                        interests: [],
                        activities: [],
                        events: [],
                        popups: [],
                      })
                    }
                    className="flex-1 h-[44px] bg-[#5a5a5a] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#4a4a4a] transition-colors flex items-center justify-center shadow-sm"
                    aria-label="선호도 조사 건너뛰기"
                  >
                    건너뛰기
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>선호도 조사를 건너뛰면 맞춤 추천이 어려울 수 있어요</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {onBackToLogin && (
              <button
                onClick={onBackToLogin}
                className="flex-1 h-[44px] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-[#333] bg-white border border-[#cfcfcf] hover:border-[#eb0000] hover:text-[#eb0000] transition-colors flex items-center justify-center shadow-sm"
                aria-label="뒤로가기"
              >
                뒤로가기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}