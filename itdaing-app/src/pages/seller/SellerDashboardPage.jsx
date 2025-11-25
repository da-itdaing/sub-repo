import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { AlertTriangle, CalendarDays, Eye, Heart, MapPin, PlusCircle } from 'lucide-react';
import { ROUTES } from '@/routes/paths';
import { getSellerDashboard } from '@/services/sellerService';

const numberFormatter = new Intl.NumberFormat('ko-KR');

const STATUS_BADGE = {
  APPROVED: {
    label: '승인 완료',
    className: 'bg-emerald-50 text-emerald-700',
  },
  PENDING: {
    label: '승인 대기',
    className: 'bg-amber-50 text-amber-700',
  },
  REJECTED: {
    label: '반려됨',
    className: 'bg-rose-50 text-rose-700',
  },
  DRAFT: {
    label: '임시 저장',
    className: 'bg-gray-100 text-gray-600',
  },
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return '일정 미정';
  }

  const formatter = new Intl.DateTimeFormat('ko', {
    month: '2-digit',
    day: '2-digit',
  });

  if (!startDate) {
    return `${formatter.format(new Date(endDate))} 종료`;
  }

  if (!endDate) {
    return `${formatter.format(new Date(startDate))} 시작`;
  }

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
};

const SellerDashboardPage = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['sellerDashboard'],
    queryFn: getSellerDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const profile = data?.profile;
  const stats = data?.stats;
  const popups = data?.popups ?? [];

  const popupStats = [
    {
      id: 'total',
      title: '등록한 팝업',
      value: numberFormatter.format(stats?.totalPopups ?? 0),
      meta: `${numberFormatter.format(stats?.activePopups ?? 0)}건 운영 중`,
      accent: 'bg-[#ffe5f3] text-[#c4006b]',
    },
    {
      id: 'pending',
      title: '승인 대기',
      value: numberFormatter.format(stats?.pendingPopups ?? 0),
      meta: '관리자 확인 중',
      accent: 'bg-[#fff2da] text-[#a85500]',
    },
    {
      id: 'rejected',
      title: '반려됨',
      value: numberFormatter.format(stats?.rejectedPopups ?? 0),
      meta: '보완 필요',
      accent: 'bg-[#ffe4e6] text-[#b42318]',
    },
    {
      id: 'favorites',
      title: '누적 찜',
      value: numberFormatter.format(stats?.totalFavorites ?? 0),
      meta: `${numberFormatter.format(stats?.totalViews ?? 0)}회 노출`,
      accent: 'bg-[#ecf5ff] text-[#1d4ed8]',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="h-40 animate-pulse rounded-3xl bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
        <p className="font-semibold">대시보드 데이터를 불러오지 못했습니다.</p>
        <p className="mt-1 text-rose-500">네트워크 상태를 확인한 뒤 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const topViewedPopups = [...popups]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">팝업 현황</p>
            <p className="text-lg font-semibold text-gray-900">
              {profile?.name ?? '판매자'}님의 플리마켓 활동 요약
            </p>
          </div>
          <Link
            to={ROUTES.seller.popupCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            새 팝업 등록
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {popupStats.map((card) => (
            <div key={card.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="mt-1 text-xs text-gray-500">{card.meta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">승인 현황</p>
          <p className="text-lg font-semibold text-gray-900">관리자 검토 리스트</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-amber-50/70 p-4 text-amber-900">
              <p className="text-sm font-semibold">승인 대기</p>
              <p className="mt-2 text-2xl font-bold">{numberFormatter.format(stats?.pendingPopups ?? 0)}</p>
              <p className="mt-1 text-xs text-amber-800/70">심사 중인 플리마켓 부스</p>
            </div>
            <div className="rounded-2xl bg-rose-50/70 p-4 text-rose-900">
              <p className="text-sm font-semibold">반려됨</p>
              <p className="mt-2 text-2xl font-bold">{numberFormatter.format(stats?.rejectedPopups ?? 0)}</p>
              <p className="mt-1 text-xs text-rose-800/70">보완이 필요한 항목</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
            승인 과정에서 문의가 오면 운영팀 메시지함으로 안내드릴게요.
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">조회수</p>
          <p className="text-lg font-semibold text-gray-900">상위 노출 부스</p>
          <div className="mt-4 space-y-3">
            {topViewedPopups.length > 0 ? (
              topViewedPopups.map((popup, index) => (
                <div
                  key={popup.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm text-gray-600"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {index + 1}. {popup.title}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateRange(popup.startDate, popup.endDate)}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    <Eye className="h-3.5 w-3.5" />
                    {numberFormatter.format(popup.viewCount ?? 0)}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                아직 조회수 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">팝업 관리</p>
            <p className="text-lg font-semibold text-gray-900">운영 리스트</p>
          </div>
          <Link to={ROUTES.seller.popups} className="text-xs font-semibold text-primary">
            전체 보기
          </Link>
        </div>
        <div className="mt-4 divide-y divide-gray-100">
          {popups.length > 0 ? (
            popups.slice(0, 6).map((popup) => {
              const badge = STATUS_BADGE[popup.status] ?? STATUS_BADGE.DRAFT;
              return (
                <div key={popup.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{popup.title}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        {formatDateRange(popup.startDate, popup.endDate)}
                      </span>
                      {popup.cellName ? (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {popup.cellName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
                    <span className={clsx('inline-flex rounded-full px-3 py-1', badge.className)}>{badge.label}</span>
                    {popup.viewCount ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        <Eye className="h-3.5 w-3.5" />
                        {numberFormatter.format(popup.viewCount)}
                      </span>
                    ) : null}
                    {popup.favoriteCount ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        <Heart className="h-3.5 w-3.5" />
                        {numberFormatter.format(popup.favoriteCount)}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              등록된 팝업이 없습니다. 새 팝업을 등록해보세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SellerDashboardPage;
