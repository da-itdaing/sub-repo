import React from "react";
import { Star } from "lucide-react";
import { useAllReviews, usePopups } from "../../hooks/usePopups";

export function MyPageReviews({ authorId }){
	const { data: popups } = usePopups();
	const { reviews, loading } = useAllReviews({ authorId });
	if (loading) {
		return <div className="p-4 text-sm text-[#4d4d4d]">후기를 불러오는 중입니다...</div>;
	}
	if (!reviews || reviews.length === 0) {
		return <div className="p-4 text-sm text-[#4d4d4d]">작성한 후기가 없습니다.</div>;
	}
	return (
		<div className="p-4 space-y-4">
			{reviews.map(r => {
				const popupTitle = popups?.find(p => p.id === r.popupId)?.title ?? "팝업";
				return (
					<div key={r.id} className="border rounded p-4 bg-white">
						<p className="text-xs text-[#eb0000] mb-1">{popupTitle}</p>
						<p className="font-semibold mb-1">{r.content?.length > 0 ? r.content.slice(0, 30) : "내용 없음"}{r.content?.length > 30 ? "..." : ""}</p>
						<p className="text-xs text-[#4d4d4d] mb-2">{r.date}</p>
						<div className="flex mb-2">
							{[1,2,3,4,5].map(i => (
								<Star
									key={i}
									className="w-4 h-4"
									fill={i<=r.rating ? "#EB0000" : "none"}
									stroke={i<=r.rating ? "#EB0000" : "#9A9A9A"}
								/>
							))}
						</div>
						<p className="text-sm whitespace-pre-line">{r.content}</p>
					</div>
				);
			})}
		</div>
	);
}
export default MyPageReviews;
