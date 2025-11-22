import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ROUTES } from '@/routes/paths';

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
    // 데이터를 state로 전달하거나 localStorage에 임시 저장
    localStorage.setItem('signupData', JSON.stringify({ ...data, userType }));
    
    // 소비자는 2단계로, 판매자는 바로 가입 처리
    if (userType === 'consumer') {
      navigate(ROUTES.signupStep2);
    } else {
      // 판매자 회원가입 처리 (추후 구현)
      alert('판매자 회원가입은 추후 구현 예정입니다');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header hideSearchBar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-[480px] mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">회원가입</h2>

            {/* User Type Selection */}
            <div className="flex justify-center mb-6">
              <div className="relative bg-[#e5e5e5] rounded-[30px] h-[48px] flex items-center px-1.5 w-[280px]">
                <div
                  className="absolute h-[38px] bg-white rounded-[30px] shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    width: 'calc(50% - 3px)',
                    left: userType === 'consumer' ? '6px' : 'calc(50% + 3px)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setUserType('consumer')}
                  className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 ${
                    userType === 'consumer' ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  소비자
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('seller')}
                  className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 ${
                    userType === 'seller' ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  판매자
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="이메일"
                  className="w-full h-[48px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.email && <p className="text-xs text-primary mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <input
                  {...register('loginId')}
                  type="text"
                  placeholder="아이디"
                  className="w-full h-[48px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.loginId && <p className="text-xs text-primary mt-1">{errors.loginId.message}</p>}
              </div>

              <div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="비밀번호 (8자 이상)"
                  className="w-full h-[48px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.password && <p className="text-xs text-primary mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <input
                  {...register('passwordConfirm')}
                  type="password"
                  placeholder="비밀번호 확인"
                  className="w-full h-[48px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.passwordConfirm && <p className="text-xs text-primary mt-1">{errors.passwordConfirm.message}</p>}
              </div>

              <div>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="이름"
                  className="w-full h-[48px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.name && <p className="text-xs text-primary mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <input
                  {...register('nickname')}
                  type="text"
                  placeholder="닉네임"
                  className="w-full h-[48px] rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.nickname && <p className="text-xs text-primary mt-1">{errors.nickname.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-lg transition-colors disabled:opacity-50 mt-6"
              >
                {userType === 'consumer' ? '다음 단계' : '회원가입'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupStep1;

