import React, { useState } from "react";
import ImageUpload from "../common/ImageUpload";
import { getAccessToken } from "../../utils/tokenStorage";
import { invalidateReviewsCache } from "../../hooks/usePopups";

export function ReviewWritePage({ popupId, onBack, onMyPageClick, onNearbyExploreClick, onClose, onSaved }){
	const [content, setContent] = useState("");
	const [rating, setRating] = useState(3);
	const [images, setImages] = useState([]);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!popupId) {
			alert("팝업 정보가 없습니다.");
			return;
		}

		setSaving(true);
		try {
			// TODO: 실제 API 호출로 교체 필요
			const response = await fetch(`/api/popups/${popupId}/reviews`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${getAccessToken()}`,
				},
				body: JSON.stringify({
					rating,
					content: content.trim(),
					images: images.map(img => ({ url: img.url, key: img.key })),
				}),
			});

			if (response.ok) {
				invalidateReviewsCache();
				setContent("");
				setImages([]);
				onSaved?.();
			} else {
				const error = await response.json();
				alert(error?.error?.message || "후기 저장에 실패했습니다.");
			}
		} catch (error) {
			console.error("후기 저장 실패:", error);
			alert("후기 저장에 실패했습니다.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-white p-6 pt-24">
			<div className="max-w-[640px] mx-auto space-y-4">
				<h1 className="text-xl font-bold">후기 작성</h1>
				<div className="flex gap-2">
					{[1,2,3,4,5].map(i => (
						<button 
							key={i} 
							onClick={()=>setRating(i)} 
							className={`w-8 h-8 rounded ${i<=rating?"bg-[#eb0000] text-white":"bg-gray-200"}`}
						>
							{i}
						</button>
					))}
				</div>
				<textarea 
					value={content} 
					onChange={e=>setContent(e.target.value)} 
					className="w-full h-40 border rounded p-3 focus:outline-none focus:border-[#eb0000]" 
					placeholder="후기를 입력하세요" 
				/>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						사진 추가 (선택)
					</label>
					<ImageUpload
						value={images}
						onChange={setImages}
						maxImages={5}
						multiple={true}
					/>
				</div>
				<div className="flex gap-3">
					<button onClick={onBack} className="px-4 py-2 rounded bg-gray-200">뒤로</button>
					<button 
						onClick={handleSave} 
						disabled={saving}
						className="px-4 py-2 rounded bg-[#eb0000] text-white disabled:opacity-50"
					>
						{saving ? "저장 중..." : "저장"}
					</button>
					<button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">닫기</button>
					<button onClick={onNearbyExploreClick} className="px-4 py-2 rounded bg-gray-100">근처 탐색</button>
				</div>
			</div>
		</div>
	);
}
export default ReviewWritePage;
