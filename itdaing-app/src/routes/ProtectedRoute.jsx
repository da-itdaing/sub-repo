import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from './paths';

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // 로그인되지 않았으면 로그인 페이지로 리다이렉트
    return <Navigate to={ROUTES.login} replace />;
  }

  return children;
};

export default ProtectedRoute;

