import {
  UXOEquipment,
  UXOCalibrationRecord,
  UXOMaintenanceRecord,
  UXODispatchRecord,
  UXOEquipmentCategory
} from '../types';

const STORAGE_KEY = 'uxo_specialized_equipment_v1';

export const INITIAL_EQUIPMENT: UXOEquipment[] = [
  {
    id: 'eq-001',
    assetCode: 'TS-MDB-001',
    qrCode: 'QR-TS-MDB-001-VXC1',
    name: 'Máy dò bom từ tính độ sâu Vallon VXC1',
    category: 'may_do_bom_min',
    brand: 'Vallon GmbH',
    model: 'VXC1 Deep Search',
    power: '12V - 45W',
    manufactureYear: 2022,
    features: 'Dò từ trường phát hiện bom chìm độ sâu đến 6m, độ nhạy cao 0.1nT',
    origin: 'Đức',
    registrationNo: 'ĐK-QS-8821/2024',
    currentLocation: 'Hà Nội',
    deploymentStatus: 'Sẵn sàng huy động khi thi công',
    equipmentSource: 'Sở hữu của nhà thầu',
    scanFile: {
      fileName: 'File_Scan_Dang_Kiem_Vallon_VXC1.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '1.8 MB',
      uploadedAt: '2025-01-12'
    },
    serialNumber: 'VAL-2022-8910',
    commissioningDate: '2022-06-15',
    originSource: 'Dự án ODA Việt - Hàn (VNMAC)',
    managingUnit: 'Đội Rà phá Bom mìn Chuyên sâu 1',
    status: 'dang_su_dung',
    currentProject: 'Dự án Rà phá Bom mìn Vật nổ tồn đọng sau chiến tranh - Tỉnh Quảng Trị',
    notes: 'Đã tích hợp cảm biến từ độ nhạy cao 0.1nT.',
    calibrationHistory: [
      {
        id: 'cal-001',
        equipmentId: 'eq-001',
        roundCode: 'HC-2024-01',
        inspectionDate: '2024-01-10',
        calibrationDate: '2024-01-10',
        expiryDate: '2025-01-10',
        providerUnit: 'Trung tâm Kiểm định Chuẩn đo lường Quân sự BQP',
        certificateNo: 'GCN-KĐ-8821/2024',
        result: 'dat',
        certificateFileUrl: 'https://example.com/certs/gcn-val-001.pdf',
        costVnd: 1500000,
        notes: 'Chuẩn độ lệch từ trường < 0.05%',
        createdAt: '2024-01-10T08:00:00Z'
      }
    ],
    maintenanceHistory: [],
    dispatchHistory: [],
    createdAt: '2022-06-15T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z'
  },
  {
    id: 'eq-002',
    assetCode: 'TS-MDM-002',
    qrCode: 'QR-TS-MDM-002-MINELAB-F3',
    name: 'Máy dò mìn phi kim loại & kim loại Minelab F3',
    category: 'may_do_bom_min',
    brand: 'Minelab Australia',
    model: 'F3 Compact Dual Pulse',
    power: '6V DC',
    manufactureYear: 2023,
    features: 'Chống nước IP68, độ nhạy cao phát hiện mìn kíp nhựa nhỏ',
    origin: 'Australia',
    registrationNo: 'ĐK-QS-304/2024',
    currentLocation: 'Hà Nội',
    deploymentStatus: 'Sẵn sàng huy động khi thi công',
    equipmentSource: 'Sở hữu của nhà thầu',
    scanFile: {
      fileName: 'File_Scan_Minelab_F3.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '1.2 MB',
      uploadedAt: '2024-04-15'
    },
    serialNumber: 'MIN-F3-99382',
    commissioningDate: '2023-03-10',
    originSource: 'Ngân sách Bộ Quốc phòng',
    managingUnit: 'Tiểu đoàn 1 - Bộ Tư lệnh Công binh',
    status: 'san_sang',
    notes: 'Thiết bị chuẩn chống nước IP68.',
    calibrationHistory: [],
    maintenanceHistory: [],
    dispatchHistory: [],
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2024-04-15T00:00:00Z'
  },
  {
    id: 'eq-003',
    assetCode: 'TS-GPS-003',
    qrCode: 'QR-TS-GPS-003-TRIMBLE-R12',
    name: 'Thiết bị định vị vệ tinh GPS RTK Trimble R12i',
    category: 'gps',
    brand: 'Trimble USA',
    model: 'R12i GNSS System',
    power: '7.4V - 25W',
    manufactureYear: 2023,
    features: 'Định vị vệ tinh RTK độ chính xác mm, bù nghiêng IMU tự động 60 độ',
    origin: 'Mỹ',
    registrationNo: 'GCN-VMI-8819/2024',
    currentLocation: 'Hà Nội',
    deploymentStatus: 'Sẵn sàng huy động khi thi công',
    equipmentSource: 'Sở hữu của nhà thầu',
    scanFile: {
      fileName: 'File_Scan_Kierm_Dinh_GPS_Trimble.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '2.1 MB',
      uploadedAt: '2024-09-05'
    },
    serialNumber: 'TRM-R12-77123',
    commissioningDate: '2023-09-01',
    originSource: 'Dự án ODA Hàn Quốc (KOICA)',
    managingUnit: 'Phòng Điều phối Dự án RPBM',
    status: 'dang_su_dung',
    notes: 'Hệ thống định vị GPS RTK độ chính xác milimet.',
    calibrationHistory: [],
    maintenanceHistory: [],
    dispatchHistory: [],
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-09-05T00:00:00Z'
  },
  {
    id: 'eq-004',
    assetCode: 'TS-MTD-004',
    qrCode: 'QR-TS-MTD-004-LEICA-TS07',
    name: 'Máy toàn đạc điện tử Leica FlexLine TS07',
    category: 'dung_cu_khac',
    brand: 'Leica Geosystems Switzerland',
    model: 'TS07 2" R1000',
    power: '3.7V Li-Ion',
    manufactureYear: 2021,
    features: 'Đo góc độ chính xác 2", đo không gương R1000m, bọt thủy điện tử',
    origin: 'Thụy Sĩ',
    registrationNo: 'GCN-BĐ-1102/2023',
    currentLocation: 'Hà Nội',
    deploymentStatus: 'Sẵn sàng huy động khi thi công',
    equipmentSource: 'Sở hữu của nhà thầu',
    scanFile: {
      fileName: 'File_Scan_Dossier_Leica_TS07.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '3.4 MB',
      uploadedAt: '2023-11-10'
    },
    serialNumber: 'LCA-TS07-55104',
    commissioningDate: '2021-11-20',
    originSource: 'Ngân sách BQP',
    managingUnit: 'Đội Đo đạc Bản đồ RPBM 3',
    status: 'dang_bao_tri',
    notes: 'Đang bảo dưỡng lăng kính.',
    calibrationHistory: [],
    maintenanceHistory: [],
    dispatchHistory: [],
    createdAt: '2021-11-20T00:00:00Z',
    updatedAt: '2025-02-10T00:00:00Z'
  },
  {
    id: 'eq-005',
    assetCode: 'TS-BAM-005',
    qrCode: 'QR-TS-BAM-005-MOT-P8668',
    name: 'Bộ đàm cầm tay chống cháy nổ Motorola XiR P8668i TIA',
    category: 'bo_dam',
    brand: 'Motorola Solutions',
    model: 'XiR P8668i TIA4950',
    serialNumber: 'MOT-P86-44910',
    manufactureYear: 2023,
    commissioningDate: '2023-05-10',
    originSource: 'Tài trợ NPA Việt Nam',
    managingUnit: 'Đội Thông tin & Cứu thương Công trường 2',
    managerName: 'Thiếu úy Đặng Minh Tuấn',
    status: 'san_sang',
    currentLocation: 'Kho Đội 2 - Hướng Hóa, Quảng Trị',
    currentProject: 'Dự án Khảo sát & Rà phá mìn Quảng Trị',
    technicalDossierUrl: '',
    userManualUrl: '',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80',
    notes: 'Bộ đàm tích hợp nút bấm khẩn cấp Man-Down khống chế an toàn tại công trường hủy nổ.',
    calibrationHistory: [],
    maintenanceHistory: [],
    dispatchHistory: [],
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2023-05-10T00:00:00Z'
  },
  {
    id: 'eq-006',
    assetCode: 'TS-BHO-006',
    qrCode: 'QR-TS-BHO-006-MEDENG-SRS5',
    name: 'Bộ giáp bảo vệ nhân viên rà phá mìn Med-Eng SRS-5',
    category: 'thiet_bi_bao_ho',
    brand: 'Med-Eng Canada',
    model: 'SRS-5 Demining Suit & Visor',
    serialNumber: 'MED-SRS5-11029',
    manufactureYear: 2022,
    commissioningDate: '2022-10-01',
    originSource: 'Dự án ODA Nhật Bản (JICA)',
    managingUnit: 'Đội An toàn & Hủy nổ Chuyên nghiệp',
    managerName: 'Thượng úy Nguyễn Thanh Tùng',
    status: 'dang_su_dung',
    currentLocation: 'Bãi hủy nổ vật nổ tập trung Cam Lộ',
    currentProject: 'Dự án Hủy nổ Bom mìn Tồn đọng Quảng Trị',
    technicalDossierUrl: '',
    userManualUrl: '',
    photoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    notes: 'Giáp bảo vệ mảnh văng STANAG 2920 V50 = 450m/s. Kèm mũ che mặt polycarbonate chịu lực.',
    calibrationHistory: [
      {
        id: 'cal-006',
        equipmentId: 'eq-006',
        roundCode: 'KĐ-GIAP-2024',
        inspectionDate: '2024-10-01',
        expiryDate: '2025-10-01',
        providerUnit: 'Trung tâm Giám định Vật liệu Chống mảnh BQP',
        certificateNo: 'GCN-GD-441/2024',
        result: 'dat',
        costVnd: 1000000,
        notes: 'Kiểm tra siêu âm kết cấu Kevlar không rạn nứt',
        createdAt: '2024-10-01T08:00:00Z'
      }
    ],
    maintenanceHistory: [],
    dispatchHistory: [],
    createdAt: '2022-10-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z'
  }
];

export function getUXOEquipmentList(): UXOEquipment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EQUIPMENT));
      return INITIAL_EQUIPMENT;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load UXO equipment from localStorage', err);
    return INITIAL_EQUIPMENT;
  }
}

export function saveUXOEquipmentList(list: UXOEquipment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save UXO equipment to localStorage', err);
  }
}

export function saveSingleEquipment(eq: UXOEquipment): UXOEquipment[] {
  const current = getUXOEquipmentList();
  const index = current.findIndex(item => item.id === eq.id);
  let updated: UXOEquipment[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...eq, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...eq, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveUXOEquipmentList(updated);
  return updated;
}

export function deleteEquipment(id: string): UXOEquipment[] {
  const current = getUXOEquipmentList();
  const updated = current.filter(item => item.id !== id);
  saveUXOEquipmentList(updated);
  return updated;
}

// 10.1 Add Calibration Round (No overwriting old rounds)
export function addCalibrationRound(
  equipmentId: string,
  record: Omit<UXOCalibrationRecord, 'id' | 'equipmentId' | 'createdAt'>
): UXOEquipment[] {
  const current = getUXOEquipmentList();
  const eq = current.find(item => item.id === equipmentId);
  if (!eq) return current;

  const newRecord: UXOCalibrationRecord = {
    ...record,
    id: `cal-${Date.now()}`,
    equipmentId,
    createdAt: new Date().toISOString()
  };

  const updatedHistory = [newRecord, ...(eq.calibrationHistory || [])];
  
  const updatedEquipment: UXOEquipment = {
    ...eq,
    calibrationHistory: updatedHistory,
    updatedAt: new Date().toISOString()
  };

  return saveSingleEquipment(updatedEquipment);
}

// 10.2 Add Maintenance Record
export function addMaintenanceRecord(
  equipmentId: string,
  record: Omit<UXOMaintenanceRecord, 'id' | 'equipmentId' | 'createdAt'>
): UXOEquipment[] {
  const current = getUXOEquipmentList();
  const eq = current.find(item => item.id === equipmentId);
  if (!eq) return current;

  const newRecord: UXOMaintenanceRecord = {
    ...record,
    id: `maint-${Date.now()}`,
    equipmentId,
    createdAt: new Date().toISOString()
  };

  const updatedHistory = [newRecord, ...(eq.maintenanceHistory || [])];

  const updatedEquipment: UXOEquipment = {
    ...eq,
    maintenanceHistory: updatedHistory,
    updatedAt: new Date().toISOString()
  };

  return saveSingleEquipment(updatedEquipment);
}

// 10.3 Add Dispatch / Return Record
export function addDispatchRecord(
  equipmentId: string,
  record: Omit<UXODispatchRecord, 'id' | 'equipmentId' | 'createdAt'>
): UXOEquipment[] {
  const current = getUXOEquipmentList();
  const eq = current.find(item => item.id === equipmentId);
  if (!eq) return current;

  const newRecord: UXODispatchRecord = {
    ...record,
    id: `disp-${Date.now()}`,
    equipmentId,
    createdAt: new Date().toISOString()
  };

  const updatedHistory = [newRecord, ...(eq.dispatchHistory || [])];

  // Also update current project/location/status if dispatching
  const isBorrowing = record.status === 'dang_muon';
  const updatedEquipment: UXOEquipment = {
    ...eq,
    status: isBorrowing ? 'dang_su_dung' : eq.status,
    currentProject: isBorrowing ? record.projectName : eq.currentProject,
    dispatchHistory: updatedHistory,
    updatedAt: new Date().toISOString()
  };

  return saveSingleEquipment(updatedEquipment);
}

// Return equipment (Close dispatch record)
export function returnEquipmentRecord(
  equipmentId: string,
  dispatchId: string,
  actualReturnDate: string,
  returnCondition: string,
  notes?: string
): UXOEquipment[] {
  const current = getUXOEquipmentList();
  const eq = current.find(item => item.id === equipmentId);
  if (!eq) return current;

  const updatedHistory = (eq.dispatchHistory || []).map(disp => {
    if (disp.id === dispatchId) {
      return {
        ...disp,
        actualReturnDate,
        returnCondition,
        status: 'da_tra' as const,
        notes: notes || disp.notes
      };
    }
    return disp;
  });

  const updatedEquipment: UXOEquipment = {
    ...eq,
    status: 'san_sang',
    dispatchHistory: updatedHistory,
    updatedAt: new Date().toISOString()
  };

  return saveSingleEquipment(updatedEquipment);
}

export function resetUXOEquipmentData(): UXOEquipment[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EQUIPMENT));
  return INITIAL_EQUIPMENT;
}
