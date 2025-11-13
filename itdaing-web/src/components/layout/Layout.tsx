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
      navigate('/login', { state: { from: { pathname: '/mypage' } } });
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

  const handlePopupClick = (popupId: number) => {
    navigate(`/popup/${popupId}`);
  };

  const handleSellerClick = (sellerId: number) => {
    // 판매자 정보 페이지로 이동 (현재는 팝업 상세로 이동)
    navigate(`/popup/${sellerId}`);
  };

  // 메인 페이지가 아닐 때만 Header와 Footer 표시
  const isMainPage = location.pathname === '/';
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');
  const isConsoleRoute =
    location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!isAuthPage && !isConsoleRoute && (
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
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isAuthPage && !isConsoleRoute && (
        <>
          <Footer />
          <BottomNav
            onMyPageClick={handleMyPageClick}
            onMainClick={() => navigate('/')}
            onNearbyExploreClick={() => navigate('/nearby')}
          />
        </>
      )}
    </div>
  );
}

