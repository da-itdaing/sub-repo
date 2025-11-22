// src/components/seller/PopupTableRow.jsx
export default function PopupTableRow({ popup, isLast, onClickReason }) {
  const {
    name,
    operatingStatus,
    registeredAt,
    period,
    approvalStatus,
    rejectionReason,
  } = popup;

  const approvalColor =
    approvalStatus === "완료"
      ? "text-[#2e7d32]"
      : approvalStatus === "대기"
      ? "text-[#f57f17]"
      : approvalStatus === "반려"
      ? "text-[#c62828]"
      : "text-gray-700";

  return (
    <tr
      className={`text-sm ${
        !isLast ? "border-b border-dashed border-gray-200" : ""
      }`}
    >
      <td className="px-5 py-3 align-middle">
        <span className="truncate block max-w-[360px]">{name}</span>
      </td>
      <td className="px-5 py-3 align-middle text-gray-700">
        {operatingStatus}
      </td>
      <td className="px-5 py-3 align-middle text-gray-700">{registeredAt}</td>
      <td className="px-5 py-3 align-middle text-gray-700">{period}</td>
      <td className={`px-5 py-3 align-middle font-medium ${approvalColor}`}>
        {approvalStatus}
      </td>
      <td className="px-5 py-3 align-middle text-center">
        {rejectionReason ? (
          <button
            type="button"
            onClick={() => onClickReason(rejectionReason)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-gray-400 hover:bg-gray-100"
            aria-label="반려 사유 보기"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>
    </tr>
  );
}
