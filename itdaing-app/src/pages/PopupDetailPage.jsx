import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Eye, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import PopupEditModal from '@/components/popup/PopupEditModal';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

import DescriptionTab from '@/components/popup/detail/tabs/DescriptionTab';
import MapTab from '@/components/popup/detail/tabs/MapTab';
import ReviewTab from '@/components/popup/detail/tabs/ReviewTab';

import { usePopupById, usePopupReviews } from '@/hooks/usePopups';
import { getImageUrl, getImageUrls } from '@/utils/imageUtils';
import { addToWishlist, removeFromWishlist } from '@/services/wishlistService';
import { recordPopupView } from '@/services/popupService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useLoginPrompt } from '@/hooks/useLoginPrompt';
import { ROUTES } from '@/routes/paths';
import { useFavoriteStore } from '@/store/favoriteStore';
import { runtimeStatusLabel } from '@/utils/popupUtils';

const PopupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isAuthenticated } = useAuthStore();
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const { addToast } = useToast();
  
  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { openLoginPrompt } = useLoginPrompt();

  const hydrated = useFavoriteStore((state) => state.hydrated);
  const favoriteSet = useFavoriteStore((state) => state.favoriteIds);
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);

  const [activeTab, setActiveTab] = useState('description');
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // ⭐ UI 상태
  const [isFavoriteUi, setIsFavoriteUi] = useState(false);
  const [localFavoriteCount, setLocalFavoriteCount] = useState(0);

  // 📌 데이터 페칭
  const { data: popup, isLoading } = usePopupById(id, { refetchOnMount: 'always' });
  const { data: reviews = [] } = usePopupReviews(id);

  // 📝 수정 권한 확인
  // ADMIN: 모든 팝업 수정 가능
  // SELLER: 본인 소유 팝업만 수정 가능
  const canEdit = useMemo(() => {
    if (!popup || !isAuthenticated) return false;
    if (role === 'ADMIN') return true;
    if (role === 'SELLER' && popup.sellerId && user?.id && popup.sellerId === user.id) return true;
    return false;
  }, [popup, isAuthenticated, role, user?.id]);

  // 📌 초기 Count 세팅
  useEffect(() => {
    if (popup?.favoriteCount !== undefined) {
      setLocalFavoriteCount(popup.favoriteCount);
    }
  }, [popup?.favoriteCount]);

  // 📈 조회수 증가 이벤트 기록 (팝업 ID 변경 시 1회만 실행)
  useEffect(() => {
    if (popup?.id) {
      recordPopupView(popup.id, 'detail_page');
    }
  }, [popup?.id]);

  // ⭐⭐ 핵심: UI 하트 초기값은 딱 1번만 설정 (popup.id 변경 시에만!)
  useEffect(() => {
    if (!popup?.id) return;

    let initial = false;

    if (hydrated) {
      initial = favoriteSet.has(popup.id); // 전역 store 기준
    } else if (popup?.isFavorite) {
      initial = true; // 서버 기준 초깃값
    }

    setIsFavoriteUi(initial);
  }, [popup?.id]); // 절대 favoriteSet이나 popup.isFavorite 넣지 말 것

  // ❤️ 관심 토글
  const handleFavoriteToggle = async () => {
    if (!popup?.id) return;

    // 로그인 체크
    if (!isAuthenticated) {
      const shouldLogin = await openLoginPrompt({
        description: '관심 팝업은 로그인 후 이용 가능합니다.\n지금 로그인하시겠습니까?',
      });
      if (shouldLogin) navigate(ROUTES.login);
      return;
    }

    // 역할 체크
    if (role && role !== 'CONSUMER') {
      addToast({
        title: '관심 팝업은 소비자 계정에서만 이용 가능합니다.',
        variant: 'error',
      });
      return;
    }

    if (isFavoriteLoading) return;
    setIsFavoriteLoading(true);

    const prev = isFavoriteUi;
    const next = !prev;

    // 1) UI 즉시 반영
    setIsFavoriteUi(next);
    setLocalFavoriteCount((v) => (next ? v + 1 : v - 1));

    // 2) 전역 store 반영
    if (next) addFavorite(popup.id);
    else removeFavorite(popup.id);

    try {
      // 3) 서버 반영
      if (next) {
        await addToWishlist(popup.id);
        addToast({ title: '관심 팝업에 추가되었습니다.' });
      } else {
        await removeFromWishlist(popup.id);
        addToast({ title: '관심 팝업에서 제거되었습니다.' });
      }

      // 4) 백그라운드 동기화
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });

    } catch (err) {
      console.error('wishlist error', err);

      // ❗ UI + store 롤백
      setIsFavoriteUi(prev);
      setLocalFavoriteCount((v) => (prev ? v + 1 : v - 1));

      if (prev) addFavorite(popup.id);
      else removeFavorite(popup.id);

      addToast({
        title: '관심 처리 실패',
        description: err.message || '다시 시도해주세요.',
        variant: 'error',
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleReviewWrite = async () => {
    if (!popup?.id) return;
    if (!isAuthenticated) {
      const shouldLogin = await openLoginPrompt({
        description: '후기 작성은 로그인 후 이용 가능합니다.\n로그인하시겠습니까?',
      });
      if (shouldLogin) navigate(ROUTES.login);
      return;
    }
    if (role && role !== 'CONSUMER') {
      addToast({
        title: '후기 작성은 소비자 계정에서만 이용 가능합니다.',
        variant: 'error',
      });
      return;
    }
    navigate(ROUTES.reviewWrite(popup.id));
  };

  // ⛔ 로딩/에러 처리
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!popup) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">팝업을 찾을 수 없습니다.</p>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  // 이미지 처리
  const gallery = getImageUrls(popup.gallery || popup.imageUrls || []);
  const mainImage =
    gallery[0] || getImageUrl(popup.thumbnail || popup.thumbnailImageUrl, '/placeholder-popup.png');

  const statusLabel = popup.runtimeStatus ? runtimeStatusLabel[popup.runtimeStatus] : null;
  const viewCount = popup.viewCount ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-[800px] mx-auto bg-white pt-16 md:pt-24 pb-20">
        {/* 큰 이미지 */}
        <div className="w-full">
          <img
            src={mainImage}
            alt={popup.title}
            className="w-full h-auto max-h-[400px] object-contain bg-gray-100"
            onError={(e) => (e.target.src = '/placeholder-popup.png')}
          />
        </div>

        {/* 상단 액션 바 */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {/* 수정 버튼 (ADMIN 또는 SELLER 본인) */}
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center justify-center p-1.5 bg-white/90 rounded-full border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
                aria-label="팝업 수정"
                title="팝업 수정"
              >
                <Pencil className="h-4 w-4 text-gray-600" />
              </button>
            )}

            {/* 관심 버튼 (EventCard 스타일과 동일, 숫자 제거) */}
            <button
              type="button"
              onClick={handleFavoriteToggle}
              disabled={isFavoriteLoading}
              className="inline-flex items-center justify-center p-1.5 bg-white/90 rounded-full border border-gray-200 shadow-md hover:bg-white transition-colors disabled:opacity-60"
              aria-label="관심 팝업"
            >
              <Heart
                className="h-4 w-4"
                fill={isFavoriteUi ? '#eb0000' : 'none'}
                color={isFavoriteUi ? '#eb0000' : '#414141'}
              />
            </button>

            {/* 조회수 */}
            <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700">
              <Eye className="w-4 h-4 text-gray-500" />
              <span>{viewCount}</span>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="px-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1">
            {[
              { key: 'description', label: '설명' },
              { key: 'map', label: '지도' },
              { key: 'reviews', label: '후기' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                    isActive ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="px-4 pb-6">
          {activeTab === 'description' && <DescriptionTab popup={popup} statusLabel={statusLabel} />}
          {activeTab === 'map' && <MapTab popup={popup} />}
          {activeTab === 'reviews' && (
            <ReviewTab popup={popup} reviews={reviews} onWriteClick={handleReviewWrite} />
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />

      {/* 팝업 수정 모달 */}
      {isEditModalOpen && (
        <PopupEditModal
          popupId={popup.id}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['popup', id] });
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PopupDetailPage;
