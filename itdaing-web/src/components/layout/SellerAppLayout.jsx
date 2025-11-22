import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Store,
  Calendar,
  MessageSquare,
  Star,
  Bell,
  LogOut,
} from "lucide-react";

export default function SellerAppLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { label: "대시보드", icon: <Home size={20} />, path: "/seller/dashboard" },
    { label: "내 정보", icon: <User size={20} />, path: "/seller/info" },
    { label: "팝업 관리", icon: <Store size={20} />, path: "/seller/popups" },
    { label: "일정 관리", icon: <Calendar size={20} />, path: "/seller/schedule" },
    { label: "리뷰 관리", icon: <Star size={20} />, path: "/seller/reviews" },
    { label: "공지사항", icon: <Bell size={20} />, path: "/seller/notices" },
  ];

  return (
    <div className="h-screen flex overflow-hidden"> 
      {/* 사이드바 */}
      <aside
        className={`${
          isExpanded ? "w-56" : "w-20"
        } bg-[#2b2b2b] text-white h-full flex flex-col transition-all duration-200`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center justify-center h-20 font-bold text-xl tracking-widest">
          {isExpanded ? "DA - IT DAING" : "DA"}
        </div>

        <nav className="flex-1 flex flex-col gap-1 mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#ff2d2d] text-white"
                    : "text-gray-300 hover:bg-[#3a3a3a]"
                }`
              }
            >
              {item.icon}
              {isExpanded && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 px-4 py-2 bg-[#ff2d2d] w-full text-center rounded-xl hover:bg-[#e60000]"
          >
            <LogOut size={18} />
            {isExpanded && "로그아웃"}
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F4F4]">
        <header className="w-full h-20 bg-white border-b flex items-center justify-between px-8">
          <h1 className="text-[24px] font-bold text-[#e21f1f]">DA - IT DAING</h1>

          <div className="flex items-center gap-6">
            <button
              className="text-gray-700"
              onClick={() => navigate("/seller/messages")}
            >
              📧
            </button>

            <div
              onClick={() => navigate("/seller/info")}
              className="flex items-center justify-center w-10 h-10 font-bold text-white bg-black rounded-full cursor-pointer"
            >
              DA
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
