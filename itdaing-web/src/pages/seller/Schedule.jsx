import React, { useEffect, useState, useMemo } from "react";
import { CalendarDays, Clock, CheckCircle2, MapPin } from "lucide-react";
import { MyPageCalendar } from "../../components/consumer/MyPageCalendar";
import KakaoMap from "../../components/common/KakaoMap";
import { popupService } from "../../services/popupService";

function getPhase(startDate, endDate) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now < start) return "upcoming";
  if (start && end && now >= start && now <= end) return "ongoing";
  if (end && now > end) return "ended";
  return "upcoming";
}

export default function SellerSchedulePage() {
  const [myPopups, setMyPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    popupService.getMyPopups()
      .then((popups) => {
        if (cancelled) return;
        setMyPopups(popups || []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "팝업 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const ongoing = myPopups.filter(p => getPhase(p.startDate, p.endDate) === "ongoing").length;
    const upcoming = myPopups.filter(p => getPhase(p.startDate, p.endDate) === "upcoming").length;
    const ended = myPopups.filter(p => getPhase(p.startDate, p.endDate) === "ended").length;
    const pending = myPopups.filter(p => p.status === "PENDING").length;

    return { ongoing, upcoming, ended, pending, total: myPopups.length };
  }, [myPopups]);

  const mapMarkers = useMemo(() => {
    return myPopups
      .filter(p => p.latitude != null && p.longitude != null)
      .map(p => {
        const phase = getPhase(p.startDate, p.endDate);
        const colorMap = {
          ongoing: "#ef4444",    // 진행중: 빨강
          upcoming: "#f59e0b",   // 예정: 노랑
          ended: "#9ca3af",      // 종료: 회색
        };
        return {
          id: p.id,
          lat: p.latitude,
          lng: p.longitude,
          label: p.title,
          color: colorMap[phase] || "#9ca3af",
        };
      });
  }, [myPopups]);

  const mapCenter = useMemo(() => {
    if (mapMarkers.length === 0) {
      return { lat: 35.14667451156048, lng: 126.92227158987355 };
    }
    const avgLat = mapMarkers.reduce((sum, m) => sum + m.lat, 0) / mapMarkers.length;
    const avgLng = mapMarkers.reduce((sum, m) => sum + m.lng, 0) / mapMarkers.length;
    return { lat: avgLat, lng: avgLng };
  }, [mapMarkers]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">운영 일정</h1>
        <p className="text-sm text-gray-500">승인된 팝업 일정과 준비 현황을 관리하세요.</p>
      </header>
      
      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-[#eb0000]">
            <CalendarDays className="size-5" />
            <p className="text-sm font-semibold">이번 달 진행 예정</p>
          </div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.upcoming}건</p>
          <p className="mt-1 text-xs text-gray-500">승인 완료 후 준비 중인 팝업</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-[#2563eb]">
            <Clock className="size-5" />
            <p className="text-sm font-semibold">검토 중</p>
          </div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.pending}건</p>
          <p className="mt-1 text-xs text-gray-500">행정 승인 대기 팝업</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 text-[#16a34a]">
            <CheckCircle2 className="size-5" />
            <p className="text-sm font-semibold">완료</p>
          </div>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{stats.ended}건</p>
          <p className="mt-1 text-xs text-gray-500">올해 진행 완료된 팝업</p>
        </div>
      </section>

      {/* 팝업 위치 지도 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="size-5 text-[#eb0000]" />
          <h2 className="text-lg font-semibold">내 팝업 위치</h2>
        </div>
        {loading ? (
          <div className="h-[300px] md:h-[400px] flex items-center justify-center bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="h-[300px] md:h-[400px] flex items-center justify-center bg-red-50 rounded-2xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : mapMarkers.length === 0 ? (
          <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl gap-2">
            <MapPin className="size-12 text-gray-300" />
            <p className="text-sm text-gray-500">등록된 팝업이 없습니다.</p>
          </div>
        ) : (
          <div>
            <KakaoMap
              center={mapCenter}
              markers={mapMarkers}
              height="h-[300px] md:h-[400px]"
              level={5}
              showControls={true}
            />
            <div className="mt-4 flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                <span>진행중 ({myPopups.filter(p => getPhase(p.startDate, p.endDate) === "ongoing").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span>예정 ({myPopups.filter(p => getPhase(p.startDate, p.endDate) === "upcoming").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#9ca3af]"></div>
                <span>종료 ({myPopups.filter(p => getPhase(p.startDate, p.endDate) === "ended").length})</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <MyPageCalendar />
      </section>
    </div>
  );
}

