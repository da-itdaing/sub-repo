import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Loader2 } from 'lucide-react';
import ImageUpload from '../custom-ui/ImageUpload.jsx';

export function SignupPage1({
  onClose,
  onNext,
  onGoHome,
  onLoginClick,
}) {
  const [userType, setUserType] = useState('consumer');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    ageGroup: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    email: '',
    mbti: '',
    activityRegion: '',
    snsUrl: '',
    introduction: '',
    profileImage: null,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConsumer = userType === 'consumer';

  const validators = useMemo(
    () => ({
      username: value =>
        value.trim().length >= 4 ? null : '아이디는 4자 이상 입력해주세요.',
      name: value => (value.trim() ? null : '이름을 입력해주세요.'),
      ageGroup: value =>
        isConsumer && !value ? '연령대를 선택해주세요.' : null,
      nickname: value =>
        value.trim() ? null : '닉네임을 입력해주세요.',
      password: value =>
        value.length >= 8 ? null : '비밀번호는 8자 이상이어야 합니다.',
      passwordConfirm: value =>
        value === formData.password ? null : '비밀번호가 일치하지 않습니다.',
      email: value =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : '유효한 이메일을 입력해주세요.',
      activityRegion: value =>
        !isConsumer && !value.trim() ? '활동 지역을 입력해주세요.' : null,
    }),
    [formData.password, isConsumer],
  );

  const fieldProps = fieldName => ({
    'aria-invalid': errors[fieldName] ? 'true' : undefined,
    'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors = {};
    Object.entries(validators).forEach(([field, validateField]) => {
      const message = validateField(formData[field] ?? '');
      if (message) {
        nextErrors[field] = message;
      }
    });
    return nextErrors;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError('입력한 정보를 다시 확인해주세요.');
      return;
    }

    setErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    const payload = {
      ...formData,
      userType,
      loginId: formData.username.trim(),
      username: formData.username.trim(),
      name: formData.name.trim(),
      nickname: formData.nickname.trim(),
      email: formData.email.trim(),
      ageGroup: isConsumer ? formData.ageGroup : '',
      mbti: isConsumer ? formData.mbti : '',
      activityRegion: isConsumer ? '' : formData.activityRegion.trim(),
      snsUrl: isConsumer ? '' : formData.snsUrl.trim(),
      introduction: isConsumer ? '' : formData.introduction.trim(),
      profileImage:
        !isConsumer && formData.profileImage
          ? {
              url: formData.profileImage.url,
              key: formData.profileImage.key,
            }
          : null,
    };

    try {
      await onNext?.(payload);
    } catch (error) {
      setSubmitError(error?.message || '요청 처리 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[800px] mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <button
            type="button"
            className="group"
            onClick={onGoHome}
            aria-label="홈으로 이동"
          >
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[64px] md:text-[72px] text-[#eb0000] leading-none tracking-tight group-hover:scale-105 transition-transform">
              Da - It daing
            </h1>
          </button>
        </div>

        <div className="flex mb-12 border-b">
          <button
            type="button"
            className={`flex-1 h-[44px] font-['Luckiest_Guy:Regular','Noto_Sans_KR:Regular',sans-serif] text-[20px] flex items-center justify-center ${
              userType === 'consumer'
                ? 'text-[#eb0000] border-b-[1px] border-[#eb0000]'
                : 'text-[#9a9a9a] border-b-[1px] border-[#9a9a9a]'
            }`}
            style={{ fontVariationSettings: "'wght' 400" }}
            onClick={() => setUserType('consumer')}
          >
            소비자
          </button>
          <button
            type="button"
            className={`flex-1 h-[44px] font-['Luckiest_Guy:Regular','Noto_Sans_KR:Regular',sans-serif] text-[20px] flex items-center justify-center ${
              userType === 'seller'
                ? 'text-[#eb0000] border-b-[1px] border-[#eb0000]'
                : 'text-[#9a9a9a] border-b-[1px] border-[#9a9a9a]'
            }`}
            style={{ fontVariationSettings: "'wght' 400" }}
            onClick={() => setUserType('seller')}
          >
            판매자
          </button>
        </div>

        <div className="max-w-[560px] mx-auto space-y-8">
          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              아이디
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={event => handleChange('username', event.target.value)}
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...fieldProps('username')}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-xs text-red-600">
                {errors.username}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={event => handleChange('name', event.target.value)}
                disabled={isSubmitting}
                className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                {...fieldProps('name')}
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
                    onChange={event => handleChange('ageGroup', event.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] appearance-none focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                    {...fieldProps('ageGroup')}
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

          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={event => handleChange('nickname', event.target.value)}
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...fieldProps('nickname')}
            />
            {errors.nickname && (
              <p id="nickname-error" className="mt-1 text-xs text-red-600">
                {errors.nickname}
              </p>
            )}
          </div>

          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={event => handleChange('password', event.target.value)}
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...fieldProps('password')}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              비밀번호 재입력
            </label>
            <input
              type="password"
              value={formData.passwordConfirm}
              onChange={event => handleChange('passwordConfirm', event.target.value)}
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...fieldProps('passwordConfirm')}
            />
            {errors.passwordConfirm && (
              <p id="passwordConfirm-error" className="mt-1 text-xs text-red-600">
                {errors.passwordConfirm}
              </p>
            )}
          </div>

          <div>
            <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={event => handleChange('email', event.target.value)}
              disabled={isSubmitting}
              className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
              {...fieldProps('email')}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {isConsumer && (
            <div>
              <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                MBTI
              </label>
              <div className="relative">
                <select
                  value={formData.mbti}
                  onChange={event => handleChange('mbti', event.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] appearance-none focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                >
                  <option value="">선택</option>
                  {[
                    'ISTJ',
                    'ISFJ',
                    'INFJ',
                    'INTJ',
                    'ISTP',
                    'ISFP',
                    'INFP',
                    'INTP',
                    'ESTP',
                    'ESFP',
                    'ENFP',
                    'ENTP',
                    'ESTJ',
                    'ESFJ',
                    'ENFJ',
                    'ENTJ',
                  ].map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4b4b4b] pointer-events-none" />
              </div>
            </div>
          )}

          {!isConsumer && (
            <div className="space-y-6">
              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  활동 지역 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.activityRegion}
                  onChange={event => handleChange('activityRegion', event.target.value)}
                  disabled={isSubmitting}
                  placeholder="예: 광주/남구"
                  className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                  {...fieldProps('activityRegion')}
                />
                {errors.activityRegion && (
                  <p id="activityRegion-error" className="mt-1 text-xs text-red-600">
                    {errors.activityRegion}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  SNS URL (선택)
                </label>
                <input
                  type="url"
                  value={formData.snsUrl}
                  onChange={event => handleChange('snsUrl', event.target.value)}
                  disabled={isSubmitting}
                  placeholder="https://instagram.com/your_account"
                  className="w-full h-[40px] rounded-[10px] border border-[#9a9a9a] px-4 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80"
                />
              </div>

              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  소개 (선택)
                </label>
                <textarea
                  value={formData.introduction}
                  onChange={event => handleChange('introduction', event.target.value)}
                  disabled={isSubmitting}
                  placeholder="자신을 소개해주세요"
                  rows={3}
                  className="w-full rounded-[10px] border border-[#9a9a9a] px-4 py-2 font-['Pretendard:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#eb0000] disabled:opacity-80 resize-none"
                />
              </div>

              <div>
                <label className="block font-['Pretendard:Regular',sans-serif] text-[14px] text-black mb-2">
                  프로필 이미지 (선택)
                </label>
                <ImageUpload
                  value={formData.profileImage ? [formData.profileImage] : []}
                  onChange={files =>
                    handleChange('profileImage', files[0] ? files[0] : null)
                  }
                  maxImages={1}
                  multiple={false}
                />
              </div>
            </div>
          )}

          {submitError && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600" role="alert" aria-live="assertive">
              {submitError}
            </div>
          )}

          <div className="pt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-[48px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Bold',sans-serif] text-[18px] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  잠시만 기다려주세요...
                </span>
              ) : (
                isConsumer ? '다음 페이지' : '가입하기'
              )}
            </button>
            <button
              type="button"
              onClick={onLoginClick ?? onClose}
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

SignupPage1.propTypes = {
  onClose: PropTypes.func,
  onNext: PropTypes.func,
  onGoHome: PropTypes.func,
  onLoginClick: PropTypes.func,
};

SignupPage1.defaultProps = {
  onClose: undefined,
  onNext: undefined,
  onGoHome: undefined,
  onLoginClick: undefined,
};

export default SignupPage1;
