interface LoginConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: "favorite" | "review" | "mypage"; // mypage 타입 추가
}

export function LoginConfirmDialog({ isOpen, onClose, onConfirm, type = "favorite" }: LoginConfirmDialogProps) {
  if (!isOpen) return null;

  const messages = {
    favorite: {
      description: "관심 팝업을 저장하려면 로그인이 필요합니다.\n로그인 하시겠습니까?"
    },
    review: {
      description: "후기를 작성하려면 로그인이 필요합니다.\n로그인 하시겠습니까?"
    },
    mypage: {
      description: "마이페이지를 이용하려면 로그인이 필요합니다.\n로그인 하시겠습니까?"
    }
  };

  const currentMessage = messages[type];
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 다이얼로그 */}
      <div className="relative bg-white rounded-[20px] shadow-2xl p-8 w-[90%] max-w-[400px] animate-in fade-in zoom-in duration-200">
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#eb0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* 제목 */}
        <h3 className="text-center mb-4">
          <span className="font-['Pretendard:Bold',sans-serif] text-xl text-black">
            로그인이 필요합니다
          </span>
        </h3>

        {/* 설명 */}
        <p className="text-center mb-8">
          <span className="font-['Pretendard:Regular',sans-serif] text-[15px] text-[#666]">
            {currentMessage.description}
          </span>
        </p>

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-[10px] border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <span className="font-['Pretendard:Medium',sans-serif] text-[16px] text-gray-700">
              취소
            </span>
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-[10px] bg-[#eb0000] hover:bg-[#d00000] transition-colors shadow-md flex items-center justify-center"
          >
            <span className="font-['Pretendard:Bold',sans-serif] text-[16px] text-white">
              로그인
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
