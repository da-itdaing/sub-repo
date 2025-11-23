import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getImageUrl } from '@/utils/imageUtils';
import { ROUTES } from '@/routes/paths';
import { addToWishlist, removeFromWishlist } from '@/services/wishlistService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useLoginPrompt } from '@/hooks/useLoginPrompt';

/**
 * EventCard 컴포넌트 (캐러셀 스타일 적용)
 * 팝업 카드 - 이미지 위 오버레이 스타일
 */
const EventCard = ({ popup, variant = 'default', onCardClick }) => {
  const [isFavorite, setIsFavorite] = useState(Boolean(popup?.isFavorite));
  const [isProcessing, setIsProcessing] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { openLoginPrompt } = useLoginPrompt();
  const isCompact = variant === 'compact';
  
  const thumbnailUrl = getImageUrl(popup.thumbnail || popup.thumbnailImageUrl, '/placeholder-popup.png');
  const start = popup.startDate ? new Date(popup.startDate) : null;
  const end = popup.endDate ? new Date(popup.endDate) : null;
  const dateLabel = start && end
    ? `${start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} - ${end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
    : popup.startDate || '일정 미정';

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      const shouldLogin = await openLoginPrompt({
        description: '관심 팝업은 로그인 후 이용 가능합니다.\n지금 로그인하시겠습니까?',
      });
    if (role && role !== 'CONSUMER') {
      addToast({
        title: '관심 팝업은 소비자 계정에서만 이용 가능합니다.',
        variant: 'error',
      });
      return;
    }
      if (shouldLogin) {
        navigate(ROUTES.login);
      }
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (isFavorite) {
        await removeFromWishlist(popup.id);
        addToast({ title: '관심 목록에서 제거되었습니다.' });
      } else {
        await addToWishlist(popup.id);
        addToast({ title: '관심 목록에 추가되었습니다.' });
      }
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
    } catch (err) {
      console.error('wishlist error', err);
      addToast({ title: '관심 목록 처리 실패', description: err.message || '다시 시도해주세요.', variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardNavigate = (event) => {
    if (onCardClick) {
      event.preventDefault();
      onCardClick(popup.id);
    }
  };

  return (
    <Link to={ROUTES.popupDetail(popup.id)} onClick={handleCardNavigate} className="group block h-full">
      <div
        className={`relative w-full ${
          isCompact ? 'h-48 md:h-60' : 'aspect-3/4'
        } overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}
      >
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
