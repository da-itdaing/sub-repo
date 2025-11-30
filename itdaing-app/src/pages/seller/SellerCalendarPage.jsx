import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Eye, Heart, Store, TrendingUp } from 'lucide-react';
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

  // 통계 계산
  const stats = useMemo(() => {
    const activeCount = popups.filter((p) => {
      if (!p.startDate || !p.endDate) return false;
      const now = new Date();
      return now >= new Date(p.startDate) && now <= new Date(p.endDate);
    }).length;

    const upcomingCount = popups.filter((p) => {
      if (!p.startDate) return false;
      return new Date() < new Date(p.startDate);
    }).length;

    const totalViews = popups.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
    const totalFavorites = popups.reduce((sum, p) => sum + (p.favoriteCount ?? 0), 0);

    return { activeCount, upcomingCount, totalViews, totalFavorites };
  }, [popups]);

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
      {/* 헤더 + 통계 */}
      <section className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#EB0000]">일정 관리</h2>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                진행 중
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                예정
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                종료
              </span>
            </div>
          </div>

          {/* 요약 통계 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2">
              <Store className="h-4 w-4 text-green-600" />
              <div className="text-xs">
                <span className="font-bold text-green-700">{stats.activeCount}</span>
                <span className="text-green-600 ml-1">운영중</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <div className="text-xs">
                <span className="font-bold text-blue-700">{stats.upcomingCount}</span>
                <span className="text-blue-600 ml-1">예정</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <div className="text-xs">
                <span className="font-bold text-gray-700">{stats.totalViews.toLocaleString()}</span>
                <span className="text-gray-500 ml-1">총 조회</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 - 2열 레이아웃 */}
      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* 좌측: 달력 */}
        <section className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm shadow-slate-200/60">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900">
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
          <div className="grid grid-cols-7 mb-1 border-b border-gray-100 pb-2">
            {WEEKDAYS.map((day, idx) => (
              <div 
                key={day} 
                className={`py-1.5 text-center text-xs font-semibold ${
                  idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="h-14 lg:h-16" />;
              }

              const dayOfWeek = (firstDay + cell.day - 1) % 7;
              const hasPopups = cell.popups.length > 0;
              
              return (
                <div
                  key={cell.key}
                  className={`
                    h-14 lg:h-16 p-1 rounded-lg transition-all cursor-pointer flex flex-col
                    ${cell.isToday ? 'bg-primary/10 ring-2 ring-primary/30' : 'hover:bg-gray-50'}
                    ${hasPopups ? 'bg-gray-50/80' : ''}
                  `}
                  onClick={() => {
                    if (cell.popups.length > 0) {
                      setSelectedPopupId(cell.popups[0].id);
                    }
                  }}
                >
                  <div className={`
                    text-xs font-medium text-center
                    ${cell.isToday ? 'text-primary font-bold' : ''}
                    ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'}
                  `}>
                    {cell.day}
                  </div>
                  
                  {/* 팝업 인디케이터 */}
                  <div className="flex-1 flex flex-wrap gap-0.5 justify-center items-start mt-1">
                    {cell.popups.slice(0, 3).map((popup) => {
                      const color = getPopupColor(popup.startDate, popup.endDate);
                      return (
                        <div
                          key={popup.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: color.bg }}
                          title={popup.title}
                        />
                      );
                    })}
                    {cell.popups.length > 3 && (
                      <span className="text-[8px] text-gray-400">+{cell.popups.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 팝업 목록 */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">내 팝업 목록</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {popups.map((popup) => {
                const color = getPopupColor(popup.startDate, popup.endDate);
                const isSelected = selectedPopupId === popup.id;
                
                return (
                  <button
                    key={popup.id}
                    type="button"
                    onClick={() => setSelectedPopupId(popup.id)}
                    className={`
                      flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all border
                      ${isSelected 
                        ? 'bg-gray-100 border-gray-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'}
                    `}
                  >
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color.bg }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {popup.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDateRange(popup.startDate, popup.endDate)}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${color.bg}15`,
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

        {/* 우측: 선택된 팝업 상세 */}
        <div className="space-y-6">
          {selectedPopup && (
            <section className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm shadow-slate-200/60">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">선택된 팝업</h4>
              
              {/* 썸네일 */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 aspect-[4/3]">
                {selectedPopup.thumbnail ? (
                  <img
                    src={typeof selectedPopup.thumbnail === 'string' ? selectedPopup.thumbnail : selectedPopup.thumbnail?.url}
                    alt={selectedPopup.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <CalendarIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {selectedPopup.title}
                  </h3>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${getPopupColor(selectedPopup.startDate, selectedPopup.endDate).bg}15`,
                      color: getPopupColor(selectedPopup.startDate, selectedPopup.endDate).text,
                    }}
                  >
                    {getStatusLabel(selectedPopup.startDate, selectedPopup.endDate)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">운영 기간</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateRange(selectedPopup.startDate, selectedPopup.endDate)}
                      </p>
                    </div>
                  </div>

                  {selectedPopup.hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500">운영 시간</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPopup.hours}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPopup.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500">위치</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPopup.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-500">조회수</p>
                      <p className="text-sm font-bold text-gray-900">
                        {(selectedPopup.viewCount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3">
                    <Heart className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-500">찜</p>
                      <p className="text-sm font-bold text-gray-900">
                        {(selectedPopup.favoriteCount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 오늘의 팁 카드 */}
          <section className="rounded-3xl border border-white/80 bg-gradient-to-br from-[#ff235b]/5 to-[#c4006b]/5 p-5 shadow-sm shadow-slate-200/60">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 운영 팁</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              팝업 운영 중에는 SNS에 현장 사진을 자주 업로드하세요. 
              실시간 방문 후기와 현장 분위기를 공유하면 방문객이 증가합니다.
            </p>
          </section>

          {/* 빠른 액션 */}
          <section className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm shadow-slate-200/60">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">빠른 액션</h4>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Store className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">새 팝업 등록하기</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">팝업 미리보기</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SellerCalendarPage;
