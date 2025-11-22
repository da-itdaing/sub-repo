// src/components/seller/PopupFilterSelect.jsx
import { useState, useRef, useEffect } from "react";

const OPTIONS = [
  { type: "item", value: "ALL", label: "전체" },

  { type: "divider" },

  { type: "section", label: "운영 상태" },
  { type: "item", value: "IN_PROGRESS", label: "진행 중" },
  { type: "item", value: "UPCOMING", label: "오픈 예정" },
  { type: "item", value: "ENDED", label: "종료" },
  { type: "item", value: "OPER_NONE", label: "-" },

  { type: "divider" },

  { type: "section", label: "승인 상태" },
  { type: "item", value: "APPROVAL_COMPLETE", label: "완료" },
  { type: "item", value: "APPROVAL_PENDING", label: "대기" },
  { type: "item", value: "APPROVAL_REJECTED", label: "반려" },
];

const VALUE_TO_LABEL = OPTIONS.reduce((acc, opt) => {
  if (opt.type === "item") acc[opt.value] = opt.label;
  return acc;
}, {});

export default function PopupFilterSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLabel = VALUE_TO_LABEL[value] ?? "전체";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="min-w-[120px] h-9 px-3 rounded-full border border-gray-300 bg-white flex items-center justify-between text-sm hover:border-[#e21f1f] focus:outline-none"
      >
        <span className="truncate">{currentLabel}</span>
        <span className="ml-2 text-xs text-gray-500">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 max-h-64 overflow-y-auto bg-white border border-[#e21f1f] rounded-xl shadow-lg text-sm z-20">
          {OPTIONS.map((opt, idx) => {
            if (opt.type === "divider") {
              return (
                <div
                  key={`divider-${idx}`}
                  className="h-px bg-dashed border-t border-dashed border-gray-200 mx-3 my-1"
                />
              );
            }

            if (opt.type === "section") {
              return (
                <div
                  key={`section-${opt.label}-${idx}`}
                  className="px-4 py-2 text-xs text-gray-400"
                >
                  {opt.label}
                </div>
              );
            }

            const isSelected = value === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2 hover:bg-[#fff0f0] ${
                  isSelected ? "bg-[#ffe5e5] text-[#e21f1f] font-semibold" : ""
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
