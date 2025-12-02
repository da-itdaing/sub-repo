import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';
import SearchBar from '@/components/common/SearchBar';
import { getMyProfile } from '@/services/authService';

/**
 * Header 컴포넌트
 * 로고, 검색바, 로그인/로그아웃 버튼
 * - 모바일 앱 비율에서도 항상 상단에 고정되도록 fixed + 상단 여백 확보
 */
const Header = ({ hideSearchBar = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const avatar = useMemo(() => {
    if (!profile || !profile.profileImage?.url) {
      return null;
    }
    return profile.profileImage.url;
  }, [profile]);

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
    // 이 wrapper div가 레이아웃 상에서 헤더 높이만큼 공간을 차지해서
    // header를 fixed로 띄워도 아래 컨텐츠가 가려지지 않게 해준다.
    <div className="w-full h-14 md:h-20">
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="mx-auto h-14 w-full max-w-[540px] px-4 md:h-20 md:max-w-[1200px] md:px-8">
          <div className="flex items-center justify-between h-full gap-2 md:gap-4">
            {/* Logo */}
            <div
              className="shrink-0 cursor-pointer"
              onClick={handleLogoClick}
            >
              <h1
                className="text-primary text-lg md:text-3xl whitespace-nowrap leading-none"
                style={{ fontFamily: "'Luckiest Guy', sans-serif" }}
              >
                DA-ITDAING
              </h1>
            </div>

            {/* Search Bar */}
            {!hideSearchBar && <SearchBar />}

            {/* Right: Profile Icon and Login */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleLoginClick}
                className="shrink-0 p-1 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={isAuthenticated ? 'Profile' : 'Login'}
              >
                {isAuthenticated && avatar ? (
                  <img
                    src={avatar}
                    alt={profile?.nickname || '프로필'}
                    className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover border border-gray-200"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/placeholder-user.png';
                    }}
                  />
                ) : (
                  <User className="w-5 h-5 md:w-7 md:h-7 text-gray-700" />
                )}
              </button>
              {!isAuthenticated && (
                <button
                  onClick={handleLoginClick}
                  className="px-2.5 md:px-5 py-1 md:py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-xs md:text-base whitespace-nowrap"
                >
                  로그인
                </button>
              )}
              {isAuthenticated && (
                <>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-1 text-gray-600 transition hover:bg-gray-50 md:hidden"
                    aria-label="로그아웃"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden md:inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
