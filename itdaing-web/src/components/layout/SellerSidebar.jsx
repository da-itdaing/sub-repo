// src/components/layout/SellerSidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  MapPin,
  CalendarDays,
  Star,
  Megaphone,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/seller/dashboard", label: "대시보드", icon: LayoutDashboard },
  { to: "/seller/info", label: "내 정보", icon: User },
  { to: "/seller/popups", label: "팝업 관리", icon: MapPin },
  { to: "/seller/schedule", label: "일정 관리", icon: CalendarDays },
  { to: "/seller/reviews", label: "리뷰 관리", icon: Star },
  { to: "/seller/notices", label: "공지사항", icon: Megaphone },
];

export default function SellerSidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`h-screen bg-[#262626] text-white flex flex-col items-stretch transition-all duration-200
        ${expanded ? "w-[220px]" : "w-[80px]"}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* 상단 아이콘/로고 자리 */}
      <div className="h-[80px] flex items-center justify-center border-b border-[#3a3a3a]">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
          <span className="text-[#e21f1f] font-extrabold text-xl">H</span>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <nav className="flex-1 flex flex-col py-6 gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "group flex items-center gap-4 mx-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#f5f5f5] text-[#e21f1f]"
                  : "text-gray-200 hover:bg-[#333333] hover:text-white",
              ].join(" ")
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span
              className={`whitespace-nowrap transition-opacity duration-150 ${
                expanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* 하단 로그아웃 버튼 (실제 로직은 나중에 연결) */}
      <button
        type="button"
        className="mx-3 mb-6 mt-2 flex items-center gap-4 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-[#333333] hover:text-white transition-all"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        <span
          className={`whitespace-nowrap transition-opacity duration-150 ${
            expanded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          로그아웃
        </span>
      </button>
    </aside>
  );
}
