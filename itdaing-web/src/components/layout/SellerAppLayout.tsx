import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu, Sparkles, Store, Calendar, MessageSquare, ClipboardList, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/seller/dashboard", icon: Sparkles, label: "대시보드" },
  { to: "/seller/popups", icon: Store, label: "팝업 관리" },
  { to: "/seller/schedule", icon: Calendar, label: "일정" },
  { to: "/seller/messages", icon: MessageSquare, label: "메시지" },
  { to: "/seller/reviews", icon: ClipboardList, label: "후기" },
  { to: "/seller/notices", icon: Bell, label: "공지사항" }
];

export default function SellerAppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <aside className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 flex-col">
        <div className="px-6 py-6 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Seller Console</p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">팝업 운영센터</h1>
          <p className="mt-2 text-sm text-gray-500">{user?.name ?? "판매자"}님</p>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-4">
            {NAV_ITEMS.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-[#eb0000] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
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
            <div className="flex items-center gap-2">
              <span className="font-display text-[#eb0000] text-xl font-bold">DA - IT DAING</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex text-sm text-gray-700 font-medium">
                {user?.name || user?.nickname || "판매자"} 님
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <MessageSquare className="size-5 text-gray-600" />
                <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

