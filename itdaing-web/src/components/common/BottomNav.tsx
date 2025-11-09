import { MapPin, Home, User } from "lucide-react";

interface BottomNavProps {
  onMyPageClick: () => void;
  onMainClick?: () => void;
  onNearbyExploreClick?: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export function BottomNav({ onMyPageClick, onMainClick, onNearbyExploreClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white text-gray-800 border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-[1089px] mx-auto">
        <div className="flex justify-around items-center h-14 xs:h-16 sm:h-18 md:h-20">
          <button onClick={onNearbyExploreClick} className="flex flex-col items-center justify-center gap-0.5 xs:gap-1 md:gap-1.5 hover:scale-105 transition-all flex-1 h-full group" aria-label="주변 탐색">
            <MapPin className="w-5 h-5 xs:w-6 xs:h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-[#eb0000] transition-colors" />
            <span className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-['Pretendard:Medium',sans-serif] text-gray-600 group-hover:text-[#eb0000] transition-colors leading-tight">주변 탐색</span>
          </button>
          <button onClick={onMainClick} className="flex flex-col items-center justify-center gap-0.5 xs:gap-1 md:gap-1.5 hover:scale-105 transition-all flex-1 h-full group" aria-label="메인화면">
            <Home className="w-5 h-5 xs:w-6 xs:h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-[#eb0000] transition-colors" />
            <span className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-['Pretendard:Medium',sans-serif] text-gray-600 group-hover:text-[#eb0000] transition-colors leading-tight">메인화면</span>
          </button>
          <button onClick={onMyPageClick} className="flex flex-col items-center justify-center gap-0.5 xs:gap-1 md:gap-1.5 hover:scale-105 transition-all flex-1 h-full group" aria-label="마이 페이지">
            <User className="w-5 h-5 xs:w-6 xs:h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-[#eb0000] transition-colors" />
            <span className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-['Pretendard:Medium',sans-serif] text-gray-600 group-hover:text-[#eb0000] transition-colors leading-tight">마이 페이지</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
