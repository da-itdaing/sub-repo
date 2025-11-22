import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './paths';
import ProtectedRoute from './ProtectedRoute';

// Pages (lazy loading)
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupStep1 from '@/pages/SignupStep1';
import SignupStep2 from '@/pages/SignupStep2';
import PopupDetailPage from '@/pages/PopupDetailPage';
import NearbyExplorePage from '@/pages/NearbyExplorePage';
import MyPage from '@/pages/MyPage';
import MyFavoritesPage from '@/pages/MyFavoritesPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Seller Pages
import SellerDashboardPage from '@/pages/seller/SellerDashboardPage';
import SellerPopupsPage from '@/pages/seller/SellerPopupsPage';
import SellerProfilePage from '@/pages/seller/SellerProfilePage';
import SellerPopupCreatePage from '@/pages/seller/SellerPopupCreatePage';

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
    path: ROUTES.nearby,
    element: <NearbyExplorePage />,
  },
  {
    path: ROUTES.mypage,
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.mypageFavorites,
    element: (
      <ProtectedRoute>
        <MyFavoritesPage />
      </ProtectedRoute>
    ),
  },
  // Seller Routes
  {
    path: ROUTES.seller.dashboard,
    element: (
      <ProtectedRoute>
        <SellerDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.seller.popups,
    element: (
      <ProtectedRoute>
        <SellerPopupsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.seller.profile,
    element: (
      <ProtectedRoute>
        <SellerProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.seller.popupCreate,
    element: (
      <ProtectedRoute>
        <SellerPopupCreatePage />
      </ProtectedRoute>
    ),
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

