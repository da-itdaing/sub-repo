import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, ShieldCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import KakaoMap from '@/components/map/KakaoMap';

// KPI 데이터 (전체 회원, 판매자 계정, 승인 요청)
const KPI_STATS = [
  {
    id: 'users',
    title: '전체 회원',
    value: '18,420명',
    meta: '+240 오늘 가입',
    icon: Users,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    id: 'sellers',
    title: '판매자 계정',
    value: '1,280명',
    meta: '승인 대기 34건',
    icon: Store,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    id: 'approvals',
    title: '승인 요청',
    value: '52건',
    meta: '긴급 3건',
    icon: ShieldCheck,
    bg: 'bg-purple-50',
    text: 'text-purple-600',
  },
];

// 검수 관리 목업 데이터 (페이지네이션 테스트를 위해 데이터 추가)
const APPROVAL_QUEUE = [
  { id: 36, popupName: '운암동 예술거리 플리마켓', userName: '다잇다잉', category: '악세사리', district: '북구', submittedAt: '2025-11-05', status: '대기' },
  { id: 35, popupName: '한뼘사이', userName: '플레이팩토리', category: '공연/전시', district: '서구', submittedAt: '2025-11-04', status: '승인' },
  { id: 34, popupName: '빛고을 미식회', userName: '장보고와', category: '음식', district: '동구', submittedAt: '2025-11-01', status: '대기' },
  { id: 33, popupName: '2025 새로운 시작', userName: '스타트시대', category: '건강, 스포츠', district: '광산구', submittedAt: '2025-10-31', status: '대기' },
  { id: 32, popupName: '어린이 음악극 <짠!>', userName: '극단 새로이', category: '공연/전시, 키즈', district: '서구', submittedAt: '2025-10-31', status: '반려' },
  { id: 31, popupName: '가을맞이 북페스티벌', userName: '책방오후', category: '문화/예술', district: '동구', submittedAt: '2025-10-30', status: '승인' },
  { id: 30, popupName: '청년 창업 플리마켓', userName: '청년센터', category: '잡화', district: '북구', submittedAt: '2025-10-29', status: '대기' },
  { id: 29, popupName: '반려동물 간식 대전', userName: '멍멍냠냠', category: '반려동물', district: '광산구', submittedAt: '2025-10-28', status: '승인' },
];

// 지도 마커 목업 데이터
const MAP_MARKERS = [
  { id: 1, lat: 35.175, lng: 126.885, title: '운암동' },
  { id: 2, lat: 35.155, lng: 126.855, title: '상무지구' },
  { id: 3, lat: 35.145, lng: 126.920, title: '동명동' },
  { id: 4, lat: 35.190, lng: 126.820, title: '수완지구' },
];

const PAGE_SIZE = 5;

const getStatusChipClass = (status) => {
  if (status === '승인') return 'bg-emerald-50 text-emerald-700';
  if (status === '대기') return 'bg-amber-50 text-amber-700';
  if (status === '반려') return 'bg-rose-50 text-rose-700';
  return 'bg-gray-50 text-gray-500';
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [districtFilter, setDistrictFilter] = useState('북구');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(APPROVAL_QUEUE.length / PAGE_SIZE);
  
  const currentData = APPROVAL_QUEUE.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 영역: 승인 현황(왼쪽) + 구역 관리 지도(오른쪽) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:h-[400px]">
        {/* 왼쪽: 승인 현황 (하나의 흰색 카드로 통합) */}
        <section className="flex flex-col gap-4 lg:col-span-1 h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#eb0000]">승인 현황</h2>
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {KPI_STATS.map((stat) => {
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
            })}
          </div>
        </section>

        {/* 오른쪽: 구역 관리 지도 (흰색 배경 적용) */}
        <section className="flex flex-col lg:col-span-3 h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#eb0000]">구역 관리</h2>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-8 rounded-md border border-gray-200 px-3 text-xs text-gray-600 focus:border-primary focus:outline-none"
            >
              <option value="북구">북구</option>
              <option value="동구">동구</option>
              <option value="서구">서구</option>
              <option value="남구">남구</option>
              <option value="광산구">광산구</option>
            </select>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <KakaoMap
              center={{ lat: 35.175, lng: 126.885 }} // 광주 북구 중심
              level={7}
              height="100%"
              markers={MAP_MARKERS}
            />
          </div>
        </section>
      </div>

      {/* 하단 영역: 검수 관리 테이블 (흰색 배경 적용) */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#eb0000]">검수 관리</h2>
          <button 
            onClick={() => navigate('/admin/approvals')}
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
                  <th className="px-6 py-3 text-center">사용자 이름</th>
                  <th className="px-6 py-3 text-center">카테고리</th>
                  <th className="px-6 py-3 text-center">구역</th>
                  <th className="px-6 py-3 text-center">신청 일자</th>
                  <th className="px-6 py-3 text-center">승인 여부</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-500">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.popupName}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{item.userName}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{item.district}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{item.submittedAt}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusChipClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 페이지네이션 */}
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
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
