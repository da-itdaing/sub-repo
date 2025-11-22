export default function SellerDashboard() {
  return (
    <div className="w-full flex flex-col gap-8">

      {/* ───────────────────────────────────────────────
          상단: 왼쪽(승인/팝업현황 묶음)  +  오른쪽(조회수 그래프)
      ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">

        {/* 왼쪽 영역 전체 */}
        <div className="col-span-1 flex flex-col gap-6">

          {/* 승인현황 */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-[#e21f1f] font-bold text-lg mb-4">
              승인현황
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-gray-100 rounded-lg text-center">승인 완료</div>
              <div className="p-4 bg-gray-100 rounded-lg text-center">승인 대기</div>
              <div className="p-4 bg-gray-100 rounded-lg text-center">승인 반려</div>
            </div>
          </section>

          {/* 팝업현황 */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-[#e21f1f] font-bold text-lg mb-4">
              팝업현황
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-gray-100 rounded-lg text-center">진행 중</div>
              <div className="p-4 bg-gray-100 rounded-lg text-center">예정 중</div>
              <div className="p-4 bg-gray-100 rounded-lg text-center">종료</div>
            </div>
          </section>

        </div>

        {/* 오른쪽 전체 (조회수 그래프) */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border flex items-center justify-center">
          <span className="text-gray-500 text-lg">
            📊 조회수 그래프 들어가는 영역
          </span>
        </div>

      </div>

      {/* ───────────────────────────────────────────────
          하단: 팝업 관리 전체 박스
      ─────────────────────────────────────────────── */}
      <section className="bg-white p-6 rounded-xl shadow-sm border w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#e21f1f] font-bold text-lg">팝업관리</h2>

          <select className="border p-2 rounded-lg">
            <option>전체</option>
            <option>진행 중</option>
            <option>오픈 예정</option>
            <option>종료</option>
            <option>완료</option>
            <option>반려</option>
          </select>
        </div>

        <table className="w-full border-t text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-3 text-left">팝업명</th>
              <th>운영 상태</th>
              <th>등록 일시</th>
              <th>운영 기간</th>
              <th>승인 상태</th>
              <th>반려 사유</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="py-3">예시 팝업</td>
              <td>진행 중</td>
              <td>2025-01-01</td>
              <td>2025-01-02 ~ 2025-01-20</td>
              <td>완료</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-center mt-6 text-gray-600">
          <button className="px-2">〈</button>
          <span className="px-4">1 / 3</span>
          <button className="px-2">〉</button>
        </div>

        <div className="flex justify-end mt-6">
          <button className="bg-[#e21f1f] text-white py-2 px-5 rounded-lg hover:bg-red-700">
            + 팝업 등록
          </button>
        </div>
      </section>

    </div>
  );
}
