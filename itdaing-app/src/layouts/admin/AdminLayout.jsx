import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  Map,
  ShieldCheck,
  Settings,
  Menu,
  X,
  Bell,
  Search,
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
    disabled: true,
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
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-gray-500/60"
        >
          <Icon className="h-5 w-5" />
          <div className="flex-1">
            <p className="font-semibold">{item.label}</p>
            <p className="text-xs text-gray-500/60">{item.description}</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
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
            'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all',
            isActive ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-300 hover:bg-white/10'
          )
        }
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="h-5 w-5" />
        <div>
          <p className="font-semibold">{item.label}</p>
          <p className="text-xs text-slate-400">{item.description}</p>
        </div>
      </NavLink>
    );
  };

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col bg-[#0b1220] text-white">
      <div className="px-6 pb-6 pt-8">
        <p className="text-lg font-semibold">Itdaing Admin</p>
        <p className="text-xs text-white/60">운영팀 전용 콘솔</p>
      </div>
      <div className="flex-1 space-y-1 px-4">{NAV_ITEMS.map(renderNavItem)}</div>
      <div className="px-6 pb-6 pt-4 text-xs text-white/50">
        © {new Date().getFullYear()} Da-Itdaing · 내부 전용
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

      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 transform bg-[#0b1220] shadow-2xl transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
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

      <div className="flex flex-1 flex-col">
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

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-2xl border border-gray-200 px-3 py-1.5 text-sm text-gray-500 lg:flex">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="검색 (사용자, 팝업, 승인 등)"
                  className="w-40 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
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
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate(ROUTES.home);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
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

export default AdminLayout;

