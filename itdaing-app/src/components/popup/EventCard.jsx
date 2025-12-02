import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getImageUrl } from '@/utils/imageUtils';
import { ROUTES } from '@/routes/paths';
import { addToWishlist, removeFromWishlist } from '@/services/wishlistService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useLoginPrompt } from '@/hooks/useLoginPrompt';
import { useFavoriteStore } from '@/store/favoriteStore';
import { runtimeStatusLabel } from '@/utils/popupUtils';

/**
 * EventCard 컴포넌트 (캐러셀 스타일 적용)
 * 팝업 카드 - 이미지 위 오버레이 스타일
 */
const EventCard = ({ popup, variant = 'default', onCardClick }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { openLoginPrompt } = useLoginPrompt();
  const isCompact = variant === 'compact';
  const hydrated = useFavoriteStore((state) => state.hydrated);
  const favoriteFromStore = useFavoriteStore((state) => (popup?.id ? state.favoriteIds.has(popup.id) : false));
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  
  const thumbnailUrl = getImageUrl(popup.thumbnail || popup.thumbnailImageUrl, '/placeholder-popup.png');
  const start = popup.startDate ? new Date(popup.startDate) : null;
  const end = popup.endDate ? new Date(popup.endDate) : null;
  const dateLabel = start && end
    ? `${start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} - ${end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`
    : popup.startDate || '일정 미정';
  const isFavorite = hydrated ? favoriteFromStore : Boolean(popup?.isFavorite);

  // 상세 페이지와 동일하게, UI용 즐겨찾기 상태를 별도로 관리 (낙관적 업데이트)
  const [isFavoriteUi, setIsFavoriteUi] = useState(isFavorite);

  // popup 또는 전역 store 값이 바뀔 때 UI 상태 동기화
  useEffect(() => {
    setIsFavoriteUi(isFavorite);
  }, [isFavorite, popup?.id]);
  const statusLabel = useMemo(() => {
    if (popup?.runtimeStatus) {
      return runtimeStatusLabel[popup.runtimeStatus] ?? runtimeStatusLabel.default;
    }
    return popup?.status === 'upcoming'
      ? '오픈 예정'
      : popup?.status === 'ongoing'
      ? '진행 중'
      : popup?.status === 'ended'
      ? '종료'
      : popup?.status || null;
  }, [popup]);

  // 상태 뱃지 색상 (오픈 예정/진행중/종료 각각 진한 파스텔톤 + 흰 글씨)
  const statusBadgeClass = useMemo(() => {
    const runtime = popup?.runtimeStatus || popup?.status;
    if (runtime === 'upcoming') {
      // 오픈 예정: #48D4AA
      return 'bg-[#3DAC8B] text-white';
    }
    if (runtime === 'ongoing') {
      // 진행 중: #4DAAE3
      return 'bg-[#4797C9] text-white';
    }
    if (runtime === 'ended') {
      // 종료: #FF6969
      return 'bg-[#C94747] text-white';
    }
    return 'bg-white/90 text-gray-900';
  }, [popup?.runtimeStatus, popup?.status]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      const shouldLogin = await openLoginPrompt({
        description: '관심 팝업은 로그인 후 이용 가능합니다.\n지금 로그인하시겠습니까?',
      });
      if (shouldLogin) {
        navigate(ROUTES.login);
      }
      return;
    }

    if (role && role !== 'CONSUMER') {
      addToast({
        title: '관심 팝업은 소비자 계정에서만 이용 가능합니다.',
        variant: 'error',
      });
      return;
    }

    if (isProcessing) return;

    // UI 먼저 토글 (빠른 피드백)
    const prev = isFavoriteUi;
    const next = !prev;
    setIsFavoriteUi(next);
    setIsProcessing(true);
    try {
      if (isFavorite) {
        await removeFromWishlist(popup.id);
        addToast({ title: '관심 목록에서 제거되었습니다.' });
      } else {
        await addToWishlist(popup.id);
        addToast({ title: '관심 목록에 추가되었습니다.' });
      }
      if (isFavorite) {
        removeFavorite(popup.id);
      } else {
        addFavorite(popup.id);
      }
      
      // 캐시 무효화: 위시리스트, 팝업 목록, 개별 팝업, 대시보드 등
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['popups'] });
      queryClient.invalidateQueries({ queryKey: ['popup', popup.id] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    } catch (err) {
      console.error('wishlist error', err);
      // 실패 시 UI 롤백
      setIsFavoriteUi(isFavorite);
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
        } overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-gray-100`}
      >
        {/* 이미지 */}
          <img
            src={thumbnailUrl}
            alt={popup.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.src.endsWith('/placeholder-popup.png')) return; // Loop prevention
              e.currentTarget.src = '/placeholder-popup.png';
              e.currentTarget.onerror = null; // Final safeguard
            }}
          />
        
        {/* 오버레이 그라데이션 - 텍스트 가독성을 위한 하단 그라데이션 (연하게) */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
        
        {/* 좋아요 버튼 (PopupDetailPage와 동일한 스타일, 배경은 항상 흰색) */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          disabled={isProcessing}
          className={`
            absolute top-2 right-2 inline-flex items-center justify-center 
            p-1.5 
            rounded-full shadow-md
            transition-colors z-10
            ${isFavoriteUi ? 'bg-[#FFCDCD]' : 'bg-white'}
          `}
          aria-label="관심 팝업"
        >
          <Heart 
            className="w-4 h-4"
            fill={isFavoriteUi ? '#DC3535' : 'none'}
            color={isFavoriteUi ? '#DC3535' : '#414141'}
          />
        </button>


        {/* 상태 배지 */}
        {statusLabel && (
          <div
            className={`absolute top-2 left-2 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm ${statusBadgeClass}`}
          >
            {statusLabel}
          </div>
        )}

        {/* 텍스트 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
          <h3
            className="text-lg font-bold text-white leading-tight truncate"
            title={popup.title}
          >
            {popup.title}
          </h3>
          <p className="text-[13px] text-white/90">{dateLabel}</p>
          <p className="flex items-center gap-0.5 text-[13px] text-white/85">
            <MapPin className="w-2.5 h-2.5" />
            <span className="line-clamp-1">{popup.address || popup.location || '위치 미정'}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
