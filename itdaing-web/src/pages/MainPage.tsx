import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HeroCarousel } from '../components/common/HeroCarousel';
import { HorizontalBanner } from '../components/common/HorizontalBanner';
import { EventSection } from '../components/common/EventSection';
import { SectionTitle } from '../components/common/SectionTitle';
import { LoginConfirmDialog } from '../components/auth/LoginConfirmDialog';
import { RecommendationModal } from '../components/consumer/RecommendationModal';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { usePopups } from '../hooks/usePopups';
import { FALLBACK_IMAGES } from '../constants/fallbackImages';

const SECTION_SAMPLE_LIMIT = 100;
const SECTION_MAX_VISIBLE = 20;

type EventCardData = {
  id: number;
  image: string;
  title: string;
  date: string;
  location: string;
  address?: string;
  categories?: string[];
};

const fallbackImageById = (seed: number | string) => {
  if (FALLBACK_IMAGES.length === 0) {
    return "";
  }
  if (typeof seed === "number" && Number.isFinite(seed)) {
    const index = Math.abs(Math.trunc(seed)) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
  }
  if (typeof seed === "string" && seed.length > 0) {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
  }
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
};

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { profile } = useUser();
  const [showAllOpening, setShowAllOpening] = useState(false);
  const [showAllLocal, setShowAllLocal] = useState(false);
  const [showAllCommunity, setShowAllCommunity] = useState(false);
  const [dismissedToday, setDismissedToday] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('recommendationDismissed');
    const today = new Date().toDateString();
    return stored === today;
  });
  const [closedForSession, setClosedForSession] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('recommendationClosed') === 'true';
  });
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showLoginConfirmDialog, setShowLoginConfirmDialog] = useState(false);
  const [loginConfirmDialogType, setLoginConfirmDialogType] = useState<'favorite' | 'review' | 'mypage'>('favorite');
  const requireLogin = useCallback((type: 'favorite' | 'review' | 'mypage') => {
    setLoginConfirmDialogType(type);
    setShowLoginConfirmDialog(true);
  }, []);

  const { data: popupRaw, loading: popupLoading, error: popupError } = usePopups();

  const normalizedPopups = useMemo(() => {
    if (!popupRaw) return [];
    return popupRaw
      .map(item => {
        // DB에 저장된 S3 경로(썸네일 + 갤러리)를 그대로 사용
        const gallery: string[] = [item.thumbnail ?? undefined, ...(item.gallery ?? [])].filter(Boolean) as string[];
        const start = item.startDate ? new Date(item.startDate) : null;
        const end = item.endDate ? new Date(item.endDate) : null;
        const now = new Date();
        let status: 'upcoming' | 'ongoing' | 'ended' = 'upcoming';
        if (start && end) {
          if (now > end) {
            status = 'ended';
          } else if (now >= start && now <= end) {
            status = 'ongoing';
          }
        }
        const dateLabel = start && end
          ? start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) +
            ' - ' +
            end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
          : '';

        return {
          id: item.id,
          title: item.title,
          thumbnail: gallery[0] || '',
          images: gallery,
          location: item.locationName || '',
          address: item.address ?? item.locationName ?? "",
          categories: item.styleTags || [],
          date: dateLabel,
          status,
          startTimestamp: start ? start.getTime() : null,
          endTimestamp: end ? end.getTime() : null,
        };
      });
  }, [popupRaw]);

  const regionPrefsKey = useMemo(() => (profile?.regions ?? []).join('|'), [profile?.regions]);
  const interestPrefsKey = useMemo(() => (profile?.interests ?? []).join('|'), [profile?.interests]);

  const eventBuckets = useMemo(() => {
    if (normalizedPopups.length === 0) {
      return {
        opening: [] as EventCardData[],
        local: [] as EventCardData[],
        community: [] as EventCardData[],
        localTotal: 0,
        communityTotal: 0,
        sorted: [] as typeof normalizedPopups,
      };
    }

    const sorted = [...normalizedPopups].sort((a, b) => {
      const aStart = a.startTimestamp ?? Number.MAX_SAFE_INTEGER;
      const bStart = b.startTimestamp ?? Number.MAX_SAFE_INTEGER;
      if (aStart !== bStart) return aStart - bStart;
      return a.id - b.id;
    });

    const mapToEventCard = (popup: (typeof normalizedPopups)[number]): EventCardData => ({
      id: popup.id,
      image: popup.images[0] || fallbackImageById(popup.id),
      title: popup.title,
      date: popup.date,
      location: popup.location,
      address: popup.address,
      categories: popup.categories,
    });

    const openingCandidates = sorted.filter((p) => p.status === 'upcoming');
    const opening = openingCandidates.slice(0, SECTION_SAMPLE_LIMIT).map(mapToEventCard);

    const regionPrefs = regionPrefsKey
      ? regionPrefsKey
          .split('|')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const interestPrefs = interestPrefsKey
      ? interestPrefsKey
          .split('|')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const prioritizedLocal: typeof sorted = [];
    const seenLocal = new Set<number>();
    if (regionPrefs.length > 0) {
      sorted.forEach((popup) => {
        const haystack = (popup.address ?? popup.location ?? '').toLowerCase();
        if (regionPrefs.some((pref) => haystack.includes(pref))) {
          prioritizedLocal.push(popup);
          seenLocal.add(popup.id);
        }
      });
    }
    sorted.forEach((popup) => {
      if (!seenLocal.has(popup.id)) {
        prioritizedLocal.push(popup);
        seenLocal.add(popup.id);
      }
    });
    const localSample = prioritizedLocal.slice(0, SECTION_SAMPLE_LIMIT);

    const communityScores = sorted.map((popup) => {
      const categories = (popup.categories ?? []).map((cat) => cat.toLowerCase());
      const score =
        interestPrefs.length > 0
          ? interestPrefs.reduce(
              (acc, pref) =>
                acc + (categories.some((cat) => cat.includes(pref) || pref.includes(cat)) ? 1 : 0),
              0
            )
          : 0;
      return { popup, score };
    });
    communityScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aStart = a.popup.startTimestamp ?? Number.MAX_SAFE_INTEGER;
      const bStart = b.popup.startTimestamp ?? Number.MAX_SAFE_INTEGER;
      return aStart - bStart;
    });
    const communityOrdered: typeof sorted = [];
    const seenCommunity = new Set<number>();
    communityScores.forEach(({ popup }) => {
      if (!seenCommunity.has(popup.id)) {
        communityOrdered.push(popup);
        seenCommunity.add(popup.id);
      }
    });
    if (communityOrdered.length === 0) {
      communityOrdered.push(...sorted);
    }
    const communitySample = communityOrdered.slice(0, SECTION_SAMPLE_LIMIT);

    return {
      opening,
      local: localSample.map(mapToEventCard),
      community: communitySample.map(mapToEventCard),
      localTotal: Math.min(prioritizedLocal.length, SECTION_SAMPLE_LIMIT),
      communityTotal: Math.min(communityOrdered.length, SECTION_SAMPLE_LIMIT),
      sorted,
    };
  }, [normalizedPopups, regionPrefsKey, interestPrefsKey]);

  const heroItems = useMemo(() => {
    const source = eventBuckets.sorted;
    if (!source || source.length === 0) return [];
    return source
      .slice(0, 7)
      .map((p, idx) => ({
        id: p.id,
        rank: idx + 1,
        image: p.images[0] || fallbackImageById(p.id),
        title: p.title,
        date: p.date,
        location: p.location,
      }));
  }, [eventBuckets.sorted]);

  const handlePopupClick = useCallback((popupId: number) => {
    navigate(`/popup/${popupId}`);
  }, [navigate]);

  const handleCloseRecommendationModal = useCallback(() => {
    setShowRecommendationModal(false);
    setClosedForSession(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('recommendationClosed', 'true');
    }
  }, []);

  const handleDismissToday = useCallback(() => {
    const today = new Date().toDateString();
    setDismissedToday(true);
    setClosedForSession(true);
    setShowRecommendationModal(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('recommendationDismissed', today);
      window.sessionStorage.setItem('recommendationClosed', 'true');
    }
  }, []);

  const handleResetRecommendation = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('recommendationDismissed');
      window.sessionStorage.removeItem('recommendationClosed');
    }
    setDismissedToday(false);
    setClosedForSession(false);
    if (isAuthenticated && user?.role === 'CONSUMER') {
      setShowRecommendationModal(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncState = () => {
      const today = new Date().toDateString();
      setDismissedToday(window.localStorage.getItem('recommendationDismissed') === today);
      setClosedForSession(window.sessionStorage.getItem('recommendationClosed') === 'true');
    };
    syncState();
    window.addEventListener('focus', syncState);
    window.addEventListener('storage', syncState);
    return () => {
      window.removeEventListener('focus', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CONSUMER') {
      setShowRecommendationModal(false);
      setClosedForSession(false);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('recommendationClosed');
      }
      return;
    }
    if (!dismissedToday && !closedForSession) {
      setShowRecommendationModal(true);
    }
  }, [isAuthenticated, user, dismissedToday, closedForSession]);

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

      <HorizontalBanner onClick={() => {}} />

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
          items={eventBuckets.opening}
          showAll={showAllOpening}
          onToggleShowAll={() => setShowAllOpening(!showAllOpening)}
          type="opening"
          onPopupClick={handlePopupClick}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
          maxItems={SECTION_MAX_VISIBLE}
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
          items={eventBuckets.local}
          showAll={showAllLocal}
          onToggleShowAll={() => setShowAllLocal(!showAllLocal)}
          type="local"
          totalCountOverride={eventBuckets.localTotal}
          onPopupClick={handlePopupClick}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
          maxItems={SECTION_MAX_VISIBLE}
        />

        <EventSection
          title={
            <SectionTitle
              title={
                <>
                  {isAuthenticated && profile?.interests && profile.interests.length > 0 ? (
                    <>
                      <span className="text-[#eb0000]">소비자 취향</span> 카테고리 팝업 있다잉!
                    </>
                  ) : (
                    <>
                      <span className="text-[#eb0000]">카테고리</span>별 팝업 있다잉!
                    </>
                  )}
                </>
              }
              showViewAll={false}
            />
          }
          items={eventBuckets.community}
          showAll={showAllCommunity}
          onToggleShowAll={() => setShowAllCommunity(!showAllCommunity)}
          type="community"
          totalCountOverride={eventBuckets.communityTotal}
          onPopupClick={handlePopupClick}
          isLoggedIn={isAuthenticated}
          onLoginClick={() => requireLogin('favorite')}
          userPreferences={isAuthenticated && profile?.interests ? profile.interests : undefined}
          maxItems={SECTION_MAX_VISIBLE}
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

      {isAuthenticated && user?.role === 'CONSUMER' && showRecommendationModal && (
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

