import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Eye, Heart, Edit3, Trash2, Layers, Tag } from 'lucide-react';

import { getPopupById } from '@/services/popupService';
import { deletePopup } from '@/services/sellerService';
import { ROUTES } from '@/routes/paths';
import { useToast } from '@/hooks/useToast';
import { SellerPopupFormPage } from '@/pages/seller/SellerPopupCreatePage';

const formatDateRange = (start, end) => {
  if (!start || !end) return '일정 미정';
  return `${start.replace(/-/g, '.')} ~ ${end.replace(/-/g, '.')}`;
};

const normalizeImage = (image) => {
  if (!image) return null;
  if (typeof image === 'string') {
    return { url: image, key: image };
  }
  if (image.url) {
    return { url: image.url, key: image.key || image.url };
  }
  if (image.thumbnailUrl) {
    return { url: image.thumbnailUrl, key: image.key || image.thumbnailUrl };
  }
  return null;
};

const SellerPopupDetailPage = () => {
  const { popupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const formRef = useRef(null);

  const { data: popup, isLoading, error } = useQuery({
    queryKey: ['sellerPopupDetail', popupId, 'view'],
    queryFn: () => getPopupById(popupId),
    enabled: Boolean(popupId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePopup(Number(popupId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPopups'] });
      queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] });
      addToast({ title: '팝업이 삭제되었습니다.' });
      navigate(ROUTES.seller.popups);
    },
    onError: (mutationError) => {
      addToast({
        title: '삭제 실패',
        description: mutationError?.message ?? '잠시 후 다시 시도해주세요.',
        variant: 'error',
      });
    },
  });

  const heroImage = useMemo(() => {
    const candidate =
      popup?.thumbnailImage ||
      popup?.heroImage ||
      popup?.thumbnail ||
      popup?.thumbnailImageUrl;
    return normalizeImage(candidate);
  }, [popup]);

  const galleryImages = useMemo(() => {
    const list = popup?.gallery || popup?.images || popup?.imageUrls || [];
    if (!Array.isArray(list)) return [];
    return list
      .map((item, index) => normalizeImage(item) ?? normalizeImage({ url: item, key: `${index}` }))
      .filter(Boolean);
  }, [popup]);

  const handleDelete = () => {
    if (deleteMutation.isPending) return;
    const confirmed = window.confirm('선택한 팝업을 삭제할까요? 삭제된 팝업은 복구할 수 없습니다.');
    if (confirmed) {
      deleteMutation.mutate();
    }
  };
  
  const handleInlineSuccess = () => {
    setIsEditing(false);
    queryClient.invalidateQueries({ queryKey: ['sellerPopupDetail', popupId, 'view'] });
    queryClient.invalidateQueries({ queryKey: ['myPopups'] });
  };

  const handleInlineSubmit = () => {
    if (inlineSubmitting) return;
    formRef.current?.requestSubmit();
  };

  const handleCancelEdit = () => {
    if (inlineSubmitting) return;
    setIsEditing(false);
  };

  if (!popupId) {
    return (
      <div className="p-12 text-center text-red-500">유효하지 않은 접근입니다.</div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500">팝업 정보를 불러오는 중입니다...</div>
    );
  }

  if (error || !popup) {
    return (
      <div className="p-12 text-center text-red-500">
        팝업 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                팝업 수정
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">{popup.title}</h1>
              <p className="text-sm text-gray-500">필요한 내용을 수정한 뒤 완료 버튼을 눌러주세요.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={inlineSubmitting}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleInlineSubmit}
                className="inline-flex items-center gap-1 rounded-xl bg-[#EB0000] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#c90000] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={inlineSubmitting}
              >
                {inlineSubmitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </section>

        <SellerPopupFormPage
          mode="edit"
          popupIdOverride={popupId}
          hideActionButtons
          formRef={formRef}
          onSuccessOverride={handleInlineSuccess}
          onSubmitStateChange={setInlineSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/3">
            <div className="aspect-4/3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {heroImage ? (
                <img src={heroImage.url} alt={popup.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  대표 이미지가 없습니다.
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  팝업 정보
                </p>
                <h1 className="mt-1 text-2xl font-bold text-gray-900">{popup.title}</h1>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {popup.status && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                      승인 상태 · {popup.status}
                    </span>
                  )}
                  {popup.runtimeStatus && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                      운영 상태 · {popup.runtimeStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="h-4 w-4" />
                  수정하기
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDateRange(popup.startDate, popup.endDate)}</span>
              </div>
              {popup.hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{popup.hours}</span>
                </div>
              )}
              {popup.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{popup.address}</span>
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {(popup.viewCount ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">조회</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Heart className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {(popup.favoriteCount ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">관심</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <h2 className="text-base font-semibold text-gray-900">세부 정보</h2>
        <div className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
              <Layers className="h-3.5 w-3.5" />
              카테고리 / 셀
            </div>
            <p>
              {popup.categoryTag || (popup.categoryIds?.length ? popup.categoryIds.join(', ') : '카테고리 정보 없음')}
            </p>
            {popup.cellName && (
              <p className="text-xs text-gray-500">
                셀 위치: {popup.cellName}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
              <Tag className="h-3.5 w-3.5" />
              태그 / 스타일
            </div>
            <div className="flex flex-wrap gap-2">
              {(popup.styleTags || popup.hashtags || []).length === 0 && (
                <span className="text-gray-400">등록된 태그가 없습니다.</span>
              )}
              {popup.styleTags?.map((style) => (
                <span key={style} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  #{style}
                </span>
              ))}
              {Array.isArray(popup.hashtags) &&
                popup.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {popup.description && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900">소개</h3>
            <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {popup.description}
            </p>
          </div>
        )}
      </section>

      {galleryImages.length > 0 && (
        <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <h2 className="text-base font-semibold text-gray-900">이미지</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {galleryImages.map((image) => (
              <div key={image.key} className="overflow-hidden rounded-2xl border border-gray-100">
                <img src={image.url} alt={popup.title} className="h-40 w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SellerPopupDetailPage;

