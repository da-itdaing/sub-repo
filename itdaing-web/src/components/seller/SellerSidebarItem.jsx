// src/components/seller/SellerSidebarItem.jsx

import { NavLink } from "react-router-dom";

export default function SellerSidebarItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      title={item.name}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? "bg-white text-[#D90429] shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.name}</span>}
    </NavLink>
  );
}
