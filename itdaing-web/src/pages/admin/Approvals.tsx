import React, { useEffect, useState } from "react";
import { ClipboardCheck, ShieldCheck, Clock, XCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { approvalService, ApprovalItemResponse } from "../../services/approvalService";

export default function AdminApprovalsPage() {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});
  const [showRejectDialog, setShowRejectDialog] = useState<number | null>(null);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalService.getPendingApprovals(0, 20);
      setPendingApprovals(response.items);
    } catch (error: any) {
      toast.error(error.message || '승인 대기 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: number) => {
    try {
      setProcessingId(approvalId);
      await approvalService.approve(approvalId);
      toast.success('승인 처리되었습니다.');
      await loadPendingApprovals();
    } catch (error: any) {
      toast.error(error.message || '승인 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (approvalId: number) => {
    const reason = rejectReason[approvalId]?.trim();
    if (!reason) {
      toast.error('거부 사유를 입력해주세요.');
      return;
    }

    try {
      setProcessingId(approvalId);
      await approvalService.reject(approvalId, reason);
      toast.success('거부 처리되었습니다.');
      setShowRejectDialog(null);
      setRejectReason({ ...rejectReason, [approvalId]: '' });
      await loadPendingApprovals();
    } catch (error: any) {
      toast.error(error.message || '거부 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  // 통계 계산 (실제로는 별도 API 호출 필요할 수 있음)
  const stats = {
    total: pendingApprovals.length,
    approved: 0, // 실제로는 전체 승인된 항목 수 필요
    pending: pendingApprovals.length,
    rejected: 0, // 실제로는 전체 거부된 항목 수 필요
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">승인 심사 현황</h1>
        <p className="text-sm text-gray-500">등록된 팝업의 행정 심사 · 셀 배정 · 안전 점검 현황을 관리합니다.</p>
      </header>
      
      <section className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <ClipboardCheck className="size-5 text-[#2563eb]" />
          <p className="mt-2 text-sm text-gray-500">전체 신청</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <ShieldCheck className="size-5 text-[#16a34a]" />
          <p className="mt-2 text-sm text-gray-500">승인 완료</p>
          <p className="text-2xl font-semibold">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <Clock className="size-5 text-[#f97316]" />
          <p className="mt-2 text-sm text-gray-500">검토 중</p>
          <p className="text-2xl font-semibold">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <XCircle className="size-5 text-[#ef4444]" />
          <p className="mt-2 text-sm text-gray-500">반려</p>
          <p className="text-2xl font-semibold">{stats.rejected}</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">검토 중인 신청</h2>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">로딩 중...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingApprovals.length === 0 ? (
              <p className="px-6 py-5 text-sm text-gray-500">검토 중인 신청이 없습니다.</p>
            ) : (
              pendingApprovals.map(item => (
                <article key={item.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.targetName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      요청자: {item.requesterLoginId} (ID: {item.requesterId})
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      요청일: {new Date(item.requestedAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {showRejectDialog === item.id ? (
                      <div className="flex flex-col gap-2 flex-1 sm:flex-row sm:items-end">
                        <input
                          type="text"
                          placeholder="거부 사유 입력"
                          value={rejectReason[item.id] || ''}
                          onChange={(e) => setRejectReason({ ...rejectReason, [item.id]: e.target.value })}
                          className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleReject(item.id);
                            } else if (e.key === 'Escape') {
                              setShowRejectDialog(null);
                            }
                          }}
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={processingId === item.id}
                            className="px-3 py-2 rounded-lg bg-[#ef4444] text-white text-xs hover:bg-[#dc2626] disabled:opacity-50"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setShowRejectDialog(null)}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs hover:bg-gray-50"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={processingId === item.id}
                          className="px-4 py-2 rounded-full bg-[#16a34a] text-white text-xs hover:bg-[#15803d] disabled:opacity-50 flex items-center gap-1"
                        >
                          {processingId === item.id ? (
                            <>처리 중...</>
                          ) : (
                            <>
                              <CheckCircle2 className="size-3" />
                              승인
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowRejectDialog(item.id)}
                          disabled={processingId === item.id}
                          className="px-4 py-2 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-xs hover:bg-[#ef4444]/20 disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="size-3" />
                          반려
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
