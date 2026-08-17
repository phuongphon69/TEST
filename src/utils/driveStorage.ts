import { DriveFolderItem, DriveFileItem, DriveFileVersion, DriveAccessPermission } from '../types';
import { getStored, setStored, addAuditLog, getCurrentUser } from './storage';

export const DRIVE_STORAGE_KEYS = {
  FOLDERS: 'qlrpbm_drive_folders_v1',
  FILES: 'qlrpbm_drive_files_v1'
};

// Mandatory 9 subfolders for every project
export const PROJECT_SUBFOLDERS = [
  '01_Phap_ly',
  '02_Hop_dong',
  '03_Phuong_an_ky_thuat',
  '04_Nhat_ky_thi_cong',
  '05_Quan_ly_chat_luong',
  '06_An_toan',
  '07_Nghiem_thu',
  '08_Thanh_toan',
  '09_Quyet_toan'
];

// Seed initial folders
export const INITIAL_DRIVE_FOLDERS: DriveFolderItem[] = [
  { id: 'folder-root', name: 'QLRPBM', parentId: null, path: '/QLRPBM', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-01-vbd', name: '01_Van_ban_den', parentId: 'folder-root', path: '/QLRPBM/01_Van_ban_den', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-02-vbd', name: '02_Van_ban_di', parentId: 'folder-root', path: '/QLRPBM/02_Van_ban_di', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-03-vbnb', name: '03_Van_ban_noi_bo', parentId: 'folder-root', path: '/QLRPBM/03_Van_ban_noi_bo', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-04-da', name: '04_Du_an', parentId: 'folder-root', path: '/QLRPBM/04_Du_an', createdAt: '2026-01-01 08:00', permission: 'owner' },
  
  // Project 1 Folder: DA001_SanLapVungTau
  { id: 'folder-da001', name: 'DA001_SanLapVungTau', parentId: 'folder-04-da', path: '/QLRPBM/04_Du_an/DA001_SanLapVungTau', isProjectRootFolder: true, projectCode: 'DA001', createdAt: '2026-01-10 09:00', permission: 'owner' },
  ...PROJECT_SUBFOLDERS.map((subName, index) => ({
    id: `folder-da001-${index + 1}`,
    name: subName,
    parentId: 'folder-da001',
    path: `/QLRPBM/04_Du_an/DA001_SanLapVungTau/${subName}`,
    projectCode: 'DA001',
    createdAt: '2026-01-10 09:05',
    permission: 'owner' as DriveAccessPermission
  })),

  // Project 2 Folder: DA002_CaoTocMaiSon
  { id: 'folder-da002', name: 'DA002_CaoTocMaiSon', parentId: 'folder-04-da', path: '/QLRPBM/04_Du_an/DA002_CaoTocMaiSon', isProjectRootFolder: true, projectCode: 'DA002', createdAt: '2026-02-01 09:00', permission: 'owner' },
  ...PROJECT_SUBFOLDERS.map((subName, index) => ({
    id: `folder-da002-${index + 1}`,
    name: subName,
    parentId: 'folder-da002',
    path: `/QLRPBM/04_Du_an/DA002_CaoTocMaiSon/${subName}`,
    projectCode: 'DA002',
    createdAt: '2026-02-01 09:05',
    permission: 'owner' as DriveAccessPermission
  })),

  // Additional system folders
  { id: 'folder-05-ns', name: '05_Nhan_su', parentId: 'folder-root', path: '/QLRPBM/05_Nhan_su', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-06-pt', name: '06_Phuong_tien', parentId: 'folder-root', path: '/QLRPBM/06_Phuong_tien', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-07-tb', name: '07_Thiet_bi', parentId: 'folder-root', path: '/QLRPBM/07_Thiet_bi', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-08-khs', name: '08_Kho_ho_so', parentId: 'folder-root', path: '/QLRPBM/08_Kho_ho_so', createdAt: '2026-01-01 08:00', permission: 'owner' },
  { id: 'folder-09-vbpl', name: '09_Van_ban_phap_ly', parentId: 'folder-root', path: '/QLRPBM/09_Van_ban_phap_ly', createdAt: '2026-01-01 08:00', permission: 'owner' }
];

// Seed initial files
export const INITIAL_DRIVE_FILES: DriveFileItem[] = [
  {
    id: 'file-001',
    name: 'DA001_BienBanNghiemThu_05_20260728_V01.pdf',
    folderId: 'folder-da001-7', // 07_Nghiem_thu
    path: '/QLRPBM/04_Du_an/DA001_SanLapVungTau/07_Nghiem_thu/DA001_BienBanNghiemThu_05_20260728_V01.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 2450000,
    createdAt: '2026-07-28 14:30',
    updatedAt: '2026-07-28 14:30',
    uploadedBy: 'Đại tá Nguyễn Văn Long',
    projectId: 'proj-001',
    projectCode: 'DA001',
    docCategory: '07_Nghiem_thu',
    documentNumber: '05',
    version: 'V01',
    permission: 'editor',
    sharedWith: ['long.nv@qlrpbm.vn', 'phuong.hd@qlrpbm.vn'],
    isProtected: true,
    versions: [
      {
        id: 'ver-001-1',
        versionName: 'V01.0',
        fileName: 'DA001_BienBanNghiemThu_05_20260728_V01.pdf',
        fileSize: 2450000,
        uploadedAt: '2026-07-28 14:30',
        uploadedBy: 'Đại tá Nguyễn Văn Long',
        comment: 'Phiên bản ban đầu kèm chữ ký điện tử Chỉ huy công trường',
        isCurrent: true
      }
    ],
    contentPdfHtml: `
      <div style="font-family: Arial, sans-serif; padding: 30px; background: #fff; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
          <h4 style="margin: 0; font-size: 13px; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
          <h5 style="margin: 3px 0 0 0; font-size: 12px;">Độc lập - Tự do - Hạnh phúc</h5>
          <div style="width: 120px; height: 1px; background: #000; margin: 8px auto;"></div>
          <h2 style="margin: 15px 0 5px 0; font-size: 18px; color: #0f172a; text-transform: uppercase;">BIÊN BẢN NGHIỆM THU RÀ PHÁ BOM MÌN, VẬT NỔ</h2>
          <p style="margin: 0; font-size: 12px; font-style: italic; color: #475569;">Số: 05/BB-NT-DA001 | Ngày nghiệm thu: 28/07/2026</p>
        </div>
        
        <div style="font-size: 13px; space-y: 10px;">
          <p><strong>Căn cứ:</strong> Quy chuẩn Quốc gia QCVN 01:2019/BQP về Rà phá bom mìn vật nổ.</p>
          <p><strong>Dự án:</strong> Rà phá bom mìn mặt bằng Khu công nghiệp Vũng Tàu (DA001)</p>
          <p><strong>Địa điểm:</strong> Phường Rạch Dừa, TP. Vũng Tàu, Tỉnh Bà Rịa - Vũng Tàu</p>
          <p><strong>Diện tích nghiệm thu:</strong> 15,4 Hécta (Độ sâu rà phá: 5m tính từ mặt đất tự nhiên)</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #cbd5e1; padding: 6px;">STT</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Hạng mục nghiệm thu</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Khối lượng / Kích thước</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px;">Đánh giá chất lượng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">1</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">Tín hiệu nghi vấn đã xử lý</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">42 vị trí tín hiệu</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; color: green; font-weight: bold;">Đạt 100% sạch tín hiệu</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">2</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">Vật nổ phát hiện và hủy</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">01 Đạn pháo 105mm, 02 Mảnh đạn</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; color: green; font-weight: bold;">Hủy nổ an toàn tuyệt đối</td>
              </tr>
            </tbody>
          </table>

          <p style="margin-top: 20px;"><strong>KẾT LUẬN:</strong> Hội đồng nghiệm thu thống nhất nghiệm thu diện tích 15,4 ha đủ điều kiện bàn giao cho Chủ đầu tư đưa vào thi công xây dựng.</p>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; text-align: center;">
          <div>
            <p style="margin-bottom: 50px;"><strong>ĐẠI DIỆN CHỦ ĐẦU TƯ</strong></p>
            <p><i>(Đã ký)</i><br/>Trần Anh Dũng</p>
          </div>
          <div>
            <p style="margin-bottom: 50px;"><strong>CHỈ HUY TRƯỞNG THI CÔNG</strong></p>
            <p style="color: red; font-weight: bold;">[ĐÃ KÝ SỐ CHIHUY_LONGNV]</p>
            <p><strong>Đại tá Nguyễn Văn Long</strong></p>
          </div>
        </div>
      </div>
    `
  },

  {
    id: 'file-002',
    name: 'DA001_PhuongAnKyThuat_12_20260728_V01.pdf',
    folderId: 'folder-da001-3', // 03_Phuong_an_ky_thuat
    path: '/QLRPBM/04_Du_an/DA001_SanLapVungTau/03_Phuong_an_ky_thuat/DA001_PhuongAnKyThuat_12_20260728_V01.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 4120000,
    createdAt: '2026-07-25 09:15',
    updatedAt: '2026-07-25 09:15',
    uploadedBy: 'Thiếu tá Hoàng Đình Phương',
    projectId: 'proj-001',
    projectCode: 'DA001',
    docCategory: '03_Phuong_an_ky_thuat',
    documentNumber: '12',
    version: 'V01',
    permission: 'editor',
    sharedWith: ['phuong.hd@qlrpbm.vn'],
    isProtected: true,
    versions: [
      {
        id: 'ver-002-1',
        versionName: 'V01.0',
        fileName: 'DA001_PhuongAnKyThuat_12_20260728_V01.pdf',
        fileSize: 4120000,
        uploadedAt: '2026-07-25 09:15',
        uploadedBy: 'Thiếu tá Hoàng Đình Phương',
        comment: 'Phương án kỹ thuật thi công rà phá bom mìn phê duyệt cấp BTL',
        isCurrent: true
      }
    ],
    contentPdfHtml: `
      <div style="font-family: Arial, sans-serif; padding: 30px; background: #fff; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <h3 style="text-align: center; text-transform: uppercase; color: #1e293b;">PHƯƠNG ÁN KỸ THUẬT THI CÔNG RÀ PHÁ BOM MÌN, VẬT NỔ</h3>
        <p style="text-align: center; font-style: italic; font-size: 12px;">Dự án: DA001 - Mặt bằng Khu công nghiệp Vũng Tàu</p>
        <hr/>
        <p><strong>1. Đội ngũ nhân lực:</strong> 01 Chỉ huy công trường, 02 Đội trưởng, 12 Kỹ thuật viên RPBM có chứng chỉ Bộ Quốc phòng.</p>
        <p><strong>2. Khí tài sử dụng:</strong> 06 Máy dò bom Vallon VMX1, 02 Máy dò kim loại Vallon VMC1, 01 Xe chỉ huy, 01 Xe cứu thương.</p>
        <p><strong>3. Quy trình kỹ thuật:</strong> Phát quang mặt bằng -> Dò nông đến 0.3m -> Dò sâu đến 5m -> Đánh dấu vị trí -> Rà đào kiểm tra -> Thu gom và hủy nổ tại bãi tập trung.</p>
      </div>
    `
  },

  {
    id: 'file-003',
    name: 'DA001_SoDoMatBangClearance_20260728_V01.png',
    folderId: 'folder-da001-4', // 04_Nhat_ky_thi_cong
    path: '/QLRPBM/04_Du_an/DA001_SanLapVungTau/04_Nhat_ky_thi_cong/DA001_SoDoMatBangClearance_20260728_V01.png',
    fileType: 'image',
    mimeType: 'image/png',
    size: 1850000,
    createdAt: '2026-07-27 16:00',
    updatedAt: '2026-07-27 16:00',
    uploadedBy: 'Thiếu tá Hoàng Đình Phương',
    projectId: 'proj-001',
    projectCode: 'DA001',
    docCategory: '04_Nhat_ky_thi_cong',
    version: 'V01',
    permission: 'editor',
    sharedWith: [],
    isProtected: false,
    versions: [
      {
        id: 'ver-003-1',
        versionName: 'V01.0',
        fileName: 'DA001_SoDoMatBangClearance_20260728_V01.png',
        fileSize: 1850000,
        uploadedAt: '2026-07-27 16:00',
        uploadedBy: 'Thiếu tá Hoàng Đình Phương',
        comment: 'Sơ đồ thi công phân ô rà phá bằng GPS',
        isCurrent: true
      }
    ],
    webPreviewUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&auto=format&fit=crop&q=80'
  },

  {
    id: 'file-004',
    name: 'DA002_HopDongThiCong_88_20260728_V01.pdf',
    folderId: 'folder-da002-2', // 02_Hop_dong
    path: '/QLRPBM/04_Du_an/DA002_CaoTocMaiSon/02_Hop_dong/DA002_HopDongThiCong_88_20260728_V01.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    size: 5120000,
    createdAt: '2026-02-15 10:00',
    updatedAt: '2026-02-15 10:00',
    uploadedBy: 'Đại úy Nguyễn Thùy Linh',
    projectId: 'proj-002',
    projectCode: 'DA002',
    docCategory: '02_Hop_dong',
    documentNumber: '88',
    version: 'V01',
    permission: 'owner',
    sharedWith: ['linh.nt@qlrpbm.vn'],
    isProtected: true,
    versions: [
      {
        id: 'ver-004-1',
        versionName: 'V01.0',
        fileName: 'DA002_HopDongThiCong_88_20260728_V01.pdf',
        fileSize: 5120000,
        uploadedAt: '2026-02-15 10:00',
        uploadedBy: 'Đại úy Nguyễn Thùy Linh',
        comment: 'Hợp đồng kinh tế thi công rà phá bom mìn dự án Cao tốc Mai Sơn',
        isCurrent: true
      }
    ]
  }
];

// Load & Save Utilities
export function getDriveFolders(): DriveFolderItem[] {
  return getStored<DriveFolderItem[]>(DRIVE_STORAGE_KEYS.FOLDERS, INITIAL_DRIVE_FOLDERS);
}

export function saveDriveFolders(folders: DriveFolderItem[]): void {
  setStored(DRIVE_STORAGE_KEYS.FOLDERS, folders);
}

export function getDriveFiles(): DriveFileItem[] {
  return getStored<DriveFileItem[]>(DRIVE_STORAGE_KEYS.FILES, INITIAL_DRIVE_FILES);
}

export function saveDriveFiles(files: DriveFileItem[]): void {
  setStored(DRIVE_STORAGE_KEYS.FILES, files);
}

// Auto Project Folder Creation Rule (Tạo thư mục dự án tự động)
export function ensureProjectDriveFolders(projectCode: string, projectName: string): DriveFolderItem {
  const folders = getDriveFolders();
  const parentProjFolder = folders.find(f => f.id === 'folder-04-da') || folders[0];

  const projectFolderCleanName = `${projectCode}_${projectName.replace(/[^a-zA-Z0-9_]/g, '')}`;
  let existingProjectFolder = folders.find(f => f.projectCode === projectCode && f.isProjectRootFolder);

  if (!existingProjectFolder) {
    const newProjFolderId = `folder-proj-${projectCode.toLowerCase()}-${Date.now()}`;
    const projPath = `${parentProjFolder.path}/${projectFolderCleanName}`;
    
    existingProjectFolder = {
      id: newProjFolderId,
      name: projectFolderCleanName,
      parentId: parentProjFolder.id,
      path: projPath,
      isProjectRootFolder: true,
      projectCode,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      permission: 'owner'
    };

    const newSubfolders: DriveFolderItem[] = PROJECT_SUBFOLDERS.map((subName, idx) => ({
      id: `${newProjFolderId}-sub-${idx + 1}`,
      name: subName,
      parentId: newProjFolderId,
      path: `${projPath}/${subName}`,
      projectCode,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      permission: 'owner'
    }));

    const updatedFolders = [...folders, existingProjectFolder, ...newSubfolders];
    saveDriveFolders(updatedFolders);

    addAuditLog(
      'Google Drive',
      `Tự động khởi tạo cấu trúc 9 thư mục Google Drive cho Dự án: ${projectCode} (${projectName})`,
      'tao',
      null,
      { projectCode, path: projPath, subfolderCount: 9 }
    );
  }

  return existingProjectFolder;
}

// Format Filename Rule: [Mã dự án]_[Loại hồ sơ]_[Số văn bản]_[Ngày YYYYMMDD]_[Phiên bản].ext
export function formatStandardFilename(
  projectCode: string,
  categoryName: string,
  docNumber: string,
  dateYYYYMMDD: string,
  versionStr: string,
  extension: string
): string {
  const pCode = (projectCode || 'DA').trim();
  const cat = (categoryName || 'HoSo').replace(/[^a-zA-Z0-9]/g, '');
  const num = (docNumber || '01').replace(/[^a-zA-Z0-9]/g, '');
  const dateStr = (dateYYYYMMDD || new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const ver = (versionStr || 'V01').toUpperCase().startsWith('V') ? versionStr.toUpperCase() : `V${versionStr}`;
  const ext = extension.startsWith('.') ? extension : `.${extension}`;

  return `${pCode}_${cat}_${num}_${dateStr}_${ver}${ext}`;
}

// Duplicate Detection
export function checkDuplicateFileName(folderId: string, fileName: string): DriveFileItem | undefined {
  const files = getDriveFiles();
  return files.find(f => f.folderId === folderId && f.name.toLowerCase() === fileName.toLowerCase());
}

// Delete file with Mandatory Confirmation check
export function deleteDriveFileConfirmed(fileId: string): boolean {
  const files = getDriveFiles();
  const fileToDelete = files.find(f => f.id === fileId);
  if (!fileToDelete) return false;

  const currentUser = getCurrentUser();

  const updatedFiles = files.filter(f => f.id !== fileId);
  saveDriveFiles(updatedFiles);

  addAuditLog(
    'Google Drive',
    `Xác nhận xóa file khỏi Google Drive: ${fileToDelete.name} (Đã xác nhận)`,
    'xoa',
    fileToDelete,
    null
  );

  return true;
}

// Add/Update new version to an existing file
export function addFileVersionToDrive(
  fileId: string,
  newFileName: string,
  fileSize: number,
  comment: string
): DriveFileItem | null {
  const files = getDriveFiles();
  const targetFile = files.find(f => f.id === fileId);
  if (!targetFile) return null;

  const currentUser = getCurrentUser();
  const currentVersionCount = targetFile.versions.length + 1;
  const newVersionName = `V${String(currentVersionCount).padStart(2, '0')}.0`;

  // Set current versions isCurrent = false
  const updatedVersions = targetFile.versions.map(v => ({ ...v, isCurrent: false }));

  const newVersionRecord: DriveFileVersion = {
    id: `ver-${targetFile.id}-${currentVersionCount}`,
    versionName: newVersionName,
    fileName: newFileName,
    fileSize,
    uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    uploadedBy: currentUser.name,
    comment,
    isCurrent: true
  };

  updatedVersions.unshift(newVersionRecord);

  const updatedFile: DriveFileItem = {
    ...targetFile,
    name: newFileName,
    version: `V${String(currentVersionCount).padStart(2, '0')}`,
    size: fileSize,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    versions: updatedVersions
  };

  const finalFiles = files.map(f => (f.id === fileId ? updatedFile : f));
  saveDriveFiles(finalFiles);

  addAuditLog(
    'Google Drive',
    `Tải lên phiên bản mới (${newVersionName}) cho file Google Drive: ${newFileName}`,
    'tai_len',
    targetFile,
    updatedFile
  );

  return updatedFile;
}

// Update file permission
export function updateFileAccessPermission(
  fileId: string,
  permission: DriveAccessPermission,
  sharedWith: string[]
): void {
  const files = getDriveFiles();
  const updated = files.map(f => {
    if (f.id === fileId) {
      return { ...f, permission, sharedWith };
    }
    return f;
  });
  saveDriveFiles(updated);

  addAuditLog(
    'Google Drive',
    `Cập nhật quyền truy cập file Google Drive (${permission}) cho ${sharedWith.length} người dùng`,
    'thay_doi_quyen'
  );
}

// Folder breadcrumb lookup
export function getFolderBreadcrumbs(folderId: string | null): DriveFolderItem[] {
  if (!folderId) return [];
  const folders = getDriveFolders();
  const breadcrumbs: DriveFolderItem[] = [];

  let current: DriveFolderItem | undefined = folders.find(f => f.id === folderId);
  while (current) {
    breadcrumbs.unshift(current);
    if (!current.parentId) break;
    current = folders.find(f => f.id === current?.parentId);
  }

  return breadcrumbs;
}
