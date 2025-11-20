import { useEffect, useMemo, useState } from "react";
import { FileText, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePopups } from "../../hooks/usePopups";

const STATUS_LABELS = {
  APPROVED: "승인 완료",
  PENDING: "승인 대기",
  REJECTED: "승인 반려",
};

const FILTER_OPTIONS = [
  { value: "전체", label: "전체" },
  { value: "APPROVED", label: "승인 완료" },
  { value: "PENDING", label: "승인 대기" },
  { value: "REJECTED", label: "승인 반려" },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function PopupManagement() {
  const navigate = useNavigate();
  const { data, loading, error } = usePopups();
  const popups = Array.isArray(data) ? data : [];

  const [filter, setFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [reasonModal, setReasonModal] = useState({ open: false, message: "" });

  const ITEMS_PER_PAGE = 5;

  const { filtered, summary } = useMemo(() => {
    const counts = {
      total: popups.length,
      approved: 0,
      pending: 0,
      rejected: 0,
    };

    const list = popups.map(item => {
      const status = item.status ?? "PENDING";
      if (status === "APPROVED") counts.approved += 1;
      else if (status === "REJECTED") counts.rejected += 1;
      else counts.pending += 1;

      return {
        ...item,
        status,
        createdAtFormatted: formatDate(item.createdAt),
        period: item.startDate && item.endDate ? `${item.startDate} ~ ${item.endDate}` : "-",
        approvalLabel: STATUS_LABELS[status] ?? status,
        rejectionReason:
          item.rejectionReason ??
          (status === "REJECTED" ? "관리자 반려 사유가 아직 등록되지 않았습니다." : null),
      };
    });

    const filteredList = filter === "전체" ? list : list.filter(item => item.status === filter);

    return {
      filtered: filteredList,
      summary: counts,
    };
  }, [popups, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const visible = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const handleFilterChange = event => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  const openReasonModal = message => {
    setReasonModal({ open: true, message: message || "사유가 입력되지 않았습니다." });
  };

  const closeReasonModal = () => {
    setReasonModal({ open: false, message: "" });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
        팝업 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        팝업 정보를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">팝업 관리</h1>
          <p className="text-sm text-gray-500">등록된 팝업 현황을 조회하고 승인 상태를 확인하세요.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/seller/popup/create")}
          className="inline-flex items-center gap-2 rounded-full bg-[#eb0000] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d10000]"
        >
          <PlusCircle className="h-4 w-4" />
          신규 팝업 등록
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500">총 팝업</p>
          <p className="text-xl font-semibold text-gray-900">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500">승인 완료</p>
          <p className="text-xl font-semibold text-emerald-600">{summary.approved}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500">승인 대기</p>
          <p className="text-xl font-semibold text-amber-600">{summary.pending}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500">승인 반려</p>
          <p className="text-xl font-semibold text-red-600">{summary.rejected}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">팝업 목록</h2>
          <div className="relative w-full max-w-xs">
            <select
              value={filter}
              onChange={handleFilterChange}
              className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#eb0000] focus:outline-none focus:ring-2 focus:ring-[#eb0000]/20"
            >
              {FILTER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              ▼
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="py-3">팝업명</th>
                <th>운영 기간</th>
                <th>등록 일시</th>
                <th>승인 상태</th>
                <th>관심</th>
                <th>조회</th>
                <th>반려 사유</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {visible.map(popup => (
                <tr key={popup.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{popup.title}</p>
                    <p className="text-xs text-gray-500">셀 {popup.cellName ?? "미배정"}</p>
                  </td>
                  <td className="text-xs text-gray-600">{popup.period}</td>
                  <td className="text-xs text-gray-600">{popup.createdAtFormatted}</td>
                  <td className="text-xs font-semibold">
                    <span
                      className={
                        popup.status === "APPROVED"
                          ? "text-emerald-600"
                          : popup.status === "REJECTED"
                          ? "text-red-600"
                          : "text-amber-600"
                      }
                    >
                      {popup.approvalLabel}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600">{popup.favoriteCount ?? 0}</td>
                  <td className="text-xs text-gray-600">{popup.viewCount ?? 0}</td>
                  <td className="text-xs text-gray-600">
                    {popup.rejectionReason ? (
                      <button
                        type="button"
                        onClick={() => openReasonModal(popup.rejectionReason)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600 transition hover:border-[#eb0000] hover:text-[#eb0000]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        보기
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                    조건에 해당하는 팝업이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`rounded border px-3 py-1 transition hover:border-[#eb0000] hover:text-[#eb0000] ${
                currentPage === 1 ? "cursor-not-allowed opacity-40" : ""
              }`}
            >
              이전
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`rounded border px-3 py-1 transition hover:border-[#eb0000] hover:text-[#eb0000] ${
                currentPage === totalPages ? "cursor-not-allowed opacity-40" : ""
              }`}
            >
              다음
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {filtered.length > 0 ? (
              <>
                총 {filtered.length}개 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1} -
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}개 표시
              </>
            ) : (
              "총 0개"
            )}
          </p>
        </div>
      </section>

      {reasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">반려 사유</h3>
            <p className="mt-4 whitespace-pre-line text-sm text-gray-600">{reasonModal.message}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeReasonModal}
                className="rounded-full bg-[#eb0000] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#d10000]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

