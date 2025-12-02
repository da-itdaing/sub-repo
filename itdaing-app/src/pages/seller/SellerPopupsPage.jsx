import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { useQuery } from '@tanstack/react-query';
import { getMyPopups } from '@/services/sellerService';
import {
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
} from 'lucide-react';

/* ----------------------- CONSTANTS & FORMATTERS ----------------------- */

const APPROVAL_STATUS = {
  'APPROVED': { label: '완료', color: 'text-green-600' },
  'PENDING': { label: '대기', color: 'text-amber-500' },
  'REJECTED': { label: '반려', color: 'text-rose-600' },
};

const OPERATION_STATUS = {
  'ONGOING': { label: '진행 중', color: 'text-green-600' },
  'UPCOMING': { label: '오픈 예정', color: 'text-amber-500' },
  'ENDED': { label: '종료', color: 'text-rose-600' },
  'UNKNOWN': { label: '-', color: 'text-gray-400' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getOperationStatus = (start, end) => {
  if (!start || !end) return 'UNKNOWN';
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);

  if (now < s) return 'UPCOMING';
  if (now > e) return 'ENDED';
  return 'ONGOING';
};

const SellerPopupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [selectedRejection, setSelectedRejection] = useState(null);

  // Fetch Data
  const { data: popups = [], isLoading, error } = useQuery({
    queryKey: ['myPopups'],
    queryFn: getMyPopups,
    staleTime: 1000 * 60, // 1분
  });

  // Filtering
  const filteredPopups = useMemo(() => {
    return popups.filter((popup) => {
      const opKey = getOperationStatus(popup.startDate, popup.endDate);
      const appStatus = popup.status || 'PENDING';

      const matchesSearch = popup.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'ONGOING' && opKey === 'ONGOING') ||
        (statusFilter === 'UPCOMING' && opKey === 'UPCOMING') ||
        (statusFilter === 'ENDED' && opKey === 'ENDED');

      const matchesApproval = 
        approvalFilter === 'ALL' || 
        (approvalFilter === 'APPROVED' && appStatus === 'APPROVED') ||
        (approvalFilter === 'PENDING' && appStatus === 'PENDING') ||
        (approvalFilter === 'REJECTED' && appStatus === 'REJECTED');

      return matchesSearch && matchesStatus && matchesApproval;
    });
  }, [popups, searchTerm, statusFilter, approvalFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPopups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredPopups.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500">데이터를 불러오는데 실패했습니다.</div>;
  }

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
              <option value="ALL">운영 상태</option>
              <option value="ONGOING">진행 중</option>
              <option value="UPCOMING">오픈 예정</option>
              <option value="ENDED">종료</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-[#EB0000]/40 focus:outline-none focus:ring-2 focus:ring-[#EB0000]/20"
            >
              <option value="ALL">승인 상태</option>
              <option value="APPROVED">승인 완료</option>
              <option value="PENDING">승인 대기</option>
              <option value="REJECTED">승인 반려</option>
            </select>

            <Link
              to={ROUTES.seller.popupCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#EB0000] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#EB0000]/30 hover:bg-[#c90000] transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              팝업 등록
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
                  const opKey = getOperationStatus(popup.startDate, popup.endDate);
                  const opStatus = OPERATION_STATUS[opKey] || OPERATION_STATUS['UNKNOWN'];
                  const appStatus = APPROVAL_STATUS[popup.status] || APPROVAL_STATUS['PENDING'];
                  
                  return (
                    <tr key={popup.id} className="hover:bg-gray-50 transition-colors">
                      {/* Image - thumbnail이 객체({url, key}) 또는 문자열일 수 있음 */}
                      <td className="py-4 px-4 text-center">
                        <div className="relative aspect-square w-14 mx-auto overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          {popup.thumbnail ? (
                            <img 
                              src={typeof popup.thumbnail === 'string' ? popup.thumbnail : popup.thumbnail?.url} 
                              alt={popup.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="h-full w-full items-center justify-center text-[10px] text-gray-400"
                            style={{ display: popup.thumbnail ? 'none' : 'flex' }}
                          >
                            No Image
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-4 px-4 text-center font-medium text-gray-900 truncate max-w-[240px]">
                        {popup.title}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={opStatus.color}>
                          {opStatus.label}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-center text-gray-500">
                        {formatDate(popup.createdAt)}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 text-center text-gray-500">
                        {popup.startDate} ~ {popup.endDate}
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={appStatus.color}>
                          {appStatus.label}
                        </span>
                      </td>

                      {/* Rejection Reason */}
                      <td className="py-4 px-4 text-center flex justify-center items-center h-[88px]">
                        {popup.status === 'REJECTED' && popup.rejectionReason ? (
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