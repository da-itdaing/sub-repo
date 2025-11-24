import apiClient from '@/api/client';

/**
 * 이미지 업로드 API
 * @param {File} file 
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('images', file);

  const response = await apiClient.post('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // response 구조: { files: [{ url: "...", key: "..." }] }
  return response.files[0];
};

