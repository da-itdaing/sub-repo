import React, { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { usePopups } from "../../hooks/usePopups";

export function MyPageCalendar({ scheduledPopupIds, onPopupClick }){
	const { data: popupList } = usePopups();
	const schedules = useMemo(() => {
		const source = popupList ?? [];
		const filtered = scheduledPopupIds && scheduledPopupIds.length > 0
			? source.filter(p => scheduledPopupIds.includes(p.id))
			: source.slice(0, 6);
		return filtered.map(p => ({
			id: p.id,
			title: p.title,
			start: p.startDate,
			end: p.endDate,
			location: p.locationName ?? ""
		}));
	}, [popupList, scheduledPopupIds]);
	return (
		<div className="p-4 space-y-4">
			<h2 className="text-lg font-semibold flex items-center gap-2">
				<CalendarDays className="size-5 text-[#eb0000]" />
				내 일정
			</h2>
			<div className="space-y-3">
				{schedules.map(item => (
					<button
						key={item.id}
						onClick={() => onPopupClick?.(item.id)}
						className="w-full text-left border rounded-lg p-4 bg-white hover:border-[#eb0000] transition-colors"
					>
						<p className="font-semibold text-sm">{item.title}</p>
						<p className="text-xs text-[#4d4d4d] mt-1">{item.start} ~ {item.end}</p>
						{item.location && <p className="text-xs text-[#6b6b6b] mt-1">{item.location}</p>}
					</button>
				))}
				{schedules.length === 0 && (
					<p className="text-sm text-[#4d4d4d]">예정된 일정이 없습니다.</p>
				)}
			</div>
		</div>
	);
}
export default MyPageCalendar;
