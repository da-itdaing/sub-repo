/**
 * 소비자 회원가입 페이지
 */
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { SignupPage1 } from '../../components/auth/SignupPage1';
import { SignupPage2 } from '../../components/auth/SignupPage2';
import { useState } from 'react';
import { signupConsumer } from '../../services/authService';

export function SignupConsumerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = data => {
    setSignupData(data);
    setStep(2);
  };

  const handleComplete = async preferences => {
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
        ageGroup: parseInt(signupData.ageGroup, 10) || 20,
        interestCategoryIds: preferences.selectedInterests?.map(i => parseInt(i, 10)) || [],
        styleIds: preferences.selectedActivities?.map(a => parseInt(a, 10)) || [],
        regionIds: preferences.selectedPopups?.map(r => parseInt(r, 10)) || [],
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
      // fieldErrors가 있으면 필드별 에러 메시지 표시
      if (error?.fieldErrors && Array.isArray(error.fieldErrors) && error.fieldErrors.length > 0) {
        const fieldErrorMessages = error.fieldErrors
          .map(fe => `${fe.field}: ${fe.reason}`)
          .join('\n');
        alert(`입력값 오류:\n${fieldErrorMessages}\n\n${error.message || '회원가입에 실패했습니다.'}`);
      } else {
        alert(error?.message || '회원가입 중 오류가 발생했습니다.');
      }
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

