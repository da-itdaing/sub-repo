import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { login as loginApi, getMyProfile, getKakaoLoginUrl } from '@/services/authService';
import { ROUTES } from '@/routes/paths';

// 카카오 로그인 버튼 SVG
const KakaoLoginButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full h-[52px] rounded-[12px] bg-[#FEE500] hover:bg-[#FDD835] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.029 4 3 7.163 3 11.097C3 13.616 4.675 15.833 7.225 17.14L6.3 20.588C6.244 20.788 6.47 20.951 6.641 20.833L10.7 18.091C11.125 18.134 11.558 18.156 12 18.156C16.971 18.156 21 14.993 21 11.059C21 7.163 16.971 4 12 4Z" fill="#191919"/>
    </svg>
    <span className="text-[#191919] font-medium text-[16px]">카카오 로그인</span>
  </button>
);

// Zod 검증 스키마
const loginSchema = z.object({
  loginId: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: loginStore, setUser } = useAuthStore();
  const [userType, setUserType] = useState('consumer'); // consumer or seller
  const [error, setError] = useState('');
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

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
      
      if (response.accessToken && response.refreshToken) {
        loginStore(null, response.accessToken, response.refreshToken, response.role);

        let resolvedRole = response.role;

        try {
          const userProfile = await getMyProfile();
          setUser(userProfile);
          resolvedRole = userProfile.role ?? resolvedRole;
        } catch (profileError) {
          console.error('Failed to fetch profile after login:', profileError);
        }

        const nextPath =
          resolvedRole === 'SELLER'
            ? ROUTES.seller.dashboard
            : resolvedRole === 'ADMIN'
            ? ROUTES.admin.dashboard
            : ROUTES.home;

        navigate(nextPath, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.error?.message || err?.message || '로그인에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async () => {
    try {
      setIsKakaoLoading(true);
      setError('');
      const response = await getKakaoLoginUrl(userType);
      if (response.authUrl) {
        window.location.href = response.authUrl;
      }
    } catch (err) {
      console.error('Kakao login error:', err);
      setError('카카오 로그인을 시작할 수 없습니다.');
      setIsKakaoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[420px] mx-auto py-12 px-6">
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <h1 className="font-['Luckiest_Guy'] text-[32px] sm:text-[40px] md:text-[56px] text-primary leading-normal w-[280px] sm:w-auto text-center">
            DA ITDAING
          </h1>
        </div>

        {/* User Type Selection */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-[#e5e5e5] rounded-[30px] h-[48px] flex items-center px-1.5 w-[280px]">
            {/* Sliding white background */}
            <div
              className="absolute h-[38px] bg-white rounded-[30px] shadow-sm transition-all duration-300 ease-in-out"
              style={{
                width: 'calc(50% - 8px)',
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

        {/* 카카오 간편 로그인 (상단 배치) */}
        <div className="mb-8">
          <KakaoLoginButton onClick={handleKakaoLogin} disabled={isKakaoLoading} />
          <p className="text-center text-[12px] text-gray-500 mt-2">
            카카오로 3초만에 시작하기
          </p>
        </div>

        {/* 일반 로그인 구분선 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[1px] bg-gray-200" />
          <span className="text-[12px] text-gray-400">또는 아이디로 로그인</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
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
              일반 회원가입
            </button>
          </div>
        </form>

        
        {/* Bottom Back Navigation */}
        <div className="mt-12 flex justify-center">
        <button
            type="button"
          onClick={() => navigate(ROUTES.home)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

