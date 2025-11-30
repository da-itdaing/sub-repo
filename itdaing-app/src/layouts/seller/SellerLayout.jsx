import { useState, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Menu,
  LayoutDashboard,
  Store,
  Plus,
  User2,
  Stars,
  Megaphone,
  CalendarClock,
  Bot,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/authStore';
import ChatbotModal from '@/components/chatbot/ChatbotModal';

const NAV_ITEMS = [
  {
    label: '대시보드',
    description: '오늘의 지표와 제안을 확인하세요',
    path: ROUTES.seller.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: '내 정보',
    description: '브랜드 프로필 및 계정 설정',
    path: ROUTES.seller.profile,
    icon: User2,
  },
  {
    label: '팝업 관리',
    description: '등록한 팝업 현황을 한눈에',
    path: ROUTES.seller.popups,
    icon: Store,
  },
  {
    label: '일정 관리',
    description: '운영 캘린더 정리',
    path: ROUTES.seller.calendar,
    icon: CalendarClock,
  },
  {
    label: '리뷰 관리',
    description: '고객 리뷰 확인 및 응대',
    path: ROUTES.seller.reviews,
    icon: Stars,
  },
  {
    label: '공지사항',
    description: '서비스 업데이트 소식',
    path: `${ROUTES.seller.root}/notices`,
    icon: Megaphone,
  },
];

const SellerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const isSidebarExpanded = !isSidebarCollapsed || isSidebarOpen;

  // 챗봇 모달 상태
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const displayName = user?.name || user?.nickname || user?.loginId || '판매자';
  const roleLabel = user?.role === 'SELLER' ? '판매자 계정' : '계정';
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  // 챗봇 모달 열기
  const handleOpenChatbot = useCallback(() => {
    setIsChatbotOpen(true);
  }, []);

  // 챗봇 모달 닫기
  const handleCloseChatbot = useCallback(() => {
    setIsChatbotOpen(false);
  }, []);

  // ESC 키로 챗봇 모달 닫기
  useEffect(() => {
    if (!isChatbotOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseChatbot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatbotOpen, handleCloseChatbot]);

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.label}
        to={item.path}
        className={({ isActive }) =>
          clsx(
            'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all',
            isSidebarExpanded ? 'justify-start' : 'justify-center',
            isActive
              ? 'bg-white text-primary shadow-lg shadow-primary/5'
              : 'text-white-500 hover:bg-white/70 hover:text-gray-900'
          )
        }
        title={isSidebarExpanded ? undefined : item.label}
        onClick={() => setIsSidebarOpen(false)}
      >
        <Icon className="h-5 w-5" />
        {isSidebarExpanded && (
          <div className="flex-1">
            <p className="font-semibold">{item.label}</p>
          </div>
        )}
      </NavLink>
    );
  };

  /* ---------------------- Sidebar ---------------------- */
  const Sidebar = (
    <aside className="flex h-full flex-col border-r border-white/5 bg-linear-to-b from-[#252529] via-[#1c1c1f] to-[#121214] text-white">
      {/* 로고 */}
      <div
        className={clsx(
          'flex items-center gap-3 px-4 pb-6 pt-8',
          !isSidebarExpanded && 'justify-center'
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff235b] text-base font-semibold text-white">
          DA
        </div>
      </div>

      {/* 메뉴 */}
      <div className="flex-1 space-y-1 overflow-y-auto px-2">
        {NAV_ITEMS.map(renderNavItem)}
      </div>

      {/* 하단 버튼 */}
      <div className="space-y-4 px-4 pb-6 pt-4">
        {isSidebarExpanded && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30 backdrop-blur">
            <p className="text-sm font-semibold text-white">새 팝업 등록</p>
            <p className="mt-1 text-xs text-white/70">
              디자이너 큐레이션 기반 제안을 추가해보세요.
            </p>

            <NavLink
              to={ROUTES.seller.popupCreate}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-[#c4006b] shadow-sm transition hover:bg-white/90"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Plus className="h-4 w-4" />
              팝업 등록
            </NavLink>
          </div>
        )}

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex w-full items-center justify-start rounded-2xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10',
            !isSidebarExpanded && 'justify-center px-0'
          )}
          aria-label="로그아웃"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h-6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
            <path d="M10 12h10" />
            <path d="m17 9 3 3-3 3" />
          </svg>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-gray-900">
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 transform shadow-2xl transition-[transform,width] lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isSidebarExpanded ? 'w-72' : 'w-20',
          'bg-[#1c1c1f]'
        )}
        onMouseEnter={() => !isSidebarOpen && setIsSidebarCollapsed(false)}
        onMouseLeave={() => !isSidebarOpen && setIsSidebarCollapsed(true)}
      >
        {Sidebar}
      </div>

      {/* 메인 */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* 헤더 */}
        <header className="relative z-20 border-b border-white/60 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="rounded-2xl border border-gray-200 p-2 text-gray-700 transition hover:border-gray-300 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white lg:h-11 lg:w-11">
                DA
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 챗봇 버튼 - 클릭 시 판매자용 챗봇 모달 열기 */}
              <button
                type="button"
                onClick={handleOpenChatbot}
                className="rounded-2xl border border-gray-200 p-2 text-gray-600 transition hover:border-primary hover:text-primary"
                aria-label="AI 챗봇 열기"
              >
                <Bot className="h-5 w-5" />
              </button>

              {/* 프로필 영역 - 클릭 시 내 정보 페이지로 이동 */}
              <button
                type="button"
                onClick={() => navigate(ROUTES.seller.profile)}
                className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-1.5 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </div>
                <div className="hidden text-left text-sm leading-tight sm:block">
                  <p className="font-semibold text-gray-900">{displayName}</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10 min-h-0">
          <Outlet />
        </main>
      </div>

      {/* 판매자용 챗봇 모달 */}
      <ChatbotModal 
        open={isChatbotOpen} 
        onClose={handleCloseChatbot} 
        mode="seller" 
      />
    </div>
  );
};

export default SellerLayout;
