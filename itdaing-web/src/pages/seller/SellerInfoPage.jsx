import { useRef, useState } from "react";
import { UserRound } from "lucide-react";

export default function SellerInfoPage() {
	const [editMode, setEditMode] = useState(false);

	const [profile, setProfile] = useState({
		name: "다잇다잉 님", // ✔ 닉네임은 수정 불가
		email: "DaitDaing@gmail.com",
		intro: "소개말",
		area: "",
		sns: "",
		image: null, // 이미지 파일
		imagePreview: null, // 이미지 미리보기 URL
	});

	const fileInputRef = useRef(null);

	// 프로필 사진 변경
	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleImageChange = event => {
		const file = event.target.files?.[0];
		if (!file) return;

		const previewURL = URL.createObjectURL(file);

		setProfile(prev => ({
			...prev,
			image: file,
			imagePreview: previewURL,
		}));
	};

	const handleChange = event => {
		const { name, value } = event.target;
		setProfile(prev => ({ ...prev, [name]: value }));
	};

	const handleSave = () => {
		setEditMode(false);
		alert("프로필이 저장되었습니다!");
	};

	return (
		<div className="flex items-start justify-center w-full h-full pt-14">
			<div className="w-[900px] bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
				{/* 상단 프로필 */}
				<div className="flex items-center gap-6 mb-10">
					{/* 프로필 이미지 */}
					<button
						type="button"
						onClick={handleImageClick}
						className="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-200 border rounded-full cursor-pointer"
					>
						{profile.imagePreview ? (
							<img
								src={profile.imagePreview}
								alt="profile"
								className="object-cover w-full h-full"
							/>
						) : (
							<UserRound size={60} className="text-gray-500" />
						)}
					</button>

					{/* 숨겨진 파일 input */}
					<input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						onChange={handleImageChange}
						className="hidden"
					/>

					{/* 닉네임 + 소개말 */}
					<div>
						<h2 className="text-3xl font-bold text-[#eb0000]">{profile.name}</h2>

						{/* 소개말만 수정 가능 */}
						{!editMode ? (
							<p className="mt-3 text-gray-600">{profile.intro}</p>
						) : (
							<input
								type="text"
								name="intro"
								value={profile.intro}
								onChange={handleChange}
								className="border p-2 rounded w-[300px] mt-2"
								placeholder="소개말 입력"
							/>
						)}
					</div>
				</div>

				{/* 상세 정보 */}
				<div className="grid grid-cols-2 text-sm gap-y-8">
					{/* 주 활동 지역 */}
					<div>
						<p className="font-semibold text-red-600">주 활동 지역</p>
						{!editMode ? (
							<p className="mt-2 text-gray-600">
								{profile.area || "활동 지역을 입력해주세요."}
							</p>
						) : (
							<input
								type="text"
								name="area"
								value={profile.area}
								onChange={handleChange}
								className="border p-2 rounded mt-1 w-[250px]"
								placeholder="지역 입력"
							/>
						)}
					</div>

					{/* 이메일 */}
					<div>
						<p className="font-semibold text-red-600">이메일</p>
						<p className="mt-2 text-gray-700">{profile.email}</p>
					</div>

					{/* SNS */}
					<div>
						<p className="font-semibold text-red-600">SNS</p>
						{!editMode ? (
							<p className="mt-2 text-gray-600">
								{profile.sns || "링크를 입력해주세요."}
							</p>
						) : (
							<input
								type="text"
								name="sns"
								value={profile.sns}
								onChange={handleChange}
								className="border p-2 rounded mt-1 w-[250px]"
								placeholder="SNS 링크"
							/>
						)}
					</div>
				</div>

				{/* 버튼 영역 */}
				<div className="flex justify-end gap-3 mt-12">
					{!editMode ? (
						<button
							type="button"
							className="bg-[#eb0000] text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
							onClick={() => setEditMode(true)}
						>
							프로필 수정
						</button>
					) : (
						<>
							<button
								type="button"
								className="px-6 py-2 text-black transition bg-gray-300 rounded-full hover:bg-gray-400"
								onClick={() => setEditMode(false)}
							>
								취소
							</button>
							<button
								type="button"
								className="bg-[#eb0000] text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
								onClick={handleSave}
							>
								저장
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
