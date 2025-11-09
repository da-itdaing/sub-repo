import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SignupPage1Props {
  onClose: () => void; // back to login
  onNext: (data: any) => void;
  onGoHome?: () => void; // go to main
  onLoginClick?: () => void; // switch to login
}

export function SignupPage1({ onClose, onNext, onGoHome, onLoginClick }: SignupPage1Props) {
  const [userType, setUserType] = useState<"consumer" | "seller">("consumer");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    ageGroup: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
    email: "",
    mbti: "",
  });

  const handleSubmit = () => {
    // Validate form data
    if (userType === "consumer") {
      onNext({ ...formData, userType });
    } else {
      // For seller, skip to final page
      console.log("Seller signup", { ...formData, userType });
    }
  };

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[800px] mx-auto py-16 px-6">
        {/* Logo clickable to go home */}
        <div className="text-center mb-12">
          <button onClick={onGoHome} className="group" aria-label="홈으로 이동">
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[64px] md:text-[72px] text-[#eb0000] leading-none tracking-tight group-hover:scale-105 transition-transform">
              Da - It daing
            </h1>
          </button>
        </div>

        {/* User Type Selection */}
        <div className="flex mb-12 border-b">
          <button
            onClick={() => setUserType("consumer")}
            className={`flex-1 h-[44px] font-['Luckiest_Guy:Regular','Noto_Sans_KR:Regular',sans-serif] text-[20px] flex items-center justify-center ${
              userType === "consumer"
                ? "text-[#eb0000] border-b-[1px] border-[#eb0000]"
                : "text-[#9a9a9a] border-b-[1px] border-[#9a9a9a]"
            }`}
            style={{ fontVariationSettings: "'wght' 400" }}
          >
            소비자
          </button>
          <button
            onClick={() => setUserType("seller")}
            className={`flex-1 h-[44px] font-['Luckiest_Guy:Regular','Noto_Sans_KR:Regular',sans-serif] text-[20px] flex items-center justify-center ${
              userType === "seller"
                ? "text-[#eb0000] border-b-[1px] border-[#eb0000]"
                : "text-[#9a9a9a] border-b-[1px] border-[#9a9a9a]"
            }`}
            style={{ fontVariationSettings: "'wght' 400" }}
          >
            판매자
          </button>
        </div>

        {/* Form */}
        <div className="max-w-[560px] mx-auto space-y-8">
          {/* 아이디 */}
          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              아이디
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* 이름 & 연령대 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000]"
              />
            </div>
            {userType === "consumer" && (
              <div className="flex-1">
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  연령대
                </label>
                <div className="relative">
                  <select
                    value={formData.ageGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, ageGroup: e.target.value })
                    }
                    className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] appearance-none focus:outline-none focus:border-[#eb0000]"
                  >
                    <option value="">선택</option>
                    <option value="10대">10대</option>
                    <option value="20대">20대</option>
                    <option value="30대">30대</option>
                    <option value="40대">40대</option>
                    <option value="50대 이상">50대 이상</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b4b4b] pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* 비밀번호 재입력 */}
          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              비밀번호 재입력
            </label>
            <input
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) =>
                setFormData({ ...formData, passwordConfirm: e.target.value })
              }
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000]"
            />
          </div>

          {/* MBTI - Only for consumers */}
          {userType === "consumer" && (
            <div>
              <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                MBTI
              </label>
              <div className="relative">
                <select
                  value={formData.mbti}
                  onChange={(e) =>
                    setFormData({ ...formData, mbti: e.target.value })
                  }
                  className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] appearance-none focus:outline-none focus:border-[#eb0000]"
                >
                  <option value="">선택</option>
                  <option value="ISTJ">ISTJ</option>
                  <option value="ISFJ">ISFJ</option>
                  <option value="INFJ">INFJ</option>
                  <option value="INTJ">INTJ</option>
                  <option value="ISTP">ISTP</option>
                  <option value="ISFP">ISFP</option>
                  <option value="INFP">INFP</option>
                  <option value="INTP">INTP</option>
                  <option value="ESTP">ESTP</option>
                  <option value="ESFP">ESFP</option>
                  <option value="ENFP">ENFP</option>
                  <option value="ENTP">ENTP</option>
                  <option value="ESTJ">ESTJ</option>
                  <option value="ESFJ">ESFJ</option>
                  <option value="ENFJ">ENFJ</option>
                  <option value="ENTJ">ENTJ</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b4b4b] pointer-events-none" />
              </div>
            </div>
          )}

          {/* Submit & login switch */}
          <div className="pt-6 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              className="w-full h-[48px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[18px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center"
            >
              {userType === "consumer" ? "다음 페이지" : "가입하기"}
            </button>
            <button
              onClick={onLoginClick || onClose}
              className="w-full h-[44px] bg-gray-200 rounded-[30px] font-['Pretendard:Medium',sans-serif] text-[15px] text-gray-700 hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              이미 계정이 있으신가요? 로그인 하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
