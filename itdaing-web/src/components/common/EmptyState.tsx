import React from "react";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "데이터가 없습니다.",
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className || ""}`}>
      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        {icon || <AlertCircle className="w-6 h-6 text-gray-400" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}


