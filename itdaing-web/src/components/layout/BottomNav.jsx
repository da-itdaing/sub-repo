import { MapPin, Home, User } from "lucide-react";
import clsx from "clsx";

export function BottomNav({
  activePath = "/",
  onMyPageClick,
  onMainClick,
  onNearbyExploreClick,
}) {
  const items = [
    {
      label: "주변 탐색",
      icon: MapPin,
      onClick: onNearbyExploreClick,
      match: "/nearby",
    },
    {
      label: "메인화면",
      icon: Home,
      onClick: onMainClick,
      match: "/",
    },
    {
      label: "마이 페이지",
      icon: User,
      onClick: onMyPageClick,
      match: "/mypage",
    },
  ];

  const isActive = (match) => {
    if (match === "/") {
      return activePath === "/";
    }
    return activePath.startsWith(match);
  };

  return (
    <nav className="w-full border-t border-gray-200 bg-white/95 text-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] backdrop-blur">
      {/* 웹과 앱 모두 하단에 고정 - 헤더처럼 고정되어 있음 */}
      {/* z-[100]으로 다른 요소들 위에 표시되도록 보장 */}
      {/* 완전 불투명한 흰색 배경 */}
      <div className="flex w-full justify-between px-4 pb-[calc(env(safe-area-inset-bottom,0)+8px)] pt-2">
        {items.map(({ label, icon: Icon, onClick, match }) => {
          const active = isActive(match);
          return (
            <button
              key={label}
              onClick={onClick}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex h-14 w-full flex-col items-center justify-center rounded-2xl px-2 text-xs font-semibold transition-all sm:text-sm",
                active
                  ? "text-[#eb0000]"
                  : "text-gray-500 hover:text-gray-700",
              )}
              tabIndex={0}
            >
              <span
                className={clsx(
                  "flex size-10 items-center justify-center rounded-full border text-base transition-all",
                  active
                    ? "border-[#eb0000]/40 bg-[#eb0000]/10"
                    : "border-transparent bg-gray-100",
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5",
                    active ? "text-[#eb0000]" : "text-gray-600",
                  )}
                />
              </span>
              <span className="mt-1 leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
