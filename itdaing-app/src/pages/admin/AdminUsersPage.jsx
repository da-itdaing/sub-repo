import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { listUsers, updateUserStatus } from '@/services/adminService';

const PAGE_SIZE = 10;

const getAgeGroupLabel = (ageGroup) => {
  if (!ageGroup) return '-';
  return `${ageGroup}대`;
};

const getStatusLabel = (status) => {
  if (status === 'ACTIVE') return '활성화';
  if (status === 'SUSPENDED') return '정지';
  if (status === 'WITHDRAWN') return '탈퇴';
  return status;
};

const getStatusChipClass = (status) => {
  if (status === 'ACTIVE') return 'bg-blue-50 text-blue-600';
  if (status === 'SUSPENDED') return 'bg-red-50 text-red-600';
  if (status === 'WITHDRAWN') return 'bg-gray-50 text-gray-500';
  return 'bg-gray-50 text-gray-500';
};

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('CONSUMER'); // 'CONSUMER' | 'SELLER'
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 사용자 목록 조회
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers', roleFilter],
    queryFn: () => listUsers({ role: roleFilter, page: 0, size: 200 }),
    staleTime: 60 * 1000,
  });

  // Spring Page 응답에서 content 추출
  const users = usersData?.content || [];
  const totalElements = usersData?.totalElements || 0;

  // 상태 변경 Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: () => {
      addToast({ title: '사용자 상태가 변경되었습니다.' });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSelectedIds([]);
    },
    onError: (error) => {
      addToast({ title: '상태 변경 실패', description: error.message, variant: 'error' });
    },
  });

  // 검색 필터링 (프론트에서 처리)
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      return (
        (user.loginId || '').toLowerCase().includes(term) ||
        (user.name || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const allVisibleSelected =
    pagedUsers.length > 0 &&
    pagedUsers.every((user) => selectedIds.includes(user.id));

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const ids = pagedUsers.map((user) => user.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    } else {
      const visibleIds = new Set(pagedUsers.map((user) => user.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    }
  };

  const handleToggleSelectOne = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleChangeStatus = async (nextStatus) => {
    if (selectedIds.length === 0) return;

    // 순차적으로 상태 변경 (병렬 처리도 가능)
    for (const userId of selectedIds) {
      await updateStatusMutation.mutateAsync({ userId, status: nextStatus });
    }
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* 헤더: 검색창 */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">사용자 관리</h1>
            <button
              onClick={() => refetch()}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="새로고침"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400">
              총 {totalElements}명
            </span>
          </div>
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="아이디, 이름, 이메일로 검색"
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </section>

      {/* 사용자 테이블 */}
      <section className="rounded-3xl border border-white/80 bg-white shadow-sm shadow-slate-200/60">
        {/* 상단 컨트롤 (소비자/판매자 토글) */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
          <div className="text-sm font-semibold text-gray-900">사용자 목록</div>
          <div className="inline-flex gap-1 rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setRoleFilter('CONSUMER');
                setCurrentPage(1);
                setSelectedIds([]);
              }}
              className={`min-w-[72px] rounded-full px-3 py-1 text-xs font-semibold ${
                roleFilter === 'CONSUMER'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-white'
              }`}
            >
              소비자
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleFilter('SELLER');
                setCurrentPage(1);
                setSelectedIds([]);
              }}
              className={`min-w-[72px] rounded-full px-3 py-1 text-xs font-semibold ${
                roleFilter === 'SELLER'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-white'
              }`}
            >
              판매자
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) =>
                      handleToggleSelectAll(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  아이디
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  이름
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  연령대
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  이메일
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                    검색 조건에 맞는 사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    onClick={() =>
                      navigate(`/admin/users/${user.id}`, { state: { user } })
                    }
                    className={`cursor-pointer border-b border-dashed border-gray-200 hover:bg-slate-50/70 ${
                      index === 0 ? 'border-t border-solid border-gray-200' : ''
                    }`}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => handleToggleSelectOne(user.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900">{user.loginId || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{user.name || user.nickname || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{getAgeGroupLabel(user.ageGroup)}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusChipClass(user.status)}`}
                      >
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 하단: 페이지네이션 + 상태 변경 버튼 */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {/* 왼쪽 여백 (정렬용) */}
          <div className="w-24" />

          {/* 페이지네이션 */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <button
              type="button"
              onClick={() => handleChangePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handleChangePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 상태 변경 버튼 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChangeStatus('ACTIVE')}
              disabled={selectedIds.length === 0 || updateStatusMutation.isPending}
              className={`min-w-[88px] rounded-lg px-4 py-2 text-xs font-semibold shadow-sm ${
                selectedIds.length === 0
                  ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              활성화
            </button>
            <button
              type="button"
              onClick={() => handleChangeStatus('SUSPENDED')}
              disabled={selectedIds.length === 0 || updateStatusMutation.isPending}
              className={`min-w-[88px] rounded-lg px-4 py-2 text-xs font-semibold shadow-sm ${
                selectedIds.length === 0
                  ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              정지
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminUsersPage;
