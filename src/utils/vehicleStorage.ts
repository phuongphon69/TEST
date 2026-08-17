import { Vehicle, VehicleInspectionRecord, VehicleAlertSettings } from '../types';

const STORAGE_KEY_VEHICLES = 'uxo_vehicles_data_v1';
const STORAGE_KEY_ALERT_SETTINGS = 'uxo_vehicle_alert_settings_v1';

export const DEFAULT_ALERT_SETTINGS: VehicleAlertSettings = {
  thresholdDays: [90, 60, 30, 15, 7],
  enableEmailAlerts: true,
  enableInAppAlerts: true
};

/** Centralized inspection warning threshold in days (Requirement Section VI) */
export const INSPECTION_WARNING_DAYS = 30;

export type VehicleInspectionStatus = 'valid' | 'expiring_soon' | 'expired' | 'missing_info';

export interface VehicleInspectionMetrics {
  total: number;
  validCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  missingInfoCount: number;
  warningDays: number;
}

export function getVehicleInspectionDaysLeft(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDateStr);
  exp.setHours(0, 0, 0, 0);
  if (isNaN(exp.getTime())) return null;
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getVehicleInspectionStatus(
  veh: Vehicle,
  warningDays: number = INSPECTION_WARNING_DAYS
): VehicleInspectionStatus {
  if (!veh.lastInspectionDate || !veh.nextInspectionExpiryDate) {
    return 'missing_info';
  }
  const daysLeft = getVehicleInspectionDaysLeft(veh.nextInspectionExpiryDate);
  if (daysLeft === null) return 'missing_info';
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= warningDays) return 'expiring_soon';
  return 'valid';
}

export function calculateVehicleInspectionMetrics(
  vehicles: Vehicle[],
  warningDays: number = INSPECTION_WARNING_DAYS
): VehicleInspectionMetrics {
  let validCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  let missingInfoCount = 0;

  vehicles.forEach(v => {
    const status = getVehicleInspectionStatus(v, warningDays);
    if (status === 'valid') validCount++;
    else if (status === 'expiring_soon') expiringSoonCount++;
    else if (status === 'expired') expiredCount++;
    else if (status === 'missing_info') missingInfoCount++;
  });

  return {
    total: vehicles.length,
    validCount,
    expiringSoonCount,
    expiredCount,
    missingInfoCount,
    warningDays
  };
}

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    code: 'XE-RPBM-01',
    licensePlate: '80A-024.68',
    vehicleType: 'Bán tải chuyên dụng RPBM',
    brand: 'Ford',
    model: 'Ranger Wildtrak 4x4 Bi-Turbo',
    manufactureYear: 2022,
    chassisNumber: 'MNBXX01982736412',
    engineNumber: 'P01928374',
    color: 'Xanh Quân sự',
    managingUnit: 'Tiểu đoàn Rà phá Bom mìn 1 - Bộ Lệnh Công binh',
    managerName: 'Thiếu tá Nguyễn Văn Bình (Đội trưởng)',
    frequentDriverName: 'Thượng úy Lê Hoàng Long (Lái xe)',
    registrationNo: 'DK-80A-02468',
    registrationDate: '2022-04-15',
    registrationFileUrl: 'https://example.com/files/dang-ky-80a-02468.pdf',
    currentInspectionCertNo: 'KC-8912304/2025',
    lastInspectionDate: '2025-08-10',
    nextInspectionExpiryDate: '2026-08-10', // Expiring in ~12 days relative to 2026-07-28
    inspectionUnit: 'Trung tâm Đăng kiểm Khí tài Quân sự 83',
    inspectionFileUrl: 'https://example.com/files/dang-kiem-80a-02468.pdf',
    insuranceExpiryDate: '2026-09-01',
    insuranceFileUrl: 'https://example.com/files/bao-hiem-80a-02468.pdf',
    currentOdometerKm: 45200,
    maintenanceIntervalKm: 5000,
    lastMaintenanceDate: '2026-06-01',
    nextMaintenanceDate: '2026-09-01',
    status: 'hoat_dong',
    notes: 'Xe trang bị bộ đàm ưu tiên, còi hú và thùng chứa thiết bị dò kim loại sâu Vallon VMC1.',
    inspectionHistory: [
      {
        id: 'insp-001-1',
        vehicleId: 'veh-001',
        roundNumber: 1,
        inspectionDate: '2022-04-20',
        expiryDate: '2024-04-20',
        certificateNo: 'KC-1029381/2022',
        providerUnit: 'Trung tâm Đăng kiểm Khí tài Quân sự 83',
        result: 'dat',
        costVnd: 450000,
        scanFileUrl: 'https://example.com/files/dk-dot1-80a.pdf',
        notes: 'Đăng kiểm lần đầu khi đưa xe vào sử dụng',
        createdAt: '2022-04-20T08:00:00Z'
      },
      {
        id: 'insp-001-2',
        vehicleId: 'veh-001',
        roundNumber: 2,
        inspectionDate: '2024-04-18',
        expiryDate: '2025-08-10',
        certificateNo: 'KC-5561029/2024',
        providerUnit: 'Trung tâm Đăng kiểm Khí tài Quân sự 83',
        result: 'dat',
        costVnd: 520000,
        scanFileUrl: 'https://example.com/files/dk-dot2-80a.pdf',
        notes: 'Kiểm định định kỳ 16 tháng',
        createdAt: '2024-04-18T09:30:00Z'
      },
      {
        id: 'insp-001-3',
        vehicleId: 'veh-001',
        roundNumber: 3,
        inspectionDate: '2025-08-10',
        expiryDate: '2026-08-10', // Expiration date: 2026-08-10 (approx 13 days away)
        certificateNo: 'KC-8912304/2025',
        providerUnit: 'Trung tâm Đăng kiểm Khí tài Quân sự 83',
        result: 'dat',
        costVnd: 550000,
        scanFileUrl: 'https://example.com/files/dk-dot3-80a.pdf',
        notes: 'Kiểm định định kỳ năm 2025',
        createdAt: '2025-08-10T10:15:00Z'
      }
    ],
    createdAt: '2022-04-15T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'veh-002',
    code: 'XE-CH-02',
    licensePlate: '80A-019.55',
    vehicleType: 'Xe chỉ huy 7 chỗ',
    brand: 'Toyota',
    model: 'Fortuner 2.8 4x4',
    manufactureYear: 2021,
    chassisNumber: 'TOY991827364511',
    engineNumber: '1GD-992182',
    color: 'Cát Ánh Kim',
    managingUnit: 'Ban Ban Chỉ huy Công trường Dự án Cao tốc',
    managerName: 'Trung tá Phạm Quốc Hùng',
    frequentDriverName: 'Trung sĩ Vũ Minh Tuấn',
    registrationNo: 'DK-80A-01955',
    registrationDate: '2021-08-10',
    registrationFileUrl: 'https://example.com/files/dk-80a-01955.pdf',
    currentInspectionCertNo: 'KC-7721094/2025',
    lastInspectionDate: '2025-09-20',
    nextInspectionExpiryDate: '2026-08-25', // Expiring in ~28 days (triggers 30-day alert)
    inspectionUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 29-03D',
    inspectionFileUrl: 'https://example.com/files/dang-kiem-80a-01955.pdf',
    insuranceExpiryDate: '2026-10-15',
    insuranceFileUrl: 'https://example.com/files/bao-hiem-80a-01955.pdf',
    currentOdometerKm: 68500,
    maintenanceIntervalKm: 5000,
    lastMaintenanceDate: '2026-05-10',
    nextMaintenanceDate: '2026-08-10',
    status: 'hoat_dong',
    notes: 'Phục vụ di chuyển khảo sát địa hình công trường và giao dịch làm việc với Chủ đầu tư.',
    inspectionHistory: [
      {
        id: 'insp-002-1',
        vehicleId: 'veh-002',
        roundNumber: 1,
        inspectionDate: '2021-08-15',
        expiryDate: '2023-08-15',
        certificateNo: 'KC-1092837/2021',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 29-03D',
        result: 'dat',
        costVnd: 420000,
        scanFileUrl: 'https://example.com/files/dk-dot1-01955.pdf',
        notes: 'Đăng kiểm lần đầu',
        createdAt: '2021-08-15T09:00:00Z'
      },
      {
        id: 'insp-002-2',
        vehicleId: 'veh-002',
        roundNumber: 2,
        inspectionDate: '2023-08-10',
        expiryDate: '2024-09-20',
        certificateNo: 'KC-4491028/2023',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 29-03D',
        result: 'dat',
        costVnd: 480000,
        scanFileUrl: 'https://example.com/files/dk-dot2-01955.pdf',
        notes: 'Đăng kiểm định kỳ 12 tháng',
        createdAt: '2023-08-10T10:00:00Z'
      },
      {
        id: 'insp-002-3',
        vehicleId: 'veh-002',
        roundNumber: 3,
        inspectionDate: '2025-09-20',
        expiryDate: '2026-08-25', // Expiring in ~28 days
        certificateNo: 'KC-7721094/2025',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 29-03D',
        result: 'dat',
        costVnd: 500000,
        scanFileUrl: 'https://example.com/files/dk-dot3-01955.pdf',
        notes: 'Đăng kiểm kiểm định an toàn kỹ thuật định kỳ',
        createdAt: '2025-09-20T14:20:00Z'
      }
    ],
    createdAt: '2021-08-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z'
  },
  {
    id: 'veh-003',
    code: 'XE-VT-03',
    licensePlate: '80C-088.12',
    vehicleType: 'Xe tải thùng kín chở thiết bị nổ',
    brand: 'Isuzu',
    model: 'FVR34Q 9 tấn',
    manufactureYear: 2020,
    chassisNumber: 'ISZ881726354091',
    engineNumber: '6HK1-882736',
    color: 'Xanh Lá Cây Khói',
    managingUnit: 'Đội Thi công Khai thác & Hủy nổ 3',
    managerName: 'Đại úy Nguyễn Tiến Đạt',
    frequentDriverName: 'Thượng sĩ Đỗ Văn Nam',
    registrationNo: 'DK-80C-08812',
    registrationDate: '2020-11-05',
    registrationFileUrl: 'https://example.com/files/dk-80c-08812.pdf',
    currentInspectionCertNo: 'KC-9901827/2025',
    lastInspectionDate: '2025-10-15',
    nextInspectionExpiryDate: '2026-10-15', // Expiring in ~79 days (triggers 90-day alert)
    inspectionUnit: 'Trung tâm Đăng kiểm Xe Cơ giới Quân sự 101',
    inspectionFileUrl: 'https://example.com/files/dang-kiem-80c-08812.pdf',
    insuranceExpiryDate: '2026-11-01',
    insuranceFileUrl: 'https://example.com/files/bao-hiem-80c-08812.pdf',
    currentOdometerKm: 112000,
    maintenanceIntervalKm: 10000,
    lastMaintenanceDate: '2026-04-20',
    nextMaintenanceDate: '2026-10-20',
    status: 'hoat_dong',
    notes: 'Xe vận tải nguy hiểm chuẩn QCVN 01:2019/BQP, có trang bị hệ thống chống giật & bình chữa cháy tự động.',
    inspectionHistory: [
      {
        id: 'insp-003-1',
        vehicleId: 'veh-003',
        roundNumber: 1,
        inspectionDate: '2020-11-10',
        expiryDate: '2022-11-10',
        certificateNo: 'KC-0012938/2020',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới Quân sự 101',
        result: 'dat',
        costVnd: 680000,
        scanFileUrl: 'https://example.com/files/dk-dot1-08812.pdf',
        notes: 'Đăng kiểm xe vận tải chuyên dùng nổ',
        createdAt: '2020-11-10T08:00:00Z'
      },
      {
        id: 'insp-003-2',
        vehicleId: 'veh-003',
        roundNumber: 2,
        inspectionDate: '2022-11-05',
        expiryDate: '2024-05-05',
        certificateNo: 'KC-3391029/2022',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới Quân sự 101',
        result: 'dat',
        costVnd: 720000,
        scanFileUrl: 'https://example.com/files/dk-dot2-08812.pdf',
        notes: 'Đăng kiểm định kỳ 18 tháng',
        createdAt: '2022-11-05T09:00:00Z'
      },
      {
        id: 'insp-003-3',
        vehicleId: 'veh-003',
        roundNumber: 3,
        inspectionDate: '2024-05-02',
        expiryDate: '2025-10-15',
        certificateNo: 'KC-6610293/2024',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới Quân sự 101',
        result: 'dat',
        costVnd: 750000,
        scanFileUrl: 'https://example.com/files/dk-dot3-08812.pdf',
        notes: 'Đăng kiểm định kỳ 16 tháng',
        createdAt: '2024-05-02T10:00:00Z'
      },
      {
        id: 'insp-003-4',
        vehicleId: 'veh-003',
        roundNumber: 4,
        inspectionDate: '2025-10-15',
        expiryDate: '2026-10-15', // Expiring in ~79 days
        certificateNo: 'KC-9901827/2025',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới Quân sự 101',
        result: 'dat',
        costVnd: 800000,
        scanFileUrl: 'https://example.com/files/dk-dot4-08812.pdf',
        notes: 'Đăng kiểm xe tải nặng chuyên dùng năm 2025',
        createdAt: '2025-10-15T11:00:00Z'
      }
    ],
    createdAt: '2020-11-05T00:00:00Z',
    updatedAt: '2026-04-20T00:00:00Z'
  },
  {
    id: 'veh-004',
    code: 'XE-BD-04',
    licensePlate: '80A-003.11',
    vehicleType: 'Xe cứu thương / Y tế công trường',
    brand: 'Mitsubishi',
    model: 'Pajero Sport 4x4',
    manufactureYear: 2019,
    chassisNumber: 'MIT11029384756',
    engineNumber: '4N15-092817',
    color: 'Trắng Sữa',
    managingUnit: 'Tổ Y Tế An Toàn Công Trường',
    managerName: 'Thiếu tá BS. Phạm Thanh Hằng',
    frequentDriverName: 'Trung úy Lái xe Nguyễn Văn Vinh',
    registrationNo: 'DK-80A-00311',
    registrationDate: '2019-06-20',
    registrationFileUrl: 'https://example.com/files/dk-80a-00311.pdf',
    currentInspectionCertNo: 'KC-5019283/2025',
    lastInspectionDate: '2025-07-20',
    nextInspectionExpiryDate: '2026-07-20', // OVERDUE by 8 days! (current date 2026-07-28)
    inspectionUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 33-01S',
    inspectionFileUrl: 'https://example.com/files/dang-kiem-80a-00311.pdf',
    insuranceExpiryDate: '2026-08-05', // Expiring in 8 days (triggers 15-day alert)
    insuranceFileUrl: 'https://example.com/files/bao-hiem-80a-00311.pdf',
    currentOdometerKm: 92400,
    maintenanceIntervalKm: 5000,
    lastMaintenanceDate: '2026-07-01',
    nextMaintenanceDate: '2026-10-01',
    status: 'bao_duong',
    notes: 'Đang bảo dưỡng hạ máy và làm thủ tục kiểm định lại. Đã quá hạn kiểm định 8 ngày.',
    inspectionHistory: [
      {
        id: 'insp-004-1',
        vehicleId: 'veh-004',
        roundNumber: 1,
        inspectionDate: '2019-06-25',
        expiryDate: '2021-06-25',
        certificateNo: 'KC-0091827/2019',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 33-01S',
        result: 'dat',
        costVnd: 400000,
        scanFileUrl: 'https://example.com/files/dk-dot1-00311.pdf',
        notes: 'Đăng kiểm lần đầu',
        createdAt: '2019-06-25T08:00:00Z'
      },
      {
        id: 'insp-004-2',
        vehicleId: 'veh-004',
        roundNumber: 2,
        inspectionDate: '2021-06-20',
        expiryDate: '2023-06-20',
        certificateNo: 'KC-2291029/2021',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 33-01S',
        result: 'dat',
        costVnd: 450000,
        scanFileUrl: 'https://example.com/files/dk-dot2-00311.pdf',
        notes: 'Đăng kiểm định kỳ',
        createdAt: '2021-06-20T09:00:00Z'
      },
      {
        id: 'insp-004-3',
        vehicleId: 'veh-004',
        roundNumber: 3,
        inspectionDate: '2023-06-18',
        expiryDate: '2024-06-18',
        certificateNo: 'KC-4481029/2023',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 33-01S',
        result: 'dat',
        costVnd: 480000,
        scanFileUrl: 'https://example.com/files/dk-dot3-00311.pdf',
        notes: 'Đăng kiểm định kỳ 12 tháng',
        createdAt: '2023-06-18T10:00:00Z'
      },
      {
        id: 'insp-004-4',
        vehicleId: 'veh-004',
        roundNumber: 4,
        inspectionDate: '2024-06-15',
        expiryDate: '2025-07-20',
        certificateNo: 'KC-5019283/2024',
        providerUnit: 'Trung tâm Đăng kiểm Xe Cơ giới 33-01S',
        result: 'dat',
        costVnd: 500000,
        scanFileUrl: 'https://example.com/files/dk-dot4-00311.pdf',
        notes: 'Đăng kiểm kiểm định an toàn kỹ thuật',
        createdAt: '2024-06-15T10:00:00Z'
      }
    ],
    createdAt: '2019-06-20T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z'
  }
];

export function getVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse vehicles from localStorage', err);
    return INITIAL_VEHICLES;
  }
}

export function saveVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
  } catch (err) {
    console.error('Failed to save vehicles to localStorage', err);
  }
}

export function saveVehicle(vehicle: Vehicle): Vehicle[] {
  const current = getVehicles();
  const index = current.findIndex(v => v.id === vehicle.id);
  let next: Vehicle[];
  const nowStr = new Date().toISOString();

  if (index >= 0) {
    next = [...current];
    next[index] = { ...vehicle, updatedAt: nowStr };
  } else {
    next = [{ ...vehicle, createdAt: nowStr, updatedAt: nowStr }, ...current];
  }
  saveVehicles(next);
  return next;
}

export function deleteVehicle(id: string): Vehicle[] {
  const current = getVehicles();
  const next = current.filter(v => v.id !== id);
  saveVehicles(next);
  return next;
}

/**
 * Thêm 1 đợt đăng kiểm mới cho xe ô tô (Không ghi đè dữ liệu cũ, lưu vào lịch sử inspectionHistory)
 * Đồng thời tự động cập nhật các trường đăng kiểm mới nhất trên hồ sơ xe
 */
export function addInspectionRecord(vehicleId: string, newRecord: Omit<VehicleInspectionRecord, 'id' | 'vehicleId' | 'roundNumber' | 'createdAt'>): Vehicle[] {
  const vehicles = getVehicles();
  const idx = vehicles.findIndex(v => v.id === vehicleId);
  if (idx < 0) return vehicles;

  const vehicle = vehicles[idx];
  const history = vehicle.inspectionHistory || [];
  const nextRoundNumber = history.length > 0 ? Math.max(...history.map(h => h.roundNumber)) + 1 : 1;

  const record: VehicleInspectionRecord = {
    ...newRecord,
    id: `insp-${vehicleId}-${Date.now()}`,
    vehicleId,
    roundNumber: nextRoundNumber,
    createdAt: new Date().toISOString()
  };

  const updatedHistory = [record, ...history];

  // Update vehicle's top-level latest inspection fields if passed or latest
  const updatedVehicle: Vehicle = {
    ...vehicle,
    inspectionHistory: updatedHistory,
    currentInspectionCertNo: record.certificateNo || vehicle.currentInspectionCertNo,
    lastInspectionDate: record.inspectionDate || vehicle.lastInspectionDate,
    nextInspectionExpiryDate: record.expiryDate || vehicle.nextInspectionExpiryDate,
    inspectionUnit: record.providerUnit || vehicle.inspectionUnit,
    inspectionFileUrl: record.scanFileUrl || vehicle.inspectionFileUrl,
    updatedAt: new Date().toISOString()
  };

  vehicles[idx] = updatedVehicle;
  saveVehicles(vehicles);
  return vehicles;
}

export function getVehicleAlertSettings(): VehicleAlertSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERT_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ALERT_SETTINGS, JSON.stringify(DEFAULT_ALERT_SETTINGS));
      return DEFAULT_ALERT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load alert settings', err);
    return DEFAULT_ALERT_SETTINGS;
  }
}

export function saveVehicleAlertSettings(settings: VehicleAlertSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALERT_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save alert settings', err);
  }
}

export function resetVehicleData(): Vehicle[] {
  localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(INITIAL_VEHICLES));
  localStorage.setItem(STORAGE_KEY_ALERT_SETTINGS, JSON.stringify(DEFAULT_ALERT_SETTINGS));
  return INITIAL_VEHICLES;
}

export interface VehicleAlertItem {
  vehicle: Vehicle;
  type: 'inspection_expiry' | 'insurance_expiry';
  daysLeft: number;
  expiryDate: string;
  matchedThreshold: number; // e.g., 7, 15, 30, 60, 90 or < 0 for overdue
  status: 'overdue' | 'critical' | 'warning' | 'notice';
}

/**
 * Helper to compute active alerts based on user-defined alert thresholds
 */
export function calculateVehicleAlerts(vehicles: Vehicle[], settings: VehicleAlertSettings): VehicleAlertItem[] {
  const alerts: VehicleAlertItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort thresholds descending e.g. [90, 60, 30, 15, 7]
  const sortedThresholds = [...(settings.thresholdDays || [90, 60, 30, 15, 7])].sort((a, b) => b - a);
  const maxThreshold = sortedThresholds[0] || 90;

  vehicles.forEach(veh => {
    // 1. Inspection Expiry Check
    if (veh.nextInspectionExpiryDate) {
      const expDate = new Date(veh.nextInspectionExpiryDate);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= maxThreshold) {
        // Find highest matching threshold
        let matched = sortedThresholds.find(t => diffDays <= t);
        if (matched === undefined) matched = maxThreshold;

        let status: 'overdue' | 'critical' | 'warning' | 'notice' = 'notice';
        if (diffDays < 0) status = 'overdue';
        else if (diffDays <= 7) status = 'critical';
        else if (diffDays <= 30) status = 'warning';

        alerts.push({
          vehicle: veh,
          type: 'inspection_expiry',
          daysLeft: diffDays,
          expiryDate: veh.nextInspectionExpiryDate,
          matchedThreshold: matched,
          status
        });
      }
    }
  });

  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
}
