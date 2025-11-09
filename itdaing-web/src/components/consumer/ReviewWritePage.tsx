import React, { useState } from "react";
interface ReviewWritePageProps { onBack:()=>void; onMyPageClick?:()=>void; onNearbyExploreClick?:()=>void; onClose:()=>void; }
export function ReviewWritePage({ onBack, onMyPageClick, onNearbyExploreClick, onClose }: ReviewWritePageProps){
	const [content,setContent]=useState("");
	const [rating,setRating]=useState(3);
	return (
		<div className="min-h-screen bg-white p-6 pt-24">
			<div className="max-w-[640px] mx-auto space-y-4">
				<h1 className="text-xl font-bold">후기 작성</h1>
				<div className="flex gap-2">{[1,2,3,4,5].map(i => <button key={i} onClick={()=>setRating(i)} className={`w-8 h-8 rounded ${i<=rating?"bg-[#eb0000] text-white":"bg-gray-200"}`}>{i}</button>)}</div>
				<textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full h-40 border rounded p-3 focus:outline-none focus:border-[#eb0000]" placeholder="후기를 입력하세요" />
				<div className="flex gap-3">
					<button onClick={onBack} className="px-4 py-2 rounded bg-gray-200">뒤로</button>
					<button onClick={()=>{console.log("saved",{content,rating}); onMyPageClick?.();}} className="px-4 py-2 rounded bg-[#eb0000] text-white">저장</button>
					<button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">닫기</button>
					<button onClick={onNearbyExploreClick} className="px-4 py-2 rounded bg-gray-100">근처 탐색</button>
				</div>
			</div>
		</div>
	);
}
export default ReviewWritePage;
