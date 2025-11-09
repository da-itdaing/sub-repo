import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SignupPage1Props {
  onNext: (data: any) => void;
  onBackToLogin?: () => void;
  onMyPageClick?: () => void;
  onNearbyExploreClick?: () => void;
  onHomeClick?: () => void;
}

export function SignupPage1({ onNext, onBackToLogin, onHomeClick }: SignupPage1Props) {
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
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const handleSubmit = () => {
    // Basic validation
    const newErrors: { [k: string]: string } = {};
    if (!formData.username) newErrors.username = "아이디를 입력해주세요";
    if (!formData.name) newErrors.name = "이름을 입력해주세요";
    if (!formData.password || formData.password.length < 6) newErrors.password = "비밀번호는 6자 이상";
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    if (!formData.email || !formData.email.includes("@")) newErrors.email = "유효한 이메일을 입력해주세요";
    if (userType === "consumer" && !formData.ageGroup) newErrors.ageGroup = "연령대를 선택해주세요";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Submit to next step
    onNext({ ...formData, userType });
  };

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[800px] mx-auto py-16 px-6">
        {/* Logo (clickable to Home) */}
        <div className="text-center mb-12">
          <button
            type="button"
            aria-label="메인으로 이동"
            onClick={onHomeClick}
            className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#eb0000] rounded-md"
          >
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[44px] sm:text-[56px] text-[#eb0000] leading-normal">
              Da - It daing
            </h1>
          </button>
        </div>

  {/* User Type Selection & Back to Login */}
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

        {/* Back to Login */}
        {onBackToLogin && (
          <div className="mb-6 -mt-8 flex justify-end">
            <button
              onClick={onBackToLogin}
              className="text-sm text-[#4b4b4b] underline hover:text-black font-['Pretendard:Regular',sans-serif]"
            >
              로그인으로 돌아가기
            </button>
          </div>
        )}

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
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-xs text-[#eb0000]">{errors.username}</p>
            )}
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
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-xs text-[#eb0000]">{errors.name}</p>
              )}
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
                    aria-invalid={!!errors.ageGroup}
                    aria-describedby={errors.ageGroup ? 'age-error' : undefined}
                  >
                    <option value="">선택</option>
                    <option value="10대">10대</option>
                    <option value="20대">20대</option>
                    <option value="30대">30대</option>
                    <option value="40대">40대</option>
                    <option value="50대 이상">50대 이상</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b4b4b] pointer-events-none" />
                  {errors.ageGroup && (
                    <p id="age-error" className="mt-1 text-xs text-[#eb0000]">{errors.ageGroup}</p>
                  )}
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
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-[#eb0000]">{errors.password}</p>
            )}
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
              aria-invalid={!!errors.passwordConfirm}
              aria-describedby={errors.passwordConfirm ? 'password-confirm-error' : undefined}
            />
            {errors.passwordConfirm && (
              <p id="password-confirm-error" className="mt-1 text-xs text-[#eb0000]">{errors.passwordConfirm}</p>
            )}
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
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-[#eb0000]">{errors.email}</p>
            )}
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

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              className="w-full h-[40px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[16px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center"
              aria-label={userType === 'consumer' ? '다음 페이지로 이동' : '가입하기'}
            >
              {userType === "consumer" ? "다음 페이지" : "가입하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}