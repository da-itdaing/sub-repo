import { useState, useEffect, Suspense, lazy } from "react";

// Core layout components
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { BottomNav } from "./components/common/BottomNav";

// Shared / feature components
import { HeroCarousel } from "./components/common/HeroCarousel";
import { HorizontalBanner } from "./components/common/HorizontalBanner";
import { EventSection } from "./components/common/EventSection";
import { SectionTitle } from "./components/common/SectionTitle";
import { LoginConfirmDialog } from "./components/auth/LoginConfirmDialog";

// Pages (lazy-loaded to improve initial bundle size)
const LoginPage = lazy(() => import("./components/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const SignupPage1 = lazy(() => import("./components/auth/SignupPage1").then(m => ({ default: m.SignupPage1 })));
const SignupPage2 = lazy(() => import("./components/auth/SignupPage2").then(m => ({ default: m.SignupPage2 })));
const PopupDetailPage = lazy(() => import("./components/common/PopupDetailPage").then(m => ({ default: m.PopupDetailPage })));
const MyPage = lazy(() => import("./components/consumer/MyPage").then(m => ({ default: m.MyPage })));
const NearbyExplorePage = lazy(() => import("./components/consumer/NearbyExplorePage").then(m => ({ default: m.NearbyExplorePage })));
const SellerDashboard = lazy(() => import("./components/seller/SellerDashboard").then(m => ({ default: m.SellerDashboard })));
const RecommendationModal = lazy(() => import("./components/consumer/RecommendationModal").then(m => ({ default: m.RecommendationModal })));

// Data
import { popups } from "./data/popups";

export default function App() {
  const [showAllOpening, setShowAllOpening] = useState(false);
  const [showAllLocal, setShowAllLocal] = useState(false);
  const [showAllCommunity, setShowAllCommunity] = useState(false);
  const [currentPage, setCurrentPage] = useState<"main" | "login" | "signup1" | "signup2" | "popupDetail" | "mypage" | "nearbyExplore" | "sellerDashboard">("main");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<"consumer" | "seller" | null>(null);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [signupData, setSignupData] = useState<any>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [dismissedToday, setDismissedToday] = useState(false);
  const [selectedPopupId, setSelectedPopupId] = useState<number | null>(null);
  const [showLoginConfirmDialog, setShowLoginConfirmDialog] = useState(false);
  const [loginConfirmDialogType, setLoginConfirmDialogType] = useState<"favorite" | "review" | "mypage">("favorite");
  const [returnToPage, setReturnToPage] = useState<"main" | "popupDetail" | "mypage" | "nearbyExplore" | "sellerDashboard">("main");
  const [returnToPopupId, setReturnToPopupId] = useState<number | null>(null);
  const [returnToAction, setReturnToAction] = useState<"review" | null>(null);

  // 이벤트 데이터를 카테고리별로 분류
  const eventItems = {
    opening: popups.filter(p => p.status === "upcoming").slice(0, 12).map(p => ({
      id: p.id,
      image: p.images[0],
      title: p.title,
      date: p.date,
      location: p.location,
    })),
    // Local should show all active popups, not only specific category
    local: popups.filter(p => p.status === "ongoing" || p.status === "upcoming").slice(0, 20).map(p => ({
      id: p.id,
      image: p.images[0],
      title: p.title,
      date: p.date,
      location: p.location,
    })),
    community: popups.slice(0, 12).map(p => ({
      id: p.id,
      image: p.images[0],
      title: p.title,
      date: p.date,
      location: p.location,
    })),
  };

  const handleLoginClick = () => {
    setCurrentPage("login");
  };

  const handleLoginSuccess = (loginUserType: "consumer" | "seller", loggedInSellerId?: number) => {
    setIsLoggedIn(true);
    setUserType(loginUserType);
    
    if (loginUserType === "seller") {
      if (loggedInSellerId) {
        setSellerId(loggedInSellerId);
      }
      setCurrentPage("sellerDashboard");
    } else {
      const pageToReturn = returnToPage;
      const popupIdToReturn = returnToPopupId;
      
      // Reset return states before navigation
      setReturnToPage("main");
      setReturnToPopupId(null);
      // Don't reset returnToAction yet - it will be used by PopupDetailPage
      
      // Return to the page user was on before login
      if (pageToReturn === "popupDetail" && popupIdToReturn) {
        setSelectedPopupId(popupIdToReturn);
        setCurrentPage("popupDetail");
        
        // returnToAction will be checked in the render to set showReviewWriteOnMount
        // It will be cleared after the page is rendered
        setTimeout(() => setReturnToAction(null), 100);
      } else {
        setCurrentPage(pageToReturn);
        setReturnToAction(null);
      }
      
      // Show recommendation modal after consumer login (only when returning to main)
      if (pageToReturn === "main" && !dismissedToday) {
        setShowRecommendationModal(true);
      }
    }
  };

  const handleSignupClick = () => {
    setCurrentPage("signup1");
  };

  const handleSignupNext = (data: any) => {
    setSignupData(data);
    if (data.userType === "consumer") {
      setCurrentPage("signup2");
    } else {
      // For seller, complete signup
      setIsLoggedIn(true);
      setCurrentPage("main");
    }
  };

  const handleSignupComplete = () => {
    setIsLoggedIn(true);
    setCurrentPage("main");
  };

  const handleClose = () => {
    setCurrentPage("main");
    // 최상단으로 스크롤 - setTimeout으로 상태 업데이트 후 실행
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const handleCloseRecommendationModal = () => {
    setShowRecommendationModal(false);
  };

  const handlePopupClick = (popupId: number) => {
    setSelectedPopupId(popupId);
    setCurrentPage("popupDetail");
    // 페이지 전환 시 최상단으로 스크롤
    window.scrollTo(0, 0);
  };

  const handleCardClick = (id: number) => {
    handlePopupClick(id);
  };

  const handleSellerClick = (sellerId: number) => {
    // 판매자 정보 페이지로 이동하는 로직
    setSelectedPopupId(sellerId); // 판매자의 팝업 중 하나를 찾아서 이동
    const sellerPopup = popups.find(p => p.sellerId === sellerId);
    if (sellerPopup) {
      setSelectedPopupId(sellerPopup.id);
      setCurrentPage("popupDetail");
      window.scrollTo(0, 0);
    }
  };

  const handleDismissToday = () => {
    setDismissedToday(true);
    setShowRecommendationModal(false);
    // Store in localStorage to persist across page reloads
    const today = new Date().toDateString();
    localStorage.setItem("recommendationDismissed", today);
  };

  const handleMyPageClick = () => {
    if (isLoggedIn) {
      setCurrentPage("mypage");
      // 페이지 전환 시 최상단으로 스크롤
      window.scrollTo(0, 0);
    } else {
      // 비로그인 시 로그인 확인 다이얼로그 표시
      setReturnToPage("mypage");
      setLoginConfirmDialogType("mypage");
      setShowLoginConfirmDialog(true);
    }
  };

  const handleNearbyExploreClick = () => {
    setCurrentPage("nearbyExplore");
    // 페이지 전환 시 최상단으로 스크롤
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    // Reset all states to initial values
    setIsLoggedIn(false);
    setUserType(null);
    setSellerId(null);
    setSignupData(null);
    setCurrentPage("main");
    // 최상단으로 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const handleResetRecommendation = () => {
    localStorage.removeItem("recommendationDismissed");
    setDismissedToday(false);
    if (isLoggedIn && userType === "consumer") {
      setShowRecommendationModal(true);
    }
  };

  // Check if user dismissed modal today
  useEffect(() => {
    const dismissedDate = localStorage.getItem("recommendationDismissed");
    const today = new Date().toDateString();
    if (dismissedDate === today) {
      setDismissedToday(true);
    }
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    // Multiple methods to ensure scroll works
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Also try after a small delay to ensure DOM is ready
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
  }, [currentPage, selectedPopupId]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {currentPage === "main" && (
        <>
          <Header 
            onLoginClick={handleLoginClick} 
            isLoggedIn={isLoggedIn} 
            onLogoDoubleClick={handleResetRecommendation}
            onLogoutClick={handleLogout}
            onLogoClick={handleClose}
            onMyPageClick={handleMyPageClick}
            onPopupClick={handlePopupClick}
            onSellerClick={handleSellerClick}
          />
          
          <main className="flex-1 w-full max-w-[1344px] mx-auto px-4 md:px-6 lg:px-8">
            <HeroCarousel onPopupClick={handlePopupClick} />
            
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
                    showViewAll={true}
                    onViewAllClick={() => setShowAllOpening(!showAllOpening)}
                  />
                }
                items={eventItems.opening}
                showAll={showAllOpening}
                onToggleShowAll={() => setShowAllOpening(!showAllOpening)}
                type="opening"
                onPopupClick={handlePopupClick}
                isLoggedIn={isLoggedIn}
                onLoginClick={() => {
                  setReturnToPage("main");
                  setLoginConfirmDialogType("favorite");
                  setShowLoginConfirmDialog(true);
                }}
              />
              
              <EventSection
                title={
                  <SectionTitle 
                    title={
                      <>
                        <span className="text-[#eb0000]">울 동네</span>에 이런 팝업 있다잉!
                      </>
                    }
                    showViewAll={true}
                    onViewAllClick={() => setShowAllLocal(!showAllLocal)}
                  />
                }
                items={eventItems.local}
                showAll={showAllLocal}
                onToggleShowAll={() => setShowAllLocal(!showAllLocal)}
                type="local"
                onPopupClick={handlePopupClick}
                isLoggedIn={isLoggedIn}
                onLoginClick={() => {
                  setReturnToPage("main");
                  setLoginConfirmDialogType("favorite");
                  setShowLoginConfirmDialog(true);
                }}
              />
              
              <EventSection
                title={
                  <SectionTitle 
                    title={
                      <>
                        <span className="text-[#eb0000]">카테고리</span>별 팝업 있다잉!
                      </>
                    }
                    showViewAll={true}
                    onViewAllClick={() => setShowAllCommunity(!showAllCommunity)}
                  />
                }
                items={eventItems.community}
                showAll={showAllCommunity}
                onToggleShowAll={() => setShowAllCommunity(!showAllCommunity)}
                type="community"
                onPopupClick={handlePopupClick}
                isLoggedIn={isLoggedIn}
                onLoginClick={() => {
                  setReturnToPage("main");
                  setLoginConfirmDialogType("favorite");
                  setShowLoginConfirmDialog(true);
                }}
              />
            </div>
          </main>

          <Footer />
          
          <BottomNav 
            onMyPageClick={handleMyPageClick} 
            onMainClick={handleClose}
            onNearbyExploreClick={handleNearbyExploreClick}
          />
          
          {/* 위로가기 버튼 */}
          <button
            onClick={() => {
              // Multiple methods to ensure scroll works
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.scrollTo(0, 0);
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
              
              // Also try after a small delay
              setTimeout(() => {
                window.scrollTo({ top: 0 });
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
              }, 10);
            }}
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
        </>
      )}
      
      {currentPage === "login" && (
        <Suspense fallback={<div className="p-8 text-center">로딩 중…</div>}>
          <LoginPage 
            onClose={handleClose} 
            onSignupClick={handleSignupClick}
            onLoginSuccess={handleLoginSuccess}
          />
        </Suspense>
      )}
      
      {currentPage === "signup1" && (
        <Suspense fallback={<div className="p-8 text-center">로딩 중…</div>}>
          <SignupPage1 
            onNext={handleSignupNext} 
            onClose={() => setCurrentPage("login")} 
            onGoHome={handleClose}
            onLoginClick={() => setCurrentPage("login")}
          />
        </Suspense>
      )}
      
      {currentPage === "signup2" && signupData && (
        <Suspense fallback={<div className="p-8 text-center">로딩 중…</div>}>
          <SignupPage2 
            onComplete={handleSignupComplete}
            onClose={() => setCurrentPage("login")}
            userData={signupData}
            onGoHome={handleClose}
            onLoginClick={() => setCurrentPage("login")}
          />
        </Suspense>
      )}

      {currentPage === "popupDetail" && selectedPopupId && (
        <>
          <Header 
            onLoginClick={() => {
              setReturnToPage("popupDetail");
              setReturnToPopupId(selectedPopupId);
              handleLoginClick();
            }}
            isLoggedIn={isLoggedIn} 
            onLogoDoubleClick={handleResetRecommendation}
            onLogoutClick={handleLogout}
            onLogoClick={handleClose}
            onMyPageClick={handleMyPageClick}
            onPopupClick={handleCardClick}
            onSellerClick={handleSellerClick}
          />
          <Suspense fallback={<div className="p-8 text-center">상세 불러오는 중…</div>}>
            <PopupDetailPage 
              onClose={handleClose}
              popupId={selectedPopupId}
              onMyPageClick={handleMyPageClick}
              onNearbyExploreClick={handleNearbyExploreClick}
              isLoggedIn={isLoggedIn}
              onLoginClick={() => {
                setReturnToPage("popupDetail");
                setReturnToPopupId(selectedPopupId);
                setReturnToAction("review");
                handleLoginClick();
              }}
              onPopupClick={handlePopupClick}
              showReviewWriteOnMount={returnToAction === "review"}
            />
          </Suspense>
          <Footer />
          <BottomNav 
            onMyPageClick={handleMyPageClick} 
            onMainClick={handleClose}
            onNearbyExploreClick={handleNearbyExploreClick}
          />
        </>
      )}

      {currentPage === "mypage" && (
        <>
          <Header 
            onLoginClick={handleLoginClick} 
            isLoggedIn={isLoggedIn} 
            onLogoDoubleClick={handleResetRecommendation}
            onLogoutClick={handleLogout}
            onLogoClick={handleClose}
            onMyPageClick={handleMyPageClick}
            onPopupClick={handleCardClick}
            onSellerClick={handleSellerClick}
          />
          <Suspense fallback={<div className="p-8 text-center">마이페이지 로딩 중…</div>}>
            <MyPage 
              onClose={handleClose}
              onPopupClick={handlePopupClick}
            />
          </Suspense>
          <Footer />
          <BottomNav 
            onMyPageClick={handleMyPageClick} 
            onMainClick={handleClose}
            onNearbyExploreClick={handleNearbyExploreClick}
          />
        </>
      )}

      {currentPage === "nearbyExplore" && (
        <>
          {/* Header 고정 표시 (소비자 페이지) */}
          <Header 
            onLoginClick={handleLoginClick} 
            isLoggedIn={isLoggedIn} 
            onLogoDoubleClick={handleResetRecommendation}
            onLogoutClick={handleLogout}
            onLogoClick={handleClose}
            onMyPageClick={handleMyPageClick}
            onPopupClick={handleCardClick}
            onSellerClick={handleSellerClick}
          />
          <Suspense fallback={<div className="p-8 text-center">지도를 불러오는 중…</div>}>
            <NearbyExplorePage 
              onMainClick={handleClose}
              onMyPageClick={handleMyPageClick}
              isLoggedIn={isLoggedIn}
              onLoginClick={() => {
                setReturnToPage("nearbyExplore");
                handleLoginClick();
              }}
              onLogoutClick={handleLogout}
              onPopupClick={handlePopupClick}
            />
          </Suspense>
          <Footer />
          <BottomNav 
            onMyPageClick={handleMyPageClick} 
            onMainClick={handleClose}
            onNearbyExploreClick={handleNearbyExploreClick}
          />
        </>
      )}

      {currentPage === "sellerDashboard" && sellerId && (
        <Suspense fallback={<div className="p-8 text-center">대시보드 로딩 중…</div>}>
          <SellerDashboard 
            onClose={handleClose}
            sellerId={sellerId}
            onLogout={handleLogout}
          />
        </Suspense>
      )}

      {/* Recommendation Modal */}
      {isLoggedIn && showRecommendationModal && (
        <Suspense fallback={null}>
          <RecommendationModal 
            onClose={handleCloseRecommendationModal}
            onDismissToday={handleDismissToday}
            onPopupClick={handlePopupClick}
          />
        </Suspense>
      )}

      {/* Login Confirm Dialog */}
      <LoginConfirmDialog 
        isOpen={showLoginConfirmDialog}
        onClose={() => setShowLoginConfirmDialog(false)}
        onConfirm={() => {
          setShowLoginConfirmDialog(false);
          handleLoginClick();
        }}
        type={loginConfirmDialogType}
      />
    </div>
  );
}