import apiClient from './api';

const ERROR_MESSAGES = {
  uploadFailed: '이미지 업로드에 실패했습니다.',
  invalidFile: '유효하지 않은 이미지 파일입니다.',
  fileTooLarge: '파일 크기가 너무 큽니다. (최대 5MB)',
};

/**
 * 이미지 파일을 업로드하고 ImagePayload를 반환합니다.
 * @param {File|File[]} files - 업로드할 파일 또는 파일 배열
 * @returns {Promise<{url: string, key: string}[]>} 업로드된 이미지 정보 배열
 */
export async function uploadImages(files) {
  if (!files) {
    return [];
  }

  const fileArray = Array.isArray(files) ? files : [files];
  
  if (fileArray.length === 0) {
    return [];
  }

  // 파일 유효성 검사
  for (const file of fileArray) {
    if (!(file instanceof File)) {
      throw new Error(ERROR_MESSAGES.invalidFile);
    }
    if (!file.type.startsWith('image/')) {
      throw new Error(ERROR_MESSAGES.invalidFile);
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(ERROR_MESSAGES.fileTooLarge);
    }
  }

  try {
    const formData = new FormData();
    fileArray.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response?.data?.success && response.data.data?.files) {
      return response.data.data.files.map((file) => ({
        url: file.url,
        key: file.key,
      }));
    }

    throw new Error(ERROR_MESSAGES.uploadFailed);
  } catch (error) {
    const serverMessage = error?.response?.data?.error?.message;
    if (serverMessage) {
      throw new Error(serverMessage);
    }
    throw formatError(error, ERROR_MESSAGES.uploadFailed);
  }
}

function formatError(error, fallbackMessage) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
}

/**
 * 단일 이미지를 업로드하고 ImagePayload를 반환합니다.
 * @param {File} file - 업로드할 파일
 * @returns {Promise<{url: string, key: string}>} 업로드된 이미지 정보
 */
export async function uploadImage(file) {
  const results = await uploadImages([file]);
  return results[0] || null;
}

