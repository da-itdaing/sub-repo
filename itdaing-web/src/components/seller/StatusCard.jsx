// src/components/seller/StatusCard.jsx
export default function StatusCard({ label, value, variant = "default" }) {
  const variantStyles = {
    default: "border-gray-200 text-gray-800",
    success: "border-[#4caf50]/40 bg-[#e8f5e9] text-[#2e7d32]",
    warning: "border-[#ffb300]/40 bg-[#fff8e1] text-[#f57f17]",
    danger: "border-[#f44336]/40 bg-[#ffebee] text-[#c62828]",
    primary: "border-[#1976d2]/40 bg-[#e3f2fd] text-[#0d47a1]",
    info: "border-[#0288d1]/40 bg-[#e1f5fe] text-[#01579b]",
    muted: "border-gray-300 bg-[#fafafa] text-gray-700",
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border shadow-sm bg-white ${variantStyles[variant]}`}
    >
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="mt-1 text-2xl font-semibold">{value}</span>
      </div>
    </div>
  );
}
