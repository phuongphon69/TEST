import { ArchiveDossier, ArchiveBorrowRecord, WarehouseLocation, WarehouseSlip } from '../types';
import { addAuditLog } from './storage';

const STORAGE_KEYS = {
  ARCHIVES: 'qlrpbm_archive_dossiers',
  BORROWS: 'qlrpbm_archive_borrows',
  LOCATIONS: 'qlrpbm_warehouse_locations',
  SLIPS: 'qlrpbm_warehouse_slips'
};

export const INITIAL_LOCATIONS: WarehouseLocation[] = [
  // Zone A - Dãy 03 - Giá G02
  { id: 'loc-01', locationCode: 'KHO01-A-03-G02-T04-H12', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 03', shelf: 'Giá G02', tier: 'Tầng T04', boxCode: 'H12', status: 'dang_luu', maxCapacityBoxes: 1, currentBoxCount: 1, notes: 'Lưu Hồ sơ Dự án Cao tốc Quảng Trị - TT Huế' },
  { id: 'loc-02', locationCode: 'KHO01-A-03-G02-T04-H13', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 03', shelf: 'Giá G02', tier: 'Tầng T04', boxCode: 'H13', status: 'day', maxCapacityBoxes: 1, currentBoxCount: 1, notes: 'Lưu Hồ sơ Nghiệm thu KCN Vị Xuyên' },
  { id: 'loc-03', locationCode: 'KHO01-A-03-G02-T04-H14', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 03', shelf: 'Giá G02', tier: 'Tầng T04', boxCode: 'H14', status: 'dang_luu', maxCapacityBoxes: 1, currentBoxCount: 1, notes: 'Lưu Giấy phép Khảo sát RPBM 2026' },
  { id: 'loc-04', locationCode: 'KHO01-A-03-G02-T04-H15', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 03', shelf: 'Giá G02', tier: 'Tầng T04', boxCode: 'H15', status: 'trong', maxCapacityBoxes: 1, currentBoxCount: 0, notes: 'Sẵn sàng tiếp nhận hộp hồ sơ mới' },
  
  // Zone A - Dãy 02 - Giá G03
  { id: 'loc-05', locationCode: 'KHO01-A-02-G03-T01-H08', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 02', shelf: 'Giá G03', tier: 'Tầng T01', boxCode: 'H08', status: 'dang_luu', maxCapacityBoxes: 1, currentBoxCount: 1, notes: 'Khu hồ sơ Tối mật - Bãi hủy nổ bom đạn' },
  { id: 'loc-06', locationCode: 'KHO01-A-02-G03-T01-H09', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 02', shelf: 'Giá G03', tier: 'Tầng T01', boxCode: 'H09', status: 'bi_khoa', maxCapacityBoxes: 1, currentBoxCount: 0, notes: 'Tủ khóa đặc biệt niêm phong an ninh' },
  { id: 'loc-07', locationCode: 'KHO01-A-02-G03-T02-H10', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 02', shelf: 'Giá G03', tier: 'Tầng T02', boxCode: 'H10', status: 'can_kiem_tra', maxCapacityBoxes: 1, currentBoxCount: 1, notes: 'Cần vệ sinh chống ẩm mốc định kỳ' },
  { id: 'loc-08', locationCode: 'KHO01-A-02-G03-T02-H11', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu A', row: 'Dãy 02', shelf: 'Giá G03', tier: 'Tầng T02', boxCode: 'H11', status: 'trong', maxCapacityBoxes: 1, currentBoxCount: 0 },

  // Zone B - Dãy 01 - Giá G01
  { id: 'loc-09', locationCode: 'KHO01-B-01-G01-T02-H05', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu B', row: 'Dãy 01', shelf: 'Giá G01', tier: 'Tầng T02', boxCode: 'H05', status: 'dang_luu', maxCapacityBoxes: 1, currentBoxCount: 1, notes: 'Hồ sơ Chứng chỉ & Nhân sự RPBM' },
  { id: 'loc-10', locationCode: 'KHO01-B-01-G01-T02-H06', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu B', row: 'Dãy 01', shelf: 'Giá G01', tier: 'Tầng T02', boxCode: 'H06', status: 'trong', maxCapacityBoxes: 1, currentBoxCount: 0 },
  { id: 'loc-11', locationCode: 'KHO01-B-01-G01-T03-H07', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu B', row: 'Dãy 01', shelf: 'Giá G01', tier: 'Tầng T03', boxCode: 'H07', status: 'trong', maxCapacityBoxes: 1, currentBoxCount: 0 },
  { id: 'loc-12', locationCode: 'KHO01-B-01-G01-T03-H08', warehouseId: 'KHO01', warehouseName: 'Kho Hồ sơ RPBM Trung tâm', zone: 'Khu B', row: 'Dãy 01', shelf: 'Giá G01', tier: 'Tầng T03', boxCode: 'H08', status: 'trong', maxCapacityBoxes: 1, currentBoxCount: 0 }
];

export const INITIAL_ARCHIVES: ArchiveDossier[] = [
  {
    id: 'arch-01',
    archiveCode: 'HS-2026-RPBM-001',
    stt: 1,
    title: 'Hồ sơ Phương án Kỹ thuật & Bản vẽ Thi công Rà phá Bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    category: 'du_an_rpbm',
    relatedProjectId: 'proj-01',
    relatedProjectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    archiveYear: 2026,
    retentionPeriod: 'vinh_vien',
    secrecyLevel: 'mat',
    documentCount: 12,
    pageCount: 450,
    entryDate: '2026-02-10',
    entryPerson: 'Nguyễn Văn Hùng',
    locationCode: 'KHO01-A-03-G02-T04-H12',
    boxCode: 'H12',
    physicalCondition: 'tot',
    catalogFileUrl: 'https://drive.google.com/file/d/MUCLUC_HS001/view',
    scanFileUrl: 'https://drive.google.com/file/d/SCAN_HS001/view',
    googleDriveUrl: 'https://drive.google.com/file/d/DRIVE_HS001/view',
    notes: 'Bao gồm toàn bộ bản vẽ hoàn công và quyết định phê duyệt phương án',
    qrCode: 'KHO01-A-03-G02-T04-H12::HS-2026-RPBM-001',
    barcode: '8930002026001',
    status: 'dang_muon',
    createdAt: '10/02/2026',
    updatedAt: '20/07/2026'
  },
  {
    id: 'arch-02',
    archiveCode: 'HS-2025-RPBM-002',
    stt: 2,
    title: 'Hồ sơ Nghiệm thu Hoàn thành & Nhật ký Công trường RPBM Khu công nghiệp Vị Xuyên - Hà Giang',
    category: 'nghiep_vu_ky_thuat',
    relatedProjectId: 'proj-02',
    relatedProjectName: 'Rà phá bom mìn Khu công nghiệp Vị Xuyên - Hà Giang',
    archiveYear: 2025,
    retentionPeriod: '30_nam',
    secrecyLevel: 'thuong',
    documentCount: 8,
    pageCount: 320,
    entryDate: '2025-11-20',
    entryPerson: 'Lê Hoàng Nam',
    locationCode: 'KHO01-A-03-G02-T04-H13',
    boxCode: 'H13',
    physicalCondition: 'tot',
    catalogFileUrl: 'https://drive.google.com/file/d/MUCLUC_HS002/view',
    scanFileUrl: 'https://drive.google.com/file/d/SCAN_HS002/view',
    googleDriveUrl: 'https://drive.google.com/file/d/DRIVE_HS002/view',
    notes: 'Có đính kèm file quét 3D khu vực dò tìm chuyên sâu',
    qrCode: 'KHO01-A-03-G02-T04-H13::HS-2025-RPBM-002',
    barcode: '8930002025002',
    status: 'dang_muon',
    createdAt: '20/11/2025',
    updatedAt: '01/07/2026'
  },
  {
    id: 'arch-03',
    archiveCode: 'HS-2024-RPBM-003',
    stt: 3,
    title: 'Hồ sơ An toàn Lao động & Danh mục Chứng chỉ Chuyên môn Cán bộ RPBM năm 2024-2025',
    category: 'nhan_su_chung_chi',
    relatedProjectId: '',
    relatedProjectName: 'Toàn đơn vị',
    archiveYear: 2024,
    retentionPeriod: '20_nam',
    secrecyLevel: 'thuong',
    documentCount: 25,
    pageCount: 180,
    entryDate: '2024-12-15',
    entryPerson: 'Phạm Quốc Việt',
    locationCode: 'KHO01-B-01-G01-T02-H05',
    boxCode: 'H05',
    physicalCondition: 'binh_thuong',
    catalogFileUrl: 'https://drive.google.com/file/d/MUCLUC_HS003/view',
    scanFileUrl: 'https://drive.google.com/file/d/SCAN_HS003/view',
    googleDriveUrl: 'https://drive.google.com/file/d/DRIVE_HS003/view',
    notes: 'Lưu bản chính các chứng chỉ kỹ thuật viên cấp 1, 2, 3 và chỉ huy trưởng',
    qrCode: 'KHO01-B-01-G01-T02-H05::HS-2024-RPBM-003',
    barcode: '8930002024003',
    status: 'luu_kho',
    createdAt: '15/12/2024',
    updatedAt: '15/12/2024'
  },
  {
    id: 'arch-04',
    archiveCode: 'HS-2023-RPBM-004',
    stt: 4,
    title: 'Sơ đồ Bãi nổ & Nhật ký Hủy nổ Tín hiệu Bom đạn Cảng biển Chân Mây - Thừa Thiên Huế',
    category: 'nghiep_vu_ky_thuat',
    relatedProjectId: 'proj-04',
    relatedProjectName: 'Rà phá bom mìn Dưới nước Khu vực Cảng biển Chân Mây',
    archiveYear: 2023,
    retentionPeriod: 'vinh_vien',
    secrecyLevel: 'toi_mat',
    documentCount: 5,
    pageCount: 120,
    entryDate: '2023-08-05',
    entryPerson: 'Hoàng Văn Thái',
    locationCode: 'KHO01-A-02-G03-T01-H08',
    boxCode: 'H08',
    physicalCondition: 'can_bao_quan_dac_biet',
    catalogFileUrl: 'https://drive.google.com/file/d/MUCLUC_HS004/view',
    scanFileUrl: 'https://drive.google.com/file/d/SCAN_HS004/view',
    googleDriveUrl: 'https://drive.google.com/file/d/DRIVE_HS004/view',
    notes: 'Hồ sơ Tối mật - Bảo quản trong tủ chống cháy niêm phong',
    qrCode: 'KHO01-A-02-G03-T01-H08::HS-2023-RPBM-004',
    barcode: '8930002023004',
    status: 'luu_kho',
    createdAt: '05/08/2023',
    updatedAt: '05/08/2023'
  },
  {
    id: 'arch-05',
    archiveCode: 'HS-2026-RPBM-005',
    stt: 5,
    title: 'Giấy phép Khảo sát Rà phá Bom mìn & Biên bản Kiểm định Máy dò Foerster EL1302',
    category: 'phap_ly_hop_dong',
    relatedProjectId: 'proj-01',
    relatedProjectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    archiveYear: 2026,
    retentionPeriod: '10_nam',
    secrecyLevel: 'thuong',
    documentCount: 6,
    pageCount: 95,
    entryDate: '2026-03-01',
    entryPerson: 'Trần Văn Mạnh',
    locationCode: 'KHO01-A-03-G02-T04-H14',
    boxCode: 'H14',
    physicalCondition: 'tot',
    catalogFileUrl: 'https://drive.google.com/file/d/MUCLUC_HS005/view',
    scanFileUrl: 'https://drive.google.com/file/d/SCAN_HS005/view',
    googleDriveUrl: 'https://drive.google.com/file/d/DRIVE_HS005/view',
    notes: 'Bản sao công chứng đính kèm tem kiểm định',
    qrCode: 'KHO01-A-03-G02-T04-H14::HS-2026-RPBM-005',
    barcode: '8930002026005',
    status: 'luu_kho',
    createdAt: '01/03/2026',
    updatedAt: '01/03/2026'
  }
];

export const INITIAL_BORROWS: ArchiveBorrowRecord[] = [
  {
    id: 'bor-01',
    archiveId: 'arch-02',
    archiveCode: 'HS-2025-RPBM-002',
    archiveTitle: 'Hồ sơ Nghiệm thu Hoàn thành & Nhật ký Công trường RPBM Khu công nghiệp Vị Xuyên - Hà Giang',
    borrowerName: 'Lê Hoàng Nam',
    borrowerUnit: 'Phòng Kỹ thuật Thi công',
    purpose: 'Phục vụ thanh quyết toán dự án với chủ đầu tư và thanh tra tài chính',
    borrowDate: '2026-07-01',
    expectedReturnDate: '2026-07-15', // Quá hạn (hiện tại là 28/07/2026)
    conditionOnBorrow: 'Hồ sơ đầy đủ 8 tài liệu, bìa cứng mới không hư hỏng',
    approverName: 'Thượng tá Nguyễn Văn Hùng',
    slipFileUrl: 'https://drive.google.com/file/d/PHIEU_MUON_01/view',
    status: 'qua_han',
    notes: 'Đã gửi thông báo nhắc trả hồ sơ lần 2',
    createdAt: '01/07/2026'
  },
  {
    id: 'bor-02',
    archiveId: 'arch-01',
    archiveCode: 'HS-2026-RPBM-001',
    archiveTitle: 'Hồ sơ Phương án Kỹ thuật & Bản vẽ Thi công Rà phá Bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    borrowerName: 'Nguyễn Văn Hùng',
    borrowerUnit: 'Ban QLDA RPBM Cao tốc Quảng Trị',
    purpose: 'Trình duyệt điều chỉnh phương án thi công đoạn qua khe suối',
    borrowDate: '2026-07-20',
    expectedReturnDate: '2026-08-05',
    conditionOnBorrow: 'Đầy đủ 12 tài liệu, 450 tờ',
    approverName: 'Đại tá Trần Đức Long',
    slipFileUrl: 'https://drive.google.com/file/d/PHIEU_MUON_02/view',
    status: 'dang_muon',
    notes: 'Mượn tập 1 và tập 2 bản vẽ',
    createdAt: '20/07/2026'
  },
  {
    id: 'bor-03',
    archiveId: 'arch-03',
    archiveCode: 'HS-2024-RPBM-003',
    archiveTitle: 'Hồ sơ An toàn Lao động & Danh mục Chứng chỉ Chuyên môn Cán bộ RPBM năm 2024-2025',
    borrowerName: 'Phạm Quốc Việt',
    borrowerUnit: 'Đội Y tế Dã chiến',
    purpose: 'Rà soát danh sách chứng chỉ sơ cấp cứu cán bộ đội thi công',
    borrowDate: '2026-06-10',
    expectedReturnDate: '2026-06-20',
    actualReturnDate: '2026-06-18',
    conditionOnBorrow: 'Tốt',
    conditionOnReturn: 'Trả lại nguyên vẹn, đầy đủ',
    approverName: 'Nguyễn Văn Hùng',
    slipFileUrl: 'https://drive.google.com/file/d/PHIEU_MUON_03/view',
    status: 'da_tra',
    notes: 'Đã trả đúng hạn',
    createdAt: '10/06/2026'
  }
];

export function getArchiveDossiers(): ArchiveDossier[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(INITIAL_ARCHIVES));
      return INITIAL_ARCHIVES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse archives storage:', err);
    return INITIAL_ARCHIVES;
  }
}

export function saveArchiveDossiers(archives: ArchiveDossier[], logMessage?: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
    if (logMessage) {
      addAuditLog('Kho Hồ sơ 12.1', logMessage);
    }
  } catch (err) {
    console.error('Failed to save archives storage:', err);
  }
}

export function getArchiveBorrows(): ArchiveBorrowRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BORROWS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.BORROWS, JSON.stringify(INITIAL_BORROWS));
      return INITIAL_BORROWS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse archive borrows storage:', err);
    return INITIAL_BORROWS;
  }
}

export function saveArchiveBorrows(borrows: ArchiveBorrowRecord[], logMessage?: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BORROWS, JSON.stringify(borrows));
    if (logMessage) {
      addAuditLog('Mượn trả Hồ sơ 12.2', logMessage);
    }
  } catch (err) {
    console.error('Failed to save archive borrows storage:', err);
  }
}

export function getWarehouseLocations(): WarehouseLocation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
      return INITIAL_LOCATIONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse warehouse locations storage:', err);
    return INITIAL_LOCATIONS;
  }
}

export function saveWarehouseLocations(locations: WarehouseLocation[], logMessage?: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    if (logMessage) {
      addAuditLog('Sơ đồ Kho 12.3', logMessage);
    }
  } catch (err) {
    console.error('Failed to save warehouse locations storage:', err);
  }
}

export function getWarehouseSlips(): WarehouseSlip[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SLIPS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to parse warehouse slips:', err);
    return [];
  }
}

export function saveWarehouseSlips(slips: WarehouseSlip[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SLIPS, JSON.stringify(slips));
  } catch (err) {
    console.error('Failed to save warehouse slips:', err);
  }
}
