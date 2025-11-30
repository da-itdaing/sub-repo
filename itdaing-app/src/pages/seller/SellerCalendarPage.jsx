import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Eye, Heart } from 'lucide-react';
import { getMyPopups } from '@/services/sellerService';

/**
 * 팝업 상태에 따른 색상 반환
 */
const getPopupColor = (startDate, endDate) => {
  if (!startDate || !endDate) return { bg: '#94a3b8', text: '#64748b' }; // 회색

  const now = new Date();
  const s = new Date(startDate);
  const e = new Date(endDate);

  if (now > e) return { bg: '#f97316', text: '#ea580c' }; // 종료 - 주황
  if (now < s) return { bg: '#3b82f6', text: '#2563eb' }; // 예정 - 파랑
  return { bg: '#10b981', text: '#059669' }; // 진행 중 - 초록
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

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatKoreanMonth = (year, monthIndex) => {
  return `${year}년 ${monthIndex + 1}월`;
};

const formatDateRange = (start, end) => {
  if (!start || !end) return '날짜 미정';
  return `${start.replace(/-/g, '.')} ~ ${end.replace(/-/g, '.')}`;
};

const getDaysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

const getFirstDayOfMonth = (year, monthIndex) =>
  new Date(year, monthIndex, 1).getDay();

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
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

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

  // 특정 날짜에 해당하는 팝업 찾기
  const getPopupsForDate = (day) => {
    const dateToCheck = new Date(currentYear, currentMonth, day);
    
    return popups.filter((popup) => {
      if (!popup.startDate || !popup.endDate) return false;
      
      const [sYear, sMonth, sDay] = popup.startDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = popup.endDate.split('-').map(Number);
      
      const popupStart = new Date(sYear, sMonth - 1, sDay);
      const popupEnd = new Date(eYear, eMonth - 1, eDay);
      
      return dateToCheck >= popupStart && dateToCheck <= popupEnd;
    });
  };

  // 달력 셀 생성
  const calendarCells = useMemo(() => {
    const cells = [];
    
    // 이전 달 빈 셀
    for (let i = 0; i < firstDay; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }
    
    // 현재 달 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const datePopups = getPopupsForDate(day);
      const isToday = 
        today.getFullYear() === currentYear && 
        today.getMonth() === currentMonth && 
        today.getDate() === day;
      
      cells.push({
        type: 'day',
        day,
        popups: datePopups,
        isToday,
        key: `day-${day}`,
      });
    }
    
    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDay, popups]);

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
      {/* 헤더 */}
      <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#EB0000]">일정 관리</h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
              진행 중
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
              예정
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
              종료
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(400px,700px),320px]">
        {/* 달력 영역 - 최대 너비 제한 */}
        <section className="rounded-3xl border border-white/80 bg-white p-4 md:p-6 shadow-sm shadow-slate-200/60 max-w-[700px]">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-base md:text-lg font-bold text-gray-900">
              {formatKoreanMonth(currentYear, currentMonth)}
            </h3>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((day, idx) => (
              <div 
                key={day} 
                className={`py-1.5 text-center text-[11px] md:text-xs font-semibold ${
                  idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 - 고정 높이 셀 */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="h-10 md:h-12" />;
              }

              const dayOfWeek = (firstDay + cell.day - 1) % 7;
              const hasPopups = cell.popups.length > 0;
              
              return (
                <div
                  key={cell.key}
                  className={`
                    h-10 md:h-12 p-0.5 rounded-lg transition-all cursor-pointer flex flex-col items-center
                    ${cell.isToday ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-gray-50'}
                    ${hasPopups ? 'bg-gray-50' : ''}
                  `}
                  onClick={() => {
                    if (cell.popups.length > 0) {
                      setSelectedPopupId(cell.popups[0].id);
                    }
                  }}
                >
                  <div className={`
                    text-[11px] md:text-xs font-medium text-center leading-tight
                    ${cell.isToday ? 'text-primary font-bold' : ''}
                    ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'}
                  `}>
                    {cell.day}
                  </div>
                  
                  {/* 팝업 인디케이터 */}
                  <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                    {cell.popups.slice(0, 2).map((popup) => {
                      const color = getPopupColor(popup.startDate, popup.endDate);
                      return (
                        <div
                          key={popup.id}
                          className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full"
                          style={{ backgroundColor: color.bg }}
                          title={popup.title}
                        />
                      );
                    })}
                    {cell.popups.length > 2 && (
                      <span className="text-[7px] text-gray-400">+{cell.popups.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 팝업 기간 목록 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">팝업 기간</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {popups.map((popup) => {
                const color = getPopupColor(popup.startDate, popup.endDate);
                const isSelected = selectedPopupId === popup.id;
                
                return (
                  <button
                    key={popup.id}
                    type="button"
                    onClick={() => setSelectedPopupId(popup.id)}
                    className={`
                      flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-all
                      ${isSelected ? 'bg-gray-100 shadow-sm' : 'hover:bg-gray-50'}
                    `}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color.bg }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {popup.title}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500">
                        {formatDateRange(popup.startDate, popup.endDate)}
                      </p>
                    </div>
                    <span
                      className="text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${color.bg}20`,
                        color: color.text,
                      }}
                    >
                      {getStatusLabel(popup.startDate, popup.endDate)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 선택된 팝업 상세 */}
        {selectedPopup && (
          <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm shadow-slate-200/60 h-fit max-w-[320px]">
            {/* 썸네일 */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-100 aspect-[4/3]">
              {selectedPopup.thumbnail ? (
                <img
                  src={typeof selectedPopup.thumbnail === 'string' ? selectedPopup.thumbnail : selectedPopup.thumbnail?.url}
                  alt={selectedPopup.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <CalendarIcon className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </div>

            {/* 정보 */}
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight">
                  {selectedPopup.title}
                </h3>
                <span
                  className="text-[9px] md:text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: `${getPopupColor(selectedPopup.startDate, selectedPopup.endDate).bg}20`,
                    color: getPopupColor(selectedPopup.startDate, selectedPopup.endDate).text,
                  }}
                >
                  {getStatusLabel(selectedPopup.startDate, selectedPopup.endDate)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">운영 기간</p>
                    <p className="text-xs font-medium text-gray-900">
                      {formatDateRange(selectedPopup.startDate, selectedPopup.endDate)}
                    </p>
                  </div>
                </div>

                {selectedPopup.hours && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">운영 시간</p>
                      <p className="text-xs font-medium text-gray-900">
                        {selectedPopup.hours}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPopup.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">위치</p>
                      <p className="text-xs font-medium text-gray-900">
                        {selectedPopup.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-2">
                  <Eye className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <p className="text-[9px] text-gray-500">조회수</p>
                    <p className="text-xs font-bold text-gray-900">
                      {(selectedPopup.viewCount ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-2">
                  <Heart className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <p className="text-[9px] text-gray-500">찜</p>
                    <p className="text-xs font-bold text-gray-900">
                      {(selectedPopup.favoriteCount ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SellerCalendarPage;
