import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/routes/paths';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  User, 
  BarChart3, 
  Eye, 
  Heart,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

/**
 * SellerDashboardPage
 * 판매자 전용 대시보드 페이지
 */
const SellerDashboardPage = () => {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState('이번 주');

  // TODO: API에서 실제 데이터 가져오기
  const dashboardStats = {
    totalPopups: 5,
    activePopups: 2,
    pendingApproval: 1,
    totalViews: 490,
    totalFavorites: 87,
    weeklyViews: 185,
  };

  // TODO: API에서 실제 팝업 목록 가져오기
  const recentPopups = [
    {
      id: 1,
      title: '여울원 팝업 IN 광주',
      status: '진행 중',
      approvalStatus: '완료',
      startDate: '2025-10-31',
      endDate: '2025-11-13',
      views: 133,
      favorites: 28,
    },
    {
      id: 2,
      title: '충장 라온 페스타',
      status: '진행 중',
      approvalStatus: '완료',
      startDate: '2025-04-26',
      endDate: '2025-12-31',
      views: 199,
      favorites: 45,
    },
    {
      id: 3,
      title: '[중장년 남성] 집밥에 진심인 남자들',
      status: '오픈 예정',
      approvalStatus: '완료',
      startDate: '2025-11-05',
      endDate: '2025-12-10',
      views: 158,
      favorites: 14,
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      '진행 중': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      '오픈 예정': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      '종료': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      '대기': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    };

    const config = statusConfig[status] || statusConfig['대기'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const getApprovalBadge = (status) => {
    const statusConfig = {
      '완료': { bg: 'bg-green-500', text: 'text-white' },
      '대기': { bg: 'bg-yellow-500', text: 'text-white' },
      '반려': { bg: 'bg-red-500', text: 'text-white' },
    };

    const config = statusConfig[status] || statusConfig['대기'];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">판매자 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">
                안녕하세요, <span className="font-semibold">{user?.name || '판매자'}</span>님
              </p>
            </div>
            <Link
              to={ROUTES.seller.popupCreate}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              새 팝업 등록
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 전체 팝업 수 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 팝업</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardStats.totalPopups}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 진행 중인 팝업 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">진행 중</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardStats.activePopups}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* 승인 대기 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">승인 대기</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardStats.pendingApproval}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* 총 조회수 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 조회수</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardStats.totalViews}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 주간 통계 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">주간 통계</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>오늘</option>
              <option>이번 주</option>
              <option>이번 달</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">조회수</p>
                <p className="text-xl font-bold text-gray-900">{dashboardStats.weeklyViews}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">찜</p>
                <p className="text-xl font-bold text-gray-900">{dashboardStats.totalFavorites}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">평균 평점</p>
                <p className="text-xl font-bold text-gray-900">4.5</p>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 팝업 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">최근 팝업</h2>
              <Link
                to={ROUTES.seller.popups}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                전체 보기 →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    팝업명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    승인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    찜
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPopups.map((popup) => (
                  <tr key={popup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{popup.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(popup.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApprovalBadge(popup.approvalStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {popup.startDate} ~ {popup.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Eye className="w-4 h-4 mr-1 text-gray-400" />
                        {popup.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Heart className="w-4 h-4 mr-1 text-gray-400" />
                        {popup.favorites}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            to={ROUTES.seller.popupCreate}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <PlusCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">새 팝업 등록</h3>
                <p className="text-sm text-gray-600 mt-1">팝업스토어 정보 등록</p>
              </div>
            </div>
          </Link>

          <Link
            to={ROUTES.seller.popups}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">팝업 관리</h3>
                <p className="text-sm text-gray-600 mt-1">등록된 팝업 관리</p>
              </div>
            </div>
          </Link>

          <Link
            to={ROUTES.seller.profile}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">내 정보</h3>
                <p className="text-sm text-gray-600 mt-1">판매자 정보 관리</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;

