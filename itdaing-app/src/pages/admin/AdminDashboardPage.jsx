import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Store, ShieldCheck, ChevronLeft, ChevronRight, MapPin, RefreshCw } from 'lucide-react';
import { Map, Polygon } from 'react-kakao-maps-sdk';
import { ROUTES } from '@/routes/paths';
import { getDashboardStats, listPendingApprovals } from '@/services/adminService';
import { listAreas, parseGeoJsonPolygon } from '@/services/geoZoneService';

// 광주광역시 5개 구
const DISTRICTS = [
  { id: 26, name: '동구', center: { lat: 35.1461, lng: 126.9231 } },
  { id: 27, name: '서구', center: { lat: 35.1520, lng: 126.8900 } },
  { id: 28, name: '남구', center: { lat: 35.1329, lng: 126.9025 } },
  { id: 29, name: '북구', center: { lat: 35.1741, lng: 126.9121 } },
  { id: 30, name: '광산구', center: { lat: 35.1395, lng: 126.7937 } },
];

// 존별 색상
const ZONE_COLORS = [
  '#FF4B4B', '#2980FF', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const PAGE_SIZE = 5;

const getStatusChipClass = (status) => {
  if (status === 'APPROVED' || status === '승인') return 'bg-emerald-50 text-emerald-700';
  if (status === 'PENDING' || status === '대기') return 'bg-amber-50 text-amber-700';
  if (status === 'REJECTED' || status === '반려') return 'bg-rose-50 text-rose-700';
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

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [mapCenter, setMapCenter] = useState(DISTRICTS[0].center);
  const [currentPage, setCurrentPage] = useState(1);

  // 대시보드 통계 조회
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000, // 1분 캐시
  });

  // 승인 대기 목록 조회
  const { data: approvalsData, isLoading: isLoadingApprovals, refetch: refetchApprovals } = useQuery({
    queryKey: ['adminApprovals'],
    queryFn: () => listPendingApprovals({ page: 0, size: 50 }),
    staleTime: 60 * 1000,
  });

  // 존 목록 조회 (지도용)
  const { data: areasData } = useQuery({
    queryKey: ['geoAreas'],
    queryFn: () => listAreas({ page: 0, size: 200 }),
    staleTime: 5 * 60 * 1000,
  });
  const areas = areasData?.items || [];

  // 선택된 구에 속한 존만 필터링
  const filteredAreas = useMemo(() => {
    return areas.filter((a) => a.regionId === selectedDistrict.id);
  }, [areas, selectedDistrict.id]);

  // 승인 대기 목록
  const approvalItems = approvalsData?.items || [];
  const totalPages = Math.max(1, Math.ceil(approvalItems.length / PAGE_SIZE));
  const currentData = approvalItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 구 선택 시 지도 중심 이동
  useEffect(() => {
    if (selectedDistrict) {
      setMapCenter(selectedDistrict.center);
    }
  }, [selectedDistrict]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchApprovals();
  };

  // KPI 데이터
  const kpiStats = [
    {
      id: 'users',
      title: '전체 회원',
      value: stats?.totalUsers?.toLocaleString() || '0',
      meta: `소비자 ${stats?.totalConsumers?.toLocaleString() || 0}명`,
      icon: Users,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      id: 'sellers',
      title: '판매자 계정',
      value: stats?.totalSellers?.toLocaleString() || '0',
      meta: '활성 판매자',
      icon: Store,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      id: 'approvals',
      title: '승인 대기',
      value: stats?.pendingApprovals?.toLocaleString() || '0',
      meta: '처리 필요',
      icon: ShieldCheck,
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 상단 영역: 승인 현황(왼쪽) + 구역 관리 지도(오른쪽) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:h-[400px]">
        {/* 왼쪽: 승인 현황 */}
        <section className="flex flex-col gap-4 lg:col-span-1 h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#eb0000]">승인 현황</h2>
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="새로고침"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {isLoadingStats ? (
              <div className="text-center text-gray-400 py-8">로딩 중...</div>
            ) : (
              kpiStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="flex items-center gap-4 rounded-2xl bg-gray-50/50 border border-gray-100 px-5 py-4"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg} ${stat.text}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stat.meta}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 오른쪽: 구역 관리 지도 */}
        <section className="flex flex-col lg:col-span-3 h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#eb0000]">구역 관리</h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedDistrict.id}
                onChange={(e) => {
                  const district = DISTRICTS.find((d) => d.id === Number(e.target.value));
                  if (district) setSelectedDistrict(district);
                }}
                className="h-8 rounded-md border border-gray-200 px-3 text-xs text-gray-600 focus:border-primary focus:outline-none"
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => navigate(ROUTES.admin.zones)}
                className="text-xs text-[#eb0000] hover:underline"
              >
                상세 관리 →
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 relative">
            <Map
              center={mapCenter}
              style={{ width: '100%', height: '100%' }}
              level={6}
            >
              {/* 존 폴리곤 렌더링 */}
              {filteredAreas.map((area, idx) => {
                const coords = parseGeoJsonPolygon(area.polygonGeoJson);
                if (coords.length < 3) return null;
                const color = ZONE_COLORS[idx % ZONE_COLORS.length];

                return (
                  <Polygon
                    key={area.id}
                    path={coords}
                    strokeWeight={2}
                    strokeColor={color}
                    strokeOpacity={0.8}
                    fillColor={color}
                    fillOpacity={0.2}
                  />
                );
              })}
            </Map>
            
            {/* 지도 오버레이 */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-gray-600 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#eb0000]" />
              {selectedDistrict.name} · {filteredAreas.length}개 존
            </div>
          </div>
        </section>
      </div>

      {/* 하단 영역: 검수 관리 테이블 */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#eb0000]">검수 관리</h2>
          <button 
            onClick={() => navigate(ROUTES.admin.approvals)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            더보기 <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-[#3D3D3D] text-[11px] font-medium text-white uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-3 text-center w-16">No.</th>
                  <th className="px-6 py-3 text-left">팝업 명</th>
                  <th className="px-6 py-3 text-center">신청자</th>
                  <th className="px-6 py-3 text-center">유형</th>
                  <th className="px-6 py-3 text-center">신청 일자</th>
                  <th className="px-6 py-3 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoadingApprovals ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      로딩 중...
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      승인 대기 중인 항목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center text-gray-500">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.targetName || '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.requesterLoginId || '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.targetType === 'POPUP' ? '팝업' : item.targetType}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {formatDate(item.requestedAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusChipClass(item.currentStatus)}`}>
                          {getStatusLabel(item.currentStatus)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* 페이지네이션 */}
          {approvalItems.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-center gap-4 bg-white">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-gray-600">{currentPage} / {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
