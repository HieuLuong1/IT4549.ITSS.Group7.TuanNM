import api from '@/services/api';
import type { ApiResponse } from '@/features/auth/types/auth';

export interface FileUploadResponse {
  url: string;
  publicId: string;
  resourceType: 'image' | 'raw';
  contentType: string;
  originalFilename?: string | null;
  bytes: number;
}

/**
 * Upload file lên Cloudinary qua backend.
 *
 * QUAN TRỌNG: KHÔNG đặt Content-Type thủ công khi gửi FormData.
 * Browser/Axios phải tự tạo "multipart/form-data; boundary=<...>"
 * Nếu đặt tay (không có boundary) → server không parse được → 400.
 */
export const uploadFile = async (
  file: File,
  folder?: string
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  // transformRequest: xóa Content-Type khỏi headers để browser tự gán
  // "multipart/form-data; boundary=----WebKit..." chính xác
  const response = await api.post<ApiResponse<FileUploadResponse>>(
    '/api/v1/uploads',
    formData,
    {
      transformRequest: [
        (data: unknown, headers: Record<string, string>) => {
          // Xóa Content-Type do axios-instance default ("application/json")
          // để browser tự đặt đúng boundary cho multipart
          if (headers) {
            delete headers['Content-Type'];
          }
          return data;
        },
      ],
    }
  );

  if (!response.data?.success || !response.data?.data?.url) {
    throw new Error(response.data?.message || 'Upload thất bại');
  }

  return response.data.data;
};
