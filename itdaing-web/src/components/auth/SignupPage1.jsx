import { useState, useMemo } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import ImageUpload from "../common/ImageUpload";

export function SignupPage1({ onClose, onNext, onGoHome, onLoginClick }) {
  const [userType, setUserType] = useState("consumer");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    ageGroup: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
    email: "",
    mbti: "",
    // 판매자 전용 필드
    activityRegion: "",
    snsUrl: "",
    introduction: "",
    profileImage: null,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConsumer = userType === "consumer";
  const getFieldA11y = (field) => ({
    "aria-invalid": errors[field] ? "true" : "false",
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  const validators = useMemo(
    () => ({
      username: (value) =>
        value.trim().length >= 4
          ? null
          : "아이디는 4자 이상 입력해주세요.",
      name: (value) => (value.trim() ? null : "이름을 입력해주세요."),
      ageGroup: (value) =>
        isConsumer && !value ? "연령대를 선택해주세요." : null,
      nickname: (value) =>
        value.trim() ? null : "닉네임을 입력해주세요.",
      password: (value) =>
        value.length >= 8
          ? null
          : "비밀번호는 8자 이상이어야 합니다.",
      passwordConfirm: (value, data) =>
        value === data.password
          ? null
          : "비밀번호가 일치하지 않습니다.",
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : "유효한 이메일을 입력해주세요.",
      activityRegion: (value) =>
        !isConsumer && !value.trim() ? "활동 지역을 입력해주세요." : null,
    }),
    [isConsumer],
  );

  const validateForm = () => {
    const newErrors = {};
    Object.entries(validators).forEach(([key, validate]) => {
      const message = validate(formData[key] ?? "", formData);
      if (message) {
        newErrors[key] = message;
      }
    });
    return newErrors;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setFormError("입력한 정보를 다시 확인해주세요.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);
    const sanitized = {
      ...formData,
      userType,
      loginId: formData.username.trim(),
      username: formData.username.trim(),
      name: formData.name.trim(),
      nickname: formData.nickname.trim(),
      email: formData.email.trim(),
      ageGroup: isConsumer ? formData.ageGroup : "",
      mbti: isConsumer ? formData.mbti : "",
      // 판매자 전용 필드
      activityRegion: !isConsumer ? formData.activityRegion.trim() : "",
      snsUrl: !isConsumer ? formData.snsUrl.trim() : "",
      introduction: !isConsumer ? formData.introduction.trim() : "",
      profileImage: !isConsumer && formData.profileImage ? {
        url: formData.profileImage.url,
        key: formData.profileImage.key,
      } : null,
    };

    try {
      await onNext?.(sanitized);
    } catch (error) {
      setFormError(error?.message || "요청 처리 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...getFieldA11y("username")}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-xs text-red-600">
                {errors.username}
              </p>
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
                disabled={isSubmitting}
                className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                {...getFieldA11y("name")}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>
            {isConsumer && (
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
                    disabled={isSubmitting}
                    className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] appearance-none focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                    {...getFieldA11y("ageGroup")}
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
                {errors.ageGroup && (
                  <p id="ageGroup-error" className="mt-1 text-xs text-red-600">
                    {errors.ageGroup}
                  </p>
                )}
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
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...getFieldA11y("nickname")}
            />
            {errors.nickname && (
              <p id="nickname-error" className="mt-1 text-xs text-red-600">
                {errors.nickname}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                const newPassword = e.target.value;
                const newFormData = { ...formData, password: newPassword };
                setFormData(newFormData);
                
                // 비밀번호가 변경되면 비밀번호 확인도 재검증
                if (formData.passwordConfirm) {
                  const passwordConfirmError = validators.passwordConfirm(
                    formData.passwordConfirm,
                    newFormData
                  );
                  if (passwordConfirmError) {
                    setErrors({ ...errors, passwordConfirm: passwordConfirmError });
                  } else {
                    const { passwordConfirm, ...restErrors } = errors;
                    setErrors(restErrors);
                  }
                }
              }}
              onBlur={() => {
                // 포커스 아웃 시 검증
                const passwordError = validators.password(formData.password);
                if (passwordError) {
                  setErrors({ ...errors, password: passwordError });
                } else {
                  const { password, ...restErrors } = errors;
                  setErrors(restErrors);
                }
              }}
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...getFieldA11y("password")}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-600">
                {errors.password}
              </p>
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
              onChange={(e) => {
                const newPasswordConfirm = e.target.value;
                setFormData({ ...formData, passwordConfirm: newPasswordConfirm });
                
                // 실시간 검증: 비밀번호 확인 입력 시 즉시 검증
                if (newPasswordConfirm) {
                  const passwordConfirmError = validators.passwordConfirm(
                    newPasswordConfirm,
                    { ...formData, passwordConfirm: newPasswordConfirm }
                  );
                  if (passwordConfirmError) {
                    setErrors({ ...errors, passwordConfirm: passwordConfirmError });
                  } else {
                    const { passwordConfirm, ...restErrors } = errors;
                    setErrors(restErrors);
                  }
                } else {
                  // 입력이 비어있으면 에러 제거
                  const { passwordConfirm, ...restErrors } = errors;
                  setErrors(restErrors);
                }
              }}
              onBlur={() => {
                // 포커스 아웃 시 검증
                const passwordConfirmError = validators.passwordConfirm(
                  formData.passwordConfirm,
                  formData
                );
                if (passwordConfirmError) {
                  setErrors({ ...errors, passwordConfirm: passwordConfirmError });
                } else {
                  const { passwordConfirm, ...restErrors } = errors;
                  setErrors(restErrors);
                }
              }}
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...getFieldA11y("passwordConfirm")}
            />
            {errors.passwordConfirm && (
              <p
                id="passwordConfirm-error"
                className="mt-1 text-xs text-red-600"
              >
                {errors.passwordConfirm}
              </p>
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
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...getFieldA11y("email")}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* MBTI - Only for consumers */}
          {isConsumer && (
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
                  disabled={isSubmitting}
                  className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] appearance-none focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
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

          {/* 판매자 전용 필드 */}
          {!isConsumer && (
            <>
              {/* 활동 지역 */}
              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  활동 지역 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.activityRegion}
                  onChange={(e) =>
                    setFormData({ ...formData, activityRegion: e.target.value })
                  }
                  disabled={isSubmitting}
                  placeholder="예: 광주/남구"
                  className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                  {...getFieldA11y("activityRegion")}
                />
                {errors.activityRegion && (
                  <p id="activityRegion-error" className="mt-1 text-xs text-red-600">
                    {errors.activityRegion}
                  </p>
                )}
              </div>

              {/* SNS URL */}
              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  SNS URL (선택)
                </label>
                <input
                  type="url"
                  value={formData.snsUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, snsUrl: e.target.value })
                  }
                  disabled={isSubmitting}
                  placeholder="https://instagram.com/your_account"
                  className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                />
              </div>

              {/* 소개 */}
              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  소개 (선택)
                </label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) =>
                    setFormData({ ...formData, introduction: e.target.value })
                  }
                  disabled={isSubmitting}
                  placeholder="자신을 소개해주세요"
                  rows={3}
                  className="w-full rounded-[10px] border border-[#9a9a9a] px-4 py-2 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80 resize-none"
                />
              </div>

              {/* 프로필 이미지 */}
              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  프로필 이미지 (선택)
                </label>
                <ImageUpload
                  value={formData.profileImage ? [formData.profileImage] : []}
                  onChange={(images) =>
                    setFormData({ ...formData, profileImage: images[0] || null })
                  }
                  maxImages={1}
                  multiple={false}
                />
              </div>
            </>
          )}

          {formError && (
            <div
              className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
              aria-live="assertive"
            >
              {formError}
            </div>
          )}

          {/* Submit & login switch */}
          <div className="pt-6 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-[48px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[18px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  잠시만 기다려주세요...
                </>
              ) : isConsumer ? (
                "다음 페이지"
              ) : (
                "가입하기"
              )}
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
