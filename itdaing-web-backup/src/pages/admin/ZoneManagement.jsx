import ZoneManage from "../../components/admin/ZoneManage";

export default function AdminZoneManagementPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">존 / 셀 관리</h1>
          <p className="text-sm text-gray-500">카카오맵 도면 기반으로 존과 셀을 생성 · 편집하세요.</p>
        </div>
      </header>
      <ZoneManage />
    </div>
  );
}

