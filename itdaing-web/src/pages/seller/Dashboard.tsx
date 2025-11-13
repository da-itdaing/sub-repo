import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, Calendar, TrendingUp } from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { ViewsChart } from "../../components/common/ViewsChart";
import { DataTable } from "../../components/common/DataTable";
import { useMySellerPopups } from "../../hooks/useSellerDashboard";
import { PopupSummary } from "../../types/popup";

interface ApprovalStats {
  approved: number;
  pending: number;
  rejected: number;
}

interface PopupStatusStats {
  inProgress: number;
  scheduled: number;
  ended: number;
}

interface ViewsData {
  name: string;
  dailyViews: number;
  totalViews: number;
}

export default function SellerDashboardPage() {
  const { popups, loading } = useMySellerPopups();
  const [approvalStats, setApprovalStats] = useState<ApprovalStats>({ approved: 0, pending: 0, rejected: 0 });
  const [popupStatusStats, setPopupStatusStats] = useState<PopupStatusStats>({ inProgress: 0, scheduled: 0, ended: 0 });
  const [viewsData, setViewsData] = useState<ViewsData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState("전체");

  useEffect(() => {
    if (popups) {
      // 승인 현황 계산
      const stats: ApprovalStats = {
        approved: popups.filter((p) => p.approvalStatus === "APPROVED").length,
        pending: popups.filter((p) => p.approvalStatus === "PENDING").length,
        rejected: popups.filter((p) => p.approvalStatus === "REJECTED").length,
      };
      setApprovalStats(stats);

      // 팝업 현황 계산 (날짜 기준)
      const now = new Date();
      const statusStats: PopupStatusStats = {
        inProgress: popups.filter((p) => {
          if (!p.startDate || !p.endDate) return false;
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          return start <= now && now <= end;
        }).length,
        scheduled: popups.filter((p) => {
          if (!p.startDate) return false;
          const start = new Date(p.startDate);
          return start > now;
        }).length,
        ended: popups.filter((p) => {
          if (!p.endDate) return false;
          const end = new Date(p.endDate);
          return end < now;
        }).length,
      };
      setPopupStatusStats(statusStats);

      // 조회수 차트 데이터 (상위 3개 팝업)
      const topPopups = [...popups]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3);
      const chartData: ViewsData[] = topPopups.map((p) => ({
        name: p.title.length > 15 ? p.title.substring(0, 15) + "..." : p.title,
        dailyViews: Math.floor((p.viewCount || 0) * 0.6), // 임시: 총 조회수의 60%를 1일 조회수로 가정
        totalViews: p.viewCount || 0,
      }));
      setViewsData(chartData);
    }
  }, [popups]);

  const filteredPopups = React.useMemo(() => {
    if (!popups) return [];
    if (currentFilter === "전체") return popups;
    const now = new Date();
    if (currentFilter === "진행 중") {
      return popups.filter((p) => {
        if (!p.startDate || !p.endDate) return false;
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        return start <= now && now <= end;
      });
    }
    if (currentFilter === "예정 중") {
      return popups.filter((p) => {
        if (!p.startDate) return false;
        const start = new Date(p.startDate);
        return start > now;
      });
    }
    if (currentFilter === "종료") {
      return popups.filter((p) => {
        if (!p.endDate) return false;
        const end = new Date(p.endDate);
        return end < now;
      });
    }
    return popups;
  }, [popups, currentFilter]);

  const popupTableColumns = [
    {
      key: "title",
      header: "팝업명",
      render: (item: PopupSummary) => item.title,
    },
    {
      key: "status",
      header: "운영 상태",
      render: (item: PopupSummary) => {
        if (!item.startDate || !item.endDate) return "-";
        const now = new Date();
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        if (start <= now && now <= end) {
          return <span className="text-green-600 font-medium">진행 중</span>;
        }
        if (start > now) {
          return <span className="text-yellow-600 font-medium">오픈 예정</span>;
        }
        return "-";
      },
    },
    {
      key: "createdAt",
      header: "등록 일시",
      render: (item: PopupSummary) => {
        if (!item.createdAt) return "-";
        const d = new Date(item.createdAt);
        return isNaN(d.getTime()) ? "-" : d.toLocaleString("ko-KR");
      },
    },
    {
      key: "period",
      header: "운영 기간",
      render: (item: PopupSummary) => {
        if (!item.startDate || !item.endDate) return "-";
        return `${item.startDate} ~ ${item.endDate}`;
      },
    },
    {
      key: "approvalStatus",
      header: "승인 상태",
      render: (item: PopupSummary) => {
        const statusMap = {
          APPROVED: { text: "완료", className: "text-green-600 bg-green-50" },
          PENDING: { text: "대기", className: "text-yellow-600 bg-yellow-50" },
          REJECTED: { text: "반려", className: "text-red-600 bg-red-50" },
        };
        const statusInfo = statusMap[item.approvalStatus] || statusMap.PENDING;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.text}
          </span>
        );
      },
    },
    {
      key: "rejectionReason",
      header: "반려 사유",
      render: (item: PopupSummary) => {
        if (item.approvalStatus === "REJECTED") {
          return <span className="text-gray-500">-</span>; // TODO: 반려 사유 필드 추가 필요
        }
        return "-";
      },
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">판매자 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">내 팝업 현황과 통계를 확인하세요.</p>
      </header>

      {/* 승인 현황 카드 */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="승인 완료"
          value={approvalStats.approved}
          icon={CheckCircle2}
          theme="success"
        />
        <StatCard
          title="승인 대기"
          value={approvalStats.pending}
          icon={Clock}
          theme="warning"
        />
        <StatCard
          title="승인 반려"
          value={approvalStats.rejected}
          icon={XCircle}
          theme="danger"
        />
      </section>

      {/* 팝업 현황 카드 */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="진행 중"
          value={popupStatusStats.inProgress}
          icon={TrendingUp}
          theme="success"
        />
        <StatCard
          title="예정 중"
          value={popupStatusStats.scheduled}
          icon={Calendar}
          theme="warning"
        />
        <StatCard
          title="종료"
          value={popupStatusStats.ended}
          icon={XCircle}
          theme="danger"
        />
      </section>

      {/* 조회수 차트 */}
      {viewsData.length > 0 && (
        <section>
          <ViewsChart data={viewsData} />
        </section>
      )}

      {/* 팝업 관리 테이블 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">팝업 관리</h2>
          <a
            href="/seller/popups"
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
          >
            + 팝업 등록
          </a>
        </div>
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-500">
            로딩 중...
          </div>
        ) : (
          <DataTable
            columns={popupTableColumns}
            data={filteredPopups}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredPopups.length / 10)}
            onPageChange={setCurrentPage}
            filterOptions={[
              { label: "전체", value: "전체" },
              { label: "진행 중", value: "진행 중" },
              { label: "예정 중", value: "예정 중" },
              { label: "종료", value: "종료" },
            ]}
            onFilterChange={setCurrentFilter}
            currentFilter={currentFilter}
          />
        )}
      </section>
    </div>
  );
}
