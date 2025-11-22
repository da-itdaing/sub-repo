// src/components/seller/RejectionModal.jsx
export default function RejectionModal({ open, reason, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-[460px] max-w-[90vw] px-8 py-7">
        <h2 className="text-[22px] font-bold text-[#e21f1f] mb-4">
          반려 사유
        </h2>

        <div className="border border-gray-200 rounded-lg p-4 mb-6 min-h-[140px] text-sm text-gray-800 whitespace-pre-wrap">
          {reason}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#e21f1f] text-white font-semibold text-sm hover:bg-[#c41818] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
