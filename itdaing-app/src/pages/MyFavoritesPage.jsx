import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { ROUTES } from '@/routes/paths';
import { getMyWishlist } from '@/services/wishlistService';
import { formatDateRange } from '@/utils/dateHelpers';

const CARD_WIDTH = 'w-full max-w-[360px] mx-auto';

const MyFavoritesPage = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: () => getMyWishlist({ page: 0, size: 20 }),
  });

  const favorites = useMemo(() => data?.content ?? [], [data]);

  const handleCardClick = (popupId) => {
    navigate(ROUTES.popupDetail(popupId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-8">
        <section className="max-w-[420px] mx-auto">
          <div className="mb-6">
            <p className="text-sm text-gray-500">나의 관심 팝업 리스트</p>
            <h1 className="text-2xl font-bold">찜한 팝업</h1>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className={`bg-white rounded-2xl shadow-sm p-4 animate-pulse ${CARD_WIDTH}`}>
                  <div className="h-36 bg-gray-200 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">
              위시리스트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}

          {!isLoading && !isError && favorites.length === 0 && (
            <div className="text-center bg-white rounded-2xl shadow-sm p-10">
              <p className="text-lg font-semibold mb-2">아직 찜한 팝업이 없어요</p>
              <p className="text-sm text-gray-500">
                마음에 드는 팝업을 발견하면 하트 아이콘을 눌러 보관해보세요.
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.home)}
                className="mt-6 inline-flex px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold"
              >
                인기 팝업 둘러보기
              </button>
            </div>
          )}

          <div className="space-y-4">
            {favorites.map((popup) => (
              <button
                key={popup.id}
                type="button"
                onClick={() => handleCardClick(popup.id)}
                className={`text-left bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${CARD_WIDTH}`}
              >
                <div className="h-40 bg-gray-100 overflow-hidden">
                  {popup.thumbnail ? (
                    <img
                      src={popup.thumbnail}
                      alt={popup.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      이미지 준비중
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-500 gap-2">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                      {popup.locationName || '미정 위치'}
                    </span>
                    {popup.address && <span className="truncate">{popup.address}</span>}
                  </div>

                  <h2 className="text-lg font-semibold">{popup.name}</h2>

                  <p className="text-sm text-gray-600">
                    {formatDateRange(popup.startDate, popup.endDate)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>찜 {popup.favoriteCount ?? 0}</span>
                    <span>조회 {popup.viewCount ?? 0}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MyFavoritesPage;
