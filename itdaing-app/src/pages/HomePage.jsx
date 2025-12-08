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
import { filterByWhitelist, getCarouselPopups, shuffleArray, SHUFFLE_HOME_LIST } from '@/config/homePopupConfig';

const HomePage = () => {
  const navigate = useNavigate();
  // 팝업 목록 조회
  const { data: popups = [], isLoading, error } = usePopups();
  const { regions: masterRegions, categories: masterCategories } = useMasterData();

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
    // 화이트리스트 필터 적용 (설정 파일에서 WHITELIST_ENABLED가 true일 때만 동작)
    const filteredPopups = filterByWhitelist(popups ?? []);
    
    return filteredPopups.map((popup) => {
      const normalized = normalizePopup(popup);
      
      // 구역 결정: 백엔드에서 제공하는 regionName 우선 사용
      // regionName이 없으면 address/locationName에서 추출 (폴백)
      let primaryRegion = '기타';
      if (normalized.regionName && gwangjuRegions.includes(normalized.regionName)) {
        // 백엔드에서 제공하는 regionName이 광주 5개구에 포함되면 사용
        primaryRegion = normalized.regionName;
      } else {
        // 폴백: address + locationName에서 구 이름 추출
        const address = `${normalized.address || ''} ${normalized.locationName || ''}`.trim();
        if (address) {
          const foundRegion = gwangjuRegions.find((region) => address.includes(region));
          if (foundRegion) {
            primaryRegion = foundRegion;
          }
        }
      }
      
      // 카테고리 결정: categoryIds를 사용해서 카테고리 이름 찾기
      // categoryIds[0]을 사용해 마스터 데이터에서 카테고리 이름 조회
      let categoryTag = '전체';
      if (normalized.categoryIds?.length > 0 && masterCategories.length > 0) {
        const categoryId = normalized.categoryIds[0];
        const foundCategory = masterCategories.find(c => c.id === categoryId);
        if (foundCategory) {
          categoryTag = foundCategory.name;
        }
      } else if (normalized.category?.name) {
        categoryTag = normalized.category.name;
      } else if (normalized.category) {
        categoryTag = normalized.category;
      } else if (normalized.categoryTag) {
        categoryTag = normalized.categoryTag;
      } else if (normalized.homeDisplay?.categoryTag) {
        categoryTag = normalized.homeDisplay.categoryTag;
      }
      return {
        ...normalized,
        primaryRegion,
        categoryTag,
      };
    });
  }, [gwangjuRegions, popups, masterCategories]);

  const heroItems = useMemo(() => {
    // 캐러셀 설정에서 지정된 팝업이 있으면 해당 팝업 사용
    const carouselPopups = getCarouselPopups(normalizedPopups);
    if (carouselPopups.length > 0) {
      return carouselPopups;
    }
    // 폴백: 활성 팝업 또는 전체 팝업 상위 7개
    const activePopups = normalizedPopups.filter(isPopupActive);
    if (activePopups.length > 0) {
      return activePopups.slice(0, 7);
    }
    return normalizedPopups.slice(0, 7);
  }, [normalizedPopups]);

  const openingSoonPopups = useMemo(() => {
    const filtered = normalizedPopups.filter((popup) => popup.runtimeStatus === 'upcoming');
    return filtered.length > 0 ? filtered : [];
  }, [normalizedPopups]);

  const localPopups = useMemo(() => {
    const filtered = normalizedPopups.filter(
      (popup) => isPopupActive(popup) && gwangjuRegions.includes(popup.primaryRegion)
    );
    // 랜덤 셔플 적용 (설정에서 활성화된 경우)
    return filtered.length > 0 ? (SHUFFLE_HOME_LIST ? shuffleArray(filtered) : filtered) : [];
  }, [gwangjuRegions, normalizedPopups]);

  const categoryPopups = useMemo(() => {
    const filtered = normalizedPopups.filter(
      (popup) => isPopupActive(popup) && popup.categoryTag && popup.categoryTag !== '전체'
    );
    // 랜덤 셔플 적용 (설정에서 활성화된 경우)
    return filtered.length > 0 ? (SHUFFLE_HOME_LIST ? shuffleArray(filtered) : filtered) : [];
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
      
      <main className="flex-1 w-full max-w-[540px] md:max-w-[1200px] mx-auto bg-white pt-14 md:pt-20 ">
        {/* Hero Carousel - 헤더 바로 아래 배치 */}
        <div className="px-5 md:px-8 pt-2">
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
                  곧 오픈한다잉! <span className="text-primary">12월</span>
                </>
              }
              popups={openingSoonPopups}
              // description="이번 달에 문을 여는 팝업을 미리 확인하세요."
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

