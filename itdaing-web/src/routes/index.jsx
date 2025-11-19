import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layout 컴포넌트
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// 페이지 컴포넌트 (lazy loading)
const MainPage = lazy(() => import('../pages/MainPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage1 = lazy(() => import('../pages/SignupPage1'));
const SignupPage2 = lazy(() => import('../pages/SignupPage2'));
const PopupDetailPage = lazy(() => import('../pages/PopupDetailPage'));
const MyPage = lazy(() => import('../pages/MyPage'));
const NearbyExplorePage = lazy(() => import('../pages/NearbyExplorePage'));
const SellerDashboard = lazy(() => import('../pages/seller/Dashboard'));
const SellerPopupManagement = lazy(() => import('../pages/seller/PopupManagement'));
const SellerSchedule = lazy(() => import('../pages/seller/Schedule'));
const SellerMessages = lazy(() => import('../pages/seller/Messages'));
const SellerReviewManagement = lazy(() => import('../pages/seller/ReviewManagement'));
const SellerNotices = lazy(() => import('../pages/seller/Notices'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminZoneManagement = lazy(() => import('../pages/admin/ZoneManagement'));
const AdminApprovals = lazy(() => import('../pages/admin/Approvals'));
const AdminUserManagement = lazy(() => import('../pages/admin/UserManagement'));
const AdminMessages = lazy(() => import('../pages/admin/Messages'));
const AdminLogs = lazy(() => import('../pages/admin/Logs'));
const AdminNotices = lazy(() => import('../pages/admin/Notices'));

const SellerAppLayout = lazy(() => import('../components/layout/SellerAppLayout'));
const AdminAppLayout = lazy(() => import('../components/layout/AdminAppLayout'));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb0000] mx-auto mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);

// 라우터 생성
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MainPage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'signup',
        children: [
          {
            index: true,
            element: <Navigate to="/signup/1" replace />,
          },
          {
            path: '1',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SignupPage1 />
              </Suspense>
            ),
          },
          {
            path: '2',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <SignupPage2 />
              </Suspense>
            ),
          },
        ],
      },
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
          {
            index: true,
            element: <Navigate to="/seller/dashboard" replace />,
          },
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
        ],
      },
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
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
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
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

