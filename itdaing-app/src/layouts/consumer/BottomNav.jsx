/**
 * Bottom Navigation (하단 네비게이션)
 * 
 * 소비자 앱의 주요 3개 메뉴를 하단에 고정 표시합니다.
 * - 주변 탐색 (MapPin)
 * - 메인화면 (Home)
 * - 마이 페이지 (User)
 * 
 * 디자인:
 * - 둥근 버튼 스타일 (활성 시 Primary 색상 배경)
 * - Safe Area 지원 (pb-safe)
 * - 고정 위치 (fixed bottom)
 */
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Home, User } from 'lucide-react';
import { clsx } from 'clsx';

const BottomNav = () => {
  const location = useLocation();

  /**
   * 네비게이션 아이템 정의
   */
  const navItems = [
    {
      label: '주변 탐색',
      icon: MapPin,
      path: '/nearby',
    },
    {
      label: '메인화면',
      icon: Home,
      path: '/',
    },
    {
      label: '마이 페이지',
      icon: User,
      path: '/mypage',
    },
  ];

  /**
   * 활성 상태 확인
   * @param {string} path - 경로
   * @returns {boolean} 활성 여부
   */
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-120 w-full bg-[#3d3d3d] border-t border-gray-800">
      <div className="mx-auto w-full max-w-[480px] px-4">
        <div className="flex items-center justify-around h-16 pb-safe-bottom">
          {navItems.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 w-16 py-1 transition-opacity hover:opacity-80',
                  // Active/Inactive color logic - Figma uses white for all
                  'text-white'
                )}
              >
                <Icon 
                  className={clsx(
                    "w-6 h-6 stroke-white",
                    // Figma icons are filled or stroked? They seem stroked.
                  )} 
                />
                <span className="text-[11px] font-bold tracking-tight text-white">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
