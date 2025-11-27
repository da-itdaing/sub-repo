import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import {
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

/* ----------------------- CONSTANTS & FORMATTERS ----------------------- */

const APPROVAL_STATUS = {
  '완료': { label: '완료', color: 'text-green-600' },
  '대기': { label: '대기', color: 'text-amber-500' },
  '반려': { label: '반려', color: 'text-rose-600' },
};

const OPERATION_STATUS = {
  '진행 중': { label: '진행 중', color: 'text-green-600' },
  '오픈 예정': { label: '오픈 예정', color: 'text-amber-500' },
  '종료': { label: '종료', color: 'text-rose-600' },
  '-': { label: '-', color: 'text-gray-400' },
};

const SellerPopupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [approvalFilter, setApprovalFilter] = useState('전체');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [selectedRejection, setSelectedRejection] = useState(null);

  // Mock Data
  const popups = [
    {
      id: 1,
      title: '여울원 팝업 IN 광주',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop',
      status: '진행 중',
      approvalStatus: '완료',
      registeredAt: '2025-10-25',
      startDate: '2025-10-31',
      endDate: '2025-11-13',
      views: 133,
      favorites: 28,
      reviews: 5,
      rating: 4.5,
    },
    {
      id: 2,
      title: '충장 라온 페스타',
      image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop',
      status: '진행 중',
      approvalStatus: '완료',
      registeredAt: '2025-04-20',
      startDate: '2025-04-26',
      endDate: '2025-12-31',
      views: 199,
      favorites: 45,
      reviews: 12,
      rating: 4.8,
    },
    {
      id: 3,
      title: '[중장년 남성] 집밥에 진심인 남자들 : 제철 남도밥상',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop',
      status: '오픈 예정',
      approvalStatus: '완료',
      registeredAt: '2025-11-01',
      startDate: '2025-11-05',
      endDate: '2025-12-10',
      views: 158,
      favorites: 14,
      reviews: 0,
      rating: 0,
    },
    {
      id: 4,
      title: '광주 충장로 도깨비장터 플리마켓 셀러 모집(11월15일)',
      image: 'https://images.unsplash.com/photo-1605218427360-3639685862c8?q=80&w=2070&auto=format&fit=crop',
      status: '-',
      approvalStatus: '반려',
      registeredAt: '2025-11-11',
      startDate: '2025-11-15',
      endDate: '2025-11-15',
      views: 0,
      favorites: 0,
      reviews: 0,
      rating: 0,
      rejectionReason: '제출하신 사업자 등록증이 만료되었습니다. 유효기간을 확인 후 다시 제출해주세요.',
    },
    {
      id: 5,
      title: 'ACC 공동기획 〈셋!〉',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop',
      status: '-',
      approvalStatus: '대기',
      registeredAt: '2025-12-01',
      startDate: '2025-12-06',
      endDate: '2025-12-07',
      views: 0,
      favorites: 0,
      reviews: 0,
      rating: 0,
    },
  ];

  // Filtering
  const filteredPopups = popups.filter((popup) => {
    const matchesSearch = popup.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '전체' || popup.status === statusFilter;
    const matchesApproval = approvalFilter === '전체' || popup.approvalStatus === approvalFilter;
    return matchesSearch && matchesStatus && matchesApproval;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPopups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredPopups.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Rejection Reason Modal */}
      {selectedRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">반려 사유</h3>
              <button 
                onClick={() => setSelectedRejection(null)}
                className="rounded-full p-1 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-[100px] rounded-xl bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
              {selectedRejection}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRejection(null)}
                className="rounded-xl bg-[#EB0000] px-6 py-2 text-sm font-semibold text-white hover:bg-[#c90000] transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-[#EB0000]">팝업 관리</h2>

          {/* Search */}
          <div className="flex flex-1 max-w-xl mx-auto w-full relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="팝업명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 py-2 pl-4 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#EB0000] focus:ring-1 focus:ring-[#EB0000]"
              />
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#EB0000]" />
            </div>
          </div>

          {/* Filters & Action */}
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-[#EB0000]/40 focus:outline-none focus:ring-2 focus:ring-[#EB0000]/20"
            >
              <option value="전체">운영 상태</option>
              <option value="진행 중">진행 중</option>
              <option value="오픈 예정">오픈 예정</option>
              <option value="종료">종료</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-[#EB0000]/40 focus:outline-none focus:ring-2 focus:ring-[#EB0000]/20"
            >
              <option value="전체">승인 상태</option>
              <option value="완료">승인 완료</option>
              <option value="대기">승인 대기</option>
              <option value="반려">승인 반려</option>
            </select>

            <Link
              to={ROUTES.seller.popupCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#EB0000] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#EB0000]/30 hover:bg-[#c90000] transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              새 팝업 등록
            </Link>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-3xl border border-white/80 shadow-sm shadow-slate-200/60 p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead className="bg-[#333] text-white text-sm">
              <tr>
                <th className="py-3 px-4 font-medium text-center rounded-tl-xl w-[100px]">이미지</th>
                <th className="py-3 px-4 font-medium text-center">팝업명</th>
                <th className="py-3 px-4 font-medium text-center w-[120px]">운영 상태</th>
                <th className="py-3 px-4 font-medium text-center w-[120px]">등록 일시</th>
                <th className="py-3 px-4 font-medium text-center w-[240px]">운영 기간</th>
                <th className="py-3 px-4 font-medium text-center w-[120px]">승인 상태</th>
                <th className="py-3 px-4 font-medium text-center rounded-tr-xl w-[120px]">반려 사유</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {currentItems.length > 0 ? (
                currentItems.map((popup) => {
                  const opStatus = OPERATION_STATUS[popup.status] || OPERATION_STATUS['-'];
                  const appStatus = APPROVAL_STATUS[popup.approvalStatus] || APPROVAL_STATUS['대기'];
                  
                  return (
                    <tr key={popup.id} className="hover:bg-gray-50 transition-colors">
                      {/* Image */}
                      <td className="py-4 px-4 text-center">
                        <div className="relative aspect-square w-14 mx-auto overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          {popup.image ? (
                            <img 
                              src={popup.image} 
                              alt={popup.title} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-4 px-4 text-center font-medium text-gray-900 truncate max-w-[240px]">
                        {popup.title}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={opStatus.color}>
                          {popup.status}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-center text-gray-500">
                        {popup.registeredAt}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 text-center text-gray-500">
                        {popup.startDate} ~ {popup.endDate}
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={appStatus.color}>
                          {popup.approvalStatus}
                        </span>
                      </td>

                      {/* Rejection Reason */}
                      <td className="py-4 px-4 text-center flex justify-center items-center h-[88px]">
                        {popup.approvalStatus === '반려' && popup.rejectionReason ? (
                          <button
                            onClick={() => setSelectedRejection(popup.rejectionReason)}
                            className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="반려 사유 확인"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPopups.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm font-medium text-gray-600">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default SellerPopupsPage;
