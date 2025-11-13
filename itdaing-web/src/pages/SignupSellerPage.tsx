/**
 * 판매자 회원가입 페이지
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { SignupPage1 } from '../components/auth/SignupPage1';
import { signupSeller } from '../services/authService';

export function SignupSellerPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async (data: any) => {
    setIsSubmitting(true);
    try {
      const requestData = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        loginId: data.username,
        name: data.name,
        nickname: data.nickname || '',
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
      alert('회원가입 중 오류가 발생했습니다.');
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

