/**
 * 소비자 회원가입 페이지
 */
import { useNavigate } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { SignupPage1 } from '../components/auth/SignupPage1';
import { SignupPage2 } from '../components/common/SignupPage2';
import { useState } from 'react';
import { signupConsumer } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { masterService } from '../services/masterService';

export function SignupConsumerPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    // 선호도 선택용 마스터 데이터 로드
    masterService.getCategories().then(setCategories).catch(() => setCategories([]));
    masterService.getStyles().then(setStyles).catch(() => setStyles([]));
    masterService.getFeatures().then(setFeatures).catch(() => setFeatures([]));
    masterService.getRegions().then(setRegions).catch(() => setRegions([]));
  }, []);

  const handleNext = (data: any) => {
    setSignupData(data);
    setStep(2);
  };

  const handleComplete = async (preferences: { interests?: string[]; activities?: string[]; popups?: string[] } = {}) => {
    if (!signupData) return;

    setIsSubmitting(true);
    try {
      // preferences 데이터를 백엔드 형식에 맞게 변환 (이름 → ID 매핑)
      const interestCategoryIds =
        (preferences.interests || [])
          .map((name) => categories.find((c) => c.name === name)?.id)
          .filter((id): id is number => typeof id === 'number') || [];
      const styleIds =
        (preferences.activities || [])
          .map((name) => styles.find((s) => s.name === name)?.id)
          .filter((id): id is number => typeof id === 'number') || [];
      const regionIds =
        (preferences.popups || [])
          .map((name) => regions.find((r) => r.name === name)?.id)
          .filter((id): id is number => typeof id === 'number') || [];

      const requestData = {
        email: signupData.email,
        password: signupData.password,
        passwordConfirm: signupData.passwordConfirm,
        loginId: signupData.username,
        name: signupData.name,
        nickname: signupData.nickname,
        ageGroup: parseInt(signupData.ageGroup) || 20,
        interestCategoryIds,
        styleIds,
        regionIds,
      };

      const response = await signupConsumer(requestData);
      
      if (response.success) {
        // 회원가입 성공 후 자동 로그인 (백엔드에서 토큰을 반환하지 않으면 로그인 페이지로 이동)
        navigate('/login', { 
          state: { 
            message: '회원가입이 완료되었습니다. 로그인해주세요.' 
          } 
        });
      } else {
        alert(response.error?.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {step === 1 ? (
        <Suspense fallback={<div className="p-8 text-center">로딩 중…</div>}>
          <SignupPage1
            onNext={handleNext}
            onClose={() => navigate('/login')}
            onGoHome={() => navigate('/')}
            onLoginClick={() => navigate('/login')}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="p-8 text-center">로딩 중…</div>}>
          <SignupPage2
            onComplete={handleComplete}
            onBackToLogin={() => setStep(1)}
            userData={signupData}
            onHomeClick={() => navigate('/')}
          />
        </Suspense>
      )}
    </div>
  );
}

