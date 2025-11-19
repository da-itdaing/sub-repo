import React, { useMemo, useState } from "react";
import { usePopups } from "../../hooks/usePopups";
import { getImageUrl } from "../../utils/imageUtils";
import { MapPin } from "lucide-react";

export function RecommendationModal({ onClose, onDismissToday, onPopupClick, onFavoriteToggle, isLoggedIn, onLoginClick }){
	const { data: popupList } = usePopups();
	const [favoriteMap, setFavoriteMap] = useState({});
	
	// 추천 팝업 2개 선택 (처음 2개)
	const recommendedPopups = useMemo(() => {
		if (!popupList || popupList.length === 0) return [];
		return popupList.slice(0, 2);
	}, [popupList]);

	if (!recommendedPopups || recommendedPopups.length === 0) return null;

	const handleFavoriteClick = (event, popupId) => {
		event.stopPropagation();
		if (!isLoggedIn) {
			onLoginClick?.();
			return;
		}
		const newFavoriteState = !favoriteMap[popupId];
		setFavoriteMap((prev) => ({
			...prev,
			[popupId]: newFavoriteState,
		}));
		onFavoriteToggle?.(popupId, newFavoriteState);
	};

	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('ko-KR', { 
			year: 'numeric', 
			month: '2-digit', 
			day: '2-digit' 
		}).replace(/\./g, '.').replace(/\s/g, '');
	};

	return (
		<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 sm:p-4 md:p-6">
			<div className="bg-white rounded-lg w-full max-w-[calc(100vw-2rem)] sm:max-w-[500px] md:max-w-[600px] shadow-xl overflow-y-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 shrink-0">
					<h2 className="text-base sm:text-lg md:text-xl font-bold text-black mb-1 sm:mb-2">
						오늘의 잇다잉 <span className="text-[#eb0000]">Fick!!</span>
					</h2>
					<p className="text-xs sm:text-sm text-[#4d4d4d]">
						사용자님의 취향에 맞춘 잇다잉 Fick~!! 클릭해서 확인해보세요!
					</p>
				</div>

				{/* Recommended Popups - Scrollable Content */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
					{recommendedPopups.map((popup) => {
						const isFavorite = favoriteMap[popup.id] || false;
						const imageUrl = getImageUrl(
							popup.thumbnail,
							"https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&h=600&fit=crop"
						);
						
						return (
							<div key={popup.id} className="border-b border-gray-200 pb-4 sm:pb-5 md:pb-6 last:border-b-0 last:pb-0">
								{/* 가로 레이아웃: 좌측 이미지, 우측 정보 */}
								<div className="flex gap-3 sm:gap-4">
									{/* 좌측 이미지 */}
									<div className="shrink-0 w-24 sm:w-32 md:w-40 h-24 sm:h-32 md:h-40 rounded-lg overflow-hidden bg-gray-100">
										<img
											src={imageUrl}
											alt={popup.title}
											className="w-full h-full object-cover"
											loading="lazy"
										/>
									</div>

									{/* 우측 정보 */}
									<div className="flex-1 flex flex-col min-w-0">
										{/* Title */}
										<h3 className="text-sm sm:text-base md:text-lg font-bold text-black mb-1.5 sm:mb-2 line-clamp-2">{popup.title}</h3>
										
										{/* Date */}
										<p className="text-xs sm:text-sm text-[#4d4d4d] mb-1.5 sm:mb-2">
											{formatDate(popup.startDate)} - {formatDate(popup.endDate)}
										</p>

										{/* Location */}
										<div className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
											<MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#4d4d4d] shrink-0 mt-0.5" />
											<p className="text-xs sm:text-sm text-[#4d4d4d] line-clamp-2">
												{popup.address || popup.locationName || '위치 정보 없음'}
											</p>
										</div>

										{/* Description */}
										<p className="text-xs sm:text-sm text-[#4d4d4d] mb-2 sm:mb-3 line-clamp-2 flex-1">
											{popup.description || '가족과 함께 즐기기 좋은 팝업입니다! 독특한 경험을 해보세요!'}
										</p>

										{/* Action Buttons */}
										<div className="flex gap-2 mt-auto">
											<button
												onClick={(e) => handleFavoriteClick(e, popup.id)}
												className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
													isFavorite
														? 'bg-[#eb0000] text-white'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
												}`}
											>
												관심등록
											</button>
											<button
												onClick={() => {
													onPopupClick?.(popup.id);
													onClose();
												}}
												className="flex-1 bg-[#eb0000] text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm hover:bg-[#cc0000] active:bg-[#aa0000] transition-colors"
											>
												보러가기
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Footer */}
				<div className="p-4 sm:p-5 md:p-6 border-t border-gray-200 flex items-center justify-between shrink-0">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							onChange={onDismissToday}
							className="w-4 h-4 text-[#eb0000] border-gray-300 rounded focus:ring-[#eb0000] cursor-pointer"
						/>
						<span className="text-xs sm:text-sm text-[#4d4d4d] select-none">오늘 하루 보지않기</span>
					</label>
					<button
						onClick={onClose}
						className="text-xs sm:text-sm text-[#4d4d4d] hover:text-black active:text-gray-600 transition-colors px-2 py-1"
					>
						닫기
					</button>
				</div>
			</div>
		</div>
	);
}
export default RecommendationModal;
