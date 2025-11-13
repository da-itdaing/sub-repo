import React, { useEffect, useState } from "react";
import { MapPin, Layers, Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { geoService, AreaResponse, ZoneResponse, CellResponse } from "../../services/geoService";
import { AreaFormDialog } from "../../components/admin/AreaFormDialog";
import { CellFormDialog } from "../../components/admin/CellFormDialog";
import { KakaoMapCellSelector } from "../../components/admin/KakaoMapCellSelector";

type TabType = 'areas' | 'zones' | 'cells';

export default function AdminZoneManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('areas');
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [cells, setCells] = useState<CellResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showCellForm, setShowCellForm] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaResponse | null>(null);
  const [editingCell, setEditingCell] = useState<CellResponse | null>(null);
  const [selectedAreaForMap, setSelectedAreaForMap] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
    // Cells 탭일 때는 areas도 함께 로드
    if (activeTab === 'cells' && areas.length === 0) {
      geoService.getAreas(undefined, 0, 100).then(response => {
        setAreas(response.items);
      }).catch(() => {
        // 에러는 무시 (이미 loadData에서 처리됨)
      });
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'areas') {
        const response = await geoService.getAreas(searchKeyword || undefined, 0, 100);
        setAreas(response.items);
      } else if (activeTab === 'zones') {
        const response = await geoService.getZones(undefined, 0, 100);
        setZones(response.items);
      } else if (activeTab === 'cells') {
        const response = await geoService.getCells(undefined, undefined, undefined, 0, 100);
        setCells(response.items);
      }
    } catch (error: any) {
      toast.error(error.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (areaId: number) => {
    if (!confirm('정말 이 구역을 삭제하시겠습니까?')) return;
    try {
      await geoService.deleteArea(areaId);
      toast.success('구역이 삭제되었습니다.');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '구역 삭제에 실패했습니다.');
    }
  };

  const handleDeleteCell = async (cellId: number) => {
    if (!confirm('정말 이 셀을 삭제하시겠습니까?')) return;
    try {
      await geoService.deleteCell(cellId);
      toast.success('셀이 삭제되었습니다.');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '셀 삭제에 실패했습니다.');
    }
  };

  const handleUpdateZoneStatus = async (zoneId: number, status: 'APPROVED' | 'REJECTED' | 'HIDDEN') => {
    try {
      await geoService.updateZoneStatus(zoneId, status);
      toast.success('존 상태가 변경되었습니다.');
      loadData();
    } catch (error: any) {
      toast.error(error.message || '존 상태 변경에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">존 / 셀 관리</h1>
          <p className="text-sm text-gray-500">구역, 존, 셀을 생성 · 편집하세요.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('areas')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'areas'
                ? 'border-[#111827] text-[#111827]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            구역 (Areas)
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'zones'
                ? 'border-[#111827] text-[#111827]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            존 (Zones)
          </button>
          <button
            onClick={() => setActiveTab('cells')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === 'cells'
                ? 'border-[#111827] text-[#111827]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            셀 (Cells)
          </button>
        </nav>
      </div>

      {/* Search */}
      {activeTab === 'areas' && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="구역 이름 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadData();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-[#0f172a] transition"
          >
            검색
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : (
        <>
          {/* Areas Tab */}
          {activeTab === 'areas' && (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEditingArea(null);
                    setShowAreaForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-[#0f172a] transition"
                >
                  <Plus className="size-4" />
                  구역 추가
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {areas.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    등록된 구역이 없습니다.
                  </div>
                ) : (
                  areas.map(area => (
                    <article key={area.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <MapPin className="size-4 text-[#ef4444]" />
                          {area.name}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedAreaForMap(area.id);
                              setActiveTab('cells');
                              // 해당 Area의 Cells 로드
                              geoService.getCells(area.id, undefined, undefined, 0, 100).then(response => {
                                setCells(response.items);
                              }).catch(() => {
                                // 에러는 무시
                              });
                            }}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="셀 관리"
                          >
                            셀 관리
                          </button>
                          <button
                            onClick={() => {
                              setEditingArea(area);
                              setShowAreaForm(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="수정"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArea(area.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="삭제"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>상태: <span className="font-medium">{area.status}</span></p>
                        {area.maxCapacity && <p>최대 수용: {area.maxCapacity}개</p>}
                        {area.regionId && <p>지역 ID: {area.regionId}</p>}
                      </div>
                      {area.notice && (
                        <p className="text-xs text-gray-600 line-clamp-2">{area.notice}</p>
                      )}
                    </article>
                  ))
                )}
              </div>
              <AreaFormDialog
                isOpen={showAreaForm}
                onClose={() => {
                  setShowAreaForm(false);
                  setEditingArea(null);
                }}
                onSuccess={(createdAreaId) => {
                  loadData();
                  // Area 생성 후 자동으로 선택하고 Cells 탭으로 전환
                  if (createdAreaId) {
                    setSelectedAreaForMap(createdAreaId);
                    setActiveTab('cells');
                    // Cells 탭의 데이터도 로드
                    geoService.getCells(createdAreaId, undefined, undefined, 0, 100).then(response => {
                      setCells(response.items);
                    }).catch(() => {
                      // 에러는 무시
                    });
                  }
                }}
                area={editingArea}
              />
            </>
          )}

          {/* Zones Tab */}
          {activeTab === 'zones' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">존 목록</h2>
              </div>
              {zones.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  등록된 존이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {zones.map(zone => (
                    <div key={zone.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {zone.label || `존 #${zone.id}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          구역 ID: {zone.areaId} · 소유자 ID: {zone.ownerId} · 좌표: ({zone.lat}, {zone.lng})
                        </p>
                        {zone.detailedAddress && (
                          <p className="text-xs text-gray-500 mt-1">{zone.detailedAddress}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          zone.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          zone.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          zone.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {zone.status}
                        </span>
                        {zone.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateZoneStatus(zone.id, 'APPROVED')}
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleUpdateZoneStatus(zone.id, 'REJECTED')}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              거부
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cells Tab */}
          {activeTab === 'cells' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">셀 목록</h2>
                  <button
                    onClick={() => {
                      setEditingCell(null);
                      setShowCellForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm rounded-lg hover:bg-[#0f172a] transition"
                  >
                    <Plus className="size-4" />
                    셀 추가
                  </button>
                </div>
              {cells.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  등록된 셀이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cells.map(cell => (
                    <div key={cell.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {cell.label || `셀 #${cell.id}`}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            cell.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            cell.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            cell.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {cell.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          구역: {cell.areaName} (ID: {cell.areaId}) · 소유자: {cell.ownerLoginId} (ID: {cell.ownerId})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          좌표: ({cell.lat}, {cell.lng})
                        </p>
                        {cell.detailedAddress && (
                          <p className="text-xs text-gray-500 mt-1">{cell.detailedAddress}</p>
                        )}
                        {cell.maxCapacity && (
                          <p className="text-xs text-gray-500 mt-1">최대 수용: {cell.maxCapacity}개</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingCell(cell);
                            setShowCellForm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="수정"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCell(cell.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="삭제"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
              <CellFormDialog
                isOpen={showCellForm}
                onClose={() => {
                  setShowCellForm(false);
                  setEditingCell(null);
                }}
                onSuccess={loadData}
                cell={editingCell}
                areas={areas}
                defaultAreaId={selectedAreaForMap}
              />
            </>
          )}
        </>
      )}

      {/* Map Preview Section */}
      {activeTab === 'cells' && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">셀 위치 지도</h2>
          {areas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              구역을 먼저 생성해주세요.
            </div>
          ) : (
            <KakaoMapCellSelector
              areas={areas}
              cells={cells}
              selectedAreaId={selectedAreaForMap}
              onAreaSelect={setSelectedAreaForMap}
              onCellClick={(cellId) => {
                const cell = cells.find(c => c.id === cellId);
                if (cell) {
                  setEditingCell(cell);
                  setShowCellForm(true);
                }
              }}
              height="500px"
            />
          )}
        </section>
      )}

      {/* Info Banner */}
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">✅ 카카오맵 API 연동 완료</p>
        <p>카카오맵 DrawingManager를 사용하여 구역(Area) 폴리곤을 그릴 수 있고, 셀(Cell) 위치를 지도에서 선택할 수 있습니다.</p>
      </section>
    </div>
  );
}
