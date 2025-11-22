/**
 * 라우트 경로 상수
 */
export const ROUTES = {
  // Consumer 앱
  home: '/',
  login: '/login',
  signupStep1: '/signup/step1',
  signupStep2: '/signup/step2',
  
  // 팝업 상세
  popupDetail: (id) => `/popup/${id}`,
  popupDetailPattern: '/popup/:id',
  
  // 탐색
  nearby: '/nearby',
  search: '/search',
  
  // 마이페이지
  mypage: '/mypage',
  mypageFavorites: '/mypage/favorites',
  mypageReviews: '/mypage/reviews',
  mypageSettings: '/mypage/settings',
  
  // Seller 대시보드 (추후 구현)
  seller: {
    dashboard: '/seller/dashboard',
    profile: '/seller/profile',
    popups: '/seller/popups',
    popupCreate: '/seller/popups/create',
    popupEdit: (id) => `/seller/popups/${id}/edit`,
  },
};

