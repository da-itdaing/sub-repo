import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User } from 'lucide-react';
import { ROUTES } from '@/routes/paths';

/**
 * BottomNav 컴포넌트
 * 하단 네비게이션 바 (홈, 내주변, 마이페이지)
 */
const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#3d3d3d] text-white border-t border-gray-800 z-50 pb-safe">
      <div className="w-full max-w-[540px] md:max-w-[1200px] mx-auto">
        <div className="flex justify-around items-center h-14 md:h-20">
          <Link 
            to={ROUTES.nearby}
            className={`flex flex-col items-center gap-0.5 md:gap-2 hover:opacity-80 transition-opacity flex-1 ${
              isActive(ROUTES.nearby) ? 'text-primary' : 'text-white'
            }`}
          >
            <MapPin className="w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[10px] md:text-sm font-bold">주변 탐색</span>
          </Link>
          
          <Link 
            to={ROUTES.home}
            className={`flex flex-col items-center gap-0.5 md:gap-2 hover:opacity-80 transition-opacity flex-1 ${
              isActive(ROUTES.home) ? 'text-primary' : 'text-white'
            }`}
          >
            <Home className="w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[10px] md:text-sm font-bold">메인화면</span>
          </Link>
          
          <Link 
            to={ROUTES.mypage}
            className={`flex flex-col items-center gap-0.5 md:gap-2 hover:opacity-80 transition-opacity flex-1 ${
              isActive(ROUTES.mypage) ? 'text-primary' : 'text-white'
            }`}
          >
            <User className="w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[10px] md:text-sm font-bold">마이 페이지</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

