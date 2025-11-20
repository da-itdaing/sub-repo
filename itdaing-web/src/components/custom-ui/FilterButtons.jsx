const filters = ["전체", "남구", "동구", "서구", "북구", "광산구"];

export function FilterButtons({ activeFilter, onFilterChange }) {
	return (
		<div className="flex flex-wrap gap-1.5 md:gap-2 mb-6">
			{filters.map((filter) => (
				<button
					key={filter}
					onClick={() => onFilterChange(filter)}
					className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-full border transition-all font-['Pretendard:Regular',sans-serif] text-xs md:text-base ${
						activeFilter === filter
							? "bg-[#eb0000] text-white border-[#eb0000]"
							: "bg-white text-black border-gray-300 hover:border-[#eb0000]"
					}`}
				>
					{filter}
				</button>
			))}
		</div>
	);
}
