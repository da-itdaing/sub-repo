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
  reviewWrite: (id) => `/popup/${id}/reviews/write`,
  reviewWritePattern: '/popup/:id/reviews/write',
  
  // 탐색
  nearby: '/nearby',
  search: '/search',
  chatbot: '/chatbot',
  
  // 마이페이지
  mypage: '/mypage',
  mypageFavorites: '/mypage/favorites',
  mypageReviews: '/mypage/reviews',
  mypageSettings: '/mypage/settings',
  
  // Seller 대시보드 (추후 구현)
  seller: {
    root: '/seller',
    dashboard: '/seller/dashboard',
    profile: '/seller/profile',
    popups: '/seller/popups',
    calendar: '/seller/calendar',
    reviews: '/seller/reviews',
    popupCreate: '/seller/popups/create',
    popupEdit: (id) => `/seller/popups/${id}/edit`,
    notices: '/seller/notices',
    noticeCreate: '/seller/notices/create',
    noticeDetail: (id) => `/seller/notices/${id}`,
    noticeEdit: (id) => `/seller/notices/${id}/edit`,
  },

  // Admin 대시보드
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    zones: '/admin/zones',
    zoneCreate: '/admin/zones/create',
    approvals: '/admin/approvals',
  },
};

