import { useNavigate } from 'react-router-dom';
import { MyPage as MyPageComponent } from '../../components/consumer/MyPage.jsx';

export default function MyPage() {
  const navigate = useNavigate();

  return (
    <MyPageComponent
      onClose={() => navigate('/')}
      onPopupClick={(id) => navigate(`/popup/${id}`)}
    />
  );
}

