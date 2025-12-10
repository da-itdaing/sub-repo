import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getMyProfile } from '@/services/authService';
import { ROUTES } from '@/routes/paths';

/**
 * 카카오 로그인 완료 페이지 (기존 사용자용)
 * /auth/kakao/complete?accessToken=xxx&refreshToken=xxx&role=CONSUMER&redirect=/
 */
const KakaoCompletePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: loginStore, setUser } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const processLogin = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const role = searchParams.get('role');
      const redirect = searchParams.get('redirect') || '/';

      if (!accessToken || !refreshToken) {
        setError('토큰 정보가 없습니다.');
        return;
      }

      try {
        // 로그인 상태 저장
        loginStore(null, accessToken, refreshToken, role);

        // 프로필 조회
        try {
          const userProfile = await getMyProfile();
          setUser(userProfile);
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
        }

        // 리다이렉트
        navigate(redirect, { replace: true });
      } catch (err) {
        console.error('Login process error:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    processLogin();
  }, [searchParams, navigate, loginStore, setUser]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">로그인 실패</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(ROUTES.login)}
            className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">로그인 완료 처리 중...</p>
      </div>
    </div>
  );
};

export default KakaoCompletePage;

