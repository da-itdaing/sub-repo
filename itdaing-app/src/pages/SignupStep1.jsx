import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ROUTES } from '@/routes/paths';
import SignupStepHeader from '@/components/signup/SignupStepHeader';
import { signupSeller } from '@/services/authService';

// Zod 검증 스키마
const signupStep1Schema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  passwordConfirm: z.string(),
  loginId: z.string().min(4, '아이디는 최소 4자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
  nickname: z.string().min(1, '닉네임을 입력해주세요'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

const SignupStep1 = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('consumer'); // consumer or seller

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupStep1Schema),
  });

  const onSubmit = async (data) => {
    // 소비자는 2단계로, 판매자는 바로 가입 처리
    if (userType === 'consumer') {
      // 데이터를 localStorage에 임시 저장하고 2단계로 이동
      localStorage.setItem('signupData', JSON.stringify({ ...data, userType }));
      navigate(ROUTES.signupStep2);
    } else {
      // 판매자 회원가입 처리
      try {
        const requestData = {
          email: data.email,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
          loginId: data.loginId,
          name: data.name,
          nickname: data.nickname,
        };
        
        await signupSeller(requestData);
        
        // 회원가입 성공
        alert('판매자 회원가입이 완료되었습니다!');
        navigate(ROUTES.login);
      } catch (error) {
        console.error('Seller signup error:', error);
        alert(error.message || '판매자 회원가입에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideSearchBar />
      
      <main className="flex-1 pt-10 pb-12 md:pt-12">
        <div className="w-full max-w-[500px] md:max-w-[760px] mx-auto px-5">
          <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100 md:p-8">
            <SignupStepHeader
              currentStep={1}
              onBack={() => navigate(ROUTES.login)}
              onExit={() => navigate(ROUTES.home)}
            />

            <div className="mt-6 space-y-2 text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">STEP 1 · 기본 정보</p>
              <h2 className="text-2xl font-bold text-gray-900">계정을 만들어볼까요?</h2>
              <p className="text-sm text-gray-500">
                로그인에 사용할 계정 정보를 입력해주세요. <br />이후 언제든 선호 정보를 수정할 수 있어요.
              </p>
            </div>

            {/* User Type Selection */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-gray-800 mb-3">가입 유형 선택</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'consumer', label: '소비자', description: '팝업을 찾고 찜하기' },
                  { key: 'seller', label: '판매자', description: '팝업 등록 및 관리' },
                ].map((option) => {
                  const isActive = userType === option.key;
                  return (
                <button
                  type="button"
                      key={option.key}
                      onClick={() => setUserType(option.key)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        isActive ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-primary/40'
                      }`}
                    >
                      <p className="text-base font-semibold">{option.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <div className="grid gap-4">
              <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">이메일</label>
                <input
                  {...register('email')}
                  type="email"
                    placeholder="example@daitdaing.com"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
                {errors.email && <p className="text-xs text-primary mt-1">{errors.email.message}</p>}
              </div>

                <div className="grid gap-4 md:grid-cols-2">
              <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">아이디</label>
                <input
                  {...register('loginId')}
                  type="text"
                      placeholder="itdaing_fan"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
                {errors.loginId && <p className="text-xs text-primary mt-1">{errors.loginId.message}</p>}
              </div>
              <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">이름</label>
                <input
                  {...register('name')}
                  type="text"
                      placeholder="홍길동"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
                {errors.name && <p className="text-xs text-primary mt-1">{errors.name.message}</p>}
                  </div>
              </div>

              <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">닉네임</label>
                <input
                  {...register('nickname')}
                  type="text"
                    placeholder="광주 팝업러버"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
                {errors.nickname && <p className="text-xs text-primary mt-1">{errors.nickname.message}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">비밀번호</label>
                    <input
                      {...register('password')}
                      type="password"
                      placeholder="영문, 숫자 포함 8자 이상"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                    {errors.password && <p className="text-xs text-primary mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">비밀번호 확인</label>
                    <input
                      {...register('passwordConfirm')}
                      type="password"
                      placeholder="다시 입력해주세요"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                    {errors.passwordConfirm && (
                      <p className="text-xs text-primary mt-1">{errors.passwordConfirm.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-primary py-3 text-base font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {userType === 'consumer' ? '다음 단계로' : '회원가입 완료'}
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.home)}
            className="mt-6 w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            가입 취소하고 홈으로 돌아가기
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupStep1;

