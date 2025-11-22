// src/components/seller/SellerHeader.jsx

import { Bell, Mail, PlusCircle, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const sellerPageMeta = [
  { match: "/seller/dashboard", title: "대시보드", subtitle: "오늘의 셀러 현황" },
  { match: "/seller/popups", title: "팝업 관리", subtitle: "팝업 신청 상태를 확인하세요" },
  { match: "/seller/popup", title: "팝업 등록", subtitle: "새로운 팝업을 등록합니다" },
  { match: "/seller/schedule", title: "일정 관리", subtitle: "운영 일정을 정리하세요" },
  { match: "/seller/reviews", title: "리뷰 관리", subtitle: "고객 피드백을 모아보세요" },
  { match: "/seller/messages", title: "메세지함", subtitle: "문의와 답변을 관리합니다" },
  { match: "/seller/notices", title: "공지사항", subtitle: "중요 공지사항을 확인하세요" },
  { match: "/seller/info", title: "내 정보", subtitle: "계정과 프로필을 관리하세요" },
  { match: "/seller/location", title: "위치 설정", subtitle: "희망 입점 지역을 선택하세요" },
  { match: "/seller/profile", title: "프로필 편집", subtitle: "브랜드 정보를 최신으로" },
];

const getPageMeta = (pathname) =>
  sellerPageMeta.find((page) => pathname.startsWith(page.match)) ?? {
    title: "셀러 센터",
    subtitle: "운영 현황을 한눈에 확인하세요",
  };

export default function SellerHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = getPageMeta(location.pathname);

  return (
    <header className="sticky top-0 z-10 flex h-[84px] w-full items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">Seller Center</p>
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{meta.title}</h1>
          <span className="text-sm text-gray-500">{meta.subtitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="hidden items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 focus-within:border-[#D90429] focus-within:text-gray-900 md:flex">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="search"
            aria-label="Seller center search"
            placeholder="검색"
            className="w-40 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={() => navigate("/seller/popup/create")}
          className="inline-flex items-center gap-2 rounded-full bg-[#D90429] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#d90429]/40 transition hover:bg-[#bf0322]"
        >
          <PlusCircle className="h-4 w-4" />
          새 팝업 등록
        </button>

        <button
          type="button"
          className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-[#D90429] hover:text-[#D90429]"
        >
          <Mail className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-[#D90429] hover:text-[#D90429]"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold uppercase text-white">
          DA
        </div>
      </div>
    </header>
  );
}
