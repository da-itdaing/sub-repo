import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from './paths';
import ProtectedRoute from './ProtectedRoute';

// Pages (lazy loading)
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupStep1 from '@/pages/SignupStep1';
import SignupStep2 from '@/pages/SignupStep2';
import PopupDetailPage from '@/pages/PopupDetailPage';
import NearbyExplorePage from '@/pages/NearbyExplorePage';
import SearchPage from '@/pages/SearchPage';
import MyPage from '@/pages/MyPage';
import MyFavoritesPage from '@/pages/MyFavoritesPage';
import MyReviewsPage from '@/pages/MyReviewsPage';
import MySettingsPage from '@/pages/MySettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ReviewWritePage from '@/pages/ReviewWritePage';
import ChatbotPage from '@/pages/ChatbotPage';
import SellerInfoPage from '@/pages/SellerInfoPage';

// Seller Pages
import SellerDashboardPage from '@/pages/seller/SellerDashboardPage';
import SellerPopupsPage from '@/pages/seller/SellerPopupsPage';
import SellerProfilePage from '@/pages/seller/SellerProfilePage';
import SellerPopupCreatePage, { SellerPopupEditPage } from '@/pages/seller/SellerPopupCreatePage';
import SellerPopupDetailPage from '@/pages/seller/SellerPopupDetailPage';
import SellerReviewsPage from '@/pages/seller/SellerReviewsPage';
import SellerCalendarPage from '@/pages/seller/SellerCalendarPage';
import SellerLayout from '@/layouts/seller/SellerLayout';

// Admin
import AdminLayout from '@/layouts/admin/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminUserProfilePage from '@/pages/admin/AdminUserProfilePage';
import AdminZonesPage from '@/pages/admin/AdminZonesPage';
import AdminZoneCreatePage from '@/pages/admin/AdminZoneCreatePage';
import AdminApprovalsPage from '@/pages/admin/AdminApprovalsPage';

const SELLER_ROUTE_SEGMENTS = {
  dashboard: 'dashboard',
  popups: 'popups',
  profile: 'profile',
  popupCreate: 'popups/create',
  popupDetail: 'popups/:popupId',
  popupEdit: 'popups/:popupId/edit',
  calendar: 'calendar',
  reviews: 'reviews',
};

const ADMIN_ROUTE_SEGMENTS = {
  dashboard: 'dashboard',
  users: 'users',
  userDetail: 'users/:id',
  zones: 'zones',
  zoneCreate: 'zones/create',
  approvals: 'approvals',
};

/**
 * React Router 설정
 */
const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <HomePage />,
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.signupStep1,
    element: <SignupStep1 />,
  },
  {
    path: ROUTES.signupStep2,
    element: <SignupStep2 />,
  },
  {
    path: ROUTES.popupDetailPattern,
    element: <PopupDetailPage />,
  },
  {
    path: ROUTES.reviewWritePattern,
    element: (
      <ProtectedRoute>
        <ReviewWritePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.nearby,
    element: <NearbyExplorePage />,
  },
  {
    path: ROUTES.search,
    element: <SearchPage />,
  },
  {
    path: ROUTES.chatbot,
    element: <ChatbotPage />,
  },
  {
    path: ROUTES.mypage,
    element: <MyPage />,
  },
  {
    path: ROUTES.mypageFavorites,
    element: (
      <ProtectedRoute>
        <MyFavoritesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.mypageReviews,
    element: (
      <ProtectedRoute>
        <MyReviewsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.mypageSettings,
    element: (
      <ProtectedRoute>
        <MySettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.sellerInfo(':sellerId'),
    element: <SellerInfoPage />,
  },
  {
    path: ROUTES.seller.root,
    element: (
      <ProtectedRoute requiredRoles={['SELLER']} forbiddenPath={ROUTES.home}>
        <SellerLayout />
      </ProtectedRoute>
    ),
    children: [
  {
        index: true,
        element: <Navigate to={ROUTES.seller.dashboard} replace />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.dashboard,
        element: <SellerDashboardPage />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.popups,
        element: <SellerPopupsPage />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.calendar,
        element: <SellerCalendarPage />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.reviews,
        element: <SellerReviewsPage />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.profile,
        element: <SellerProfilePage />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.popupCreate,
        element: <SellerPopupCreatePage />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.popupDetail,
        element: <SellerPopupDetailPage />,
      },
      {
        path: SELLER_ROUTE_SEGMENTS.popupEdit,
        element: <SellerPopupEditPage />,
      },
    ],
  },
  {
    path: ROUTES.admin.root,
    element: (
      <ProtectedRoute requiredRoles={['ADMIN']} forbiddenPath={ROUTES.home}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.admin.dashboard} replace />,
  },
  {
        path: ADMIN_ROUTE_SEGMENTS.dashboard,
        element: <AdminDashboardPage />,
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.users,
        element: <AdminUsersPage />,
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.userDetail,
        element: <AdminUserProfilePage />,
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.zones,
        element: <AdminZonesPage />,
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.zoneCreate,
        element: <AdminZoneCreatePage />,
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.approvals,
        element: <AdminApprovalsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

