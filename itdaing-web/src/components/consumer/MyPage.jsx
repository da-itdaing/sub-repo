import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Heart, LogOut, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { usePopups } from "../../hooks/usePopups.js";
import { MyPageFavorites } from "./MyPageFavorites.jsx";
import { MyPageReviews } from "./MyPageReviews.jsx";
import { MyPageCalendar } from "./MyPageCalendar.jsx";
import { getImageUrl } from "../../utils/imageUtils.js";

const TAB_LIST = [
	{ key: "recommend", label: "맞춤 추천" },
	{ key: "favorites", label: "관심 팝업" },
	{ key: "reviews", label: "내 후기" },
	{ key: "schedule", label: "일정" }
];

export function MyPage({ onClose, onPopupClick, onRecommendClick }){
	const { user, logout } = useAuth();
	const { profile, refreshProfile, loading: profileLoading } = useUser();
	const { data: popupList } = usePopups();
	const [activeTab, setActiveTab] = useState("recommend");

	useEffect(() => {
		if (!profile && user?.role === "CONSUMER") {
			void refreshProfile();
		}
	}, [profile, refreshProfile, user?.role]);

	const recommendations = useMemo(() => {
		if (!profile || !popupList) return [];
		const ids = profile.recommendations && profile.recommendations.length > 0
			? profile.recommendations
			: popupList.slice(0, 6).map(item => item.id);
		return popupList.filter(item => ids.includes(item.id));
	}, [profile, popupList]);

	const favoriteIds = profile?.favorites ?? [];
	const scheduleIds = profile?.recentViewed ?? [];
	const stats = profile?.stats ?? {};

	const handleLogout = () => {
		void logout();
	};

	return (
		<div className="min-h-screen bg-[#f8f8f8] pt-16 pb-20">
			<header className="sticky top-0 z-10 bg-white border-b border-gray-200">
				<div className="max-w-[1080px] mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button
							className="p-2 rounded-full hover:bg-gray-100 transition"
							onClick={onClose}
							aria-label="뒤로 가기"
						>
							<ChevronLeft className="size-5" />
						</button>
						<div>
							<p className="text-sm text-gray-500">반가워요, {profile?.nickname ?? user?.nickname ?? "게스트"}님</p>
							<h1 className="text-xl font-semibold text-gray-900">나의 다잇다잉</h1>
						</div>
					</div>
					<button
						className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
						onClick={handleLogout}
					>
						<LogOut className="size-4" />
						<span>로그아웃</span>
					</button>
				</div>
				<nav className="max-w-[1080px] mx-auto px-4 pb-2">
					<div className="flex gap-2 overflow-x-auto">
						{TAB_LIST.map(tab => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className={`px-4 py-2 rounded-full text-sm font-medium transition ${
									activeTab === tab.key
										? "bg-[#eb0000] text-white shadow-sm"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</nav>
			</header>

			<main className="max-w-[1080px] mx-auto px-4 py-6 space-y-8">
				<section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
						<div className="flex items-center gap-4">
							<div className="size-16 rounded-full bg-[#fdecec] flex items-center justify-center">
								<Sparkles className="text-[#eb0000]" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{profile?.name ?? user?.name ?? "사용자"}</p>
								<h2 className="text-lg font-semibold">관심 맞춤 큐레이션</h2>
								<p className="text-sm text-gray-500">
									{profile?.regions?.join(", ")}
									{profile?.regions && profile?.interests ? " · " : ""}
									{profile?.interests?.slice(0, 2).join(", ")}
								</p>
							</div>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
							<div className="p-3 rounded-xl bg-[#f9fafb]">
								<p className="text-xs text-gray-500">관심 팝업</p>
								<p className="text-lg font-semibold text-gray-900">{stats.favoriteCount ?? favoriteIds.length}</p>
							</div>
							<div className="p-3 rounded-xl bg-[#f9fafb]">
								<p className="text-xs text-gray-500">추천 큐레이션</p>
								<p className="text-lg font-semibold text-gray-900">{stats.recommendationCount ?? recommendations.length}</p>
							</div>
							<div className="p-3 rounded-xl bg-[#f9fafb]">
								<p className="text-xs text-gray-500">관심 지역</p>
								<p className="text-lg font-semibold text-gray-900">{profile?.regions?.length ?? 0}</p>
							</div>
							<div className="p-3 rounded-xl bg-[#f9fafb]">
								<p className="text-xs text-gray-500">선호 무드</p>
								<p className="text-lg font-semibold text-gray-900">{profile?.moods?.length ?? 0}</p>
							</div>
						</div>
					</div>
				</section>

				{activeTab === "recommend" && (
					<section className="space-y-4">
						<h2 className="text-lg font-semibold flex items-center gap-2">
							<Sparkles className="size-5 text-[#eb0000]" />
							오늘의 추천
						</h2>
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
							{recommendations.map(popup => (
								<button
									key={popup.id}
									onClick={() => onRecommendClick?.(popup.id) ?? onPopupClick(popup.id)}
									className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left hover:-translate-y-1 hover:shadow-md transition"
								>
									<div className="h-44 overflow-hidden">
										<img src={getImageUrl(popup.thumbnail, "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop")} alt={popup.title} className="w-full h-full object-cover" />
									</div>
									<div className="p-4 space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-xs font-semibold text-[#eb0000] uppercase">추천</span>
											<span className="flex items-center text-xs text-gray-500 gap-1">
												<Heart className="size-3 text-[#eb0000]" />
												{popup.favoriteCount ?? 0}
											</span>
										</div>
										<h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{popup.title}</h3>
										<p className="text-xs text-gray-500">{popup.startDate} ~ {popup.endDate}</p>
										{popup.locationName && (
											<p className="text-xs text-gray-400 flex items-center gap-1">
												<MapPin className="size-3" />
												{popup.locationName}
											</p>
										)}
									</div>
								</button>
							))}
							{recommendations.length === 0 && (
								<div className="bg-white rounded-2xl p-6 border text-sm text-gray-500">
									추천 데이터가 준비되지 않았습니다. 관심사를 설정하면 맞춤 큐레이션을 받을 수 있어요.
								</div>
							)}
						</div>
					</section>
				)}

				{activeTab === "favorites" && (
					<section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
						<MyPageFavorites favoriteIds={favoriteIds} onPopupClick={onPopupClick} />
					</section>
				)}

				{activeTab === "reviews" && (
					<section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
						<MyPageReviews authorId={user?.id ?? null} />
					</section>
				)}

				{activeTab === "schedule" && (
					<section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
						<MyPageCalendar scheduledPopupIds={scheduleIds} onPopupClick={onPopupClick} />
					</section>
				)}
			</main>
		</div>
	);
}

export default MyPage;

