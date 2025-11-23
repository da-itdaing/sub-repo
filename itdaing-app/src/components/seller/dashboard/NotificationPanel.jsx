import clsx from 'clsx';

const TYPE_COLOR = {
  alert: 'text-red-500 bg-red-50',
  info: 'text-blue-500 bg-blue-50',
  success: 'text-emerald-500 bg-emerald-50',
};

const NotificationPanel = ({ items = [] }) => {
  return (
    <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">알림</p>
          <h3 className="text-lg font-semibold text-gray-900">승인 및 운영 소식</h3>
        </div>
        <button className="text-xs font-semibold text-gray-500 hover:text-gray-900">모두 읽음 처리</button>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((notification) => (
          <div
            key={notification.id}
            className="rounded-2xl border border-gray-100 bg-linear-to-r from-white via-white to-slate-50/60 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between text-sm">
              <span
                className={clsx(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                  TYPE_COLOR[notification.type] ?? TYPE_COLOR.info
                )}
              >
                {notification.typeLabel}
              </span>
              <span className="text-xs text-gray-400">{notification.timeAgo}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-900">{notification.title}</p>
            <p className="text-xs text-gray-500">{notification.description}</p>
          </div>
        ))}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            아직 새로운 알림이 없습니다.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NotificationPanel;

