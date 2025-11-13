import React, { useState, useEffect } from "react";
import { sellerService } from "../../services/sellerService";
import { SellerProfile } from "../../types/seller";
import { ImageUploader } from "../common/ImageUploader";
import { Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SellerProfileFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function SellerProfileForm({ onClose, onSuccess }: SellerProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [formData, setFormData] = useState({
    profileImageUrl: "",
    introduction: "",
    activityRegion: "",
    snsUrl: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    sellerService.getMyProfile()
      .then(data => {
        if (mounted) {
          setProfile(data);
          setFormData({
            profileImageUrl: data.profileImageUrl || "",
            introduction: data.introduction || "",
            activityRegion: data.activityRegion || "",
            snsUrl: data.snsUrl || "",
          });
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "프로필을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await sellerService.updateProfile({
        profileImageUrl: formData.profileImageUrl || undefined,
        introduction: formData.introduction || undefined,
        activityRegion: formData.activityRegion || undefined,
        snsUrl: formData.snsUrl || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">프로필을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">프로필 수정</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="size-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로필 이미지
          </label>
          <ImageUploader
            category="PROFILE"
            resourceId={user?.id}
            multiple={false}
            maxFiles={1}
            onUploadComplete={(urls) => {
              if (urls.length > 0) {
                setFormData({ ...formData, profileImageUrl: urls[0] });
              }
            }}
            existingImages={formData.profileImageUrl ? [formData.profileImageUrl] : []}
            onRemoveExisting={() => {
              setFormData({ ...formData, profileImageUrl: "" });
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            소개글
          </label>
          <textarea
            value={formData.introduction}
            onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            rows={4}
            placeholder="팝업스토어에 대한 소개를 입력하세요"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.introduction.length}/1000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            활동 지역
          </label>
          <input
            type="text"
            value={formData.activityRegion}
            onChange={(e) => setFormData({ ...formData, activityRegion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            placeholder="예: 광주 남구"
            maxLength={255}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SNS URL
          </label>
          <input
            type="url"
            value={formData.snsUrl}
            onChange={(e) => setFormData({ ...formData, snsUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb0000]"
            placeholder="https://instagram.com/your_account"
            maxLength={512}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={saving}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[#eb0000] text-white rounded-lg hover:bg-[#d10000] transition disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={saving}
          >
            <Save className="size-4" />
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}

