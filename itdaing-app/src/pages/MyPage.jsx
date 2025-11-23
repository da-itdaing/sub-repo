import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Heart, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import EventCard from '@/components/popup/EventCard';
import { useAuthStore } from '@/store/authStore';
import { getMyProfile } from '@/services/authService';
import { useMyWishlist } from '@/hooks/useWishlist';
import { usePopups } from '@/hooks/usePopups';
import { ROUTES } from '@/routes/paths';
import { getImageUrl } from '@/utils/imageUtils';

const TAB_LIST = [
  { key: 'recommend', label: '맞춤 추천' },
  { key: 'favorites', label: '관심 팝업' },
  { key: 'reviews', label: '내 후기' },
  { key: 'schedule', label: '일정' },
];

const normalizePopup = (popupLike) => {
  if (!popupLike) return null;
  const popup = popupLike.popup ?? popupLike;
  const id = popup.id ?? popupLike.popupId ?? popupLike.id;
  if (!id) return null;

  const thumbnail = popup.thumbnail || popup.thumbnailImageUrl || popup.heroImageUrl || popup.imageUrl;

  return {
    ...popup,
    id,
    title: popup.title || popup.name || popup.popupName || '이름 없는 팝업',
    thumbnail: getImageUrl(thumbnail, '/placeholder-popup.png'),
    address: popup.address || popup.locationName || popup.region || '위치 미정',
    isFavorite: true,
  };
};

const CompactRecommendationCard = ({ popup }) => (
  <div className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
    <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
      <img
        src={popup.thumbnail || '/placeholder-popup.png'}
        alt={popup.title}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = '/placeholder-popup.png';
        }}
      />
    </div>
    <div className="flex flex-1 flex-col justify-between text-sm text-gray-700">
      <div>
        <p className="text-xs font-semibold text-primary uppercase">
          {popup.status === 'upcoming' ? '오픈 예정' : popup.status === 'ongoing' ? '진행 중' : '종료'}
        </p>
        <p className="mt-0.5 line-clamp-2 font-semibold text-gray-900">{popup.title}</p>
      </div>
      <p className="text-xs text-gray-500">
        {popup.startDate} ~ {popup.endDate}
      </p>
    </div>
  </div>
);

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState('recommend');
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });
  const { data: wishlistData, isLoading: wishlistLoading } = useMyWishlist({ page: 0, size: 40 });
  const { data: popups = [], isLoading: popupLoading } = usePopups();

  const favoritePopups = useMemo(() => {
    return (wishlistData?.content ?? [])
      .map(normalizePopup)
      .filter(Boolean)
      .map((popup) => ({ ...popup, isFavorite: true }));
  }, [wishlistData]);

  const recommendations = useMemo(() => {
    if (!popups || popups.length === 0) return [];
    const now = new Date();
    const activePopups = popups.filter((popup) => {
      const endDate = popup.endDate ? new Date(popup.endDate) : null;
      if (endDate && now > endDate) return false;
      return true;
    });

    const preferredIds = profile?.recommendations ?? [];
    if (preferredIds.length > 0) {
      return activePopups.filter((popup) => preferredIds.includes(popup.id)).slice(0, 6);
    }
    return activePopups.slice(0, 6);
  }, [popups, profile?.recommendations]);

  const stats = {
    favorites: favoritePopups.length,
    recommendations: recommendations.length,
    regions: profile?.regions?.length ?? 0,
    interests: profile?.interests?.length ?? profile?.categoryPreferences?.length ?? 0,
  };

  const displayName = profile?.nickname || user?.nickname || profile?.name || user?.name || '게스트';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <LogOut className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">로그인이 필요해요</h2>
            <p className="mt-2 text-sm text-gray-500">
              마이페이지에서 관심 팝업과<br />맞춤 추천을 확인해보세요.
            </p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.login)}
              className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              로그인 / 회원가입
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-[540px] md:max-w-[1080px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 md:px-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="뒤로 가기"
              className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 text-left">
              <p className="text-xs text-gray-500">반가워요, {displayName}님</p>
              <h1 className="text-2xl font-bold text-gray-900">나의 다잇다잉</h1>
              <p className="text-xs text-gray-500">
                {profile?.regions?.join(', ') || '관심 지역을 설정해보세요'}
              </p>
            </div>
          </div>

          <div className="px-5 pb-5 pt-4 md:px-6">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">관심 팝업</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.favorites}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">추천 큐레이션</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.recommendations}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">관심 지역</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.regions}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">선호 카테고리</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.interests}</p>
              </div>
            </div>
          </div>

          <nav className="px-6 pb-4 border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
              {TAB_LIST.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </section>

        {activeTab === 'recommend' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <Sparkles className="w-4 h-4 text-primary" />
              오늘의 추천
            </h2>
            {popupLoading ? (
              <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm border">
                추천 데이터를 불러오는 중입니다...
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {recommendations.map((popup) => (
                  <EventCard key={`recommend-${popup.id}`} popup={popup} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm border">
                추천 데이터가 아직 없습니다. 관심 카테고리를 설정하면 더 나은 큐레이션을 받을 수 있어요.
              </div>
            )}
          </section>
        )}

        {activeTab === 'favorites' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <Heart className="w-4 h-4 text-primary" />
              관심 팝업
            </h2>
            {wishlistLoading ? (
              <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm border">
                관심 팝업을 불러오는 중입니다...
              </div>
            ) : favoritePopups.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {favoritePopups.map((popup) => (
                  <EventCard key={`favorite-${popup.id}`} popup={popup} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm border">
                관심 등록한 팝업이 없습니다. 마음에 드는 팝업을 찜해보세요!
              </div>
            )}
          </section>
        )}

        {activeTab === 'reviews' && (
          <section className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">내 후기</h2>
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-sm text-gray-500">아직 작성한 후기가 없습니다.</p>
              <button
                onClick={() => navigate(ROUTES.home)}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition"
              >
                팝업 방문하고 후기 쓰기
              </button>
            </div>
          </section>
        )}

        {activeTab === 'schedule' && (
          <section className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">일정</h2>
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-sm text-gray-500">예정된 방문 일정이 없습니다.</p>
              <button
                onClick={() => navigate(ROUTES.nearby)}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
              >
                주변 팝업 둘러보기
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MyPage;

