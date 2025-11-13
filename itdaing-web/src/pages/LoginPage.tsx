import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
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

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async () => {
    setError('');
    try {
      await login(loginId, password);
      // 로그인 성공 후 원래 페이지로 이동 또는 판매자는 대시보드로
      const user = await authService.getMyProfile();
      if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate(from);
      }
    } catch (err: any) {
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
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <h1 className="font-['Luckiest_Guy:Regular',sans-serif] text-[32px] sm:text-[40px] md:text-[56px] text-[#eb0000] leading-normal w-[280px] sm:w-auto text-center">
              Da - It daing
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
        <div className="space-y-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="아이디"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-[#eb0000] text-white py-3 rounded-lg font-medium hover:bg-[#cc0000] transition-colors mb-4"
        >
          로그인
        </button>

        {/* Signup Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/signup')}
            className="text-gray-600 text-sm hover:text-[#eb0000] transition-colors"
          >
            회원가입
          </button>
        </div>

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

