import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";   // ⭐ 추가됨

export default function SellerDashboard() {
  // ===========================
  // ⭐ 페이지 이동(useNavigate)
  // ===========================
  const navigate = useNavigate();

  // ===========================
  // 데이터
  // ===========================

  const popupViews = [
    { name: "여울원 팝업 IN 광주", daily: 371, total: 587 },
    { name: "총장 라운 페스타", daily: 264, total: 1340 },
    { name: "[중장년 남성] 집밥에 진심인 남자들", daily: 112, total: 741 },
  ];

  const approvalStats = [
    { label: "승인 완료", value: 7 },
    { label: "승인 대기", value: 3 },
    { label: "승인 반려", value: 4 },
  ];

  const popupStats = [
    { label: "진행 중", value: 2 },
    { label: "예정 중", value: 1 },
    { label: "종료", value: 4 },
  ];

  const popupList = [
    {
      name: "여울원 팝업 IN 광주",
      status: "진행 중",
      createdAt: "2025-10-25",
      period: "2025-10-31 ~ 2025-11-13",
      approval: "완료",
      reason: "-",
    },
    {
      name: "총장 라운 페스타",
      status: "진행 중",
      createdAt: "2025-04-20",
      period: "2025-04-26 ~ 2025-12-31",
      approval: "완료",
      reason: "-",
    },
    {
      name: "[중장년 남성] 집밥에 진심인 남자들",
      status: "오픈 예정",
      createdAt: "2025-11-01",
      period: "2025-11-05 ~ 2025-12-10",
      approval: "완료",
      reason: "-",
    },
    {
      name: "광주 충장로 플리마켓 셀러 모집",
      status: "-",
      createdAt: "2025-11-11",
      period: "2025-11-15",
      approval: "반려",
      reason: "서류 불충분",
    },
    {
      name: "ACC 공동기획 플리마켓",
      status: "-",
      createdAt: "2025-12-01",
      period: "2025-12-06 ~ 2025-12-07",
      approval: "대기",
      reason: "-",
    },
  ];

  // ===========================
  // 필터
  // ===========================
  const [filter, setFilter] = useState("전체");

  const filteredList = popupList.filter((item) => {
    if (filter === "전체") return true;

    if (
      filter === "진행 중" ||
      filter === "오픈 예정" ||
      filter === "종료" ||
      filter === "-"
    ) {
      return item.status === filter;
    }

    if (filter === "완료" || filter === "대기" || filter === "반려") {
      return item.approval === filter;
    }

    return true;
  });

  // ===========================
  // 페이지네이션
  // ===========================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (currentPage > totalPages && totalPages !== 0) {
    setCurrentPage(1);
  }

  // ===========================
  // 반려 사유 모달
  // ===========================
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState("");

  const openReasonModal = (reason) => {
    if (reason === "-") return;
    setReasonText(reason);
    setReasonModalOpen(true);
  };

  // ===========================
  // UI
  // ===========================

  return (
    <div className="w-full text-gray-900">

      <div className="grid grid-cols-3 grid-rows-[auto_auto_1fr] gap-6 mb-8">

        {/* 승인 현황 */}
        <section className="col-span-1 row-span-1 p-5 bg-white border border-gray-100 shadow-md rounded-xl">
          <h3 className="text-[16px] font-semibold text-[#e21f1f] mb-3">
            승인 현황
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {approvalStats.map((item) => (
              <div
                key={item.label}
                className="flex flex-col justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
              >
                <span className="text-[13px] text-gray-600 mb-2">
                  {item.label}
                </span>
                <span className="text-[22px] font-bold text-[#e21f1f]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 조회수 */}
        <section className="col-span-2 row-span-2 p-5 bg-white border border-gray-100 shadow-md rounded-xl">
          <h3 className="text-[16px] font-semibold text-[#e21f1f] mb-3">
            조회수
          </h3>

          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popupViews} barGap={8}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="daily" name="1일 조회수" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="총 조회수" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 팝업 현황 */}
        <section className="col-span-1 row-span-1 p-5 bg-white border border-gray-100 shadow-md rounded-xl">
          <h3 className="text-[16px] font-semibold text-[#e21f1f] mb-3">
            팝업 현황
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {popupStats.map((item) => (
              <div
                key={item.label}
                className="flex flex-col justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
              >
                <span className="text-[13px] text-gray-600 mb-2">
                  {item.label}
                </span>
                <span className="text-[22px] font-bold text-[#333]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ============================= */}
        {/* 팝업 관리 */}
        {/* ============================= */}
        <section className="col-span-3 row-span-1 p-5 bg-white border border-gray-100 shadow-md rounded-xl min-h-[360px]">

          {/* 상단: 제목 + 필터 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#e21f1f]">팝업 관리</h3>

            {/* 필터 셀렉트 */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 pr-10 text-sm border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              >
                <option value="전체">전체</option>

                <option disabled className="text-gray-400">운영 상태</option>
                <option value="진행 중">진행 중</option>
                <option value="오픈 예정">오픈 예정</option>
                <option value="종료">종료</option>
                <option value="-">-</option>

                <option disabled className="text-gray-400">승인 상태</option>
                <option value="완료">완료</option>
                <option value="대기">대기</option>
                <option value="반려">반려</option>
              </select>

              <div className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                ▼
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 border-b border-gray-200">
                  <th className="py-3 text-left">팝업명</th>
                  <th className="text-left">운영 상태</th>
                  <th className="text-left">등록 일시</th>
                  <th className="text-left">운영 기간</th>
                  <th className="text-left">승인 상태</th>
                  <th className="text-left">반려 사유</th>
                </tr>
              </thead>

              <tbody className="text-gray-800">
                {paginatedList.map((row) => (
                  <tr
                    key={row.name}
                    className="transition border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                    onClick={() => openReasonModal(row.reason)}
                  >
                    <td className="py-3">{row.name}</td>
                    <td>{row.status}</td>
                    <td>{row.createdAt}</td>
                    <td>{row.period}</td>

                    <td
                      className={`font-semibold ${
                        row.approval === "완료"
                          ? "text-green-600"
                          : row.approval === "반려"
                          ? "text-red-600"
                          : "text-orange-500"
                      }`}
                    >
                      {row.approval}
                    </td>

                    {/* 반려 사유 아이콘 */}
                    <td onClick={(e) => e.stopPropagation()}>
                      {row.reason !== "-" ? (
                        <button
                          onClick={() => openReasonModal(row.reason)}
                          className="text-gray-600 hover:text-black"
                        >
                          <FileText size={18} />
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============================= */}
          {/* 페이지네이션 + 팝업등록 버튼 */}
          {/* ============================= */}

          <div className="flex items-center justify-between mt-5">
            {/* 페이지네이션 */}
            <div className="flex items-center gap-3 text-gray-600">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={`cursor-pointer hover:text-black ${
                  currentPage === 1 ? "opacity-30 cursor-default" : ""
                }`}
                disabled={currentPage === 1}
              >
                ◀
              </button>

              <span>{currentPage} / {totalPages || 1}</span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={`cursor-pointer hover:text-black ${
                  currentPage === totalPages ? "opacity-30 cursor-default" : ""
                }`}
                disabled={currentPage === totalPages}
              >
                ▶
              </button>
            </div>

            {/* ⭐ 팝업 등록 버튼 */}
            <button
              onClick={() => navigate("/seller/popup/create")}
              className="px-5 py-2 text-white bg-red-500 rounded-md shadow hover:bg-red-600"
            >
              + 팝업 등록
            </button>
          </div>
        </section>
      </div>

      {/* ============================= */}
      {/* 반려 사유 모달 */}
      {/* ============================= */}
      {reasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[450px]">
            <h2 className="text-[18px] font-semibold text-red-600 mb-4">
              반려 사유
            </h2>

            <textarea
              className="w-full h-40 p-3 text-gray-700 border rounded-md resize-none"
              readOnly
              value={reasonText}
            />

            <div className="flex justify-center mt-5">
              <button
                onClick={() => setReasonModalOpen(false)}
                className="px-6 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
