import { getCurrentUser } from '../utils/storage';

export interface UnifiedFileMetadata {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageProvider: 'google_drive' | 'mock_storage' | 'local_blob';
  storageId?: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type AllowedCategory =
  | 'incoming_doc'
  | 'outgoing_doc'
  | 'project_coordinates'
  | 'project_dossier'
  | 'personnel_cert'
  | 'vehicle_doc'
  | 'equipment_dossier'
  | 'appraisal_notice';

const ALLOWED_EXTENSIONS_MAP: Record<AllowedCategory, string[]> = {
  incoming_doc: ['.pdf', '.doc', '.docx'],
  outgoing_doc: ['.pdf', '.doc', '.docx'],
  project_coordinates: ['.txt', '.doc', '.docx', '.xls', '.xlsx'],
  project_dossier: ['.pdf'],
  personnel_cert: ['.pdf', '.jpg', '.jpeg', '.png'],
  vehicle_doc: ['.pdf'],
  equipment_dossier: ['.pdf'],
  appraisal_notice: ['.pdf']
};

/**
 * Validate file before uploading
 */
export function validateFileForCategory(
  file: File,
  category: AllowedCategory,
  maxSizeBytes: number = 25 * 1024 * 1024
): { isValid: boolean; errorMessage?: string } {
  if (!file) {
    return { isValid: false, errorMessage: 'Không tìm thấy tệp được chọn.' };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      errorMessage: `Dung lượng tệp vượt quá giới hạn cho phép (${sizeMb} MB).`
    };
  }

  const allowedExts = ALLOWED_EXTENSIONS_MAP[category] || ['.pdf'];
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!allowedExts.includes(ext)) {
    return {
      isValid: false,
      errorMessage: `Định dạng tệp "${file.name}" không hợp lệ. Chỉ chấp nhận các định dạng: ${allowedExts.join(', ')}.`
    };
  }

  return { isValid: true };
}

/**
 * Unified file upload handler
 */
export async function uploadUnifiedFile(
  file: File,
  category: AllowedCategory,
  onProgress?: (percent: number) => void
): Promise<UnifiedFileMetadata> {
  const validation = validateFileForCategory(file, category);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Tệp không hợp lệ.');
  }

  const currentUser = getCurrentUser();

  // Simulate progress
  if (onProgress) onProgress(25);
  await new Promise(resolve => setTimeout(resolve, 150));

  if (onProgress) onProgress(60);
  await new Promise(resolve => setTimeout(resolve, 150));

  if (onProgress) onProgress(100);

  // Check if Google Drive access token exists in localStorage (without exposing secret keys)
  const gdriveToken = localStorage.getItem('gdrive_access_token');
  const provider = gdriveToken ? 'google_drive' : 'local_blob';

  const blobUrl = URL.createObjectURL(file);

  return {
    id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    storageProvider: provider,
    storageId: provider === 'google_drive' ? `gdrive-id-${Date.now()}` : undefined,
    url: blobUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBy: currentUser ? currentUser.name : 'Người dùng hệ thống'
  };
}
