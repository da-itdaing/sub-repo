import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HeroCarousel } from '../../components/consumer/HeroCarousel';
import { HorizontalBanner } from '../../components/consumer/HorizontalBanner';
import { EventSection } from '../../components/consumer/EventSection';
import { SectionTitle } from '../../components/custom-ui/SectionTitle';
import { LoginConfirmDialog } from '../../components/auth/LoginConfirmDialog';
import { RecommendationModal } from '../../components/consumer/RecommendationModal';
import { useAuth } from '../../context/AuthContext';
import { usePopups } from '../../hooks/usePopups';
import { getImageUrl, getImageUrls } from '../../utils/imageUtils';

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showAllOpening, setShowAllOpening] = useState(false);
  const [showAllLocal, setShowAllLocal] = useState(false);
  const [showAllCommunity, setShowAllCommunity] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [dismissedToday, setDismissedToday] = useState(false);
  const [showLoginConfirmDialog, setShowLoginConfirmDialog] = useState(false);
  const [loginConfirmDialogType, setLoginConfirmDialogType] = useState('favorite');
  const requireLogin = useCallback(type => {
    setLoginConfirmDialogType(type);
    setShowLoginConfirmDialog(true);
  }, []);

  const { data: popupRaw, loading: popupLoading, error: popupError } = usePopups();

  const normalizedPopups = useMemo(() => {
    if (!popupRaw) return [];
    return popupRaw.map(item => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const now = new Date();
      let status = 'upcoming';
      if (now > end) {
        status = 'ended';
      } else if (now >= start && now <= end) {
        status = 'ongoing';
      }
      const dateLabel =
        start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) +
        ' - ' +
        end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });

      // thumbnail과 gallery는 ImagePayload 객체일 수도 있고 문자열일 수도 있음
      const fallbackImage = "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop";
      const thumbnailUrl = getImageUrl(item.thumbnail, fallbackImage);
      const galleryUrls = getImageUrls(item.gallery || [], "");
      
      // thumbnailUrl이 유효한지 확인 (빈 문자열이 아닌지)
      const finalThumbnail = thumbnailUrl && thumbnailUrl.trim() ? thumbnailUrl.trim() : fallbackImage;
      const finalImages = finalThumbnail !== fallbackImage 
        ? [finalThumbnail, ...galleryUrls].filter(url => url && url.trim())
        : galleryUrls.length > 0 
          ? galleryUrls.filter(url => url && url.trim())
          : [fallbackImage];

      return {
        id: item.id,
        title: item.title,
        thumbnail: finalThumbnail,
        images: finalImages.length > 0 ? finalImages : [fallbackImage],
        location: item.locationName,
        address: item.address ?? item.locationName ?? "",
        categories: item.styleTags,
        date: dateLabel,
        status
      };
    });
  }, [popupRaw]);

  const filteredPopups = useMemo(() => {
    return normalizedPopups;
  }, [normalizedPopups]);

  // 이벤트 데이터를 카테고리별로 분류
  const eventItems = useMemo(() => {
    const source = filteredPopups;
    
    // showAll 상태에 따라 limit 결정 (초기 표시 개수 증가)
    const openingLimit = showAllOpening ? source.filter(p => p.status === 'upcoming').length : 20;
    const localLimit = showAllLocal ? source.filter(p => p.status === 'ongoing' || p.status === 'upcoming').length : 40;
    const communityLimit = showAllCommunity ? source.length : 40;
    
    const opening = source
      .filter(p => p.status === 'upcoming')
      .slice(0, openingLimit)
      .map(p => ({
        id: p.id,
        image: p.thumbnail || p.images[0] || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop",
        title: p.title,
        date: p.date,
        location: p.location,
        address: p.address,
        categories: p.categories
      }));
    const local = source
      .filter(p => p.status === 'ongoing' || p.status === 'upcoming')
      .slice(0, localLimit)
      .map(p => ({
        id: p.id,
        image: p.thumbnail || p.images[0] || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop",
        title: p.title,
        date: p.date,
        location: p.location,
        address: p.address,
        categories: p.categories
      }));
    const community = source.slice(0, communityLimit).map(p => ({
      id: p.id,
      image: p.thumbnail || p.images[0] || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop",
      title: p.title,
      date: p.date,
      location: p.location,
      address: p.address,
      categories: p.categories
    }));
    return { opening, local, community };
  }, [filteredPopups, showAllOpening, showAllLocal, showAllCommunity]);

  const heroItems = useMemo(
    () => {
      const items = filteredPopups.slice(0, 7).map((p, idx) => {
        const imageUrl = p.thumbnail || (p.images && p.images.length > 0 ? p.images[0] : null) || "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop";
        return {
        id: p.id,
        rank: idx + 1,
          image: imageUrl,
        title: p.title,
      date: p.date,
      location: p.location
        };
      });
      return items;
    },
    [filteredPopups]
  );

  const handlePopupClick = useCallback(popupId => {
    navigate(`/popup/${popupId}`);
  }, [navigate]);

  const handleCloseRecommendationModal = () => {
    setShowRecommendationModal(false);
  };

  const handleDismissToday = () => {
    setDismissedToday(true);
    setShowRecommendationModal(false);
    // 사용자별로 저장 (userId + 날짜)
    const userId = user?.id || user?.loginId || 'anonymous';
    const today = new Date().toDateString();
    localStorage.setItem(`recommendationDismissed_${userId}`, today);
  };

  const handleResetRecommendation = useCallback(() => {
    if (user) {
      const userId = user?.id || user?.loginId || 'anonymous';
      localStorage.removeItem(`recommendationDismissed_${userId}`);
    }
    setDismissedToday(false);
    if (isAuthenticated && user?.role === 'CONSUMER') {
      setShowRecommendationModal(true);
    }
  }, [isAuthenticated, user]);

  // 관심등록 핸들러 (하트 클릭과 동일한 기능)
  const handleFavoriteToggle = useCallback((popupId, isFavorite) => {
    // TODO: 실제 API 호출로 교체 필요
    // 현재는 로컬 상태만 관리 (HeroCarousel의 handleFavoriteToggle과 동일한 로직)
  }, []);

  // Check if user dismissed modal today
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setDismissedToday(false);
      return;
    }
    const userId = user?.id || user?.loginId || 'anonymous';
    const dismissedDate = localStorage.getItem(`recommendationDismissed_${userId}`);
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setDismissedToday(true);
    } else {
      setDismissedToday(false);
    }
  }, [isAuthenticated, user]);

  // Show recommendation modal after consumer login
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CONSUMER' && !dismissedToday) {
      setShowRecommendationModal(true);
    }
  }, [isAuthenticated, user, dismissedToday]);

  useEffect(() => {
    const handleLogoEvent = () => handleResetRecommendation();
    window.addEventListener('layout:logoDoubleClick', handleLogoEvent);
    return () => window.removeEventListener('layout:logoDoubleClick', handleLogoEvent);
  }, [handleResetRecommendation]);

  if (popupError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center text-gray-500">
        <div>
          <p className="text-lg font-semibold">팝업 정보를 불러오지 못했습니다.</p>
          <p className="mt-2 text-sm text-gray-400">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  if (popupLoading && normalizedPopups.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center text-gray-500">
        <p>플리마켓 정보를 불러오고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-4 sm:space-y-5 lg:space-y-6">
      <>
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
        <HeroCarousel
          items={heroItems}
          onPopupClick={handlePopupClick}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
        />

        <HorizontalBanner onClick={() => {}} />
      </div>

      <div className="w-full mx-auto">
        <EventSection
          title={
            <SectionTitle
              title={
                <>
                  <span className="text-[#eb0000]">11월</span> 오픈한다잉!
                </>
              }
              showViewAll={false}
            />
          }
          items={eventItems.opening}
          showAll={showAllOpening}
          onToggleShowAll={() => setShowAllOpening(!showAllOpening)}
          type="opening"
          onPopupClick={handlePopupClick}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
        />

        <EventSection
          title={
            <SectionTitle
              title={
                <>
                  <span className="text-[#eb0000]">울 동네</span>에 이런 팝업 있다잉!
                </>
              }
              showViewAll={false}
            />
          }
          items={eventItems.local}
          showAll={showAllLocal}
          onToggleShowAll={() => setShowAllLocal(!showAllLocal)}
          type="local"
          onPopupClick={handlePopupClick}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
        />

        <EventSection
          title={
            <SectionTitle
              title={
                <>
                  <span className="text-[#eb0000]">카테고리</span>별 팝업 있다잉!
                </>
              }
              showViewAll={false}
            />
          }
          items={eventItems.community}
          showAll={showAllCommunity}
          onToggleShowAll={() => setShowAllCommunity(!showAllCommunity)}
          type="community"
          onPopupClick={handlePopupClick}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
        />
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-28 xs:bottom-32 sm:bottom-36 md:bottom-40 right-3 xs:right-4 md:right-8 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#eb0000] rounded-full shadow-xl hover:bg-[#cc0000] hover:scale-110 transition-all duration-300 flex items-center justify-center z-[1200] border-2 border-white"
        aria-label="위로가기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>

      {isAuthenticated && user?.role === 'CONSUMER' && showRecommendationModal && (
        <RecommendationModal
          onClose={handleCloseRecommendationModal}
          onDismissToday={handleDismissToday}
          onPopupClick={handlePopupClick}
          onFavoriteToggle={handleFavoriteToggle}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
        />
      )}

      <LoginConfirmDialog
        isOpen={showLoginConfirmDialog}
        onClose={() => setShowLoginConfirmDialog(false)}
        onConfirm={() => {
          setShowLoginConfirmDialog(false);
          navigate('/login', { state: { from: { pathname: location.pathname } } });
        }}
        type={loginConfirmDialogType}
      />
      </>
    </div>
  );
}

