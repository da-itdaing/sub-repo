import { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, MapPin, RefreshCw } from 'lucide-react';
import { Map, Polygon, MapMarker } from 'react-kakao-maps-sdk';
import { useToast } from '@/hooks/useToast';
import { listPendingApprovals, approvePopup, rejectPopup, getPopupDetail } from '@/services/adminService';
import { parseGeoJsonPolygon, listCells } from '@/services/geoZoneService';
import apiClient from '@/api/client';

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
  '플리마켓',
];

const DISTRICT_OPTIONS = ['전체', '동구', '서구', '남구', '북구', '광산구'];

const STATUS_OPTIONS = ['전체', 'APPROVED', 'PENDING', 'REJECTED'];

const PAGE_SIZE = 7;

const getStatusChipClass = (status) => {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700';
  if (status === 'PENDING') return 'bg-amber-50 text-amber-700';
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-700';
  return 'bg-gray-50 text-gray-500';
};

const getStatusLabel = (status) => {
  if (status === 'APPROVED') return '승인';
  if (status === 'PENDING') return '대기';
  if (status === 'REJECTED') return '반려';
  return status;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '-').replace('.', '');
};

const AdminApprovalsPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const location = useLocation();

  // location.state에서 초기 필터 값 수신 (대시보드에서 전달)
  const initialStatusFilter = location.state?.statusFilter || '전체';
  const initialTargetId = location.state?.targetId || null;

  // 필터 상태
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [districtFilter, setDistrictFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 선택된 항목
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPopupDetail, setSelectedPopupDetail] = useState(null);

  // 반려 모달 상태
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasonDraft, setRejectReasonDraft] = useState('');

  // 승인 대기 목록 조회
  const { data: approvalsData, isLoading, refetch } = useQuery({
    queryKey: ['adminApprovals'],
    queryFn: () => listPendingApprovals({ page: 0, size: 100 }),
    staleTime: 60 * 1000,
  });

  const requests = approvalsData?.items || [];

  // 대시보드에서 특정 항목을 클릭해서 온 경우 자동 선택
  useEffect(() => {
    if (initialTargetId && requests.length > 0 && !selectedId) {
      const targetRequest = requests.find((r) => r.targetId === initialTargetId);
      if (targetRequest) {
        setSelectedId(targetRequest.id);
        fetchPopupDetail(targetRequest.targetId);
      }
    }
  }, [initialTargetId, requests, selectedId]);

  // 승인/대기/반려 현황 카운트
  const approvalStats = useMemo(() => {
    const approved = requests.filter((r) => r.currentStatus === 'APPROVED').length;
    const pending = requests.filter((r) => r.currentStatus === 'PENDING').length;
    const rejected = requests.filter((r) => r.currentStatus === 'REJECTED').length;
    return { approved, pending, rejected };
  }, [requests]);

  // 필터링된 목록 계산
  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return requests.filter((req) => {
      // 상태 필터
      if (statusFilter !== '전체' && req.currentStatus !== statusFilter) {
        return false;
      }
      // 검색어 필터
      if (term) {
        const target = `${req.targetName || ''}${req.requesterLoginId || ''}${req.description || ''}`.toLowerCase();
        if (!target.includes(term)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, searchTerm]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const pagedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  const selectedRequest = requests.find((r) => r.id === selectedId) ?? null;

  // 팝업 상세 조회 (zone_cell 위치 정보 포함)
  const fetchPopupDetail = useCallback(async (targetId) => {
    if (!targetId) return;
    try {
      const detail = await getPopupDetail(targetId);
      
      // API 응답 필드명 정규화 (백엔드: latitude/longitude → 프론트: zoneCellLat/zoneCellLng)
      if (detail) {
        detail.zoneCellLat = detail.latitude;
        detail.zoneCellLng = detail.longitude;
        detail.zoneCellId = detail.cellId;
        detail.zoneCellAddress = detail.address || '';
        detail.zoneCellLabel = detail.cellName || '';
      }
      
      // 좌표가 없고 cellId가 있으면 별도 조회
      if (detail?.cellId && !detail.zoneCellLat) {
        try {
          const cellData = await apiClient.get(`/geo/cells/${detail.cellId}`);
          if (cellData) {
            // geometryData에서 좌표 추출
            let lat = cellData.lat;
            let lng = cellData.lng;
            
            if (!lat && cellData.geometryData) {
              try {
                const geo = JSON.parse(cellData.geometryData);
                if (geo.type === 'Point' && geo.coordinates) {
                  lng = geo.coordinates[0];
                  lat = geo.coordinates[1];
                } else if (geo.lat && geo.lng) {
                  lat = geo.lat;
                  lng = geo.lng;
                }
              } catch {}
            }
            
            detail.zoneCellLat = lat;
            detail.zoneCellLng = lng;
            detail.zoneCellAddress = cellData.detailedAddress || detail.zoneCellAddress;
            detail.zoneCellLabel = cellData.label || detail.zoneCellLabel;
          }
        } catch (cellErr) {
          console.warn('zone_cell 정보 조회 실패:', cellErr);
        }
      }
      
      setSelectedPopupDetail(detail);
    } catch (err) {
      console.error('팝업 상세 조회 실패:', err);
      setSelectedPopupDetail(null);
    }
  }, []);

  // 승인 Mutation
  const approveMutation = useMutation({
    mutationFn: (id) => approvePopup(id),
    onSuccess: () => {
      addToast({ title: '승인 처리되었습니다.' });
      queryClient.invalidateQueries({ queryKey: ['adminApprovals'] });
    },
    onError: (error) => {
      addToast({ title: '승인 실패', description: error.message, variant: 'error' });
    },
  });

  // 거부 Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectPopup(id, { reason }),
    onSuccess: () => {
      addToast({ title: '반려 처리되었습니다.' });
      setRejectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminApprovals'] });
    },
    onError: (error) => {
      addToast({ title: '반려 실패', description: error.message, variant: 'error' });
    },
  });

  // 상태 변경 Mutation (PENDING으로 되돌리기 등)
  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/admin/approvals/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      const statusLabel = variables.status === 'PENDING' ? '대기' : variables.status === 'APPROVED' ? '승인' : '반려';
      addToast({ title: `${statusLabel} 상태로 변경되었습니다.` });
      queryClient.invalidateQueries({ queryKey: ['adminApprovals'] });
    },
    onError: (error) => {
      addToast({ title: '상태 변경 실패', description: error.message, variant: 'error' });
    },
  });

  const handleChangeStatus = (newStatus) => {
    if (!selectedRequest) return;
    changeStatusMutation.mutate({ id: selectedRequest.id, status: newStatus });
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSelectRow = (id, targetId) => {
    setSelectedId(id);
    fetchPopupDetail(targetId);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate(selectedRequest.id);
  };

  const openRejectModal = () => {
    if (!selectedRequest) return;
    setRejectReasonDraft('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;
    if (!rejectReasonDraft.trim()) {
      addToast({ title: '반려 사유를 입력해 주세요.', variant: 'error' });
      return;
    }
    rejectMutation.mutate({ id: selectedRequest.id, reason: rejectReasonDraft.trim() });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* 왼쪽: 승인 현황 + 검수 관리 테이블 */}
      <div className="flex-[2] flex flex-col gap-4 min-w-0">
        {/* 승인 현황 카드 - 클릭 시 해당 상태로 필터링 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div 
            className={`flex items-center gap-4 rounded-3xl border px-6 py-4 shadow-sm cursor-pointer transition-all ${
              statusFilter === 'APPROVED' ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200' : 'border-gray-100 bg-white hover:border-emerald-200'
            }`}
            onClick={() => {
              setStatusFilter(statusFilter === 'APPROVED' ? '전체' : 'APPROVED');
              setCurrentPage(1);
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">승인 완료</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{approvalStats.approved}</p>
            </div>
          </div>
          <div 
            className={`flex items-center gap-4 rounded-3xl border px-6 py-4 shadow-sm cursor-pointer transition-all ${
              statusFilter === 'PENDING' ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 'border-gray-100 bg-white hover:border-amber-200'
            }`}
            onClick={() => {
              setStatusFilter(statusFilter === 'PENDING' ? '전체' : 'PENDING');
              setCurrentPage(1);
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">승인 대기</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{approvalStats.pending}</p>
            </div>
          </div>
          <div 
            className={`flex items-center gap-4 rounded-3xl border px-6 py-4 shadow-sm cursor-pointer transition-all ${
              statusFilter === 'REJECTED' ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-200' : 'border-gray-100 bg-white hover:border-rose-200'
            }`}
            onClick={() => {
              setStatusFilter(statusFilter === 'REJECTED' ? '전체' : 'REJECTED');
              setCurrentPage(1);
            }}
          >
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
        <section className="flex flex-col rounded-3xl border border-gray-100 bg-white shadow-sm flex-1 overflow-hidden">
          {/* 상단 필터 영역 */}
          <header className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#eb0000]">검수 관리</h2>
                <button
                  onClick={() => refetch()}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="새로고침"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-full border border-gray-300 bg-white px-3 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="전체">전체 상태</option>
                  <option value="PENDING">대기</option>
                  <option value="APPROVED">승인</option>
                  <option value="REJECTED">반려</option>
                </select>

                <div className="relative w-44">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="팝업명/신청자 검색"
                    className="h-9 w-full rounded-full border border-gray-300 bg-gray-50 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                  />
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </header>

          {/* 테이블 */}
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-center font-semibold w-14">No.</th>
                  <th className="px-4 py-3 text-left font-semibold">팝업 명</th>
                  <th className="px-4 py-3 text-left font-semibold">신청자</th>
                  <th className="px-4 py-3 text-center font-semibold">유형</th>
                  <th className="px-4 py-3 text-center font-semibold">신청 일자</th>
                  <th className="px-4 py-3 text-center font-semibold">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : pagedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-500">
                      조건에 맞는 검수 요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pagedRequests.map((req, idx) => {
                    const isActive = req.id === selectedId;
                    return (
                      <tr
                        key={req.id}
                        onClick={() => handleSelectRow(req.id, req.targetId)}
                        className={`cursor-pointer text-[13px] ${
                          isActive ? 'bg-rose-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-center text-gray-500">
                          {(currentPage - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{req.targetName || '-'}</td>
                        <td className="px-4 py-3 text-gray-800">{req.requesterLoginId || '-'}</td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {req.targetType === 'POPUP' ? '팝업' : req.targetType}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {formatDate(req.requestedAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex min-w-[56px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusChipClass(
                              req.currentStatus
                            )}`}
                          >
                            {getStatusLabel(req.currentStatus)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
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
        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm flex flex-col overflow-hidden h-full">
          {selectedRequest ? (
            <>
              {/* 상세 사항 헤더 */}
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
                      <dt className="text-gray-500">신청자</dt>
                      <dd className="font-medium text-gray-900">{selectedRequest.requesterLoginId || '-'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">팝업 명</dt>
                      <dd className="max-w-[200px] text-right text-gray-900">
                        {selectedRequest.targetName || '-'}
                      </dd>
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
                      <dt className="text-gray-500">유형</dt>
                      <dd className="text-gray-900">
                        {selectedRequest.targetType === 'POPUP' ? '팝업' : selectedRequest.targetType}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">신청 일자</dt>
                      <dd className="text-gray-900">{formatDate(selectedRequest.requestedAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">상태</dt>
                      <dd>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${getStatusChipClass(
                            selectedRequest.currentStatus
                          )}`}
                        >
                          {getStatusLabel(selectedRequest.currentStatus)}
                        </span>
                      </dd>
                    </div>
                    {selectedRequest.description && (
                      <div className="mt-2">
                        <dt className="text-gray-500 mb-1">설명</dt>
                        <dd className="text-gray-900 text-xs bg-gray-50 p-2 rounded">
                          {selectedRequest.description}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* 팝업 이미지 (gallery가 있는 경우) - 작은 썸네일로 표시 */}
                {selectedPopupDetail?.gallery?.length > 0 && (
                  <div>
                    <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
                      팝업 이미지
                    </h3>
                    <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                      {selectedPopupDetail.gallery.slice(0, 6).map((img, idx) => (
                        <div key={idx} className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={img.url || img.imageUrl} 
                            alt={`팝업 이미지 ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No';
                            }}
                          />
                        </div>
                      ))}
                      {selectedPopupDetail.gallery.length > 6 && (
                        <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          +{selectedPopupDetail.gallery.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 대표 이미지 (thumbnail) - 작게 표시 */}
                {selectedPopupDetail?.thumbnail && !selectedPopupDetail?.gallery?.length && (
                  <div>
                    <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
                      대표 이미지
                    </h3>
                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={selectedPopupDetail.thumbnail.url || selectedPopupDetail.thumbnail.imageUrl} 
                        alt="대표 이미지"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 팝업 상세 정보 (있는 경우) */}
                {selectedPopupDetail && (
                  <div>
                    <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
                      팝업 상세
                    </h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      {selectedPopupDetail.startDate && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">운영 기간</dt>
                          <dd className="text-gray-900">
                            {formatDate(selectedPopupDetail.startDate)} ~ {formatDate(selectedPopupDetail.endDate)}
                          </dd>
                        </div>
                      )}
                      {(selectedPopupDetail.hours || selectedPopupDetail.operatingHours?.length > 0) && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">운영 시간</dt>
                          <dd className="text-gray-900 text-right">
                            {selectedPopupDetail.hours || selectedPopupDetail.operatingHours?.map(h => `${h.day} ${h.time}`).join(', ')}
                          </dd>
                        </div>
                      )}
                      {selectedPopupDetail.description && (
                        <div className="mt-2">
                          <dt className="text-gray-500 mb-1">소개</dt>
                          <dd className="text-gray-900 text-xs bg-gray-50 p-2 rounded line-clamp-3">
                            {selectedPopupDetail.description}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* 지도 영역 - 드래그/줌 가능 */}
                <div>
                  <h3 className="flex items-center gap-1.5 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    위치 정보
                  </h3>
                  <div className="mt-2 h-36 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    {selectedPopupDetail?.zoneCellLat && selectedPopupDetail?.zoneCellLng ? (
                      <Map
                        center={{ lat: selectedPopupDetail.zoneCellLat, lng: selectedPopupDetail.zoneCellLng }}
                        style={{ width: '100%', height: '100%' }}
                        level={4}
                        draggable={true}
                        zoomable={true}
                      >
                        <MapMarker
                          position={{ lat: selectedPopupDetail.zoneCellLat, lng: selectedPopupDetail.zoneCellLng }}
                        />
                      </Map>
                    ) : selectedPopupDetail?.zoneCellId ? (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-gray-400">
                        <MapPin className="h-6 w-6 mb-2 opacity-30" />
                        <p>셀 ID: {selectedPopupDetail.zoneCellId}</p>
                        <p className="text-[10px]">(좌표 정보 로딩 필요)</p>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400">
                        위치 정보가 없습니다.
                      </div>
                    )}
                  </div>
                  {selectedPopupDetail?.zoneCellAddress && (
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      📍 {selectedPopupDetail.zoneCellAddress}
                    </p>
                  )}
                </div>

                {/* 하단 액션 버튼 - 모든 상태에서 변경 가능 */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">상태 변경</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.currentStatus !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                        className="flex-1 min-w-[80px] rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {approveMutation.isPending ? '처리 중...' : '✓ 승인'}
                      </button>
                    )}
                    {selectedRequest.currentStatus !== 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleChangeStatus('PENDING')}
                        disabled={changeStatusMutation?.isPending}
                        className="flex-1 min-w-[80px] rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
                      >
                        ⏳ 대기로
                      </button>
                    )}
                    {selectedRequest.currentStatus !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={openRejectModal}
                        className="flex-1 min-w-[80px] rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
                      >
                        ✕ 반려
                      </button>
                    )}
                  </div>
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
              className="mt-4 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-[#eb0000] focus:bg-white focus:outline-none"
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
                disabled={rejectMutation.isPending}
                className="rounded-lg bg-[#eb0000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d60000] disabled:opacity-50"
              >
                {rejectMutation.isPending ? '처리 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalsPage;
