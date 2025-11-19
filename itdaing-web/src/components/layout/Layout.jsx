import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { BottomNav } from '../common/BottomNav';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginClick = () => {
    navigate('/login', { state: { from: location } });
  };

  const handleLogoDoubleClick = () => {
    window.dispatchEvent(new CustomEvent('layout:logoDoubleClick'));
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };

  const handleMyPageClick = () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (user.role !== 'CONSUMER') {
      if (user.role === 'SELLER') {
        window.alert('마이페이지는 소비자 전용입니다. 판매자 대시보드로 이동합니다.');
        navigate('/seller/dashboard');
      } else {
        window.alert('마이페이지는 소비자 전용입니다.');
        navigate('/');
      }
      return;
    }

    navigate('/mypage');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handlePopupClick = (popupId) => {
    navigate(`/popup/${popupId}`);
  };

  const handleSellerClick = (sellerId) => {
    // 판매자 정보 페이지로 이동 (현재는 팝업 상세로 이동)
    navigate(`/popup/${sellerId}`);
  };

  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');
  const isConsoleRoute =
    location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin');
  const showHeaderFooter = !isAuthPage && !isConsoleRoute;

  if (!showHeaderFooter) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#f6f7fb]">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  const contentWrapperClass = 'mx-auto w-full px-4 sm:px-6 lg:px-8';

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#f6f7fb]">
      <div className="flex-shrink-0 border-b border-white/0 bg-white/95 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <Header
          onLoginClick={handleLoginClick}
          isLoggedIn={isAuthenticated}
          onLogoDoubleClick={handleLogoDoubleClick}
          onLogoClick={handleLogoClick}
          onLogoutClick={handleLogoutClick}
          onMyPageClick={handleMyPageClick}
          onPopupClick={handlePopupClick}
          onSellerClick={handleSellerClick}
        />
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <section
          className={`${contentWrapperClass} flex min-h-full flex-col gap-5 pb-16 pt-2 sm:gap-6 sm:pb-20 sm:pt-3 lg:gap-7 lg:pb-24`}
        >
          <Outlet />
        </section>
        <Footer />
      </main>

      <div className="flex-shrink-0 border-t border-gray-100 bg-white/95">
        <BottomNav
          activePath={location.pathname}
          onMyPageClick={handleMyPageClick}
          onMainClick={() => navigate('/')}
          onNearbyExploreClick={() => navigate('/nearby')}
        />
      </div>
    </div>
  );
}

