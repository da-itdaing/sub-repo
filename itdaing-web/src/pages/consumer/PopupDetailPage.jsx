import { useNavigate, useParams } from 'react-router-dom';
import PopupDetailPageContent from '../../components/common/PopupDetailPage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function PopupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const popupId = id ? Number.parseInt(id, 10) : 0;

  if (!popupId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-gray-600">
        팝업을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <PopupDetailPageContent
      popupId={popupId}
      isLoggedIn={isAuthenticated}
      onClose={() => navigate(-1)}
      onLoginClick={() => navigate('/login')}
      onMyPageClick={() => navigate('/mypage')}
      onNearbyExploreClick={() => navigate('/nearby')}
      onPopupClick={targetId => navigate(`/popup/${targetId}`)}
    />
  );
}

