import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupPage1 as SignupPage1Component } from '../components/auth/SignupPage1';

export default function SignupPage1() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('consumer');
  const [formData, setFormData] = useState({
    loginId: '',
    name: '',
    ageGroup: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    email: '',
  });

  const handleNext = data => {
    setFormData(data);
    if (data.userType === 'consumer') {
      navigate('/signup/2', { state: { formData: data } });
    } else {
      // 판매자는 바로 완료 처리 (추가 정보 필요 시 수정)
      navigate('/signup/2', { state: { formData: data } });
    }
  };

  return (
    <SignupPage1Component
      onClose={() => navigate('/login')}
      onNext={handleNext}
      onGoHome={() => navigate('/')}
      onLoginClick={() => navigate('/login')}
    />
  );
}

