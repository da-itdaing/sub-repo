import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HeroCarousel } from '../components/common/HeroCarousel';
import { HorizontalBanner } from '../components/common/HorizontalBanner';
import { EventSection } from '../components/common/EventSection';
import { SectionTitle } from '../components/common/SectionTitle';
import { LoginConfirmDialog } from '../components/auth/LoginConfirmDialog';
import { RecommendationModal } from '../components/consumer/RecommendationModal';
import { useAuth } from '../context/AuthContext';
import { usePopups } from '../hooks/usePopups';

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
  const [loginConfirmDialogType, setLoginConfirmDialogType] = useState<'favorite' | 'review' | 'mypage'>('favorite');
  const requireLogin = useCallback((type: 'favorite' | 'review' | 'mypage') => {
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
      let status: 'upcoming' | 'ongoing' | 'ended' = 'upcoming';
      if (now > end) {
        status = 'ended';
      } else if (now >= start && now <= end) {
        status = 'ongoing';
      }
      const dateLabel =
        start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) +
        ' - ' +
        end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });

      return {
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        images: [item.thumbnail, ...item.gallery],
        location: item.locationName,
        address: item.address ?? item.locationName ?? "",
        categories: item.styleTags,
        date: dateLabel,
        status
      };
    });
  }, [popupRaw]);

  // 이벤트 데이터를 카테고리별로 분류
  const eventItems = useMemo(() => {
    const opening = normalizedPopups
      .filter(p => p.status === 'upcoming')
      .slice(0, 12)
      .map(p => ({
        id: p.id,
        image: p.images[0],
        title: p.title,
        date: p.date,
        location: p.location,
        address: p.address,
        categories: p.categories
      }));
    const local = normalizedPopups
      .filter(p => p.status === 'ongoing' || p.status === 'upcoming')
      .slice(0, 20)
      .map(p => ({
        id: p.id,
        image: p.images[0],
        title: p.title,
        date: p.date,
        location: p.location,
        address: p.address,
        categories: p.categories
      }));
    const community = normalizedPopups.slice(0, 12).map(p => ({
      id: p.id,
      image: p.images[0],
      title: p.title,
      date: p.date,
      location: p.location,
      address: p.address,
      categories: p.categories
    }));
    return { opening, local, community };
  }, [normalizedPopups]);

  const heroItems = useMemo(
    () =>
      normalizedPopups.slice(0, 7).map((p, idx) => ({
        id: p.id,
        rank: idx + 1,
        image: p.images[0],
        title: p.title,
      date: p.date,
      location: p.location
      })),
    [normalizedPopups]
  );

  const handlePopupClick = useCallback((popupId: number) => {
    navigate(`/popup/${popupId}`);
  }, [navigate]);

  const handleCloseRecommendationModal = () => {
    setShowRecommendationModal(false);
  };

  const handleDismissToday = () => {
    setDismissedToday(true);
    setShowRecommendationModal(false);
    const today = new Date().toDateString();
    localStorage.setItem('recommendationDismissed', today);
  };

  const handleResetRecommendation = useCallback(() => {
    localStorage.removeItem('recommendationDismissed');
    setDismissedToday(false);
    if (isAuthenticated && user?.role === 'CONSUMER') {
      setShowRecommendationModal(true);
    }
  }, [isAuthenticated, user]);

  // Check if user dismissed modal today
  useEffect(() => {
    const dismissedDate = localStorage.getItem('recommendationDismissed');
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setDismissedToday(true);
    }
  }, []);

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
    <div className="w-full max-w-[1344px] mx-auto px-4 md:px-6 lg:px-8">
      <HeroCarousel
        items={heroItems}
        onPopupClick={handlePopupClick}
        isLoggedIn={isAuthenticated}
        onLoginClick={() => requireLogin('favorite')}
      />

      <HorizontalBanner onClick={() => console.log('Banner clicked!')} />

      <div className="w-full max-w-[1089px] mx-auto">
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
        className="fixed bottom-14 xs:bottom-16 sm:bottom-20 md:bottom-24 right-3 xs:right-4 md:right-8 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#eb0000] rounded-full shadow-xl hover:bg-[#cc0000] hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 border-2 border-white"
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

      {isAuthenticated && showRecommendationModal && (
        <RecommendationModal
          onClose={handleCloseRecommendationModal}
          onDismissToday={handleDismissToday}
          onPopupClick={handlePopupClick}
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
    </div>
  );
}

