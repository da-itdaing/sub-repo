import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { login as loginApi, getMyProfile } from '@/services/authService';
import { ROUTES } from '@/routes/paths';

// Zod 검증 스키마
const loginSchema = z.object({
  loginId: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const [userType, setUserType] = useState('consumer'); // consumer or seller
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      
      // API 호출
      const response = await loginApi(data.loginId, data.password);
      
      // 토큰 저장
      if (response.accessToken && response.refreshToken) {
        loginStore(null, response.accessToken, response.refreshToken);
        
        // 사용자 정보 조회
        try {
          const userProfile = await getMyProfile();
          loginStore(userProfile, response.accessToken, response.refreshToken);
          
          // 역할에 따라 리다이렉트
          if (userProfile.role === 'SELLER') {
            navigate(ROUTES.seller.dashboard);
          } else {
            navigate(ROUTES.home);
          }
        } catch (profileError) {
          // 프로필 조회 실패해도 로그인은 성공
          navigate(ROUTES.home);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.error?.message || err?.message || '로그인에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[420px] mx-auto py-12 px-6">
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <h1 className="font-bold text-[32px] sm:text-[40px] md:text-[56px] text-primary leading-normal w-[280px] sm:w-auto text-center">
            Da - It daing
          </h1>
        </div>

        {/* User Type Selection */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-[#e5e5e5] rounded-[30px] h-[48px] flex items-center px-1.5 w-[280px]">
            {/* Sliding white background */}
            <div
              className="absolute h-[38px] bg-white rounded-[30px] shadow-sm transition-all duration-300 ease-in-out"
              style={{
                width: 'calc(50% - 3px)',
                left: userType === 'consumer' ? '6px' : 'calc(50% + 3px)',
              }}
            />
            
            {/* Buttons */}
            <button
              type="button"
              onClick={() => setUserType('consumer')}
              className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 flex items-center justify-center ${
                userType === 'consumer' ? 'text-black' : 'text-gray-500'
              }`}
            >
              소비자
            </button>
            <button
              type="button"
              onClick={() => setUserType('seller')}
              className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 flex items-center justify-center ${
                userType === 'seller' ? 'text-black' : 'text-gray-500'
              }`}
            >
              판매자
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ID/Password Inputs */}
          <div className="space-y-4 mb-6">
            <input
              {...register('loginId')}
              type="text"
              placeholder="아이디를 입력해주세요"
              className="w-full h-[52px] rounded-[30px] bg-[#f5f5f5] border-[0.7px] border-gray-300 px-6 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.loginId && (
              <p className="text-xs text-primary px-6">{errors.loginId.message}</p>
            )}
            
            <input
              {...register('password')}
              type="password"
              placeholder="비밀번호를 입력해주세요"
              className="w-full h-[52px] rounded-[30px] bg-[#f5f5f5] border-[0.7px] border-gray-300 px-6 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.password && (
              <p className="text-xs text-primary px-6">{errors.password.message}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-center">
              <p className="text-[12px] text-primary">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-[30px] bg-primary hover:bg-primary/90 text-white font-semibold text-[18px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

          {/* Links */}
          <div className="flex justify-center items-center gap-2 text-[12px] text-gray-600">
            <button 
              type="button"
              onClick={() => navigate(ROUTES.signupStep1)}
              className="hover:text-primary transition-colors"
            >
              회원가입
            </button>
            <span>|</span>
            <button type="button" className="hover:text-primary transition-colors">
              아이디/비밀번호 찾기
            </button>
          </div>
        </form>

        {/* Close Button */}
        <button
          onClick={() => navigate(ROUTES.home)}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

