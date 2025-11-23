import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '@/routes/paths';

const STATUS_STYLE = {
  진행중: 'bg-emerald-50 text-emerald-700',
  진행전: 'bg-blue-50 text-blue-700',
  대기: 'bg-amber-50 text-amber-700',
};

const UpcomingPopupsList = ({ items = [] }) => {
  return (
    <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">이번 주 일정</p>
          <h3 className="text-lg font-semibold text-gray-900">곧 오픈할 팝업</h3>
        </div>
        <Link to={ROUTES.seller.popups} className="text-sm font-medium text-primary hover:text-primary/80">
          전체 보기 →
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((popup) => (
          <div
            key={popup.id}
            className="rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-primary/30 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{popup.title}</p>
                <p className="text-xs text-gray-500">{popup.brand}</p>
              </div>
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  STATUS_STYLE[popup.status] ?? 'bg-gray-100 text-gray-700'
                )}
              >
                {popup.statusLabel}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                {popup.dateRange}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {popup.location}
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            예정된 팝업이 없습니다. 새 팝업을 등록해보세요.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UpcomingPopupsList;

