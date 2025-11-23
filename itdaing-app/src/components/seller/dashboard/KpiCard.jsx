import clsx from 'clsx';

const trendColorMap = {
  up: 'text-green-600',
  down: 'text-red-500',
  neutral: 'text-gray-500',
};

const KpiCard = ({ title, value, meta, icon: Icon, accent = 'bg-primary/10 text-primary', trend = 'neutral' }) => {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {Icon ? (
          <div className={clsx('rounded-2xl p-3', accent)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {meta ? (
        <p className={clsx('mt-4 text-sm font-semibold', trendColorMap[trend] ?? trendColorMap.neutral)}>
          {meta}
        </p>
      ) : null}
    </div>
  );
};

export default KpiCard;

