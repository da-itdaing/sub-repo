import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';
import { signupSeller } from '@/services/authService';

const AGE_GROUP_OPTIONS = ['10대', '20대', '30대', '40대', '50대 이상'];
const MBTI_OPTIONS = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

const baseSchema = z.object({
  loginId: z.string().trim().min(4, '아이디는 4자 이상 입력해주세요.'),
  name: z.string().trim().min(1, '이름을 입력해주세요.'),
  nickname: z.string().trim().min(1, '닉네임을 입력해주세요.'),
  email: z.string().trim().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  passwordConfirm: z.string().min(8, '비밀번호를 다시 입력해주세요.'),
});

const consumerSchema = baseSchema.extend({
  userType: z.literal('CONSUMER'),
  ageGroup: z.string().min(1, '연령대를 선택해주세요.'),
  mbti: z.string().optional(),
});

const sellerSchema = baseSchema.extend({
  userType: z.literal('SELLER'),
  activityRegion: z.string().trim().min(1, '활동 지역을 입력해주세요.'),
  snsUrl: z.string().url('URL 형식이 올바르지 않습니다.').optional().or(z.literal('')),
  introduction: z.string().max(500, '소개는 500자 이하로 입력해주세요.').optional().or(z.literal('')),
});

const signupSchema = z
  .discriminatedUnion('userType', [consumerSchema, sellerSchema])
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

const SignupStepOne = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userType: 'CONSUMER',
      loginId: '',
      name: '',
      nickname: '',
      email: '',
      password: '',
      passwordConfirm: '',
      ageGroup: '',
      mbti: '',
      activityRegion: '',
      snsUrl: '',
      introduction: '',
    },
  });

  const userType = useWatch({ control, name: 'userType' });
  const isConsumer = userType === 'CONSUMER';

  const parsedErrors = useMemo(() => errors, [errors]);

  const handleSellerSignup = async (values) => {
    const payload = {
      email: values.email.trim(),
      password: values.password,
      passwordConfirm: values.passwordConfirm,
      loginId: values.loginId.trim(),
      name: values.name.trim(),
      nickname: values.nickname.trim(),
      activityRegion: values.activityRegion.trim(),
      snsUrl: values.snsUrl?.trim() || undefined,
      introduction: values.introduction?.trim() || undefined,
    };

    await signupSeller(payload);
    await login({
      loginId: payload.loginId,
      password: values.password,
      userType: 'SELLER',
    });
    navigate('/seller/dashboard', { replace: true });
  };

  const onSubmit = async (values) => {
    setFormError('');
    const normalized = {
      ...values,
      loginId: values.loginId.trim(),
      name: values.name.trim(),
      nickname: values.nickname.trim(),
      email: values.email.trim(),
    };

    try {
      if (values.userType === 'SELLER') {
        await handleSellerSignup(normalized);
        return;
      }

      sessionStorage.setItem('signup-consumer', JSON.stringify(normalized));
      navigate('/signup/preferences', { state: { consumer: normalized } });
    } catch (error) {
      setFormError(error?.message || '요청 처리 중 문제가 발생했습니다.');
    }
  };

  const ErrorText = ({ message }) =>
    message ? <p className="text-xs text-brand mt-1">{message}</p> : null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[720px] space-y-10">
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity"
          >
            <h1 className="font-display text-5xl text-brand tracking-tight">DA-ITDAING</h1>
          </button>
          <p className="text-sm text-gray-500">다음 정보를 채워 회원가입을 진행해주세요.</p>
        </div>

        <div className="grid grid-cols-2 gap-1 bg-gray-200 rounded-full p-1">
          {['CONSUMER', 'SELLER'].map((type) => (
            <label key={type}>
              <input
                type="radio"
                value={type}
                {...register('userType')}
                className="hidden"
                defaultChecked={type === 'CONSUMER'}
              />
              <span
                className={`h-10 rounded-full text-sm font-semibold flex items-center justify-center cursor-pointer transition ${
                  userType === type ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type === 'CONSUMER' ? '소비자' : '판매자'}
              </span>
            </label>
          ))}
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">아이디</label>
              <input
                type="text"
                className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="4자 이상 입력"
                {...register('loginId')}
              />
              <ErrorText message={parsedErrors.loginId?.message} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">이름</label>
              <input
                type="text"
                className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                {...register('name')}
              />
              <ErrorText message={parsedErrors.name?.message} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">닉네임</label>
              <input
                type="text"
                className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                {...register('nickname')}
              />
              <ErrorText message={parsedErrors.nickname?.message} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">이메일</label>
              <input
                type="email"
                className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="example@email.com"
                {...register('email')}
              />
              <ErrorText message={parsedErrors.email?.message} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">비밀번호</label>
              <input
                type="password"
                className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="8자 이상 입력"
                autoComplete="new-password"
                {...register('password')}
              />
              <ErrorText message={parsedErrors.password?.message} />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">비밀번호 재입력</label>
              <input
                type="password"
                className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                autoComplete="new-password"
                {...register('passwordConfirm')}
              />
              <ErrorText message={parsedErrors.passwordConfirm?.message} />
            </div>
          </div>

          {isConsumer && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">연령대</label>
                <select
                  className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  {...register('ageGroup')}
                >
                  <option value="">선택</option>
                  {AGE_GROUP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ErrorText message={parsedErrors.ageGroup?.message} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">MBTI (선택)</label>
                <select
                  className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  {...register('mbti')}
                >
                  <option value="">선택안함</option>
                  {MBTI_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!isConsumer && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">활동 지역</label>
                <input
                  type="text"
                  className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="예: 광주 남구"
                  {...register('activityRegion')}
                />
                <ErrorText message={parsedErrors.activityRegion?.message} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">SNS URL (선택)</label>
                <input
                  type="url"
                  className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="https://instagram.com/itdaing"
                  {...register('snsUrl')}
                />
                <ErrorText message={parsedErrors.snsUrl?.message} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">소개 (선택)</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="자신의 팝업 운영 경험을 소개해주세요."
                  {...register('introduction')}
                />
                <ErrorText message={parsedErrors.introduction?.message} />
              </div>
            </div>
          )}

          {formError && <p className="text-sm text-brand text-center">{formError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : isConsumer ? (
              '다음 단계로'
            ) : (
              '가입하기'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-brand font-semibold hover:underline"
              >
                로그인 하기
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupStepOne;

