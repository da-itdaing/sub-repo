import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Heart, LogOut, Sparkles, UserCog, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import EventCard from '@/components/popup/EventCard';
import { useAuthStore } from '@/store/authStore';
import { getMyProfile, getMyPreferences } from '@/services/authService';
import { useMyWishlist } from '@/hooks/useWishlist';
import { usePopups } from '@/hooks/usePopups';
import { ROUTES } from '@/routes/paths';
import { normalizePopup, isPopupActive, resolvePopupThumbnail } from '@/utils/popupUtils';
import { useMasterData } from '@/hooks/useMasterData';

import CalendarSection from '@/components/common/CalendarSection';

const TAB_LIST = [
  { key: 'recommend', label: '맞춤 추천' },
  { key: 'favorites', label: '관심 팝업' },
  { key: 'reviews', label: '내 후기' },
  { key: 'schedule', label: '일정' },
];

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('recommend');
  const [recommendVisibleCount, setRecommendVisibleCount] = useState(8);
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });
  const { data: preferenceData } = useQuery({
    queryKey: ['my-preferences'],
    queryFn: getMyPreferences,
    enabled: isAuthenticated,
  });
  const { data: wishlistData, isLoading: wishlistLoading } = useMyWishlist({ page: 0, size: 40 });
  const { data: popups = [], isLoading: popupLoading } = usePopups();
  const { categories, styles } = useMasterData();

  const favoritePopups = useMemo(() => {
    return (wishlistData?.content ?? [])
      .map((item) => {
        const target = item?.popup ?? item;
        if (!target) return null;
        const normalized = normalizePopup(target);
        if (!normalized?.id) return null;
        const thumbnail = resolvePopupThumbnail(normalized);
        return { ...normalized, thumbnail, isFavorite: true };
      })
      .filter((popup) => popup && isPopupActive(popup));
  }, [wishlistData]);

  const recommendations = useMemo(() => {
    if (!popups || popups.length === 0) return [];
    const preferredIds = profile?.recommendations ?? [];
    const activePopups = popups.filter(isPopupActive);
    let result = [];

    if (preferredIds.length > 0) {
      result = activePopups.filter((popup) => preferredIds.includes(popup.id));
    }

    if (result.length === 0) {
      result = activePopups.slice(0, 10);
    }

    return result;
  }, [popups, profile?.recommendations]);

  useEffect(() => {
    setRecommendVisibleCount(8);
  }, [recommendations.length]);

  const displayedRecommendations = useMemo(() => {
    if (recommendations.length === 0) return [];
    return recommendations.slice(0, Math.min(recommendVisibleCount, recommendations.length));
  }, [recommendations, recommendVisibleCount]);

  const canLoadMore = displayedRecommendations.length < recommendations.length;
  const fullyExpanded = displayedRecommendations.length === recommendations.length;

  const stats = {
    recommendations: recommendations.length,
    favorites: favoritePopups.length,
  };

  const categoryNameMap = useMemo(() => {
    const map = new Map();
    (categories ?? []).forEach((category) => {
      if (category?.id != null && category?.name) {
        map.set(category.id, category.name);
      }
    });
    return map;
  }, [categories]);

  const styleNameMap = useMemo(() => {
    const map = new Map();
    (styles ?? []).forEach((style) => {
      if (style?.id != null && style?.name) {
        map.set(style.id, style.name);
      }
    });
    return map;
  }, [styles]);

  const preferredCategories = useMemo(() => {
    if (!preferenceData?.interestCategoryIds) return [];
    return preferenceData.interestCategoryIds
      .map((id) => categoryNameMap.get(id))
      .filter(Boolean)
      .slice(0, 3);
  }, [preferenceData, categoryNameMap]);

  const preferredStyles = useMemo(() => {
    if (!preferenceData?.styleIds) return [];
    return preferenceData.styleIds
      .map((id) => styleNameMap.get(id))
      .filter(Boolean)
      .slice(0, 3);
  }, [preferenceData, styleNameMap]);

  const preferenceChips = [
    {
      key: 'categories',
      title: '선호 카테고리',
      items: preferredCategories,
      emptyLabel: '관심 카테고리를 설정해보세요',
    },
    {
      key: 'styles',
      title: '선호 스타일',
      items: preferredStyles,
      emptyLabel: '관심 스타일을 설정해보세요',
    },
  ];

  const displayName = profile?.nickname || user?.nickname || profile?.name || user?.name || '게스트';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 pt-16 md:pt-24 pb-12">
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

      <main className="flex-1 w-full max-w-[540px] md:max-w-[1200px] mx-auto px-4 md:px-8 pt-16 pb-16 md:pt-24 md:pb-20 space-y-8">
        {/* 프로필 섹션 */}
        <section className="rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div
            className="relative px-6 py-8 text-white"
            style={{ background: 'linear-gradient(90deg, #FFC1DF 0%, #FFD8EA 50%, #FFC1DF 100%)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => navigate(ROUTES.mypageSettings)}
                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-sm"
              >
                <UserCog className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 overflow-hidden">
                  <img 
                    src={profile?.profileImage?.url || '/placeholder-user.png'} 
                    alt="profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.target.src.endsWith('/placeholder-user.png')) return;
                      e.target.src = '/placeholder-user.png';
                    }}
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-primary border-2 border-gray-900 rounded-full flex items-center justify-center">
                  <span className="sr-only">Active</span>
                </span>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">반가워요, {displayName}님! 👋</h1>
                <p className="text-white/70 text-sm mb-4">
                  {profile?.regions?.length > 0 
                    ? `선호 지역: ${profile.regions.join(', ')}`
                    : '관심 지역을 설정하고 맞춤 추천을 받아보세요'}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {profile?.interests?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-3 border-y border-gray-100 px-4 py-4">
          {[
            { key: 'recommendations', label: '맞춤 추천', value: stats.recommendations },
            { key: 'favorites', label: '관심 팝업', value: stats.favorites },
          ].map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-gray-100 bg-white/70 px-4 py-3 text-center shadow-sm"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* 선호 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 py-4 bg-gray-50 border-t border-gray-100">
          {preferenceChips.map((group) => (
            <div key={group.key} className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-2">{group.title}</p>
              {group.items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {group.items.map((chip, idx) => {
                    const label =
                      typeof chip === 'string'
                        ? chip
                        : chip?.name ?? chip?.label ?? '';
                    if (!label) return null;
                    return (
                      <span
                        key={`${group.key}-${label}-${idx}`}
                        className="rounded-full bg-gray-900 text-white text-xs font-medium px-3 py-1"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">{group.emptyLabel}</p>
              )}
            </div>
          ))}
        </div>
        </section>
      
      {/* 탭 영역 */}
      <section className="rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
        <nav className="px-6">
          <div className="grid grid-cols-2 gap-2 md:flex md:gap-8 md:justify-start">
            {TAB_LIST.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap w-full md:w-auto ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t border-gray-100 px-3 md:px-6 py-6 min-h-[300px]">
          {activeTab === 'recommend' && (
            <section className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                  <Sparkles className="w-5 h-5 text-primary fill-primary" />
                  오늘의 맞춤 추천
                </h2>
                <span className="text-xs text-gray-500">종료된 팝업 제외</span>
              </div>
              
              {popupLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-3/4 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="relative">
                  {/* 데스크톱: 4열 그리드 (더보기 버튼 추가 가능) */}
                  <div className="hidden md:grid grid-cols-4 gap-5">
                    {displayedRecommendations.map((popup) => (
                      <EventCard key={`recommend-pc-${popup.id}`} popup={popup} />
                    ))}
                  </div>

                  {/* 모바일: 가로 스크롤 슬라이더 */}
                  <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide px-1">
                    {displayedRecommendations.map((popup) => (
                      <div key={`recommend-mo-${popup.id}`} className="w-[160px] shrink-0 snap-start">
                        <EventCard popup={popup} variant="compact" />
                      </div>
                    ))}
                  </div>
                  
                  {recommendations.length > 8 && (
                    <div className="mt-6 flex flex-col gap-2 md:flex-row md:justify-center md:items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setRecommendVisibleCount((prev) =>
                            Math.min(prev + 4, recommendations.length)
                          )
                        }
                        disabled={!canLoadMore}
                        className={`w-full md:w-auto px-5 py-2 rounded-full border text-sm font-medium transition flex items-center justify-center gap-1 ${
                          canLoadMore
                            ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        더보기 <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRecommendVisibleCount(fullyExpanded ? 8 : recommendations.length)
                        }
                        className={`w-full md:w-auto px-5 py-2 rounded-full text-sm font-medium shadow-sm transition ${
                          fullyExpanded
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        {fullyExpanded ? '접기' : '전체보기'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-10 text-center border border-gray-100">
                  <p className="text-gray-500 mb-4">추천할 만한 진행 중인 팝업이 없습니다.</p>
                  <button 
                    onClick={() => navigate(ROUTES.search)}
                    className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    모든 팝업 둘러보기
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === 'favorites' && (
            <section className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                  <Heart className="w-5 h-5 text-primary fill-primary" />
                  내가 찜한 팝업
                </h2>
                <button 
                  onClick={() => navigate(ROUTES.mypageFavorites)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  전체보기
                </button>
              </div>

              {wishlistLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-3/4 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : favoritePopups.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {favoritePopups.slice(0, 8).map((popup) => (
                    <EventCard key={`favorite-${popup.id}`} popup={popup} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-10 text-center border border-gray-100">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">아직 찜한 팝업이 없어요</p>
                  <p className="text-xs text-gray-500 mb-4">마음에 드는 팝업을 발견하면 하트를 눌러보세요!</p>
                  <button
                    onClick={() => navigate(ROUTES.home)}
                    className="px-5 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    인기 팝업 구경하기
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === 'reviews' && (
            <section className="animate-fade-in">
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">작성한 후기 관리</h2>
                <p className="text-sm text-gray-500 mb-6">
                  다녀온 팝업의 후기를 작성하고<br />다른 사람들과 경험을 공유해보세요.
                </p>
                <button
                  onClick={() => navigate(ROUTES.mypageReviews)}
                  className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                >
                  내 후기 전체보기
                </button>
              </div>
            </section>
          )}

          {activeTab === 'schedule' && (
            <div className="animate-fade-in">
              <CalendarSection popups={favoritePopups} />
            </div>
          )}
        </div>
      </section>
    </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MyPage;
