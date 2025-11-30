import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { 
  getMyPopups, 
  getNoticeById, 
  createNotice, 
  updateNotice 
} from '@/services/sellerService';
import { useToast } from '@/hooks/useToast';

const SellerNoticeCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  const { id } = useParams(); // 수정 모드일 경우 id 존재
  const location = useLocation();
  const passedNotice = location.state?.notice;
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    isImportant: false,
    title: '',
    popupId: '',
    content: '',
    files: [],
  });

  // 내 팝업 목록 조회
  const { data: myPopups = [], isLoading: isLoadingPopups } = useQuery({
    queryKey: ['myPopups'],
    queryFn: getMyPopups,
    staleTime: 5 * 60 * 1000,
  });

  // 수정 모드일 때 공지사항 상세 조회
  const { data: noticeDetail, isLoading: isLoadingNotice } = useQuery({
    queryKey: ['notice', id],
    queryFn: () => getNoticeById(id),
    enabled: isEditMode && !passedNotice,
    staleTime: 2 * 60 * 1000,
  });

  // 공지사항 생성 mutation
  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotices'] });
      addToast({ title: '공지사항이 등록되었습니다.' });
      navigate(ROUTES.seller.notices);
    },
    onError: (err) => {
      addToast({ 
        title: '등록 실패', 
        description: err.message,
        variant: 'error' 
      });
    },
  });

  // 공지사항 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ noticeId, data }) => updateNotice(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotices'] });
      queryClient.invalidateQueries({ queryKey: ['notice', id] });
      addToast({ title: '공지사항이 수정되었습니다.' });
      navigate(ROUTES.seller.notices);
    },
    onError: (err) => {
      addToast({ 
        title: '수정 실패', 
        description: err.message,
        variant: 'error' 
      });
    },
  });

  const selectedPopupName =
    passedNotice?.popupName ||
    myPopups.find((popup) => String(popup.id) === String(formData.popupId))?.title ||
    '';

  // 수정 모드일 때 초기 데이터 로드
  useEffect(() => {
    if (!isEditMode) return;

    const source = passedNotice || noticeDetail;
    if (!source) return;

    setFormData({
      isImportant: Boolean(source.isImportant || source.important),
      title: source.title || '',
      popupId: source.popupId || '',
      content: (source.content || '').trim(),
      files: [],
    });
  }, [isEditMode, passedNotice, noticeDetail]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        files: Array.from(e.target.files),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 필수 항목 체크
    if (!formData.title || !formData.popupId || !formData.content) {
      addToast({ 
        title: '필수 항목을 모두 입력해주세요.', 
        variant: 'warning' 
      });
      return;
    }

    const requestData = {
      popupId: Number(formData.popupId),
      title: formData.title,
      content: formData.content,
      isImportant: formData.isImportant,
    };

    if (isEditMode) {
      updateMutation.mutate({ noticeId: id, data: requestData });
    } else {
      createMutation.mutate(requestData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLoading = isLoadingPopups || (isEditMode && isLoadingNotice && !passedNotice);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white p-8 shadow-sm shadow-slate-200/60">
        <h2 className="mb-8 text-xl font-bold text-[#EB0000]">
          공지사항 {isEditMode ? '수정' : '등록'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 제목 & 중요 체크박스 */}
          <div className="flex items-center gap-6 border-b border-gray-200 pb-6">
            <label className="w-16 text-sm font-bold text-gray-900">제목</label>
            <div className="flex flex-1 items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isImportant"
                  checked={formData.isImportant}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#EB0000] focus:ring-[#EB0000]"
                />
                <span className="text-sm text-gray-600">중요</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="제목을 입력해주세요."
                className="flex-1 border-none bg-transparent p-0 text-sm placeholder:text-gray-400 focus:ring-0"
              />
            </div>
          </div>

          {/* 팝업명 선택 / 표시 */}
          <div className="flex items-center gap-6 border-b border-gray-200 pb-6">
            <label className="w-16 text-sm font-bold text-gray-900">팝업명</label>
            <div className="flex-1">
              {isEditMode ? (
                <div className="inline-flex min-w-[260px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
                  {selectedPopupName || '선택된 팝업'}
                </div>
              ) : (
                <select
                  name="popupId"
                  value={formData.popupId}
                  onChange={handleChange}
                  className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000]"
                >
                  <option value="">팝업 선택</option>
                  {myPopups.map((popup) => (
                    <option key={popup.id} value={popup.id}>
                      {popup.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="flex gap-6 border-b border-gray-200 pb-6">
            <label className="w-16 pt-2 text-sm font-bold text-gray-900">내용</label>
            <div className="flex-1">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="공지사항 본문 내용을 작성해주세요."
                rows={15}
                className="w-full resize-none rounded-xl border border-gray-300 p-4 text-sm placeholder:text-gray-400 focus:border-[#EB0000] focus:outline-none focus:ring-1 focus:ring-[#EB0000]"
              />
            </div>
          </div>

          {/* 첨부파일 */}
          <div className="flex items-center gap-6">
            <label className="w-16 text-sm font-bold text-gray-900">첨부파일</label>
            <div className="flex flex-1 items-center gap-3">
              <div className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-500">
                {formData.files.length > 0
                  ? formData.files.map(f => f.name).join(', ')
                  : ''}
              </div>
              <label className="cursor-pointer rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                <span className="flex items-center gap-1">
                  <div className="rounded-full border border-white p-0.5">
                    <Upload className="h-3 w-3" />
                  </div>
                  첨부
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 작성 버튼 */}
          <div className="flex justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={() => navigate(ROUTES.seller.notices)}
              className="min-w-[120px] rounded-lg bg-gray-500 px-8 py-3 text-base font-bold text-white shadow-md hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] rounded-lg bg-[#EB0000] px-8 py-3 text-base font-bold text-white shadow-md hover:bg-[#c90000] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SellerNoticeCreatePage;
