import React from "react";

export function MyPageCalendar(){
	const days = Array.from({length:30},(_,i)=> i+1);
	return (
		<div className="p-4">
			<h2 className="text-lg font-semibold mb-4">간단 캘린더 (샘플)</h2>
			<div className="grid grid-cols-7 gap-2">
				{days.map(d => <div key={d} className="h-12 flex items-center justify-center bg-white border rounded text-sm">{d}</div>)}
			</div>
		</div>
	);
}
export default MyPageCalendar;
