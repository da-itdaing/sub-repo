import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_USERS = [
  {
    id: 1,
    loginId: 'testuser',
    name: '홍길동',
    ageGroup: '20대',
    email: 'user@gmail.com',
    role: 'consumer',
    status: 'active',
  },
  {
    id: 2,
    loginId: 'orion1234',
    name: '강건',
    ageGroup: '30대',
    email: 'orion1234@naver.com',
    role: 'consumer',
    status: 'active',
  },
  {
    id: 3,
    loginId: 'rlaskarb',
    name: '김남규',
    ageGroup: '60대',
    email: 'rlaskarb@gmail.com',
    role: 'consumer',
    status: 'active',
  },
  {
    id: 4,
    loginId: 'minwoo12',
    name: '고민우',
    ageGroup: '20대',
    email: 'minwoo12@Daum.com',
    role: 'consumer',
    status: 'active',
  },
  {
    id: 5,
    loginId: 'JHSung',
    name: '정하성',
    ageGroup: '20대',
    email: 'JHSung@gmail.com',
    role: 'consumer',
    status: 'inactive',
  },
  {
    id: 6,
    loginId: 'yongmari',
    name: '이자현',
    ageGroup: '30대',
    email: 'yongmari@naver.com',
    role: 'seller',
    status: 'active',
  },
  {
    id: 7,
    loginId: 'ganadiuyu',
    name: '강하리',
    ageGroup: '30대',
    email: 'ganadiuyu@Daum.com',
    role: 'seller',
    status: 'inactive',
  },
  {
    id: 8,
    loginId: 'diamond',
    name: '김고운',
    ageGroup: '40대',
    email: 'diamond@gmail.com',
    role: 'consumer',
    status: 'active',
  },
  {
    id: 9,
    loginId: 'yesiCan',
    name: '한강석',
    ageGroup: '50대',
    email: 'yesiCan@naver.com',
    role: 'seller',
    status: 'active',
  },
  {
    id: 10,
    loginId: 'tekemyMoney',
    name: '이태민',
    ageGroup: '30대',
    email: 'tekemyMoney@naver.com',
    role: 'seller',
    status: 'inactive',
  },
];

const PAGE_SIZE = 10;

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('consumer'); // 'consumer' | 'seller'
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 검색 + 역할 필터링
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false;
      if (!term) return true;
      return (
        user.loginId.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm, roleFilter]);

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

  const handleChangeStatus = (nextStatus) => {
    if (selectedIds.length === 0) return;

    setUsers((prev) =>
      prev.map((user) =>
        selectedIds.includes(user.id) ? { ...user, status: nextStatus } : user
      )
    );
    setSelectedIds([]);
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
          <h1 className="text-lg font-semibold text-gray-900">사용자 관리</h1>
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
                setRoleFilter('consumer');
                setCurrentPage(1);
              }}
              className={`min-w-[72px] rounded-full px-3 py-1 text-xs font-semibold ${
                roleFilter === 'consumer'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-white'
              }`}
            >
              소비자
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleFilter('seller');
                setCurrentPage(1);
              }}
              className={`min-w-[72px] rounded-full px-3 py-1 text-xs font-semibold ${
                roleFilter === 'seller'
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
              {pagedUsers.map((user, index) => (
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
                  <td className="px-4 py-3 text-gray-900">{user.loginId}</td>
                  <td className="px-4 py-3 text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-700">{user.ageGroup}</td>
                  <td className="px-4 py-3 text-gray-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.status === 'active'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {user.status === 'active' ? '활성화' : '비활성화'}
                    </span>
                  </td>
                </tr>
              ))}

              {pagedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    검색 조건에 맞는 사용자가 없습니다.
                  </td>
                </tr>
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
              onClick={() => handleChangeStatus('active')}
              disabled={selectedIds.length === 0}
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
              onClick={() => handleChangeStatus('inactive')}
              disabled={selectedIds.length === 0}
              className={`min-w-[88px] rounded-lg px-4 py-2 text-xs font-semibold shadow-sm ${
                selectedIds.length === 0
                  ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              비활성화
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminUsersPage;


