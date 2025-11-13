import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  theme?: "success" | "warning" | "danger" | "info";
}

const themeClasses = {
  success: {
    icon: "text-green-600",
    bg: "bg-green-50",
  },
  warning: {
    icon: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  danger: {
    icon: "text-red-600",
    bg: "bg-red-50",
  },
  info: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
  },
};

export function StatCard({ title, value, icon: Icon, theme = "info" }: StatCardProps) {
  const themeClass = themeClasses[theme];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${themeClass.bg} rounded-full p-3`}>
          <Icon className={`size-6 ${themeClass.icon}`} />
        </div>
      </div>
    </div>
  );
}

