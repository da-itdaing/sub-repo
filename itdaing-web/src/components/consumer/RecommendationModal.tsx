import React from "react";
import { getPopupById } from "../../data/popups";
interface RecommendationModalProps { onClose:()=>void; onDismissToday:()=>void; onPopupClick:(id:number)=>void }
export function RecommendationModal({ onClose, onDismissToday, onPopupClick }: RecommendationModalProps){
	const popup = getPopupById(1);
	if(!popup) return null;
	return (
		<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-[340px] shadow-xl space-y-4">
				<h2 className="text-lg font-semibold">오늘의 추천 팝업</h2>
				<div className="space-y-2">
					<p className="font-bold">{popup.title}</p>
					<p className="text-xs text-[#4d4d4d]">{popup.date}</p>
				</div>
				<div className="flex gap-2">
					<button onClick={()=>onPopupClick(popup.id)} className="flex-1 bg-[#eb0000] text-white rounded px-3 py-2">바로 보기</button>
					<button onClick={onDismissToday} className="flex-1 bg-gray-200 rounded px-3 py-2">오늘 그만 보기</button>
				</div>
				<button onClick={onClose} className="w-full text-sm text-[#4d4d4d] underline">닫기</button>
			</div>
		</div>
	);
}
export default RecommendationModal;
