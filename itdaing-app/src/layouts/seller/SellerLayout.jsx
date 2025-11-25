import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  MessageSquare,
  Settings,
  ChevronDown,
  Plus,
  User2,
  Stars,
  Megaphone,
  CalendarClock,
  Bot,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/authStore';
import ChatbotButton from '@/components/common/ChatbotButton';

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
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const displayName = user?.name || user?.nickname || user?.loginId || '판매자';
  const roleLabel = user?.role === 'SELLER' ? '판매자 계정' : '계정';
  const initials = displayName.charAt(0).toUpperCase();
  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isDisabled = !!item.disabled;

    if (isDisabled) {
      return (
        <div
          key={item.label}
          className={clsx(
            'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-gray-400/80',
            isSidebarExpanded ? 'justify-start' : 'justify-center'
          )}
          title={item.label}
        >
          <Icon className="h-5 w-5" />
          {isSidebarExpanded && (
            <div className="flex-1">
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-gray-400/70">{item.description}</p>
            </div>
          )}
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
            Soon
          </span>
        </div>
      );
    }

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
              : 'text-gray-500 hover:bg-white/70 hover:text-gray-900'
          )
        }
        onClick={() => setIsSidebarOpen(false)}
        title={isSidebarExpanded ? undefined : item.label}
      >
        <Icon className="h-5 w-5" />
        {isSidebarExpanded && (
          <div className="flex-1">
            <p className="font-semibold">{item.label}</p>
            <p className="text-xs text-gray-400">{item.description}</p>
          </div>
        )}
      </NavLink>
    );
  };

  const Sidebar = (
    <aside className="flex h-full flex-col border-r border-white/5 bg-linear-to-b from-[#252529] via-[#1c1c1f] to-[#121214] text-white">
      <div className={clsx('flex items-center gap-3 px-4 pb-6 pt-8', !isSidebarExpanded && 'justify-center')}>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff235b] text-base font-semibold text-white">
          DA
        </div>
        {isSidebarExpanded && (
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">셀러 허브</p>
            <p className="text-xs text-white/50">Seller Control Center</p>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2">{NAV_ITEMS.map(renderNavItem)}</div>

      <div className="space-y-4 px-4 pb-6 pt-4">
        {isSidebarExpanded && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30 backdrop-blur">
            <p className="text-sm font-semibold text-white">새 팝업 등록</p>
            <p className="mt-1 text-xs text-white/70">디자이너 큐레이션 기반 제안을 추가해보세요.</p>
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
        <button
          type="button"
          onClick={handleLogout}
          className={clsx(
            'flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10',
            !isSidebarExpanded && 'justify-center px-0'
          )}
        >
          <span className="text-xs uppercase tracking-wide">로그아웃</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-gray-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 transform shadow-2xl transition-[transform,width] lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isSidebarExpanded ? 'w-72' : 'w-20',
          'bg-[#1c1c1f]'
        )}
        onMouseEnter={() => {
          if (!isSidebarOpen) {
            setIsSidebarCollapsed(false);
          }
        }}
        onMouseLeave={() => {
          if (!isSidebarOpen) {
            setIsSidebarCollapsed(true);
          }
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
            <span className="text-lg font-semibold text-white">메뉴</span>
            <button
              className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {Sidebar}
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative z-20 border-b border-white/60 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="rounded-2xl border border-gray-200 p-2 text-gray-700 transition hover:border-gray-300 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white lg:h-11 lg:w-11">
                  DA
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Itdaing Seller</p>
                  <p className="text-lg font-semibold text-gray-900">대시보드</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 챗봇 버튼 (헤더 통합용) */}
              <div className="relative">
                 <ChatbotButton mode="header" />
              </div>

              <button className="rounded-2xl border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300">
                <MessageSquare className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </div>
                <div className="hidden text-left text-sm leading-tight sm:block">
                  <p className="font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;

