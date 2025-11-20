import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { refreshProfile } = useUser();
  const [userType, setUserType] = useState('consumer');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    const trimmedLoginId = loginId.trim();
    if (!trimmedLoginId || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    const normalizedUserType = userType === 'seller' ? 'SELLER' : 'CONSUMER';

    try {
      const profile = await login({
        loginId: trimmedLoginId,
        password,
        userType: normalizedUserType,
      });

      await refreshProfile();

      if (profile?.role === 'SELLER') {
        navigate('/seller/dashboard');
        return;
      }
      if (profile?.role === 'ADMIN') {
        navigate('/admin/dashboard');
        return;
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err?.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (!isSubmitting) {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[420px] mx-auto py-12 px-4 sm:px-6">
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <button
            onClick={() => navigate('/')}
            aria-label="Go to home"
            className="hover:opacity-80 transition-opacity"
          >
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[32px] sm:text-[40px] md:text-[56px] text-[#eb0000] leading-normal text-center">
              Da - It daing
            </h1>
          </button>
        </div>

        {/* User Type Selection */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-[#e5e5e5] rounded-[30px] h-[48px] flex items-center px-1.5 w-[280px]">
            {/* Sliding background - 선택된 타입에 따라 베이지색 또는 회색 */}
            <div
              className="absolute h-[38px] rounded-[30px] shadow-sm transition-all duration-300 ease-in-out"
              style={{
                width: "calc(50% - 3px)",
                left: userType === "consumer" ? "6px" : "calc(50% + 3px)",
                backgroundColor: userType === "consumer" ? "#f5e6d3" : "#d3d3d3",
              }}
            />
            
            {/* Buttons */}
            <button
              type="button"
              onClick={() => setUserType("consumer")}
              className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 font-['Pretendard:Regular',sans-serif] flex items-center justify-center ${
                userType === "consumer"
                  ? "text-black font-medium"
                  : "text-gray-500"
              }`}
            >
              소비자
            </button>
            <button
              type="button"
              onClick={() => setUserType("seller")}
              className={`relative z-10 flex-1 h-[38px] rounded-[30px] transition-colors duration-300 font-['Pretendard:Regular',sans-serif] flex items-center justify-center ${
                userType === "seller"
                  ? "text-black font-medium"
                  : "text-gray-500"
              }`}
            >
              판매자
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-4 mb-6" onSubmit={handleSubmit} noValidate>
          {/* ID Input */}
          <div>
            <label className="sr-only" htmlFor="loginId">
              아이디
            </label>
            <input
              id="loginId"
              type="text"
              placeholder="아이디를 입력해주세요"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              className="w-full h-[52px] rounded-[30px] bg-[#f5f5f5] border-[0.7px] border-gray-300 px-6 font-['Pretendard:Regular',sans-serif] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#eb0000]/20"
              disabled={isSubmitting}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          {/* Password Input with Show/Hide button inside */}
          <div>
            <label className="sr-only" htmlFor="password">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full h-[52px] rounded-[30px] bg-[#f5f5f5] border-[0.7px] border-gray-300 px-6 pr-14 font-['Pretendard:Regular',sans-serif] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#eb0000]/20"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center">
              <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#eb0000]">
              {error}
              </p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] bg-[#eb0000] rounded-[30px] font-['Pretendard:Regular',sans-serif] text-white hover:bg-[#cc0000] transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mb-6">
          <button
            onClick={() => navigate('/signup')}
            className="font-['Pretendard:Regular',sans-serif] text-gray-600 hover:underline"
          >
            회원가입
          </button>
        </div>

        {/* Divider with "간편로그인" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 font-['Pretendard:Regular',sans-serif] text-gray-500">
              간편로그인
            </span>
          </div>
        </div>

        {/* Kakao Login */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            className="w-full max-w-[450px] flex items-center justify-center gap-2 h-[52px] bg-[#fee500] rounded-[30px] hover:bg-[#fdd800] transition-colors"
          >
            <MessageCircle className="w-[20px] h-[20px] text-black" aria-hidden="true" />
            <span className="font-['Pretendard:Regular',sans-serif] text-black">
              카카오톡 로그인
            </span>
          </button>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}