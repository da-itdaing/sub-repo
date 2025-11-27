import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Plus
} from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { getSellerDashboard } from '@/services/sellerService';

/* ----------------------- FORMATTERS ----------------------- */

const numberFormatter = new Intl.NumberFormat('ko-KR');
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dateFormatter.format(new Date(dateStr))
    .replace(/\./g, '-')
    .replace(/\s/g, '')
    .slice(0, -1);
};

const formatPeriod = (start, end) => {
  if (!start || !end) return '-';
  return `${formatDate(start)} ~ ${formatDate(end)}`;
};

/* ----------------------- CONSTANTS ----------------------- */

const APPROVAL_STATUS = {
  APPROVED: { label: '완료', color: 'text-green-600', icon: CheckCircle2 },
  PENDING: { label: '대기', color: 'text-amber-500', icon: Clock },
  REJECTED: { label: '반려', color: 'text-rose-600', icon: XCircle },
  DRAFT: { label: '대기', color: 'text-gray-400', icon: Clock },
};

const OPERATION_STATUS = {
  ONGOING: { label: '진행 중', color: 'text-green-600', icon: CheckCircle2 },
  UPCOMING: { label: '예정 중', color: 'text-amber-500', icon: Clock },
  ENDED: { label: '종료', color: 'text-rose-600', icon: XCircle },
  UNKNOWN: { label: '-', color: 'text-gray-400', icon: null },
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

/* ----------------------- COMPONENTS ----------------------- */

const StatusCard = ({ title, stats }) => {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-rose-600 mb-6">{title}</h3>
      <div className="flex justify-between items-center px-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm font-semibold text-gray-500">{stat.label}</span>
                <Icon className={clsx("w-4 h-4", stat.iconColor)} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stat.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ViewsChart = ({ popups }) => {
  // 조회수 기준 상위 N개만 사용
  const topPopups = useMemo(() => {
    return [...popups]
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 5);
  }, [popups]);

  const maxView = topPopups.reduce(
    (max, p) => Math.max(max, p.viewCount ?? 0),
    0
  );

  if (!topPopups.length || maxView === 0) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col h-[320px] justify-center items-center text-sm text-gray-500">
        조회수 데이터가 아직 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col h-[362px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-rose-600">조회수 TOP {topPopups.length}</h3>
        <span className="text-xs text-gray-400">최근 누적 조회수 기준</span>
      </div>

      <div className="flex-1 space-y-3 overflow-hidden">
        {topPopups.map((p) => {
          const value = p.viewCount ?? 0;
          const width = maxView ? Math.max(8, (value / maxView) * 100) : 0;

          return (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="truncate max-w-[180px] font-semibold" title={p.title}>
                  {p.title}
                </span>
                <span className="font-medium text-gray-700">
                  {numberFormatter.format(value)}회
                </span>
              </div>
              <div className="h-4.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#EB0000] to-[#FF6B6B] transition-[width] duration-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ----------------------- PAGE ----------------------- */

const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const [filterOpStatus, setFilterOpStatus] = useState('ALL');
  const [filterAppStatus, setFilterAppStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['sellerDashboard'],
    queryFn: getSellerDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const popups = data?.popups ?? [];

  const stats = useMemo(() => {
    return {
      approval: {
        approved: popups.filter(p => p.status === 'APPROVED').length,
        pending: popups.filter(p => p.status === 'PENDING').length,
        rejected: popups.filter(p => p.status === 'REJECTED').length,
      },
      operation: {
        ongoing: popups.filter(p => getOperationStatus(p.startDate, p.endDate) === 'ONGOING').length,
        upcoming: popups.filter(p => getOperationStatus(p.startDate, p.endDate) === 'UPCOMING').length,
        ended: popups.filter(p => getOperationStatus(p.startDate, p.endDate) === 'ENDED').length,
      },
    };
  }, [popups]);

  const filteredPopups = useMemo(() => {
    return popups.filter(p => {
      const opKey = getOperationStatus(p.startDate, p.endDate);
      const appStatus = p.status;

      const opMatch =
        filterOpStatus === 'ALL' ||
        (filterOpStatus === 'ONGOING' && opKey === 'ONGOING') ||
        (filterOpStatus === 'UPCOMING' && opKey === 'UPCOMING') ||
        (filterOpStatus === 'UNKNOWN' && opKey === 'UNKNOWN');

      const appMatch =
        filterAppStatus === 'ALL' ||
        (filterAppStatus === 'APPROVED' && appStatus === 'APPROVED') ||
        (filterAppStatus === 'REJECTED' && appStatus === 'REJECTED') ||
        (filterAppStatus === 'PENDING' && appStatus === 'PENDING');

      return opMatch && appMatch;
    });
  }, [popups, filterOpStatus, filterAppStatus]);

  const totalPages = Math.ceil(filteredPopups.length / ITEMS_PER_PAGE);
  const paginatedPopups = filteredPopups.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  useMemo(() => setPage(1), [filterOpStatus, filterAppStatus]);

  if (isLoading) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="space-y-6 pb-20">

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Cards */}
        <div className="space-y-6 lg:col-span-5">
          <StatusCard 
            title="승인 현황"
            stats={[
              { label: '승인 완료', count: stats.approval.approved, icon: CheckCircle2, iconColor: 'text-green-500' },
              { label: '승인 대기', count: stats.approval.pending, icon: Clock, iconColor: 'text-amber-500' },
              { label: '승인 반려', count: stats.approval.rejected, icon: XCircle, iconColor: 'text-rose-500' },
            ]}
          />

          <StatusCard 
            title="팝업 현황"
            stats={[
              { label: '진행 중', count: stats.operation.ongoing, icon: CheckCircle2, iconColor: 'text-green-500' },
              { label: '예정 중', count: stats.operation.upcoming, icon: Clock, iconColor: 'text-amber-500' },
              { label: '종료', count: stats.operation.ended, icon: XCircle, iconColor: 'text-rose-500' },
            ]}
          />
        </div>

        {/* Views Chart */}
        <div className="lg:col-span-7">
          <ViewsChart popups={popups} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold text-rose-600">팝업 관리</h3>

          <div className="flex items-center gap-3">
            {/* Filters */}
            <select 
              value={filterOpStatus}
              onChange={(e) => setFilterOpStatus(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 "
            >
              <option value="ALL">운영상태</option>
              <option value="ONGOING">진행 중</option>
              <option value="UPCOMING">오픈 예정</option>
              <option value="UNKNOWN">-</option>
            </select>

            <select 
              value={filterAppStatus}
              onChange={(e) => setFilterAppStatus(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-500"
            >
              <option value="ALL">승인상태</option>
              <option value="APPROVED">완료</option>
              <option value="REJECTED">반려</option>
              <option value="PENDING">대기</option>
            </select>

            <button 
              onClick={() => navigate(ROUTES.seller.popups)}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="전체 보기"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-[#333] text-white text-sm">
                <th className="py-3 px-4 font-medium text-center rounded-tl-xl">팝업명</th>
                <th className="py-3 px-4 font-medium text-center">운영 상태</th>
                <th className="py-3 px-4 font-medium text-center">등록 일시</th>
                <th className="py-3 px-4 font-medium text-center">운영 기간</th>
                <th className="py-3 px-4 font-medium text-center">승인 상태</th>
                <th className="py-3 px-4 font-medium text-center rounded-tr-xl">반려 사유</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedPopups.length > 0 ? (
                paginatedPopups.map(p => {
                  const opKey = getOperationStatus(p.startDate, p.endDate);
                  const opStatus = OPERATION_STATUS[opKey];
                  const appStatus = APPROVAL_STATUS[p.status] || APPROVAL_STATUS.DRAFT;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-center font-medium text-gray-900 truncate max-w-[200px]">{p.title}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={clsx(opStatus.color)}>{opStatus.label}</span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500">
                        {formatPeriod(p.startDate, p.endDate)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={clsx(appStatus.color)}>{appStatus.label}</span>
                      </td>
                      <td className="py-4 px-4 text-center flex justify-center">
                        {p.status === 'REJECTED' ? (
                          <FileText className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div className="w-24" />

          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-medium text-gray-600">
              {page} / {Math.max(1, totalPages)}
            </span>

            <button 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Link
            to={ROUTES.seller.popupCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-[#d60000] transition-colors shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            팝업 등록
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SellerDashboardPage;