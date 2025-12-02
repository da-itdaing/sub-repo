import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Eye, Heart, Store, TrendingUp } from 'lucide-react';
import { getMyPopups } from '@/services/sellerService';
import { ROUTES } from '@/routes/paths';

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

const buildDateKey = (year, monthIndex, day) => `${year}-${monthIndex}-${day}`;

const SellerCalendarPage = () => {
  const navigate = useNavigate();
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();
  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth);
  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

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

  const handleNavigateDetail = (popupId) => {
    if (!popupId) return;
    navigate(ROUTES.seller.popupDetail(popupId));
  };

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

  useEffect(() => {
    if (currentYear === todayYear && currentMonth === todayMonth) {
      setSelectedDateKey(buildDateKey(currentYear, currentMonth, todayDate));
    } else {
      setSelectedDateKey(null);
    }
  }, [currentYear, currentMonth, todayYear, todayMonth, todayDate]);

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
    <div className="space-y-5">
      {/* 헤더 + 통계 */}
      <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5">
              <Store className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700">{stats.activeCount}</span>
              <span className="text-xs text-green-600">운영중</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">{stats.upcomingCount}</span>
              <span className="text-xs text-blue-600">예정</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-gray-600" />
              <span className="text-xs font-bold text-gray-700">{stats.totalViews.toLocaleString()}</span>
              <span className="text-xs text-gray-500">조회</span>
            </div>
          </div>
        </div>
      </section>

      {/* 상단: 달력 + 선택된 팝업 상세 (2열) */}
      <div className="grid gap-5 lg:grid-cols-[1fr,340px]">
        {/* 좌측: 달력 */}
        <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm shadow-slate-200/60">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-gray-900">
              {formatKoreanMonth(currentYear, currentMonth)}
            </h3>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1 border-b border-gray-100 pb-1.5">
            {WEEKDAYS.map((day, idx) => (
              <div 
                key={day} 
                className={`py-1 text-center text-[11px] font-semibold ${
                  idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="h-11 lg:h-12" />;
              }

              const dayOfWeek = (firstDay + cell.day - 1) % 7;
              const hasPopups = cell.popups.length > 0;
              
              return (
                <div
                  key={cell.key}
                  className={`
                    h-11 lg:h-12 p-0.5 rounded-lg transition-all cursor-pointer flex flex-col items-center
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
                    text-[11px] font-medium text-center
                    ${cell.isToday ? 'text-primary font-bold' : ''}
                    ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'}
                  `}>
                    {cell.day}
                  </div>
                  
                  {/* 팝업 인디케이터 */}
                  <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                    {cell.popups.slice(0, 3).map((popup) => {
                      const color = getPopupColor(popup.startDate, popup.endDate);
                      return (
                        <div
                          key={popup.id}
                          className="h-1 w-1 lg:h-1.5 lg:w-1.5 rounded-full"
                          style={{ backgroundColor: color.bg }}
                          title={popup.title}
                        />
                      );
                    })}
                    {cell.popups.length > 3 && (
                      <span className="text-[7px] text-gray-400">+{cell.popups.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 우측: 선택된 팝업 상세 */}
        <div className="space-y-4">
          {selectedPopup && (
            <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm shadow-slate-200/60">
              <h4 className="text-xs font-semibold text-gray-500 mb-3">선택된 팝업</h4>
              
              {/* 상단: 이미지 + 기본 정보 (가로 배치) */}
              <div className="flex gap-3">
                {/* 썸네일 */}
                <div
                  className="w-20 h-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 cursor-pointer transition hover:opacity-80"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigateDetail(selectedPopup.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleNavigateDetail(selectedPopup.id);
                  }}
                >
                  {selectedPopup.thumbnail ? (
                    <img
                      src={typeof selectedPopup.thumbnail === 'string' ? selectedPopup.thumbnail : selectedPopup.thumbnail?.url}
                      alt={selectedPopup.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                      <CalendarIcon className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* 기본 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                      {selectedPopup.title}
                    </h3>
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${getPopupColor(selectedPopup.startDate, selectedPopup.endDate).bg}15`,
                        color: getPopupColor(selectedPopup.startDate, selectedPopup.endDate).text,
                      }}
                    >
                      {getStatusLabel(selectedPopup.startDate, selectedPopup.endDate)}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <CalendarIcon className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="truncate">{formatDateRange(selectedPopup.startDate, selectedPopup.endDate)}</span>
                    </div>
                    {selectedPopup.hours && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedPopup.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 위치 정보 */}
              {selectedPopup.address && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-1.5 text-[11px] text-gray-600">
                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                    <span>{selectedPopup.address}</span>
                  </div>
                </div>
              )}

              {/* 통계 */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-500">조회</span>
                  <span className="text-[11px] font-bold text-gray-900">
                    {(selectedPopup.viewCount ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-500">찜</span>
                  <span className="text-[11px] font-bold text-gray-900">
                    {(selectedPopup.favoriteCount ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* 빠른 액션 */}
          {/* <section className="rounded-2xl border border-white/80 bg-white p-3 shadow-sm shadow-slate-200/60">
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10"
              >
                <Store className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-medium text-primary">팝업 등록</span>
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <Eye className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[11px] font-medium text-gray-600">미리보기</span>
              </button>
            </div>
          </section> */}

          {/* 운영 팁 */}
          {/* <section className="rounded-2xl border border-white/80 bg-linear-to-br from-[#ff235b]/5 to-[#c4006b]/5 p-3 shadow-sm shadow-slate-200/60">
            <h4 className="text-[11px] font-semibold text-gray-900 mb-1">💡 운영 팁</h4>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              팝업 운영 중 SNS에 현장 사진을 자주 업로드하면 방문객이 증가합니다.
            </p>
          </section> */}
        </div>
      </div>

      {/* 하단: 내 팝업 목록 (스크롤) */}
      <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm shadow-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">내 팝업 목록</h4>
          <span className="text-xs text-gray-500">총 {popups.length}개</span>
        </div>
        
        {/* 스크롤 가능한 팝업 목록 - 최대 5개 높이 */}
        <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {popups.map((popup) => {
            const color = getPopupColor(popup.startDate, popup.endDate);
            const isSelected = selectedPopupId === popup.id;
            
            return (
              <button
                key={popup.id}
                type="button"
                onClick={() => setSelectedPopupId(popup.id)}
                className={`
                  flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left transition-all border
                  ${isSelected 
                    ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10' 
                    : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'}
                `}
              >
                {/* 썸네일 */}
                <div
                  className="w-12 h-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100 cursor-pointer transition hover:opacity-80"
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNavigateDetail(popup.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.stopPropagation();
                      handleNavigateDetail(popup.id);
                    }
                  }}
                >
                  {popup.thumbnail ? (
                    <img
                      src={typeof popup.thumbnail === 'string' ? popup.thumbnail : popup.thumbnail?.url}
                      alt={popup.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                      <Store className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* 상태 인디케이터 */}
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color.bg }}
                />

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {popup.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDateRange(popup.startDate, popup.endDate)}
                  </p>
                </div>

                {/* 통계 + 상태 */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${color.bg}15`,
                      color: color.text,
                    }}
                  >
                    {getStatusLabel(popup.startDate, popup.endDate)}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {(popup.viewCount ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" />
                      {(popup.favoriteCount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SellerCalendarPage;
