import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layout
import Layout from '../components/layout/Layout.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';

// Consumer pages
const MainPage = lazy(() => import('../pages/consumer/MainPage.jsx'));
const MyPage = lazy(() => import('../pages/consumer/MyPage.jsx'));
const NearbyExplorePage = lazy(() => import('../pages/consumer/NearbyExplorePage.jsx'));
const PopupDetailPage = lazy(() => import('../pages/consumer/PopupDetailPage.jsx'));

// Login pages
const LoginPage = lazy(() => import('../pages/Login/LoginPage.jsx'));
const SignupPage1 = lazy(() => import('../pages/Login/SignupPage1.jsx'));
const SignupPage2 = lazy(() => import('../pages/Login/SignupPage2.jsx'));
const SignupConsumerPage = lazy(() => import('../pages/Login/SignupConsumerPage.jsx'));
const SignupSellerPage = lazy(() => import('../pages/Login/SignupSellerPage.jsx'));

// Seller pages
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

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminZoneManagement = lazy(() => import('../pages/admin/ZoneManagement.jsx'));
const AdminApprovals = lazy(() => import('../pages/admin/Approvals.jsx'));
const AdminUserManagement = lazy(() => import('../pages/admin/UserManagement.jsx'));
const AdminMessages = lazy(() => import('../pages/admin/Messages.jsx'));
const AdminLogs = lazy(() => import('../pages/admin/Logs.jsx'));
const AdminNotices = lazy(() => import('../pages/admin/Notices.jsx'));

// Layout for seller/admin
const SellerAppLayout = lazy(() => import('../components/layout/SellerAppLayout.jsx'));
const AdminAppLayout = lazy(() => import('../components/layout/AdminAppLayout.jsx'));

// Loading UI
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb0000]"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Main
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MainPage />
          </Suspense>
        ),
      },

      // Login
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },

      // Signup
      {
        path: 'signup/consumer',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SignupConsumerPage />
          </Suspense>
        ),
      },
      {
        path: 'signup/seller',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SignupSellerPage />
          </Suspense>
        ),
      },
      {
        path: 'signup/1',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SignupPage1 />
          </Suspense>
        ),
      },
      {
        path: 'signup/2',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SignupPage2 />
          </Suspense>
        ),
      },

      // Consumer
      {
        path: 'popup/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PopupDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'mypage',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <MyPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'nearby',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NearbyExplorePage />
          </Suspense>
        ),
      },

      // Seller
      {
        path: 'seller',
        element: (
          <ProtectedRoute requiredRole="SELLER">
            <Suspense fallback={<LoadingFallback />}>
              <SellerAppLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/seller/dashboard" replace /> },

          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerDashboard />
              </Suspense>
            ),
          },
          {
            path: 'popups',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerPopupManagement />
              </Suspense>
            ),
          },
          {
            path: 'popup/create',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerPopupCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'location',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <LocationSelectPage />
              </Suspense>
            ),
          },
          {
            path: 'schedule',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerSchedule />
              </Suspense>
            ),
          },
          {
            path: 'messages',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerMessages />
              </Suspense>
            ),
          },
          {
            path: 'reviews',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerReviewManagement />
              </Suspense>
            ),
          },
          {
            path: 'notices',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerNotices />
              </Suspense>
            ),
          },
          {
            path: 'info',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerInfoPage />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SellerProfileEdit />
              </Suspense>
            ),
          },
        ],
      },

      // Admin
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <Suspense fallback={<LoadingFallback />}>
              <AdminAppLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },

          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: 'zones',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminZoneManagement />
              </Suspense>
            ),
          },
          {
            path: 'approvals',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminApprovals />
              </Suspense>
            ),
          },
          {
            path: 'users',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminUserManagement />
              </Suspense>
            ),
          },
          {
            path: 'messages',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminMessages />
              </Suspense>
            ),
          },
          {
            path: 'logs',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminLogs />
              </Suspense>
            ),
          },
          {
            path: 'notices',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminNotices />
              </Suspense>
            ),
          },
        ],
      },

      // Not found
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
