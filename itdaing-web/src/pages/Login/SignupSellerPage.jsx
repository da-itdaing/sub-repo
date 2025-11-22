/**
 * 판매자 회원가입 페이지
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { SignupPage1 } from '../../components/auth/SignupPage1.jsx';
import { signupSeller } from '../../services/authService.js';

export function SignupSellerPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async data => {
    setIsSubmitting(true);
    try {
      const requestData = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        loginId: data.username,
        name: data.name,
        nickname: data.nickname || '',
        activityRegion: data.activityRegion || '',
        snsUrl: data.snsUrl || '',
        introduction: data.introduction || '',
        profileImage: data.profileImage || null,
      };

      const response = await signupSeller(requestData);
      
      if (response.success) {
        navigate('/login', { 
          state: { 
            message: '회원가입이 완료되었습니다. 로그인해주세요.',
            userType: 'seller'
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
      <Suspense fallback={<div className="p-8 text-center">로딩 중…</div>}>
        <SignupPage1
          onNext={handleNext}
          onClose={() => navigate('/login')}
          onGoHome={() => navigate('/')}
          onLoginClick={() => navigate('/login')}
        />
      </Suspense>
    </div>
  );
}

