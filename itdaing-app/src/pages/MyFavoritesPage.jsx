import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { ROUTES } from '@/routes/paths';
import { getMyWishlist } from '@/services/wishlistService';
import EventCard from '@/components/popup/EventCard';
import { normalizePopup, isPopupActive, resolvePopupThumbnail } from '@/utils/popupUtils';

const MyFavoritesPage = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: () => getMyWishlist({ page: 0, size: 20 }),
  });

  const favorites = useMemo(() => {
    return (data?.content ?? [])
      .map((item) => {
        const target = item?.popup ?? item;
        const normalized = normalizePopup(target);
        if (!normalized?.id) return null;
        const thumbnail = resolvePopupThumbnail(normalized);
        return { ...normalized, thumbnail, isFavorite: true };
      })
      .filter((popup) => popup && isPopupActive(popup));
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12 md:pt-12">
          <div className="mb-6">
            <p className="text-sm text-gray-500">나의 관심 팝업 리스트</p>
            <h1 className="text-2xl font-bold">찜한 팝업</h1>
          </div>

          {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="aspect-3/4 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">
              위시리스트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}

          {!isLoading && !isError && favorites.length === 0 && (
          <div className="text-center bg-white rounded-2xl shadow-sm p-10 border border-gray-100">
              <p className="text-lg font-semibold mb-2">아직 찜한 팝업이 없어요</p>
              <p className="text-sm text-gray-500">
                마음에 드는 팝업을 발견하면 하트 아이콘을 눌러 보관해보세요.
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.home)}
              className="mt-6 inline-flex px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
              >
                인기 팝업 둘러보기
              </button>
            </div>
          )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {favorites.map((popup) => (
            <div key={popup.id} className="w-full">
              <EventCard popup={{ ...popup, isFavorite: true }} />
                </div>
            ))}
          </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MyFavoritesPage;
