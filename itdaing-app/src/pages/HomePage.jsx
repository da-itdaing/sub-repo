import { useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import HeroCarousel from '@/components/common/HeroCarousel';
import HorizontalBanner from '@/components/consumer/HorizontalBanner';
import EventSection from '@/components/popup/EventSection';
import { usePopups } from '@/hooks/usePopups';
import { useMasterData } from '@/hooks/useMasterData';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { normalizePopup, isPopupActive } from '@/utils/popupUtils';

const HomePage = () => {
  const navigate = useNavigate();
  // 팝업 목록 조회
  const { data: popups = [], isLoading, error } = usePopups();
  const { regions: masterRegions } = useMasterData();

  const gwangjuRegions = useMemo(() => {
    const DISTRICTS = ['동구', '서구', '남구', '북구', '광산구'];
    const matched = masterRegions
      ?.filter((region) => DISTRICTS.includes(region.name))
      .map((region) => region.name);
    return matched?.length === DISTRICTS.length ? matched : DISTRICTS;
  }, [masterRegions]);

  // const scrollToTop = () => {
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // };

  const normalizedPopups = useMemo(() => {
    return (popups ?? []).map((popup) => {
      const normalized = normalizePopup(popup);
      const address = `${normalized.address || ''} ${normalized.locationName || ''}`.trim();
      let primaryRegion = gwangjuRegions.find((region) => address.includes(region)) || '기타';
      if (!address) {
        primaryRegion = '기타';
      }
      const categoryTag =
        normalized.styleTags?.[0] ||
        normalized.category ||
        normalized.categoryTag ||
        normalized.homeDisplay?.categoryTag ||
        '전체';
      return {
        ...normalized,
        primaryRegion,
        categoryTag,
      };
    });
  }, [gwangjuRegions, popups]);

  const heroItems = useMemo(() => normalizedPopups.slice(0, 7), [normalizedPopups]);

  const openingSoonPopups = useMemo(() => {
    const filtered = normalizedPopups.filter((popup) => popup.runtimeStatus === 'upcoming');
    return filtered.length > 0 ? filtered : [];
  }, [normalizedPopups]);

  const localPopups = useMemo(() => {
    const filtered = normalizedPopups.filter(
      (popup) => isPopupActive(popup) && gwangjuRegions.includes(popup.primaryRegion)
    );
    return filtered.length > 0 ? filtered : [];
  }, [gwangjuRegions, normalizedPopups]);

  const categoryPopups = useMemo(() => {
    const filtered = normalizedPopups.filter(
      (popup) => isPopupActive(popup) && popup.categoryTag && popup.categoryTag !== '전체'
    );
    return filtered.length > 0 ? filtered : [];
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
              customFilterOptions={['전체', ...gwangjuRegions]}
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

    </div>
  );
};

export default HomePage;

