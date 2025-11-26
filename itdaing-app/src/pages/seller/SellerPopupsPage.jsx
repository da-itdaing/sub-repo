import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import {
  PlusCircle,
  Search,
  Eye,
  Heart,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
} from 'lucide-react';

const SellerPopupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [approvalFilter, setApprovalFilter] = useState('전체');

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
      '진행 중': { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
      '오픈 예정': { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
      '종료': { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
      '-': { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig['-'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="h-3.5 w-3.5" />
        {status}
      </span>
    );
  };

  const getApprovalBadge = (status) => {
    const statusConfig = {
      '완료': 'bg-emerald-100 text-emerald-700',
      '대기': 'bg-amber-100 text-amber-700',
      '반려': 'bg-rose-100 text-rose-700',
    };
    const classes = statusConfig[status] || statusConfig['대기'];
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-wrap gap-4">
          
          {/* 검색 */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="팝업명 검색"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-10 py-2 text-sm 
              focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 운영 상태 */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-gray-200 border-r-2 border-r-gray-300 bg-white px-4 py-2 text-sm text-gray-700
            focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="전체">운영 상태</option>
            <option value="진행 중">진행 중</option>
            <option value="오픈 예정">오픈 예정</option>
            <option value="종료">종료</option>
          </select>

          {/* 승인 상태 */}
          <select
            value={approvalFilter}
            onChange={(event) => setApprovalFilter(event.target.value)}
            className="rounded-2xl border border-gray-200 border-r-2 border-r-gray-300 bg-white px-4 py-2 text-sm text-gray-700
            focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="전체">승인 상태</option>
            <option value="완료">승인 완료</option>
            <option value="대기">승인 대기</option>
            <option value="반려">승인 반려</option>
          </select>

          {/* 새 팝업 등록 버튼 */}
          <Link
            to={ROUTES.seller.popupCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white 
            shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            새 팝업 등록
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/80 bg-white shadow-sm shadow-slate-200/60">
        
        {/* 상단 바 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-sm text-gray-500">
            총 <span className="font-semibold text-gray-900">{filteredPopups.length.toLocaleString()}</span>개의 팝업
          </div>
          <Link to={ROUTES.seller.dashboard} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
            대시보드
          </Link>
        </div>

        {/* 리스트 */}
        <div className="divide-y divide-gray-100">
          {filteredPopups.length > 0 ? (
            filteredPopups.map((popup) => (
              <div key={popup.id} className="p-6 transition hover:bg-slate-50/60">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  
                  {/* 왼쪽 정보 */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{popup.title}</h3>
                      {getStatusBadge(popup.status)}
                      {getApprovalBadge(popup.approvalStatus)}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {popup.startDate} ~ {popup.endDate}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {popup.location}
                      </span>
                    </div>

                    {popup.approvalStatus === '반려' && popup.rejectionReason && (
                      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-3 text-sm text-rose-700">
                        <strong className="mr-1">반려 사유</strong>
                        {popup.rejectionReason}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        {popup.views.toLocaleString()}회 노출
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-4 w-4 text-gray-400" />
                        {popup.favorites.toLocaleString()}명이 찜
                      </span>
                      {popup.reviews > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          ⭐ {popup.rating} ({popup.reviews}개)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽 버튼 */}
                  <div className="flex items-center gap-2">
                    <button className="rounded-2xl border border-blue-100 p-2 text-blue-600 transition hover:bg-blue-50">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="rounded-2xl border border-rose-100 p-2 text-rose-500 transition hover:bg-rose-50">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-sm text-gray-500">
              검색 조건에 맞는 팝업이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SellerPopupsPage;
