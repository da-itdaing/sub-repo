import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { getMyPopups } from '@/services/sellerService';

/**
 * 팝업 상태에 따른 색상 반환
 */
const getPopupColor = (startDate, endDate) => {
  if (!startDate || !endDate) return '#94a3b8'; // 날짜 없음 - 회색

  const now = new Date();
  const s = new Date(startDate);
  const e = new Date(endDate);

  if (now > e) return '#f97316'; // 종료 - 주황
  if (now < s) return '#3b82f6'; // 예정 - 파랑
  return '#10b981'; // 진행 중 - 초록
};

/**
 * 운영 상태 라벨 반환
 */
const getStatusLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return '미정';

  const now = new Date();
  const s = new Date(startDate);
  const e = new Date(endDate);

  if (now > e) return '종료';
  if (now < s) return '예정';
  return '진행 중';
};

const formatKoreanMonth = (year, monthIndex) => {
  return `${year}년 ${monthIndex + 1}월`;
};

const formatDateRange = (start, end) => {
  if (!start || !end) return '날짜 미정';
  return `${start.replace(/-/g, '.')} ~ ${end.replace(/-/g, '.')}`;
};

const getDaysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

const SellerCalendarPage = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedPopupId, setSelectedPopupId] = useState(null);

  // 실제 API 데이터 조회
  const { data: popups = [], isLoading, error } = useQuery({
    queryKey: ['myPopups'],
    queryFn: getMyPopups,
    staleTime: 5 * 60 * 1000,
  });

  // 선택된 팝업 (첫 팝업을 기본값으로)
  const selectedPopup = useMemo(() => {
    if (!popups.length) return null;
    return popups.find((p) => p.id === selectedPopupId) || popups[0];
  }, [popups, selectedPopupId]);

  // 첫 로드 시 첫 번째 팝업 선택
  useMemo(() => {
    if (popups.length && !selectedPopupId) {
      setSelectedPopupId(popups[0].id);
    }
  }, [popups, selectedPopupId]);

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

  // 캘린더 바 계산
  const bars = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth, daysInMonth);

    return popups.map((popup) => {
      const startDate = popup.startDate;
      const endDate = popup.endDate;

      if (!startDate || !endDate) return null;

      const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = endDate.split('-').map(Number);

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
        color: getPopupColor(startDate, endDate),
      };
    }).filter(Boolean);
  }, [popups, currentYear, currentMonth, daysInMonth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">일정을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">일정을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  if (!popups.length) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              등록된 팝업이 없습니다
            </h3>
            <p className="text-sm text-gray-500">
              팝업을 등록하면 일정을 관리할 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60 lg:grid-cols-[2fr,1fr]">
        {/* Left: Calendar + Popup periods */}
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

          {/* Calendar + Popup period 카드 */}
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
                {bars.map(({ popup, left, width, color }) => (
                  <div key={popup.id} className="relative h-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPopupId(popup.id)}
                      className="absolute inset-y-0 rounded-full transition-[box-shadow,transform]"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: color,
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
              <div className="space-y-2 text-sm text-gray-700 max-h-48 overflow-y-auto">
                {popups.map((popup) => (
                  <button
                    key={popup.id}
                    type="button"
                    onClick={() => setSelectedPopupId(popup.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-gray-50 transition-colors ${
                      selectedPopupId === popup.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getPopupColor(popup.startDate, popup.endDate) }}
                    />
                    <span className="font-medium truncate flex-1">
                      {getStatusLabel(popup.startDate, popup.endDate)} | {popup.title}
                    </span>
                    <span className="ml-auto text-xs text-gray-500 flex-shrink-0">
                      {formatDateRange(popup.startDate, popup.endDate)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected popup detail */}
        {selectedPopup && (
          <div className="flex flex-col items-stretch rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {selectedPopup.thumbnail ? (
                <img
                  src={selectedPopup.thumbnail}
                  alt={selectedPopup.title}
                  className="h-72 w-full object-cover"
                />
              ) : (
                <div className="h-72 w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <CalendarIcon className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4 px-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {selectedPopup.title}
                </h2>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${getPopupColor(selectedPopup.startDate, selectedPopup.endDate)}20`,
                    color: getPopupColor(selectedPopup.startDate, selectedPopup.endDate),
                  }}
                >
                  {getStatusLabel(selectedPopup.startDate, selectedPopup.endDate)}
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex gap-4">
                  <span className="w-20 text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    팝업 기간
                  </span>
                  <span>{formatDateRange(selectedPopup.startDate, selectedPopup.endDate)}</span>
                </div>
                {selectedPopup.operatingTime && (
                  <div className="flex gap-4">
                    <span className="w-20 text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      운영 시간
                    </span>
                    <span>{selectedPopup.operatingTime}</span>
                  </div>
                )}
                {selectedPopup.address && (
                  <div className="flex gap-4">
                    <span className="w-20 text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      팝업 장소
                    </span>
                    <span className="whitespace-pre-line">
                      {selectedPopup.address}
                    </span>
                  </div>
                )}
              </div>

              {/* 조회수/찜 정보 */}
              <div className="flex gap-4 pt-2 border-t border-gray-100">
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500">조회수</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(selectedPopup.viewCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500">찜</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(selectedPopup.favoriteCount ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SellerCalendarPage;
