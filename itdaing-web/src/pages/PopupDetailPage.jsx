import { useParams, useNavigate } from 'react-router-dom';
import { PopupDetailPage as PopupDetailPageComponent } from '../components/common/PopupDetailPage';
import { useAuth } from '../context/AuthContext';

export default function PopupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const popupId = id ? parseInt(id, 10) : 0;

  if (!popupId) {
    return <div className="flex items-center justify-center min-h-screen">팝업을 찾을 수 없습니다.</div>;
  }

  return (
    <PopupDetailPageComponent
      onClose={() => navigate('/')}
      popupId={popupId}
      onMyPageClick={() => navigate('/mypage')}
      onNearbyExploreClick={() => navigate('/nearby')}
      isLoggedIn={isAuthenticated}
      onLoginClick={() => navigate('/login', { state: { from: { pathname: `/popup/${popupId}` } } })}
      onPopupClick={(id) => navigate(`/popup/${id}`)}
    />
  );
}

