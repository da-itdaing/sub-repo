import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { getNoticeById, deleteNotice, getMyPopups } from '@/services/sellerService';
import { useToast } from '@/hooks/useToast';

const SellerNoticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // 공지사항 상세 조회
  const { data: notice, isLoading, error } = useQuery({
    queryKey: ['notice', id],
    queryFn: () => getNoticeById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  // 팝업 목록 조회 (팝업명 매핑용)
  const { data: popups = [] } = useQuery({
    queryKey: ['myPopups'],
    queryFn: getMyPopups,
    staleTime: 5 * 60 * 1000,
  });

  // 공지사항 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotices'] });
      addToast({ title: '공지사항이 삭제되었습니다.' });
      navigate(ROUTES.seller.notices);
    },
    onError: (err) => {
      addToast({ 
        title: '삭제 실패', 
        description: err.message,
        variant: 'error' 
      });
    },
  });

  // 팝업명 조회
  const popupName = notice?.popupId 
    ? popups.find((p) => p.id === notice.popupId)?.title || notice.popupName || '전체'
    : notice?.popupName || '전체';

  // 날짜 포맷
  const formattedDate = notice?.createdAt 
    ? notice.createdAt.split('T')[0] 
    : notice?.date || '-';

  const handleDelete = () => {
    if (window.confirm('이 공지사항을 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/80 bg-white p-8 shadow-sm shadow-slate-200/60">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              공지사항을 찾을 수 없습니다
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              해당 공지사항이 삭제되었거나 존재하지 않습니다.
            </p>
            <button
              onClick={() => navigate(ROUTES.seller.notices)}
              className="rounded-lg bg-gray-500 px-6 py-2 text-sm font-bold text-white hover:bg-gray-600"
            >
              목록으로 돌아가기
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="rounded-3xl border border-white/80 bg-white p-8 shadow-sm shadow-slate-200/60">
        <h2 className="mb-6 text-xl font-bold text-[#EB0000]">공지사항</h2>
        
        <div className="border-b border-gray-200 pb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {(notice.isImportant || notice.important) && (
              <span className="rounded-full border border-[#EB0000] px-2 py-0.5 text-xs font-bold text-[#EB0000]">
                중요
              </span>
            )}
            <span className="font-bold text-gray-900">{popupName}</span>
            <span className="h-3 w-px bg-gray-300"></span>
            <span className="font-medium text-gray-900">{notice.title}</span>
            <span className="ml-auto text-xs text-gray-500">{formattedDate}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6 min-h-[400px] rounded-xl border border-gray-200 bg-white p-8 text-gray-700">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
            {notice.content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate(ROUTES.seller.notices)}
            className="rounded-lg bg-[#333333] px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1f1f1f] transition-colors"
          >
            목록보기
          </button>
          <button
            onClick={() => navigate(ROUTES.seller.noticeEdit(notice.id), { state: { notice } })}
            className="rounded-lg bg-[#EB0000] px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#c90000] transition-colors"
          >
            수정하기
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-lg border border-red-300 bg-white px-8 py-2.5 text-sm font-bold text-red-600 shadow-sm hover:bg-red-50 transition-colors disabled:opacity-70"
          >
            {deleteMutation.isPending ? '삭제 중...' : '삭제하기'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellerNoticeDetailPage;
