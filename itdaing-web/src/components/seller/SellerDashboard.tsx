import React from "react";
import { getSellerById } from "../../data/sellers";
import { popups } from "../../data/popups";
interface SellerDashboardProps { sellerId:number; onClose:()=>void; onLogout?:()=>void }
export function SellerDashboard({ sellerId, onClose, onLogout }: SellerDashboardProps){
	const seller = getSellerById(sellerId);
	const myPopups = popups.filter(p=> p.sellerId === sellerId);
	return (
		<div className="min-h-screen bg-white pt-24 p-6">
			<div className="max-w-[960px] mx-auto space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold">판매자 대시보드</h1>
					<div className="flex gap-2">
						<button onClick={onClose} className="px-3 py-2 rounded bg-gray-100">메인</button>
						<button onClick={onLogout} className="px-3 py-2 rounded bg-gray-200">로그아웃</button>
					</div>
				</div>
				<div className="bg-white border rounded p-4">
					<h2 className="text-lg font-semibold mb-2">판매자 정보</h2>
					{seller ? (
						<div className="text-sm">
							<p><span className="font-semibold">이름:</span> {seller.name}</p>
							<p><span className="font-semibold">소개:</span> {seller.description}</p>
						</div>
					) : <p className="text-sm text-[#4d4d4d]">판매자 정보를 찾을 수 없습니다.</p>}
				</div>
				<div className="bg-white border rounded p-4">
					<h2 className="text-lg font-semibold mb-3">내 팝업 ({myPopups.length})</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{myPopups.map(p => (
							<div key={p.id} className="border rounded p-3 bg-white shadow-sm">
								<img alt={p.title} src={p.images[0]} className="w-full h-32 object-cover rounded mb-2" />
								<p className="font-semibold text-sm mb-1 line-clamp-2">{p.title}</p>
								<p className="text-xs text-[#4d4d4d] mb-1">{p.date}</p>
								<p className="text-xs">조회수 {p.views} / 좋아요 {p.likes}</p>
							</div>
						))}
						{myPopups.length === 0 && <p className="text-sm text-[#4d4d4d]">등록된 팝업이 없습니다.</p>}
					</div>
				</div>
			</div>
		</div>
	);
}
export default SellerDashboard;
