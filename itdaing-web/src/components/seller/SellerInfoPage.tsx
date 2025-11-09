import React from "react";
import { getSellerById } from "../../data/sellers";
import { popups } from "../../data/popups";
interface SellerInfoPageProps { sellerId:number; onClose:()=>void; onMyPageClick?:()=>void; onPopupClick?:(id:number)=>void }
export function SellerInfoPage({ sellerId, onClose, onMyPageClick, onPopupClick }: SellerInfoPageProps){
	const seller = getSellerById(sellerId);
	const sellerPopups = popups.filter(p=> p.sellerId === sellerId);
	if(!seller) return <div className="pt-24 p-6">판매자 정보를 찾을 수 없습니다.</div>;
	return (
		<div className="min-h-screen bg-white pt-24 p-6">
			<div className="max-w-[930px] mx-auto space-y-8">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold">{seller.name}</h1>
					<div className="flex gap-2">
						<button onClick={onMyPageClick} className="px-3 py-2 rounded bg-gray-100">마이페이지</button>
						<button onClick={onClose} className="px-3 py-2 rounded bg-gray-200">닫기</button>
					</div>
				</div>
				<p className="text-sm text-[#4d4d4d] whitespace-pre-line">{seller.description}</p>
				<div>
					<h2 className="text-lg font-semibold mb-3">판매자의 팝업 ({sellerPopups.length})</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{sellerPopups.map(p => (
							<button key={p.id} onClick={()=>onPopupClick?.(p.id)} className="text-left border rounded p-3 bg-white shadow-sm hover:shadow">
								<img alt={p.title} src={p.images[0]} className="w-full h-32 object-cover rounded mb-2" />
								<p className="font-semibold text-sm mb-1 line-clamp-2">{p.title}</p>
								<p className="text-xs text-[#4d4d4d] mb-1">{p.date}</p>
								<p className="text-xs">조회수 {p.views} / 좋아요 {p.likes}</p>
							</button>
						))}
						{sellerPopups.length === 0 && <p className="text-sm text-[#4d4d4d]">등록된 팝업이 없습니다.</p>}
					</div>
				</div>
			</div>
		</div>
	);
}
export default SellerInfoPage;
