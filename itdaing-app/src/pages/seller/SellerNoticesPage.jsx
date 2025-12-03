import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, ChevronLeft, ChevronRight, Megaphone, Bell } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '@/routes/paths';
import { getMyNotices, getAllNotices, deleteNotices, getMyPopups } from '@/services/sellerService';
import { useToast } from '@/hooks/useToast';

const ITEMS_PER_PAGE = 10;
const NOTICE_TABS = [
  { id: 'my', label: '내 공지' },
  { id: 'all', label: '전체 공지' },
];

const SellerNoticesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 내 공지사항 목록 조회
  const { data: myNoticesData, isLoading: isLoadingMy } = useQuery({
    queryKey: ['myNotices'],
    queryFn: () => getMyNotices(0, 100),
    staleTime: 2 * 60 * 1000,
    enabled: activeTab === 'my',
  });

  // 전체 공지사항 목록 조회 (ALL + SELLER 대상)
  const { data: allNoticesData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['allNotices'],
    queryFn: () => getAllNotices(0, 100),
    staleTime: 2 * 60 * 1000,
    enabled: activeTab === 'all',
  });

  const noticesData = activeTab === 'my' ? myNoticesData : allNoticesData;
  const isLoading = activeTab === 'my' ? isLoadingMy : isLoadingAll;

  // 팝업 목록 조회 (팝업명 매핑용)
  const { data: popups = [] } = useQuery({
    queryKey: ['myPopups'],
    queryFn: getMyPopups,
    staleTime: 5 * 60 * 1000,
  });

  // 공지사항 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotices'] });
      setSelectedIds([]);
      addToast({ title: '공지사항이 삭제되었습니다.' });
    },
    onError: (err) => {
      addToast({ 
        title: '삭제 실패', 
        description: err.message,
        variant: 'error' 
      });
    },
  });

  // 팝업 ID -> 팝업명 맵
  const popupNameMap = useMemo(() => {
    const map = {};
    popups.forEach((p) => {
      map[p.id] = p.title;
    });
    return map;
  }, [popups]);

  // 공지사항 데이터 정규화
  const notices = useMemo(() => {
    const rawData = noticesData?.content || noticesData || [];
    if (!Array.isArray(rawData)) return [];
    
    return rawData.map((n) => ({
      id: n.id,
      isImportant: n.isImportant || n.important || false,
      popupId: n.popupId,
      popupName: popupNameMap[n.popupId] || n.popupName || '전체',
      authorName: n.authorName || '관리자',
      title: n.title,
      content: n.content,
      date: n.createdAt?.split('T')[0] || n.date || '-',
    }));
  }, [noticesData, popupNameMap]);

  // 필터링된 공지사항
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.popupName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notices, searchTerm]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE);
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 전체 선택 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredNotices.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 선택 핸들러
  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (selectedIds.length === 0) {
      addToast({ title: '삭제할 공지사항을 선택해주세요.', variant: 'warning' });
      return;
    }

    if (window.confirm(`${selectedIds.length}개의 공지사항을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(selectedIds);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 검색 시 페이지 리셋
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">공지사항을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">공지사항을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  // 탭 변경 핸들러
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSelectedIds([]);
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
                onChange={handleSearch}
                className="w-full rounded-full border border-gray-300 py-2 pl-4 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            </div>
          </div>

          {activeTab === 'my' && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.seller.noticeCreate)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              공지 등록
            </button>
          )}
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2">
        {NOTICE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
              activeTab === tab.id
                ? 'bg-[#EB0000] text-white shadow-lg shadow-primary/30'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {tab.id === 'my' ? <Megaphone className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {notices.length === 0 ? (
        <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              등록된 공지사항이 없습니다
            </h3>
            <p className="text-sm text-gray-500">
              새 공지사항을 등록해보세요.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Table Section */}
          <section className="overflow-hidden rounded-t-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#333333] text-white">
                  {activeTab === 'my' && (
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
                  )}
                  <th className="w-20 py-3 text-center text-sm font-medium">구분</th>
                  <th className="w-1/4 py-3 text-center text-sm font-medium">
                    {activeTab === 'my' ? '팝업명' : '작성자'}
                  </th>
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
                    {activeTab === 'my' && (
                      <td className="py-4 pl-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-[#EB0000] focus:ring-[#EB0000]"
                          checked={selectedIds.includes(notice.id)}
                          onChange={() => handleSelectOne(notice.id)}
                        />
                      </td>
                    )}
                    <td className="py-4 text-center">
                      {notice.isImportant ? (
                        <span className="inline-block rounded-full border border-[#EB0000] px-2 py-0.5 text-xs font-bold text-[#EB0000]">
                          중요
                        </span>
                      ) : activeTab === 'all' ? (
                        <span className="inline-block rounded-full border border-blue-500 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          공지
                        </span>
                      ) : (
                        <span className="inline-block rounded-full border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          일반
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-center text-sm text-gray-600 truncate max-w-[200px]">
                      {activeTab === 'my' ? notice.popupName : (notice.authorName || '관리자')}
                    </td>
                    <td className="py-4 text-left pl-8 text-sm text-gray-900">
                      {notice.title}
                    </td>
                    <td className="py-4 pr-4 text-center text-sm text-gray-500">
                      {notice.date}
                    </td>
                  </tr>
                ))}
                
                {/* Empty Search Result */}
                {paginatedNotices.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'my' ? 5 : 4} className="py-10 text-center text-sm text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다.' : (activeTab === 'my' ? '등록된 공지사항이 없습니다.' : '전체 공지사항이 없습니다.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Footer Actions & Pagination */}
          <div className="flex items-center justify-between pt-2">
            <div className="w-20"></div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-gray-600">
                {totalPages === 0 ? 0 : currentPage} / {totalPages || 1}
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {activeTab === 'my' ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={selectedIds.length === 0 || deleteMutation.isPending}
                className={clsx(
                  "rounded-lg px-6 py-2 text-sm font-bold text-white shadow-sm transition",
                  selectedIds.length > 0 
                    ? "bg-[#EB0000] hover:bg-[#c90000]" 
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            ) : (
              <div className="w-20"></div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SellerNoticesPage;
