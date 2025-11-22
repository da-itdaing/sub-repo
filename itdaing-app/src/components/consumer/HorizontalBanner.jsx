import { ArrowRight } from 'lucide-react';

const HorizontalBanner = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-[20px] shadow-md focus:outline-none"
    >
      {/* Background - Brownish gradient as per reference */}
      <div className="absolute inset-0 bg-linear-to-r from-[#4A3B32] to-[#6B5247]" />
      
      {/* Content */}
      <div className="relative flex flex-col items-start justify-center px-6 py-5 sm:py-6 text-left">
        <h2 className="font-display text-lg sm:text-xl text-white mb-1 tracking-tight">
          특별한 이벤트가 준비되어 있어요!
        </h2>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors">
          <span>지금 바로 확인하고 참여하세요</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
      
      {/* Decorative circle (optional, to match modern feel) */}
      <div className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-white/5 blur-xl" />
    </button>
  );
};

export default HorizontalBanner;
