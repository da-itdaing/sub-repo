/**
 * 소비자 회원가입 페이지
 */
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { SignupPage1 } from '../components/auth/SignupPage1';
import { SignupPage2 } from '../components/auth/SignupPage2';
import { useState } from 'react';
import { signupConsumer } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export function SignupConsumerPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (data: any) => {
    setSignupData(data);
    setStep(2);
  };

  const handleComplete = async (preferences: any) => {
    if (!signupData) return;

    setIsSubmitting(true);
    try {
      // TODO: preferences 데이터를 백엔드 형식에 맞게 변환
      const requestData = {
        email: signupData.email,
        password: signupData.password,
        passwordConfirm: signupData.passwordConfirm,
        loginId: signupData.username,
        name: signupData.name,
        nickname: signupData.nickname,
        ageGroup: parseInt(signupData.ageGroup) || 20,
        interestCategoryIds: preferences.selectedInterests?.map((i: string) => parseInt(i)) || [],
        styleIds: preferences.selectedActivities?.map((a: string) => parseInt(a)) || [],
        regionIds: preferences.selectedPopups?.map((r: string) => parseInt(r)) || [],
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
            onClose={() => navigate('/login')}
            userData={signupData}
            onGoHome={() => navigate('/')}
            onLoginClick={() => navigate('/login')}
          />
        </Suspense>
      )}
    </div>
  );
}

