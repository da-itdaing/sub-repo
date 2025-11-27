import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  Map,
  ShieldCheck,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  {
    label: '대시보드',
    description: '전체 서비스 현황',
    path: ROUTES.admin.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: '사용자관리',
    description: '회원 / 권한 관리',
    path: ROUTES.admin.users,
    icon: Users,
  },
  {
    label: '검수관리',
    description: '팝업 / 계정 검수',
    path: ROUTES.admin.approvals,
    icon: ShieldCheck,
  },
  {
    label: '구역관리',
    description: '존 / 지역 운영 설정',
    path: ROUTES.admin.zones,
    icon: Map,
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const isSidebarExpanded = !isSidebarCollapsed || sidebarOpen;

  const activeNav = useMemo(() => {
    const foundItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
    if (foundItem) return foundItem;
    return {
      label: '관리자 센터',
      description: '서비스 운영 현황',
    };
  }, [location.pathname]);

  const renderNavItem = (item) => {
    const Icon = item.icon;

    if (item.disabled) {
      return (
        <div
          key={item.label}
          className={clsx(
            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-gray-500/60',
            isSidebarExpanded ? 'justify-start' : 'justify-center'
          )}
        >
          <Icon className="h-5 w-5" />
          {isSidebarExpanded && (
            <>
              <div className="flex-1">
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-gray-500/60">{item.description}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                Soon
              </span>
            </>
          )}
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
              : 'text-gray-300 hover:bg-white/70 hover:text-gray-900'
          )
        }
        onClick={() => setSidebarOpen(false)}
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
      {/* 상단 브랜드 영역 - SellerLayout 스타일과 통일 */}
      <div
        className={clsx(
          'flex items-center gap-3 px-4 pb-6 pt-8',
          !isSidebarExpanded && 'justify-center'
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff235b] text-base font-semibold text-white">
          AD
        </div>
        {isSidebarExpanded && (
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">Itdaing Admin</p>
            <p className="text-xs text-white/60">Admin Control Center</p>
          </div>
        )}
      </div>

      {/* 네비게이션 아이템 */}
      <div className="flex-1 space-y-1 overflow-y-auto px-2">
        {NAV_ITEMS.map(renderNavItem)}
      </div>

      {/* 하단 로그아웃 영역 - SellerLayout 스타일과 유사하게 */}
      <div className="space-y-4 px-4 pb-6 pt-4 mt-auto">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate(ROUTES.home);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wide">로그아웃</span>
        </button>

        <div className="text-xs text-white/40">
          © {new Date().getFullYear()} Da-Itdaing · 내부 전용
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 text-gray-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 - SellerLayout과 유사한 스타일 */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 transform shadow-2xl transition-[transform,width] lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isSidebarExpanded ? 'w-72' : 'w-20',
          'bg-[#1c1c1f]'
        )}
        onMouseEnter={() => !sidebarOpen && setIsSidebarCollapsed(false)}
        onMouseLeave={() => !sidebarOpen && setIsSidebarCollapsed(true)}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
            <span className="text-base font-semibold text-white">관리 메뉴</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {Sidebar}
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex flex-1 flex-col">
        {/* 헤더 */}
        <header className="sticky top-0 z-20 border-b border-white/50 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-2xl border border-gray-200 p-2 text-gray-700 transition hover:border-gray-300 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Admin Console</p>
                <p className="text-xl font-semibold text-gray-900">{activeNav.label}</p>
                <p className="text-sm text-gray-500">{activeNav.description}</p>
              </div>
            </div>

            {/* 오른쪽 아이콘 + 프로필 */}
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300">
                <Bell className="h-5 w-5" />
              </button>

              <button className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900 text-sm font-semibold text-white">
                  AD
                </div>
                <div className="hidden text-left text-sm leading-tight sm:block">
                  <p className="font-semibold text-gray-900">admin1</p>
                  <p className="text-xs text-gray-500">운영팀</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
