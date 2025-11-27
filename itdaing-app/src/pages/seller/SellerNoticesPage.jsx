import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '@/routes/paths';

const SellerNoticesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Mock Data
  const [notices, setNotices] = useState([
    {
      id: 'notice-1',
      isImportant: true,
      popupName: '충장 라온 페스타',
      title: '고객 문의사항 창구',
      date: '2025-09-11',
    },
    {
      id: 'notice-2',
      isImportant: false,
      no: 12,
      popupName: '여울원 팝업 IN 광주',
      title: '분실물 보관 안내',
      date: '2025-10-24',
    },
    {
      id: 'notice-3',
      isImportant: false,
      no: 11,
      popupName: '충장 라온 페스타',
      title: '11월 안내사항 안내',
      date: '2025-10-31',
      isChecked: true, // 예시용
    },
    {
      id: 'notice-4',
      isImportant: false,
      no: 10,
      popupName: '여울원 팝업 IN 광주',
      title: '선입장 및 일반입장 고객 안내사항',
      date: '2025-10-22',
    },
    {
      id: 'notice-5',
      isImportant: false,
      no: 9,
      popupName: '[중장년 남성] 집밥에 진심인 남자들 : 제철 남도밥상',
      title: '충장로 교통통제 안내',
      date: '2025-10-14',
      isChecked: true, // 예시용
    },
    {
      id: 'notice-6',
      isImportant: false,
      no: 8,
      popupName: '충장 라온 페스타',
      title: 'SNS 후기 이벤트! (10/15~10/22)',
      date: '2025-10-12',
    },
    {
      id: 'notice-7',
      isImportant: false,
      no: 7,
      popupName: '[중장년 남성] 집밥에 진심인 남자들 : 제철 남도밥상',
      title: '\'광주 추억의 충장축제\' 내부 마켓 위치 안내도',
      date: '2025-10-11',
    },
    {
      id: 'notice-8',
      isImportant: false,
      no: 6,
      popupName: '2025 광주 빵 페스타',
      title: '물품 통신판매 안내(10/10~10/13)',
      date: '2025-10-10',
    },
    {
      id: 'notice-9',
      isImportant: false,
      no: 5,
      popupName: '하리보리빙 팝업',
      title: '참여형 전시 중 권고사항',
      date: '2025-10-02',
    },
    {
      id: 'notice-10',
      isImportant: false,
      no: 4,
      popupName: '하리보리빙 팝업',
      title: '10월 추석 기간 휴무(10/4~10/8)',
      date: '2025-09-30',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 생성/수정 페이지에서 돌아올 때 중요 여부 및 신규 공지 반영
  useEffect(() => {
    const updated = location.state?.updatedNotice;
    const created = location.state?.createdNotice;

    if (!updated && !created) return;

    setNotices((prev) => {
      let next = [...prev];

      // 중요 여부 수정 반영
      if (updated) {
        next = next.map((n) =>
          n.id === updated.id ? { ...n, isImportant: updated.isImportant } : n
        );
      }

      // 신규 공지 추가 (목록 상단에 추가)
      if (created) {
        const maxNo = next.reduce((max, n) => (typeof n.no === 'number' ? Math.max(max, n.no) : max), 0);
        next = [
          {
            ...created,
            no: maxNo + 1,
          },
          ...next,
        ];
      }

      return next;
    });

    // state 초기화 (뒤로가기 등에서 중복 적용 방지)
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  // Filter logic
  const filteredNotices = notices.filter((notice) =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.popupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all filtered items
      setSelectedIds(filteredNotices.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 공지사항을 선택해주세요.');
      return;
    }

    if (window.confirm(`${selectedIds.length}개의 공지사항을 삭제하시겠습니까?`)) {
      setNotices((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      
      // If current page becomes empty after deletion, go to previous page
      const remainingCount = filteredNotices.length - selectedIds.length;
      const newTotalPages = Math.ceil(remainingCount / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-[#EB0000]">공지사항</h2>
          
          <div className="flex flex-1 max-w-xl mx-auto w-full relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
                className="w-full rounded-full border border-gray-300 py-2 pl-4 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.seller.noticeCreate)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            공지 등록
          </button>
        </div>
      </section>

      {/* Table Section */}
      <section className="overflow-hidden rounded-t-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#333333] text-white">
              <th className="w-12 py-3 pl-4 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#EB0000] focus:ring-[#EB0000]"
                  checked={
                    filteredNotices.length > 0 &&
                    filteredNotices.every((n) => selectedIds.includes(n.id))
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="w-20 py-3 text-center text-sm font-medium"></th>
              <th className="w-1/4 py-3 text-center text-sm font-medium">팝업명</th>
              <th className="py-3 text-center text-sm font-medium">제목</th>
              <th className="w-32 py-3 pr-4 text-center text-sm font-medium">게시 일자</th>
            </tr>
          </thead>
          <tbody>
            {paginatedNotices.map((notice) => (
              <tr
                key={notice.id}
                onClick={() => navigate(ROUTES.seller.noticeDetail(notice.id))}
                className="border-b border-dashed border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <td className="py-4 pl-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#EB0000] focus:ring-[#EB0000]"
                    checked={selectedIds.includes(notice.id)}
                    onChange={() => handleSelectOne(notice.id)}
                  />
                </td>
                <td className="py-4 text-center">
                  {notice.isImportant ? (
                    <span className="inline-block rounded-full border border-[#EB0000] px-2 py-0.5 text-xs font-bold text-[#EB0000]">
                      중요
                    </span>
                  ) : (
                    <span className="inline-block rounded-full border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      일반
                    </span>
                  )}
                </td>
                <td className="py-4 text-center text-sm text-gray-600">
                  {notice.popupName}
                </td>
                <td className="py-4 text-left pl-8 text-sm text-gray-900">
                  {notice.title}
                </td>
                <td className="py-4 pr-4 text-center text-sm text-gray-500">
                  {notice.date}
                </td>
              </tr>
            ))}
            
            {/* Empty State */}
            {paginatedNotices.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Footer Actions & Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="w-20"></div> {/* Spacer for centering */}
        
        <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-600">
              {totalPages === 0 ? 0 : currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className={clsx(
            "rounded-lg px-6 py-2 text-sm font-bold text-white shadow-sm transition",
            selectedIds.length > 0 
              ? "bg-[#EB0000] hover:bg-[#c90000]" 
              : "bg-gray-300 cursor-not-allowed"
          )}
          disabled={selectedIds.length === 0}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default SellerNoticesPage;

