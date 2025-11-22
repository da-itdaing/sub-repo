// src/components/seller/SellerSidebar.jsx

import {
  Bell,
  CalendarClock,
  Home,
  LocateFixed,
  Map,
  MessageSquare,
  Star,
  UserRound,
} from "lucide-react";
import SellerSidebarItem from "./SellerSidebarItem.jsx";

const menus = [
  { name: "대시보드", icon: Home, path: "/seller/dashboard" },
  { name: "내 정보", icon: UserRound, path: "/seller/info" },
  { name: "팝업 관리", icon: Map, path: "/seller/popups" },
  { name: "팝업 등록", icon: LocateFixed, path: "/seller/popup/create" },
  { name: "일정 관리", icon: CalendarClock, path: "/seller/schedule" },
  { name: "리뷰 관리", icon: Star, path: "/seller/reviews" },
  { name: "공지사항", icon: Bell, path: "/seller/notices" },
  { name: "메세지함", icon: MessageSquare, path: "/seller/messages" },
];

export default function SellerSidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className="flex h-screen min-h-screen flex-col bg-[#181818] text-white transition-all duration-200"
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-semibold">
          DA
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Seller
            </p>
            <p className="text-base font-semibold">IT DAING</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {menus.map((item) => (
            <li key={item.name}>
              <SellerSidebarItem item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-6 text-[13px] text-white/60">
        {!collapsed ? (
          <div>
            <p className="text-white">도움이 필요하신가요?</p>
            <p className="mt-1 text-white/80">support@itdaing.com</p>
          </div>
        ) : (
          <p className="text-center text-white/80">?</p>
        )}
      </div>
    </aside>
  );
}
