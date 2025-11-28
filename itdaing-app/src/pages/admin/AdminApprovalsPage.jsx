import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, MapPin } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';

// TODO: 추후 백엔드 연동 시 API 응답 스키마에 맞춰 타입/필드 정리 필요
const MOCK_REQUESTS = [
  {
    id: 36,
    popupName: '운암동 예술거리 플리마켓',
    userName: '다잇다잉',
    category: '악세사리',
    district: '북구',
    requestedAt: '2025-11-05',
    status: '대기', // 승인 / 대기 / 반려
    email: 'DaitDaing@gmail.com',
    address: '광주광역시 북구 운암동 923-1',
    periodStart: '2025-11-10',
    periodEnd: '2025-11-14',
    rejectReason: '',
    // 지도 표시를 위한 임시 좌표 (운암동 근처)
    lat: 35.175,
    lng: 126.885,
  },
  {
    id: 35,
    popupName: '한뼘사이',
    userName: '플레이팩토리',
    category: '공연/전시',
    district: '서구',
    requestedAt: '2025-11-04',
    status: '승인',
    email: 'playfactory@example.com',
    address: '광주광역시 서구 상무대로 123',
    periodStart: '2025-11-08',
    periodEnd: '2025-11-12',
    rejectReason: '',
    lat: 35.155,
    lng: 126.855,
  },
  {
    id: 34,
    popupName: '빛고을 미식회',
    userName: '장보고와',
    category: '음식',
    district: '동구',
    requestedAt: '2025-11-01',
    status: '대기',
    email: 'food@example.com',
    address: '광주광역시 동구 제봉로 45',
    periodStart: '2025-11-15',
    periodEnd: '2025-11-20',
    rejectReason: '',
    lat: 35.145,
    lng: 126.920,
  },
  {
    id: 33,
    popupName: '2025 새로운 시작',
    userName: '스타트시작',
    category: '건강, 스포츠',
    district: '광산구',
    requestedAt: '2025-10-31',
    status: '대기',
    email: 'start@example.com',
    address: '광주광역시 광산구 장덕동 321',
    periodStart: '2025-11-05',
    periodEnd: '2025-11-07',
    rejectReason: '',
    lat: 35.190,
    lng: 126.820,
  },
  {
    id: 32,
    popupName: '어린이 음악극 <찡>',
    userName: '극단 새로이',
    category: '공연/전시, 키즈',
    district: '서구',
    requestedAt: '2025-10-31',
    status: '반려',
    email: 'kids@example.com',
    address: '광주광역시 서구 치평동 11',
    periodStart: '2025-11-01',
    periodEnd: '2025-11-03',
    rejectReason: '안전 계획 보완 필요',
    lat: 35.160,
    lng: 126.850,
  },
];

const CATEGORY_OPTIONS = [
  '전체',
  '건강',
  '공연/전시',
  '반려동물',
  '뷰티',
  '스포츠',
  '악세사리',
  '음식',
  '키즈',
  '패션',
];

const DISTRICT_OPTIONS = ['전체', '동구', '서구', '남구', '북구', '광산구'];

const STATUS_OPTIONS = ['전체', '승인', '대기', '반려'];

const PAGE_SIZE = 7;

const getStatusChipClass = (status) => {
  if (status === '승인') return 'bg-emerald-50 text-emerald-700';
  if (status === '대기') return 'bg-amber-50 text-amber-700';
  if (status === '반려') return 'bg-rose-50 text-rose-700';
  return 'bg-gray-50 text-gray-500';
};

const AdminApprovalsPage = () => {
  // 목록/필터 상태
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [districtFilter, setDistrictFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 상세 패널 상태
  const [selectedId, setSelectedId] = useState(MOCK_REQUESTS[0]?.id ?? null);

  // 반려 모달 상태
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasonDraft, setRejectReasonDraft] = useState('');

  // 승인/대기/반려 현황 카운트
  const approvalStats = useMemo(() => {
    const approved = requests.filter((r) => r.status === '승인').length;
    const pending = requests.filter((r) => r.status === '대기').length;
    const rejected = requests.filter((r) => r.status === '반려').length;
    return { approved, pending, rejected };
  }, [requests]);

  // 필터링된 목록 계산
  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return requests.filter((req) => {
      if (categoryFilter !== '전체' && !req.category.includes(categoryFilter)) {
        return false;
      }
      if (districtFilter !== '전체' && req.district !== districtFilter) {
        return false;
      }
      if (statusFilter !== '전체' && req.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      const target = `${req.popupName}${req.userName}${req.address}`.toLowerCase();
      return target.includes(term);
    });
  }, [requests, categoryFilter, districtFilter, statusFilter, searchTerm]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const pagedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  const selectedRequest = requests.find((r) => r.id === selectedId) ?? null;

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSelectRow = (id) => {
    setSelectedId(id);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id ? { ...req, status: '승인', rejectReason: '' } : req
      )
    );
  };

  const openRejectModal = () => {
    if (!selectedRequest) return;
    setRejectReasonDraft(selectedRequest.rejectReason ?? '');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;

    // 간단한 유효성 체크: 이유 미입력 방지
    if (!rejectReasonDraft.trim()) {
      alert('반려 사유를 입력해 주세요.');
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? { ...req, status: '반려', rejectReason: rejectReasonDraft.trim() }
          : req
      )
    );
    setRejectModalOpen(false);
  };

  // 선택된 셀(구역) 표시를 위한 임시 폴리곤 데이터 생성
  // 실제로는 백엔드에서 폴리곤 좌표(path)를 받아와야 함
  const selectedPolygons = useMemo(() => {
    if (!selectedRequest?.lat || !selectedRequest?.lng) return [];
    
    // 중심 좌표 기준으로 작은 사각형 생성 (예시)
    const offset = 0.0005;
    const { lat, lng } = selectedRequest;
    
    return [
      {
        path: [
          { lat: lat + offset, lng: lng - offset },
          { lat: lat + offset, lng: lng + offset },
          { lat: lat - offset, lng: lng + offset },
          { lat: lat - offset, lng: lng - offset },
        ],
        strokeWeight: 2,
        strokeColor: '#eb0000',
        strokeOpacity: 0.8,
        fillColor: '#eb0000',
        fillOpacity: 0.3,
      },
    ];
  }, [selectedRequest]);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* 왼쪽: 승인 현황 + 검수 관리 테이블 */}
      <div className="flex-[2] flex flex-col gap-4 min-w-0">
        {/* 승인 현황 카드 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">승인 완료</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{approvalStats.approved}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">승인 대기</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{approvalStats.pending}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">승인 반려</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{approvalStats.rejected}</p>
            </div>
          </div>
        </section>

        {/* 검수 관리 테이블 영역 */}
        <section className="flex flex-col rounded-3xl border border-gray-100 bg-white shadow-sm">
          {/* 상단 필터 영역 */}
          <header className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#eb0000]">검수 관리</h2>
                {/* <p className="text-xs text-gray-500">팝업 승인 현황을 조회하고 처리할 수 있습니다.</p> */}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-full border border-gray-300 bg-white px-3 text-xs focus:border-primary focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-full border border-gray-300 bg-white px-3 text-xs focus:border-primary focus:outline-none"
                >
                  {DISTRICT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-full border border-gray-300 bg-white px-3 text-xs focus:border-primary focus:outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <div className="relative w-44">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="팝업명/사용자/주소"
                    className="h-9 w-full rounded-full border border-gray-300 bg-gray-50 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                  />
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </header>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-center font-semibold w-14">No.</th>
                  <th className="px-4 py-3 text-left font-semibold">팝업 명</th>
                  <th className="px-4 py-3 text-left font-semibold">사용자 이름</th>
                  <th className="px-4 py-3 text-center font-semibold">카테고리</th>
                  <th className="px-4 py-3 text-center font-semibold">구역</th>
                  <th className="px-4 py-3 text-center font-semibold">신청 일자</th>
                  <th className="px-4 py-3 text-center font-semibold">승인 여부</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-xs text-gray-500"
                    >
                      조건에 맞는 검수 요청이 없습니다.
                    </td>
                  </tr>
                )}
                {pagedRequests.map((req) => {
                  const isActive = req.id === selectedId;
                  return (
                    <tr
                      key={req.id}
                      onClick={() => handleSelectRow(req.id)}
                      className={`cursor-pointer text-[13px] ${
                        isActive ? 'bg-rose-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500">{req.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{req.popupName}</td>
                      <td className="px-4 py-3 text-gray-800">{req.userName}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{req.category}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{req.district}</td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {req.requestedAt}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex min-w-[56px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusChipClass(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 하단 페이지네이션 */}
          <footer className="flex items-center justify-center gap-2 border-t border-gray-100 px-6 py-3 text-xs text-gray-600">
            <button
              type="button"
              onClick={() => handleChangePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handleChangePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </footer>
        </section>
      </div>

      {/* 오른쪽: 상세 사항 */}
      <div className="flex-[1.2] flex flex-col gap-4 min-w-[340px]">
        {/* <h2 className="text-lg font-semibold text-red-600">상세 사항</h2> */}
        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm flex flex-col overflow-hidden h-[740px]">

          {selectedRequest ? (
            <>
              {/* 상세 사항 헤더 (카드 내부로 이동) */}
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-red-600">상세 사항</h2>
              </div>

              {/* 스크롤 가능한 컨텐츠 영역 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* 신청자 정보 */}
                <div>
                  <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
                    신청자 정보
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">사용자 이름</dt>
                      <dd className="font-medium text-gray-900">{selectedRequest.userName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">팝업 명</dt>
                      <dd className="max-w-[200px] text-right text-gray-900">
                        {selectedRequest.popupName}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">이메일</dt>
                      <dd className="text-gray-900">{selectedRequest.email}</dd>
                    </div>
                  </dl>
                </div>

                {/* 신청 사항 */}
                <div>
                  <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
                    신청 사항
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">이용 구역</dt>
                      <dd className="max-w-[220px] text-right text-gray-900">
                        {selectedRequest.address}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">이용 기간</dt>
                      <dd className="text-gray-900">
                        {selectedRequest.periodStart} ~ {selectedRequest.periodEnd}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">카테고리</dt>
                      <dd className="text-gray-900">{selectedRequest.category}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">신청 일자</dt>
                      <dd className="text-gray-900">{selectedRequest.requestedAt}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">승인 여부</dt>
                      <dd>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${getStatusChipClass(
                            selectedRequest.status
                          )}`}
                        >
                          {selectedRequest.status}
                        </span>
                      </dd>
                    </div>
                    {selectedRequest.rejectReason && (
                      <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        <p className="font-semibold">반려 사유</p>
                        <p className="mt-1 whitespace-pre-line">
                          {selectedRequest.rejectReason}
                        </p>
                      </div>
                    )}
                  </dl>
                </div>

                {/* 지도 영역 */}
                <div>
                  <h3 className="flex items-center gap-1.5 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    신청 구역 (Cell)
                  </h3>
                  <div className="mt-3 h-48 w-full overflow-hidden rounded-xl border border-gray-200">
                    {selectedRequest.lat && selectedRequest.lng ? (
                      <KakaoMap
                        center={{ lat: selectedRequest.lat, lng: selectedRequest.lng }}
                        level={3}
                        height="100%"
                        markers={[
                          {
                            lat: selectedRequest.lat,
                            lng: selectedRequest.lng,
                            id: selectedRequest.id,
                          }
                        ]}
                        polygons={selectedPolygons}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-50 text-xs text-gray-400">
                        좌표 정보가 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 하단 액션 버튼 (스크롤 영역 내부로 이동하여 지도 바로 밑에 붙임) */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="min-w-[96px] rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    onClick={openRejectModal}
                    className="min-w-[96px] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                  >
                    반려
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              테이블에서 검수 대상을 선택해 주세요.
            </div>
          )}
        </section>
      </div>

      {/* 반려 사유 입력 모달 */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">반려 사유 입력</h3>
            <p className="mt-1 text-xs text-gray-500">
              반려 사유는 판매자에게 그대로 노출되므로, 구체적이고 친절한 안내 문구로 작성해 주세요.
            </p>
            <textarea
              rows={5}
              value={rejectReasonDraft}
              onChange={(e) => setRejectReasonDraft(e.target.value)}
              className="mt-4 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-primary focus:bg-white focus:outline-none"
              placeholder="예) 안전 계획서 보완 후 재신청 부탁드립니다."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalsPage;
