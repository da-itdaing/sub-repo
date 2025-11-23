import KpiCard from '@/components/seller/dashboard/KpiCard';
import { ShieldCheck, Users, Store, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const KPI_CARDS = [
  {
    id: 'users',
    title: '전체 회원',
    value: '18,420명',
    meta: '+240 오늘 가입',
    icon: Users,
    accent: 'bg-blue-50 text-blue-600',
    trend: 'up',
  },
  {
    id: 'sellers',
    title: '판매자 계정',
    value: '1,280명',
    meta: '승인 대기 34건',
    icon: Store,
    accent: 'bg-emerald-50 text-emerald-600',
    trend: 'neutral',
  },
  {
    id: 'approvals',
    title: '승인 요청',
    value: '52건',
    meta: '긴급 3건',
    icon: ShieldCheck,
    accent: 'bg-purple-50 text-purple-600',
    trend: 'down',
  },
  {
    id: 'alerts',
    title: '보안 알림',
    value: '2건',
    meta: '모두 처리 필요',
    icon: AlertTriangle,
    accent: 'bg-rose-50 text-rose-600',
    trend: 'down',
  },
];

const APPROVAL_QUEUE = [
  {
    id: 'REQ-1245',
    type: '팝업 등록',
    applicant: 'seller1',
    submittedAt: '11-23 09:12',
    status: '대기',
    eta: '2시간 전',
  },
  {
    id: 'REQ-1242',
    type: '판매자 신규 가입',
    applicant: 'citypopup',
    submittedAt: '11-22 21:03',
    status: '검토중',
    eta: '14시간 전',
  },
  {
    id: 'REQ-1239',
    type: '팝업 일정 변경',
    applicant: 'urbanmarket',
    submittedAt: '11-22 15:40',
    status: '대기',
    eta: '20시간 전',
  },
  {
    id: 'REQ-1232',
    type: '스팸 신고',
    applicant: 'consumer9',
    submittedAt: '11-21 18:15',
    status: '처리중',
    eta: '1일 전',
  },
];

const SLA_CARDS = [
  {
    id: 'seller-approval',
    label: '판매자 승인 SLA',
    value: '89%',
    detail: '목표 95%',
    icon: Clock,
  },
  {
    id: 'popup-approval',
    label: '팝업 승인 SLA',
    value: '94%',
    detail: '목표 92%',
    icon: CheckCircle2,
  },
];

const AdminDashboardPage = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((card) => (
          <KpiCard key={card.id} {...card} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm shadow-slate-200/60 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">승인 큐</p>
              <h3 className="text-lg font-semibold text-gray-900">최근 요청 현황</h3>
            </div>
            <button className="text-xs font-semibold text-primary hover:text-primary/80">전체 보기</button>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">구분</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">신청자</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">접수 시각</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {APPROVAL_QUEUE.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.id}</td>
                    <td className="px-4 py-3 text-gray-600">{item.type}</td>
                    <td className="px-4 py-3 text-gray-600">{item.applicant}</td>
                    <td className="px-4 py-3 text-gray-500">{item.submittedAt}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {SLA_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm shadow-slate-200/60"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                    <p className="text-xs text-gray-500">{card.detail}</p>
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;

