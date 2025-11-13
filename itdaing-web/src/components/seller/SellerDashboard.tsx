import React from "react";
import { usePopups, useSellerById } from "../../hooks/usePopups";

interface SellerDashboardProps {
	sellerId: number;
}

export function SellerDashboard({ sellerId }: SellerDashboardProps){
	const { seller, loading: sellerLoading } = useSellerById(sellerId);
	const { data: popupList, loading: popupsLoading } = usePopups();
	const myPopups = (popupList ?? []).filter(p=> p.sellerId === sellerId);
	const defaultSellerImage = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop";

	return (
		<div className="space-y-6">
			<section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
				<h1 className="text-2xl font-semibold text-gray-900">판매자 대시보드</h1>
				<p className="text-sm text-gray-500 mt-2">브랜드 프로필과 운영 중인 팝업 현황을 확인하세요.</p>
				<div className="mt-6">
					<h2 className="text-lg font-semibold mb-3">판매자 정보</h2>
					{sellerLoading ? (
						<p className="text-sm text-[#4d4d4d]">판매자 정보를 불러오는 중입니다...</p>
					) : seller ? (
						<div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
							<div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 shadow-sm">
								<img
									src={seller.profileImage ?? defaultSellerImage}
									alt={seller.name}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="space-y-1">
								<p><span className="font-semibold text-gray-900">이름</span> {seller.name}</p>
								<p><span className="font-semibold text-gray-900">소개</span> {seller.description ?? "소개 정보가 준비중입니다."}</p>
								<p><span className="font-semibold text-gray-900">활동 지역</span> {seller.mainArea ?? "미정"}</p>
								<p><span className="font-semibold text-gray-900">카테고리</span> {seller.category ?? "미분류"}</p>
								<p><span className="font-semibold text-gray-900">연락처</span> {seller.phone ?? "제공되지 않음"}</p>
							</div>
						</div>
					) : (
						<p className="text-sm text-[#4d4d4d]">판매자 정보를 찾을 수 없습니다.</p>
					)}
				</div>
			</section>

			<section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-gray-900">내 팝업 ({myPopups.length})</h2>
					<button className="px-4 py-2 rounded-full border border-gray-300 text-xs text-gray-600 hover:border-gray-400">
						전체 보기
					</button>
				</div>
				{popupsLoading && <p className="text-sm text-[#4d4d4d]">팝업 정보를 불러오는 중입니다...</p>}
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{myPopups.map(p => (
						<article key={p.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
							<img alt={p.title} src={p.thumbnail} className="w-full h-32 object-cover" />
							<div className="p-4 space-y-2">
								<p className="text-xs font-semibold text-[#eb0000] uppercase">{p.status}</p>
								<p className="font-semibold text-sm text-gray-900 line-clamp-2">{p.title}</p>
								<p className="text-xs text-[#4d4d4d]">{p.startDate} ~ {p.endDate}</p>
								<p className="text-xs text-[#4d4d4d]">셀: {p.cellName ?? "미배정"}</p>
								<div className="flex items-center justify-between text-xs text-gray-500">
									<span>관심 {p.favoriteCount ?? 0}</span>
									<span>조회 {p.viewCount}</span>
								</div>
							</div>
						</article>
					))}
					{!popupsLoading && myPopups.length === 0 && (
						<div className="border border-dashed border-gray-300 rounded-2xl p-6 text-sm text-gray-500">
							등록된 팝업이 없습니다. 팝업을 신청해보세요.
						</div>
					)}
				</div>
			</section>
		</div>
	);
}

export default SellerDashboard;
