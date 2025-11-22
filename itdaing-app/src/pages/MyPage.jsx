import { useQuery } from '@tanstack/react-query';
import { User, Heart, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { getMyProfile } from '@/services/authService';
import { ROUTES } from '@/routes/paths';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // 프로필 조회
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
  });

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  const displayProfile = profile || user;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 w-full max-w-[800px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{displayProfile?.name || '사용자'}</h2>
              <p className="text-gray-600">{displayProfile?.email}</p>
              {displayProfile?.nickname && (
                <p className="text-sm text-gray-500">@{displayProfile.nickname}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <button
            onClick={() => navigate(ROUTES.mypageFavorites)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b"
          >
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-medium">찜한 팝업</span>
          </button>

          <button
            onClick={() => navigate(ROUTES.mypageReviews)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b"
          >
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="font-medium">내 리뷰</span>
          </button>

          <button
            onClick={() => navigate(ROUTES.mypageSettings)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b"
          >
            <Settings className="w-6 h-6 text-primary" />
            <span className="font-medium">설정</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-primary"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default MyPage;

