import React from "react";
import { Heart, Eye, MapPin } from "lucide-react";
import { getPopupById } from "../../data/popups";

interface FavoritesProps { onPopupClick?:(id:number)=>void }

export function MyPageFavorites({ onPopupClick }: FavoritesProps){
	const favorites = [getPopupById(1), getPopupById(2)].filter(Boolean).map(p => ({
		id: p!.id,
		title: p!.title,
		date: p!.date,
		location: p!.location ?? p!.address,
		likes: p!.likes,
		views: p!.views,
		image: p!.images[0],
	}));
	return (
		<div className="py-6 md:py-8 px-4 md:px-0">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
				{favorites.map(f => (
					<div key={f.id} onClick={()=>onPopupClick?.(f.id)} className="flex gap-3 md:gap-4 cursor-pointer hover:transform hover:scale-105 transition-transform">
						<div className="relative h-[180px] w-[130px] sm:h-[240px] sm:w-[170px] md:h-[280px] md:w-[200px] lg:h-[320px] lg:w-[230px] rounded-[10px] md:rounded-[15px] overflow-hidden flex-shrink-0">
							<img alt={f.title} className="w-full h-full object-cover" src={f.image} />
						</div>
						<div className="flex flex-col flex-1 justify-between py-1">
							<div className="flex items-center gap-2 md:gap-3">
								<div className="flex items-center gap-1"><Heart className="size-[14px] md:size-[18px]" fill="#FF4343" /><span className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-black">{f.likes}</span></div>
								<div className="flex items-center gap-1"><Eye className="size-[16px] md:size-[20px]" /><span className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-black">{f.views}</span></div>
							</div>
							<div>
								<p className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-lg text-black mb-1 line-clamp-2">{f.title}</p>
								<p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-[#4b4b4b] mb-1 md:mb-1.5">{f.date}</p>
								<div className="flex items-center gap-1 md:gap-1.5"><MapPin className="size-[16px] md:size-[20px] flex-shrink-0" /><p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-black">{f.location}</p></div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default MyPageFavorites;
