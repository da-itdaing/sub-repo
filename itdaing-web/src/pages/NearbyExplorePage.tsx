import { useNavigate } from 'react-router-dom';
import { NearbyExplorePage as NearbyExplorePageComponent } from '../components/consumer/NearbyExplorePage';
import { useAuth } from '../context/AuthContext';

export default function NearbyExplorePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <NearbyExplorePageComponent
      onMainClick={() => navigate('/')}
      onMyPageClick={() => navigate('/mypage')}
      isLoggedIn={isAuthenticated}
      onLoginClick={() => navigate('/login', { state: { from: { pathname: '/nearby' } } })}
      onLogoutClick={logout}
      onPopupClick={(id) => navigate(`/popup/${id}`)}
    />
  );
}

