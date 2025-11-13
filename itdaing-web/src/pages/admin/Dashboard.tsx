import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, MapPin } from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { DataTable } from "../../components/common/DataTable";
import { popupService } from "../../services/popupService";
import { approvalService } from "../../services/approvalService";
import { PopupSummary } from "../../types/popup";
import { ApprovalItemResponse } from "../../services/approvalService";
import { KakaoMapAreaEditor } from "../../components/admin/KakaoMapAreaEditor";
import { masterService } from "../../services/masterService";

interface ApprovalStats {
  approved: number;
  pending: number;
  rejected: number;
}

export default function AdminDashboardPage() {
  const [approvalStats, setApprovalStats] = useState<ApprovalStats>({ approved: 0, pending: 0, rejected: 0 });
  const [reviewItems, setReviewItems] = useState<ApprovalItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArea, setSelectedArea] = useState<string>("북구");
  const [categoriesMap, setCategoriesMap] = useState<Record<number, string>>({});
  const [popupDetailsById, setPopupDetailsById] = useState<Record<number, PopupSummary>>({});

  useEffect(() => {
    loadDashboardData();
  }, [currentPage]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 팝업 목록을 가져와서 승인 상태별로 카운트
      const popups = await popupService.getPopups();
      const stats: ApprovalStats = {
        approved: popups.filter((p) => p.approvalStatus === "APPROVED").length,
        pending: popups.filter((p) => p.approvalStatus === "PENDING").length,
        rejected: popups.filter((p) => p.approvalStatus === "REJECTED").length,
      };
      setApprovalStats(stats);

      // 검수 관리 목록 (승인 대기 목록)
      const approvalList = await approvalService.getPendingApprovals(currentPage - 1, 20);
      setReviewItems(approvalList.items);
      setTotalPages(approvalList.totalPages);

      // 마스터 데이터 - 카테고리 맵 로드
      const categories = await masterService.getCategories();
      const mapById: Record<number, string> = {};
      for (const c of categories) {
        mapById[c.id] = c.name;
      }
      setCategoriesMap(mapById);

      // 승인 대상 팝업 상세 정보 로드 (카테고리/구역 표시용)
      const uniqueTargetIds = Array.from(new Set(approvalList.items.map((i) => i.targetId)));
      if (uniqueTargetIds.length > 0) {
        const details = await Promise.all(
          uniqueTargetIds.map(async (id) => {
            try {
              const detail = await popupService.getPopupById(id);
              return [id, detail] as const;
            } catch {
              return [id, undefined] as const;
            }
          })
        );
        const detailsMap: Record<number, PopupSummary> = {};
        for (const [id, detail] of details) {
          if (detail) {
            detailsMap[id] = detail;
          }
        }
        setPopupDetailsById(detailsMap);
      }
    } catch (error) {
      console.error("대시보드 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const reviewColumns = [
    {
      key: "id",
      header: "No.",
      render: (item: ApprovalItemResponse) => item.id,
    },
    {
      key: "targetName",
      header: "팝업 명",
      render: (item: ApprovalItemResponse) => item.targetName,
    },
    {
      key: "requesterLoginId",
      header: "사용자 이름",
      render: (item: ApprovalItemResponse) => item.requesterLoginId,
    },
    {
      key: "category",
      header: "카테고리",
      render: (item: ApprovalItemResponse) => {
        const detail = popupDetailsById[item.targetId];
        if (!detail || !detail.categoryIds || detail.categoryIds.length === 0) {
          return "-";
        }
        const names = detail.categoryIds
          .map((id) => categoriesMap[id])
          .filter((name): name is string => Boolean(name));
        return names.length > 0 ? names.join(", ") : "-";
      },
    },
    {
      key: "area",
      header: "구역",
      render: (item: ApprovalItemResponse) => {
        const detail = popupDetailsById[item.targetId];
        if (!detail) return "-";
        return detail.cellName || detail.locationName || detail.address || "-";
      },
    },
    {
      key: "requestedAt",
      header: "신청 일자",
      render: (item: ApprovalItemResponse) => new Date(item.requestedAt).toLocaleDateString("ko-KR"),
    },
    {
      key: "currentStatus",
      header: "승인 여부",
      render: (item: ApprovalItemResponse) => {
        const status = item.currentStatus;
        const statusMap = {
          PENDING: { text: "대기", className: "text-yellow-600 bg-yellow-50" },
          APPROVED: { text: "승인", className: "text-green-600 bg-green-50" },
          REJECTED: { text: "반려", className: "text-red-600 bg-red-50" },
        };
        const statusInfo = statusMap[status] || statusMap.PENDING;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.text}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">관리자 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">서비스 전반의 현황과 승인 진행 상황을 한눈에 확인하세요.</p>
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

      {/* 구역 관리 카드 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">구역 관리</h2>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="북구">북구</option>
              <option value="서구">서구</option>
              <option value="남구">남구</option>
              <option value="동구">동구</option>
              <option value="광산구">광산구</option>
            </select>
          </div>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <KakaoMapAreaEditor
              onAreaSelect={() => {}}
            />
          </div>
        </div>

        {/* 검수 관리 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">검수 관리</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">로딩 중...</div>
          ) : (
            <DataTable
              columns={reviewColumns}
              data={reviewItems}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </section>
    </div>
  );
}
