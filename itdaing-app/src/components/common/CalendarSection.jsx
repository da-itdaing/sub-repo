import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isWithinInterval,
  parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EventCard from '@/components/popup/EventCard';

const CalendarSection = ({ popups = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // 선택된 날짜에 진행 중인 팝업 필터링
  const selectedDatePopups = useMemo(() => {
    if (!selectedDate) return [];
    return popups.filter((popup) => {
      if (!popup.startDate || !popup.endDate) return false;
      const start = parseISO(popup.startDate);
      const end = parseISO(popup.endDate);
      return isWithinInterval(selectedDate, { start, end });
    });
  }, [popups, selectedDate]);

  // 날짜별 팝업 유무 체크 (점 표시용)
  const hasPopupOnDate = (date) => {
    return popups.some((popup) => {
      if (!popup.startDate || !popup.endDate) return false;
      const start = parseISO(popup.startDate);
      const end = parseISO(popup.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">일정</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 달력 그리드 */}
      <div className="mb-6">
        <div className="grid grid-cols-7 text-center mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-xs font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center gap-y-2">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const hasEvent = hasPopupOnDate(day);

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative flex flex-col items-center justify-center h-10 w-10 mx-auto rounded-full transition
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                  ${isSelected ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50'}
                `}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full" />
                )}
                {hasEvent && isSelected && (
                  <span className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜의 팝업 리스트 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {format(selectedDate, 'M월 d일', { locale: ko })} 일정 ({selectedDatePopups.length})
        </h3>
        
        {selectedDatePopups.length > 0 ? (
          <div className="space-y-3">
            {selectedDatePopups.map((popup) => (
              <div key={popup.id} className="transform transition hover:scale-[1.02]">
                <EventCard popup={popup} variant="compact" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500">해당 날짜에 진행되는 관심 팝업이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CalendarSection;

