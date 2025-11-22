import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Public Layout
import Layout from '../components/layout/Layout.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';

// Seller / Admin Layout
const SellerAppLayout = lazy(() => import('../components/layout/SellerAppLayout.jsx'));
const AdminAppLayout = lazy(() => import('../components/layout/AdminAppLayout.jsx'));

// Consumer Pages
const MainPage = lazy(() => import('../pages/consumer/MainPage.jsx'));
const MyPage = lazy(() => import('../pages/consumer/MyPage.jsx'));
const NearbyExplorePage = lazy(() => import('../pages/consumer/NearbyExplorePage.jsx'));
const PopupDetailPage = lazy(() => import('../pages/consumer/PopupDetailPage.jsx'));

// Login / Signup
const LoginPage = lazy(() => import('../pages/Login/LoginPage.jsx'));
const SignupPage1 = lazy(() => import('../pages/Login/SignupPage1.jsx'));
const SignupPage2 = lazy(() => import('../pages/Login/SignupPage2.jsx'));
const SignupConsumerPage = lazy(() => import('../pages/Login/SignupConsumerPage.jsx'));
const SignupSellerPage = lazy(() => import('../pages/Login/SignupSellerPage.jsx'));

// Seller Pages
const SellerDashboard = lazy(() => import('../pages/seller/SellerDashboard.jsx'));
const SellerPopupManagement = lazy(() => import('../pages/seller/PopupManagement.jsx'));
const SellerPopupCreatePage = lazy(() => import('../pages/seller/PopupCreatePage.jsx'));
const LocationSelectPage = lazy(() => import('../pages/seller/LocationSelectPage.jsx'));
const SellerSchedule = lazy(() => import('../pages/seller/Schedule.jsx'));
const SellerMessages = lazy(() => import('../pages/seller/Messages.jsx'));
const SellerReviewManagement = lazy(() => import('../pages/seller/ReviewManagement.jsx'));
const SellerNotices = lazy(() => import('../pages/seller/Notices.jsx'));
const SellerInfoPage = lazy(() => import('../pages/seller/SellerInfoPage.jsx'));
const SellerProfileEdit = lazy(() => import('../pages/seller/SellerProfileEdit.jsx'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminZoneManagement = lazy(() => import('../pages/admin/ZoneManagement.jsx'));
const AdminApprovals = lazy(() => import('../pages/admin/Approvals.jsx'));
const AdminUserManagement = lazy(() => import('../pages/admin/UserManagement.jsx'));
const AdminMessages = lazy(() => import('../pages/admin/Messages.jsx'));
const AdminLogs = lazy(() => import('../pages/admin/Logs.jsx'));
const AdminNotices = lazy(() => import('../pages/admin/Notices.jsx'));

// Loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb0000]" />
  </div>
);

export const router = createBrowserRouter([
  // Public / Consumer routes
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'login', element: <LoginPage /> },

      { path: 'signup/1', element: <SignupPage1 /> },
      { path: 'signup/2', element: <SignupPage2 /> },
      { path: 'signup/consumer', element: <SignupConsumerPage /> },
      { path: 'signup/seller', element: <SignupSellerPage /> },

      { path: 'popup/:id', element: <PopupDetailPage /> },
      { path: 'nearby', element: <NearbyExplorePage /> },
      {
        path: 'mypage',
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Seller routes (⭐ Layout 밖으로 분리됨)
  {
    path: '/seller',
    element: (
      <ProtectedRoute requiredRole="SELLER">
        <SellerAppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/seller/dashboard" replace /> },
      { path: 'dashboard', element: <SellerDashboard /> },
      { path: 'popups', element: <SellerPopupManagement /> },
      { path: 'popup/create', element: <SellerPopupCreatePage /> },
      { path: 'location', element: <LocationSelectPage /> },
      { path: 'schedule', element: <SellerSchedule /> },
      { path: 'messages', element: <SellerMessages /> },
      { path: 'reviews', element: <SellerReviewManagement /> },
      { path: 'notices', element: <SellerNotices /> },
      { path: 'info', element: <SellerInfoPage /> },
      { path: 'profile', element: <SellerProfileEdit /> },
    ],
  },

  // Admin routes (Layout 밖)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminAppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'zones', element: <AdminZoneManagement /> },
      { path: 'approvals', element: <AdminApprovals /> },
      { path: 'users', element: <AdminUserManagement /> },
      { path: 'messages', element: <AdminMessages /> },
      { path: 'logs', element: <AdminLogs /> },
      { path: 'notices', element: <AdminNotices /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
