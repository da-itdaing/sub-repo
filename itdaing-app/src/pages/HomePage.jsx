import { useMemo } from 'react';
import { ArrowUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import HeroCarousel from '@/components/common/HeroCarousel';
import HorizontalBanner from '@/components/consumer/HorizontalBanner';
import EventSection from '@/components/popup/EventSection';
import { usePopups } from '@/hooks/usePopups';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const HomePage = () => {
  const navigate = useNavigate();
  // 팝업 목록 조회
  const { data: popups = [], isLoading, error } = usePopups();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const normalizedPopups = useMemo(() => {
    const now = new Date();
    return (popups ?? []).map((popup) => {
      const startDate = popup.startDate ? new Date(popup.startDate) : null;
      const endDate = popup.endDate ? new Date(popup.endDate) : null;
      let status = 'unknown';
      if (startDate && now < startDate) status = 'upcoming';
      else if (startDate && endDate && now >= startDate && now <= endDate) status = 'ongoing';
      else if (endDate && now > endDate) status = 'ended';

      // 지역 추출 로직 개선 (광주광역시의 경우 구 단위 추출)
      let primaryRegion = '전체';
      const address = popup.address || popup.locationName || '';
      
      if (address) {
        const parts = address.split(' ');
        // 광주광역시인 경우 두 번째 부분(구)을 추출
        if (parts[0] === '광주광역시' || parts[0] === '광주') {
          primaryRegion = parts[1] || parts[0];
        } else {
          // 다른 지역은 첫 번째 부분 사용
          primaryRegion = parts[0];
        }
      }

      const categoryTag = popup.styleTags?.[0] || popup.category || popup.homeDisplay?.categoryTag || '전체';

      return {
        ...popup,
        status,
        primaryRegion,
        categoryTag,
      };
    });
  }, [popups]);

  const heroItems = useMemo(() => normalizedPopups.slice(0, 7), [normalizedPopups]);

  const openingSoonPopups = useMemo(() => {
    const filtered = normalizedPopups.filter((popup) => popup.status === 'upcoming');
    return (filtered.length > 0 ? filtered : normalizedPopups).slice(0, 12);
  }, [normalizedPopups]);

  const localPopups = useMemo(() => {
    // 광주광역시 5개 구 팝업 필터링 (동구, 서구, 남구, 북구, 광산구)
    const gwangjuDistricts = ['동구', '서구', '남구', '북구', '광산구'];
    const filtered = normalizedPopups.filter((popup) => {
      const address = popup.address || popup.locationName || '';
      const region = popup.primaryRegion || '';
      // 광주광역시 또는 광주로 시작하는 주소 확인
      const isGwangju = address.includes('광주광역시') || address.includes('광주');
      // 5개 구 중 하나를 포함하는지 확인
      const hasDistrict = gwangjuDistricts.some((district) => 
        address.includes(district) || region === district
      );
      return isGwangju || hasDistrict;
    });
    return (filtered.length > 0 ? filtered : normalizedPopups).slice(0, 12);
  }, [normalizedPopups]);

  const categoryPopups = useMemo(() => {
    const filtered = normalizedPopups.filter((popup) => popup.categoryTag && popup.categoryTag !== '전체');
    return (filtered.length > 0 ? filtered : normalizedPopups).slice(0, 12);
  }, [normalizedPopups]);

  const handlePopupNavigate = (popupId) => {
    if (!popupId) return;
    navigate(ROUTES.popupDetail(popupId));
  };

  const handleEventBannerClick = () => {
    console.log('이벤트 배너 클릭');
  };

  // 데이터가 없을 때 에러 처리
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">팝업 정보를 불러오지 못했습니다.</p>
            <p className="text-sm text-gray-500 mt-2">백엔드 서버가 실행 중인지 확인해주세요.</p>
            <p className="text-xs text-gray-400 mt-1">({error.message})</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 w-full max-w-[540px] md:max-w-[1200px] mx-auto bg-white">
        {/* Hero Carousel */}
        <div className="px-5 md:px-8 pt-5">
          <HeroCarousel items={heroItems} isLoading={isLoading} onSelect={handlePopupNavigate} />
        </div>

        {/* Event Banner */}
        <div className="px-5 md:px-8 mt-6">
          <HorizontalBanner onClick={handleEventBannerClick} />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20 px-5 md:px-8">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">팝업 목록을 불러오는 중...</p>
          </div>
        ) : popups.length === 0 ? (
          <div className="text-center py-20 text-gray-500 px-5 md:px-8">
            <p className="text-lg">등록된 팝업이 없습니다.</p>
          </div>
        ) : (
          <div className="px-5 md:px-8 space-y-10 mt-8 mb-8">
            {/* Event Sections */}
            <EventSection
              title={
                <>
                  곧 오픈한다잉! <span className="text-primary">11월</span>
                </>
              }
              popups={openingSoonPopups}
              description="이번 달에 문을 여는 팝업을 미리 확인하세요."
            />

            <EventSection
              title={
                <>
                  <span className="text-primary">울 동네</span>에 이런 팝업 있다잉!
                </>
              }
              popups={localPopups}
              filterType="region"
            />

            <EventSection
              title={
                <>
                  <span className="text-primary">카테고리별</span> 팝업 있다잉!
                </>
              }
              popups={categoryPopups}
              filterType="category"
            />
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-16 md:bottom-24 w-10 h-10 md:w-14 md:h-14 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center z-40"
        style={{ 
          right: 'max(1rem, calc((100vw - min(540px, 100vw)) / 2 + 1rem))',
        }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 md:w-7 md:h-7 text-white" />
      </button>
      
      <style>{`
        @media (min-width: 768px) {
          button[aria-label="Scroll to top"] {
            right: max(2rem, calc((100vw - 1200px) / 2 + 2rem)) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;

