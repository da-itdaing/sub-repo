import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { kakaoLogin, getMyProfile } from '@/services/authService';
import { ROUTES } from '@/routes/paths';

/**
 * 카카오 OAuth 콜백 페이지
 * /auth/kakao/callback?code=xxx&state=consumer|seller
 */
const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: loginStore, setUser } = useAuthStore();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processKakaoLogin = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state') || 'consumer';
      const errorParam = searchParams.get('error');

      // 카카오 에러 처리
      if (errorParam) {
        setError('카카오 로그인이 취소되었습니다.');
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError('인가 코드가 없습니다.');
        setIsProcessing(false);
        return;
      }

      try {
        // 백엔드로 인가 코드 전송
        const response = await kakaoLogin(code, state);

        // 백엔드 응답: newUser (not isNewUser)
        if (response.newUser) {
          // 신규 사용자: 추가 정보 입력 페이지로 이동
          // tempToken과 기본 정보를 localStorage에 저장
          localStorage.setItem('kakaoTempData', JSON.stringify({
            tempToken: response.tempToken,
            email: response.email,
            nickname: response.nickname,
            profileImageUrl: response.profileImageUrl,
            role: response.role,
          }));

          // 역할에 따라 다른 페이지로 이동
          if (state === 'seller') {
            navigate('/signup/kakao/seller', { replace: true });
          } else {
            navigate('/signup/kakao/consumer', { replace: true });
          }
        } else {
          // 기존 사용자: 로그인 처리
          loginStore(null, response.accessToken, response.refreshToken, response.role);

          try {
            const userProfile = await getMyProfile();
            setUser(userProfile);
          } catch (profileError) {
            console.error('Failed to fetch profile:', profileError);
          }

          // 역할에 따라 다른 페이지로 이동
          const nextPath =
            response.role === 'SELLER'
              ? ROUTES.seller.dashboard
              : response.role === 'ADMIN'
              ? ROUTES.admin.dashboard
              : ROUTES.home;

          navigate(nextPath, { replace: true });
        }
      } catch (err) {
        console.error('Kakao login error:', err);
        const errorMessage = err?.response?.data?.error?.message || err?.message || '카카오 로그인에 실패했습니다.';
        setError(errorMessage);
        setIsProcessing(false);
      }
    };

    processKakaoLogin();
  }, [searchParams, navigate, loginStore, setUser]);

  // 에러 발생 시
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

  // 처리 중
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default KakaoCallbackPage;

