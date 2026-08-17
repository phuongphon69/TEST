import { Project, Personnel, EquipmentItem, UXOEquipment, Vehicle, ArchiveDossier, WarehouseLocation } from '../types';
import { getProjects, getPersonnel, getEquipment } from './storage';
import { getVehicles } from './vehicleStorage';
import { getUXOEquipmentList } from './equipmentStorage';
import { getArchiveDossiers, getWarehouseLocations } from './archiveStorage';

// 1. Anti-duplicate checks
export function checkDuplicateVehiclePlate(plate: string, excludeId?: string): boolean {
  if (!plate) return false;
  const cleanPlate = plate.trim().toLowerCase().replace(/[\s.-]/g, '');
  const vehicles = getVehicles();
  return vehicles.some(v => v.id !== excludeId && v.licensePlate.toLowerCase().replace(/[\s.-]/g, '') === cleanPlate);
}

export function checkDuplicateEquipmentSerial(serialNumber: string, excludeId?: string): boolean {
  if (!serialNumber) return false;
  const cleanSerial = serialNumber.trim().toLowerCase();
  const eqList = getEquipment();
  const uxoEqList = getUXOEquipmentList();
  
  const inStandard = eqList.some(e => e.id !== excludeId && e.serialOrPlate?.toLowerCase() === cleanSerial);
  const inUXO = uxoEqList.some(e => e.id !== excludeId && e.serialNumber?.toLowerCase() === cleanSerial);
  return inStandard || inUXO;
}

export function checkDuplicateProjectCode(code: string, excludeId?: string): boolean {
  if (!code) return false;
  const cleanCode = code.trim().toLowerCase();
  const projects = getProjects();
  return projects.some(p => p.id !== excludeId && p.code.toLowerCase() === cleanCode);
}

export function checkDuplicateDocumentCode(code: string, excludeId?: string): boolean {
  if (!code) return false;
  const cleanCode = code.trim().toLowerCase();
  const dossiers = getArchiveDossiers();
  return dossiers.some(d => d.id !== excludeId && d.archiveCode.toLowerCase() === cleanCode);
}

// Helper masking functions to protect sensitive personnel data in warnings
export function maskCCCD(cccd?: string): string {
  if (!cccd || !cccd.trim()) return 'Chưa cập nhật';
  const clean = cccd.trim();
  if (clean.length <= 6) return clean.slice(0, 2) + '***' + clean.slice(-1);
  return clean.slice(0, 3) + '*'.repeat(clean.length - 6) + clean.slice(-3);
}

export function maskEmail(email?: string): string {
  if (!email || !email.trim()) return '';
  const clean = email.trim();
  const parts = clean.split('@');
  if (parts.length < 2) return clean;
  const name = parts[0];
  const maskedName = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '***' + name.slice(-1);
  return `${maskedName}@${parts[1]}`;
}

export function maskPhone(phone?: string): string {
  if (!phone || !phone.trim()) return '';
  const clean = phone.trim();
  if (clean.length <= 6) return clean;
  return clean.slice(0, 3) + '***' + clean.slice(-3);
}

export interface PersonnelDuplicateMatchDefinite {
  person: Personnel;
  field: 'identityCardNo' | 'email';
  matchedValue: string;
  message: string;
}

export interface PersonnelDuplicateMatchPotential {
  person: Personnel;
  reasons: string[];
  maskedCCCD: string;
  maskedEmail: string;
  maskedPhone: string;
}

export interface PersonnelDuplicateCheckResult {
  hasDefiniteDuplicate: boolean;
  hasPotentialDuplicate: boolean;
  definiteMatches: PersonnelDuplicateMatchDefinite[];
  potentialMatches: PersonnelDuplicateMatchPotential[];
}

/**
 * Service & repository level anti-duplicate checker for Personnel
 * Checks CCCD, Email, Phone, Full Name + DOB, Full Name + Rank/Unit
 */
export function checkPersonnelDuplicates(
  form: Partial<Personnel>,
  excludeId?: string
): PersonnelDuplicateCheckResult {
  // Always fetch fresh personnel list from repository/storage
  const currentList = getPersonnel().filter(p => p.dataStatus !== 'da_xoa' && p.id !== excludeId);

  const cleanFullName = (form.fullName || '').trim().toLowerCase();
  const cleanCCCD = (form.identityCardNo || '').trim().toLowerCase();
  const cleanEmail = (form.email || '').trim().toLowerCase();
  const cleanPhone = (form.phone || '').trim().replace(/[\s.-]/g, '');
  const cleanDob = (form.dob || '').trim();
  const cleanRankOrUnit = ((form.rankTitle || '') + ' ' + (form.unit || '') + ' ' + (form.position || '')).trim().toLowerCase();

  const definiteMatches: PersonnelDuplicateMatchDefinite[] = [];
  const potentialMatches: PersonnelDuplicateMatchPotential[] = [];

  currentList.forEach(existing => {
    const existingCCCD = (existing.identityCardNo || '').trim().toLowerCase();
    const existingEmail = (existing.email || '').trim().toLowerCase();
    const existingPhone = (existing.phone || '').trim().replace(/[\s.-]/g, '');
    const existingName = (existing.fullName || '').trim().toLowerCase();
    const existingDob = (existing.dob || '').trim();
    const existingRankOrUnit = ((existing.rankTitle || '') + ' ' + (existing.unit || '') + ' ' + (existing.position || '')).trim().toLowerCase();

    // 1. Definite duplicate: CCCD or Email match completely
    if (cleanCCCD && existingCCCD && cleanCCCD === existingCCCD) {
      definiteMatches.push({
        person: existing,
        field: 'identityCardNo',
        matchedValue: form.identityCardNo || '',
        message: `Trùng khớp số Căn cước công dân (${maskCCCD(existing.identityCardNo)}) với cán bộ "${existing.fullName}" (Mã: ${existing.code}).`
      });
    } else if (cleanEmail && existingEmail && cleanEmail === existingEmail) {
      definiteMatches.push({
        person: existing,
        field: 'email',
        matchedValue: form.email || '',
        message: `Trùng khớp địa chỉ Email (${maskEmail(existing.email)}) với cán bộ "${existing.fullName}" (Mã: ${existing.code}).`
      });
    }

    // 2. Potential duplicate: Full Name + DOB, Full Name + Phone, Full Name + Rank/Unit
    const reasons: string[] = [];
    if (cleanFullName && existingName && cleanFullName === existingName) {
      if (cleanDob && existingDob && cleanDob === existingDob) {
        reasons.push('Trùng khớp Họ tên và Ngày sinh');
      }
      if (cleanPhone && existingPhone && cleanPhone === existingPhone) {
        reasons.push('Trùng khớp Họ tên và Số điện thoại');
      }
      if (cleanRankOrUnit && existingRankOrUnit && (cleanRankOrUnit.includes(existingRankOrUnit) || existingRankOrUnit.includes(cleanRankOrUnit))) {
        reasons.push('Trùng khớp Họ tên và Cấp bậc / Đơn vị');
      }
      if (reasons.length === 0) {
        reasons.push('Trùng tên họ với bản ghi nhân sự hiện có');
      }
    }

    if (reasons.length > 0) {
      potentialMatches.push({
        person: existing,
        reasons,
        maskedCCCD: maskCCCD(existing.identityCardNo),
        maskedEmail: maskEmail(existing.email),
        maskedPhone: maskPhone(existing.phone)
      });
    }
  });

  return {
    hasDefiniteDuplicate: definiteMatches.length > 0,
    hasPotentialDuplicate: potentialMatches.length > 0,
    definiteMatches,
    potentialMatches
  };
}

// 2. Date validation rules
export function validateExpiryAfterIssueDate(issueDateStr?: string, expiryDateStr?: string): { isValid: boolean; error?: string } {
  if (!issueDateStr || !expiryDateStr) return { isValid: true };
  const issue = new Date(issueDateStr);
  const expiry = new Date(expiryDateStr);
  
  if (isNaN(issue.getTime()) || isNaN(expiry.getTime())) return { isValid: true };
  if (expiry < issue) {
    return {
      isValid: false,
      error: `Ngày hết hạn (${expiryDateStr}) không được nhỏ hơn ngày cấp (${issueDateStr}).`
    };
  }
  return { isValid: true };
}

export function validateCompletionAfterStartDate(startDateStr?: string, completionDateStr?: string): { isValid: boolean; error?: string } {
  if (!startDateStr || !completionDateStr) return { isValid: true };
  const start = new Date(startDateStr);
  const end = new Date(completionDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { isValid: true };
  if (end < start) {
    return {
      isValid: false,
      error: `Ngày hoàn thành (${completionDateStr}) không được nhỏ hơn ngày bắt đầu (${startDateStr}).`
    };
  }
  return { isValid: true };
}

// 3. Smart Warning Checkers
export function checkPersonnelExpiredCertificate(personnelId: string): { hasExpired: boolean; message?: string } {
  const personnelList = getPersonnel();
  const person = personnelList.find(p => p.id === personnelId);
  if (!person) return { hasExpired: false };

  const today = new Date();
  const expiredCerts = person.certificates?.filter(c => {
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate);
    return exp < today;
  }) || [];

  if (expiredCerts.length > 0) {
    return {
      hasExpired: true,
      message: `CẢNH BÁO: Nhân sự ${person.rankTitle || ''} ${person.fullName} có ${expiredCerts.length} chứng chỉ đã HẾT HẠN (${expiredCerts.map(c => c.name).join(', ')}). Không nên bố trí vào dự án!`
    };
  }
  return { hasExpired: false };
}

export function checkEquipmentExpiredInspection(serialNumberOrId: string): { hasExpired: boolean; message?: string } {
  const uxoEq = getUXOEquipmentList().find(e => e.id === serialNumberOrId || e.serialNumber === serialNumberOrId);
  const standardEq = getEquipment().find(e => e.id === serialNumberOrId || e.serialOrPlate === serialNumberOrId);
  
  if (uxoEq) {
    const lastCal = uxoEq.calibrationHistory?.[0];
    const expiry = lastCal?.expiryDate;
    if (expiry) {
      const today = new Date();
      if (new Date(expiry) < today) {
        return {
          hasExpired: true,
          message: `CẢNH BÁO: Thiết bị RPBM "${uxoEq.name}" (Serial: ${uxoEq.serialNumber}) đã HẾT HẠN KIỂM ĐỊNH ngày ${expiry}. Không được phân công nhiệm vụ!`
        };
      }
    }
  }

  if (standardEq && standardEq.nextCalibrationDate) {
    const today = new Date();
    if (new Date(standardEq.nextCalibrationDate) < today) {
      return {
        hasExpired: true,
        message: `CẢNH BÁO: Thiết bị "${standardEq.name}" (Mã: ${standardEq.code}) đã HẾT HẠN HIỆU CHUẨN ngày ${standardEq.nextCalibrationDate}!`
      };
    }
  }

  return { hasExpired: false };
}

export function checkVehicleExpiredRegistration(vehicleId: string): { hasExpired: boolean; message?: string } {
  const vehicles = getVehicles();
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) return { hasExpired: false };

  const today = new Date();
  if (vehicle.nextInspectionExpiryDate) {
    const exp = new Date(vehicle.nextInspectionExpiryDate);
    if (exp < today) {
      return {
        hasExpired: true,
        message: `CẢNH BÁO: Xe ${vehicle.licensePlate} (${vehicle.brand} ${vehicle.model}) đã HẾT ĐĂNG KIỂM ngày ${vehicle.nextInspectionExpiryDate}. Không được phân công nhiệm vụ!`
      };
    }
  }
  return { hasExpired: false };
}

export function checkWarehouseLocationFull(locationId: string): { isFull: boolean; message?: string } {
  const locations = getWarehouseLocations();
  const loc = locations.find(l => l.id === locationId || l.locationCode === locationId);
  if (!locationId || !loc) return { isFull: false };

  const currentCount = loc.currentBoxCount || 0;
  const maxCap = loc.maxCapacityBoxes || 10;

  if (currentCount >= maxCap || loc.status === 'day') {
    return {
      isFull: true,
      message: `CẢNH BÁO: Vị trí lưu trữ "${loc.locationCode}" (${loc.warehouseName}) đã ĐẦY SỨC CHỨA (${currentCount}/${maxCap} hộp). Vui lòng chọn vị trí khác!`
    };
  }
  return { isFull: false };
}

export function checkProjectChecklistIncomplete(project: Project): { isIncomplete: boolean; message?: string } {
  if (project.status !== 'da_ban_giao' && project.status !== 'dang_hoan_thien_ho_so' && project.status !== 'dang_thanh_quyet_toan') {
    return { isIncomplete: false };
  }

  // Check project dossiers checklist
  if (project.dossiers && project.dossiers.length > 0) {
    const incomplete = project.dossiers.filter(d => d.status !== 'da_ky' && d.status !== 'da_hoan_thien');
    if (incomplete.length > 0) {
      return {
        isIncomplete: true,
        message: `CẢNH BÁO: Dự án "${project.code}" đã nghiệm thu/bàn giao nhưng còn ${incomplete.length} danh mục hồ sơ chưa hoàn thiện/ký duyệt (${incomplete.map(i => i.category).join(', ')}).`
      };
    }
  }
  return { isIncomplete: false };
}

// 4. Automatic Calculations
export function calculateDaysRemaining(targetDateStr?: string): number {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  const now = new Date();
  if (isNaN(target.getTime())) return 0;
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateDaysOverdue(targetDateStr?: string): number {
  const remaining = calculateDaysRemaining(targetDateStr);
  return remaining < 0 ? Math.abs(remaining) : 0;
}

export function calculateDisbursementPercentage(disbursedAmount: number, totalInvestment: number): number {
  if (!totalInvestment || totalInvestment <= 0) return 0;
  const percentage = (disbursedAmount / totalInvestment) * 100;
  return Math.min(100, Math.round(percentage * 10) / 10);
}

export function calculateContractRemainingValue(totalContractValue: number, totalPaidAmount: number): number {
  if (!totalContractValue) return 0;
  const remaining = totalContractValue - (totalPaidAmount || 0);
  return Math.max(0, remaining);
}

export function calculateProjectProgressPercentage(project: Project): number {
  if (project.progressPercent !== undefined) return project.progressPercent;
  if (project.status === 'da_ban_giao' || project.status === 'dang_thanh_quyet_toan') return 100;
  if (project.status === 'chuan_bi_trien_khai' || project.status === 'chuan_bi_dau_tu') return 15;
  if (project.status === 'dang_thi_cong') return 60;
  return 0;
}
