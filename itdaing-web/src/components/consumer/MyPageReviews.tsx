import React from "react";
import { Star } from "lucide-react";
export function MyPageReviews(){
	const reviews = [
		{ id:1, title:"샘플 후기", date:"2025.10.28", rating:4, content:"후기 내용", images:[] }
	];
	return (
		<div className="p-4 space-y-4">
			{reviews.map(r => (
				<div key={r.id} className="border rounded p-4 bg-white">
					<p className="font-semibold mb-1">{r.title}</p>
					<p className="text-xs text-[#4d4d4d] mb-2">{r.date}</p>
					<div className="flex mb-2">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4" fill={i<=r.rating?"#EB0000":"none"} stroke={i<=r.rating?"#EB0000":"#9A9A9A"} />)}</div>
					<p className="text-sm whitespace-pre-line">{r.content}</p>
				</div>
			))}
		</div>
	);
}
export default MyPageReviews;
