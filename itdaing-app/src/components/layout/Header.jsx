import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';

/**
 * Header 컴포넌트
 * 로고, 검색바, 로그인/로그아웃 버튼
 */
const Header = ({ hideSearchBar = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogoClick = () => {
    navigate(ROUTES.home);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate(ROUTES.mypage);
    } else {
      navigate(ROUTES.login);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="w-full max-w-[540px] md:max-w-[1200px] mx-auto px-4 md:px-8 h-14 md:h-20">
        <div className="flex items-center justify-between h-full gap-2 md:gap-4">
          {/* Logo */}
          <div 
            className="flex-shrink-0 cursor-pointer" 
            onClick={handleLogoClick}
          >
            <h1 className="text-primary text-lg md:text-3xl whitespace-nowrap leading-none" style={{ fontFamily: "'Luckiest Guy', sans-serif" }}>
              DA-ITDAING
            </h1>
          </div>
          
          {/* Search Bar */}
          {!hideSearchBar && (
            <div className="relative flex-1 max-w-[160px] md:max-w-[500px]">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="w-full h-8 md:h-11 px-3 md:px-5 pr-9 md:pr-12 rounded-full border border-gray-300 focus:outline-none focus:border-primary transition-colors text-xs md:text-base"
              />
              <button className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2" aria-label="Search">
                <Search className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />
              </button>
            </div>
          )}
          
          {/* Right: Profile Icon and Login */}
          <div className="flex items-center gap-1.5 md:gap-3">
            <button
              onClick={handleLoginClick}
              className="flex-shrink-0 p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isAuthenticated ? "Profile" : "Login"}
            >
              <User className="w-5 h-5 md:w-8 md:h-8" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={handleLoginClick}
                className="px-2.5 md:px-5 py-1 md:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-xs md:text-base whitespace-nowrap"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

