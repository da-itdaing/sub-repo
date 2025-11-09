import React from "react";
interface NearbyExplorePageProps { onMainClick?:()=>void; onMyPageClick?:()=>void; isLoggedIn?:boolean; onLoginClick?:()=>void; onLogoutClick?:()=>void; onPopupClick?:(id:number)=>void }
export function NearbyExplorePage({ onMainClick, onMyPageClick, isLoggedIn, onLoginClick, onLogoutClick }: NearbyExplorePageProps){
	return (
		<div className="min-h-screen bg-white pt-24 p-4">
			<h1 className="text-xl font-bold mb-4">근처 탐색 (샘플)</h1>
			<p className="text-sm text-[#4d4d4d] mb-6">지도 / 위치 기반 탐색 기능은 여기서 구현될 예정입니다.</p>
			<div className="flex gap-3">
				<button onClick={onMainClick} className="px-3 py-2 bg-gray-100 rounded">메인으로</button>
				<button onClick={onMyPageClick} className="px-3 py-2 bg-gray-100 rounded">마이페이지</button>
				{!isLoggedIn && <button onClick={onLoginClick} className="px-3 py-2 bg-[#eb0000] text-white rounded">로그인</button>}
				{isLoggedIn && <button onClick={onLogoutClick} className="px-3 py-2 bg-gray-200 rounded">로그아웃</button>}
			</div>
		</div>
	);
}
export default NearbyExplorePage;
