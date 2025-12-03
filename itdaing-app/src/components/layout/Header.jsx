import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Store, Shield, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';
import SearchBar from '@/components/common/SearchBar';
import { getMyProfile } from '@/services/authService';

/**
 * 역할별 대시보드 경로 및 라벨 매핑
 */
const ROLE_CONFIG = {
  ADMIN: {
    dashboard: ROUTES.admin?.root || '/admin',
    label: '관리자',
    icon: Shield,
    color: 'bg-purple-500',
  },
  SELLER: {
    dashboard: ROUTES.seller?.dashboard || '/seller/dashboard',
    label: '판매자',
    icon: Store,
    color: 'bg-blue-500',
  },
  CONSUMER: {
    dashboard: ROUTES.mypage,
    label: '소비자',
    icon: User,
    color: 'bg-rose-500',
  },
};

/**
 * 역할 안내 배너 - 판매자/관리자가 소비자 홈에 있을 때 표시
 */
const RoleBanner = ({ role, onClose, onNavigate }) => {
  const config = ROLE_CONFIG[role];
  if (!config || role === 'CONSUMER') return null;

  const Icon = config.icon;

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2">
      <div className="mx-auto max-w-[540px] md:max-w-[1200px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium">{config.label} 계정으로 로그인 중</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigate}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            대시보드로 이동
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Header 컴포넌트
 * 로고, 검색바, 로그인/로그아웃 버튼
 * - 역할에 따라 마이페이지/대시보드로 링크 분기
 * - 판매자/관리자가 소비자 홈에 있을 때 안내 배너 표시
 */
const Header = ({ hideSearchBar = false, showRoleBanner = true }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, role, user } = useAuthStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // 현재 역할 확인 (user.role 또는 store의 role)
  const currentRole = user?.role || role || 'CONSUMER';

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

  /**
   * 프로필 클릭 시 역할에 따라 다른 페이지로 이동
   * - ADMIN: /admin
   * - SELLER: /seller/dashboard 또는 /seller/profile
   * - CONSUMER: /mypage
   */
  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.login);
      return;
    }

    const config = ROLE_CONFIG[currentRole];
    if (config) {
      // 판매자는 프로필 페이지로, 관리자는 대시보드로
      if (currentRole === 'SELLER') {
        navigate(ROUTES.seller?.profile || '/seller/profile');
      } else if (currentRole === 'ADMIN') {
        navigate(ROUTES.admin?.root || '/admin');
      } else {
      navigate(ROUTES.mypage);
      }
    } else {
      navigate(ROUTES.mypage);
    }
  };

  const handleDashboardNavigate = () => {
    const config = ROLE_CONFIG[currentRole];
    if (config) {
      navigate(config.dashboard);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  // 배너 표시 조건: 로그인됨 + 판매자/관리자 + 배너 미해제 + showRoleBanner 옵션
  const shouldShowBanner = 
    isAuthenticated && 
    currentRole !== 'CONSUMER' && 
    !bannerDismissed && 
    showRoleBanner;

  return (
    <div className="w-full">
      {/* 역할 안내 배너 */}
      {shouldShowBanner && (
        <RoleBanner 
          role={currentRole} 
          onClose={() => setBannerDismissed(true)}
          onNavigate={handleDashboardNavigate}
        />
      )}
      
      {/* 헤더 공간 확보 */}
      <div className="h-14 md:h-20">
        <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white" style={{ top: shouldShowBanner ? '40px' : '0' }}>
          <div className="border-b border-gray-200">
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
                    DA ITDAING
              </h1>
            </div>

            {/* Search Bar */}
            {!hideSearchBar && <SearchBar />}

            {/* Right: Profile Icon and Login */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                    onClick={handleProfileClick}
                    className="shrink-0 p-1 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors relative"
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
                    {/* 역할 뱃지 (로그인 상태 + 소비자가 아닐 때) */}
                    {isAuthenticated && currentRole !== 'CONSUMER' && (
                      <span 
                        className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ${ROLE_CONFIG[currentRole]?.color || 'bg-gray-500'} text-white`}
                        title={ROLE_CONFIG[currentRole]?.label}
                      >
                        {currentRole === 'ADMIN' ? (
                          <Shield className="h-2.5 w-2.5" />
                        ) : (
                          <Store className="h-2.5 w-2.5" />
                        )}
                      </span>
                    )}
              </button>
              {!isAuthenticated && (
                <button
                      onClick={handleProfileClick}
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
        </div>
      </header>
      </div>
    </div>
  );
};

export default Header;
