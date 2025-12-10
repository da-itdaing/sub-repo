import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { completeKakaoSeller, getMyProfile } from '@/services/authService';
import { ROUTES } from '@/routes/paths';

/**
 * 카카오 판매자 회원가입 완료 페이지
 * 추가 정보 입력: 활동 지역, SNS URL, 소개
 */
const KakaoSignupSellerPage = () => {
  const navigate = useNavigate();
  const { login: loginStore, setUser } = useAuthStore();

  const [tempData, setTempData] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 데이터
  const [activityRegion, setActivityRegion] = useState('광주');
  const [snsUrl, setSnsUrl] = useState('');
  const [introduction, setIntroduction] = useState('');

  // localStorage에서 임시 데이터 로드
  useEffect(() => {
    const stored = localStorage.getItem('kakaoTempData');
    if (!stored) {
      navigate(ROUTES.login, { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'seller') {
        navigate('/signup/kakao/consumer', { replace: true });
        return;
      }
      setTempData(parsed);
    } catch (e) {
      navigate(ROUTES.login, { replace: true });
    }
  }, [navigate]);

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!activityRegion.trim()) {
      setError('활동 지역을 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await completeKakaoSeller({
        tempToken: tempData.tempToken,
        activityRegion: activityRegion.trim(),
        snsUrl: snsUrl.trim() || undefined,
        introduction: introduction.trim() || undefined,
      });

      // 로그인 처리
      loginStore(null, response.accessToken, response.refreshToken, response.role);

      try {
        const userProfile = await getMyProfile();
        setUser(userProfile);
      } catch (profileError) {
        console.error('Failed to fetch profile:', profileError);
      }

      // localStorage 정리
      localStorage.removeItem('kakaoTempData');

      // 판매자 대시보드로 이동
      navigate(ROUTES.seller.dashboard, { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err?.response?.data?.error?.message || err?.message || '회원가입에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tempData) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-[480px] mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">판매자 정보 입력</h1>
          <p className="text-gray-600 text-sm">
            {tempData.nickname || tempData.email}님, 환영합니다!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 활동 지역 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">활동 지역 *</label>
            <input
              type="text"
              value={activityRegion}
              onChange={(e) => setActivityRegion(e.target.value)}
              placeholder="예: 광주 동구"
              className="w-full h-[52px] rounded-[12px] bg-gray-50 border border-gray-200 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* SNS URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              SNS URL <span className="text-gray-400">(선택)</span>
            </label>
            <input
              type="url"
              value={snsUrl}
              onChange={(e) => setSnsUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full h-[52px] rounded-[12px] bg-gray-50 border border-gray-200 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 소개 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              소개 <span className="text-gray-400">(선택)</span>
            </label>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="간단한 자기소개를 입력해주세요"
              rows={3}
              className="w-full rounded-[12px] bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '가입 중...' : '가입 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KakaoSignupSellerPage;

