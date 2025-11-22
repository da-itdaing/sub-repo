import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '@/utils/imageUtils';
import { ROUTES } from '@/routes/paths';

/**
 * EventCard 컴포넌트 (캐러셀 스타일 적용)
 * 팝업 카드 - 이미지 위 오버레이 스타일
 */
const EventCard = ({ popup }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const thumbnailUrl = getImageUrl(popup.thumbnail || popup.thumbnailImageUrl, '/placeholder-popup.png');
  const start = popup.startDate ? new Date(popup.startDate) : null;
  const end = popup.endDate ? new Date(popup.endDate) : null;
  const dateLabel = start && end
    ? `${start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} - ${end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
    : popup.startDate || '일정 미정';

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link to={ROUTES.popupDetail(popup.id)} className="group block h-full">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        {/* 이미지 */}
        <img
          src={thumbnailUrl}
          alt={popup.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-popup.png';
          }}
        />
        
        {/* 오버레이 그라데이션 */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* 좋아요 버튼 */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors z-10"
          aria-label="관심 팝업"
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={isFavorite ? '#eb0000' : 'none'}
            color={isFavorite ? '#eb0000' : '#414141'}
          />
        </button>

        {/* 상태 배지 */}
        {popup.status && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 rounded-full text-[10px] font-bold text-gray-900 shadow-sm">
            {popup.status === 'upcoming' ? '오픈 예정' : popup.status === 'ongoing' ? '진행 중' : '종료'}
          </div>
        )}

        {/* 텍스트 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
            {popup.title}
          </h3>
          <p className="text-[10px] text-white/90">{dateLabel}</p>
          <p className="flex items-center gap-0.5 text-[10px] text-white/85">
            <MapPin className="w-2.5 h-2.5" />
            <span className="line-clamp-1">{popup.address || popup.location || '위치 미정'}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
