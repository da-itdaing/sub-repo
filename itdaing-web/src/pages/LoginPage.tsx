import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, ChevronLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [userType, setUserType] = useState<'consumer' | 'seller'>('consumer');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const LOGIN_ID_RE = useMemo(() => /^[a-z0-9._-]{4,20}$/, []);
  const PASSWORD_RE = useMemo(() => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/, []);

  const loginIdError =
    loginId.length === 0
      ? ''
      : LOGIN_ID_RE.test(loginId) ? '' : '아이디는 소문자/숫자/._- 4~20자여야 합니다.';
  const passwordError =
    password.length === 0
      ? ''
      : PASSWORD_RE.test(password) ? '' : '영문, 숫자, 특수문자를 포함한 8~32자 비밀번호를 입력해 주세요.';
  const canSubmit = LOGIN_ID_RE.test(loginId) && PASSWORD_RE.test(password);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async () => {
    setError('');
    
    // 입력 값 검증
    if (!canSubmit) return;
    
    try {
      // temporary debug: trace login flow
      // eslint-disable-next-line no-console
      console.log('[LoginPage] submitting login', { loginId });
      await login(loginId.trim(), password);
      // 로그인 성공 후 원래 페이지로 이동 또는 판매자는 대시보드로
      const user = await authService.getMyProfile();
      // eslint-disable-next-line no-console
      console.log('[LoginPage] login success, role=', user.role);
      if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-y-auto">
      <div className="relative w-full max-w-[420px] mx-auto py-12 px-6">
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-[#eb0000] hover:opacity-80 transition"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">뒤로가기</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-[#eb0000] transition"
            aria-label="홈으로"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">홈</span>
          </button>
        </div>
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <h1 className="font-display text-[48px] sm:text-[56px] md:text-[72px] text-[#eb0000] leading-none tracking-wide uppercase text-center">
              DA - IT DAING
            </h1>
          </button>
        </div>

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
              onClick={() => setUserType('consumer')}
              className={`relative z-10 flex-1 text-center text-sm font-medium transition-colors duration-300 ${
                userType === 'consumer' ? 'text-[#eb0000]' : 'text-gray-600'
              }`}
            >
              소비자
            </button>
            <button
              onClick={() => setUserType('seller')}
              className={`relative z-10 flex-1 text-center text-sm font-medium transition-colors duration-300 ${
                userType === 'seller' ? 'text-[#eb0000]' : 'text-gray-600'
              }`}
            >
              판매자
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 mb-6">
          <div>
            <input
              type="text"
              name="loginId"
              placeholder="아이디"
              value={loginId}
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                setLoginId(value);
              }}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
              autoComplete="username"
            />
          </div>
          {loginIdError && <p className="mt-1 text-xs text-red-600">{loginIdError}</p>}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
              }}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
              autoComplete="current-password"
            />
              <button
                type="button"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '숨김' : '보기'}
              </button>
            </div>
          </div>
          {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
          <div className="space-y-3">
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              disabled={!canSubmit}
              className={`w-full h-12 rounded-[12px] font-semibold transition-colors ${canSubmit ? 'bg-[#eb0000] text-white hover:bg-[#cc0000]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              로그인
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/signup')}
                type="button"
                className="flex-1 h-12 bg-gray-100 text-gray-800 rounded-[12px] font-medium hover:bg-gray-200 transition-colors"
              >
                회원가입
              </button>
              <button
                onClick={() => { setLoginId(''); setPassword(''); }}
                type="button"
                className="px-4 h-12 bg-white border border-gray-300 text-gray-700 rounded-[12px] font-medium hover:border-[#eb0000] hover:text-[#eb0000] transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Help Button */}
        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700">
            <MessageCircle size={16} />
            <span>문의하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

