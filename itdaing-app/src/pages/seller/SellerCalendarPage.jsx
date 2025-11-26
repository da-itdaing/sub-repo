import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_POPUPS = [
  {
    id: 'popup-1',
    title: '양동통맥축제',
    status: 'ended',
    color: '#f59e0b',
    startDate: '2025-10-30',
    endDate: '2025-11-01',
    thumbnail:
      'https://images.unsplash.com/photo-1530041539828-114de669390e?auto=format&fit=crop&w=600&q=80',
    openingHours: '10:30 ~ 21:00',
    location: '광주광역시 서구 ○○로 123 양동시장 일대',
  },
  {
    id: 'popup-2',
    title: '여울원 팝업 IN 광주',
    status: 'ongoing',
    color: '#0f172a',
    startDate: '2025-10-31',
    endDate: '2025-11-13',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    openingHours: '월-목 AM 10:30 ~ PM 20:00 / 금-일 AM 10:30 ~ PM 20:30',
    location: '광주광역시 동구 동명로 268 롯데백화점 광주점 B1 문화홀',
  },
];

const formatKoreanMonth = (year, monthIndex) => {
  return `${monthIndex + 1}월`;
};

const formatDateRange = (start, end) => {
  return `${start.replace(/-/g, '.')} ~ ${end.replace(/-/g, '.')}`;
};

const getDaysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

const SellerCalendarPage = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedPopupId, setSelectedPopupId] = useState(MOCK_POPUPS[1].id);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const bars = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth, daysInMonth);

    return MOCK_POPUPS.map((popup) => {
      const [sYear, sMonth, sDay] = popup.startDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = popup.endDate.split('-').map(Number);

      const popupStart = new Date(sYear, sMonth - 1, sDay);
      const popupEnd = new Date(eYear, eMonth - 1, eDay);

      // 해당 월과 전혀 겹치지 않으면 스킵
      if (popupEnd < monthStart || popupStart > monthEnd) {
        return null;
      }

      // 이 월 안에서의 실제 시작/끝 날짜로 클램프
      const effectiveStart =
        popupStart < monthStart ? monthStart : popupStart;
      const effectiveEnd = popupEnd > monthEnd ? monthEnd : popupEnd;

      const startDay = effectiveStart.getDate();
      const endDay = effectiveEnd.getDate();

      const left = ((startDay - 1) / daysInMonth) * 100;
      const width = ((endDay - startDay + 1) / daysInMonth) * 100;

      return {
        popup,
        left,
        width,
      };
    }).filter(Boolean);
  }, [currentYear, currentMonth, daysInMonth]);

  const selectedPopup =
    MOCK_POPUPS.find((popup) => popup.id === selectedPopupId) || MOCK_POPUPS[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60 lg:grid-cols-[2fr,1fr]">
        {/* Left: Calendar + Popup periods (단일 영역) */}
        <div className="space-y-4">
          {/* Month Header */}
          <div className="flex items-center justify-between px-4 pt-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="text-lg font-semibold text-gray-900">
              {formatKoreanMonth(currentYear, currentMonth)}
            </p>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar + Popup period 카드 (동일 가로 길이) */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4">
            {/* Calendar (days row) */}
            <div className="bg-gray-50 rounded-xl px-4 py-4">
              <div className="grid grid-cols-7 gap-y-6 text-center text-sm text-gray-700">
                {Array.from({ length: daysInMonth }, (_, idx) => (
                  <div key={idx} className="text-xs text-gray-500">
                    {idx + 1}
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="mt-8 space-y-3">
                {bars.map(({ popup, left, width }) => (
                  <div key={popup.id} className="relative h-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPopupId(popup.id)}
                      className="absolute inset-y-0 rounded-full transition-[box-shadow,transform]"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: popup.color,
                        boxShadow:
                          selectedPopupId === popup.id
                            ? '0 0 0 3px rgba(239,68,68,0.4)'
                            : 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Popup periods (달력 아래) */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">팝업 기간</p>
              <div className="space-y-2 text-sm text-gray-700">
                {MOCK_POPUPS.map((popup) => (
                  <button
                    key={popup.id}
                    type="button"
                    onClick={() => setSelectedPopupId(popup.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left hover:bg-gray-50"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: popup.color }}
                    />
                    <span className="font-medium">
                      {popup.status === 'ended' ? '종료' : '진행 중'} | {popup.title}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      {formatDateRange(popup.startDate, popup.endDate)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected popup detail */}
        <div className="flex flex-col items-stretch rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <img
              src={selectedPopup.thumbnail}
              alt={selectedPopup.title}
              className="h-72 w-full object-cover"
            />
          </div>

          <div className="mt-6 space-y-4 px-1">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedPopup.title}
            </h2>

            <div className="space-y-3 text-sm text-gray-800">
              <div className="flex gap-4">
                <span className="w-20 text-xs font-semibold text-gray-500">
                  팝업 기간
                </span>
                <span>{formatDateRange(selectedPopup.startDate, selectedPopup.endDate)}</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20 text-xs font-semibold text-gray-500">
                  팝업 시간
                </span>
                <span>{selectedPopup.openingHours}</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20 text-xs font-semibold text-gray-500">
                  팝업 장소
                </span>
                <span className="whitespace-pre-line">
                  {selectedPopup.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SellerCalendarPage;


