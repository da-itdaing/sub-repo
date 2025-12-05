import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Save } from 'lucide-react';
import { SellerPopupFormPage } from '@/pages/seller/SellerPopupCreatePage';

/**
 * 팝업 수정 모달 컴포넌트
 * - 관리자(ADMIN) 또는 팝업 소유자(SELLER)가 상세 페이지에서 팝업을 수정할 때 사용
 * - SellerPopupFormPage 컴포넌트를 재사용하여 수정 폼을 렌더링
 */
const PopupEditModal = ({ popupId, onClose, onSuccess }) => {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // 모달이 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose, isSubmitting]);

  // 배경 클릭 시 모달 닫기
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // 폼 제출 상태 변경 콜백
  const handleSubmitStateChange = useCallback((submitting) => {
    setIsSubmitting(submitting);
  }, []);

  // 수정 완료 콜백
  const handleSuccess = useCallback(() => {
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
    onClose();
  }, [onSuccess, onClose]);

  // 외부에서 폼 제출 트리거
  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-4xl mx-4 my-8 md:my-16">
        {/* 모달 헤더 - 고정 */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl bg-white px-6 py-4 shadow-sm border-b">
          <h2 id="edit-modal-title" className="text-lg font-bold text-gray-900">
            팝업 수정
          </h2>
          <div className="flex items-center gap-2">
            {/* 저장 버튼 */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#EB0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c90000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 transition-colors"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 모달 본문 */}
        <div className="rounded-b-2xl bg-gray-50 p-4 md:p-6">
          <SellerPopupFormPage
            mode="edit"
            popupIdOverride={popupId}
            onSuccessOverride={handleSuccess}
            hideActionButtons={true}
            formRef={formRef}
            onSubmitStateChange={handleSubmitStateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PopupEditModal;



