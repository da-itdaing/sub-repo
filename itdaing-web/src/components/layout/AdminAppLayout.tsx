import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ShieldCheck, Map, Layers, Users, MessageSquare, ClipboardList, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", icon: ShieldCheck, label: "대시보드" },
  { to: "/admin/zones", icon: Map, label: "존/셀 관리" },
  { to: "/admin/approvals", icon: Layers, label: "승인 심사" },
  { to: "/admin/users", icon: Users, label: "사용자 관리" },
  { to: "/admin/messages", icon: MessageSquare, label: "메시지" },
  { to: "/admin/logs", icon: ClipboardList, label: "이벤트 로그" },
  { to: "/admin/notices", icon: Bell, label: "공지사항" }
];

export default function AdminAppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <aside className="w-72 bg-white border-r border-gray-200 hidden xl:flex flex-col">
        <div className="px-6 py-6 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Admin Console</p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">운영자 센터</h1>
          <p className="mt-2 text-sm text-gray-500">{user?.name ?? "관리자"}님</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-4">
            {NAV_ITEMS.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isActive ? "bg-[#111827] text-white shadow" : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => void logout()}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <LogOut className="size-4" />
            로그아웃
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase">Admin Console</p>
              <h2 className="text-lg font-semibold text-gray-900">운영 대시보드</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex text-sm text-gray-500">{user?.email}</span>
              <button
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-gray-300"
              >
                <LogOut className="size-4" />
                로그아웃
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

