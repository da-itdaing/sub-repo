import React, { useState, useRef, useEffect } from "react";
import { Heart, Eye, MapPin, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { getPopupById } from "../../data/popups";

// Profile (사용자 기본 + 관심사 선택)
import { useUser } from "../../context/UserContext";

function ProfileSection() {
	const { profile, setProfile } = useUser();
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [nickname, setNickname] = useState("");
	const [email, setEmail] = useState("");
	const [interests, setInterests] = useState<string[]>(["패션", "건강", "공연/전시"]);
	const [moods, setMoods] = useState<string[]>(["포토존", "실내", "야외"]);
	const [regions, setRegions] = useState<string[]>(["남구"]);
	const [conveniences, setConveniences] = useState<string[]>([]);

	const interestOptions = ["패션", "뷰티", "음식", "건강", "공연/전시", "스포츠", "키즈", "아트", "굿즈", "반려동물"];
	const moodOptions = ["아기자기한", "감성적인", "활기찬", "레트로/빈티지", "차분한", "체험가능", "포토존", "실내", "야외", "연인과 함께", "가족과 함께", "친구와 함께", "반려동물과 함께", "혼자여도 좋은"];
		const regionOptions = ["남구", "서구", "동구", "북구", "광산구"];
	const convenienceOptions = ["무료주차", "무료입장", "예약가능", "굿즈판매"];

	const toggleLimited = (value: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, max: number, min: number = 1) => {
		if (state.includes(value)) {
			if (state.length > min) setState(state.filter(v => v !== value));
		} else {
			if (state.length < max) setState([...state, value]);
		}
	};

		useEffect(()=>{
			if(profile){
				setName(profile.name);
				setUsername(profile.username);
				setNickname(profile.nickname);
				setEmail(profile.email);
				setInterests(profile.interests);
				setMoods(profile.moods);
				setRegions(profile.regions);
				setConveniences(profile.conveniences);
			}
		},[profile]);

		const handleSave = () => {
			const updated = {
				userType: profile?.userType || "consumer",
				username: username || profile?.username || "consumer1",
				name: name || profile?.name || "소비자",
				nickname: nickname || profile?.nickname || username || "닉네임",
				email: email || profile?.email || "user@example.com",
				ageGroup: profile?.ageGroup || "20대",
				interests,
				moods,
				regions,
				conveniences,
			};
			setProfile(updated);
			console.log("프로필 저장", updated);
		};

	return (
		<div className="max-w-[930px] mx-auto px-4 pb-32 md:pb-40 pt-4 md:pt-6 lg:pt-8">
			<div className="flex justify-center md:justify-start mb-6 md:mb-8 lg:mb-12">
				<img
					alt="프로필"
					className="w-24 h-24 md:w-32 md:h-32 lg:w-[200px] lg:h-[200px] rounded-full object-cover"
					src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
				/>
			</div>
			<div className="space-y-4 md:space-y-6 lg:space-y-8 w-full max-w-full md:max-w-[514px] mx-auto md:mx-0">
				{[
					{ label: "이름", value: name, setter: setName, type: "text" },
					{ label: "아이디", value: username, setter: setUsername, type: "text" },
					{ label: "닉네임", value: nickname, setter: setNickname, type: "text" },
					{ label: "비밀번호", value: "", setter: () => {}, type: "password" },
					{ label: "E-mail", value: email, setter: setEmail, type: "email" },
				].map(f => (
					<div key={f.label}>
						<p className="font-['Pretendard:Regular',sans-serif] text-base lg:text-lg text-black mb-2">{f.label}</p>
						<div className="flex gap-3">
							<div className="bg-white h-12 lg:h-[47px] rounded-[10px] border border-[#9a9a9a] flex-1">
								<input
									type={f.type}
									value={f.type === "password" ? undefined : f.value}
									onChange={e => f.type === "password" ? null : f.setter(e.target.value)}
									className="w-full h-full px-4 rounded-[10px] focus:outline-none focus:border-[#eb0000]"
								/>
							</div>
							<div className="w-[88px] lg:w-[104px] flex-shrink-0" />
						</div>
					</div>
				))}
			</div>

			{/* Interests */}
			<div className="mt-8 md:mt-12 lg:mt-16">
				<p className="font-['Pretendard:Regular',sans-serif] text-sm md:text-base lg:text-lg text-black mb-3 md:mb-4 text-left">
					평소에 어떤 분야에 관심이 있으신가요? (<span className="text-[#eb0000]">*</span> 최소 1개 최대 4개 선택)
				</p>
				<div className="flex flex-wrap gap-2 md:gap-2.5 lg:gap-[13px] justify-start">
					{interestOptions.map(opt => (
						<button
							key={opt}
							onClick={() => toggleLimited(opt, interests, setInterests, 4)}
							className={`h-8 md:h-9 lg:h-10 rounded-[10px] px-3 md:px-4 lg:px-6 transition-colors flex items-center justify-center ${interests.includes(opt) ? "bg-[#eb0000] text-white border border-[#eb0000]" : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"}`}
						>
							<p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm lg:text-base">{opt}</p>
						</button>
					))}
				</div>
			</div>

			{/* Moods */}
			<div className="mt-8 md:mt-12 lg:mt-16">
				<p className="font-['Pretendard:Regular',sans-serif] text-sm md:text-base lg:text-lg text-black mb-3 md:mb-4 text-left">
					원하는 팝업 분위기를 선택해주세요 (<span className="text-[#eb0000]">*</span> 최소 1개 최대 4개 선택)
				</p>
				<div className="flex flex-wrap gap-2 md:gap-2.5 lg:gap-[13px] justify-start">
					{moodOptions.map(opt => (
						<button
							key={opt}
							onClick={() => toggleLimited(opt, moods, setMoods, 4)}
							className={`h-8 md:h-9 lg:h-10 rounded-[10px] px-3 md:px-4 lg:px-6 transition-colors flex items-center justify-center ${moods.includes(opt) ? "bg-[#eb0000] text-white border border-[#eb0000]" : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"}`}
						>
							<p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm lg:text-base whitespace-nowrap">{opt}</p>
						</button>
					))}
				</div>
			</div>

			{/* Conveniences */}
			<div className="mt-8 md:mt-12 lg:mt-16">
				<p className="font-['Pretendard:Regular',sans-serif] text-sm md:text-base lg:text-lg text-black mb-3 md:mb-4 text-left">
					원하는 편의사항을 선택해주세요 (<span className="text-[#eb0000]">*</span> 최소 1개 최대 4개 선택)
				</p>
				<div className="flex flex-wrap gap-2 md:gap-2.5 lg:gap-[13px] justify-start">
					{convenienceOptions.map(opt => (
						<button
							key={opt}
							onClick={() => toggleLimited(opt, conveniences, setConveniences, 4)}
							className={`h-8 md:h-9 lg:h-10 rounded-[10px] px-3 md:px-4 lg:px-6 transition-colors flex items-center justify-center ${conveniences.includes(opt) ? "bg-[#eb0000] text-white border border-[#eb0000]" : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"}`}
						>
							<p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm lg:text-base">{opt}</p>
						</button>
					))}
				</div>
			</div>

			{/* Regions */}
			<div className="mt-8 md:mt-12 lg:mt-16">
				<p className="font-['Pretendard:Regular',sans-serif] text-sm md:text-base lg:text-lg text-black mb-3 md:mb-4 text-left">
					어떤 지역의 팝업 스토어를 방문하고 싶나요? (<span className="text-[#eb0000]">*</span> 최소 1개 최대 2개 선택)
				</p>
				<div className="flex flex-wrap gap-2 md:gap-2.5 lg:gap-[13px] justify-start">
					{regionOptions.map(opt => (
						<button
							key={opt}
							onClick={() => toggleLimited(opt, regions, setRegions, 2)}
							className={`h-8 md:h-9 lg:h-10 rounded-[10px] px-3 md:px-4 lg:px-6 transition-colors flex items-center justify-center ${regions.includes(opt) ? "bg-[#eb0000] text-white border border-[#eb0000]" : "bg-white border border-[#9a9a9a] text-black hover:border-[#eb0000]"}`}
						>
							<p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm lg:text-base">{opt}</p>
						</button>
					))}
				</div>
			</div>

			{/* Actions */}
			<div className="mt-8 md:mt-12 lg:mt-16">
				<div className="flex justify-end mb-3 md:mb-4">
					<button className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm lg:text-base text-[#414141] hover:text-[#eb0000] transition-colors">회원탈퇴</button>
				</div>
				<div className="flex justify-center">
					<button
						onClick={handleSave}
						className="bg-[#eb0000] h-9 md:h-10 lg:h-[40px] rounded-[10px] w-full max-w-[160px] md:max-w-[200px] hover:bg-[#cc0000] transition-colors flex items-center justify-center"
					>
						<p className="font-['Pretendard:Regular',sans-serif] text-sm md:text-base lg:text-lg text-white">저장</p>
					</button>
				</div>
			</div>
		</div>
	);
}

// 관심 팝업
function FavoritesSection({ onPopupClick }: { onPopupClick?: (id: number) => void }) {
	const [favorites, setFavorites] = useState(() => {
		const first = getPopupById(1);
		const second = getPopupById(2);
		return [
			{
				id: first?.id ?? 1,
				title: first?.title ?? "플리마켓",
				date: first?.date ?? "2025.11.15 - 11.23",
				location: first?.location ?? first?.address ?? "광주광역시",
				likes: first?.likes ?? 45,
				views: first?.views ?? 210,
				image: first?.images?.[0] || "https://placehold.co/400x600",
				isFavorited: true,
			},
			{
				id: second?.id ?? 2,
				title: second?.title ?? "동명커피산책",
				date: second?.date ?? "2025.11.08",
				location: second?.location ?? second?.address ?? "광주광역시",
				likes: second?.likes ?? 36,
				views: second?.views ?? 138,
				image: second?.images?.[0] || "https://placehold.co/400x600",
				isFavorited: true,
			},
		];
	});
	const toggleFavorite = (id: number) => {
		setFavorites(prev => prev.map(f => f.id === id ? { ...f, isFavorited: !f.isFavorited } : f));
	};
	return (
		<div className="py-6 md:py-8 px-4 md:px-0">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
				{favorites.map(f => (
					<div
						key={f.id}
						onClick={() => onPopupClick?.(f.id)}
						className="flex gap-3 md:gap-4 cursor-pointer hover:transform hover:scale-105 transition-transform"
					>
						<div className="relative h-[180px] w-[130px] sm:h-[240px] sm:w-[170px] md:h-[280px] md:w-[200px] lg:h-[320px] lg:w-[230px] rounded-[10px] md:rounded-[15px] overflow-hidden flex-shrink-0">
							<img alt={f.title} src={f.image} className="w-full h-full object-cover" />
							<button
								aria-label="좋아요 토글"
								onClick={(e) => { e.stopPropagation(); toggleFavorite(f.id); }}
								className="absolute right-2 top-2 md:right-3 md:top-3 hover:scale-110 transition-transform cursor-pointer"
							>
								<Heart className="size-[30px] md:size-[40px]" fill={f.isFavorited ? "#FF4343" : "none"} color="#414141" />
							</button>
						</div>
						<div className="flex flex-col flex-1 justify-between py-1">
							<div className="flex items-center gap-2 md:gap-3">
								<div className="flex items-center gap-1">
									<Heart className="size-[14px] md:size-[18px]" fill="#FF4343" />
									<span className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-black">{f.likes}</span>
								</div>
								<div className="flex items-center gap-1">
									<Eye className="size-[16px] md:size-[20px]" />
									<span className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-black">{f.views}</span>
								</div>
							</div>
							<div>
								<p className="font-['Pretendard:Bold',sans-serif] text-sm sm:text-base md:text-lg text-black mb-1 line-clamp-2">{f.title}</p>
								<p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-[#4b4b4b] mb-1 md:mb-1.5">{f.date}</p>
								<div className="flex items-center gap-1 md:gap-1.5">
									<MapPin className="size-[16px] md:size-[20px] flex-shrink-0" />
									<p className="font-['Pretendard:Regular',sans-serif] text-xs md:text-sm text-black">{f.location}</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// 캘린더
function CalendarSection() {
		const days = [
		{ day: 26, isCurrentMonth: false }, { day: 27, isCurrentMonth: false }, { day: 28, isCurrentMonth: false }, { day: 29, isCurrentMonth: false }, { day: 30, isCurrentMonth: false }, { day: 31, isCurrentMonth: false },
		{ day: 1, isCurrentMonth: true }, { day: 2, isCurrentMonth: true }, { day: 3, isCurrentMonth: true }, { day: 4, isCurrentMonth: true }, { day: 5, isCurrentMonth: true }, { day: 6, isCurrentMonth: true }, { day: 7, isCurrentMonth: true },
		{ day: 8, isCurrentMonth: true, event: "2025 제5회 동명커피산책", eventColor: "bg-[#ffdfdf]" },
		{ day: 9, isCurrentMonth: true }, { day: 10, isCurrentMonth: true }, { day: 11, isCurrentMonth: true }, { day: 12, isCurrentMonth: true }, { day: 13, isCurrentMonth: true }, { day: 14, isCurrentMonth: true },
		{ day: 15, isCurrentMonth: true, event: "ACC 창제작 어린이공연 래퍼토리 <어둑시니>", eventColor: "bg-[#dbeff6]" },
		{ day: 16, isCurrentMonth: true, highlight: true }, { day: 17, isCurrentMonth: true, highlight: true }, { day: 18, isCurrentMonth: true, highlight: true }, { day: 19, isCurrentMonth: true, highlight: true }, { day: 20, isCurrentMonth: true, highlight: true }, { day: 21, isCurrentMonth: true, highlight: true }, { day: 22, isCurrentMonth: true, highlight: true },
		{ day: 23, isCurrentMonth: true, eventBar: true },
		{ day: 24, isCurrentMonth: true }, { day: 25, isCurrentMonth: true }, { day: 26, isCurrentMonth: true }, { day: 27, isCurrentMonth: true }, { day: 28, isCurrentMonth: true }, { day: 29, isCurrentMonth: true }, { day: 30, isCurrentMonth: true },
		{ day: 1, isCurrentMonth: false }, { day: 2, isCurrentMonth: false }, { day: 3, isCurrentMonth: false }, { day: 4, isCurrentMonth: false }, { day: 5, isCurrentMonth: false }, { day: 6, isCurrentMonth: false },
	];
	const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
	return (
		<div className="py-6 md:py-8 px-4 md:px-0">
			<div className="text-center mb-4 md:mb-6 lg:mb-8">
				<p className="font-['Pretendard:Regular',sans-serif] text-lg md:text-xl lg:text-2xl text-black">&lt; 2025년 11월&gt;</p>
			</div>
			<div className="w-full overflow-x-auto">
				<div className="min-w-[300px]">
					<div className="grid grid-cols-7 mb-0">
						{weekDays.map(d => (
							<div key={d} className="bg-white h-[35px] sm:h-[40px] md:h-[45px] lg:h-[55px] flex items-center justify-center border-b border-[#dedede]">
								<span className="font-['Pretendard:Regular',sans-serif] text-sm sm:text-base md:text-lg lg:text-xl text-black">{d}</span>
							</div>
						))}
					</div>
					<div className="grid grid-cols-7">
						{days.map((dayObj, idx) => (
							<div key={idx} className="bg-white h-[70px] sm:h-[80px] md:h-[100px] lg:h-[120px] xl:h-[132px] border-t border-[#dedede] relative flex flex-col p-1 sm:p-1.5 md:p-2">
								<span className={`font-['Pretendard:Regular',sans-serif] text-sm sm:text-base md:text-lg lg:text-xl text-center ${dayObj.isCurrentMonth ? "text-black" : "text-[#9a9a9a]"}`}>{dayObj.day}</span>
								{dayObj.event && (
									<div className={`${dayObj.eventColor} h-[20px] sm:h-[24px] md:h-[28px] lg:h-[32px] xl:h-[35px] rounded-[6px] md:rounded-[8px] mt-1 md:mt-2 px-1 sm:px-1.5 md:px-2 flex items-center justify-start overflow-hidden`}> 
										<span className="font-['Pretendard:Regular',sans-serif] text-[10px] sm:text-xs md:text-sm text-black truncate">{dayObj.event}</span>
									</div>
								)}
								{dayObj.eventBar && (
									<div className="bg-[#dbeff6] h-[20px] sm:h-[24px] md:h-[28px] lg:h-[32px] xl:h-[35px] rounded-[6px] md:rounded-[8px] mt-1 md:mt-2" />
								)}
								{dayObj.highlight && idx >= 14 && idx <= 20 && (
									<div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 left-1 sm:left-1.5 md:left-2 right-1 sm:right-1.5 md:right-2 bg-[#dbeff6] h-[20px] sm:h-[24px] md:h-[28px] lg:h-[32px] xl:h-[35px] rounded-[6px] md:rounded-[8px]" />
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

interface ReviewItem { id:number; title:string; date:string; rating:number; content:string; images:string[]; }
function ReviewCard({ review }: { review: ReviewItem }) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [index, setIndex] = useState(0);
	const renderStars = (count: number) => (
		<div className="flex gap-[2px]">
			{[1,2,3,4,5].map(i => (
				<Star key={i} className="w-[22px] h-[22px]" fill={i <= count ? "#EB0000" : "none"} stroke={i <= count ? "#EB0000" : "#9A9A9A"} />
			))}
		</div>
	);
	const prev = () => {
		if (scrollRef.current && index > 0) {
			const next = index - 1; setIndex(next); scrollRef.current.scrollTo({ left: next * 213, behavior: "smooth" });
		}
	};
	const next = () => {
		if (scrollRef.current && index < review.images.length - 1) {
			const nextIdx = index + 1; setIndex(nextIdx); scrollRef.current.scrollTo({ left: nextIdx * 213, behavior: "smooth" });
		}
	};
	return (
		<div className="bg-white rounded-[15px] border border-[#d9d9d9] p-6 relative">
			<button className="absolute top-6 right-6 bg-[#d9d9d9] h-[31px] px-4 rounded-[10px] hover:opacity-80 transition-opacity">
				<span className="font-['Pretendard:Regular',sans-serif] text-[15px] text-black">삭제</span>
			</button>
			<p className="font-['JejuGothic:Regular',sans-serif] text-[18px] text-black mb-2">{review.title}</p>
			<p className="font-['JejuGothic:Regular',sans-serif] text-[14px] text-[#4d4d4d] mb-3">{review.date}</p>
			<div className="mb-4">{renderStars(review.rating)}</div>
			<p className="font-['Pretendard:Regular',sans-serif] text-[15px] text-black mb-6 whitespace-pre-line">{review.content}</p>
			{review.images.length > 0 && (
				<div className="relative">
					{review.images.length > 1 && (
						<button
							onClick={prev}
							disabled={index === 0}
							aria-label="이전 이미지"
							className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all md:hidden"
						>
							<ChevronLeft className="w-5 h-5 text-black" />
						</button>
					)}
					{review.images.length > 1 && (
						<button
							onClick={next}
							disabled={index === review.images.length - 1}
							aria-label="다음 이미지"
							className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all md:hidden"
						>
							<ChevronRight className="w-5 h-5 text-black" />
						</button>
					)}
					<div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:flex-wrap md:overflow-visible">
						{review.images.map((img, i) => (
							<div key={i} className="h-[214px] w-[197px] flex-shrink-0 rounded-[10px] overflow-hidden bg-[#d9d9d9] snap-center">
								<img alt="" src={img} className="w-full h-full object-cover" />
							</div>
						))}
					</div>
					{review.images.length > 1 && (
						<div className="flex gap-1.5 justify-center mt-3 md:hidden">
							{review.images.map((_, i) => (
								<div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-[#eb0000]" : "bg-[#d9d9d9]"}`} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function ReviewsSection() {
	const reviews: ReviewItem[] = [
		{
			id: 1,
			title: "AI 프론티어 챌린지 해커톤",
			date: "2025.10.28",
			rating: 1,
			content: `내일 오프라인 해커톤임 에바임!!!!!!!!! 변산반도는 무슨 일이고!!!!!!!! 끼야야야야야야락!!!!! 벌써 집가고싶어!!!!!!!!!!!\n프로젝트 바쁜데 ㅠㅠ 이걸 왜 가누..  하.. 가면 뭐라도 경험하고 좋을 것 같기는한데... 으어엉... \n가서 또 화면짜고 있을라나 깔깔깔.. `,
			images: ["https://images.unsplash.com/photo-1603578128133-6465b8a57ee0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"],
		},
		{
			id: 2,
			title: "이불 밖 체험관 <역시나 위험해>",
			date: "2025.10.28",
			rating: 5,
			content: `푹신하고 부들부들한 이불을 덮고서 누워있고싶다. 얼마나 행복할까? 핸드폰 신나게 하다가 졸리면 자고 ... 생각만해도 햅쁴라이프! \n하지만 그건 꿈이죠? 프로젝트 끝나기 전까진 절대 없을듯.. 흑흑.. 이불 밖은.. 위험한데.. 안전한 곳으로 들어가면 안되는건가.. ㅠ`,
			images: [
				"https://images.unsplash.com/photo-1511381939415-c1b8f6cbed51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
				"https://images.unsplash.com/photo-1542310503-ff19e8227d33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
				"https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
			],
		},
	];
	return (
		<div className="py-8 space-y-6">
			{reviews.map(r => <ReviewCard key={r.id} review={r} />)}
		</div>
	);
}

interface MyPageProps { onClose:()=>void; onNearbyExploreClick?:()=>void; onPopupClick?:(id:number)=>void; }
export function MyPage({ onClose, onNearbyExploreClick, onPopupClick }: MyPageProps) {
	const [activeTab, setActiveTab] = useState<"프로필" | "관심팝업" | "캘린더" | "내 후기">("프로필");
	const scrollToTop = () => { window.scrollTo({ top: 0, behavior: "smooth" }); };
	return (
		<div className="bg-white relative min-h-screen pt-16 sm:pt-20 md:pt-24">
			{/* Tabs */}
			<div className="max-w-[930px] mx-auto px-4 mt-2">
				<div className="flex h-16 md:h-20 lg:h-[96px] border-b border-[#9a9a9a]">
					{["프로필","관심팝업","캘린더","내 후기"].map(tab => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab as any)}
							className={`flex-1 text-center ${activeTab===tab?"border-b-2 border-[#eb0000]":""}`}
						>
							<p className={`font-['Pretendard:Regular',sans-serif] text-base md:text-lg lg:text-[21px] ${activeTab===tab?"text-[#eb0000]":"text-[#9a9a9a]"}`}>{tab}</p>
						</button>
					))}
				</div>
			</div>
			{activeTab === "프로필" && <ProfileSection />}
			{activeTab === "관심팝업" && <div className="max-w-[930px] mx-auto px-4 pb-32 md:pb-40"><FavoritesSection onPopupClick={onPopupClick} /></div>}
			{activeTab === "캘린더" && <div className="max-w-[930px] mx-auto px-4 pb-32 md:pb-40"><CalendarSection /></div>}
			{activeTab === "내 후기" && <div className="max-w-[930px] mx-auto px-4 pb-32 md:pb-40"><ReviewsSection /></div>}
			<button
				onClick={scrollToTop}
				className="fixed right-4 md:right-8 bottom-24 sm:bottom-28 md:bottom-24 size-[40px] sm:size-[48px] md:size-[60px] bg-[#eb0000] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg z-40"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5 md:size-6 text-white">
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
				</svg>
			</button>
		</div>
	);
}

export default MyPage;
