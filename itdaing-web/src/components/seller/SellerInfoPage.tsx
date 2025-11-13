import React, { useMemo } from "react";
import { usePopups, useSellerById } from "../../hooks/usePopups";
interface SellerInfoPageProps { sellerId:number; onClose:()=>void; onMyPageClick?:()=>void; onPopupClick?:(id:number)=>void }
export function SellerInfoPage({ sellerId, onClose, onMyPageClick, onPopupClick }: SellerInfoPageProps){
	const { seller, loading: sellerLoading, error: sellerError } = useSellerById(sellerId);
	const { data: popupList, loading: popupsLoading, error: popupsError } = usePopups();
	const sellerPopups = (popupList ?? []).filter(p=> p.sellerId === sellerId);
	const defaultSellerImage = useMemo(
		() => "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
		[]
	);

	if (sellerLoading || popupsLoading) {
		return <div className="pt-24 p-6 text-gray-500">판매자 정보를 불러오는 중입니다...</div>;
	}
	if (sellerError) {
		return <div className="pt-24 p-6 text-gray-500">판매자 정보를 불러오지 못했습니다.</div>;
	}
	if(!seller) return <div className="pt-24 p-6">판매자 정보를 찾을 수 없습니다.</div>;
	if (popupsError) {
		return <div className="pt-24 p-6 text-gray-500">판매자 팝업 정보를 불러오지 못했습니다.</div>;
	}
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
				<div className="flex flex-col md:flex-row gap-6">
					<div className="w-32 h-32 flex-shrink-0">
						<img
							src={seller.profileImage ?? defaultSellerImage}
							alt={seller.name}
							className="w-full h-full object-cover rounded-full border border-gray-100 shadow-sm"
						/>
					</div>
					<div className="flex-1 space-y-2 text-sm text-[#4d4d4d]">
						<p className="whitespace-pre-line">{seller.description ?? "소개 정보가 준비중입니다."}</p>
						<div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
							<p><span className="font-semibold text-gray-900">활동 지역</span> {seller.mainArea ?? "미정"}</p>
							<p><span className="font-semibold text-gray-900">카테고리</span> {seller.category ?? "미분류"}</p>
							<p><span className="font-semibold text-gray-900">이메일</span> {seller.email}</p>
							<p><span className="font-semibold text-gray-900">연락처</span> {seller.phone ?? "제공되지 않음"}</p>
							{seller.sns && (
								<p className="sm:col-span-2"><span className="font-semibold text-gray-900">SNS</span> {seller.sns}</p>
							)}
						</div>
					</div>
				</div>
				<div>
					<h2 className="text-lg font-semibold mb-3">판매자의 팝업 ({sellerPopups.length})</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{sellerPopups.map(p => (
							<button key={p.id} onClick={()=>onPopupClick?.(p.id)} className="text-left border rounded p-3 bg-white shadow-sm hover:shadow">
								<img alt={p.title} src={p.thumbnail} className="w-full h-32 object-cover rounded mb-2" />
								<p className="font-semibold text-sm mb-1 line-clamp-2">{p.title}</p>
								<p className="text-xs text-[#4d4d4d] mb-1">{p.startDate} ~ {p.endDate}</p>
								<p className="text-xs">조회수 {p.viewCount} / 좋아요 {p.favoriteCount}</p>
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
