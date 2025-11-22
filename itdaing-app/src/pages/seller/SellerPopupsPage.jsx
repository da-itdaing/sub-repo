import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Heart,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

/**
 * SellerPopupsPage
 * 판매자의 팝업 관리 페이지
 */
const SellerPopupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [approvalFilter, setApprovalFilter] = useState('전체');

  // TODO: API에서 실제 데이터 가져오기
  const popups = [
    {
      id: 1,
      title: '여울원 팝업 IN 광주',
      status: '진행 중',
      approvalStatus: '완료',
      startDate: '2025-10-31',
      endDate: '2025-11-13',
      location: '광주광역시 남구',
      views: 133,
      favorites: 28,
      reviews: 5,
      rating: 4.5,
    },
    {
      id: 2,
      title: '충장 라온 페스타',
      status: '진행 중',
      approvalStatus: '완료',
      startDate: '2025-04-26',
      endDate: '2025-12-31',
      location: '광주광역시 동구',
      views: 199,
      favorites: 45,
      reviews: 12,
      rating: 4.8,
    },
    {
      id: 3,
      title: '[중장년 남성] 집밥에 진심인 남자들 : 제철 남도밥상',
      status: '오픈 예정',
      approvalStatus: '완료',
      startDate: '2025-11-05',
      endDate: '2025-12-10',
      location: '광주광역시 북구',
      views: 158,
      favorites: 14,
      reviews: 0,
      rating: 0,
    },
    {
      id: 4,
      title: '광주 충장로 도깨비장터 플리마켓',
      status: '-',
      approvalStatus: '반려',
      startDate: '2025-11-15',
      endDate: '2025-11-15',
      location: '광주광역시 동구',
      views: 0,
      favorites: 0,
      reviews: 0,
      rating: 0,
      rejectionReason: '제출하신 사업자 등록증이 만료되었습니다.',
    },
    {
      id: 5,
      title: 'ACC 공동기획 〈셋!〉',
      status: '-',
      approvalStatus: '대기',
      startDate: '2025-12-06',
      endDate: '2025-12-07',
      location: '광주광역시 서구',
      views: 0,
      favorites: 0,
      reviews: 0,
      rating: 0,
    },
  ];

  const filteredPopups = popups.filter((popup) => {
    const matchesSearch = popup.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '전체' || popup.status === statusFilter;
    const matchesApproval = approvalFilter === '전체' || popup.approvalStatus === approvalFilter;
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      '진행 중': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      '오픈 예정': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      '종료': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      '-': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig['-'];
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
              <Link to={ROUTES.seller.dashboard} className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
                ← 대시보드로 돌아가기
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">팝업 관리</h1>
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
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="팝업명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* 운영 상태 필터 */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="전체">전체 상태</option>
                <option value="진행 중">진행 중</option>
                <option value="오픈 예정">오픈 예정</option>
                <option value="종료">종료</option>
              </select>
            </div>

            {/* 승인 상태 필터 */}
            <div>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="전체">전체 승인</option>
                <option value="완료">승인 완료</option>
                <option value="대기">승인 대기</option>
                <option value="반려">승인 반려</option>
              </select>
            </div>
          </div>
        </div>

        {/* 팝업 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold text-gray-900">{filteredPopups.length}</span>개의 팝업
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredPopups.length > 0 ? (
              filteredPopups.map((popup) => (
                <div key={popup.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{popup.title}</h3>
                        {getStatusBadge(popup.status)}
                        {getApprovalBadge(popup.approvalStatus)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {popup.startDate} ~ {popup.endDate}
                        </div>
                        <div>{popup.location}</div>
                      </div>

                      {/* 반려 사유 */}
                      {popup.approvalStatus === '반려' && popup.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-red-800">
                            <strong>반려 사유:</strong> {popup.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* 통계 */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Eye className="w-4 h-4 mr-1" />
                          조회 {popup.views}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Heart className="w-4 h-4 mr-1" />
                          찜 {popup.favorites}
                        </div>
                        {popup.reviews > 0 && (
                          <div className="text-gray-600">
                            ⭐ {popup.rating} ({popup.reviews}개)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPopupsPage;

