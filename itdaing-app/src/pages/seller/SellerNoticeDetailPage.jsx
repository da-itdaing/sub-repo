import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const SellerNoticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock Data (실제로는 API 호출 필요)
  const mockNotices = [
    {
      id: 'notice-1',
      isImportant: true,
      popupId: 2,
      popupName: '충장 라온 페스타',
      title: '고객 문의사항 창구',
      date: '2025-10-18',
      content:
        '안녕하세요, 충장 라온 페스타 운영사무국입니다.\n\n공지사항 내용을 반드시 숙지하고 방문해주시길 바랍니다.\n\n1. 운영 시간 안내: 10:00 ~ 22:00\n2. 주차 안내: 인근 공영주차장 이용 권장\n3. 우천 시 행사 진행 여부는 당일 오전 9시 인스타그램을 통해 공지됩니다.\n\n감사합니다.',
    },
    {
      id: 'notice-2',
      isImportant: false,
      popupName: '여울원 팝업 IN 광주',
      title: '분실물 보관 안내',
      date: '2025-10-24',
      content: '분실물 관련 안내 사항입니다.'
    },
    {
      id: 'notice-3',
      isImportant: false,
      popupName: '충장 라온 페스타',
      title: '11월 안내사항 안내',
      date: '2025-10-31',
      content: '11월 운영 일정 안내입니다.'
    },
    // ... 더미 데이터 추가 가능
  ];

  // ID로 공지사항 찾기
  const notice = mockNotices.find((n) => n.id === id) || mockNotices[0]; // Fallback to first for demo

  if (!notice) {
    return <div>공지사항을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="rounded-3xl border border-white/80 bg-white p-8 shadow-sm shadow-slate-200/60">
        <h2 className="mb-6 text-xl font-bold text-[#EB0000]">공지사항</h2>
        
        <div className="border-b border-gray-200 pb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {notice.isImportant && (
              <span className="rounded-full border border-[#EB0000] px-2 py-0.5 text-xs font-bold text-[#EB0000]">
                중요
              </span>
            )}
            <span className="font-bold text-gray-900">{notice.popupName}</span>
            <span className="h-3 w-px bg-gray-300"></span>
            <span className="font-medium text-gray-900">{notice.title}</span>
            <span className="ml-auto text-xs text-gray-500">{notice.date}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6 min-h-[400px] rounded-xl border border-gray-200 bg-white p-8 text-gray-700">
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
            {notice.content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate(ROUTES.seller.notices)}
            className="rounded-lg bg-[#333333] px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1f1f1f] transition-colors"
          >
            목록보기
          </button>
          <button
            onClick={() => navigate(ROUTES.seller.noticeEdit(notice.id), { state: { notice } })}
            className="rounded-lg bg-[#EB0000] px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#c90000] transition-colors"
          >
            수정하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default SellerNoticeDetailPage;
