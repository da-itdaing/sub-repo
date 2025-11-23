import { Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from './paths';

/**
 * 인증 + 역할 기반 보호 라우트
 */
const ProtectedRoute = ({
  children,
  requiredRoles = [],
  redirectTo = ROUTES.login,
  forbiddenPath = ROUTES.home,
}) => {
  const normalizedRoles = useMemo(() => {
    if (!requiredRoles || (Array.isArray(requiredRoles) && requiredRoles.length === 0)) {
      return [];
    }

    return Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  }, [requiredRoles]);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (normalizedRoles.length > 0) {
    const currentRole = user?.role ?? role;

    if (!currentRole) {
      return (
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          권한 정보를 확인하는 중입니다...
        </div>
      );
    }

    const hasPrivilege = normalizedRoles.includes(currentRole);
    if (!hasPrivilege) {
      return <Navigate to={forbiddenPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

